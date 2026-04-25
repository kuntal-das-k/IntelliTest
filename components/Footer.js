"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0F0D1A",
        color: "white",
        padding: "48px 24px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 40,
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
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
            <span style={{ fontWeight: 700, fontSize: 20 }}>
              Intelli<span style={{ color: "#8B5CF6" }}>Test</span>
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#9CA3AF", lineHeight: 1.6 }}>
            AI-powered exam paper generator for math teachers in West Bengal.
            Generate professional question papers in seconds.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: "#E5E7EB" }}>Quick Links</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Home", href: "/" },
              { label: "Pricing", href: "/pricing" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Generate Paper", href: "/generate" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: "#9CA3AF", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = "#8B5CF6")}
                onMouseLeave={(e) => (e.target.style.color = "#9CA3AF")}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Boards Supported */}
        <div>
          <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: "#E5E7EB" }}>Boards Supported</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["WBBSE", "WBCHSE", "JEE Mains", "JEE Advanced", "WBJEE"].map((board) => (
              <span key={board} style={{ color: "#9CA3AF", fontSize: 14 }}>
                {board}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: "#E5E7EB" }}>Support</h4>
          <p style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.8 }}>
            Built for teachers in West Bengal, India.
            <br />
            Questions? Reach out to us.
            <br />
            <a href="mailto:info.intellitest@gmail.com" style={{ color: "#8B5CF6", textDecoration: "none", marginTop: 8, display: "inline-block" }}>
              info.intellitest@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          marginTop: 40,
          paddingTop: 20,
          textAlign: "center",
          color: "#6B7280",
          fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} IntelliTest. All rights reserved.
      </div>
    </footer>
  );
}
