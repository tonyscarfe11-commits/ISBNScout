import { useState, useEffect, useRef } from "react";

interface BluetoothScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minLength?: number;
  maxLength?: number;
  timeout?: number;
}

export function useBluetoothScanner({
  onScan,
  enabled = false,
  minLength = 10,
  maxLength = 14,
  timeout = 100,
}: BluetoothScannerOptions) {
  const [isListening, setIsListening] = useState(false);
  const bufferRef = useRef("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeyTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) {
      setIsListening(false);
      return;
    }

    const processBuffer = () => {
      const barcode = bufferRef.current.trim();
      bufferRef.current = "";
      
      if (barcode.length >= minLength && barcode.length <= maxLength) {
        const isValidIsbn = /^[0-9X]+$/i.test(barcode);
        if (isValidIsbn) {
          console.log("[BluetoothScanner] Valid barcode detected:", barcode);
          onScanRef.current(barcode);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (e.key === "Enter") {
        e.preventDefault();
        processBuffer();
        return;
      }

      if (timeSinceLastKey > 500 && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      if (e.key.length === 1 && /[0-9Xx]/.test(e.key)) {
        bufferRef.current += e.key.toUpperCase();
        
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length >= minLength) {
            processBuffer();
          } else {
            bufferRef.current = "";
          }
        }, timeout);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    setIsListening(true);
    console.log("[BluetoothScanner] Listening for scanner input...");

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsListening(false);
    };
  }, [enabled, timeout, minLength, maxLength]);

  return { isListening };
}
