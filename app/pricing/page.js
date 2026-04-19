"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#F0EEFF",
              padding: "6px 16px",
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 600,
              color: "#5B4FCF",
              marginBottom: 20,
            }}
          >
            💎 Pricing Plans
          </div>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(28px, 4vw, 42px)", color: "#1E1B4B", marginBottom: 12 }}>
            Simple, Fair Pricing
          </h1>
          <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Start free with 10 credits. Upgrade only when you need more papers.
            No hidden fees, cancel anytime.
          </p>
        </div>

        <PricingCards />

        {/* FAQ Section */}
        <div style={{ maxWidth: 700, margin: "80px auto 0" }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, color: "#1E1B4B", textAlign: "center", marginBottom: 36 }}>
            Frequently Asked Questions
          </h2>

          {[
            {
              q: "How do credits work?",
              a: "Each paper generation costs 5 credits. New users get 10 free credits (2 papers). You can buy more credits or subscribe to an unlimited plan.",
            },
            {
              q: "What boards are supported?",
              a: "We support WBBSE (Class 6-10), WBCHSE (Class 11-12), JEE Mains, JEE Advanced, and WBJEE. Questions follow the exact board exam pattern.",
            },
            {
              q: "Can I cancel my subscription?",
              a: "Yes, you can cancel anytime. Your unlimited access will remain active until the plan expiry date.",
            },
            {
              q: "How accurate are the AI-generated questions?",
              a: "Our AI generates mathematically accurate questions appropriate for the selected board and class level. You can also regenerate individual questions if needed.",
            },
            {
              q: "Can I download papers as PDF?",
              a: "Yes! Every generated paper can be downloaded as a professionally formatted A4 PDF document, ready to print.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 14,
                padding: "20px 24px",
                marginBottom: 12,
                border: "1px solid #E5E7EB",
              }}
            >
              <h3 style={{ fontWeight: 600, fontSize: 15, color: "#1E1B4B", marginBottom: 8 }}>{faq.q}</h3>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
