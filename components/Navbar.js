"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #5B4FCF, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            IT
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: "#1E1B4B" }}>
            Intelli<span style={{ color: "#5B4FCF" }}>Test</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
          className="hidden md:flex"
        >
          {user ? (
            <>
              <Link
                href="/dashboard"
                style={{ textDecoration: "none", color: "#4B5563", fontWeight: 500, fontSize: 15, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = "#5B4FCF")}
                onMouseLeave={(e) => (e.target.style.color = "#4B5563")}
              >
                Dashboard
              </Link>
              <Link
                href="/generate"
                style={{ textDecoration: "none", color: "#4B5563", fontWeight: 500, fontSize: 15 }}
                onMouseEnter={(e) => (e.target.style.color = "#5B4FCF")}
                onMouseLeave={(e) => (e.target.style.color = "#4B5563")}
              >
                Generate Paper
              </Link>
              <Link
                href="/pricing"
                style={{ textDecoration: "none", color: "#4B5563", fontWeight: 500, fontSize: 15 }}
                onMouseEnter={(e) => (e.target.style.color = "#5B4FCF")}
                onMouseLeave={(e) => (e.target.style.color = "#4B5563")}
              >
                Pricing
              </Link>
              {userData && (
                <div
                  style={{
                    background: "#F0EEFF",
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#5B4FCF",
                  }}
                >
                  {userData.plan === "unlimited" ? "♾️ Unlimited" : `⚡ ${userData.credits} credits`}
                </div>
              )}
              <button
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "1px solid #E5E7EB",
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#6B7280",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#EF4444";
                  e.target.style.color = "#EF4444";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.color = "#6B7280";
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/pricing"
                style={{ textDecoration: "none", color: "#4B5563", fontWeight: 500, fontSize: 15 }}
                onMouseEnter={(e) => (e.target.style.color = "#5B4FCF")}
                onMouseLeave={(e) => (e.target.style.color = "#4B5563")}
              >
                Pricing
              </Link>
              <Link href="/login" className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
                Try Free →
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "white",
          }}
        >
          {user ? (
            <>
              {userData && (
                <div
                  style={{
                    background: "#F0EEFF",
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#5B4FCF",
                    textAlign: "center",
                  }}
                >
                  {userData.plan === "unlimited" ? "♾️ Unlimited" : `⚡ ${userData.credits} credits`}
                </div>
              )}
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", color: "#374151", fontWeight: 500, padding: "8px 0" }}>
                Dashboard
              </Link>
              <Link href="/generate" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", color: "#374151", fontWeight: 500, padding: "8px 0" }}>
                Generate Paper
              </Link>
              <Link href="/pricing" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", color: "#374151", fontWeight: 500, padding: "8px 0" }}>
                Pricing
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{
                  background: "transparent",
                  border: "1px solid #E5E7EB",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#EF4444",
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/pricing" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", color: "#374151", fontWeight: 500, padding: "8px 0" }}>
                Pricing
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ textAlign: "center" }}>
                Try Free →
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
