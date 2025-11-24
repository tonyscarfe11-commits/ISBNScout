import React from "react";

interface BrandIconProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const variantMap = {
  default: "text-teal-600 dark:text-teal-400",
  light: "text-white",
  dark: "text-slate-900 dark:text-white",
};

/**
 * ISBNScout Brand Icon Component
 * Displays the app logo/icon with customizable size and variant
 * Uses the transparent icon for clean display on any background
 */
export const BrandIcon: React.FC<BrandIconProps> = ({
  className = "",
  size = "md",
  variant = "default",
}) => {
  const sizeClass = sizeMap[size];
  const variantClass = variantMap[variant];

  return (
    <img
      src="/isbnscout-icon-transparent.png"
      alt="ISBNScout"
      className={`${sizeClass} ${className} object-contain`}
    />
  );
};

/**
 * ISBNScout Brand Logo Component
 * Displays the full logo for landing pages and marketing
 */
export const BrandLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <img
      src="/isbnscout-logo.png"
      alt="ISBNScout Logo"
      className={`${className} object-contain`}
    />
  );
};

/**
 * Inline Brand Text + Icon
 * Used for headers and navigation
 */
export const BrandText: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BrandIcon size="lg" />
      <span className="font-bold text-lg tracking-wide">ISBNScout</span>
    </div>
  );
};
