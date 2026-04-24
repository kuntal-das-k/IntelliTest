"use client";

import { useState } from "react";
import PricingCards from "./PricingCards";
import RedeemCoupon from "./RedeemCoupon";

export default function UpgradeModal({ isOpen, onClose }) {
  const [showRedeem, setShowRedeem] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 24,
          padding: "32px 24px",
          maxWidth: 1150,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
        className="animate-slide-up"
      >
        {/* Close button */}
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
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#E5E7EB";
            e.target.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#F3F4F6";
            e.target.style.color = "#6B7280";
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
            }}
          >
            ⚡
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 24, color: "#1E1B4B", marginBottom: 8 }}>
            You&apos;re Out of Credits!
          </h2>
          <p style={{ color: "#6B7280", fontSize: 15 }}>
            Upgrade your plan to continue generating exam papers.
          </p>
        </div>

        {/* Quick Redeem Section */}
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto 32px",
            padding: "20px 24px",
            background: "#F0EEFF",
            borderRadius: 16,
            border: "1px solid #E0DBFF",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: showRedeem ? 16 : 0,
              cursor: "pointer",
            }}
            onClick={() => setShowRedeem(!showRedeem)}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#5B4FCF" }}>
              🎟️ Have a coupon code?
            </span>
            <span style={{ fontSize: 18, color: "#5B4FCF", transition: "transform 0.2s", transform: showRedeem ? "rotate(180deg)" : "rotate(0)" }}>
              ▾
            </span>
          </div>
          {showRedeem && (
            <RedeemCoupon compact onSuccess={() => setTimeout(onClose, 1500)} />
          )}
        </div>

        <PricingCards />
      </div>
    </div>
  );
}
