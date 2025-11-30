import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Mail, Headphones, Info } from "lucide-react";

const faqs = [
  "Does ISBNScout work without WiFi or mobile data?",
  "Is this built for Amazon UK sellers?",
  "Does it support eBay UK?",
  "Is the AI spine recognition real?",
  "Can I export my inventory or scan history?",
  "Who is ISBNScout for?",
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* FAQ Section */}
        <section className="mb-16">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Frequently asked questions.
          </h1>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <button
                key={index}
                onClick={() => setLocation("/faq")}
                className="w-full text-left p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-600 transition-colors"
                data-testid={`button-faq-${index}`}
              >
                <h3 className="font-semibold text-foreground">{faq}</h3>
              </button>
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
