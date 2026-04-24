"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";

// ── Inline styles ──────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#FAFAF8",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "2px solid #E5E2D9",
    borderTopColor: "#1A1A1A",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  wrap: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "40px 24px 80px",
  },
  // ── Action bar ──
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 36,
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#6B6860",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 0",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
  },
  btnGroup: { display: "flex", gap: 8 },
  outlineBtn: {
    fontSize: 12.5,
    fontFamily: "'system-ui', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.04em",
    color: "#1A1A1A",
    background: "#fff",
    border: "0.5px solid #C8C5BC",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  solidBtn: {
    fontSize: 12.5,
    fontFamily: "'system-ui', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.04em",
    color: "#fff",
    background: "#1A1A1A",
    border: "0.5px solid #1A1A1A",
    borderRadius: 6,
    padding: "8px 18px",
    cursor: "pointer",
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  // ── Paper card ──
  paperCard: {
    background: "#fff",
    border: "0.5px solid #E2DFD6",
    borderRadius: 12,
    padding: "48px 52px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  // ── Header ──
  paperHeader: {
    textAlign: "center",
    paddingBottom: 24,
    marginBottom: 4,
    borderBottom: "1.5px solid #1A1A1A",
  },
  schoolName: {
    fontSize: 11,
    fontFamily: "'system-ui', sans-serif",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#6B6860",
    marginBottom: 10,
  },
  paperTitle: {
    fontSize: 22,
    fontWeight: 400,
    color: "#1A1A1A",
    marginBottom: 4,
    lineHeight: 1.3,
  },
  paperSubtitle: {
    fontSize: 13,
    color: "#9B9890",
    fontFamily: "'system-ui', sans-serif",
  },
  metaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    fontSize: 11.5,
    fontFamily: "'system-ui', sans-serif",
    padding: "14px 0",
    borderBottom: "0.5px solid #E2DFD6",
    marginBottom: 32,
    color: "#6B6860",
  },
  metaCenter: { textAlign: "center" },
  metaRight: { textAlign: "right" },
  metaVal: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#1A1A1A",
    marginBottom: 2,
    fontFamily: "'system-ui', sans-serif",
  },
  // ── Section ──
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    margin: "32px 0 18px",
  },
  sectionLabel: {
    fontSize: 10.5,
    fontFamily: "'system-ui', sans-serif",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#1A1A1A",
    whiteSpace: "nowrap",
  },
  sectionLine: {
    flex: 1,
    height: "0.5px",
    background: "#E2DFD6",
  },
  sectionMeta: {
    fontSize: 11,
    fontFamily: "'system-ui', sans-serif",
    color: "#9B9890",
    whiteSpace: "nowrap",
  },
  // ── Question ──
  questionBlock: {
    padding: "16px 0",
    borderBottom: "0.5px solid #F0EDE6",
  },
  qRow: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  qNum: {
    fontSize: 13,
    fontWeight: 500,
    color: "#9B9890",
    minWidth: 20,
    paddingTop: 2,
    fontFamily: "'system-ui', sans-serif",
  },
  qBody: { flex: 1 },
  qText: {
    fontSize: 14.5,
    lineHeight: 1.7,
    color: "#1A1A1A",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
    marginTop: 12,
  },
  option: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: 13.5,
    padding: "8px 12px",
    border: "0.5px solid #E2DFD6",
    borderRadius: 6,
    lineHeight: 1.5,
    background: "#FAFAF8",
  },
  optKey: {
    fontWeight: 600,
    color: "#9B9890",
    fontSize: 12,
    minWidth: 14,
    fontFamily: "'system-ui', sans-serif",
    marginTop: 1,
  },
  answerBox: {
    marginTop: 12,
    padding: "12px 14px",
    background: "#F5F3EE",
    borderRadius: 6,
    border: "0.5px solid #E2DFD6",
  },
  answerLabel: {
    fontSize: 11,
    fontFamily: "'system-ui', sans-serif",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6B6860",
    marginBottom: 4,
  },
  answerText: {
    fontSize: 13.5,
    color: "#1A1A1A",
    lineHeight: 1.6,
  },
  subPart: {
    marginTop: 10,
    paddingLeft: 12,
    borderLeft: "2px solid #E2DFD6",
  },
  subPartItem: {
    fontSize: 13.5,
    lineHeight: 1.65,
    color: "#4A4845",
    marginTop: 6,
  },
  marksTag: {
    fontSize: 11,
    color: "#9B9890",
    fontFamily: "'system-ui', sans-serif",
    marginLeft: 6,
  },
  regenBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    fontSize: 11.5,
    fontFamily: "'system-ui', sans-serif",
    color: "#9B9890",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    letterSpacing: "0.02em",
    transition: "color 0.15s",
  },
  footer: {
    textAlign: "center",
    fontSize: 11.5,
    fontFamily: "'system-ui', sans-serif",
    color: "#B5B2A9",
    marginTop: 40,
    paddingTop: 20,
    borderTop: "0.5px solid #E2DFD6",
    letterSpacing: "0.04em",
  },
};

