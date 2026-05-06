"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/gmpl-logo/gmpl-360-logo.svg";
import Link from "next/link";

const ROLES = [
  { key: "admin", label: "Admin",            icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { key: "am",    label: "Area Manager",      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "tse",   label: "TSE/TSO",               icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { key: "ba",    label: "Brand Ambassador",  icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin/dashboard",
  am:    "/am/dashboard",
  tse:   "/tse/dashboard",
  ba:    "/ba/dashboard",
};

const FEATURES = [
  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", title: "GPS Attendance",       desc: "Verify field presence in real-time" },
  { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Live Sales Tracking", desc: "Track sales across 4 brands" },
  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Geo-Validation",      desc: "Validate store locations" },
  { icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", title: "Smart Reports",       desc: "Admin flagging & detailed reports" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role,         setRole]         = useState("ba");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState("");
  const [errorField,   setErrorField]   = useState<"email"|"password"|"role"|"account"|"">("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gmpl_remembered");
      if (saved) {
        const { savedEmail, savedRole } = JSON.parse(saved);
        if (savedEmail) setEmail(savedEmail);
        if (savedRole)  setRole(savedRole);
        setRememberMe(true);
      }
    } catch (_e: unknown) {}
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password"); setErrorField(""); return; }
    setError(""); setErrorField(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed. Please try again.");
        setErrorField(data.field || "");
        setLoading(false); return;
      }
      if (rememberMe) localStorage.setItem("gmpl_remembered", JSON.stringify({ savedEmail: email, savedRole: role }));
      else localStorage.removeItem("gmpl_remembered");
      setSuccess(true);
      setTimeout(() => router.push(data.redirect || ROLE_REDIRECTS[role] || "/ba/dashboard"), 800);
    } catch (_e: unknown) {
      setError("Connection error. Please try again.");
      setErrorField("");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 16px;
        }

        .login-card {
          width: 100%;
          max-width: 960px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }

        /* LEFT PANEL */
        .left-panel {
            background: linear-gradient(145deg, #042F49 0%, #073D5F 50%, #0B4F77 100%);
          padding: 44px 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: relative;
          overflow: hidden;
        }
        .left-panel::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%);
        }
        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
        }

        /* Globe decoration */
        .globe-wrap {
          position: absolute;
          top: 60px; right: -40px;
          width: 280px; height: 280px;
          opacity: 0.15;
        }

        .brand-row {
          display: flex; align-items: center; gap: 12px;
          position: relative; z-index: 1;
        }
        .brand-icon {
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.12);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .brand-name { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 16px; color: #fff; line-height: 1.2; }
        .brand-sub  { font-size: 10px; color: rgba(255,255,255,0.45); letter-spacing: 0.1em; text-transform: uppercase; }

        .hero-text { position: relative; z-index: 1; }
        .hero-text h1 {
          font-family: 'Poppins', sans-serif;
          font-size: 52px; font-weight: 800;
          padding-top:60px;
          color: #fff; line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .hero-text h1 span { color: #63A0C4; }
        .hero-text p { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.65; max-width: 300px; }

        .features-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          position: relative; z-index: 1;
        }
        .feature-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px;
          transition: background 0.2s;
        }
        .feature-card:hover { background: rgba(255,255,255,0.1); }
        .feature-icon {
          width: 32px; height: 32px;
          background: #0d527a;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px;
        }
        .feature-title { font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .feature-desc  { font-size: 10.5px; color: rgba(255,255,255,0.45); line-height: 1.4; }

        .signup-btn:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.35); }

        /* RIGHT PANEL */
        .right-panel {
          background: #fff;
          padding: 44px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0;
        }

        .online-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(16,185,129,0.25);
          margin-bottom: 20px; width: fit-content;
        }
        .online-dot { width: 7px; height: 7px; border-radius: 50%; background: #10B981; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .online-text { font-size: 11px; font-weight: 600; color: #065f46; letter-spacing: 0.04em; }

        .welcome-title { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.02em; margin-bottom: 4px; }
        .welcome-sub   { font-size: 13px; color: #64748B; margin-bottom: 24px; }

        .section-label { font-size: 12px; font-weight: 600; color: #0F172A; margin-bottom: 10px; font-family: 'Poppins', sans-serif; }

        .roles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .role-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 14px; border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #fff; cursor: pointer;
          font-size: 12.5px; font-weight: 500; color: #64748B;
          transition: all 0.18s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .role-btn:hover { border-color: #1E3A8A; color: #1E3A8A; background: rgba(30,58,138,0.04); }
        .role-btn.active { border-color: #1E3A8A; background: rgba(30,58,138,0.06); color: #1E3A8A; font-weight: 700; }
        .role-btn svg { flex-shrink: 0; }

        .error-box {
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 10px; padding: 10px 14px;
          font-size: 12.5px; color: #DC2626; font-weight: 500;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .success-box {
          background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25);
          border-radius: 10px; padding: 10px 14px;
          font-size: 12.5px; color: #065f46; font-weight: 500;
          margin-bottom: 14px;
        }

        .input-group { margin-bottom: 14px; }
        .input-label { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block; }
        .input-wrap {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid #E2E8F0; border-radius: 10px;
          padding: 0 14px; background: #F8FAFC; height: 46px;
          transition: border-color 0.2s;
        }
        .input-wrap:focus-within { border-color: #1E3A8A; background: #fff; }
        .input-wrap input {
          flex: 1; border: none; background: transparent;
          font-size: 13.5px; color: #0F172A; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .input-wrap input::placeholder { color: #94A3B8; }
        .eye-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; }

        .row-flex { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; margin-top: 2px; }
        .remember-wrap { display: flex; align-items: center; gap: 7px; cursor: pointer; }
        .remember-wrap input[type=checkbox] { width: 15px; height: 15px; accent-color: #1E3A8A; cursor: pointer; }
        .remember-wrap span { font-size: 12.5px; color: #475569; }
        .forgot-link { font-size: 12.5px; color: #0D4066; font-weight: 500; text-decoration: none; }
        .forgot-link:hover { color: #0D4066; }

        .login-btn {
          width: 100%; height: 48px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #0D4066 0%, #1571AE 100%);
          color: #fff; font-size: 14px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; margin-bottom: 10px;
          font-family: 'Poppins', sans-serif; letter-spacing: 0.02em;
          box-shadow: 0 4px 16px rgba(30,58,138,0.35);
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,138,0.45); }
        .login-btn:disabled { opacity: 0.75; cursor: not-allowed; transform: none; }

        .create-btn {
          width: 100%; height: 44px; border-radius: 12px;
          border: 1.5px solid #E2E8F0; background: #fff;
          color: #0D4567; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          text-decoration: none; transition: all 0.2s; margin-bottom: 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .create-btn:hover { border-color: #1E3A8A; color: #1E3A8A; background: rgba(30,58,138,0.04); }

        .trust-row { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 12px; }
        .trust-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #94A3B8; }
        .footer-text { text-align: center; font-size: 11.5px; color: #CBD5E1; }
        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .divider-line { flex: 1; height: 1px; background: #E2E8F0; }
        .divider-text { font-size: 11px; color: #94A3B8; white-space: nowrap; }

        /* Spinner */
        .spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Responsive */
        @media(max-width:768px) {
          .login-root { padding: 0; align-items: stretch; }
          .login-card { border-radius: 0; min-height: 100vh; grid-template-columns: 1fr; max-width: 100%; }
          .left-panel { display: none; }
          .right-panel { padding: 32px 24px; min-height: 100vh; }
          .roles-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width:400px) {
          .right-panel { padding: 24px 16px; }
          .roles-grid { grid-template-columns: 1fr 1fr; }
          .welcome-title { font-size: 22px; }
          .login-btn { font-size: 13px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          {/* ── LEFT PANEL ── */}
          <div className="left-panel">
            {/* Globe SVG */}
            <svg className="globe-wrap" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="150" cy="150" r="140" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <circle cx="150" cy="150" r="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <circle cx="150" cy="150" r="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <ellipse cx="150" cy="150" rx="140" ry="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <ellipse cx="150" cy="150" rx="140" ry="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <line x1="10" y1="150" x2="290" y2="150" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <circle cx="150" cy="80" r="6" fill="#1570A6" opacity="0.8"/>
              <circle cx="200" cy="160" r="4" fill="#10537C" opacity="0.8"/>
              <circle cx="100" cy="190" r="5" fill="#1570A6" opacity="0.6"/>
            </svg>

            {/* Brand */}
            <div className="brand-row">
              {/* <div className="brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#63A0C4" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div> */}
              <div>
                   <Image src={Logo} alt="TrackForce Logo" width={250} height={50} />
                {/* <div className="brand-name">GLOBAL MARKS</div>
                <div className="brand-sub">PVT. LTD.</div> */}
              </div>
            </div>

            {/* Hero */}
            <div className="hero-text">
              <h1>Track. Sell.<br/><span>Succeed.</span></h1>
              <p>Real-time field operations powered by GPS, live sales data, and intelligent tracking — all in one platform.</p>
            </div>

            {/* Feature cards */}
            <div className="features-grid">
              {FEATURES.map(f => (
                <div className="feature-card" key={f.title}>
                  <div className="feature-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#63A0C4" strokeWidth="1.8">
                      <path d={f.icon} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="right-panel">
            <div className="online-badge">
              <div className="online-dot" />
              <span className="online-text">System Online</span>
            </div>

            <div className="welcome-title">Welcome back</div>
            <div className="welcome-sub">Sign in to your GMPL account to continue</div>

            <div className="section-label">Sign in as</div>
            <div className="roles-grid">
              {ROLES.map(r => (
                <button key={r.key} className={`role-btn ${role === r.key ? "active" : ""}`} onClick={() => setRole(r.key)}>
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={r.icon}/>
                  </svg>
                  {r.label}
                </button>
              ))}
            </div>

            {error   && <div className="error-box"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>{error}</div>}
            {success && <div className="success-box">✓ Login successful — redirecting to dashboard...</div>}

            {errorField === "role" && (
              <div style={{ fontSize:11, color:"#D97706", background:"#FEF3C7", border:"1px solid #FDE68A", borderRadius:8, padding:"7px 12px", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                Please select the role that matches your account above
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email address</label>
              <div className="input-wrap" style={{ borderColor: errorField==="email" ? "#EF4444" : undefined, background: errorField==="email" ? "#FEF2F2" : undefined }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill={errorField==="email" ? "#EF4444" : "#94A3B8"}><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                <input type="email" placeholder="you@gmpl.pk" value={email} onChange={e => { setEmail(e.target.value); setError(""); setErrorField(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                {errorField==="email" && <svg width="14" height="14" viewBox="0 0 20 20" fill="#EF4444"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrap" style={{ borderColor: errorField==="password" ? "#EF4444" : undefined, background: errorField==="password" ? "#FEF2F2" : undefined }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill={errorField==="password" ? "#EF4444" : "#94A3B8"}><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => { setPassword(e.target.value); if(errorField==="password"){setError("");setErrorField("");} }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <svg width="15" height="15" viewBox="0 0 20 20" fill="#94A3B8"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 20 20" fill="#94A3B8"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  }
                </button>
              </div>
              {errorField==="password" && (
                <div style={{ fontSize:11, color:"#EF4444", marginTop:5, display:"flex", alignItems:"center", gap:5 }}>
                  <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  Wrong password — <a href="/forget-password" style={{ color:"#3B82F6", fontWeight:600 }}>Reset it here</a>
                </div>
              )}
            </div>

            <div className="row-flex">
              <label className="remember-wrap">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <span>Remember me</span>
              </label>
              <a href="/forget-password" className="forgot-link">Forgot password?</a>
            </div>

            <button className="login-btn" onClick={handleLogin} disabled={loading || success}>
              {loading ? <div className="spinner"/> : <>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Sign in to Dashboard →
              </>}
            </button>

            <a href="/signup" className="create-btn">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/></svg>
              Create New Account
            </a>

            <div className="divider">
              <div className="divider-line"/>
              <span className="divider-text">Global Marks Pvt Ltd</span>
              <div className="divider-line"/>
            </div>

            <div className="trust-row">
              <div className="trust-item">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="#10B981"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Secure Login
              </div>
              <div className="trust-item">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="#3B82F6"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                Encrypted Access
              </div>
              <div className="trust-item">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="#10B981"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Authorized System
              </div>
            </div>

            <div className="footer-text">© 2024 GMPL Field Operations System</div>
          </div>

        </div>
      </div>
    </>
  );
}