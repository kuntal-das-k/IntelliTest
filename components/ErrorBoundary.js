"use client";

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F8F7FF",
            padding: "24px",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 480,
              width: "100%",
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1
              style={{
                fontWeight: 700,
                fontSize: 24,
                color: "#1E1B4B",
                marginBottom: 12,
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: "#6B7280",
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              An unexpected error occurred. Please refresh the page or try again
              later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div
                style={{
                  marginTop: 24,
                  padding: "16px",
                  background: "#FEF2F2",
                  borderRadius: 8,
                  textAlign: "left",
                  overflow: "auto",
                }}
              >
                <pre
                  style={{
                    fontSize: 12,
                    color: "#DC2626",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
