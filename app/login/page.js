"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("main"); // "main", "phone", "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (err.code === "auth/configuration-not-found") {
        setError("Google Sign-In not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Google.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    }
    setLoading(false);
  };

  // Phone OTP methods
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formatted = phone.startsWith("+91") ? phone : `+91${phone}`;
    if (formatted.replace("+91", "").length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }
    try {
      setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err) {
      if (err.code === "auth/billing-not-enabled") {
        setError("Phone OTP requires Firebase Blaze plan. Please use Google Sign-In instead, or upgrade your Firebase plan.");
      } else {
        setError(err.message || "Failed to send OTP.");
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      setLoading(false);
      return;
    }
    try {
      await confirmationResult.confirm(otp);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
      <Navbar />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 64px)",
          padding: 24,
        }}
      >
        <div className="card animate-slide-up" style={{ maxWidth: 440, width: "100%", padding: "40px 32px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "linear-gradient(135deg, #5B4FCF, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: 22,
                margin: "0 auto 16px",
              }}
            >
              IT
            </div>
            <h1 style={{ fontWeight: 700, fontSize: 24, color: "#1E1B4B", marginBottom: 8 }}>
              {step === "otp" ? "Verify OTP" : "Welcome to IntelliTest"}
            </h1>
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              {step === "otp"
                ? `We sent a 6-digit code to +91${phone.replace("+91", "")}`
                : "Sign in to generate exam papers"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 20,
                color: "#DC2626",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* Main login view — Google + Phone option */}
          {step === "main" && (
            <>
              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: "2px solid #E5E7EB",
                  background: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#374151",
                  transition: "all 0.3s ease",
                  marginBottom: 16,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "#5B4FCF";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(91,79,207,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid #E5E7EB",
                        borderTopColor: "#5B4FCF",
                        borderRadius: "50%",
                      }}
                      className="animate-spin-slow"
                    />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  margin: "20px 0",
                }}
              >
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                <span style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 500 }}>or</span>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              </div>

              {/* Phone OTP option */}
              <button
                onClick={() => setStep("phone")}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: "2px solid #E5E7EB",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#374151",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#5B4FCF";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(91,79,207,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                📱 Continue with Phone OTP
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 20 }}>
                By continuing, you agree to our Terms of Service.
              </p>
            </>
          )}

          {/* Phone number input step */}
          {step === "phone" && (
            <form onSubmit={handleSendOTP}>
              <label className="form-label">Phone Number</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <div
                  style={{
                    padding: "12px 14px",
                    border: "2px solid #E5E7EB",
                    borderRadius: 12,
                    fontSize: 15,
                    color: "#374151",
                    background: "#F9FAFB",
                    fontWeight: 600,
                  }}
                >
                  +91
                </div>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="Enter 10-digit number"
                  value={phone.replace("+91", "")}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: 14 }}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("main");
                  setError("");
                }}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: 12,
                  background: "transparent",
                  border: "none",
                  color: "#5B4FCF",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ← Back to Sign-in Options
              </button>
            </form>
          )}

          {/* OTP verification step */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP}>
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                style={{ textAlign: "center", fontSize: 24, letterSpacing: 8, marginBottom: 20 }}
                autoFocus
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: 14 }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: 12,
                  background: "transparent",
                  border: "none",
                  color: "#5B4FCF",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ← Change Phone Number
              </button>
            </form>
          )}

          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
}
