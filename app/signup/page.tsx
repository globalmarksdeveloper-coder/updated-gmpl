"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/gmpl-logo/gmpl-360-logo.svg";

const ROLES = [
  { key: "admin", label: "Admin",           icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { key: "am",    label: "Area Manager",     icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "tse",   label: "TSE/TSO",              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { key: "ba",    label: "Brand Ambassador", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const BANKS = [
  "Meezan Bank","HBL","UBL","MCB","Allied Bank","Bank Alfalah","Faysal Bank",
  "Standard Chartered","Askari Bank","Bank of Punjab","NBP","Soneri Bank",
  "Silk Bank","JS Bank","Habib Metro","Bank Al-Habib","Summit Bank",
  "SadaPay","NayaPay","EasyPaisa","JazzCash","Neon","Other"
];

export default function SignupPage() {
  const [role,        setRole]        = useState("ba");
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [password,    setPassword]    = useState("");
  const [cnic,        setCnic]        = useState("");
  const [fatherName,  setFatherName]  = useState("");
  const [address,     setAddress]     = useState("");
  const [bankName,    setBankName]    = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [iban,        setIban]        = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const router = useRouter();
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [strength,    setStrength]    = useState({ w:"0%", c:"#94A3B8", l:"Enter a password" });

  const isBA = role === "ba";

  const formatCNIC = (v: string) => {
    const d = v.replace(/\D/g,"").slice(0,13);
    if (d.length<=5) return d;
    if (d.length<=12) return `${d.slice(0,5)}-${d.slice(5)}`;
    return `${d.slice(0,5)}-${d.slice(5,12)}-${d.slice(12)}`;
  };

  const checkStrength = (val: string) => {
    if (!val) { setStrength({w:"0%",c:"#94A3B8",l:"Enter a password"}); return; }
    let s=0;
    if(val.length>=8)s++; if(/[A-Z]/.test(val))s++; if(/[0-9]/.test(val))s++; if(/[^A-Za-z0-9]/.test(val))s++;
    const m=[{w:"25%",c:"#ef4444",l:"Weak"},{w:"50%",c:"#f59e0b",l:"Fair"},{w:"75%",c:"#3B82F6",l:"Good"},{w:"100%",c:"#10B981",l:"Strong"}];
    setStrength(m[s-1]||m[0]);
  };

  const handleSignup = async () => {
    setError("");
    const cleanPhone = phone.replace(/[\s\-]/g,"");
    if (!firstName) { setError("First name is required"); return; }
    if (!cleanPhone||!/^03\d{9}$/.test(cleanPhone)) { setError("Phone must be 11 digits starting with 03"); return; }
    if (!password) { setError("Password is required"); return; }
    if (isBA) {
      if (!cnic||!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) { setError("CNIC format: 12345-1234567-1"); return; }
      if (!fatherName) { setError("Father/Husband name is required"); return; }
      if (!bankName) { setError("Please select a bank"); return; }
      if (!bankAccount&&!iban) { setError("Enter bank account number or IBAN"); return; }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName,lastName,email,phone:cleanPhone,password,role,cnic,fatherName,address,bankName,bankAccount,iban})});
      const data = await res.json();
      setLoading(false);
      if (res.ok) { setSuccess(true); setTimeout(() => router.push("/login"), 2000); }
      else setError(data.message||"Signup failed");
    } catch(_e:unknown){ setLoading(false); setError("Connection error. Please try again."); }
  };

  return (
    <>
      <style>{`
        /* ── CSS Variables ── */
        :root {
          --brand-1: #126291;
          --brand-2: #1570a6;
          --brand-3: #10537c;
          --brand-4: #0d4567;

          --brand-1-20: rgba(18,98,145,0.20);
          --brand-2-10: rgba(21,112,166,0.10);
          --brand-4-07: rgba(13,69,103,0.07);
          --brand-4-04: rgba(13,69,103,0.04);

          --success:        #3290c7;
          --success-bg:     rgba(16,185,129,0.08);
          --success-border: rgba(16,185,129,0.25);
          --success-text:   #065f46;
          --success-20:     rgba(16,185,129,0.20);
          --success-12:     rgba(16,185,129,0.12);
          --success-40:     rgba(16,185,129,0.40);

          --danger:      #EF4444;
          --danger-bg:   #FEF2F2;
          --danger-border:#FECACA;
          --danger-text: #DC2626;

          --warning:     #F59E0B;
          --info:        #0d4567;
          --info-focus:  rgba(59,130,246,0.10);

          --white:   #ffffff;
          --surface: #F8FAFC;
          --bg:      #F1F5F9;
          --border:  #E2E8F0;

          --text-primary:   #0F172A;
          --text-secondary: #374151;
          --text-muted:     #64748B;
          --text-subtle:    #94A3B8;

          --lp-bg-from: #0d4567;
          --lp-bg-mid:  #0d4567;
          --lp-bg-to:   #10537c;
          --lp-circle1: rgba(21, 112, 166, 0.2);
          --lp-circle2: rgba(16,185,129,0.12);
          --lp-tag:     rgba(255,255,255,0.4);
          --lp-text:    rgba(255,255,255,0.72);
          --lp-dim:     rgba(255,255,255,0.55);
          --lp-dimmer:  rgba(255,255,255,0.35);
          --lp-faint:   rgba(255,255,255,0.45);
          --lp-border:  rgba(255,255,255,0.2);
          --lp-border2: rgba(255,255,255,0.08);
          --lp-border3: rgba(255,255,255,0.3);
          --lp-bg-card: rgba(255,255,255,0.12);
          --lp-bg-card2:rgba(255,255,255,0.05);
          --lp-bg-btn:  rgba(255,255,255,0.07);
          --lp-divider: rgba(255,255,255,0.1);
          --lp-sub:     rgba(255,255,255,0.5);
          --lp-hint:    rgba(255,255,255,0.4);

          --shadow-card: 0 20px 60px rgba(15,23,42,0.14);
          --shadow-btn:  0 4px 14px rgba(13,69,103,0.30);
          --shadow-btn-h:0 6px 18px rgba(16,185,129,0.45);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}

        .sw{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
        .sg{width:100%;max-width:1000px;display:grid;grid-template-columns:5fr 8fr;border-radius:20px;overflow:hidden;box-shadow:var(--shadow-card);border:1px solid var(--border);}

        /* LEFT */
        .lp{background:linear-gradient(160deg,var(--lp-bg-from) 0%,var(--lp-bg-mid) 60%,var(--lp-bg-to) 100%);padding:44px 36px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;min-height:560px}
        .lp-circle1{position:absolute;top:-80px;right:-80px;width:260px;height:260px;border-radius:50%;background:var(--lp-circle1);pointer-events:none}
        .lp-circle2{position:absolute;bottom:-60px;left:-60px;width:220px;height:220px;border-radius:50%;background:var(--lp-circle2);pointer-events:none}
        .lp-tag{font-size:9.5px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--lp-tag);position:relative;z-index:1}
        .lp-hero{position:relative;z-index:1}
        .lp-hero h2{font-size:28px;font-weight:800;color:#fff;line-height:1.18;letter-spacing:-0.02em;margin-bottom:10px}
        .lp-hero h2 span{color:var(--success)}
        .lp-hero p{font-size:12.5px;color:var(--lp-sub);line-height:1.65;max-width:260px}
        .lp-bullets{position:relative;z-index:1;display:flex;flex-direction:column;gap:8px}
        .lp-bullet{display:flex;align-items:center;gap:9px;font-size:12px;color:var(--lp-text)}
        .lp-dot{width:6px;height:6px;border-radius:50%;background:var(--success);flex-shrink:0}

        /* RIGHT */
        .rp{background:var(--surface);padding:28px 36px;display:flex;flex-direction:column;overflow-y:auto;max-height:100vh}
        .badge{margin-bottom:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:20px;background:var(--success-bg);border:1px solid var(--success-border);font-size:10px;font-weight:600;color:var(--success-text);letter-spacing:0.04em;margin-bottom:12px;width:fit-content}
        .badge-dot{width:5px;height:5px;border-radius:50%;background:var(--success)}
        .rp h1{font-size:21px;font-weight:800;color:var(--text-primary);letter-spacing:-0.02em;margin-bottom:3px}
        .rp-sub{font-size:12.5px;color:var(--text-muted);margin-bottom:12px}

        /* Section header */
        .sec-hdr{display:flex;align-items:center;gap:8px;margin:10px 0 8px}
        .sec-line{flex:1;height:1px;background:var(--border)}
        .sec-txt{font-size:10px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap}

        /* Roles */
        .roles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
        .role-btn{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--border);background:var(--white);cursor:pointer;font-size:12.5px;font-weight:500;color:var(--text-muted);transition:all 0.18s;}
        .role-btn:hover{border-color:var(--brand-4);color:var(--brand-4);background:var(--brand-4-04)}
        .role-btn.active{border-color:var(--brand-4);background:var(--brand-4-07);color:var(--brand-4);font-weight:700}

        /* Form grid */
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}

        /* Field */
        .field{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}
        .field-lbl{font-size:11.5px;font-weight:600;color:var(--text-secondary);letter-spacing:0.01em}
        .field-lbl span{color:var(--danger)}
        .field-lbl .opt{color:var(--text-subtle);font-size:10px;font-weight:400}
        .inp-wrap{position:relative;display:flex;align-items:center}
        .inp-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--text-subtle);display:flex;pointer-events:none;z-index:1}
        .inp{width:100%;height:40px;padding:0 12px 0 36px;border-radius:10px;border:1.5px solid var(--border);background:var(--white);font-size:13px;color:var(--text-primary);outline:none;transition:all 0.18s}
        .inp:focus{border-color:var(--info);box-shadow:0 0 0 3px var(--info-focus);background:var(--white)}
        .inp.no-ico{padding-left:12px}
        .sel{width:100%;height:40px;padding:0 12px 0 36px;border-radius:10px;border:1.5px solid var(--border);background:var(--white);font-size:13px;color:var(--text-primary);outline:none;transition:all 0.18s;cursor:pointer;appearance:none}
        .sel:focus{border-color:var(--info);box-shadow:0 0 0 3px var(--info-focus)}
        .pw-toggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-subtle);display:flex;padding:3px}

        /* Strength bar */
        .str-bar{height:4px;border-radius:4px;background:var(--border);margin-top:4px;overflow:hidden}
        .str-fill{height:100%;border-radius:4px;transition:width 0.3s,background 0.3s}
        .str-lbl{font-size:10.5px;margin-top:3px}

        /* Hint */
        .hint{font-size:10px;color:var(--text-subtle);margin-top:2px}

        /* Alert */
        .alert{display:flex;align-items:flex-start;gap:8px;padding:10px 13px;border-radius:10px;font-size:12.5px;font-weight:500;margin-bottom:12px}
        .alert.err{background:var(--danger-bg);border:1px solid var(--danger-border);color:var(--danger-text)}
        .alert.ok{background:var(--success-bg);border:1px solid var(--success-border);color:var(--success-text)}

        /* Submit */
        .sub-btn{width:100%;height:44px;border-radius:10px;background:var(--brand-4);color:#fff;font-size:14px;font-weight:700;border:none;cursor:pointer;letter-spacing:0.02em;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;box-shadow:var(--shadow-btn)}
        .sub-btn:hover:not(:disabled){background:linear-gradient(135deg,#047857 0%,#059669 100%);transform:translateY(-1px);box-shadow:var(--shadow-btn-h)}
        .sub-btn:disabled{opacity:0.75;cursor:not-allowed;transform:none}

        .footer-row{display:flex;align-items:center;gap:8px;margin:14px 0 8px}
        .footer-line{flex:1;height:1px;background:var(--border)}
        .footer-txt{font-size:11px;color:var(--text-subtle)}
        .signin-row{text-align:center;font-size:12.5px;color:var(--text-muted)}
        .signin-link{color:var(--brand-2);font-weight:600;text-decoration:none}
        .signin-link:hover{color:var(--brand-4)}

        /* No scroll */
        html,body{height:100%;overflow:hidden}
        .sw{height:100vh;display:flex;align-items:center;justify-content:center;padding:12px;overflow:hidden}
        .sg{width:100%;max-width:1040px;height:calc(100vh - 24px);display:grid;grid-template-columns:5fr 8fr;border-radius:20px;overflow:hidden;box-shadow:var(--shadow-card);border:1px solid var(--border)}
        .lp{height:100%;overflow:hidden}
        .rp{height:100%;overflow-y:auto;scrollbar-width:none}
        .rp::-webkit-scrollbar{display:none}

        /* ── Responsive ── */
        @media(max-width:900px){
          .sg{grid-template-columns:1fr 1fr}
        }
        @media(max-width:768px){
          html,body{overflow:auto}
          .sw{height:auto;min-height:100vh;padding:0;align-items:flex-start}
          .sg{grid-template-columns:1fr;border-radius:0;box-shadow:none;border:none;height:auto}
          .lp{display:none}
          .rp{padding:24px 18px;height:auto;overflow-y:visible}
          .g3{grid-template-columns:1fr 1fr}
        }
        @media(max-width:480px){
          .rp{padding:20px 14px}
          .g2{grid-template-columns:1fr}
          .g3{grid-template-columns:1fr}
          .roles{grid-template-columns:1fr 1fr}
          .rp h1{font-size:18px}
        }
        @media(max-width:360px){
          .roles{grid-template-columns:1fr}
          .rp{padding:16px 12px}
        }
      `}</style>

      <div className="sw">
        
        <div className="sg">
                  {/* Brand */}
           

          {/* ── LEFT ── */}
          <div className="lp">
            <div className="lp-circle1"/><div className="lp-circle2"/>

            {/* Tag */}
            <div className="brand-row">
              <div>
              <Image src={Logo}  alt="TrackForce Logo" width={250} height={50} />

              </div>
            </div>


            {/* Hero */}
            <div className="lp-hero">
              <h2>Join the<br/><span>Field Team.</span></h2>
              <p>Create your account and start tracking field operations today.</p>
            </div>

            {/* Role icon links */}
            <div style={{position:"relative",zIndex:1}}>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--lp-dimmer)",marginBottom:10}}>Register as</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {key:"admin", label:"Admin",           icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color:"#3B82F6"},
                  {key:"am",    label:"Area Manager",    icon:"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",                                                                      color:"#8B5CF6"},
                  {key:"tse",   label:"TSE/TSO",             icon:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",                                                                              color:"#F59E0B"},
                  {key:"ba",    label:"Brand Ambassador",icon:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",                                                                                                                            color:"#10B981"},
                ].map(r=>(
                  <div key={r.key} onClick={()=>setRole(r.key)}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"12px 8px",borderRadius:12,cursor:"pointer",
                      background: role===r.key ? "var(--lp-bg-card)" : "var(--lp-bg-card2)",
                      border: `1.5px solid ${role===r.key ? "var(--lp-border3)" : "var(--lp-border2)"}`,
                      transition:"all 0.18s"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:`${r.color}22`,border:`1.5px solid ${r.color}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={r.icon}/></svg>
                    </div>
                    <span style={{fontSize:11,fontWeight: role===r.key ? 700 : 500,color: role===r.key ? "#fff" : "var(--lp-dim)",textAlign:"center",lineHeight:1.2}}>{r.label}</span>
                    {role===r.key && <div style={{width:20,height:2,borderRadius:2,background:r.color}}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Guidelines */}
            <div style={{position:"relative",zIndex:1}}>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--lp-dimmer)",marginBottom:8}}>Guidelines</p>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {[
                  "Your account requires admin approval before login",
                  "Use a strong password with 8+ characters",
                  "Brand Ambassadors must provide CNIC & bank details",
                  "Ensure your phone number starts with 03",
                ].map((g,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7}}>
                    <div style={{width:16,height:16,borderRadius:"50%",background:"var(--success-20)",border:"1px solid var(--success-40)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                      <span style={{fontSize:8,fontWeight:800,color:"var(--success)"}}>{i+1}</span>
                    </div>
                    <span style={{fontSize:11,color:"var(--lp-dim)",lineHeight:1.5}}>{g}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Field icons */}
            <div style={{position:"relative",zIndex:1}}>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--lp-dimmer)",marginBottom:8}}>What you will need</p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[
                  {icon:"M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z", tip:"Full Name", c:"#3B82F6"},
                  {icon:"M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z", tip:"Phone", c:"#10B981"},
                  {icon:"M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z", tip:"Password", c:"#F59E0B"},
                  {icon:"M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z", tip:"CNIC (BA)", c:"#8B5CF6"},
                  {icon:"M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z", tip:"Bank (BA)", c:"#EF4444"},
                ].map(item=>(
                  <div key={item.tip} title={item.tip} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:38,height:38,borderRadius:10,background:`${item.c}18`,border:`1.5px solid ${item.c}33`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                    </div>
                    <span style={{fontSize:9.5,color:"var(--lp-faint)",fontWeight:500,textAlign:"center"}}>{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div style={{position:"relative",zIndex:1,borderTop:"1px solid var(--lp-divider)",paddingTop:12}}>
              <p style={{fontSize:11,color:"var(--lp-hint)",marginBottom:8}}>Already have an account?</p>
              <a href="/login" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:9,border:"1.5px solid var(--lp-border)",background:"var(--lp-bg-btn)",color:"#fff",fontSize:12,fontWeight:600,textDecoration:"none"}}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Sign in to your account
              </a>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="rp">
            <div className="badge"><span className="badge-dot"/>Registration open</div>
            <h1>Create account</h1>
            <p className="rp-sub">Fill in your details to request access</p>

            {error   && <div className="alert err"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{flexShrink:0,marginTop:1}}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>{error}</div>}
            {success && <div className="alert ok"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{flexShrink:0,marginTop:1}}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>Account request sent! Admin will review within 24 hours.</div>}

            {/* Role */}
            <div className="field" style={{marginBottom:14}}>
              <span className="field-lbl">Register as</span>
              <div className="roles">
                {ROLES.map(r=>(
                  <button key={r.key} className={`role-btn${role===r.key?" active":""}`} onClick={()=>{setRole(r.key);setError("");}}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={r.icon}/></svg>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="g2">
              <div className="field">
                <label className="field-lbl">First name <span>*</span></label>
                <div className="inp-wrap">
                  <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg></span>
                  <input className="inp" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Ayesha"/>
                </div>
              </div>
              <div className="field">
                <label className="field-lbl">Last name</label>
                <div className="inp-wrap">
                  <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg></span>
                  <input className="inp" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Kamran"/>
                </div>
              </div>
            </div>

            {/* Phone + Email */}
            <div className="g2">
              <div className="field">
                <label className="field-lbl">Phone <span>*</span></label>
                <div className="inp-wrap">
                  <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" clipRule="evenodd"/></svg></span>
                  <input className="inp" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,11))} placeholder="03001234567" maxLength={11}/>
                </div>
              </div>
              <div className="field">
                <label className="field-lbl">Email <span className="opt">(optional)</span></label>
                <div className="inp-wrap">
                  <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg></span>
                  <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@gmpl.pk"/>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="field" style={{marginBottom:0}}>
              <label className="field-lbl">Password <span>*</span></label>
              <div className="inp-wrap">
                <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg></span>
                <input className="inp" style={{paddingRight:38}} type={showPw?"text":"password"} value={password} onChange={e=>{setPassword(e.target.value);checkStrength(e.target.value);}} placeholder="Min 8 characters"/>
                <button className="pw-toggle" onClick={()=>setShowPw(p=>!p)}>
                  {showPw
                    ? <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  }
                </button>
              </div>
              <div className="str-bar"><div className="str-fill" style={{width:strength.w,background:strength.c}}/></div>
              <p className="str-lbl" style={{color:strength.c}}>{strength.l}</p>
            </div>

            {/* BA ONLY */}
            {isBA && (<>
              <div className="sec-hdr"><div className="sec-line"/><span className="sec-txt">Identity Information</span><div className="sec-line"/></div>
              <div className="g2">
                <div className="field" style={{marginBottom:0}}>
                  <label className="field-lbl">CNIC <span>*</span></label>
                  <div className="inp-wrap">
                    <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/></svg></span>
                    <input className="inp" value={cnic} onChange={e=>setCnic(formatCNIC(e.target.value))} placeholder="12345-1234567-1" maxLength={15}/>
                  </div>
                  <p className="hint">Format: 12345-1234567-1</p>
                </div>
                <div className="field">
                  <label className="field-lbl">Father / Husband Name <span>*</span></label>
                  <div className="inp-wrap">
                    <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg></span>
                    <input className="inp" value={fatherName} onChange={e=>setFatherName(e.target.value)} placeholder="Muhammad Ahmed"/>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="field-lbl">Address <span className="opt">(optional)</span></label>
                <div className="inp-wrap">
                  <input className="inp no-ico" value={address} onChange={e=>setAddress(e.target.value)} placeholder="House #, Street, Area, City"/>
                </div>
              </div>

              <div className="sec-hdr"><div className="sec-line"/><span className="sec-txt">Bank Account Details</span><div className="sec-line"/></div>
              <div className="g3" style={{marginBottom:12}}>
                <div className="field" style={{marginBottom:0}}>
                  <label className="field-lbl">Bank <span>*</span></label>
                  <div className="inp-wrap">
                    <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg></span>
                    <select className="sel" value={bankName} onChange={e=>setBankName(e.target.value)}>
                      <option value="">Select bank</option>
                      {BANKS.map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label className="field-lbl">Account No. <span>*</span></label>
                  <div className="inp-wrap">
                    <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg></span>
                    <input className="inp" value={bankAccount} onChange={e=>setBankAccount(e.target.value)} placeholder="Account number"/>
                  </div>
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label className="field-lbl">IBAN <span className="opt">{bankName==="Meezan Bank"?"(recommended)":"(optional)"}</span></label>
                  <div className="inp-wrap">
                    <span className="inp-ico"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg></span>
                    <input className="inp" value={iban} onChange={e=>setIban(e.target.value.toUpperCase())} placeholder="PK36XXXX..."/>
                  </div>
                </div>
              </div>
            </>)}

            <div style={{position:"sticky",bottom:0,background:"var(--surface)",paddingTop:8,paddingBottom:8,marginTop:4,zIndex:10}}>
              <button className="sub-btn" onClick={handleSignup} disabled={loading||success}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/></svg>
                {loading?"Creating account...":"Create Account"}
              </button>
            </div>

            <div className="footer-row"><div className="footer-line"/><span className="footer-txt">Global Marks Pvt Ltd</span><div className="footer-line"/></div>
            <p className="signin-row">Already have an account? <Link href="/login" className="signin-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}