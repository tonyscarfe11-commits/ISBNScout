import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  BookOpen, 
  PoundSterling, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  X
} from "lucide-react";

interface WelcomeGuideProps {
  onDismiss: () => void;
  onStartScanning: () => void;
}

export function WelcomeGuide({ onDismiss, onStartScanning }: WelcomeGuideProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Camera,
      title: "Scan Any Book",
      description: "Point your camera at a barcode, book cover, or spine. Our AI recognises books instantly.",
      tip: "Works offline too!"
    },
    {
      icon: PoundSterling,
      title: "See Profit Instantly",
      description: "Get real-time prices from Amazon and eBay. Know your profit before you buy.",
      tip: "UK prices in £"
    },
    {
      icon: BookOpen,
      title: "Build Your Inventory",
      description: "Track all your finds in one place. List directly to Amazon or eBay when ready.",
      tip: "No more spreadsheets!"
    }
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/30 dark:to-background border-teal-200 dark:border-teal-800 animate-scale-in relative overflow-hidden">
      <button 
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
        data-testid="button-dismiss-welcome"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-teal-500/10">
          <Sparkles className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Welcome to ISBNScout!</h2>
          <p className="text-sm text-muted-foreground">Let's get you started in 3 easy steps</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = index === step;
          const isComplete = index < step;
          
          return (
            <div 
              key={index}
              onClick={() => setStep(index)}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-100/80 dark:bg-teal-900/40 border-2 border-teal-500' 
                  : isComplete
                  ? 'bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800'
                  : 'bg-white/50 dark:bg-background/50 border border-border hover:border-teal-300'
              }`}
            >
              <div className={`p-2 rounded-full shrink-0 ${
                isComplete 
                  ? 'bg-teal-500 text-white' 
                  : isActive 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-muted'
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
                  {s.tip && isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium">
                      {s.tip}
                    </span>
                  )}
                </div>
                <h3 className={`font-semibold text-sm ${isActive ? 'text-teal-900 dark:text-teal-100' : ''}`}>
                  {s.title}
                </h3>
                {isActive && (
                  <p className="text-xs text-muted-foreground mt-1 animate-fade-in">
                    {s.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onStartScanning}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm"
          data-testid="button-start-scanning"
        >
          <Camera className="h-4 w-4" />
          Start Scanning
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-[11px] text-center text-muted-foreground mt-3">
        You can always access help from Settings
      </p>
    </Card>
  );
}

export function useFirstTimeUser() {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    setIsFirstTime(!hasSeenWelcome);
    setIsLoading(false);
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsFirstTime(false);
  };

  return { isFirstTime, isLoading, dismissWelcome };
}
