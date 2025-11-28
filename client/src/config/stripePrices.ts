export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: "price_1SY4bKD6k5MLViEzrUsmNn0e",
  PRO_YEARLY: "price_1SY4wwD6k5MLViEzBmoUodqi",
  ELITE_MONTHLY: "price_1SY4fsD6k5MLViEzeUU4RMpw",
  ELITE_YEARLY: "price_1SY4vXD6k5MLViEzXsCpzcQB",
} as const;

export type PlanKey = keyof typeof STRIPE_PRICE_IDS;
