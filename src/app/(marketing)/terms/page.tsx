import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | AgenticPacks OSS",
  description: "Terms of Service and conditions of use.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl pt-32">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
        <p>
          By accessing and using this website, you accept and agree to be bound by the terms and 
          provision of this agreement. [PLACEHOLDER - INSERT YOUR ACTUAL TERMS OF SERVICE HERE]
        </p>

        <h2 className="text-2xl font-semibold text-foreground mt-8">2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials on this website 
          for personal, non-commercial transitory viewing only. [PLACEHOLDER - INSERT YOUR ACTUAL TERMS OF SERVICE HERE]
        </p>

        <h2 className="text-2xl font-semibold text-foreground mt-8">3. Disclaimer</h2>
        <p>
          The materials on this website are provided on an 'as is' basis. We make no warranties, 
          expressed or implied. [PLACEHOLDER - INSERT YOUR ACTUAL TERMS OF SERVICE HERE]
        </p>
      </div>
    </div>
  );
}
