#!/usr/bin/env tsx
/**
 * Trial Reminder Email Script
 *
 * Sends reminder emails to users whose trials are expiring soon.
 * This script should be run daily via a cron job.
 *
 * Setup cron job (runs daily at 9 AM):
 * 0 9 * * * cd /path/to/project && tsx scripts/send-trial-reminders.ts >> logs/trial-reminders.log 2>&1
 *
 * Or use a service like:
 * - Render Cron Jobs: https://render.com/docs/cronjobs
 * - Railway Cron: https://docs.railway.app/deploy/cron-jobs
 * - GitHub Actions (scheduled workflows)
 */

import 'dotenv/config';
import { storage } from '../server/storage';
import { emailService } from '../server/email-service';

interface TrialReminderConfig {
  daysBeforeExpiry: number; // Send reminder this many days before expiry
  reminderType: 'expiring' | 'expired';
}

// Configuration for different reminder emails
const REMINDER_CONFIGS: TrialReminderConfig[] = [
  { daysBeforeExpiry: 3, reminderType: 'expiring' },  // 3 days before expiry
  { daysBeforeExpiry: 1, reminderType: 'expiring' },  // 1 day before expiry
  { daysBeforeExpiry: 0, reminderType: 'expired' },   // On expiry day
];

async function sendTrialReminders() {
  console.log('[Trial Reminders] Starting trial reminder check...');

  try {
    const now = new Date();
    let totalSent = 0;

    for (const config of REMINDER_CONFIGS) {
      // Calculate the target date for this reminder
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + config.daysBeforeExpiry);

      // Get the start and end of the target day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`[Trial Reminders] Checking for trials expiring on ${targetDate.toDateString()}...`);

      // Get users whose trials expire on the target date
      const users = await storage.getUsersWithTrialExpiringBetween(startOfDay, endOfDay);

      console.log(`[Trial Reminders] Found ${users.length} users with trials expiring in ${config.daysBeforeExpiry} days`);

      // Send emails
      for (const user of users) {
        try {
          if (config.reminderType === 'expiring' && user.trialEndsAt) {
            const daysRemaining = Math.ceil(
              (user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            await emailService.sendTrialExpiringEmail({
              username: user.username,
              email: user.email,
              daysRemaining: Math.max(0, daysRemaining),
              trialEndsAt: user.trialEndsAt,
            });

            console.log(`[Trial Reminders] Sent expiring reminder to ${user.email} (${daysRemaining} days remaining)`);
            totalSent++;
          } else if (config.reminderType === 'expired') {
            await emailService.sendTrialExpiredEmail({
              username: user.username,
              email: user.email,
            });

            console.log(`[Trial Reminders] Sent expired notification to ${user.email}`);
            totalSent++;
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`[Trial Reminders] Failed to send reminder to ${user.email}:`, error);
        }
      }
    }

    console.log(`[Trial Reminders] Completed. Sent ${totalSent} reminder emails.`);
    process.exit(0);
  } catch (error) {
    console.error('[Trial Reminders] Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
sendTrialReminders();
