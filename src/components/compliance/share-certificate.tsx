"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ShareCertificateProps {
  score: number;
  userName: string;
  state: string;
  trade: string;
}

/**
 * Shareable compliance certificate
 * Shown after document generation or on dashboard
 */
export function ShareCertificate({
  score,
  userName,
  state,
  trade,
}: ShareCertificateProps) {
  const [copied, setCopied] = useState(false);

  const certificateText = `I just verified my compliance status with RegsGuard: ${score}% for ${trade} in ${state}. Automated compliance tracking means fewer late fees and more time on the job. Check it out → https://regsguard.vercel.app`;

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://regsguard.vercel.app`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://regsguard.vercel.app`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(certificateText)}&url=https://regsguard.vercel.app`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(certificateText)}`;

  function copyToClipboard() {
    navigator.clipboard.writeText(certificateText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 p-6">
      <div className="text-center mb-6">
        <div className="inline-block bg-white rounded-full p-4 mb-3">
          <div className="text-3xl font-bold text-green-600">{score}%</div>
          <div className="text-xs text-gray-600">Compliant</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          You're Compliance-Ready
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {trade} • {state}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-700 text-center">
          Share your compliance status on social:
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(linkedInUrl, "_blank")}
            className="text-xs"
          >
            LinkedIn
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(facebookUrl, "_blank")}
            className="text-xs"
          >
            Facebook
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(twitterUrl, "_blank")}
            className="text-xs"
          >
            X / Twitter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(whatsappUrl, "_blank")}
            className="text-xs"
          >
            WhatsApp
          </Button>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={copyToClipboard}
          className="w-full"
        >
          {copied ? "Copied!" : "Copy Text"}
        </Button>
      </div>
    </Card>
  );
}
