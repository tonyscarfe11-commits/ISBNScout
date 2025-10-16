import { ScannerInterface } from "../ScannerInterface";

export default function ScannerInterfaceExample() {
  return (
    <div className="p-4 max-w-2xl">
      <ScannerInterface
        onIsbnScan={(isbn) => console.log("ISBN scanned:", isbn)}
        onCoverScan={(imageData) => console.log("Cover scanned:", imageData)}
      />
    </div>
  );
}
