"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-bg" style={{ minHeight: "85vh", display: "flex", alignItems: "center", position: "relative" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
          <div style={{ maxWidth: 700 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(91,79,207,0.2)",
                border: "1px solid rgba(91,79,207,0.3)",
                padding: "6px 16px",
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 600,
                color: "#A78BFA",
                marginBottom: 24,
              }}
              className="animate-fade-in"
            >
              ✨ AI-Powered Paper Generation
            </div>

            <h1
              style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "white", lineHeight: 1.15, marginBottom: 20 }}
              className="animate-slide-up"
            >
              Generate Exam Papers{" "}
              <span className="gradient-text" style={{ WebkitTextFillColor: "unset", background: "linear-gradient(135deg, #A78BFA, #C4B5FD, #E9D5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                in Seconds
              </span>
            </h1>

            <p
              style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "#9CA3AF", lineHeight: 1.7, marginBottom: 36, maxWidth: 560 }}
              className="animate-slide-up"
            >
              IntelliTest helps math teachers in West Bengal create professional exam papers for WBBSE, WBCHSE, JEE, and WBJEE — powered by AI, ready to download as PDF.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }} className="animate-slide-up">
              <Link href="/login" className="btn-primary animate-pulse-glow" style={{ fontSize: 16, padding: "14px 32px" }}>
                Try Free — 10 Credits →
              </Link>
              <a href="#how-it-works" className="btn-secondary" style={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}>
                How It Works
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 40, marginTop: 48, flexWrap: "wrap" }}>
              {[
                { value: "5+", label: "Boards Supported" },
                { value: "AI", label: "Powered Questions" },
                { value: "PDF", label: "Instant Download" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#A78BFA" }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating paper mockup on right - desktop only */}
        <div
          className="hidden lg:block"
          style={{
            position: "absolute",
            right: "5%",
            top: "50%",
            transform: "translateY(-50%) rotate(3deg)",
            width: 340,
            background: "white",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ borderBottom: "2px solid #E5E7EB", paddingBottom: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#5B4FCF", textAlign: "center" }}>WBBSE — Class 10</div>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 4 }}>Mathematics | Chapter: Algebra</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#9CA3AF" }}>
              <span>Total Marks: 50</span>
              <span>Duration: 2 Hours</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
            <p style={{ fontWeight: 600, color: "#5B4FCF", marginBottom: 4 }}>Section A — MCQ (1 mark each)</p>
            <p>1. If x² - 5x + 6 = 0, then x = ?</p>
            <p style={{ color: "#6B7280", paddingLeft: 12 }}>A) 2, 3 &nbsp; B) -2, -3 &nbsp; C) 1, 6 &nbsp; D) -1, -6</p>
            <p style={{ marginTop: 8 }}>2. The sum of roots of 2x² + 3x - 5 = 0 is:</p>
            <p style={{ color: "#6B7280", paddingLeft: 12 }}>A) 3/2 &nbsp; B) -3/2 &nbsp; C) 5/2 &nbsp; D) -5/2</p>
            <p style={{ fontWeight: 600, color: "#5B4FCF", marginTop: 12, marginBottom: 4 }}>Section B — Short Answer</p>
            <p>3. Factorize: x² - 9x + 20</p>
          </div>
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: "#9CA3AF", fontStyle: "italic" }}>
            Generated by IntelliTest
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-alt" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(24px, 3vw, 36px)", color: "#1E1B4B", marginBottom: 12 }}>
              How It Works
            </h2>
            <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
              Three simple steps to generate a professional exam paper
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 32,
            }}
          >
            {[
              {
                step: "01",
                icon: "📝",
                title: "Fill the Form",
                desc: "Select board, class, chapter, question types, difficulty, and total marks.",
              },
              {
                step: "02",
                icon: "🤖",
                title: "AI Generates Questions",
                desc: "Our AI creates board-appropriate, accurate math questions instantly.",
              },
              {
                step: "03",
                icon: "📄",
                title: "Download PDF",
                desc: "Preview the paper, regenerate any question, and download as professional PDF.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card"
                style={{
                  textAlign: "center",
                  padding: 36,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    fontSize: 80,
                    fontWeight: 900,
                    color: "rgba(91,79,207,0.05)",
                  }}
                >
                  {item.step}
                </div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boards Section */}
      <section style={{ padding: "80px 24px", background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(24px, 3vw, 36px)", color: "#1E1B4B", marginBottom: 12 }}>
            All Major Boards Supported
          </h2>
          <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 500, margin: "0 auto 48px" }}>
            Generate papers matching the exact pattern of each board
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            {[
              { name: "WBBSE", desc: "Class 6–10", color: "#5B4FCF" },
              { name: "WBCHSE", desc: "Class 11–12", color: "#7C3AED" },
              { name: "JEE Mains", desc: "Class 11–12", color: "#2563EB" },
              { name: "JEE Advanced", desc: "Class 11–12", color: "#DC2626" },
              { name: "WBJEE", desc: "Class 11–12", color: "#059669" },
            ].map((board) => (
              <div
                key={board.name}
                style={{
                  padding: "20px 32px",
                  borderRadius: 16,
                  border: `2px solid ${board.color}20`,
                  background: `${board.color}08`,
                  transition: "all 0.3s ease",
                  cursor: "default",
                  minWidth: 160,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = board.color;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${board.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${board.color}20`;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18, color: board.color }}>{board.name}</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{board.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-alt" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(24px, 3vw, 36px)", color: "#1E1B4B", marginBottom: 12 }}>
              Simple, Fair Pricing
            </h2>
            <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
              Start free with 10 credits. Upgrade only when you need more.
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "80px 24px",
          background: "linear-gradient(135deg, #5B4FCF, #7C3AED)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "white", marginBottom: 16 }}>
            Ready to Save Hours of Work?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32 }}>
            Join hundreds of teachers who generate exam papers in minutes, not hours.
          </p>
          <Link href="/login" className="btn-primary" style={{ background: "white", color: "#5B4FCF", fontSize: 16, padding: "14px 36px" }}>
            Start for Free →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