// ── Helper to get section marks label ──
function sectionMeta(type) {
  if (!type) return "";
  const t = type.toLowerCase();
  if (t.includes("mcq") || t.includes("multiple")) return "Multiple Choice · 1 mark each";
  if (t.includes("short")) return "Short Answer · 3 marks each";
  if (t.includes("long")) return "Long Answer · 4–5 marks each";
  return type;
}

// ── Regenerate icon SVG ──
const RegenIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M2 8a6 6 0 1 0 1.5-3.9" />
    <polyline points="2,3 2,8 7,8" />
  </svg>
);

// ── Main Component ──────────────────────────────────────────────────────────────
export default function PaperViewPage({ params }) {
  const paperId = params?.id;
  const { user, loading } = useAuth();
  const router = useRouter();

  const [paper, setPaper] = useState(null);
  const [paperLoading, setPaperLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [regenerating, setRegenerating] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      setPaperLoading(false);
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch paper
  useEffect(() => {
    const fetchPaper = async () => {
      if (!user || !paperId) { setPaperLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "papers", paperId));
        setPaper(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setPaperLoading(false);
      }
    };
    fetchPaper();
  }, [user, paperId]);

  // Download PDF via Browser Print
  const handleDownloadPDF = () => {
    window.print();
  };

  // Regenerate question
  const handleRegenerate = async (sIdx, qIdx) => {
    const section = paper.sections[sIdx];
    const question = section.questions[qIdx];
    const key = `${sIdx}-${qIdx}`;
    setRegenerating(key);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          board: paper.header.board,
          className: paper.header.class,
          chapter: paper.header.chapter,
          type: section.type,
          difficulty: paper.formData?.difficulty || "Medium",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const updatedPaper = {
        ...paper,
        sections: paper.sections.map((sec, si) =>
          si !== sIdx ? sec : {
            ...sec,
            questions: sec.questions.map((q, qi) =>
              qi !== qIdx ? q : {
                ...q,
                question: data.question.question,
                options: data.question.options || q.options,
                answer: data.question.answer,
                solution: data.question.solution,
              }
            ),
          }
        ),
      };
      setPaper(updatedPaper);
      await updateDoc(doc(db, "papers", paperId), { sections: updatedPaper.sections });
    } catch (err) {
      alert("Failed to regenerate: " + (err.message || "Unknown error"));
    }
    setRegenerating(null);
  };

  // ── Loading ──
  if (loading || paperLoading) {
    return (
      <div style={S.page}>
        <Navbar />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={S.center}>
          <div style={S.spinner} />
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!paper) {
    return (
      <div style={S.page}>
        <Navbar />
        <div style={{ ...S.center, flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 18, color: "#1A1A1A" }}>Paper not found.</p>
          <button style={S.outlineBtn} onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const h = paper.header || {};

  // ── Main UI ──
  return (
    <div style={S.page} className="print-page">
      <div className="no-print">
        <Navbar />
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .regen-btn:hover { color: #1A1A1A !important }
        .outline-btn:hover { background: #F5F3EE }
        
        @media print {
          /* Hide UI elements during print */
          .no-print { display: none !important; }
          
          /* Clean up background and layout */
          body { background: white !important; }
          .print-page { background: white !important; }
          .paper-wrap { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          .paper-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          
          /* Print optimizations */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .question-block { page-break-inside: avoid; border-bottom: 1px solid #ddd !important; }
          .answer-box { page-break-inside: avoid; border: 1px solid #ccc !important; }
          .options-grid { page-break-inside: avoid; }
        }
      `}</style>

      <div style={S.wrap} className="paper-wrap">
        {/* Action bar */}
        <div style={S.actionBar} className="no-print">
          <button style={S.backBtn} onClick={() => router.push("/dashboard")}>
            ← Dashboard
          </button>
          <div style={S.btnGroup}>
            <button
              className="outline-btn"
              style={S.outlineBtn}
              onClick={() => setShowAnswers(!showAnswers)}
            >
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>
            <button
              style={{ ...S.solidBtn, ...(downloading ? S.disabledBtn : {}) }}
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? "Generating…" : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Paper card */}
        <div style={S.paperCard} className="paper-card">
          {/* Header */}
          <div style={S.paperHeader}>
            {paper.formData?.schoolName && (
              <div style={S.schoolName}>{paper.formData.schoolName}</div>
            )}
            <div style={S.paperTitle}>
              {h.subject || "Examination Paper"}
              {h.chapter ? ` — ${h.chapter}` : ""}
            </div>
            <div style={S.paperSubtitle}>
              {[h.board, h.class && `Class ${h.class}`, h.examType].filter(Boolean).join(" · ")}
            </div>
          </div>

          {/* Meta row */}
          <div style={S.metaRow}>
            <div>
              <span style={S.metaVal}>{h.totalMarks ? `${h.totalMarks} Marks` : "Full Marks"}</span>
              All questions compulsory
            </div>
            <div style={S.metaCenter}>
              <span style={S.metaVal}>{h.duration || "3 Hours"}</span>
              Time allowed
            </div>
            <div style={S.metaRight}>
              <span style={S.metaVal}>Date: ___/___/____</span>
              Roll No: ____________
            </div>
          </div>

          {/* Sections */}
          {paper.sections?.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section header */}
              <div style={S.sectionHeader}>
                <span style={S.sectionLabel}>{section.sectionName || `Section ${String.fromCharCode(65 + sIdx)}`}</span>
                <span style={S.sectionMeta}>{sectionMeta(section.type)}</span>
                <div style={S.sectionLine} />
              </div>

              {/* Questions */}
              {section.questions?.map((q, qIdx) => {
                const key = `${sIdx}-${qIdx}`;
                const isRegen = regenerating === key;
                const hasSubs = !q.options && q.subParts?.length > 0;

                return (
                  <div key={qIdx} style={S.questionBlock} className="question-block">
                    <div style={S.qRow}>
                      <span style={S.qNum}>{q.id || qIdx + 1}.</span>
                      <div style={S.qBody}>
                        <div style={S.qText}>{q.question}</div>

                        {/* MCQ options */}
                        {q.options?.length > 0 && (
                          <div style={S.optionsGrid} className="options-grid">
                            {q.options.map((opt, i) => (
                              <div key={i} style={S.option}>
                                <span style={S.optKey}>{String.fromCharCode(65 + i)}</span>
                                <span>{opt.replace(/^[A-Da-d][).\s]+/, "")}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Sub-parts (long answer) */}
                        {hasSubs && (
                          <div style={S.subPart}>
                            {q.subParts.map((sp, si) => (
                              <div key={si} style={S.subPartItem}>
                                ({String.fromCharCode(97 + si)}) {sp.text}
                                {sp.marks && <span style={S.marksTag}>({sp.marks} marks)</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Answer box */}
                        {showAnswers && (q.answer || q.solution) && (
                          <div style={S.answerBox} className="answer-box">
                            {q.answer && (
                              <>
                                <div style={S.answerLabel}>Answer</div>
                                <div style={S.answerText}>{q.answer}</div>
                              </>
                            )}
                            {q.solution && (
                              <>
                                <div style={{ ...S.answerLabel, marginTop: q.answer ? 10 : 0 }}>Solution</div>
                                <div style={S.answerText}>{q.solution}</div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Regenerate */}
                        <button
                          className="regen-btn no-print"
                          style={{ ...S.regenBtn, opacity: isRegen ? 0.5 : 1 }}
                          onClick={() => !isRegen && handleRegenerate(sIdx, qIdx)}
                          disabled={isRegen}
                        >
                          <RegenIcon />
                          {isRegen ? "Regenerating…" : "Regenerate"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Footer */}
          <div style={S.footer}>— End of Question Paper — · Generated by IntelliTest</div>
        </div>
      </div>
    </div>
  );
}