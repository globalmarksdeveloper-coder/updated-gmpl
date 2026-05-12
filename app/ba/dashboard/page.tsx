"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  AttendanceRecord,
  StoreAssignment,
  SalesEntry,
  Sku,
  SaleLine,
  SkuRow,
  GpsLocation,
  AttendanceAction,
} from "@/types";
import Image from "next/image";
import Logo from "@/public/gmpl-logo/gmpl-favicon.svg";

// ── Constants ──────────────────────────────────────────────────────────────────

const RULES = [
  { color: "#10B981", text: "Check in once at the start of your shift" },
  { color: "#F59E0B", text: "Use Break button only during your shift" },
  { color: "#EF4444", text: "Check out only when your shift is fully done" },
  { color: "#6366F1", text: "Once checked out you cannot check in again today" },
  { color: "#1E3A8A", text: "Add all sales before checking out" },
];

type Status = "idle" | "checkedin" | "break" | "checkedout";

interface BtnConfig {
  label: string;
  sub: string;
  color: string;
  bg: string;
  border: string;
  shadow: string;
  action: AttendanceAction | null;
}

const BTN_CONFIG: Record<Status, BtnConfig> = {
  idle:       { label:"CHECK IN",  sub:"Tap to start shift",  color:"#10B981", bg:"#DCFCE7", border:"#86EFAC", shadow:"rgba(16,185,129,0.3)",  action:"checkin"   },
  checkedin:  { label:"CHECK OUT", sub:"Tap when shift ends",  color:"#EF4444", bg:"#FEE2E2", border:"#FCA5A5", shadow:"rgba(239,68,68,0.3)",   action:"checkout"  },
  break:      { label:"END BREAK", sub:"Tap to resume work",   color:"#F59E0B", bg:"#FEF3C7", border:"#FDE68A", shadow:"rgba(245,158,11,0.3)",  action:"break_end" },
  checkedout: { label:"DONE",      sub:"See you tomorrow!",    color:"#6366F1", bg:"#EEF2FF", border:"#C7D2FE", shadow:"rgba(99,102,241,0.3)",  action:null        },
};

interface ToastMessage {
  text: string;
  error: boolean;
}

// ── Summary Section Component ─────────────────────────────────────────────────
interface SumData {
  period: string;
  attendance: { rows: Record<string,any>[]; present: number; total: number; absent: number };
  sales: { rows: Record<string,any>[]; total: number };
  brands: { brand_name: string; total: string }[];
  today: { check_in: string|null; check_out: string|null; store_name: string; hours_worked: string|null } | null;
}

