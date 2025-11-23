import { BrandText } from "./icons";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
        <BrandText className="text-lg" />
      </div>
    </header>
  );
}
