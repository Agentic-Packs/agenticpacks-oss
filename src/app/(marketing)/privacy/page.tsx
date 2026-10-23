import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AI-Starter Community",
  description: "Privacy Policy and data collection guidelines.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl pt-32">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us when you create an account, subscribe 
          to our service, or communicate with us. [PLACEHOLDER - INSERT YOUR ACTUAL PRIVACY POLICY HERE]
        </p>

        <h2 className="text-2xl font-semibold text-foreground mt-8">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, to 
          process your transactions, and to communicate with you. [PLACEHOLDER - INSERT YOUR ACTUAL PRIVACY POLICY HERE]
        </p>

        <h2 className="text-2xl font-semibold text-foreground mt-8">3. Data Security</h2>
        <p>
          We take reasonable measures to help protect information about you from loss, theft, 
          misuse and unauthorized access. [PLACEHOLDER - INSERT YOUR ACTUAL PRIVACY POLICY HERE]
        </p>
      </div>
    </div>
  );
}