function SummarySection({ storeName, shiftName, attendance, tdSalesAmount }: { storeName: string; shiftName: string; attendance: AttendanceRecord | null; tdSalesAmount: number }) {
  const [period,  setPeriod]  = useState<"today"|"week"|"month"|"year">("today");
  const [data,    setData]    = useState<SumData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/auth/ba-summary?period=${period}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.attendance && d.sales) { setData(d); }
        else { setData(null); }
        setLoading(false);
      })
      .catch(() => { setData(null); setLoading(false); });
  }, [period]);

  const dlCsv = (rows: Record<string,any>[], headers: string[], keys: string[], filename: string) => {
    if (!rows.length) return;
    const csv = [headers.join(","), ...rows.map(r => keys.map(k => `"${String(r[k]??"")}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = filename; a.click();
  };
  const dlAll = () => {
    dlCsv(data?.sales.rows||[], ["Date","Store","Total Sales","Items"], ["date","store_name","day_total","items_count"], `sales_${period}.csv`);
    setTimeout(() => dlCsv(data?.attendance.rows||[], ["Date","Store","Check In","Check Out","Hours","Status"], ["date","store_name","check_in","check_out","hours_worked","status"], `attendance_${period}.csv`), 600);
  };

  const PERIODS = [
    { key:"today", label:"Today" },
    { key:"week",  label:"This Week" },
    { key:"month", label:"This Month" },
    { key:"year",  label:"This Year" },
  ] as const;

  const combinedRows = (() => {
    if (!data?.attendance?.rows || !data?.sales?.rows) return [];
    const attMap: Record<string, Record<string,any>> = {};
    data.attendance.rows.forEach(r => { attMap[r.date] = r; });
    const salesMap: Record<string, Record<string,any>> = {};
    data.sales.rows.forEach(r => { salesMap[r.date] = r; });
    const allDates = [...new Set([...Object.keys(attMap), ...Object.keys(salesMap)])].sort().reverse();
    return allDates.map(date => ({
      date,
      status:    attMap[date]?.status || "Absent",
      check_in:  attMap[date]?.check_in || null,
      check_out: attMap[date]?.check_out || null,
      store:     attMap[date]?.store_name || salesMap[date]?.store_name || "—",
      sales:     Number(salesMap[date]?.day_total || 0),
    }));
  })();

  const tdSales    = tdSalesAmount;
  const totalSales = data?.sales.total || 0;
  const present  = data?.attendance.present || 0;
  const absent   = data?.attendance.absent  || 0;

  return (
    <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:16, overflow:"hidden", marginBottom:20 }}>

      {/* Header — gray */}
      <div style={{ background:"#334155", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:3 }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              style={{ padding:"5px 12px", borderRadius:20, border:"none", fontSize:11, fontWeight:700, cursor:"pointer",
                background: period===p.key ? "#10B981" : "rgba(255,255,255,0.12)",
                color: period===p.key ? "#fff" : "rgba(255,255,255,0.55)" }}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={dlAll}
          style={{ padding:"5px 12px", borderRadius:8, border:"none", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
          <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          Download
        </button>
      </div>

      {loading ? (
        <div style={{ padding:28, textAlign:"center", color:"#94A3B8", fontSize:13 }}>Loading...</div>
      ) : combinedRows.length === 0 ? (
        <div style={{ padding:28, textAlign:"center", color:"#94A3B8", fontSize:13 }}>No records for this period</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="sum-table-wrap">
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F8FAFC" }}>
                  {["Date","Store","Status","Check In","Check Out","Sales"].map(h => (
                    <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:9, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #E2E8F0", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {combinedRows.map((r, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid #F8FAFC", background: r.status==="Absent" ? "#FFFBFB" : "#fff" }}>
                    <td style={{ padding:"9px 14px", fontFamily:"monospace", fontSize:12, color:"#334155", whiteSpace:"nowrap" }}>{r.date}</td>
                    <td style={{ padding:"9px 14px", fontSize:12, color:"#64748B" }}>{r.store}</td>
                    <td style={{ padding:"9px 14px" }}>
                      <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700,
                        background: r.status==="Present" ? "#DCFCE7" : "#FEE2E2",
                        color:      r.status==="Present" ? "#16A34A" : "#DC2626" }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding:"9px 14px", fontSize:12, color: r.check_in ? "#10B981" : "#94A3B8", fontWeight:600 }}>{r.check_in || "—"}</td>
                    <td style={{ padding:"9px 14px", fontSize:12, fontWeight:600, color: r.check_out ? "#EF4444" : r.status==="Present" ? "#F59E0B" : "#94A3B8" }}>{r.status==="Absent" ? "—" : r.check_out || "Active"}</td>
                    <td style={{ padding:"9px 14px", fontFamily:"Poppins,sans-serif", fontSize:13, fontWeight:800, color: r.status==="Absent" ? "#94A3B8" : r.sales > 0 ? "#10B981" : "#334155" }}>{r.status==="Absent" ? "—" : `Rs ${r.sales.toLocaleString()}`}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background:"#F1F5F9", borderTop:"2px solid #E2E8F0" }}>
                  <td colSpan={5} style={{ padding:"10px 14px", fontSize:12, fontWeight:700, color:"#374151" }}>
                    Total ({combinedRows.filter(r=>r.status==="Present").length} present / {combinedRows.filter(r=>r.status==="Absent").length} absent)
                  </td>
                  <td style={{ padding:"10px 14px", fontFamily:"Poppins,sans-serif", fontSize:14, fontWeight:800, color:"#10B981" }}>
                    Rs {combinedRows.reduce((s,r) => s + (r.status==="Absent" ? 0 : r.sales), 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sum-cards-wrap">
            {combinedRows.map((r, i) => (
              <div key={i} style={{ padding:"12px 14px", borderBottom:"1px solid #F1F5F9", background: r.status==="Absent" ? "#FFFBFB" : "#fff" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontFamily:"monospace", fontSize:12, color:"#334155", fontWeight:600 }}>{r.date}</span>
                  <span style={{ padding:"2px 10px", borderRadius:20, fontSize:10, fontWeight:700,
                    background: r.status==="Present" ? "#DCFCE7" : "#FEE2E2",
                    color:      r.status==="Present" ? "#16A34A" : "#DC2626" }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize:11, color:"#64748B", marginBottom:6 }}>{r.store}</div>
                {r.status === "Present" && (
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                    <div>
                      <div style={{ fontSize:9, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:1 }}>Check In</div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#10B981" }}>{r.check_in || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:1 }}>Check Out</div>
                      <div style={{ fontSize:12, fontWeight:600, color: r.check_out ? "#EF4444" : "#F59E0B" }}>{r.check_out || "Active"}</div>
                    </div>
                    <div style={{ marginLeft:"auto" }}>
                      <div style={{ fontSize:9, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:1 }}>Sales</div>
                      <div style={{ fontFamily:"Poppins,sans-serif", fontSize:14, fontWeight:800, color: r.sales > 0 ? "#10B981" : "#334155" }}>Rs {r.sales.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Total footer */}
            <div style={{ padding:"12px 14px", background:"#F1F5F9", borderTop:"2px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#374151" }}>
                {combinedRows.filter(r=>r.status==="Present").length}P / {combinedRows.filter(r=>r.status==="Absent").length}A
              </span>
              <span style={{ fontFamily:"Poppins,sans-serif", fontSize:15, fontWeight:800, color:"#10B981" }}>
                Rs {combinedRows.reduce((s,r) => s + (r.status==="Absent" ? 0 : r.sales), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Target Progress Bar Component ────────────────────────────────────────────
function TargetProgressBar() {
  const [data, setData] = useState<Record<string,any> | null>(null);
  const [barWidth, setBarWidth] = useState(0);
  const [nextBarWidth, setNextBarWidth] = useState(0);

  useEffect(() => {
    fetch('/api/auth/ba-target')
      .then(r => r.json())
      .then(d => {
        if (d && !d.message) {
          setData(d);
          setTimeout(() => {
            setBarWidth(d.pct || 0);
            setNextBarWidth(d.nextSlabPct || 0);
          }, 300);
        }
      })
      .catch(() => {});
  }, []);

  if (!data || !data.target) return null;

  const { target, mtdSales, todaySales, remaining, perDayNeeded, pct,
    daysLeft, incentiveEarned, totalPay, fixedSalary, currentSlabIdx,
    nextSlabTarget, nextSlabLabel, nextSlabIncentive, nextSlabRemaining,
    targetHit, slabs, storeName } = data;

  const color = pct >= 100 ? "#10B981" : pct >= 75 ? "#F59E0B" : pct >= 50 ? "#3B82F6" : "#EF4444";

  return (
    <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:16, overflow:"hidden", marginBottom:20 }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1E3A8A,#1e40af)", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        {/* <div>
          <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:14, color:"#fff", display:"flex", alignItems:"center", gap:6 }}><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg> Monthly Target Progress</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{storeName} · {new Date().toLocaleString("default",{month:"long"})} {new Date().getFullYear()}</div>
        </div> */}
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"Poppins,sans-serif", fontSize:20, fontWeight:800, color: targetHit ? "#10B981" : "#fff" }}>Rs {mtdSales.toLocaleString()}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>of Rs {target.toLocaleString()} target</div>
        </div>
      </div>

      <div style={{ padding:"16px 20px" }}>
        {/* Main progress bar */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#64748B" }}>Target Progress</span>
            <span style={{ fontSize:13, fontWeight:800, color:color }}>{pct}%</span>
          </div>
          <div style={{ height:20, background:"#F1F5F9", borderRadius:20, overflow:"hidden", position:"relative" }}>
            <div style={{
              height:"100%", borderRadius:20,
              background: pct >= 100 ? "linear-gradient(90deg,#10B981,#34D399)" : pct >= 75 ? "linear-gradient(90deg,#F59E0B,#FCD34D)" : pct >= 50 ? "linear-gradient(90deg,#3B82F6,#60A5FA)" : "linear-gradient(90deg,#EF4444,#F87171)",
              width:`${barWidth}%`,
              transition:"width 1.5s cubic-bezier(0.4,0,0.2,1)",
              display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:8
            }}>
              {pct > 15 && <span style={{ fontSize:10, fontWeight:800, color:"#fff" }}>Rs {mtdSales.toLocaleString()}</span>}
            </div>
            {/* Target marker */}
            <div style={{ position:"absolute", top:0, right:0, height:"100%", width:3, background:"#0F172A", opacity:0.3 }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            <span style={{ fontSize:10, color:"#94A3B8" }}>Rs 0</span>
            <span style={{ fontSize:10, color:"#94A3B8", fontWeight:700 }}>Target: Rs {target.toLocaleString()}</span>
          </div>
        </div>

        {/* Target hit celebration OR remaining info */}
        {targetHit ? (
          <div style={{ background:"linear-gradient(135deg,#DCFCE7,#D1FAE5)", border:"2px solid #86EFAC", borderRadius:14, padding:"16px 18px", marginBottom:16, textAlign:"center" }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"#10B981", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:8, margin:"0 auto 10px" }}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="#fff"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a1 1 0 011 1v2a4 4 0 01-4 4H6a4 4 0 01-4-4V5a1 1 0 011-1h1V3a1 1 0 011-1zm0 4v2a2 2 0 002 2h6a2 2 0 002-2V6H5zm7 8a1 1 0 100 2H8a1 1 0 100-2h4z" clipRule="evenodd"/></svg>
            </div>
            <div style={{ fontFamily:"Poppins,sans-serif", fontSize:16, fontWeight:800, color:"#15803D", marginBottom:4 }}>Target Achieved!</div>
            <div style={{ fontSize:12, color:"#16A34A", marginBottom:8 }}>
              Rs {incentiveEarned.toLocaleString()} incentive added to your salary!
            </div>
            <div style={{ display:"inline-block", padding:"6px 16px", background:"#10B981", borderRadius:20 }}>
              <span style={{ fontFamily:"Poppins,sans-serif", fontSize:13, fontWeight:800, color:"#fff" }}>Total Pay: Rs {totalPay.toLocaleString()}</span>
            </div>
            {nextSlabLabel && (
              <div style={{ marginTop:10, fontSize:11, color:"#15803D", fontWeight:600 }}>
                {currentSlabIdx >= 0 ? `${data.currentSlabLabel} complete! ` : ""}
                Now working toward {nextSlabLabel} → Rs {nextSlabIncentive.toLocaleString()} bonus
              </div>
            )}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
            {[
              { label:"Remaining", val:`Rs ${remaining.toLocaleString()}`, color:"#EF4444", sub:"to hit target" },
              { label:"Per Day Needed", val:`Rs ${perDayNeeded.toLocaleString()}`, color:"#F59E0B", sub:`${daysLeft} days left` },
              { label:"Today's Sales", val:`Rs ${todaySales.toLocaleString()}`, color:"#10B981", sub:"so far today" },
            ].map(item => (
              <div key={item.label} style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{item.label}</div>
                <div style={{ fontFamily:"Poppins,sans-serif", fontSize:14, fontWeight:800, color:item.color }}>{item.val}</div>
                <div style={{ fontSize:10, color:"#94A3B8", marginTop:2 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Motivational message */}
        {!targetHit && (
          <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:12, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ flexShrink:0, display:"flex" }}>
              {pct >= 75
                ? <svg width="20" height="20" viewBox="0 0 20 20" fill="#D97706"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/></svg>
                : pct >= 50
                ? <svg width="20" height="20" viewBox="0 0 20 20" fill="#1D4ED8"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
                : <svg width="20" height="20" viewBox="0 0 20 20" fill="#1D4ED8"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
              }
            </span>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#1D4ED8" }}>
                {pct >= 75 ? "Almost there! Keep pushing!" : pct >= 50 ? "You're halfway! Great momentum!" : pct >= 25 ? "Good start! Stay consistent!" : "Let's get started! Every sale counts!"}
              </div>
              <div style={{ fontSize:11, color:"#3B82F6", marginTop:2 }}>
                Sell Rs {perDayNeeded.toLocaleString()} per day for {daysLeft} more days to hit your target
              </div>
            </div>
          </div>
        )}

        {/* Slab preview */}
        {slabs?.length > 0 && (
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Incentive Slabs</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {slabs.map((slab: Record<string,any>, i: number) => {
                const slabBase = i === 0 ? target : target * slabs.slice(0,i).reduce((acc: number, s: Record<string,any>) => acc * (1 + s.threshold_pct/100), 1);
                const slabTarget = slabBase * (1 + slab.threshold_pct / 100);
                const slabIncentive = slabTarget * (slab.incentive_pct / 100);
                const achieved = mtdSales >= slabTarget;
                const active   = !achieved && currentSlabIdx === i - 1 || (i === 0 && targetHit && currentSlabIdx < 0);
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10,
                    background: achieved ? "#DCFCE7" : active ? "#EFF6FF" : "#F8FAFC",
                    border:`1.5px solid ${achieved ? "#86EFAC" : active ? "#BFDBFE" : "#E2E8F0"}` }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background: achieved ? "#10B981" : active ? "#3B82F6" : "#E2E8F0",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:11, fontWeight:800, color: achieved||active ? "#fff" : "#94A3B8" }}>
                        {achieved ? <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> : i+1}
                      </span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:700, color: achieved ? "#15803D" : active ? "#1D4ED8" : "#374151" }}>
                        Slab {i+1} — Rs {Math.round(slabTarget).toLocaleString()}
                      </div>
                      <div style={{ fontSize:10, color:"#94A3B8" }}>
                        {slab.threshold_pct}% above {i === 0 ? "target" : `Slab ${i}`} · {slab.incentive_pct}% incentive
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:"Poppins,sans-serif", fontSize:13, fontWeight:800, color: achieved ? "#10B981" : active ? "#3B82F6" : "#94A3B8" }}>
                        Rs {Math.round(slabIncentive).toLocaleString()}
                      </div>
                      <div style={{ fontSize:9, color:"#94A3B8" }}>{achieved ? "Earned!" : active ? `Rs ${Math.max(0,Math.round(slabTarget-mtdSales)).toLocaleString()} away` : "locked"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Salary summary */}
        <div style={{ marginTop:14, padding:"12px 16px", background:"#0F172A", borderRadius:12, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Fixed Salary</div>
              <div style={{ fontFamily:"Poppins,sans-serif", fontSize:14, fontWeight:800, color:"#fff" }}>Rs {fixedSalary.toLocaleString()}</div>
            </div>
            {incentiveEarned > 0 && (
              <>
                <div style={{ color:"rgba(255,255,255,0.2)" }}>+</div>
                <div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Incentive</div>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontSize:14, fontWeight:800, color:"#10B981" }}>Rs {Math.round(incentiveEarned).toLocaleString()}</div>
                </div>
              </>
            )}
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Total Expected</div>
            <div style={{ fontFamily:"Poppins,sans-serif", fontSize:18, fontWeight:800, color: incentiveEarned > 0 ? "#10B981" : "#fff" }}>Rs {Math.round(totalPay).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline Target Bar (inside checkin card) ───────────────────────────────────
function InlineTargetBar() {
  const [data, setData]         = useState<Record<string,any> | null>(null);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    fetch('/api/auth/ba-target')
      .then(r => r.json())
      .then(d => {
        if (d && !d.message && d.target) {
          setData(d);
          setTimeout(() => setBarWidth(d.pct || 0), 400);
        }
      }).catch(() => {});
  }, []);

  if (!data || !data.target) return null;

  const { pct, mtdSales, target, remaining, perDayNeeded, daysLeft,
    targetHit, incentiveEarned, fixedSalary, slabs } = data;

  const barColor = pct >= 100 ? "#10B981" : pct >= 75 ? "#F59E0B" : pct >= 50 ? "#3B82F6" : "#EF4444";
  const barGrad  = pct >= 100 ? "linear-gradient(90deg,#059669,#10B981,#34D399)"
                 : pct >= 75  ? "linear-gradient(90deg,#D97706,#F59E0B,#FCD34D)"
                 : pct >= 50  ? "linear-gradient(90deg,#1D4ED8,#3B82F6,#60A5FA)"
                 :              "linear-gradient(90deg,#DC2626,#EF4444,#F87171)";

  // Slab marker positions — relative to last slab as 100%
  const slabPoints = (() => {
    if (!slabs?.length) return [];
    const points: { barPct: number; label: string; targetAmt: number; bonus: number; hit: boolean }[] = [];
    let b = target;
    const lastTarget = slabs.reduce((acc: number, s: Record<string,any>) => acc * (1 + s.threshold_pct / 100), target);
    for (let i = 0; i < slabs.length; i++) {
      b = b * (1 + slabs[i].threshold_pct / 100);
      points.push({
        barPct: Math.round((b / lastTarget) * 100),
        label: `Slab ${i+1}`,
        targetAmt: Math.round(b),
        bonus: Math.round(b * slabs[i].incentive_pct / 100),
        hit: mtdSales >= b,
      });
    }
    return points;
  })();

  // Salary breakdown rows
  const salaryRows = (() => {
    if (!slabs?.length) return [];
    const rows: { label: string; targetAmt: number; bonus: number; total: number; hit: boolean; pct: number }[] = [];
    let b = target;
    for (let i = 0; i < slabs.length; i++) {
      b = b * (1 + slabs[i].threshold_pct / 100);
      const bonus = Math.round(b * slabs[i].incentive_pct / 100);
      rows.push({ label:`Slab ${i+1}`, targetAmt:Math.round(b), bonus, total:fixedSalary+bonus, hit:mtdSales>=b, pct:slabs[i].incentive_pct });
    }
    return rows;
  })();

  const motivMsg: { icon: React.ReactNode; msg: string; color: string; bg: string; border: string } | null = (() => {
    if (targetHit) return null;
    if (daysLeft <= 0) return { icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="#64748B"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>, msg:"Month ended. Great effort!", color:"#64748B", bg:"#F8FAFC", border:"#E2E8F0" };
    if (pct >= 75) return { icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="#D97706"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/></svg>, msg:`Just Rs ${remaining.toLocaleString()} away! Sell Rs ${perDayNeeded.toLocaleString()} per day for ${daysLeft} days.`, color:"#92400E", bg:"#FFFBEB", border:"#FDE68A" };
    if (pct >= 50) return { icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="#1D4ED8"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>, msg:`Sell Rs ${perDayNeeded.toLocaleString()} per day for ${daysLeft} days to hit your target!`, color:"#1D4ED8", bg:"#EFF6FF", border:"#BFDBFE" };
    return { icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="#1D4ED8"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>, msg:`Sell Rs ${perDayNeeded.toLocaleString()} per day — hit Rs ${target.toLocaleString()} in ${daysLeft} days!`, color:"#1D4ED8", bg:"#EFF6FF", border:"#BFDBFE" };
  })();

  return (
    <div style={{ width:"100%", marginTop:6, paddingTop:16, borderTop:"1.5px solid #F1F5F9" }}>

      {/* ── Section Header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#1E3A8A,#3B82F6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="#fff"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:"#0F172A", lineHeight:1.2 }}>Monthly Target</div>
            <div style={{ fontSize:10, color:"#94A3B8" }}>{new Date().toLocaleString("default",{month:"long"})} {new Date().getFullYear()}</div>
          </div>
        </div>        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"Poppins,sans-serif", fontSize:16, fontWeight:800, color:barColor }}>Rs {mtdSales.toLocaleString()}</div>
          <div style={{ fontSize:10, color:"#94A3B8" }}>of Rs {target.toLocaleString()}</div>
        </div>
      </div>

      {/* ── Progress Bar with slab ticks ── */}
      <div style={{ marginBottom:6 }}>
        {/* Slab labels above */}
        <div style={{ position:"relative", height:16, marginBottom:4 }}>
          {slabPoints.map((p, i) => (
            <div key={i} style={{ position:"absolute", left:`${p.barPct}%`, transform:"translateX(-50%)", textAlign:"center" }}>
              <span style={{ fontSize:8, fontWeight:700, color: p.hit ? "#10B981" : "#CBD5E1", whiteSpace:"nowrap" }}>S{i+1}</span>
            </div>
          ))}
        </div>

        {/* The bar */}
        <div style={{ position:"relative", height:26, background:"#F1F5F9", borderRadius:30, overflow:"hidden" }}>
          {/* Fill */}
          <div style={{
            position:"absolute", top:0, left:0, height:"100%",
            width:`${barWidth}%`,
            background:barGrad,
            borderRadius:30,
            transition:"width 1.8s cubic-bezier(0.4,0,0.2,1)",
            boxShadow:`0 0 12px ${barColor}55`,
          }}/>

          {/* Shimmer animation on fill */}
          <div style={{
            position:"absolute", top:0, left:0, height:"100%",
            width:`${barWidth}%`,
            background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 50%,transparent 100%)",
            borderRadius:30,
            transition:"width 1.8s cubic-bezier(0.4,0,0.2,1)",
            animation:"shimmer 2s infinite",
          }}/>

          {/* Percentage text */}
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent: pct > 50 ? "flex-start" : "flex-end", paddingLeft: pct > 50 ? 12 : 0, paddingRight: pct > 50 ? 0 : 10 }}>
            <span style={{ fontSize:11, fontWeight:800, color: pct > 50 ? "#fff" : barColor }}>{pct}%</span>
          </div>

          {/* Slab tick marks */}
          {slabPoints.map((p, i) => (
            <div key={i} style={{ position:"absolute", top:3, left:`${p.barPct}%`, width:2, height:"calc(100% - 6px)", background:"rgba(255,255,255,0.5)", borderRadius:2 }}/>
          ))}
        </div>

        {/* Bar labels */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
          <span style={{ fontSize:9, color:"#94A3B8" }}>Rs 0</span>
          <span style={{ fontSize:9, color:"#94A3B8", fontWeight:600 }}>Target: Rs {target.toLocaleString()}</span>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      {/* ── Motivational message ── */}
      {motivMsg && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 12px", borderRadius:12, marginBottom:12, marginTop:4, background:motivMsg.bg, border:`1px solid ${motivMsg.border}` }}>
          <span style={{ flexShrink:0, display:"flex", alignItems:"center", marginTop:2 }}>{motivMsg.icon}</span>
          <span style={{ fontSize:11, fontWeight:600, color:motivMsg.color, lineHeight:1.6 }}>{motivMsg.msg}</span>
        </div>
      )}

      {/* ── Target achieved ── */}
      {targetHit && (
        <div style={{ borderRadius:14, overflow:"hidden", marginBottom:12, background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)", border:"1.5px solid #6EE7B7" }}>
          <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"#10B981", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#fff"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a1 1 0 011 1v2a4 4 0 01-4 4H6a4 4 0 01-4-4V5a1 1 0 011-1h1V3a1 1 0 011-1zm0 4v2a2 2 0 002 2h6a2 2 0 002-2V6H5zm7 8a1 1 0 100 2H8a1 1 0 100-2h4z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:"Poppins,sans-serif", fontSize:14, fontWeight:800, color:"#065F46" }}>Target Achieved!</div>
              <div style={{ fontSize:11, color:"#047857", marginTop:2 }}>
                <span style={{ fontWeight:700 }}>+Rs {Math.round(incentiveEarned).toLocaleString()}</span> incentive · Total Pay: <span style={{ fontWeight:700 }}>Rs {Math.round(fixedSalary+incentiveEarned).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Salary Breakdown Component (shown in geo card after Today Summary) ─────────
function SalaryBreakdown() {
  const [data, setData] = useState<Record<string,any> | null>(null);
  useEffect(() => {
    fetch('/api/auth/ba-target').then(r=>r.json()).then(d=>{ if(d&&!d.message&&d.target) setData(d); }).catch(()=>{});
  }, []);
  if (!data) return null;
  const { fixedSalary, slabs, target, mtdSales } = data;
  const salaryRows = (() => {
    if (!slabs?.length) return [];
    const rows: { label:string; targetAmt:number; bonus:number; total:number; hit:boolean; pct:number }[] = [];
    let b = target;
    for (let i = 0; i < slabs.length; i++) {
      b = b * (1 + slabs[i].threshold_pct / 100);
      const bonus = Math.round(b * slabs[i].incentive_pct / 100);
      rows.push({ label:`Slab ${i+1}`, targetAmt:Math.round(b), bonus, total:fixedSalary+bonus, hit:mtdSales>=b, pct:slabs[i].incentive_pct });
    }
    return rows;
  })();
  const icons = [
    <svg key="s1" width="16" height="16" viewBox="0 0 20 20" fill="#F59E0B"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a1 1 0 011 1v2a4 4 0 01-4 4H6a4 4 0 01-4-4V5a1 1 0 011-1h1V3a1 1 0 011-1zm0 4v2a2 2 0 002 2h6a2 2 0 002-2V6H5zm7 8a1 1 0 100 2H8a1 1 0 100-2h4z" clipRule="evenodd"/></svg>,
    <svg key="s2" width="16" height="16" viewBox="0 0 20 20" fill="#94A3B8"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>,
    <svg key="s3" width="16" height="16" viewBox="0 0 20 20" fill="#10B981"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
  ];
  const colors      = ["#F59E0B","#94A3B8","#10B981"];
  const bgColors    = ["#FFFBEB","#F8FAFC","#F0FDF4"];
  const borderColors= ["#FDE68A","#E2E8F0","#BBF7D0"];
  return (
    <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid #E2E8F0", marginTop:4 }}>
      <div style={{ padding:"9px 14px", background:"#F8FAFC", borderBottom:"1px solid #E2E8F0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.1em", display:"flex", alignItems:"center", gap:5 }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="#64748B"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
          Salary Breakdown
        </span>
        <span style={{ fontSize:10, color:"#94A3B8" }}>{new Date().toLocaleString("default",{month:"short"})}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderBottom:"1px solid #F1F5F9", background:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#1E3A8A,#3B82F6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="#fff"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>Fixed Salary</div>
            <div style={{ fontSize:10, color:"#94A3B8" }}>Always paid · base</div>
          </div>
        </div>
        <div style={{ fontFamily:"Poppins,sans-serif", fontSize:15, fontWeight:800, color:"#1E3A8A" }}>Rs {fixedSalary.toLocaleString()}</div>
      </div>
      {salaryRows.map((s,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderBottom: i<salaryRows.length-1?"1px solid #F1F5F9":"none", background: s.hit?(bgColors[i]||"#F0FDF4"):"#fff" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, flex:1 }}>
            <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: s.hit?(bgColors[i]||"#F0FDF4"):"#F8FAFC", border:`1.5px solid ${s.hit?(borderColors[i]||"#BBF7D0"):"#E2E8F0"}` }}>
              {s.hit ? (icons[i]||icons[2]) : <span style={{ fontSize:11, fontWeight:800, color:"#CBD5E1" }}>{i+1}</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, fontWeight:700, color: s.hit?(colors[i]||"#10B981"):"#374151" }}>{s.label}</span>
                {s.hit
                  ? <span style={{ fontSize:9, padding:"1px 6px", borderRadius:20, fontWeight:700, background:bgColors[i]||"#F0FDF4", color:colors[i]||"#10B981", border:`1px solid ${borderColors[i]||"#BBF7D0"}`, display:"inline-flex", alignItems:"center", gap:3 }}><svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Earned</span>
                  : <span style={{ fontSize:9, padding:"1px 6px", borderRadius:20, fontWeight:600, background:"#F1F5F9", color:"#94A3B8", border:"1px solid #E2E8F0" }}>Rs {(s.targetAmt-mtdSales).toLocaleString()} away</span>
                }
              </div>
              <div style={{ fontSize:10, color:"#94A3B8", marginTop:1 }}>Hit Rs {s.targetAmt.toLocaleString()} → +Rs {s.bonus.toLocaleString()} ({s.pct}%)</div>
            </div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
            <div style={{ fontFamily:"Poppins,sans-serif", fontSize:14, fontWeight:800, color: s.hit?(colors[i]||"#10B981"):"#CBD5E1" }}>Rs {s.total.toLocaleString()}</div>
            <div style={{ fontSize:9, color:"#94A3B8" }}>total pay</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BADashboard() {
  const router = useRouter();

  // Attendance
  const [attendance,   setAttendance]   = useState<AttendanceRecord | null>(null);
  const [assignment,   setAssignment]   = useState<StoreAssignment | null>(null);
  const [status,       setStatus]       = useState<Status>("idle");
  const [timer,        setTimer]        = useState<number>(0);
  const [breakTimer,   setBreakTimer]   = useState<number>(0);

  // Location
  const [location,     setLocation]     = useState<GpsLocation | null>(null);
  const [locationName, setLocationName] = useState<string>("Fetching location...");

  // Sales
  const [sales,        setSales]        = useState<SalesEntry[]>([]);
  const [skus,         setSkus]         = useState<Sku[]>([]);
  const [brands,       setBrands]       = useState<string[]>([]);

  // Sale form
  const [showSaleForm, setShowSaleForm] = useState<boolean>(false);
  const [saleRemarks,  setSaleRemarks]  = useState<string>("");
  const [saleImage,    setSaleImage]    = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saleLines,    setSaleLines]    = useState<SaleLine[]>([{ brand:"", category:"", skuRows:[], selectedSkuIds:[] }]);
  const [brandSales,   setBrandSales]   = useState<Record<string, number>>({});

  // Zero sale modal
  const [showZeroModal, setShowZeroModal] = useState<boolean>(false);
  const [zeroRemarks,   setZeroRemarks]   = useState<string>("");

  // Geofence
  const [distanceFromStore, setDistanceFromStore] = useState<number | null>(null);
  const [storeCoords,       setStoreCoords]       = useState<{ lat: number; lng: number } | null>(null);
  const [mapLocation,       setMapLocation]       = useState<{ lat: number; lng: number } | null>(null);
  const lastMapUpdateRef = useRef<{ lat: number; lng: number } | null>(null);
  const [storeAddress,      setStoreAddress]      = useState<string>("");

  // UI
  const [loading,    setLoading]    = useState<boolean>(false);
  const [message,    setMessage]    = useState<ToastMessage | null>(null);
  const [time,       setTime]       = useState<string>("");
  const [showConfirm,setShowConfirm]= useState<boolean>(false);
  // const [showRules,  setShowRules]  = useState<boolean>(false);
  const [userName,   setUserName]   = useState<string>("BA");
  const [storeName,  setStoreName]  = useState<string>("");
  const [shiftName,  setShiftName]  = useState<string>("");

  // Leave & Resignation

  const [monthStats,      setMonthStats]      = useState<{present:number;absent:number}>({present:0,absent:0});
  const [showTerms,       setShowTerms]       = useState<boolean>(false);
  const [termsScrolled, setTermsScrolled] = useState<boolean>(false);

  // Leave & Resignation
  const [showLeaveModal,  setShowLeaveModal]  = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [leaveType,       setLeaveType]       = useState("casual");
  const [leaveFrom,       setLeaveFrom]       = useState("");
  const [leaveTo,         setLeaveTo]         = useState("");
  const [leaveRemarks,    setLeaveRemarks]    = useState("");
  const [resignReason,    setResignReason]    = useState("low_salary");
  const [resignOther,     setResignOther]     = useState("");
  const [notifications,   setNotifications]   = useState<Record<string,any>[]>([]);
  const [showNotif,       setShowNotif]       = useState(false);

  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchRef  = useRef<number | null>(null);
  const bestAccRef = useRef<number>(9999);

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString("en-PK", { hour:"2-digit", minute:"2-digit", second:"2-digit" })),
    1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (status === "checkedin") {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === "break") {
      breakRef.current = setInterval(() => setBreakTimer(t => t + 1), 1000);
    } else {
      if (breakRef.current) clearInterval(breakRef.current);
    }
    return () => { if (breakRef.current) clearInterval(breakRef.current); };
  }, [status]);

  useEffect(() => {
    fetchAttendance();
    fetchSales();
    fetchSkusAndBrands();
    fetchProfile();
    getLocation();
    // Check if terms accepted
    fetch('/api/auth/terms')
      .then(r=>r.json())
      .then(d=>{ if(!d.accepted){ setShowTerms(true); } });
    fetchNotifications();
    fetch('/api/auth/ba-summary?period=month')
      .then(r=>r.json())
      .then((d:any)=>{ if(d?.attendance) setMonthStats({present:d.attendance.present,absent:d.attendance.absent}); })
      .catch(()=>{});
  }, []);

  // Recalculate distance whenever GPS location or store coords change
  useEffect(() => {
    if (location && storeCoords) {
      const d = getDistanceMeters(location.latitude, location.longitude, storeCoords.lat, storeCoords.lng);
      setDistanceFromStore(Math.round(d));
    }
  }, [location, storeCoords]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────────

  const fetchProfile = async (): Promise<void> => {
    try {
      const res  = await fetch("/api/auth/me");
      const data = await res.json() as { user?: { fullName?: string; full_name?: string } };
      if (data.user) setUserName(data.user.fullName || data.user.full_name || "BA");
    } catch (_e: unknown) { /* silent */ }
  };

  const fetchAttendance = async (): Promise<void> => {
    try {
      const res  = await fetch("/api/auth/attendance");
      const data = await res.json() as { attendance: AttendanceRecord | null; assignment: StoreAssignment | null; storeLat?: number; storeLng?: number; storeAddress?: string };
      if (data.attendance) {
        setAttendance(data.attendance);
        setStoreName(data.attendance.store_name || "");
        setShiftName(data.attendance.shift_name || "");
        if (data.attendance.check_in && !data.attendance.check_out) {
          setStatus(data.attendance.break_start && !data.attendance.break_end ? "break" : "checkedin");
          const elapsed = Math.floor((Date.now() - new Date(data.attendance.check_in).getTime()) / 1000);
          setTimer(elapsed);
          if (data.attendance.break_start && !data.attendance.break_end) {
            setBreakTimer(Math.floor((Date.now() - new Date(data.attendance.break_start).getTime()) / 1000));
          }
        } else if (data.attendance.check_out) {
          setStatus("checkedout");
        }
      }
      // if (data.assignment) setAssignment(data.assignment);
if (data.assignment) {
  setAssignment(data.assignment);
  if (!data.attendance) {
    setStoreName((data.assignment as any).store_name || "");
    setShiftName((data.assignment as any).shift_name || "");
  }
}
      // Set store coords for geofence from the same response
      if (data.storeLat && data.storeLng) {
        setStoreCoords({ lat: data.storeLat, lng: data.storeLng });
      }
      if (data.storeAddress) setStoreAddress(data.storeAddress);
    } catch (_e: unknown) { /* silent */ }
  };

  const fetchSales = async (): Promise<void> => {
    try {
      const res  = await fetch("/api/auth/sales");
      const data = await res.json() as { sales: SalesEntry[]; brandTotals?: Record<string, number> };
      if (data.sales) setSales(data.sales);
      if (data.brandTotals) setBrandSales(data.brandTotals);
    } catch (_e: unknown) { /* silent */ }
  };

  const fetchSkusAndBrands = async (): Promise<void> => {
    try {
      const res  = await fetch("/api/auth/skus");
      const data = await res.json() as { skus: Sku[] };
      if (data.skus) {
        setSkus(data.skus);
        const uniqueBrands = [...new Set(data.skus.map(sk => sk.brand_name))];
        setBrands(uniqueBrands);
      }
    } catch (_e: unknown) { /* silent */ }
  };

  // ── Location ──────────────────────────────────────────────────────────────────

  // Haversine distance in meters
  const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<void> => {
    // Show coordinates immediately while fetching address
    setLocationName(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    try {
      // Use BigDataCloud API - free, no API key, very accurate for Pakistan
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json() as {
        locality?: string;
        city?: string;
        principalSubdivision?: string;
        countryName?: string;
        localityInfo?: { administrative?: Array<{ name: string; adminLevel: number }> };
      };

      const parts: string[] = [];
      if (data.locality)              parts.push(data.locality);
      else if (data.localityInfo?.administrative) {
        // Get neighbourhood/suburb level
        const admins = data.localityInfo.administrative;
        const suburb = admins.find(a => a.adminLevel >= 8);
        const area   = admins.find(a => a.adminLevel === 6 || a.adminLevel === 7);
        if (suburb) parts.push(suburb.name);
        if (area && area.name !== suburb?.name) parts.push(area.name);
      }
      if (data.city && !parts.includes(data.city)) parts.push(data.city);
      if (data.principalSubdivision && parts.length < 2) parts.push(data.principalSubdivision);

      if (parts.length > 0) {
        setLocationName(parts.slice(0, 3).join(", "));
      } else {
        // Fallback to Nominatim
        const r2 = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16&addressdetails=1`,
          { headers: { "Accept-Language": "en" }, signal: AbortSignal.timeout(5000) }
        );
        const d2 = await r2.json() as { address?: Record<string,string>; display_name?: string };
        if (d2?.address) {
          const a = d2.address;
          const p = [a.neighbourhood||a.suburb||a.road, a.city_district||a.town||a.city, a.state].filter(Boolean);
          setLocationName(p.slice(0,3).join(", ") || `${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        }
      }
    } catch (_e: unknown) {
      // Keep showing coordinates if geocoding fails
      setLocationName(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    }
  };

  const getLocation = (): void => {
    if (!navigator.geolocation) { setLocationName("Geolocation not supported"); return; }

    // Stop any existing watch
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    bestAccRef.current = 9999;
    setLocationName("Getting GPS...");

    const onSuccess = (pos: GeolocationPosition): void => {
      const { latitude, longitude, accuracy } = pos.coords;

      // Filter out readings worse than 500m (cell tower / IP-based)
      if (accuracy > 500) return;

      // Only update if this reading is more accurate than current best
      if (accuracy >= bestAccRef.current && bestAccRef.current < 30) return;
      bestAccRef.current = accuracy;

      // Show coordinates immediately — no waiting for geocoding
      setLocationName(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      setLocation({ latitude, longitude, accuracy });

      setStoreCoords(prev => {
        if (prev) {
          const d = getDistanceMeters(latitude, longitude, prev.lat, prev.lng);
          setDistanceFromStore(Math.round(d));
        }
        return prev;
      });

      // Only update map if moved more than 20m
      const last = lastMapUpdateRef.current;
      const movedEnough = !last || getDistanceMeters(latitude, longitude, last.lat, last.lng) > 20;
      if (movedEnough) {
        lastMapUpdateRef.current = { lat: latitude, lng: longitude };
        setMapLocation({ lat: latitude, lng: longitude });
      }

      // Geocode only once when accuracy is good — fire and forget, no await
      if (accuracy <= 50 && bestAccRef.current === accuracy) {
        reverseGeocode(latitude, longitude).catch(() => {});
      }
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setLocationName("Location permission denied");
        setDistanceFromStore(null);
      }
    };

    const opts: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000, // cache for 5 seconds — reduces battery drain and UI flicker
    };

    // Get initial fix immediately
    navigator.geolocation.getCurrentPosition(onSuccess, onError, opts);

    // Watch position — update every 5 seconds max
    watchRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000,
    });
  };

  // ── Actions ───────────────────────────────────────────────────────────────────

  const handleCircleClick = (): void => {
    const btn = BTN_CONFIG[status];
    if (!btn.action) return;
    if (status === "checkedin") { setShowConfirm(true); return; }
    handleAction(btn.action);
  };

  // Get fresh GPS position as a Promise
  const getFreshLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise(resolve => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        ()  => resolve(location ? { latitude: location.latitude, longitude: location.longitude } : null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    });
  };

  const handleAction = async (action: AttendanceAction): Promise<void> => {
    setShowConfirm(false);
    setLoading(true);
    try {
      // For check-in, get a fresh GPS reading at this exact moment
      let lat = location?.latitude;
      let lng = location?.longitude;
      if (action === "checkin") {
        showMsg("Getting your location...");
        const fresh = await getFreshLocation();
        if (fresh) {
          lat = fresh.latitude;
          lng = fresh.longitude;
          setLocation(prev => prev ? { ...prev, latitude: fresh.latitude, longitude: fresh.longitude } : { latitude: fresh.latitude, longitude: fresh.longitude, accuracy: 0 });
        }
      }

      const res  = await fetch("/api/auth/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, latitude: lat, longitude: lng }),
      });
      const data = await res.json() as { attendance?: AttendanceRecord; message?: string; distance?: number };
      if (res.ok && data.attendance) {
        setAttendance(data.attendance);
        if (action === "checkin")     { setStatus("checkedin");  setTimer(0);       showMsg("Checked in successfully!"); }
        if (action === "checkout")    { setStatus("checkedout");                    showMsg("Shift completed! Great work today!"); }
        if (action === "break_start") { setStatus("break");      setBreakTimer(0);  showMsg("Break started - enjoy!"); }
        if (action === "break_end")   { setStatus("checkedin");                     showMsg("Break ended - back to work!"); }
      } else {
        showMsg(data.message || "Error", true);
      }
    } catch (_e: unknown) { showMsg("Connection error", true); }
    setLoading(false);
  };

  // ── Sale form helpers ─────────────────────────────────────────────────────────

  const updateLine = (idx: number, field: "brand" | "category", value: string): void => {
    setSaleLines(prev => prev.map((l: SaleLine, i: number): SaleLine => {
      if (i !== idx) return l;
      const line = { ...l, [field]: value };
      if (field === "brand")    { line.category = ""; line.skuRows = []; line.selectedSkuIds = []; }
      if (field === "category") { line.skuRows = []; line.selectedSkuIds = []; }
      return line;
    }));
  };

  const toggleSkuSelection = (lineIdx: number, sku: Sku): void => {
    setSaleLines(prev => prev.map((l: SaleLine, i: number): SaleLine => {
      if (i !== lineIdx) return l;
      const alreadySelected = l.skuRows.some(r => r.sku_id === sku.sku_id);
      if (alreadySelected) {
        return { ...l, skuRows: l.skuRows.filter(r => r.sku_id !== sku.sku_id), selectedSkuIds: (l.selectedSkuIds || []).filter(id => id !== sku.sku_id) };
      } else {
        const newRow: SkuRow = { sku_id: sku.sku_id, sku_name: sku.sku_name, retail_price: parseFloat(String(sku.retail_price)) || 0, uom: sku.unit_of_measure || "", qty: 1 };
        return { ...l, skuRows: [...l.skuRows, newRow], selectedSkuIds: [...(l.selectedSkuIds || []), sku.sku_id] };
      }
    }));
  };

  const updateSkuQty = (lineIdx: number, skuId: number, qty: number): void => {
    setSaleLines(prev => prev.map((l: SaleLine, i: number): SaleLine => {
      if (i !== lineIdx) return l;
      return { ...l, skuRows: l.skuRows.map((r: SkuRow): SkuRow => r.sku_id === skuId ? { ...r, qty: Math.max(0, qty) } : r) };
    }));
  };

  const addLine    = (): void => setSaleLines(prev => [...prev, { brand:"", category:"", skuRows:[], selectedSkuIds:[] }]);
  const removeLine = (idx: number): void => setSaleLines(prev => prev.filter((_, i) => i !== idx));

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setSaleImage(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleZeroSale = (): void => {
    setZeroRemarks("");
    setShowZeroModal(true);
  };

  const submitZeroSale = async (): Promise<void> => {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [], remarks: zeroRemarks || "Zero sale - no products sold today", image: null }),
      });
      const data = await res.json() as { message?: string };
      if (res.ok) { showMsg("Zero sale submitted!"); setShowZeroModal(false); fetchSales(); }
      else showMsg(data.message || "Error", true);
    } catch (_e: unknown) { showMsg("Connection error", true); }
    setLoading(false);
  };

  const handleDeleteSale = async (saleEntryId: number): Promise<void> => {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sales_entry_id: saleEntryId }),
      });
      const data = await res.json() as { message?: string };
      if (res.ok) { showMsg("Sale entry removed!"); fetchSales(); }
      else showMsg(data.message || "Error", true);
    } catch (_e: unknown) { showMsg("Connection error", true); }
    setLoading(false);
  };

  const handleAddSale = async (): Promise<void> => {
    const itemsToSave = saleLines
      .flatMap(l => l.skuRows.map(r => ({ sku_id: r.sku_id, qty: parseInt(String(r.qty)) || 0, retail_price: r.retail_price })))
      .filter(i => i.qty > 0);
    if (itemsToSave.length === 0) { showMsg("Please add at least one item with quantity > 0", true); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToSave, remarks: saleRemarks, image: null }),
      });
      const data = await res.json() as { message?: string };
      if (res.ok) {
        // Update brand totals from saved lines
        const newBrandTotals: Record<string, number> = { ...brandSales };
        saleLines.forEach(line => {
          if (!line.brand) return;
          const lineTotal = line.skuRows.reduce((s, r) => s + r.qty * r.retail_price, 0);
          newBrandTotals[line.brand] = (newBrandTotals[line.brand] || 0) + lineTotal;
        });
        setBrandSales(newBrandTotals);
        showMsg("Sales entry saved!");
        setShowSaleForm(false);
        setSaleRemarks("");
        setSaleImage(null);
        setImagePreview(null);
        setSaleLines([{ brand:"", category:"", skuRows:[], selectedSkuIds:[] }]);
        fetchSales();
      } else {
        showMsg(data.message || "Error saving sales", true);
      }
    } catch (_e: unknown) { showMsg("Connection error", true); }
    setLoading(false);
  };

  // ── Utilities ─────────────────────────────────────────────────────────────────

  const showMsg = (msg: string, isError: boolean = false): void => {
    setMessage({ text: msg, error: isError });
    setTimeout(() => setMessage(null), 3500);
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const fmtTime = (dt: string | null | undefined): string =>
    dt ? new Date(dt).toLocaleTimeString("en-PK", { hour:"2-digit", minute:"2-digit" }) : "--:--";

  const fmtDist = (m: number | null): string => {
    if (m === null) return "";
    if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
    return `${m}m`;
  };

  const logout = async (): Promise<void> => {
    await fetch("/api/auth/logout", { method:"POST" });
    router.push("/login");
  };
  const submitTerms = async (): Promise<void> => {
  setLoading(true);
  try {
    const res = await fetch('/api/auth/terms', { method:'POST' });
    if (res.ok) { setShowTerms(false); showMsg("Terms accepted. Welcome!"); }
    else showMsg("Error accepting terms", true);
  } catch { showMsg("Connection error", true); }
  setLoading(false);
};

  const submitLeave = async (): Promise<void> => {
    if (!leaveFrom || !leaveTo) { showMsg("Please select from and to dates", true); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/leaves", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action:"apply_leave", leave_type:leaveType, from_date:leaveFrom, to_date:leaveTo, reason:leaveRemarks }),
      });
      const data = await res.json() as { message?: string };
      if (res.ok) { showMsg(data.message || "Leave applied!"); setShowLeaveModal(false); setLeaveFrom(""); setLeaveTo(""); setLeaveRemarks(""); setLeaveType("casual"); }
      else showMsg(data.message || "Error", true);
    } catch { showMsg("Connection error", true); }
    setLoading(false);
  };

  const submitResignation = async (): Promise<void> => {
    const reason = resignReason === "other" ? resignOther.trim() : {
      "low_salary": "Low Salary",
      "better_opportunity": "Better Opportunity",
      "personal_reasons": "Personal Reasons",
      "health_issues": "Health Issues",
      "relocation": "Relocation",
      "other": resignOther
    }[resignReason] || resignReason;
    if (!reason.trim()) { showMsg("Please provide a reason", true); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/leaves", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action:"apply_leave", leave_type:"resignation", from_date:new Date().toISOString().split("T")[0], to_date:new Date().toISOString().split("T")[0], reason }),
      });
      const data = await res.json() as { message?: string };
      if (res.ok) { showMsg("Resignation submitted!"); setShowResignModal(false); setResignReason("low_salary"); setResignOther(""); }
      else showMsg(data.message || "Error", true);
    } catch { showMsg("Connection error", true); }
    setLoading(false);
  };

  const fetchNotifications = async (): Promise<void> => {
    try {
      const res = await fetch("/api/auth/leaves");
      const data = await res.json() as { leaves?: Record<string,any>[] };
      setNotifications(data.leaves || []);
    } catch {}
  };

  // ── Derived values ────────────────────────────────────────────────────────────

  const totalSales = sales.reduce((sum, s) => sum + Number(s.total_sales || 0), 0);
  // salesByBrand = saved brand totals + live preview from current form
  const liveBrandTotals: Record<string, number> = { ...brandSales };
  saleLines.forEach(line => {
    if (!line.brand || !line.skuRows.length) return;
    line.skuRows.forEach(r => {
      if (r.qty > 0) liveBrandTotals[line.brand] = (liveBrandTotals[line.brand] || 0) + r.qty * r.retail_price;
    });
  });
  const salesByBrand = liveBrandTotals;
  const totalSalesForBar = Math.max(totalSales, Object.values(liveBrandTotals).reduce((s: number, v: number) => s + v, 0));
  const grandTotal = saleLines.reduce((s, l) => s + l.skuRows.reduce((rs, r) => rs + r.qty * r.retail_price, 0), 0);
  const GEOFENCE_METERS = 200;
  // Within range = no store coords set (geofence not configured) OR within 200m
  const isWithinRange: boolean = storeCoords === null || (distanceFromStore !== null && distanceFromStore <= GEOFENCE_METERS);
  // Location allowed = permission granted
  const locationAllowed: boolean = locationName !== "Location permission denied" && locationName !== "Geolocation not supported" && locationName !== "Fetching location...";
  const canCheckIn: boolean = status === "idle" ? (locationAllowed && isWithinRange) : true;

  const btn = BTN_CONFIG[status];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { background: #F1F5F9; overflow-x: hidden; }
        .root { min-height: 100vh; background: #F1F5F9; font-family: 'Inter', sans-serif; color: #0F172A; }

        /* ── TOPBAR ── */
        .topbar { background: linear-gradient(145deg, #042F49 0%, #073D5F 50%, #0B4F77 100%); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 54px; gap: 6px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .logo { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; overflow: hidden; }
        .logo-icon { width: 40px; height: 40px ;padding:5px;border-radius:50px;background: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Poppins',sans-serif; font-weight: 800; font-size: 11px; color: #fff; flex-shrink: 0; }
        .logo-name { font-family: 'Poppins',sans-serif; font-weight: 800; font-size: 13px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .logo-sub { font-size: 9px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
        .top-clock { font-family: 'Poppins',sans-serif; font-size: 14px; font-weight: 800; color: #10B981; flex-shrink: 0; }
        .top-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .ba-pill { padding: 3px 8px; border-radius: 20px; background: rgba(16,185,129,0.2); font-size: 10px; color: #6EE7B7; font-weight: 600; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
        .store-pill { padding: 3px 8px; border-radius: 20px; background: rgba(255,255,255,0.1); font-size: 10px; color: rgba(255,255,255,0.8); font-weight: 600; white-space: nowrap; }
        .rules-btn { padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .logout-btn { padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.7); font-size: 11px; cursor: pointer; flex-shrink: 0; }

        /* ── MAIN ── */
        .main { padding: 16px; max-width: 1200px; margin: 0 auto; }

        /* ── STAT CARDS ── */
        .top-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 14px; }
        .scard {display: flex;background: #fff;border: 1px solid #E2E8F0;border-radius: 14px;padding: 12px 14px;justify-content: center;min-width: 0;overflow: hidden;flex-direction: column; }
        .scard-label { font-size: 9px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .scard-value { font-family: 'Poppins',sans-serif; font-size: 18px; font-weight: 800; color: #0F172A; }
        .scard-sub { font-size: 10px; color: #94A3B8; margin-top: 2px; }

        /* ── MID GRID ── */
        .mid-grid { display: grid; grid-template-columns: 380px 1fr; gap: 16px; margin-bottom: 16px; align-items: start; }
        .checkin-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 20px; padding: 28px 20px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
        .geo-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }

        /* ── CIRCLE BTN ── */
        .circle-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .pulse-ring { position: absolute; border-radius: 50%; animation: pls 2s ease-in-out infinite; }
        @keyframes pls { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.1);opacity:0.1} }
        .circle-btn { width: 150px; height: 150px; border-radius: 50%; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; transition: transform 0.25s; position: relative; z-index: 1; font-family: 'Poppins',sans-serif; }
        .circle-btn:hover:not(:disabled) { transform: scale(1.05); }
        .circle-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .btn-label { font-size: 13px; font-weight: 800; letter-spacing: 0.08em; }
        .btn-sub { font-size: 10px; letter-spacing: 0.04em; opacity: 0.7; }
        .timer-big { font-family: 'Poppins',sans-serif; font-size: 28px; font-weight: 800; letter-spacing: 0.04em; }
        .break-btn { padding: 9px 0; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; width: 100%; max-width: 260px; }
        .break-idle { border: 2px solid #F59E0B; background: #FFFBEB; color: #D97706; }
        .break-active { border: 2px solid #F59E0B; background: #F59E0B; color: #fff; }
        .timeline { width: 100%; display: flex; flex-direction: column; gap: 7px; }
        .titem { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #F8FAFC; border-radius: 9px; border: 1px solid #E2E8F0; }
        .tdot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .tlabel { font-size: 12px; color: #64748B; flex: 1; }
        .ttime { font-size: 12px; font-family: 'Poppins',sans-serif; font-weight: 700; }
        .done-card { background: linear-gradient(135deg,#EEF2FF,#F0FDF4); border: 2px solid #C7D2FE; border-radius: 16px; padding: 18px; text-align: center; width: 100%; }
        .done-title { font-family: 'Poppins',sans-serif; font-size: 15px; font-weight: 800; color: #4338CA; margin-bottom: 6px; }
        .done-sub { font-size: 12px; color: #6366F1; }

        /* ── GEO / SUMMARY ── */
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
        .sum-item { background: #F8FAFC; border-radius: 10px; border: 1px solid #E2E8F0; padding: 10px 12px; }
        .sum-label { font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .sum-val { font-family: 'Poppins',sans-serif; font-size: 13px; font-weight: 800; }

        /* ── BOT GRID ── */
        .bot-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        .sales-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .brands-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .card-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .card-title { font-family: 'Poppins',sans-serif; font-size: 14px; font-weight: 700; color: #0F172A; }
        .add-btn { padding: 7px 14px; border-radius: 8px; border: none; background: linear-gradient(145deg, #042F49 0%, #073D5F 50%, #0B4F77 100%); color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
        .sale-form { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 0; }
        .form-total { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #EFF6FF; border-radius: 10px; border: 1px solid #BFDBFE; }
        .form-total-label { font-size: 12px; font-weight: 700; color: #1D4ED8; }
        .form-total-val { font-family: 'Poppins',sans-serif; font-size: 16px; font-weight: 800; color: #1D4ED8; }
        .remarks-input { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; font-size: 12px; font-family: inherit; resize: vertical; outline: none; color: #0F172A; margin-top: 8px; }
        .fsave { width: 100%; padding: 11px; border-radius: 10px; border: none; background: #10B981; color: #fff; font-family: 'Poppins',sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .fsave:disabled { opacity: 0.6; cursor: not-allowed; }
        .empty { text-align: center; color: #94A3B8; font-size: 13px; padding: 20px 0; }
        .sale-item { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; }
        .sale-brand { font-size: 13px; font-weight: 700; color: #0F172A; }
        .sale-qty { font-size: 11px; color: #94A3B8; margin-top: 2px; }
        .sale-amt { font-family: 'Poppins',sans-serif; font-size: 14px; font-weight: 800; color: #10B981; }
        .brand-row { display: flex; flex-direction: column; gap: 6px; }
        .brand-top { display: flex; justify-content: space-between; }
        .brand-name { font-size: 12px; font-weight: 700; color: #0F172A; }
        .brand-amt { font-size: 12px; font-weight: 700; color: #10B981; }
        .brand-bar { height: 6px; background: #F1F5F9; border-radius: 10px; overflow: hidden; }
        .brand-fill { height: 100%; background: linear-gradient(90deg,#10B981,#34D399); border-radius: 10px; transition: width 0.6s ease; }

        /* ── MODALS ── */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; backdrop-filter: blur(2px); }
        .confirm-box { background: #fff; border-radius: 20px; padding: 28px 22px; max-width: 340px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; max-height: 90vh; overflow-y: auto; }
        .confirm-icon { font-size: 40px; }
        .confirm-title { font-family: 'Poppins',sans-serif; font-size: 17px; font-weight: 800; color: #0F172A; text-align: center; }
        .confirm-sub { font-size: 13px; color: #64748B; text-align: center; }
        .confirm-warning { font-size: 11px; color: #D97706; background: #FEF3C7; padding: 8px 12px; border-radius: 8px; text-align: center; width: 100%; }
        .confirm-btns { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
        .confirm-cancel { flex: 1; padding: 10px; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #fff; color: #64748B; font-size: 13px; font-weight: 600; cursor: pointer; }
        .confirm-yes { flex: 1; padding: 10px; border-radius: 10px; border: none; background: #EF4444; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
        .confirm-yes:disabled { opacity: 0.6; cursor: not-allowed; }
        .rules-box { background: #fff; border-radius: 20px; padding: 22px; max-width: 360px; width: 100%; display: flex; flex-direction: column; gap: 12px; max-height: 85vh; overflow-y: auto; }
        .rules-header { display: flex; align-items: center; justify-content: space-between; }
        .rules-title { font-family: 'Poppins',sans-serif; font-size: 15px; font-weight: 800; color: #0F172A; }
        .rules-close { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #E2E8F0; background: #F8FAFC; color: #64748B; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; }
        .rule-item { display: flex; align-items: flex-start; gap: 10px; }
        .rule-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .rule-text { font-size: 13px; color: #374151; line-height: 1.5; }

        /* ── TOAST ── */
        .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 9999; animation: slideup 0.3s ease; max-width: 90vw; text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .toast-ok { background: #10B981; color: #fff; }
        .toast-err { background: #EF4444; color: #fff; }
        @keyframes slideup { from{transform:translateX(-50%) translateY(20px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }

        /* ── SUMMARY TABLE ── */
        .sum-table-wrap { display: block; overflow-x: auto; }
        .sum-cards-wrap { display: none; }

        /* ════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════ */

        /* Large desktop */
        @media(min-width:1200px) {
          .main { padding: 20px 28px; }
          .mid-grid { grid-template-columns: 400px 1fr; }
        }

        /* Tablet landscape / small desktop */
        @media(max-width:1100px) {
          .bot-grid { grid-template-columns: 1fr; }
          .brands-card { display: none; }
        }

        /* Tablet */
        @media(max-width:960px) {
          .mid-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        }

        /* Mobile landscape / small tablet */
        @media(max-width:768px) {
          .main { padding: 10px; }
          .top-stats { grid-template-columns: repeat(3,1fr); gap: 6px; margin-bottom: 10px; }
          .scard { padding: 10px 10px; border-radius: 12px; }
          .scard-label { font-size: 8px; letter-spacing: 0.05em; }
          .scard-value { font-size: 15px; }
          .mid-grid { grid-template-columns: 1fr; gap: 10px; }
          .bot-grid { grid-template-columns: 1fr; }
          .checkin-card { padding: 18px 14px; gap: 14px; border-radius: 16px; }
          .geo-card { border-radius: 16px; padding: 14px; }
          .circle-btn { width: 130px; height: 130px; }
          .timer-big { font-size: 24px; }
          .logo-sub { display: none; }
          .store-pill { display: none; }
          .rules-btn span { display: none; }
          .sum-table-wrap { display: none; }
          .sum-cards-wrap { display: block; }
          .topbar { padding: 0 10px; }
        }

        /* Mobile portrait */
        @media(max-width:480px) {
          .main { padding: 8px; }
          .top-stats { grid-template-columns: repeat(3,1fr); gap: 5px; }
          .scard { padding: 8px 8px; border-radius: 10px; }
          .scard-label { font-size: 7.5px; margin-bottom: 3px; }
          .scard-value { font-size: 13px; }
          .scard-sub { font-size: 9px; }
          .checkin-card { padding: 14px 12px; gap: 12px; border-radius: 14px; }
          .geo-card { padding: 10px; border-radius: 14px; }
          .circle-btn { width: 120px; height: 120px; }
          .timer-big { font-size: 21px; }
          .topbar { height: 48px; padding: 0 8px; }
          .top-clock { font-size: 12px; }
          .logo-name { font-size: 11px; }
          .ba-pill { display: none; }
          .confirm-box { padding: 18px 14px; border-radius: 16px; }
          .summary-grid { grid-template-columns: 1fr 1fr; }
          .btn-label { font-size: 11px; }
          .btn-sub { font-size: 9px; }
        }

        /* Very small phones */
        @media(max-width:360px) {
          .main { padding: 6px; }
          .top-stats { grid-template-columns: repeat(3,1fr); gap: 4px; }
          .scard { padding: 7px 6px; border-radius: 9px; }
          .scard-label { font-size: 7px; }
          .scard-value { font-size: 12px; }
          .circle-btn { width: 110px; height: 110px; }
          .timer-big { font-size: 19px; }
          .topbar { height: 46px; }
          .logout-btn { display: none; }
          .top-clock { font-size: 11px; }
        }

        /* Touch devices */
        @media(hover:none) {
          .circle-btn:active:not(:disabled) { transform: scale(0.96); }
          .add-btn:active { opacity: 0.8; }
        }

        /* Select dropdown arrow fix */
        select { -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 20 20' fill='%2364748B'%3E%3Cpath fillRule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clipRule='evenodd'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; padding-right: 26px !important; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="root">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="logo">
            <div className="logo-icon"><Image src={Logo} alt="TrackForce Logo" width={250} height={50} /></div>
            <div>
              <div className="logo-name">    
                <svg width="13" height="13" viewBox="0 0 20 20" fill="#94A3B8">
                    {new Date().getHours() < 12
                      ? <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                      : <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    }
                </svg>{userName}</div>
                              
              <div className="logo-sub">
               
                {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"}</div>
  
            </div>
          </div>
          <div className="top-clock">{time}</div>
          <div className="top-right">
            <div className="ba-pill" style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#10B981" }}/>Online
            </div>


                 {/* hiding store and shift name */}
            {/* {storeName && <div className="store-pill" style={{ display:"flex", alignItems:"center", gap:4 }}><svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>{storeName}</div>}
            {shiftName && <div className="store-pill" style={{ display:"flex", alignItems:"center", gap:4 }}><svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>{shiftName}</div>} */}
            {/* Notification Bell */}


            <div style={{position:"relative"}}>
              <button onClick={()=>setShowNotif(!showNotif)}
                style={{padding:"4px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.8)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                {notifications.filter(n=>n.status!=="pending").length > 0 && (
                  <span style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {notifications.filter(n=>n.status!=="pending").length}
                  </span>
                )}
              </button>
              {showNotif && (
                <div style={{position:"absolute",top:36,right:0,width:280,background:"#fff",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",zIndex:200,overflow:"hidden"}}>
                  <div style={{padding:"10px 14px",background:"#0d4567",color:"#fff",fontSize:12,fontWeight:700}}>Leave Notifications</div>
                  {notifications.length===0?(
                    <div style={{padding:16,textAlign:"center",color:"#94A3B8",fontSize:12}}>No notifications</div>
                  ):notifications.map((n,i)=>(
                    <div key={i} style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"flex-start",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:n.status==="approved"?"#10B981":"#EF4444",marginTop:4,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#0F172A",textTransform:"capitalize"}}>{n.leave_type} Leave — <span style={{color:n.status==="approved"?"#10B981":"#EF4444"}}>{n.status}</span></div>
                        <div style={{fontSize:10,color:"#64748B"}}>{n.from_date?.slice(0,10)} to {n.to_date?.slice(0,10)}</div>
                        {n.reviewed_by_name && <div style={{fontSize:10,color:"#94A3B8"}}>by {n.reviewed_by_name} ({n.reviewed_by_role})</div>}
                        {n.admin_note && <div style={{fontSize:10,color:"#64748B",fontStyle:"italic"}}>"{n.admin_note}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* <button className="rules-btn" onClick={() => setShowRules(true)}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
              <span>Rules</span>
            </button> */}



            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main">



          {/* 3 TOP STAT CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
            {/* Card 1: TD / MTD */}
            <div className="scard">
              <div className="scard-label">Today Sale / Month to Date</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4, flexWrap:"wrap" }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:8, color:"#94A3B8", fontWeight:600, marginBottom:1 }}>Today</div>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontSize:"clamp(12px,3vw,17px)", fontWeight:800, color:"#1E3A8A", whiteSpace:"nowrap" }}>Rs {totalSales.toLocaleString()}</div>
                </div>
                <div style={{ width:1, height:24, background:"#E2E8F0", flexShrink:0 }}/>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:8, color:"#94A3B8", fontWeight:600, marginBottom:1 }}>By Month to Date</div>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontSize:"clamp(12px,3vw,17px)", fontWeight:800, color:"#10B981", whiteSpace:"nowrap" }}>Rs {totalSales.toLocaleString()}</div>
                </div>
              </div>
            </div>


            
            {/* Card 2: Present / Absent */}
            <div className="scard">
              <div className="scard-label">Attendance · {new Date().toLocaleString("default",{month:"long",year:"numeric"})}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, flexWrap:"wrap" }}>
                <div style={{ textAlign:"center", flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontSize:"clamp(18px,4vw,26px)", fontWeight:800, color:"#10B981", lineHeight:1 }}>
                    {monthStats.present}
                  </div>
                  <div style={{ fontSize:"clamp(8px,1.8vw,10px)", color:"#10B981", fontWeight:600, marginTop:2 }}>Present</div>
                </div>
                <div style={{ width:1, height:32, background:"#E2E8F0", flexShrink:0 }}/>
                <div style={{ textAlign:"center", flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontSize:"clamp(18px,4vw,26px)", fontWeight:800, color:"#EF4444", lineHeight:1 }}>
                    {monthStats.absent}
                  </div>
                  <div style={{ fontSize:"clamp(8px,1.8vw,10px)", color:"#EF4444", fontWeight:600, marginTop:2 }}>Absent</div>
                </div>
                <div style={{ width:1, height:32, background:"#E2E8F0", flexShrink:0 }}/>
                <div style={{ textAlign:"center", flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontSize:"clamp(18px,4vw,26px)", fontWeight:800, color:"#64748B", lineHeight:1 }}>
                    {new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate()}
                  </div>
                  <div style={{ fontSize:"clamp(8px,1.8vw,10px)", color:"#64748B", fontWeight:600, marginTop:2 }}>Total</div>
                </div>
              </div>
            </div>
            {/* Card 3: Status */}
            <div className="scard">
              <div className="scard-label">Status</div>
              <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
                <span style={{ padding:"3px 8px", borderRadius:20, fontSize:"clamp(9px,2vw,12px)", fontWeight:700, display:"inline-flex", alignItems:"center", gap:4, alignSelf:"flex-start",
                  background: status==="checkedin" ? "#DCFCE7" : status==="break" ? "#FEF3C7" : status==="checkedout" ? "#EEF2FF" : "#F1F5F9",
                  color:      status==="checkedin" ? "#16A34A" : status==="break" ? "#D97706" : status==="checkedout" ? "#6366F1" : "#94A3B8" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", flexShrink:0 }}/>
                  {status==="idle" ? "Not Checked In" : status==="checkedin" ? "Present" : status==="break" ? "On Break" : "Shift Done"}

                </span>
                 <div>
         </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  {storeName && (
                    <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#64748B", fontWeight:600 }}>
                      <svg width="11" height="11" viewBox="0 0 20 20" fill="#94A3B8"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                      {storeName}
                    </div>
                  )}
                  {shiftName && (
                    <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#64748B", fontWeight:600 }}>
                      <svg width="11" height="11" viewBox="0 0 20 20" fill="#94A3B8"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                      {shiftName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE ROW */}
          <div className="mid-grid">
            {/* CHECK-IN CARD */}
            <div className="checkin-card">
              {/* Greeting — SVG icon, no emoji */}
              <div style={{ textAlign:"center", width:"100%", paddingBottom:4 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginBottom:4 }}>
               
                  {/* <span style={{ fontSize:11, color:"#94A3B8", fontWeight:500 }}>
                    {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"}
                  </span> */}
                </div>
                {/* <div style={{ fontFamily:"Poppins,sans-serif", fontSize:20, fontWeight:800, color:"#0F172A", lineHeight:1.2 }}>{userName}</div> */}
              </div>
              <div className="checkin-title" style={{ fontSize:12, color:"#64748B", marginTop:-4 }}>
                {status==="idle" && !canCheckIn && distanceFromStore !== null && "You are out of location"}
                {status==="idle" && isWithinRange && locationAllowed && "You are in your location — start your shift!"}
                {status==="idle" && distanceFromStore === null && locationAllowed && "Getting your location..."}
                {status==="idle" && !locationAllowed && "Enable location to check in"}
                {status==="checkedin"  && "You are checked in — working!"}
                {status==="break"      && "Enjoy your break"}
                {status==="checkedout" && "Shift completed for today!"}
              </div>


              <div className="circle-wrap">
                <div className="pulse-ring" style={{ width:195, height:195, border:`2px solid ${(status==="idle" && !canCheckIn) ? "#CBD5E1" : btn.color}`, opacity: (status==="checkedout" || (status==="idle" && !canCheckIn)) ? 0 : 0.25 }} />
                <div className="pulse-ring" style={{ width:175, height:175, border:`2px solid ${(status==="idle" && !canCheckIn) ? "#CBD5E1" : btn.color}`, opacity: (status==="checkedout" || (status==="idle" && !canCheckIn)) ? 0 : 0.15, animationDelay:"0.5s" }} />
                <button className="circle-btn" disabled={loading || status==="checkedout" || !canCheckIn} onClick={handleCircleClick}
                  style={{
                    background: (status==="idle" && !canCheckIn) ? "#F1F5F9" : btn.bg,
                    border: `3px solid ${(status==="idle" && !canCheckIn) ? "#CBD5E1" : btn.border}`,
                    boxShadow: (status==="checkedout" || (status==="idle" && !canCheckIn)) ? "none" : `0 8px 32px ${btn.shadow}, 0 0 0 6px ${btn.bg}`
                  }}>
                  <div className="btn-label" style={{ color: (status==="idle" && !canCheckIn) ? "#94A3B8" : btn.color }}>
                    {loading ? "..." : (status==="idle" && !canCheckIn) ? "CHECK IN" : btn.label}
                  </div>
                  <div className="btn-sub" style={{ color: (status==="idle" && !canCheckIn) ? "#94A3B8" : btn.color }}>
                    {loading ? "Please wait" : (status==="idle" && !canCheckIn && distanceFromStore !== null) ? `${fmtDist(distanceFromStore)} away` : btn.sub}
                  </div>
                </button>
              </div>
              <div className="timer-big" style={{ color: (status==="idle" && !canCheckIn) ? "#CBD5E1" : btn.color }}>{formatTime(timer)}</div>
              {status==="checkedin" && <button className="break-btn break-idle" onClick={()=>handleAction("break_start")} disabled={loading}>Take a Break</button>}
              {status==="break"     && <button className="break-btn break-active" onClick={()=>handleAction("break_end")} disabled={loading}>End Break — {formatTime(breakTimer)}</button>}
              {status==="checkedout" && (
                <div className="done-card">
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="#6366F1"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  </div>
                  <div className="done-title">Shift Complete!</div>
                  <div className="done-sub">You cannot check in again today. See you tomorrow!</div>
                  {attendance?.check_in && attendance?.check_out && (
                    <div style={{ marginTop:12, fontSize:12, color:"#6366F1", fontWeight:600 }}>
                      {fmtTime(attendance.check_in)} → {fmtTime(attendance.check_out)}
                    </div>
                  )}
                </div>
              )}

              {/* ── MONTHLY TARGET PROGRESS ── */}
              <InlineTargetBar />

              {/* ── LEAVE & RESIGNATION BUTTONS ── */}
<div style={{ display:"flex", gap:8, width:"100%", justifyContent:"center" }}>
  <button onClick={() => setShowLeaveModal(true)}
    onMouseEnter={e => (e.currentTarget.style.background = "#073D5F")}
    onMouseLeave={e => (e.currentTarget.style.background = "#0B4F77")}
    style={{ padding:"8px 20px", borderRadius:5, border:"none", background:"#0B4F77", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"background 0.15s" }}>
    <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
    Apply Leave
  </button>
  <button onClick={() => setShowResignModal(true)}
    onMouseEnter={e => (e.currentTarget.style.background = "#af1c1c")}
    onMouseLeave={e => (e.currentTarget.style.background = "#a32626")}
    style={{ padding:"8px 20px", borderRadius:5, border:"none", background:"#c93131", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"background 0.15s" }}>
    <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
    Resign
  </button>
</div>

              {/* ── ATTENDANCE TIMELINE ── */}
              {attendance && (
                <div className="timeline">
                  {attendance.check_in    && <div className="titem"><div className="tdot" style={{ background:"#10B981" }} /><div className="tlabel">Checked In</div>    <div className="ttime" style={{ color:"#10B981" }}>{fmtTime(attendance.check_in)}</div></div>}
                  {attendance.break_start && <div className="titem"><div className="tdot" style={{ background:"#F59E0B" }} /><div className="tlabel">Break Started</div> <div className="ttime" style={{ color:"#F59E0B" }}>{fmtTime(attendance.break_start)}</div></div>}
                  {attendance.break_end   && <div className="titem"><div className="tdot" style={{ background:"#10B981" }} /><div className="tlabel">Break Ended</div>   <div className="ttime" style={{ color:"#10B981" }}>{fmtTime(attendance.break_end)}</div></div>}
                  {attendance.check_out   && <div className="titem"><div className="tdot" style={{ background:"#EF4444" }} /><div className="tlabel">Checked Out</div>   <div className="ttime" style={{ color:"#EF4444" }}>{fmtTime(attendance.check_out)}</div></div>}
                </div>
              )}
            </div>

            {/* GEOFENCE CARD — right side */}
            <div className="geo-card">
              <div style={{ fontFamily:"Poppins,sans-serif", fontSize:14, fontWeight:700, color:"#0F172A", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                Live Location
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {location?.accuracy && <span style={{ fontSize:10, fontWeight:500, padding:"2px 8px", borderRadius:20, background:"#F0FDF4", color:"#15803D", border:"1px solid #BBF7D0" }}>GPS ±{Math.round(location.accuracy)}m</span>}
                  {distanceFromStore !== null && storeCoords && (
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background: isWithinRange ? "#DCFCE7" : "#FEE2E2", color: isWithinRange ? "#15803D" : "#EF4444", border: `1px solid ${isWithinRange ? "#BBF7D0" : "#FCA5A5"}` }}>
                      {fmtDist(distanceFromStore)} from store
                    </span>
                  )}
                </div>
              </div>

              {/* GPS info */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#F8FAFC", borderRadius:10, border:"1px solid #E2E8F0", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", flexShrink:0, animation:"pls 2s ease-in-out infinite" }} />
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#0F172A", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{locationName}</div>
                    {location && <div style={{ fontSize:10, color:"#94A3B8", marginTop:2 }}>Lat: {location.latitude.toFixed(6)} | Lon: {location.longitude.toFixed(6)}</div>}
                  </div>
                </div>
                <button onClick={getLocation} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #E2E8F0", background:"#fff", color:"#64748B", fontSize:11, cursor:"pointer", fontWeight:600, flexShrink:0 }}>Refresh</button>
              </div>

              {/* Geofence Leaflet map */}
              {mapLocation && storeCoords ? (
                <div style={{ position:"relative", borderRadius:12, overflow:"hidden", border:"1px solid #E2E8F0" }}>
                  <iframe
                    key={`map-${Math.round(mapLocation.lat*1000)}-${Math.round(mapLocation.lng*1000)}`}
                    title="geofence-map-right"
                    width="100%"
                    height="320"
                    style={{ border:"none", display:"block" }}
                    srcDoc={`<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<style>html,body,#map{margin:0;padding:0;width:100%;height:320px;}</style>
</head><body><div id="map"></div>
<script>
  var baLat=${mapLocation.lat},baLng=${mapLocation.lng};
  var stLat=${storeCoords.lat},stLng=${storeCoords.lng};
  var dist=${distanceFromStore},within=${isWithinRange};
  var map=L.map('map',{zoomControl:true,attributionControl:true,scrollWheelZoom:true,touchZoom:true,doubleClickZoom:true,dragging:true,tap:true});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'OSM'}).addTo(map);
  map.fitBounds(L.latLngBounds([[baLat,baLng],[stLat,stLng]]).pad(0.35));
  L.circle([stLat,stLng],{radius:200,color:within?'#10B981':'#EF4444',fillColor:within?'#10B981':'#EF4444',fillOpacity:0.1,weight:2,dashArray:'6,4'}).addTo(map);
  L.polyline([[baLat,baLng],[stLat,stLng]],{color:within?'#10B981':'#EF4444',weight:2,dashArray:'5,5',opacity:0.6}).addTo(map);
  L.marker([stLat,stLng],{icon:L.divIcon({html:'<div style="background:#EF4444;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>',iconSize:[18,18],iconAnchor:[9,9],className:''})}).addTo(map).bindPopup('<b>Store</b>').openPopup();
  L.marker([baLat,baLng],{icon:L.divIcon({html:'<div style="background:#3B82F6;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>',iconSize:[16,16],iconAnchor:[8,8],className:''})}).addTo(map).bindPopup('<b>You</b>');
  var midLat=(baLat+stLat)/2,midLng=(baLng+stLng)/2;
  L.marker([midLat,midLng],{icon:L.divIcon({html:'<div style="background:rgba(0,0,0,0.75);color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">'+dist+'m</div>',className:'',iconAnchor:[25,12]})}).addTo(map);
</script></body></html>`}
                  />
                  <div style={{position:"absolute",top:8,right:8,zIndex:1000,background:"rgba(255,255,255,0.95)",borderRadius:8,padding:"6px 10px",fontSize:10,fontWeight:600,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column",gap:4,pointerEvents:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:"50%",background:"#3B82F6",border:"2px solid #fff"}}/>You</div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:"50%",background:"#EF4444",border:"2px solid #fff"}}/>Store</div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:2,background:isWithinRange?"#10B981":"#EF4444",borderRadius:2}}/>200m</div>
                  </div>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${storeCoords.lat},${storeCoords.lng}&travelmode=walking`}
                    target="_blank" rel="noopener noreferrer"
                    style={{position:"absolute",bottom:8,left:8,zIndex:1000,display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:10,background:"#1E3A8A",color:"#fff",fontSize:11,fontWeight:700,textDecoration:"none",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                    Navigate to Store
                  </a>
                </div>
              ) : (
                <div style={{height:320,background:"#F8FAFC",borderRadius:12,border:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}><svg width="16" height="16" viewBox="0 0 20 20" fill="#94A3B8"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg></div>
                  <div style={{fontSize:13,color:"#94A3B8"}}>Waiting for GPS signal...</div>
                </div>
              )}

              {/* Distance status + Directions button below map */}
              {storeCoords && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:"10px 14px", borderRadius:10,
                  background: distanceFromStore === null ? "#F8FAFC" : isWithinRange ? "#F0FDF4" : "#FEF2F2",
                  border: `1px solid ${distanceFromStore === null ? "#E2E8F0" : isWithinRange ? "#BBF7D0" : "#FCA5A5"}` }}>
                  <div>
                    {distanceFromStore === null ? (
                      <div style={{ fontSize:12, fontWeight:700, color:"#64748B" }}>Getting your location...</div>
                    ) : isWithinRange ? (
                      <>
                        <div style={{ fontSize:12, fontWeight:700, color:"#15803D", display:"flex", alignItems:"center", gap:5 }}>
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="#10B981"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                          You are {fmtDist(distanceFromStore)} from store
                        </div>
                        <div style={{ fontSize:10, color:"#16A34A" }}>Within 200m — Check in enabled</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize:12, fontWeight:700, color:"#EF4444", display:"flex", alignItems:"center", gap:5 }}>
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="#EF4444"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          You are {fmtDist(distanceFromStore)} away
                        </div>
                        <div style={{ fontSize:10, color:"#94A3B8" }}>Move within 200m to check in</div>
                      </>
                    )}
                  </div>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${storeCoords.lat},${storeCoords.lng}&travelmode=walking`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:20,
                      background:"#1E3A8A", color:"#fff", textDecoration:"none", fontSize:12, fontWeight:700,
                      flexShrink:0, boxShadow:"0 2px 6px rgba(30,58,138,0.3)" }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    Directions
                  </a>
                </div>
              )}

              {/* Today Summary */}
              <div style={{ fontSize:11, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.1em" }}>Today Summary</div>
              <div className="summary-grid">
                {[
                  { label:"Check In",    value:fmtTime(attendance?.check_in),    color:"#10B981" },
                  { label:"Check Out",   value:fmtTime(attendance?.check_out),   color:"#EF4444" },
                  { label:"Break Start", value:fmtTime(attendance?.break_start), color:"#F59E0B" },
                  { label:"Break End",   value:fmtTime(attendance?.break_end),   color:"#F59E0B" },
                ].map(item => (
                  <div className="sum-item" key={item.label}>
                    <div className="sum-label">{item.label}</div>
                    <div className="sum-val" style={{ color:item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* MONTHLY TARGET — right after Today Summary */}
              <SalaryBreakdown />
            </div>

          </div>

          {/* BOTTOM ROW */}
          <div className="bot-grid">
            {/* SALES CARD */}
            <div className="sales-card">
              <div className="card-head">
                <div className="card-title">Today's Sales</div>
                <div style={{ display:"flex", gap:8 }}>
                  {!showSaleForm && (
                    <button onClick={handleZeroSale} disabled={loading}
                      style={{ padding:"7px 14px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", color:"#94A3B8", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      0 No Sale
                    </button>
                  )}
                  <button className="add-btn" onClick={() => setShowSaleForm(!showSaleForm)}>
                    {showSaleForm ? "Cancel" : "+ Add Sale"}
                  </button>
                </div>
              </div>

              {/* SALE FORM - multi-product */}
              {showSaleForm && (
                <div className="sale-form">
                  <div style={{ fontSize:12, fontWeight:700, color:"#1E3A8A", marginBottom:10 }}>Add Sale Items</div>

                  {saleLines.map((line, idx) => {
                    const catOptions = line.brand
                      ? [...new Set(skus.filter(s => s.brand_name === line.brand).map(s => s.category_name))]
                      : [];
                    const availableSkus = (line.brand && line.category)
                      ? skus.filter(s => s.brand_name === line.brand && s.category_name === line.category)
                      : [];
                    const lineTotal = line.skuRows.reduce((s, r) => s + r.qty * r.retail_price, 0);
                    return (
                      <div key={`line-${idx}`} style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:12, padding:12, marginBottom:10 }}>

                        {/* Brand + Category + remove */}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, marginBottom:10, alignItems:"end" }}>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Brand</div>
                            <select style={{ width:"100%", padding:"7px 10px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:12, outline:"none", color:"#0F172A", background:"#fff" }}
                              value={line.brand} onChange={e => updateLine(idx, "brand", e.target.value)}>
                              <option value="">Select Brand</option>
                              {[...new Set(skus.map(s => s.brand_name))].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Category</div>
                            <select style={{ width:"100%", padding:"7px 10px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:12, outline:"none", color:"#0F172A", background:"#fff" }}
                              value={line.category} onChange={e => updateLine(idx, "category", e.target.value)} disabled={!line.brand}>
                              <option value="">Select Category</option>
                              {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          {saleLines.length > 1 && (
                            <button onClick={() => removeLine(idx)}
                              style={{ width:28, height:28, borderRadius:6, border:"1px solid #FCA5A5", background:"#FEE2E2", color:"#EF4444", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              &#x2715;
                            </button>
                          )}
                        </div>

                        {/* Product checkboxes — tick to select */}
                        {availableSkus.length > 0 && (
                          <div style={{ marginBottom: line.skuRows.length ? 10 : 0 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>
                              Select Products <span style={{ color:"#CBD5E1", fontWeight:400, textTransform:"none" }}>(tick all that apply)</span>
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                              {availableSkus.map(sku => {
                                const isChecked = (line.selectedSkuIds || []).includes(sku.sku_id);
                                return (
                                  <label key={sku.sku_id}
                                    style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, border:`1.5px solid ${isChecked ? "#BBF7D0" : "#E2E8F0"}`, background: isChecked ? "#F0FDF4" : "#fff", cursor:"pointer", userSelect:"none" }}>
                                    <input type="checkbox" checked={isChecked} onChange={() => toggleSkuSelection(idx, sku)}
                                      style={{ width:15, height:15, accentColor:"#10B981", flexShrink:0 }} />
                                    <span style={{ flex:1, fontSize:12, fontWeight: isChecked ? 700 : 500, color: isChecked ? "#166534" : "#374151" }}>{sku.sku_name}</span>
                                    <span style={{ fontSize:11, fontWeight:700, color:"#10B981", flexShrink:0 }}>Rs {Number(sku.retail_price).toLocaleString()} / {sku.unit_of_measure}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {line.brand && line.category && availableSkus.length === 0 && (
                          <div style={{ padding:10, textAlign:"center", fontSize:11, color:"#94A3B8" }}>No products found for this category</div>
                        )}

                        {/* Qty inputs for selected products */}
                        {line.skuRows.length > 0 && (
                          <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:8, overflow:"hidden" }}>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 96px 80px", gap:4, padding:"6px 10px", background:"#F1F5F9", borderBottom:"1px solid #E2E8F0" }}>
                              {["Product","Price","Qty","Total"].map(h => (
                                <div key={h} style={{ fontSize:9, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.07em", textAlign: h==="Total" ? "right" : h==="Qty" ? "center" : "left" }}>{h}</div>
                              ))}
                            </div>
                            {line.skuRows.map(row => (
                              <div key={row.sku_id} style={{ display:"grid", gridTemplateColumns:"1fr 90px 96px 80px", gap:4, padding:"8px 10px", borderBottom:"1px solid #F1F5F9", alignItems:"center", background:"#F0FDF4" }}>
                                <div style={{ fontSize:11, fontWeight:600, color:"#0F172A", lineHeight:1.3 }}>
                                  {row.sku_name}
                                  <span style={{ display:"block", fontSize:9, color:"#94A3B8", fontWeight:400 }}>{row.uom}</span>
                                </div>
                                <div style={{ fontSize:11, fontWeight:700, color:"#10B981" }}>Rs {row.retail_price.toLocaleString()}</div>
                                <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                                  <button onClick={() => updateSkuQty(idx, row.sku_id, row.qty - 1)}
                                    style={{ width:24, height:24, borderRadius:5, border:"1px solid #FCA5A5", background:"#FEE2E2", color:"#EF4444", cursor:"pointer", fontSize:14, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>-</button>
                                  <input type="number" min={1} value={row.qty}
                                    onChange={e => updateSkuQty(idx, row.sku_id, Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{ width:36, textAlign:"center", border:"1.5px solid #E2E8F0", borderRadius:5, fontSize:12, fontWeight:700, padding:"3px 0", outline:"none", color:"#0F172A" }} />
                                  <button onClick={() => updateSkuQty(idx, row.sku_id, row.qty + 1)}
                                    style={{ width:24, height:24, borderRadius:5, border:"1px solid #BBF7D0", background:"#F0FDF4", color:"#10B981", cursor:"pointer", fontSize:14, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
                                </div>
                                <div style={{ fontSize:12, fontWeight:800, color:"#10B981", textAlign:"right" }}>
                                  Rs {(row.qty * row.retail_price).toLocaleString()}
                                </div>
                              </div>
                            ))}
                            {lineTotal > 0 && (
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", background:"#DCFCE7", borderTop:"1px solid #BBF7D0" }}>
                                <span style={{ fontSize:11, color:"#166534", fontWeight:600 }}>{line.brand} &bull; {line.category} subtotal</span>
                                <span style={{ fontSize:13, fontWeight:800, color:"#15803D" }}>Rs {lineTotal.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button onClick={addLine}
                    style={{ width:"100%", padding:8, border:"1.5px dashed #CBD5E1", borderRadius:8, background:"transparent", color:"#64748B", fontSize:12, fontWeight:600, cursor:"pointer", marginBottom:10 }}>
                    + Add Another Brand / Category
                  </button>

                  <div className="form-total">
                    <span className="form-total-label">Entry Total</span>
                    <span className="form-total-val">Rs {grandTotal.toLocaleString()}</span>
                  </div>

                  <textarea className="remarks-input" rows={2} placeholder="Remarks (optional)..." value={saleRemarks} onChange={e => setSaleRemarks(e.target.value)} />

                  <button className="fsave" onClick={handleAddSale} disabled={loading}>{loading ? "Saving..." : "Save Sales Entry"}</button>
                </div>
              )}

              {/* Sales list */}
              {sales.length === 0 ? (
                <div className="empty">No sales recorded today</div>
              ) : (
                sales.map((sale: Record<string,any>, i: number) => {
                  const isZero = Number(sale.total_sales || 0) === 0;
                  return (
                    <div className="sale-item" key={i} style={{ flexDirection:"column", alignItems:"stretch", gap:8, background: isZero ? "#FFFBEB" : "#F8FAFC", border: isZero ? "1.5px solid #FDE68A" : "1px solid #E2E8F0" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="sale-brand">{sale.store_name || "Sales Entry"}</div>
                          <div className="sale-qty">
                            {sale.sales_date} · {sale.item_count || 0} items
                            {isZero && <span style={{ marginLeft:6, padding:"2px 8px", background:"#FEF3C7", color:"#D97706", borderRadius:20, fontSize:10, fontWeight:700 }}>Zero Sale</span>}
                          </div>
                          {isZero && sale.remarks && sale.remarks !== "Zero sale - no products sold today" && (
                            <div style={{ marginTop:4, fontSize:10, color:"#92400E", fontStyle:"italic", background:"#FEF9C3", padding:"2px 8px", borderRadius:6, display:"inline-block" }}>
                              Note: {sale.remarks}
                            </div>
                          )}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          <div className="sale-amt">Rs {Number(sale.total_sales || 0).toLocaleString()}</div>
                          <button onClick={() => handleDeleteSale(sale.sales_entry_id)} disabled={loading}
                            title={isZero ? "Undo zero sale" : "Delete entry"}
                            style={{ padding:"4px 10px", borderRadius:6, border: isZero ? "1px solid #FCD34D" : "1px solid #FCA5A5", background: isZero ? "#FEF3C7" : "#FEF2F2", color: isZero ? "#D97706" : "#EF4444", cursor:"pointer", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                            {isZero ? "Undo" : "x"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {sales.length > 0 && (
                <div style={{ borderTop:"1px solid #E2E8F0", marginTop:12, paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, color:"#64748B" }}>Total Today</span>
                  <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:800, fontSize:18, color:"#10B981" }}>Rs {totalSales.toLocaleString()}</span>
                </div>
              )}

              {/* DAILY PHOTO — outside sale form */}
              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #F1F5F9" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:10 }}>&#128247; Daily Photo</div>
                {!imagePreview ? (
                  <div>
                    <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, padding:"16px 10px", border:"2px dashed #93C5FD", borderRadius:12, background:"#EFF6FF", cursor:"pointer", textAlign:"center" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span style={{ fontSize:11, fontWeight:700, color:"#2563EB" }}>Open Camera</span>
                      <span style={{ fontSize:10, color:"#93C5FD" }}>Take a photo</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{ display:"none" }} />
                    </label>

                  </div>
                ) : (
                  <div style={{ position:"relative" }}>
                    <img src={imagePreview} alt="preview" style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:10, border:"2px solid #BBF7D0", display:"block" }} />
                    <button onClick={() => { setSaleImage(null); setImagePreview(null); }}
                      style={{ position:"absolute", top:8, right:8, width:30, height:30, borderRadius:"50%", border:"none", background:"rgba(0,0,0,0.65)", color:"#fff", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
                      &#x2715;
                    </button>
                    <label style={{ position:"absolute", bottom:8, right:8, padding:"5px 12px", borderRadius:20, background:"rgba(0,0,0,0.6)", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Retake
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{ display:"none" }} />
                    </label>
                    <div style={{ marginTop:6, fontSize:11, color:"#10B981", fontWeight:600 }}>&#10003; Photo ready to submit</div>
                  </div>
                )}
              </div>
            </div>

            {/* BRANDS CARD */}
            <div className="brands-card">
              <div className="card-head"><div className="card-title">Sales by Brand</div></div>
              {brands.length === 0 ? (
                <div className="empty">Loading brands...</div>
              ) : (
                brands.map(brand => {
                  const bt  = salesByBrand[brand] || 0;
                  const pct = totalSalesForBar > 0 ? (bt / totalSalesForBar) * 100 : 0;
                  return (
                    <div className="brand-row" key={brand}>
                      <div className="brand-top">
                        <span className="brand-name">{brand}</span>
                        <span className="brand-amt">Rs {bt.toLocaleString()}</span>
                      </div>
                      <div className="brand-bar"><div className="brand-fill" style={{ width:`${pct}%` }} /></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MY SUMMARY — at the very bottom */}
          <SummarySection storeName={storeName} shiftName={shiftName} attendance={attendance} tdSalesAmount={totalSales} />

        </div>

        {/* ZERO SALE MODAL */}
        {showZeroModal && (
          <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowZeroModal(false)}>
            <div className="confirm-box">
              <div className="confirm-icon">
                <svg width="32" height="32" viewBox="0 0 20 20" fill="#D97706"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
              </div>
              <div className="confirm-title">Report Zero Sale?</div>
              <div className="confirm-sub">You are about to record that no products were sold today.</div>
              <div style={{ width:"100%", marginTop:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#64748B", marginBottom:6, textAlign:"left" }}>
                  Reason / Remarks <span style={{ color:"#94A3B8", fontWeight:400 }}>(optional)</span>
                </div>
                <textarea rows={3} placeholder="e.g. Store was closed, no customers, product out of stock..."
                  value={zeroRemarks} onChange={e => setZeroRemarks(e.target.value)}
                  style={{ width:"100%", border:"1.5px solid #E2E8F0", borderRadius:8, padding:"8px 10px", fontSize:12, fontFamily:"inherit", resize:"vertical", outline:"none", color:"#0F172A" }} />
              </div>
              <div className="confirm-warning">You can undo this later using the Undo button on the entry.</div>
              <div className="confirm-btns">
                <button className="confirm-cancel" onClick={() => setShowZeroModal(false)}>No, Go Back</button>
                <button className="confirm-yes" style={{ background:"#D97706", boxShadow:"0 4px 12px rgba(217,119,6,0.3)" }}
                  onClick={submitZeroSale} disabled={loading}>{loading ? "Submitting..." : "Yes, Zero Sale"}</button>
              </div>
            </div>
          </div>
        )}

        {/* CHECKOUT CONFIRM MODAL */}
        {showConfirm && (
          <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}>
            <div className="confirm-box">
              <div className="confirm-icon">
                <svg width="32" height="32" viewBox="0 0 20 20" fill="#EF4444"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
              </div>
              <div className="confirm-title">Confirm Check Out?</div>
              <div className="confirm-sub">Make sure you have added all your sales before checking out.</div>
              <div className="confirm-warning">Once you check out, you cannot check in again today!</div>
              <div className="confirm-btns">
                <button className="confirm-cancel" onClick={() => setShowConfirm(false)}>No, Go Back</button>
                <button className="confirm-yes" onClick={() => handleAction("checkout")}>Yes, Check Out</button>
              </div>
            </div>
          </div>
        )}

        {/* RULES MODAL */}
        {/* {showRules && (
          <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowRules(false)}>
            <div className="rules-box">
              <div className="rules-header">
                <div className="rules-title">Attendance Rules</div>
                <button className="rules-close" onClick={() => setShowRules(false)}>x</button>
              </div>
              {RULES.map(i => (
                <div className="rule-item" key={i.text}>
                  <div className="rule-dot" style={{ background:i.color }} />
                  <div className="rule-text">{i.text}</div>
                </div>
              ))}
              <div style={{ marginTop:14, padding:"10px 14px", background:"#FEF3C7", borderRadius:10, fontSize:12, color:"#92400E", fontWeight:500 }}>
                Any violations will be flagged and reported to your admin automatically.
              </div>
            </div>
          </div>
        )} */}

        {/* LEAVE MODAL */}
        {showLeaveModal && (
          <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowLeaveModal(false)}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:440,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.25)",maxHeight:"90vh",overflowY:"auto"}}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#1E3A8A,#1570a6)",padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="#fff"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:15,color:"#fff"}}>Apply for Leave</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>Submit your leave request</div>
                </div>
              </div>
              <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
                {/* Leave Type */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"#64748B",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Leave Type</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[
                      {key:"casual",label:"Casual",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>,desc:"Personal day off"},
                      {key:"sick",label:"Sick",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/></svg>,desc:"Medical reason"},
                      {key:"annual",label:"Annual",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>,desc:"Planned vacation"},
                      {key:"other",label:"Other",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>,desc:"Any other reason"},
                    ].map(t=>(
                      <button key={t.key} onClick={()=>setLeaveType(t.key)}
                        style={{padding:"10px 12px",borderRadius:10,border:`2px solid ${leaveType===t.key?"#1E3A8A":"#E2E8F0"}`,background:leaveType===t.key?"#EFF6FF":"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                        <div style={{marginBottom:4,color:leaveType===t.key?"#1E3A8A":"#64748B"}}>{t.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:leaveType===t.key?"#1E3A8A":"#374151"}}>{t.label}</div>
                        <div style={{fontSize:10,color:"#94A3B8"}}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Calendar / Dates */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"#64748B",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Select Dates</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <div style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>From</div>
                      <input type="date" value={leaveFrom} min={new Date().toISOString().split("T")[0]}
                        onChange={e=>{setLeaveFrom(e.target.value);if(leaveTo&&e.target.value>leaveTo)setLeaveTo(e.target.value);}}
                        style={{width:"100%",padding:"9px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:13,outline:"none",color:"#0F172A",fontFamily:"inherit"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>To</div>
                      <input type="date" value={leaveTo} min={leaveFrom||new Date().toISOString().split("T")[0]}
                        onChange={e=>setLeaveTo(e.target.value)}
                        style={{width:"100%",padding:"9px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:13,outline:"none",color:"#0F172A",fontFamily:"inherit"}}/>
                    </div>
                  </div>
                  {leaveFrom && leaveTo && (
                    <div style={{marginTop:8,padding:"8px 12px",background:"#EFF6FF",borderRadius:8,fontSize:11,color:"#1E3A8A",fontWeight:600}}>
                      {Math.ceil((new Date(leaveTo).getTime()-new Date(leaveFrom).getTime())/(1000*60*60*24))+1} day(s) selected
                    </div>
                  )}
                </div>
                {/* Reason */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"#64748B",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Reason <span style={{color:"#94A3B8",fontWeight:400,textTransform:"none"}}>(optional)</span></div>
                  <textarea rows={2} value={leaveRemarks} onChange={e=>setLeaveRemarks(e.target.value)}
                    placeholder="Brief description..."
                    style={{width:"100%",padding:"9px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:12,fontFamily:"inherit",resize:"none",outline:"none",color:"#0F172A"}}/>
                </div>
              </div>
              <div style={{padding:"12px 20px",borderTop:"1px solid #E2E8F0",display:"flex",gap:10}}>
                <button onClick={()=>setShowLeaveModal(false)} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
                <button onClick={submitLeave} disabled={loading||!leaveFrom||!leaveTo} style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1E3A8A,#1570a6)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",opacity:(!leaveFrom||!leaveTo)?0.5:1}}>
                  {loading?"Submitting...":"Submit Leave Request"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESIGNATION MODAL */}
        {showResignModal && (
          <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowResignModal(false)}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:440,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#7F1D1D,#DC2626)",padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="#fff"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
                </div>
                <div>
                  <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:15,color:"#fff"}}>Apply for Resignation</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>This will be sent to admin for review</div>
                </div>
              </div>
              <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
                {/* Reason Options */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"#64748B",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Reason for Resignation</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[
                      {key:"low_salary",label:"Low Salary",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>},
                      {key:"better_opportunity",label:"Better Opportunity",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>},
                      {key:"personal_reasons",label:"Personal Reasons",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>},
                      {key:"health_issues",label:"Health Issues",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/></svg>},
                      {key:"relocation",label:"Relocation",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>},
                      {key:"other",label:"Other",icon:<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>},
                    ].map(r=>(
                      <label key={r.key} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${resignReason===r.key?"#DC2626":"#E2E8F0"}`,background:resignReason===r.key?"#FEF2F2":"#fff",cursor:"pointer"}}>
                        <input type="radio" checked={resignReason===r.key} onChange={()=>setResignReason(r.key)} style={{accentColor:"#DC2626",width:15,height:15,flexShrink:0}}/>
                        <span style={{fontSize:14}}>{r.icon}</span>
                        <span style={{fontSize:13,fontWeight:resignReason===r.key?700:500,color:resignReason===r.key?"#DC2626":"#374151"}}>{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Other text */}
                {resignReason==="other" && (
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#64748B",marginBottom:4}}>Please specify *</div>
                    <textarea rows={3} value={resignOther} onChange={e=>setResignOther(e.target.value)}
                      placeholder="Please describe your reason..."
                      style={{width:"100%",padding:"9px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:12,fontFamily:"inherit",resize:"none",outline:"none",color:"#0F172A"}}/>
                  </div>
                )}
                <div style={{padding:"10px 12px",background:"#FEF3C7",borderRadius:8,fontSize:11,color:"#92400E",border:"1px solid #FDE68A"}}>
                  Once submitted, admin will review your resignation. You will be notified of the decision.
                </div>
              </div>
              <div style={{padding:"12px 20px",borderTop:"1px solid #E2E8F0",display:"flex",gap:10}}>
                <button onClick={()=>setShowResignModal(false)} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
                <button onClick={submitResignation} disabled={loading||(resignReason==="other"&&!resignOther.trim())}
                  style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#7F1D1D,#DC2626)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",opacity:(resignReason==="other"&&!resignOther.trim())?0.5:1}}>
                  {loading?"Submitting...":"Submit Resignation"}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ── TERMS & CONDITIONS MODAL ── */}
        {showTerms && (
          <div style={{position:"fixed",inset:0,background:"rgba(13,69,103,0.7)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:520,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.35)"}}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#0d4567,#10537c)",padding:"18px 22px",flexShrink:0}}>
                <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:4}}>Terms & Conditions</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>Please read and accept before continuing</div>
              </div>

              {/* Body — scrollable */}
          <div style={{overflowY:"auto",padding:"18px 22px",flex:1}}
  onScroll={e=>{
    const el=e.currentTarget;
    if(el.scrollHeight-el.scrollTop-el.clientHeight<100) setTermsScrolled(true);
  }}>
                <div style={{fontSize:12,color:"#334155",lineHeight:1.75,display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    "Salaries and incentives will be deposited only into the designated bank account.",
                    "Duty hours must be followed.",
                    "Prior approval is required for leave. Two days of leave will be allowed after two months of regular service with us.",
                    "In case of misconduct, false reporting, incorrect information, unapproved leave, or bad behavior, your services will be terminated immediately, and no benefits whatsoever will be provided.",
                    "Less than 15 days of work does not qualify for salary or incentives.",
                    "One month's notice is mandatory to resign from your role.",
                    "The company has the right to terminate your services at any time without prior notice; however, your salary and benefits will be paid up to your final day of work.",
                    "You will not take any legal action or file a police report against the company.",
                    "You are not entitled to any medical compensation for any accident.",
                    "Failure to achieve the assigned target may result in salary reductions and/or delayed payments.",
                    "You will not be involved in any financial transactions with the store or collect a salary from the store.",
                  ].map((t,i) => (
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"#F8FAFC",borderRadius:10,border:"1px solid #E2E8F0"}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:"#0d4567",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</div>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                {/* Declaration */}
                <div style={{marginTop:16,padding:"14px 16px",background:"#EFF6FF",borderRadius:12,border:"1.5px solid #BFDBFE"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#1E3A8A",marginBottom:12,fontStyle:"italic"}}>
                    "I hereby declare that I have read and understood all the above terms and conditions and will follow them in true letter and spirit."
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontSize:10,color:"#64748B",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Signature</div>
                      <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#0d4567",borderBottom:"1.5px solid #1E3A8A",paddingBottom:2,minWidth:140}}>{userName}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:10,color:"#64748B",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Date</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#0d4567"}}>{new Date().toLocaleDateString("en-PK",{day:"2-digit",month:"long",year:"numeric"})}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{padding:"14px 22px",borderTop:"1px solid #E2E8F0",flexShrink:0,display:"flex",gap:10}}>
                <button onClick={logout} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  Decline & Logout
                </button>
<button onClick={submitTerms} disabled={loading||!termsScrolled}
  style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#0d4567,#1570a6)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(13,69,103,0.35)",opacity:termsScrolled?1:0.5}}>
  {loading ? "Accepting..." : "I Accept — Continue to Dashboard"}
</button>
              </div>
            </div>
          </div>
        )}

        {message && <div className={`toast ${message.error ? "toast-err" : "toast-ok"}`}>{message.text}</div>}
      </div>
    </>
  );
}