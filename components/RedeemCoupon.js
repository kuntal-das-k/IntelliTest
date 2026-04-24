"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function RedeemCoupon({ onSuccess, compact = false }) {
  const { user, refreshUserData } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim() || !user) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), userId: user.uid }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "Failed to redeem coupon.");
      } else {
        setIsError(false);
        setMessage(data.message);
        setCode("");
        await refreshUserData();
        if (onSuccess) onSuccess(data);
      }
    } catch (err) {
      setIsError(true);
      setMessage("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={handleRedeem} style={{ display: "flex", gap: 8, marginBottom: message ? 12 : 0 }}>
        <input
          type="text"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          style={{
            flex: 1,
            padding: compact ? "10px 14px" : "12px 16px",
            borderRadius: 12,
            border: "2px solid #E5E7EB",
            fontSize: compact ? 13 : 15,
            fontWeight: 600,
            letterSpacing: "0.08em",
            outline: "none",
            fontFamily: "'system-ui', monospace",
            textTransform: "uppercase",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#5B4FCF")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          maxLength={20}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          style={{
            padding: compact ? "10px 20px" : "12px 24px",
            borderRadius: 12,
            background: loading || !code.trim() ? "#D1D5DB" : "linear-gradient(135deg, #5B4FCF, #7B71D9)",
            color: "white",
            border: "none",
            fontWeight: 600,
            fontSize: compact ? 13 : 14,
            cursor: loading || !code.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Redeeming..." : "Redeem"}
        </button>
      </form>

      {message && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            background: isError ? "#FEF2F2" : "#F0FDF4",
            color: isError ? "#DC2626" : "#16A34A",
            border: `1px solid ${isError ? "#FECACA" : "#BBF7D0"}`,
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
