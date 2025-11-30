import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { SiAmazon } from "react-icons/si";

export default function AmazonRedirectPage() {
  useEffect(() => {
    // Redirect to Amazon UK with affiliate tag after a brief moment
    const timer = setTimeout(() => {
      window.location.href = "/api/amazon/redirect?isbn=books";
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#232F3E] to-[#131921] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white">
        <div className="w-20 h-20 rounded-full bg-[#FF9900] flex items-center justify-center mx-auto">
          <SiAmazon className="h-10 w-10 text-white" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold mb-2">Taking you to Amazon UK</h1>
          <p className="text-muted-foreground">
            Thanks for using my link! You're being redirected...
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-[#FF9900]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Redirecting...</span>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Powered by ISBNScout
        </p>
      </Card>
    </div>
  );
}
