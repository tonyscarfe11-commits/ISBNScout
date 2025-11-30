import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { 
  affiliates, 
  referralClicks, 
  commissions, 
  users,
  type Affiliate,
  type Commission,
  type ReferralClick
} from "@shared/schema";
import bcrypt from "bcrypt";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for affiliate service");
  }
  const sqlConnection = neon(process.env.DATABASE_URL);
  return drizzle(sqlConnection);
}

export class AffiliateService {
  private static generateReferralCode(name: string): string {
    const baseName = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `${baseName}${randomNum}`;
  }

  static async createAffiliate(data: {
    name: string;
    email: string;
    password: string;
    website?: string;
    socialMedia?: string;
    audience?: string;
  }): Promise<Affiliate> {
    const db = getDb();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    let referralCode = this.generateReferralCode(data.name);
    
    let codeExists = await db.select().from(affiliates).where(eq(affiliates.referralCode, referralCode)).limit(1);
    while (codeExists.length > 0) {
      referralCode = this.generateReferralCode(data.name);
      codeExists = await db.select().from(affiliates).where(eq(affiliates.referralCode, referralCode)).limit(1);
    }

    const [affiliate] = await db.insert(affiliates).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      referralCode,
      website: data.website || null,
      socialMedia: data.socialMedia || null,
      audience: data.audience || null,
      commissionRate: "25",
      status: "pending",
    }).returning();

    return affiliate;
  }

  static async authenticateAffiliate(email: string, password: string): Promise<{ affiliate: Affiliate } | { error: string; affiliate: Affiliate } | null> {
    const db = getDb();
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.email, email)).limit(1);
    
    if (!affiliate) {
      return null;
    }

    const isValid = await bcrypt.compare(password, affiliate.password);
    if (!isValid) {
      return null;
    }

    if (affiliate.status !== "approved") {
      return { error: "pending", affiliate };
    }

    return { affiliate };
  }

  static async getAffiliateById(id: string): Promise<Affiliate | undefined> {
    const db = getDb();
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id)).limit(1);
    return affiliate;
  }

  static async getAffiliateByReferralCode(code: string): Promise<Affiliate | undefined> {
    const db = getDb();
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.referralCode, code.toUpperCase())).limit(1);
    return affiliate;
  }

  static async trackReferralClick(affiliateId: string, data: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    landingPage?: string;
  }): Promise<ReferralClick> {
    const db = getDb();
    const [click] = await db.insert(referralClicks).values({
      affiliateId,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      referrer: data.referrer || null,
      landingPage: data.landingPage || null,
    }).returning();

    await db.update(affiliates)
      .set({ 
        totalClicks: sql`CAST(CAST(${affiliates.totalClicks} AS INTEGER) + 1 AS TEXT)`,
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, affiliateId));

    return click;
  }

  static async getAffiliateStats(affiliateId: string) {
    const db = getDb();
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);
    if (!affiliate) return null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClicks = await db.select()
      .from(referralClicks)
      .where(and(
        eq(referralClicks.affiliateId, affiliateId),
        gte(referralClicks.clickedAt, thirtyDaysAgo)
      ))
      .orderBy(desc(referralClicks.clickedAt));

    const allCommissions = await db.select()
      .from(commissions)
      .where(eq(commissions.affiliateId, affiliateId))
      .orderBy(desc(commissions.createdAt));

    const pendingCommissions = allCommissions.filter((c: Commission) => c.status === "pending" || c.status === "approved");
    const paidCommissions = allCommissions.filter((c: Commission) => c.status === "paid");

    const clicksByDay = recentClicks.reduce((acc: Record<string, number>, click: ReferralClick) => {
      const day = click.clickedAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode,
        commissionRate: affiliate.commissionRate,
        status: affiliate.status,
      },
      stats: {
        totalClicks: parseInt(affiliate.totalClicks || "0"),
        totalConversions: parseInt(affiliate.totalConversions || "0"),
        totalEarnings: parseFloat(affiliate.totalEarnings || "0"),
        pendingPayout: parseFloat(affiliate.pendingPayout || "0"),
        conversionRate: parseInt(affiliate.totalClicks || "0") > 0
          ? (parseInt(affiliate.totalConversions || "0") / parseInt(affiliate.totalClicks || "0") * 100).toFixed(2)
          : "0.00",
      },
      recentClicks: clicksByDay,
      commissions: {
        pending: pendingCommissions.reduce((sum: number, c: Commission) => sum + parseFloat(c.commissionAmount), 0),
        paid: paidCommissions.reduce((sum: number, c: Commission) => sum + parseFloat(c.commissionAmount), 0),
        history: allCommissions.slice(0, 20),
      },
    };
  }

  static async createCommission(data: {
    affiliateId: string;
    userId: string;
    subscriptionTier: string;
    subscriptionAmount: number;
  }): Promise<Commission | null> {
    const db = getDb();
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, data.affiliateId)).limit(1);
    if (!affiliate || affiliate.status !== "approved") {
      return null;
    }

    const commissionRate = parseFloat(affiliate.commissionRate);
    const commissionAmount = (data.subscriptionAmount * commissionRate / 100).toFixed(2);

    const [commission] = await db.insert(commissions).values({
      affiliateId: data.affiliateId,
      userId: data.userId,
      subscriptionTier: data.subscriptionTier,
      subscriptionAmount: data.subscriptionAmount.toFixed(2),
      commissionRate: affiliate.commissionRate,
      commissionAmount,
      status: "pending",
    }).returning();

    await db.update(affiliates)
      .set({
        totalConversions: sql`CAST(CAST(${affiliates.totalConversions} AS INTEGER) + 1 AS TEXT)`,
        totalEarnings: sql`${affiliates.totalEarnings} + ${parseFloat(commissionAmount)}`,
        pendingPayout: sql`${affiliates.pendingPayout} + ${parseFloat(commissionAmount)}`,
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, data.affiliateId));

    return commission;
  }

  static async approveAffiliate(affiliateId: string): Promise<Affiliate | undefined> {
    const db = getDb();
    const [affiliate] = await db.update(affiliates)
      .set({ 
        status: "approved",
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, affiliateId))
      .returning();
    return affiliate;
  }

  static async rejectAffiliate(affiliateId: string): Promise<Affiliate | undefined> {
    const db = getDb();
    const [affiliate] = await db.update(affiliates)
      .set({ 
        status: "rejected",
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, affiliateId))
      .returning();
    return affiliate;
  }

  static async markCommissionPaid(commissionId: string, paypalTransactionId?: string): Promise<Commission | null> {
    const db = getDb();
    const [commission] = await db.select().from(commissions).where(eq(commissions.id, commissionId)).limit(1);
    if (!commission) return null;

    const [updatedCommission] = await db.update(commissions)
      .set({
        status: "paid",
        paidAt: new Date(),
        paypalTransactionId: paypalTransactionId || null,
      })
      .where(eq(commissions.id, commissionId))
      .returning();

    await db.update(affiliates)
      .set({
        pendingPayout: sql`${affiliates.pendingPayout} - ${parseFloat(commission.commissionAmount)}`,
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, commission.affiliateId));

    return updatedCommission;
  }

  static async getAllAffiliates(): Promise<Affiliate[]> {
    const db = getDb();
    return db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  }

  static async getPendingCommissions(): Promise<Commission[]> {
    const db = getDb();
    return db.select()
      .from(commissions)
      .where(eq(commissions.status, "pending"))
      .orderBy(desc(commissions.createdAt));
  }

  static async linkUserToAffiliate(userId: string, affiliateId: string): Promise<void> {
    const db = getDb();
    await db.update(users)
      .set({ referredByAffiliateId: affiliateId })
      .where(eq(users.id, userId));
  }
}
