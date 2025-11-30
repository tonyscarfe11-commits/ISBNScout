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
  let service: string;

  if (weightKg <= 0.1) {
    cost = 0.85;
    service = '2nd Class Large Letter';
  } else if (weightKg <= 0.25) {
    cost = 1.55;
    service = '2nd Class Large Letter';
  } else if (weightKg <= 0.5) {
    cost = 2.15;
    service = '2nd Class Large Letter';
  } else if (weightKg <= 0.75) {
    cost = 2.70;
    service = '2nd Class Large Letter';
  } else if (weightKg <= 1.0) {
    cost = 3.35;
    service = '2nd Class Small Parcel';
  } else if (weightKg <= 2.0) {
    cost = 3.85;
    service = '2nd Class Small Parcel';
  } else if (weightKg <= 5.0) {
    cost = 5.99;
    service = '2nd Class Medium Parcel';
  } else if (weightKg <= 10.0) {
    cost = 9.99;
    service = '2nd Class Medium Parcel';
  } else {
    cost = 15.99;
    service = '2nd Class Large Parcel';
  }

  return {
    carrier: 'Royal Mail',
    service,
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
  let service: string;

  if (weightKg <= 0.1) {
    cost = 1.35;
    service = '1st Class Large Letter';
  } else if (weightKg <= 0.25) {
    cost = 1.95;
    service = '1st Class Large Letter';
  } else if (weightKg <= 0.5) {
    cost = 2.65;
    service = '1st Class Large Letter';
  } else if (weightKg <= 0.75) {
    cost = 3.30;
    service = '1st Class Large Letter';
  } else if (weightKg <= 1.0) {
    cost = 4.45;
    service = '1st Class Small Parcel';
  } else if (weightKg <= 2.0) {
    cost = 5.25;
    service = '1st Class Small Parcel';
  } else if (weightKg <= 5.0) {
    cost = 7.99;
    service = '1st Class Medium Parcel';
  } else if (weightKg <= 10.0) {
    cost = 12.99;
    service = '1st Class Medium Parcel';
  } else {
    cost = 19.99;
    service = '1st Class Large Parcel';
  }

  return {
    carrier: 'Royal Mail',
    service,
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
    service: base.service.replace('2nd Class', 'Signed For'),
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
