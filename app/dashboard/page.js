"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import UpgradeModal from "@/components/UpgradeModal";

export default function DashboardPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [papers, setPapers] = useState([]);
  const [papersLoading, setPapersLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const fetchPapers = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "papers"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setPapers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.warn("Composite query failed (index may be missing), using fallback:", err.message);
        try {
          const fallbackQ = query(
            collection(db, "papers"),
            where("userId", "==", user.uid)
          );
          const snap = await getDocs(fallbackQ);
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
          setPapers(docs);
        } catch (fallbackErr) {
          console.error("Fetch papers error:", fallbackErr);
        }
      }
      setPapersLoading(false);
    };
    fetchPapers();
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E5E7EB", borderTopColor: "#5B4FCF", borderRadius: "50%" }} className="animate-spin-slow" />
      </div>
    );
  }

  if (!user) return null;

  const isUnlimited = userData?.plan === "unlimited" && userData?.planExpiry && new Date(userData.planExpiry) > new Date();

  const handleGenerateClick = () => {
    if (!isUnlimited && (userData?.credits || 0) < 5) {
      setShowUpgrade(true);
    } else {
      router.push("/generate");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontWeight: 800, fontSize: 28, color: "#1E1B4B", marginBottom: 4 }}>
            Welcome back! 👋
          </h1>
          <p style={{ color: "#6B7280", fontSize: 15 }}>
            {userData?.phone ? `Phone: ${userData.phone}` : "Manage your papers and credits"}
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 36 }}>
          {/* Credits Card */}
          <div className="card" style={{ background: "linear-gradient(135deg, #5B4FCF, #7B71D9)", color: "white", padding: 28 }}>
            <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 500 }}>Credit Balance</div>
            <div style={{ fontSize: 36, fontWeight: 800, margin: "8px 0" }}>
              {isUnlimited ? "♾️" : userData?.credits ?? 0}
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {isUnlimited ? "Unlimited Plan Active" : `${Math.floor((userData?.credits || 0) / 5)} papers remaining`}
            </div>
          </div>

          {/* Plan Card */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Current Plan</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1E1B4B", margin: "8px 0", textTransform: "capitalize" }}>
              {userData?.plan || "Free"}
            </div>
            <button onClick={() => setShowUpgrade(true)} style={{ fontSize: 13, color: "#5B4FCF", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Upgrade Plan →
            </button>
          </div>

          {/* Papers Generated */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Papers Generated</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#1E1B4B", margin: "8px 0" }}>
              {papers.length}
            </div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>Total papers created</div>
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerateClick} className="btn-primary animate-pulse-glow" style={{ fontSize: 16, padding: "16px 36px", marginBottom: 40 }}>
          ✨ Generate New Paper
        </button>

        {/* Past Papers */}
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: "#1E1B4B", marginBottom: 20 }}>Past Papers</h2>
          {papersLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Loading papers...</div>
          ) : papers.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <p style={{ color: "#6B7280", fontSize: 15 }}>No papers generated yet. Create your first paper!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {papers.map((paper) => (
                <Link key={paper.id} href={`/paper/${paper.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#1E1B4B" }}>
                        {paper.header?.board} — {paper.header?.class}
                      </div>
                      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                        {paper.header?.chapter} • {paper.header?.totalMarks} marks • {new Date(paper.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <div style={{ color: "#5B4FCF", fontSize: 14, fontWeight: 600 }}>View →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
