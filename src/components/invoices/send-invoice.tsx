"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SendInvoiceProps {
  documentId: string;
  documentTitle: string;
  amount?: number;
  clientEmail?: string | null;
  clientPhone?: string | null;
}

type SendMethod = "email" | "sms" | "both";
type SendStep = "form" | "sending" | "done";

export function SendInvoice({
  documentId,
  documentTitle,
  amount,
  clientEmail,
  clientPhone,
}: SendInvoiceProps) {
  const [step, setStep] = useState<SendStep>("form");
  const [method, setMethod] = useState<SendMethod>("sms");
  const [phone, setPhone] = useState(clientPhone || "");
  const [email, setEmail] = useState(clientEmail || "");
  const [invoiceAmount, setInvoiceAmount] = useState(amount?.toString() || "");
  const [description, setDescription] = useState(documentTitle);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function generatePaymentLink() {
    const parsedAmount = parseFloat(invoiceAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount");
      return null;
    }

    try {
      const res = await fetch("/api/invoices/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          amount: parsedAmount,
          description,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to create payment link");
        return null;
      }

      const data = await res.json();
      setPaymentLink(data.paymentLink);
      return data.paymentLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment link");
      return null;
    }
  }

  async function handleSend() {
    setError(null);
    setStep("sending");

    // Generate payment link first
    let link = paymentLink;
    if (!link) {
      link = await generatePaymentLink();
      if (!link) {
        setStep("form");
        return;
      }
    }

    const shouldSendSms = method === "sms" || method === "both";
    const shouldSendEmail = method === "email" || method === "both";

    try {
      // Send SMS
      if (shouldSendSms) {
        if (!phone.trim()) {
          setError("Phone number is required for SMS");
          setStep("form");
          return;
        }

        const smsRes = await fetch("/api/invoices/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            phone: phone.trim(),
            paymentLink: link,
          }),
        });

        if (!smsRes.ok) {
          const errData = await smsRes.json();
          setError(errData.error || "Failed to send SMS");
          setStep("form");
          return;
        }
      }

      // Send email via API
      if (shouldSendEmail) {
        if (!email.trim()) {
          setError("Email is required for email delivery");
          setStep("form");
          return;
        }

        const emailRes = await fetch("/api/invoices/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            email: email.trim(),
            paymentLink: link,
          }),
        });

        if (!emailRes.ok) {
          const errData = await emailRes.json();
          setError(errData.error || "Failed to send email");
          setStep("form");
          return;
        }
      }

      setSent(true);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invoice");
      setStep("form");
    }
  }

  function handleReset() {
    setStep("form");
    setSent(false);
    setPaymentLink(null);
    setError(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Send Invoice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form step */}
        {step === "form" && (
          <>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Invoice: <span className="font-medium text-foreground">{documentTitle}</span>
              </p>
            </div>

            <Input
              label="Amount ($)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
            />

            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Invoice description"
            />

            {/* Delivery method */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Send via
              </label>
              <div className="flex gap-2">
                {(["sms", "email", "both"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      method === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {m === "sms" ? "SMS" : m === "email" ? "Email" : "Both"}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient fields */}
            {(method === "sms" || method === "both") && (
              <Input
                label="Phone Number"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            )}

            {(method === "email" || method === "both") && (
              <Input
                label="Email Address"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            {/* Payment link preview */}
            {paymentLink && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-xs font-medium text-green-800 mb-1">
                  Payment Link Generated
                </p>
                <p className="text-xs text-green-700 font-mono break-all">
                  {paymentLink}
                </p>
              </div>
            )}

            <Button onClick={handleSend} className="w-full">
              Send Invoice
            </Button>
          </>
        )}

        {/* Sending step */}
        {step === "sending" && (
          <div className="flex items-center justify-center py-6 gap-2">
            <svg
              className="h-5 w-5 animate-spin text-primary"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-muted-foreground">
              Sending invoice...
            </span>
          </div>
        )}

        {/* Done step */}
        {step === "done" && sent && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-green-800">
                Invoice Sent Successfully
              </h3>
              <p className="text-xs text-green-700 mt-1">
                {method === "sms"
                  ? `SMS sent to ${phone}`
                  : method === "email"
                    ? `Email sent to ${email}`
                    : `Sent to ${phone} (SMS) and ${email} (Email)`}
              </p>
            </div>

            {paymentLink && (
              <div className="rounded-lg border border-border bg-accent/30 p-3">
                <p className="text-xs font-medium text-foreground mb-1">
                  Payment Link
                </p>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {paymentLink}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigator.clipboard.writeText(paymentLink!)}
                >
                  Copy Link
                </Button>
              </div>
            )}

            <Button onClick={handleReset} variant="outline" className="w-full">
              Send Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
