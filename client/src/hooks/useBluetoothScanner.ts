import { useEffect, useRef, useState } from "react";

interface BluetoothScannerOptions {
  enabled: boolean;
  onScan: (barcode: string) => void;
  minLength?: number;
  maxLength?: number;
  timeout?: number; // ms between characters before considering input complete
  validatePattern?: RegExp;
}

/**
 * Hook to detect and process Bluetooth barcode scanner input (keyboard wedge mode)
 *
 * Most Bluetooth scanners work as "keyboard wedges" - they pair as Bluetooth keyboards
 * and type the barcode followed by Enter. This hook detects that pattern.
 *
 * @example
 * const { isListening, lastScan } = useBluetoothScanner({
 *   enabled: true,
 *   onScan: (barcode) => console.log("Scanned:", barcode),
 *   validatePattern: /^\d{10,13}$/ // ISBN
 * });
 */
export function useBluetoothScanner(options: BluetoothScannerOptions) {
  const {
    enabled,
    onScan,
    minLength = 10,
    maxLength = 13,
    timeout = 100,
    validatePattern,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const bufferRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setIsListening(false);
      return;
    }

    setIsListening(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      const timeSinceLastInput = now - lastInputTimeRef.current;

      // Detect if this is likely scanner input (rapid typing)
      const isRapidInput = timeSinceLastInput < 50; // Scanner types very fast
      const isScannerKey = /^[a-zA-Z0-9]$/.test(event.key) || event.key === "Enter";

      if (!isScannerKey) {
        // Not a scanner character, reset
        bufferRef.current = "";
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      // If user is typing in an input field, ignore
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInputField && !isRapidInput) {
        // Allow normal typing in input fields
        return;
      }

      // Handle Enter key (scanner sends this at the end)
      if (event.key === "Enter") {
        event.preventDefault();

        const barcode = bufferRef.current.trim();
        bufferRef.current = "";

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Validate length
        if (barcode.length < minLength || barcode.length > maxLength) {
          console.log("[Bluetooth Scanner] Invalid length:", barcode.length);
          return;
        }

        // Validate pattern if provided
        if (validatePattern && !validatePattern.test(barcode)) {
          console.log("[Bluetooth Scanner] Pattern validation failed:", barcode);
          return;
        }

        console.log("[Bluetooth Scanner] Valid barcode scanned:", barcode);
        setLastScan(barcode);
        onScan(barcode);
        return;
      }

      // Accumulate character
      if (isRapidInput || bufferRef.current.length === 0) {
        // Prevent default for scanner input (don't type into page)
        if (isRapidInput && !isInputField) {
          event.preventDefault();
        }

        bufferRef.current += event.key;
        lastInputTimeRef.current = now;

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set timeout to process buffer if Enter doesn't come
        timeoutRef.current = setTimeout(() => {
          const barcode = bufferRef.current.trim();
          bufferRef.current = "";

          if (barcode.length >= minLength && barcode.length <= maxLength) {
            if (!validatePattern || validatePattern.test(barcode)) {
              console.log("[Bluetooth Scanner] Barcode from timeout:", barcode);
              setLastScan(barcode);
              onScan(barcode);
            }
          }
        }, timeout);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, onScan, minLength, maxLength, timeout, validatePattern]);

  return {
    isListening,
    lastScan,
  };
}
