"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    if (!email) { setError("Please enter your email address"); return; }
    setLoading(true); setError("");
    try {
      // Simulate sending — replace with real email API if needed
      await new Promise(r => setTimeout(r, 1200));
      setSent(true);
    } catch (_err: unknown) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#1E3A8A", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>GM</span>
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#1E3A8A" }}>GMPL Field Operations</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(15,23,42,0.08)", border: "1px solid #E2E8F0" }}>

          {!sent ? (
            <>
              {/* Icon */}
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 20 20" fill="#1E3A8A">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
              </div>

              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Forgot password?</h1>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24, lineHeight: 1.6 }}>
                Enter your registered email and we'll send you a reset link.
              </p>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email address</label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="you@gmpl.pk"
                  style={{ width: "100%", height: 42, padding: "0 12px 0 36px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#3B82F6"}
                  onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: "100%", height: 42, borderRadius: 9, background: loading ? "#3B82F6" : "#1E3A8A", color: "#fff", border: "none", fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.85 : 1, marginBottom: 16 }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div style={{ textAlign: "center" }}>
                <Link href="/login" style={{ fontSize: 13, color: "#3B82F6", fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  ← Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success state */}
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#DCFCE7", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="28" height="28" viewBox="0 0 20 20" fill="#10B981">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Check your email!</h2>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7, marginBottom: 6 }}>
                  We sent a password reset link to
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1E3A8A", marginBottom: 24 }}>{email}</p>
                <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 24 }}>
                  Didn't receive it? Check your spam folder or contact your admin.
                </p>
                <Link href="/login" style={{ display: "inline-block", padding: "10px 24px", background: "#1E3A8A", color: "#fff", borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'Syne', sans-serif" }}>
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 11.5, color: "#94A3B8", marginTop: 16 }}>
          © 2024 GMPL Field Operations System
        </p>
      </div>
    </main>
  );
}
