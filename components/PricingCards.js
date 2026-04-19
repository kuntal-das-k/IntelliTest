"use client";

import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    description: "Get started with 10 free credits",
    features: ["10 credits (2 papers)", "All boards supported", "PDF download", "Basic question types"],
    cta: "Current Plan",
    popular: false,
    planId: "free",
    amount: 0,
  },
  {
    name: "Pay Per Paper",
    price: "₹15",
    period: "per paper",
    description: "Buy credits as you need them",
    features: ["5 credits per purchase", "Generate 1 paper", "All boards supported", "PDF download", "All question types"],
    cta: "Buy Credits",
    popular: false,
    planId: "pay_per_credit",
    amount: 1500,
  },
  {
    name: "1 Month Unlimited",
    price: "₹75",
    period: "/month",
    description: "Unlimited papers for a full month",
    features: [
      "Unlimited paper generation",
      "All boards & classes",
      "Priority AI generation",
      "PDF download",
      "All question types",
      "30 days validity",
    ],
    cta: "Subscribe Now",
    popular: true,
    planId: "monthly_unlimited",
    amount: 7500,
  },
  {
    name: "3 Month Unlimited",
    price: "₹150",
    period: "/3 months",
    description: "Best value — save 33%",
    features: [
      "Unlimited paper generation",
      "All boards & classes",
      "Priority AI generation",
      "PDF download",
      "All question types",
      "90 days validity",
      "Best value deal",
    ],
    cta: "Subscribe Now",
    popular: false,
    planId: "quarterly_unlimited",
    amount: 15000,
  },
];

export default function PricingCards({ onPurchase }) {
  const handlePurchase = (plan) => {
    if (plan.amount === 0) return;
    if (onPurchase) {
      onPurchase(plan);
    } else {
      // Razorpay integration placeholder
      alert(
        `Razorpay payment for ${plan.name} (₹${plan.amount / 100}) — Keys not configured yet. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local`
      );
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 24,
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {plans.map((plan) => (
        <div
          key={plan.planId}
          style={{
            background: plan.popular
              ? "linear-gradient(135deg, #5B4FCF, #7B71D9)"
              : "white",
            borderRadius: 20,
            padding: 28,
            position: "relative",
            border: plan.popular ? "none" : "1px solid #E5E7EB",
            color: plan.popular ? "white" : "#1E1B4B",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = plan.popular
              ? "0 20px 40px rgba(91,79,207,0.4)"
              : "0 12px 32px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {plan.popular && (
            <div
              style={{
                position: "absolute",
                top: -12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#F59E0B",
                color: "#1E1B4B",
                padding: "4px 16px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Most Popular
            </div>
          )}

          <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{plan.name}</h3>
          <p
            style={{
              fontSize: 13,
              opacity: 0.8,
              marginBottom: 16,
            }}
          >
            {plan.description}
          </p>

          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>{plan.price}</span>
            {plan.period && (
              <span style={{ fontSize: 15, opacity: 0.7, marginLeft: 4 }}>{plan.period}</span>
            )}
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, marginBottom: 20 }}>
            {plan.features.map((f, i) => (
              <li
                key={i}
                style={{
                  fontSize: 14,
                  padding: "6px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: plan.popular ? "#A3F5B0" : "#10B981", fontSize: 16 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handlePurchase(plan)}
            disabled={plan.amount === 0}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              cursor: plan.amount === 0 ? "default" : "pointer",
              border: plan.popular ? "2px solid white" : "2px solid #5B4FCF",
              background: plan.popular ? "white" : plan.amount === 0 ? "#F3F4F6" : "transparent",
              color: plan.popular ? "#5B4FCF" : plan.amount === 0 ? "#9CA3AF" : "#5B4FCF",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (plan.amount > 0 && !plan.popular) {
                e.target.style.background = "#5B4FCF";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (plan.amount > 0 && !plan.popular) {
                e.target.style.background = "transparent";
                e.target.style.color = "#5B4FCF";
              }
            }}
          >
            {plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
