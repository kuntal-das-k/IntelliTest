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
    totalMarks: 50,
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
      if (!qpt[type]) qpt[type] = 3;
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

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontWeight: 800, fontSize: 28, color: "#1E1B4B", marginBottom: 8 }}>Generate Paper</h1>
        <p style={{ color: "#6B7280", fontSize: 15, marginBottom: 32 }}>Fill in the details to generate an AI-powered exam paper. Each generation costs 5 credits.</p>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#DC2626", fontSize: 14 }}>{error}</div>
        )}

        {generating ? (
          <div className="card" style={{ padding: 60 }}>
            <LoadingSpinner message="🤖 AI is crafting your exam paper... This may take 15-30 seconds." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
            {/* Board */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Board *</label>
              <select className="select-field" value={formData.board} onChange={(e) => setFormData({ ...formData, board: e.target.value, className: "" })} required>
                <option value="">Select Board</option>
                {Object.entries(BOARDS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Class *</label>
              <select className="select-field" value={formData.className} onChange={(e) => setFormData({ ...formData, className: e.target.value })} required disabled={!formData.board}>
                <option value="">Select Class</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Subject (hardcoded) */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Subject</label>
              <input type="text" className="input-field" value="Mathematics" disabled style={{ background: "#F9FAFB", color: "#6B7280" }} />
            </div>

            {/* Chapter */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Chapter *</label>
              <input type="text" className="input-field" placeholder='e.g. "Algebra", "Trigonometry", "Calculus"' value={formData.chapter} onChange={(e) => setFormData({ ...formData, chapter: e.target.value })} required />
            </div>

            {/* Question Types */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Question Types *</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {QUESTION_TYPES.map((type) => (
                  <label key={type.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: formData.questionTypes.includes(type.value) ? "2px solid #5B4FCF" : "2px solid #E5E7EB", background: formData.questionTypes.includes(type.value) ? "#F0EEFF" : "white", cursor: "pointer", transition: "all 0.2s", fontSize: 14, fontWeight: 500 }}>
                    <input type="checkbox" className="checkbox-custom" checked={formData.questionTypes.includes(type.value)} onChange={() => handleTypeToggle(type.value)} />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Questions per type */}
            {formData.questionTypes.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Number of Questions per Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {formData.questionTypes.map((type) => (
                    <div key={type}>
                      <label style={{ fontSize: 13, color: "#6B7280", marginBottom: 4, display: "block" }}>{type}</label>
                      <input type="number" className="input-field" min={1} max={20} value={formData.questionsPerType[type] || 3} onChange={(e) => setFormData({ ...formData, questionsPerType: { ...formData.questionsPerType, [type]: parseInt(e.target.value) || 1 } })} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Difficulty: <span style={{ color: "#5B4FCF", fontWeight: 700 }}>{formData.difficulty}</span></label>
              <input type="range" min={0} max={2} step={1} value={diffSlider} onChange={(e) => handleDiffSlider(parseInt(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                <span>Easy</span><span>Medium</span><span>Hard</span>
              </div>
            </div>

            {/* Total Marks */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Total Marks *</label>
              <input type="number" className="input-field" min={10} max={200} value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 50 })} required />
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Time Duration *</label>
              <select className="select-field" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required>
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* School Name */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">School/Institute Name <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span></label>
              <input type="text" className="input-field" placeholder="Shown on paper header" value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} />
            </div>

            {/* Date */}
            <div style={{ marginBottom: 28 }}>
              <label className="form-label">Exam Date</label>
              <input type="date" className="input-field" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }}>
              ✨ Generate Paper (5 credits)
            </button>
          </form>
        )}
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
