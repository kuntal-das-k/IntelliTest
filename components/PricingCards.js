"use client";

import { useState } from "react";
import RedeemCoupon from "./RedeemCoupon";

const UPI_ID = "daskuntal688@okaxis";

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
    amount: 15,
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
    amount: 75,
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
    amount: 150,
  },
];

// UPI Payment Modal
function UPIPaymentModal({ plan, onClose }) {
  const [step, setStep] = useState("pay"); // "pay" | "redeem"
  const [copied, setCopied] = useState(false);

  const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=IntelliTest&am=${plan.amount}&cu=INR&tn=IntelliTest%20${encodeURIComponent(plan.name)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 24,
          padding: "36px 32px",
          maxWidth: 460,
          width: "100%",
          position: "relative",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#F3F4F6",
            border: "none",
            width: 36,
            height: 36,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#6B7280",
          }}
        >
          ✕
        </button>

        {step === "pay" ? (
          <>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #5B4FCF, #7B71D9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: 28,
                }}
              >
                💳
              </div>
              <h2 style={{ fontWeight: 700, fontSize: 22, color: "#1E1B4B", marginBottom: 4 }}>
                Pay via UPI
              </h2>
              <p style={{ color: "#6B7280", fontSize: 14 }}>
                {plan.name} — <strong style={{ color: "#5B4FCF" }}>{plan.price}</strong>
              </p>
            </div>

            {/* Amount Badge */}
            <div
              style={{
                background: "linear-gradient(135deg, #F0EEFF, #E8E4FF)",
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500, marginBottom: 4 }}>
                Amount to Pay
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#5B4FCF" }}>₹{plan.amount}</div>
            </div>

            {/* UPI ID */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Send to UPI ID
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#F9FAFB",
                  border: "2px solid #E5E7EB",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1E1B4B",
                    fontFamily: "'system-ui', monospace",
                    letterSpacing: "0.02em",
                  }}
                >
                  {UPI_ID}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: copied ? "#10B981" : "#5B4FCF",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Pay with UPI App button (mobile deep link) */}
            <a
              href={upiDeepLink}
              style={{
                display: "block",
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                background: "linear-gradient(135deg, #5B4FCF, #7B71D9)",
                color: "white",
                textAlign: "center",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                marginBottom: 12,
                transition: "opacity 0.2s",
              }}
            >
              📱 Open UPI App to Pay
            </a>

            {/* Instructions */}
            <div
              style={{
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 8 }}>
                📋 How it works
              </div>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 13,
                  color: "#78350F",
                  lineHeight: 1.8,
                }}
              >
                <li>Pay <strong>₹{plan.amount}</strong> to the UPI ID above</li>
                <li>Send a screenshot to us on WhatsApp</li>
                <li>We'll send you a <strong>coupon code</strong> within minutes</li>
                <li>Enter the code below to activate your plan!</li>
              </ol>
            </div>

            {/* Already Paid? */}
            <button
              onClick={() => setStep("redeem")}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                border: "2px solid #E5E7EB",
                background: "white",
                color: "#5B4FCF",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#5B4FCF";
                e.target.style.background = "#F0EEFF";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.background = "white";
              }}
            >
              🎟️ I have a coupon code
            </button>
          </>
        ) : (
          <>
            {/* Redeem Step */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#F0FDF4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: 28,
                }}
              >
                🎟️
              </div>
              <h2 style={{ fontWeight: 700, fontSize: 22, color: "#1E1B4B", marginBottom: 4 }}>
                Redeem Coupon
              </h2>
              <p style={{ color: "#6B7280", fontSize: 14 }}>
                Enter the coupon code you received after payment
              </p>
            </div>

            <RedeemCoupon onSuccess={() => setTimeout(onClose, 1500)} />

            <button
              onClick={() => setStep("pay")}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "12px 0",
                background: "transparent",
                border: "none",
                color: "#5B4FCF",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ← Back to payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PricingCards({ onPurchase }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePurchase = (plan) => {
    if (plan.amount === 0) return;
    setSelectedPlan(plan);
  };

  return (
    <>
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

      {/* UPI Payment Modal */}
      {selectedPlan && (
        <UPIPaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </>
  );
}
