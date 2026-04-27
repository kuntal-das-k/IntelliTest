"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, addDoc, collection } from "firebase/firestore";
import { BOARDS, QUESTION_TYPES, DURATIONS, DIFFICULTY_LEVELS } from "@/lib/boardConfig";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import UpgradeModal from "@/components/UpgradeModal";

export default function GeneratePage() {
  const { user, userData, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    board: "",
    className: "",
    chapter: "",
    questionTypes: [],
    questionsPerType: {},
    difficulty: "Medium",
    totalMarks: "",
    duration: "2 hours",
    schoolName: "",
    date: "",
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [diffSlider, setDiffSlider] = useState(1);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const availableClasses = formData.board ? BOARDS[formData.board]?.classes || [] : [];

  const handleTypeToggle = (type) => {
    const types = formData.questionTypes.includes(type)
      ? formData.questionTypes.filter((t) => t !== type)
      : [...formData.questionTypes, type];
    const qpt = { ...formData.questionsPerType };
    if (types.includes(type)) {
      if (!qpt[type]) qpt[type] = "";
    } else {
      delete qpt[type];
    }
    setFormData({ ...formData, questionTypes: types, questionsPerType: qpt });
  };

  const handleDiffSlider = (val) => {
    setDiffSlider(val);
    const levels = ["Easy", "Medium", "Hard"];
    setFormData({ ...formData, difficulty: levels[val] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isUnlimited = userData?.plan === "unlimited" && userData?.planExpiry && new Date(userData.planExpiry) > new Date();

    if (!isUnlimited && (userData?.credits || 0) < 5) {
      setShowUpgrade(true);
      return;
    }

    if (!formData.board || !formData.className || !formData.chapter || formData.questionTypes.length === 0) {
      setError("Please fill all required fields and select at least one question type.");
      return;
    }

    // Validate that questions per type is filled for each selected question type
    const missingQuestionCount = formData.questionTypes.some(type => !formData.questionsPerType[type] || formData.questionsPerType[type] <= 0);
    if (missingQuestionCount) {
      setError("Please specify the number of questions for each selected question type.");
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate paper");
      }

      // Deduct credits only after successful generation (skip for unlimited)
      if (!isUnlimited) {
        const userRef = doc(db, "users", user.uid);
        // Ensure user doc exists before updating
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            credits: 10,
            plan: "free",
            planExpiry: null,
            createdAt: new Date().toISOString(),
          });
        }
        await updateDoc(userRef, { credits: increment(-5) });
        await refreshUserData();
      }

      // Save paper to Firestore
      const paperDoc = await addDoc(collection(db, "papers"), {
        userId: user.uid,
        ...data.paper,
        formData: formData,
        createdAt: new Date().toISOString(),
      });

      router.push(`/paper/${paperDoc.id}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }

    setGenerating(false);
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 40, height: 40, border: "3px solid #E5E7EB", borderTopColor: "#5B4FCF", borderRadius: "50%" }} className="animate-spin-slow" /></div>;
  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ fontWeight: 800, fontSize: 24, color: "#1E1B4B", marginBottom: 6 }}>Generate Paper</h1>
        <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>Fill in the details to generate an AI-powered exam paper. Each generation costs 5 credits.</p>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#DC2626", fontSize: 13 }}>{error}</div>
        )}

        {generating ? (
          <div className="card" style={{ padding: 40 }}>
            <LoadingSpinner message="🤖 AI is crafting your exam paper... This may take 15-30 seconds." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
            {/* Board */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Board *</label>
              <select className="select-field" value={formData.board} onChange={(e) => setFormData({ ...formData, board: e.target.value, className: "" })} required style={{ fontSize: 14, padding: "10px 12px" }}>
                <option value="">Select Board</option>
                {Object.entries(BOARDS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Class *</label>
              <select className="select-field" value={formData.className} onChange={(e) => setFormData({ ...formData, className: e.target.value })} required disabled={!formData.board} style={{ fontSize: 14, padding: "10px 12px" }}>
                <option value="">Select Class</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Chapter *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Algebra, Geometry, Calculus"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                required
                style={{ fontSize: 14, padding: "10px 12px" }}
              />
            </div>

            {/* Question Types */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Question Types *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeToggle(type.value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: formData.questionTypes.includes(type.value) ? "2px solid #5B4FCF" : "2px solid #E5E7EB",
                      background: formData.questionTypes.includes(type.value) ? "#5B4FCF" : "white",
                      color: formData.questionTypes.includes(type.value) ? "white" : "#374151",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions per type */}
            {formData.questionTypes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Number of Questions per Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {formData.questionTypes.map((type) => (
                    <div key={type}>
                      <label style={{ fontSize: 12, color: "#6B7280", marginBottom: 4, display: "block" }}>{type}</label>
                      <input
                        type="number"
                        className="input-field"
                        min={1}
                        max={20}
                        placeholder="e.g., 3, 5, 10"
                        value={formData.questionsPerType[type] || ""}
                        onChange={(e) => setFormData({ ...formData, questionsPerType: { ...formData.questionsPerType, [type]: parseInt(e.target.value) || "" } })}
                        style={{ fontSize: 14, padding: "10px 12px" }}
                      />
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        {[3, 5, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setFormData({ ...formData, questionsPerType: { ...formData.questionsPerType, [type]: num } })}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid #E5E7EB",
                              background: formData.questionsPerType[type] === num ? "#5B4FCF" : "white",
                              color: formData.questionsPerType[type] === num ? "white" : "#6B7280",
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (formData.questionsPerType[type] !== num) {
                                e.currentTarget.style.borderColor = "#5B4FCF";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (formData.questionsPerType[type] !== num) {
                                e.currentTarget.style.borderColor = "#E5E7EB";
                              }
                            }}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Difficulty: <span style={{ color: "#5B4FCF", fontWeight: 700 }}>{formData.difficulty}</span></label>
              <input type="range" min={0} max={2} step={1} value={diffSlider} onChange={(e) => handleDiffSlider(parseInt(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                <span>Easy</span><span>Medium</span><span>Hard</span>
              </div>
            </div>

            {/* Total Marks */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Total Marks *</label>
              <input
                type="number"
                className="input-field"
                min={10}
                max={200}
                placeholder="e.g., 50, 80, 100"
                value={formData.totalMarks || ""}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || "" })}
                required
                style={{ fontSize: 14, padding: "10px 12px" }}
              />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {[50, 80, 100].map((marks) => (
                  <button
                    key={marks}
                    type="button"
                    onClick={() => setFormData({ ...formData, totalMarks: marks })}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "1px solid #E5E7EB",
                      background: formData.totalMarks === marks ? "#5B4FCF" : "white",
                      color: formData.totalMarks === marks ? "white" : "#6B7280",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (formData.totalMarks !== marks) {
                        e.currentTarget.style.borderColor = "#5B4FCF";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.totalMarks !== marks) {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }
                    }}
                  >
                    {marks}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Time Duration *</label>
              <select className="select-field" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required style={{ fontSize: 14, padding: "10px 12px" }}>
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* School Name */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">School/Institute Name <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span></label>
              <input type="text" className="input-field" placeholder="Shown on paper header" value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} style={{ fontSize: 14, padding: "10px 12px" }} />
            </div>

            {/* Date */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Exam Date</label>
              <input type="date" className="input-field" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ fontSize: 14, padding: "10px 12px" }} />
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: 12, fontSize: 15 }}>
              ✨ Generate Paper (5 credits)
            </button>
          </form>
        )}
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
