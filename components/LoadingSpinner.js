"use client";

export default function LoadingSpinner({ message = "Generating your paper..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: 20,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          border: "4px solid #E5E7EB",
          borderTopColor: "#5B4FCF",
          borderRadius: "50%",
        }}
        className="animate-spin-slow"
      />
      <p style={{ color: "#6B7280", fontSize: 15, fontWeight: 500, textAlign: "center" }}>
        {message}
      </p>
    </div>
  );
}
