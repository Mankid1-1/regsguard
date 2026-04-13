"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  priceId: string;
  features: string[];
  popular?: boolean;
  badge?: string;
}

export function PricingCard({ title, price, period, priceId, features, popular, badge }: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-xl border-2 p-8 ${popular ? "border-primary" : "border-border"}`}>
      {badge && (
        <div className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {badge}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="my-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">/{period}</span>
      </div>
      <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Button className="w-full" variant={popular ? "primary" : "outline"} loading={loading} onClick={handleSubscribe}>
        Start Free Trial
      </Button>
    </div>
  );
}
