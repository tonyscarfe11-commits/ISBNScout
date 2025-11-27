/**
 * UK Shipping Cost Calculator
 * Royal Mail and Evri pricing for book shipments
 *
 * Rates accurate as of 2025
 */

export type ShippingCarrier = 'royal-mail-2nd' | 'royal-mail-1st' | 'royal-mail-signed' | 'evri';

export interface ShippingRate {
  carrier: string;
  service: string;
  cost: number;
  maxWeight: number;
  estimatedDays: string;
  tracked: boolean;
}

/**
 * Royal Mail 2nd Class - Most economical for books
 * https://www.royalmail.com/price-finder
 */
function calculateRoyalMail2ndClass(weightKg: number): ShippingRate {
  let cost: number;

  if (weightKg <= 0.1) {
    cost = 0.85; // Large Letter up to 100g
  } else if (weightKg <= 0.25) {
    cost = 1.55; // Large Letter up to 250g
  } else if (weightKg <= 0.5) {
    cost = 2.15; // Large Letter up to 500g
  } else if (weightKg <= 0.75) {
    cost = 2.70; // Large Letter up to 750g
  } else if (weightKg <= 1.0) {
    cost = 3.35; // Small Parcel up to 1kg
  } else if (weightKg <= 2.0) {
    cost = 3.85; // Small Parcel up to 2kg
  } else if (weightKg <= 5.0) {
    cost = 5.99; // Medium Parcel up to 5kg
  } else if (weightKg <= 10.0) {
    cost = 9.99; // Medium Parcel up to 10kg
  } else {
    cost = 15.99; // Large Parcel
  }

  return {
    carrier: 'Royal Mail',
    service: '2nd Class',
    cost,
    maxWeight: weightKg,
    estimatedDays: '2-3 working days',
    tracked: false,
  };
}

/**
 * Royal Mail 1st Class - Faster delivery
 */
function calculateRoyalMail1stClass(weightKg: number): ShippingRate {
  let cost: number;

  if (weightKg <= 0.1) {
    cost = 1.35; // Large Letter up to 100g
  } else if (weightKg <= 0.25) {
    cost = 1.95; // Large Letter up to 250g
  } else if (weightKg <= 0.5) {
    cost = 2.65; // Large Letter up to 500g
  } else if (weightKg <= 0.75) {
    cost = 3.30; // Large Letter up to 750g
  } else if (weightKg <= 1.0) {
    cost = 4.45; // Small Parcel up to 1kg
  } else if (weightKg <= 2.0) {
    cost = 5.25; // Small Parcel up to 2kg
  } else if (weightKg <= 5.0) {
    cost = 7.99; // Medium Parcel up to 5kg
  } else if (weightKg <= 10.0) {
    cost = 12.99; // Medium Parcel up to 10kg
  } else {
    cost = 19.99; // Large Parcel
  }

  return {
    carrier: 'Royal Mail',
    service: '1st Class',
    cost,
    maxWeight: weightKg,
    estimatedDays: '1-2 working days',
    tracked: false,
  };
}

/**
 * Royal Mail Signed For 2nd Class - With tracking
 */
function calculateRoyalMailSigned(weightKg: number): ShippingRate {
  const base = calculateRoyalMail2ndClass(weightKg);

  return {
    ...base,
    service: 'Signed For 2nd Class',
    cost: base.cost + 2.10, // Add £2.10 for signature
    tracked: true,
    estimatedDays: '2-3 working days',
  };
}

/**
 * Evri (formerly Hermes) - Budget courier option
 * https://www.evri.com/send
 */
function calculateEvri(weightKg: number): ShippingRate {
  let cost: number;

  // Evri pricing is typically cheaper but less reliable
  if (weightKg <= 1.0) {
    cost = 2.95; // Up to 1kg
  } else if (weightKg <= 2.0) {
    cost = 3.20; // Up to 2kg
  } else if (weightKg <= 5.0) {
    cost = 4.50; // Up to 5kg
  } else if (weightKg <= 10.0) {
    cost = 6.99; // Up to 10kg
  } else if (weightKg <= 15.0) {
    cost = 9.99; // Up to 15kg
  } else {
    cost = 14.99; // Up to 20kg
  }

  return {
    carrier: 'Evri',
    service: 'Standard',
    cost,
    maxWeight: weightKg,
    estimatedDays: '3-5 working days',
    tracked: true, // Evri includes basic tracking
  };
}

/**
 * Calculate shipping cost for a given carrier and weight
 */
export function calculateShippingCost(
  weightKg: number,
  carrier: ShippingCarrier = 'royal-mail-2nd'
): ShippingRate {
  switch (carrier) {
    case 'royal-mail-2nd':
      return calculateRoyalMail2ndClass(weightKg);
    case 'royal-mail-1st':
      return calculateRoyalMail1stClass(weightKg);
    case 'royal-mail-signed':
      return calculateRoyalMailSigned(weightKg);
    case 'evri':
      return calculateEvri(weightKg);
    default:
      return calculateRoyalMail2ndClass(weightKg);
  }
}

/**
 * Get all shipping options for a given weight, sorted by cost
 */
export function getAllShippingOptions(weightKg: number): ShippingRate[] {
  const carriers: ShippingCarrier[] = [
    'royal-mail-2nd',
    'royal-mail-1st',
    'royal-mail-signed',
    'evri',
  ];

  return carriers
    .map(carrier => calculateShippingCost(weightKg, carrier))
    .sort((a, b) => a.cost - b.cost); // Sort by cheapest first
}

/**
 * Get the cheapest shipping option
 */
export function getCheapestShipping(weightKg: number): ShippingRate {
  const options = getAllShippingOptions(weightKg);
  return options[0]; // Already sorted by cost
}

/**
 * Get recommended shipping based on value and weight
 * Higher value items should use tracked shipping
 */
export function getRecommendedShipping(
  weightKg: number,
  itemValue: number
): ShippingRate {
  // For items over £20, recommend tracked shipping
  if (itemValue > 20) {
    // Choose between Evri (cheaper) or Royal Mail Signed (more reliable)
    const evri = calculateEvri(weightKg);
    const signed = calculateRoyalMailSigned(weightKg);

    // If Evri is significantly cheaper (>£1), use it, otherwise use Royal Mail
    return (signed.cost - evri.cost > 1.00) ? evri : signed;
  }

  // For cheaper items, use economical shipping
  const rmSecond = calculateRoyalMail2ndClass(weightKg);
  const evri = calculateEvri(weightKg);

  // Choose cheapest option
  return rmSecond.cost <= evri.cost ? rmSecond : evri;
}
