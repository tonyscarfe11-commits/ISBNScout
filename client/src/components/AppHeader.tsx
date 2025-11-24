import { BrandText } from "./icons";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
        <BrandText className="text-lg text-white" />
      </div>
    </header>
  );
}
