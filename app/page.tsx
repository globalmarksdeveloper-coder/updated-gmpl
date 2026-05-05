"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Logo from "@/public/gmpl-logo/gmpl-360-Logo.png";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    title: "GPS Verified Check-in",
    desc: "Real-time location validation at every store visit with precise and secure verification.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Live Attendance",
    desc: "Instant clock-in and clock-out with geofence-backed attendance tracking in real time.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-6" />
      </svg>
    ),
    title: "Sales Tracking",
    desc: "Monitor brand ambassador performance and sales activity across all brands in one place.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Admin Control",
    desc: "Approve users, review reports, and manage field operations from one powerful dashboard.",
  },
];

const stats = [
  { value: "4+", label: "Brands Managed" },
  { value: "99%", label: "GPS Accuracy" },
  { value: "Live", label: "Real-Time Data" },
  { value: "24/7", label: "System Availability" },
];

export default function HomePage() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("en-PK", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');

        :root {
          --bg: #060816;
          --panel: rgba(255, 255, 255, 0.02);

          --panel-2: rgba(255, 255, 255, 0.06);
          --line: rgba(255,255,255,0.1);
          --text: #ecf3ff;
          --text-2: #5ec1ff;
          --muted: #9fb0d0;
          --blue: #0D4066;
          --blue-2: #1571AE;
          --glow: rgba(79, 140, 255, 0.32);
          --shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
          --radius: 24px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', sans-serif;
          background:
            radial-gradient(circle at 20% 20%, rgba(79,140,255,0.18), transparent 28%),
            radial-gradient(circle at 80% 10%, rgba(110,203,255,0.18), transparent 26%),
            radial-gradient(circle at 50% 80%, rgba(53,87,255,0.14), transparent 30%),
            linear-gradient(180deg, #050816 0%, #071020 48%, #081327 100%);
          color: var(--text);
          overflow-x: hidden;
        }

        a { color: inherit; }

        .root {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .noise,
        .grid,
        .orb,
        .orb-2,
        .orb-3 {
          pointer-events: none;
          position: absolute;
        }

        .noise {
          inset: 0;
          opacity: 0.08;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 4px 4px;
          mix-blend-mode: soft-light;
        }

        .grid {
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 70px 70px;
          mask-image: linear-gradient(180deg, rgba(255,255,255,0.55), transparent 85%);
          opacity: 0.18;
        }

        .orb {
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,140,255,0.28) 0%, rgba(79,140,255,0.05) 45%, transparent 72%);
          top: -140px;
          left: -140px;
          filter: blur(18px);
          animation: floatOne 10s ease-in-out infinite;
        }

        .orb-2 {
          width: 460px;
          height: 460px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(110,203,255,0.22) 0%, rgba(110,203,255,0.04) 45%, transparent 72%);
          right: -120px;
          top: 120px;
          filter: blur(16px);
          animation: floatTwo 12s ease-in-out infinite;
        }

        .orb-3 {
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(62,88,255,0.18) 0%, rgba(62,88,255,0.03) 48%, transparent 74%);
          left: 50%;
          bottom: -220px;
          transform: translateX(-50%);
          filter: blur(14px);
          animation: floatThree 13s ease-in-out infinite;
        }

        @keyframes floatOne {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 25px) scale(1.04); }
        }
        @keyframes floatTwo {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-18px, 30px) scale(1.03); }
        }
        @keyframes floatThree {
          0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
          50% { transform: translateX(-50%) translateY(-18px) scale(1.04); }
        }

        .container {
          width: min(1240px, calc(100% - 32px));
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .glass {
          background: var(--panel);
          border: 1px solid var(--line);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: var(--shadow);
        }

        .nav-wrap {
          position: sticky;
          top: 0;
          z-index: 50;
          padding-top: 14px;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 18px;
          border-radius: 22px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          min-width: 0;
        }

        .nav-logo-icon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          background: linear-gradient(135deg, var(--blue), var(--blue-2));
          box-shadow: 0 12px 30px var(--glow);
        }

        .nav-logo-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.15rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .nav-logo-name span {
          background: linear-gradient(135deg, #fff, #82d8ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-logo-sub {
          color: var(--muted);
          font-size: 0.72rem;
          margin-top: 4px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .nav-center {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 999px;
          border: 1px solid rgba(110, 231, 183, 0.22);
          background: rgba(16, 185, 129, 0.08);
          color: #86efac;
          font-size: 0.82rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.8);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(52,211,153,0.7); }
          70% { box-shadow: 0 0 0 12px rgba(52,211,153,0); }
          100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn,
        .menu-btn {
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease, background .25s ease, color .25s ease;
        }

        .btn {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 14px;
          font-weight: 700;
          border: 1px solid transparent;
          padding: 12px 18px;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn:hover,
        .menu-btn:hover {
          transform: translateY(-2px);
        }

        .btn-ghost {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
          color: #dbeafe;
        }

        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.24);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--blue), var(--blue-2));
          color: white;
          box-shadow: 0 12px 32px var(--glow);
        }

        .btn-primary:hover {
          box-shadow: 0 18px 40px rgba(79,140,255,0.42);
        }

        .menu-btn {
          display: none;
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: white;
          cursor: pointer;
        }

        .menu-btn svg { display: block; margin: auto; }

        .mobile-menu {
          display: none;
          margin-top: 12px;
          border-radius: 20px;
          padding: 14px;
          overflow: hidden;
        }

        .mobile-menu-inner {
          display: grid;
          gap: 10px;
        }

        .hero {
          padding: 72px 0 48px;
          display: grid;
          grid-template-columns: 1.12fr 0.88fr;
          gap: 32px;
          align-items: center;
        }

        .hero-copy {
          max-width: 680px;
          animation: fadeUp .8s ease both;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid rgba(79, 140, 255, 0.22);
          background: rgba(79, 140, 255, 0.09);
          color: #bfdbfe;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 22px;
        }

        .hero-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2.8rem, 7vw, 5.8rem);
          line-height: 0.95;
          letter-spacing: -0.06em;
          font-weight: 900;
          margin-bottom: 18px;
        }

        .hero-title .accent {
          display: block;
          background: linear-gradient(135deg, #ffffff 0%, #8cd7ff 42%, #4f8cff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: clamp(1rem, 2vw, 1.1rem);
          color: var(--muted);
          line-height: 1.8;
          max-width: 620px;
          margin-bottom: 28px;
        }

        .hero-buttons {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .hero-meta-item {
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #d6e6ff;
          font-size: 0.92rem;
        }

        .hero-visual {
          position: relative;
          animation: fadeUp 1s ease .1s both;
        }

        .dashboard-card {
          border-radius: 28px;
          padding: 22px;
          position: relative;
          overflow: hidden;
        }

        .dashboard-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), transparent 30%, transparent 70%, rgba(255,255,255,0.03));
          pointer-events: none;
        }

        .dashboard-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .dashboard-top h3 {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .tiny-pill {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: #cfe3ff;
          font-size: 0.78rem;
          white-space: nowrap;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 14px;
        }

        .mini-card {
          border-radius: 20px;
          padding: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .mini-card-label {
          color: #5ec1ff;
          font-size: 0.78rem;
          margin-bottom: 8px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .mini-card-value {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.35rem, 4vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .live-card {
          border-radius: 22px;
          padding: 20px;
          margin-top: 14px;
          background: linear-gradient(135deg, rgba(79,140,255,0.13), rgba(110,203,255,0.08));
          border: 1px solid rgba(110, 203, 255, 0.2);
        }

        .live-card-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-time-label {
          font-size: 0.50rem;
          color: #c5dbff;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .live-time {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.5rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.07em;
          margin: 6px 0;
        }

        .live-time span:last-child {
          color: #89d8ff;
        }

        .live-date {
          color: var(--muted);
          font-size: 0.92rem;
        }

        .bars {
          display: flex;
          align-items: end;
          gap: 8px;
          height: 84px;
          margin-top: 16px;
        }

        .bar {
          flex: 1;
          border-radius: 999px 999px 12px 12px;
          background: linear-gradient(180deg, #92d7ff, #4f8cff);
          opacity: 0.95;
          animation: rise 1.8s ease-in-out infinite;
        }

        .bar:nth-child(2) { animation-delay: .2s; }
        .bar:nth-child(3) { animation-delay: .4s; }
        .bar:nth-child(4) { animation-delay: .6s; }
        .bar:nth-child(5) { animation-delay: .8s; }

        @keyframes rise {
          0%, 100% { transform: scaleY(.92); }
          50% { transform: scaleY(1.04); }
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 12px 0 84px;
        }

        .stat-item {
          border-radius: 22px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: transform .25s ease, border-color .25s ease, background .25s ease;
        }

        .stat-item:hover {
          transform: translateY(-4px);
          border-color: rgba(110,203,255,0.18);
          background: rgba(255,255,255,0.08);
        }

        .stat-value {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 900;
          letter-spacing: -0.05em;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #ffffff, #8cd7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          color: var(--muted);
          font-size: 0.86rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .section-head {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 36px;
        }

        .section-tag {
          display: inline-block;
          margin-bottom: 14px;
          color: #93c5fd;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2rem, 4.5vw, 3.6rem);
          letter-spacing: -0.05em;
          line-height: 1.02;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .section-title span {
          background: linear-gradient(135deg, #fff, #84d8ff, #4f8cff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-sub {
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.8;
        }

        .features-section {
          margin-bottom: 92px;
        }

        .feat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .feat-card {
          border-radius: 24px;
          padding: 26px;
          position: relative;
          overflow: hidden;
          transition: transform .25s ease, border-color .25s ease, background .25s ease, box-shadow .25s ease;
        }

        .feat-card::after {
          content: "";
          position: absolute;
          inset: auto -10% -30% auto;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,140,255,0.18), transparent 70%);
          pointer-events: none;
        }

        .feat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(110,203,255,0.22);
          box-shadow: 0 22px 55px rgba(3, 8, 24, 0.38);
          background: rgba(255,255,255,0.08);
        }

        .feat-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(79,140,255,0.18), rgba(110,203,255,0.14));
          border: 1px solid rgba(110,203,255,0.16);
          color: #bfe8ff;
          margin-bottom: 18px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .feat-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 10px;
        }

        .feat-desc {
          color: var(--muted);
          font-size: 0.96rem;
          line-height: 1.8;
          max-width: 34ch;
        }

        .cta-section {
          margin-bottom: 84px;
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 42px;
        }

        .cta-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 24%),
            radial-gradient(circle at 82% 22%, rgba(110,203,255,0.16), transparent 28%),
            linear-gradient(135deg, rgba(79,140,255,0.2), rgba(110,203,255,0.08));
          pointer-events: none;
        }

        .cta-inner {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .cta-copy {
          max-width: 720px;
        }

        .cta-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2rem, 4vw, 3.4rem);
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 1.02;
          margin-bottom: 12px;
        }

        .cta-sub {
          color: #c9daef;
          line-height: 1.8;
          font-size: 1rem;
        }

        .cta-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .footer {
          padding: 0 0 34px;
        }

        .footer-card {
          border-radius: 24px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .footer-brand {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.1rem;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .footer-brand span {
          color: #8cd7ff;
        }

        .footer-copy,
        .footer-right {
          color: var(--muted);
          font-size: 0.88rem;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1100px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .hero-copy,
          .hero-visual {
            max-width: 100%;
          }

          .cta-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 900px) {
          .stats-row,
          .feat-grid {
            grid-template-columns: 1fr 1fr;
          }

          .nav-pill,
          .nav-actions .btn-ghost,
          .nav-actions .btn-primary {
            display: none;
          }

          .menu-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-menu {
            display: block;
            animation: fadeUp .25s ease;
          }
        }

        @media (max-width: 640px) {
          .container {
            width: min(100% - 20px, 1240px);
          }

          .nav-wrap {
            padding-top: 10px;
          }

          .nav {
            padding: 12px 14px;
            border-radius: 18px;
          }

          .nav-logo-sub {
            display: none;
          }

          .hero {
            padding: 46px 0 36px;
            gap: 22px;
          }

          .hero-buttons,
          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-buttons .btn,
          .cta-buttons .btn {
            width: 100%;
          }

          .dashboard-grid,
          .stats-row,
          .feat-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-card,
          .cta-section {
            padding: 18px;
          }

          .hero-meta {
            display: grid;
            grid-template-columns: 1fr;
          }

          .bars {
            height: 70px;
          }

          .footer-card {
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="root">
        <div className="noise" />
        <div className="grid" />
        <div className="orb" />
        <div className="orb-2" />
        <div className="orb-3" />

        <div className="container nav-wrap">
          <nav className="nav glass">
            {/* <Link href="/" className="nav-logo"> */}
                     <Link href="/">

              <Image src={Logo} alt="TrackForce Logo" width={250} height={50} />
              <div>
                {/* <div className="nav-logo-name">
                  Track<span>Force</span>
                </div> */}
                {/* <div className="nav-logo-sub">Field Operations Platform</div> */}
              </div>
            </Link>

            <div className="nav-center">
              <div className="nav-pill">
                <span className="pulse" />
                System Online
              </div>
            </div>

            <div className="nav-actions">
              <Link href="/login" className="btn btn-ghost">Sign In</Link>
              <Link href="/signup" className="btn btn-primary">
                Get Access
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <button
                className="menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {menuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>

          {menuOpen && (
            <div className="mobile-menu glass">
              <div className="mobile-menu-inner">
                <div className="nav-pill">
                  <span className="pulse" />
                  System Online
                </div>
                <Link href="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get Access</Link>
              </div>
            </div>
          )}
        </div>

        <main className="container">
          <section className="hero">
            <div className="hero-copy">
              <div className="hero-badge">
                <span className="pulse" style={{ background: '#60a5fa' }} />
                GMPL · Brand Ambassador Field System
              </div>

              <h1 className="hero-title">
                Track Every Visit.
                <span className="accent">Own Every Day.</span>
              </h1>

              <p className="hero-sub">
                A premium field operations platform for GMPL with GPS-verified attendance,
                live sales tracking, smarter reporting, and real-time visibility across your brand teams.
              </p>

              <div className="hero-buttons">
                <Link href="/login" className="btn btn-primary">
                  Sign In to Dashboard
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="/signup" className="btn btn-ghost">Request Access</Link>
              </div>

              <div className="hero-meta">
                <div className="hero-meta-item">Live attendance validation</div>
                <div className="hero-meta-item">Instant field reporting</div>
                <div className="hero-meta-item">Smart brand performance visibility</div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="dashboard-card glass">
                <div className="dashboard-top">
                  <h3>Live Ops Overview</h3>
                  <div className="tiny-pill">GMPL Network</div>
                </div>

                <div className="dashboard-grid">
                  <div className="mini-card">
                    <div className="mini-card-label">Active Teams</div>
                    <div className="mini-card-value">04</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-card-label">Store Visits</div>
                    <div className="mini-card-value">128</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-card-label">Check-ins</div>
                    <div className="mini-card-value">99%</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-card-label">Live Reports</div>
                    <div className="mini-card-value">24/7</div>
                  </div>
                </div>

                {mounted && (
                  <div className="live-card">
                    <div className="live-card-top">
                      <div>
                        <div className="live-time-label">Live System Time</div>
                        <div className="live-time">
                          {time.split(":").map((part, i) => (
                            <span key={i}>
                              {i > 0 ? ':' : ''}
                              {part}
                            </span>
                          ))}
                        </div>
                        <div className="live-date">{date}</div>
                      </div>
                      <div className="nav-pill">
                        <span className="pulse" />
                        Real-Time Sync
                      </div>
                    </div>

                    <div className="bars" aria-hidden="true">
                      <div className="bar" style={{ height: '52%' }} />
                      <div className="bar" style={{ height: '84%' }} />
                      <div className="bar" style={{ height: '65%' }} />
                      <div className="bar" style={{ height: '96%' }} />
                      <div className="bar" style={{ height: '74%' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="stats-row">
            {stats.map((s: Record<string,any>) => (
              <div className="stat-item glass" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </section>

          <section className="features-section">
            <div className="section-head">
              <div className="section-tag">What We Offer</div>
              <h2 className="section-title">
                Everything your <span>field team</span> needs
              </h2>
              <p className="section-sub">
                Built to streamline attendance, sales visibility, and admin control with a premium dashboard experience.
              </p>
            </div>

            <div className="feat-grid">
              {features.map((f: Record<string,any>) => (
                <div className="feat-card glass" key={f.title}>
                  <div className="feat-icon">{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="cta-section glass">
            <div className="cta-inner">
              <div className="cta-copy">
                <h2 className="cta-title">Ready to power your field operations?</h2>
                <p className="cta-sub">
                  Sign in to manage your day or request access to bring your full field team into one high-performance system.
                </p>
              </div>

              <div className="cta-buttons">
                <Link href="/login" className="btn btn-primary">Sign In</Link>
                <Link href="/signup" className="btn btn-ghost">Create Account</Link>
              </div>
            </div>
          </section>

          <footer className="footer">
            <div className="footer-card glass">
              <div className="footer-brand">
                Track<span>Force</span>
              </div>
              <div className="footer-copy">© {new Date().getFullYear()} Global Marks Pvt Ltd — All rights reserved</div>
              <div className="footer-right">Powered by GMPL Field Ops</div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
