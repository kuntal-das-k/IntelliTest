"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";

export default function PaperViewPage({ params }) {
  const paperId = params.id;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [paper, setPaper] = useState(null);
  const [paperLoading, setPaperLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [regenerating, setRegenerating] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!user || !paperId) return;
      try {
        const paperRef = doc(db, "papers", paperId);
        const paperSnap = await getDoc(paperRef);
        if (paperSnap.exists()) {
          setPaper({ id: paperSnap.id, ...paperSnap.data() });
        }
      } catch (err) {
        console.error("Fetch paper error:", err);
      }
      setPaperLoading(false);
    };
    fetchPaper();
  }, [user, paperId]);

  const handleDownloadPDF = async () => {
    if (!paper) return;
    try {
      // Create safe filename
      const rawName = `IntelliTest_${paper.header?.board || 'Paper'}_${paper.header?.class || ''}_${paper.header?.chapter || ''}`;
      const safeFileName = rawName.replace(/[^a-zA-Z0-9-_\s]/g, '_').trim() + '.pdf';
      
      // Call Python backend
      const response = await fetch("http://localhost:8000/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paper: paper,
          schoolName: paper.formData?.schoolName || ""
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF on server");
      }
      
      // Download the blob returned by Python
      const rawBlob = await response.blob();
      // Ensure the blob has the correct PDF MIME type
      const pdfBlob = new Blob([rawBlob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = safeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please ensure the Python backend is running.");
    }
  };

  const handleRegenerateQuestion = async (sectionIdx, questionIdx) => {
    const section = paper.sections[sectionIdx];
    const question = section.questions[questionIdx];
    const key = `${sectionIdx}-${questionIdx}`;
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

      // Update paper in state (immutable update to avoid mutating React state)
      const updatedPaper = {
        ...paper,
        sections: paper.sections.map((sec, si) =>
          si !== sectionIdx
            ? sec
            : {
                ...sec,
                questions: sec.questions.map((q, qi) =>
                  qi !== questionIdx
                    ? q
                    : {
                        ...q,
                        question: data.question.question,
                        options: data.question.options || question.options,
                        answer: data.question.answer,
                        solution: data.question.solution,
                      }
                ),
              }
        ),
      };
      setPaper(updatedPaper);

      // Update in Firestore
      const paperRef = doc(db, "papers", paperId);
      await updateDoc(paperRef, { sections: updatedPaper.sections });
    } catch (err) {
      alert("Failed to regenerate question: " + (err.message || "Unknown error"));
    }

    setRegenerating(null);
  };

  if (loading || paperLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #E5E7EB", borderTopColor: "#5B4FCF", borderRadius: "50%" }} className="animate-spin-slow" />
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: 60 }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, color: "#1E1B4B", marginBottom: 12 }}>Paper Not Found</h2>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>This paper may have been deleted or you don&apos;t have access.</p>
          <button onClick={() => router.push("/dashboard")} className="btn-primary">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
      <Navbar />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {/* Action bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#5B4FCF", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            ← Back to Dashboard
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setShowAnswers(!showAnswers)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>
              📥 Download PDF
            </button>
          </div>
        </div>

        {/* Paper Card */}
        <div className="card" style={{ padding: 36 }}>
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #E5E7EB", paddingBottom: 20, marginBottom: 24 }}>
            {paper.formData?.schoolName && (
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 4 }}>{paper.formData.schoolName}</div>
            )}
            <div style={{ fontWeight: 700, fontSize: 16, color: "#5B4FCF" }}>
              {paper.header?.board} — {paper.header?.class}
            </div>
            <div style={{ fontSize: 14, color: "#374151", marginTop: 4 }}>
              Subject: {paper.header?.subject} | Chapter: {paper.header?.chapter}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13, color: "#6B7280" }}>
              <span>Total Marks: {paper.header?.totalMarks}</span>
              <span>Duration: {paper.header?.duration}</span>
            </div>
            {paper.header?.date && (
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>Date: {paper.header.date}</div>
            )}
          </div>

          {/* Sections */}
          {paper.sections?.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: 32 }}>
              <div style={{ background: "#F0EEFF", padding: "10px 16px", borderRadius: 10, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#5B4FCF" }}>
                  {section.sectionName} — {section.type} ({section.marksPerQuestion} mark{section.marksPerQuestion > 1 ? "s" : ""} each)
                </span>
              </div>

              {section.questions?.map((q, qIdx) => (
                <div key={qIdx} style={{ marginBottom: 20, paddingLeft: 8, borderLeft: "3px solid #E5E7EB", paddingBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "#1E1B4B", marginBottom: 8, lineHeight: 1.6 }}>
                        {q.id}. {q.question}
                      </p>

                      {q.options && q.options.length > 0 && (
                        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
                          {q.options.map((opt, oIdx) => (
                            <p key={oIdx} style={{ fontSize: 13, color: "#4B5563", padding: "3px 0", lineHeight: 1.5 }}>{opt}</p>
                          ))}
                        </div>
                      )}

                      {showAnswers && (
                        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", marginTop: 8 }}>
                          {q.answer && <p style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>Answer: {q.answer}</p>}
                          {q.solution && <p style={{ fontSize: 13, color: "#166534", marginTop: 4, lineHeight: 1.6 }}>Solution: {q.solution}</p>}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRegenerateQuestion(sIdx, qIdx)}
                      disabled={regenerating === `${sIdx}-${qIdx}`}
                      style={{
                        background: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                        color: "#6B7280",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { e.target.style.borderColor = "#5B4FCF"; e.target.style.color = "#5B4FCF"; }}
                      onMouseLeave={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.color = "#6B7280"; }}
                    >
                      {regenerating === `${sIdx}-${qIdx}` ? "⏳" : "🔄"} Regen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer */}
          <div style={{ textAlign: "center", borderTop: "1px solid #E5E7EB", paddingTop: 16, marginTop: 16 }}>
            <p style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>Generated by IntelliTest</p>
          </div>
        </div>
      </div>
    </div>
  );
}
