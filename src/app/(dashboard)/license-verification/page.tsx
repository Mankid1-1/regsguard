import { LicenseVerifier } from "@/components/license/license-verifier";

export const metadata = {
  title: "License Verification",
  description: "Verify a contractor license against state databases.",
};

export default function LicenseVerificationPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">License Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Look up a contractor license against MN DLI, WI DSPS, and other state boards.
        </p>
      </header>
      <LicenseVerifier />
    </div>
  );
}
