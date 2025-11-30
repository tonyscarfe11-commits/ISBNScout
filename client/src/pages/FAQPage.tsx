import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Mail, Headphones, Info, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Does ISBNScout work without WiFi or mobile data?",
    answer: "Yes, that's the core feature! ISBNScout is built from the ground up for offline-first scouting. Scan ISBNs with your phone's camera, and all profitability data syncs to your device when you're connected. You can scan hundreds of books at a charity shop or car-boot sale without any signal, then sync everything when you get back online. Your entire scan history and inventory stays on your device.",
  },
  {
    question: "Is this built for Amazon UK sellers?",
    answer: "Absolutely. ISBNScout is specifically designed for UK book resellers. All pricing, fees, and postage calculations are calibrated for the UK market. We use Royal Mail Large Letter postage (£2.80) in our profit calculations, support Amazon MFN (Merchant Fulfilled Network) with correct UK fees, and focus on charity shops and UK car-boot sales as primary sourcing venues.",
  },
  {
    question: "Does it support eBay UK?",
    answer: "Yes. ISBNScout supports both Amazon MFN and eBay UK. When you scan a book, you'll see profitability forecasts for both platforms side-by-side, including all applicable fees. This helps you make better buy/don't-buy decisions knowing your best-case profit on either channel. Optional listing integration means you can push scans directly to your eBay or Amazon account if you choose.",
  },
  {
    question: "Is the AI spine recognition real?",
    answer: "We're building it. Currently, ISBNScout excels at barcode scanning (fastest method) and cover image recognition. AI spine recognition is in development—it's genuinely useful when you encounter books without visible barcodes or covers that are too worn. Our spine recognition uses computer vision to extract ISBNs from spine text, and it's particularly helpful for older or damaged books where other methods fail.",
  },
  {
    question: "Can I export my inventory or scan history?",
    answer: "Yes. Your scan history and inventory data is yours. You can export your data in CSV format for spreadsheet analysis, accounting, or importing into other tools. This is a Pro and Elite feature, and it ensures you're never locked into ISBNScout—your data stays portable and under your control.",
  },
  {
    question: "Who is ISBNScout for?",
    answer: "ISBNScout is built for UK book resellers: casual scouts hitting charity shops on weekends, professional pickers sourcing full-time, and anyone who wants to make better buy/don't-buy decisions at the point of sale. If you're sourcing physical books and reselling on Amazon or eBay, ISBNScout is for you. You don't need to be a power seller—the app works just as well for side-hustlers as it does for established shops.",
  },
];

const contactOptions = [
  {
    icon: Headphones,
    title: "Support",
    description: "Questions about your account, technical issues, or how to use ISBNScout.",
    email: "support@isbnscout.com",
    testId: "link-support-email",
  },
  {
    icon: Mail,
    title: "General Inquiries",
    description: "General questions, partnerships, or business inquiries.",
    email: "contact@isbnscout.com",
    testId: "link-contact-email",
  },
  {
    icon: Info,
    title: "Information",
    description: "Learn more about ISBNScout, features, and pricing options.",
    email: "info@isbnscout.com",
    testId: "link-info-email",
  },
];

export default function FAQPage() {
  const [, setLocation] = useLocation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* FAQ Section */}
        <section className="mb-16">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Frequently asked questions.
          </h1>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-600 transition-colors flex items-center justify-between group"
                  data-testid={`button-faq-${index}`}
                >
                  <h3 className="font-semibold text-foreground pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-teal-600 flex-shrink-0 transition-transform ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedIndex === index && (
                  <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 border-t-0 rounded-t-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Get in touch.
          </h2>
          <p className="text-muted-foreground mb-8">
            Have questions about ISBNScout? Need help getting started? We're here to help.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card
                  key={index}
                  className="p-6 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit">
                      <Icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">
                        {option.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {option.description}
                      </p>
                      <a
                        href={`mailto:${option.email}`}
                        className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                        data-testid={option.testId}
                      >
                        {option.email}
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>© 2025 ISBNScout. All rights reserved.</p>
            <div className="flex justify-center gap-6">
              <button onClick={() => setLocation("/subscription")} className="hover:text-teal-600">
                Pricing
              </button>
              <button onClick={() => setLocation("/blog")} className="hover:text-teal-600">
                Docs
              </button>
              <button onClick={() => setLocation("/contact")} className="hover:text-teal-600">
                Contact
              </button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-teal-600">
                Privacy
              </button>
              <button onClick={() => setLocation("/terms")} className="hover:text-teal-600">
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
