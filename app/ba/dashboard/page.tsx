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

// ── Constants ──────────────────────────────────────────────────────────────────

const RULES = [
  { color: "var(--success)", text: "Check in once at the start of your shift" },
  { color: "var(--warning)", text: "Use Break button only during your shift" },
  { color: "var(--danger)", text: "Check out only when your shift is fully done" },
  { color: "var(--brand-4)", text: "Once checked out you cannot check in again today" },
  { color: "var(--brand-1)", text: "Add all sales before checking out" },
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
  idle:       { label:"CHECK IN",  sub:"Tap to start shift",  color:"var(--success)", bg:"var(--success-bg)", border:"var(--success-border)", shadow:"var(--success-shadow)",  action:"checkin"   },
  checkedin:  { label:"CHECK OUT", sub:"Tap when shift ends",  color:"var(--danger)",  bg:"var(--danger-bg)",  border:"var(--danger-border)",  shadow:"var(--danger-shadow)",   action:"checkout"  },
  break:      { label:"END BREAK", sub:"Tap to resume work",   color:"var(--warning)", bg:"var(--warning-bg)", border:"var(--warning-border)", shadow:"var(--warning-shadow)",  action:"break_end" },
  checkedout: { label:"DONE",      sub:"See you tomorrow!",    color:"var(--brand-4)", bg:"var(--brand-4-bg)", border:"var(--brand-4-border)", shadow:"var(--brand-4-shadow)", action:null        },
};

interface ToastMessage { text: string; error: boolean; }

// ── CSS Variables ─────────────────────────────────────────────────────────────
const CSS_VARS = `
  :root {
    /* ── Brand Palette ── */
    --brand-1: #126291;
    --brand-2: #1570a6;
    --brand-3: #10537c;
    --brand-4: #0d4567;

    /* ── Brand Alphas ── */
    --brand-1-10: rgba(18,98,145,0.10);
    --brand-1-15: rgba(18,98,145,0.15);
    --brand-1-20: rgba(18,98,145,0.20);
    --brand-2-10: rgba(21,112,166,0.10);
    --brand-2-20: rgba(21,112,166,0.20);
    --brand-4-bg:     #e8f1f7;
    --brand-4-border: #b3d0e8;
    --brand-4-shadow: rgba(13,69,103,0.25);

    /* ── Semantic Status ── */
    --success:        #0d9e6e;
    --success-dark:   #077a54;
    --success-bg:     #e6f7f2;
    --success-border: #7dd3b8;
    --success-shadow: rgba(13,158,110,0.28);
    --success-text:   #065f46;

    --danger:         #d94040;
    --danger-dark:    #b53030;
    --danger-bg:      #fce8e8;
    --danger-border:  #f4a0a0;
    --danger-shadow:  rgba(217,64,64,0.28);
    --danger-text:    #7f1d1d;

    --warning:        #d97706;
    --warning-dark:   #b45309;
    --warning-bg:     #fef3c7;
    --warning-border: #fcd34d;
    --warning-shadow: rgba(217,119,6,0.28);
    --warning-text:   #78350f;

    --info:           var(--brand-2);
    --info-bg:        #e8f2f9;
    --info-border:    #a8d0ea;

    /* ── Neutrals ── */
    --white:    #ffffff;
    --surface:  #f4f7fa;
    --surface-2:#edf1f5;
    --border:   #dde4ec;
    --border-2: #ccd6e0;

    --text-primary:   #0d1b26;
    --text-secondary: #3a5068;
    --text-muted:     #6a88a0;
    --text-subtle:    #94a8bb;

    /* ── Topbar ── */
    --topbar-bg:     var(--brand-4);
    --topbar-height: 54px;

    /* ── Shadows ── */
    --shadow-sm:  0 1px 4px rgba(13,69,103,0.10);
    --shadow-md:  0 4px 16px rgba(13,69,103,0.14);
    --shadow-lg:  0 8px 32px rgba(13,69,103,0.18);

    /* ── Radii ── */
    --r-sm:  8px;
    --r-md:  12px;
    --r-lg:  16px;
    --r-xl:  20px;
    --r-full:9999px;

    /* ── Spacing ── */
    --gap-xs: 6px;
    --gap-sm: 10px;
    --gap-md: 14px;
    --gap-lg: 20px;
    --gap-xl: 28px;

    /* ── Typography ── */
    --font-ui:   'Inter', sans-serif;
    --font-head: 'Plus Jakarta Sans', sans-serif;
  }
`;

// ── Summary Section ────────────────────────────────────────────────────────────
interface SumData {
  period: string;
  attendance: { rows: Record<string,any>[]; present: number; total: number; absent: number };
  sales: { rows: Record<string,any>[]; total: number };
  brands: { brand_name: string; total: string }[];
  today: { check_in: string|null; check_out: string|null; store_name: string; hours_worked: string|null } | null;
}

function SummarySection({ storeName, shiftName, attendance, tdSalesAmount }: {
  storeName: string; shiftName: string; attendance: AttendanceRecord | null; tdSalesAmount: number
}) {
  const [period,  setPeriod]  = useState<"today"|"week"|"month"|"year">("today");
  const [data,    setData]    = useState<SumData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/auth/ba-summary?period=${period}`)
      .then(r => r.json())
      .then(d => { if (d?.attendance && d?.sales) setData(d); else setData(null); setLoading(false); })
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

  return (
    <div style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", overflow:"hidden", marginBottom:"var(--gap-lg)" }}>
      {/* Header */}
      <div style={{ background:"var(--brand-4)", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:4 }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} style={{
              padding:"5px 12px", borderRadius:"var(--r-full)", border:"none", fontSize:11, fontWeight:700, cursor:"pointer",
              background: period===p.key ? "var(--brand-2)" : "rgba(255,255,255,0.12)",
              color: period===p.key ? "var(--white)" : "rgba(255,255,255,0.55)"
            }}>{p.label}</button>
          ))}
        </div>
        <button onClick={dlAll} style={{ padding:"5px 12px", borderRadius:"var(--r-sm)", border:"none", background:"rgba(255,255,255,0.15)", color:"var(--white)", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
          <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          Download
        </button>
      </div>

      {loading ? (
        <div style={{ padding:28, textAlign:"center", color:"var(--text-subtle)", fontSize:13 }}>Loading...</div>
      ) : combinedRows.length === 0 ? (
        <div style={{ padding:28, textAlign:"center", color:"var(--text-subtle)", fontSize:13 }}>No records for this period</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="sum-table-wrap">
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--surface)" }}>
                  {["Date","Store","Status","Check In","Check Out","Sales"].map(h => (
                    <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:9, fontWeight:700, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid var(--border)", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {combinedRows.map((r, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid var(--surface)", background: r.status==="Absent" ? "#fdfafa" : "var(--white)" }}>
                    <td style={{ padding:"9px 14px", fontFamily:"monospace", fontSize:12, color:"var(--brand-4)", whiteSpace:"nowrap" }}>{r.date}</td>
                    <td style={{ padding:"9px 14px", fontSize:12, color:"var(--text-secondary)" }}>{r.store}</td>
                    <td style={{ padding:"9px 14px" }}>
                      <span style={{ padding:"2px 8px", borderRadius:"var(--r-full)", fontSize:10, fontWeight:700,
                        background: r.status==="Present" ? "var(--success-bg)" : "var(--danger-bg)",
                        color:      r.status==="Present" ? "var(--success-text)" : "var(--danger-text)" }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding:"9px 14px", fontSize:12, color: r.check_in ? "var(--success)" : "var(--text-subtle)", fontWeight:600 }}>{r.check_in || "—"}</td>
                    <td style={{ padding:"9px 14px", fontSize:12, fontWeight:600, color: r.check_out ? "var(--danger)" : r.status==="Present" ? "var(--warning)" : "var(--text-subtle)" }}>
                      {r.status==="Absent" ? "—" : r.check_out || "Active"}
                    </td>
                    <td style={{ padding:"9px 14px", fontFamily:"var(--font-head)", fontSize:13, fontWeight:800, color: r.status==="Absent" ? "var(--text-subtle)" : r.sales > 0 ? "var(--success)" : "var(--brand-4)" }}>
                      {r.status==="Absent" ? "—" : `Rs ${r.sales.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background:"var(--surface-2)", borderTop:"2px solid var(--border)" }}>
                  <td colSpan={5} style={{ padding:"10px 14px", fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>
                    Total ({combinedRows.filter(r=>r.status==="Present").length} present / {combinedRows.filter(r=>r.status==="Absent").length} absent)
                  </td>
                  <td style={{ padding:"10px 14px", fontFamily:"var(--font-head)", fontSize:14, fontWeight:800, color:"var(--success)" }}>
                    Rs {combinedRows.reduce((s,r) => s + (r.status==="Absent" ? 0 : r.sales), 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sum-cards-wrap">
            {combinedRows.map((r, i) => (
              <div key={i} style={{ padding:"12px 14px", borderBottom:"1px solid var(--surface-2)", background: r.status==="Absent" ? "#fdfafa" : "var(--white)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontFamily:"monospace", fontSize:12, color:"var(--brand-4)", fontWeight:600 }}>{r.date}</span>
                  <span style={{ padding:"2px 10px", borderRadius:"var(--r-full)", fontSize:10, fontWeight:700,
                    background: r.status==="Present" ? "var(--success-bg)" : "var(--danger-bg)",
                    color:      r.status==="Present" ? "var(--success-text)" : "var(--danger-text)" }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:6 }}>{r.store}</div>
                {r.status === "Present" && (
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                    <div>
                      <div style={{ fontSize:9, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:1 }}>Check In</div>
                      <div style={{ fontSize:12, fontWeight:600, color:"var(--success)" }}>{r.check_in || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:1 }}>Check Out</div>
                      <div style={{ fontSize:12, fontWeight:600, color: r.check_out ? "var(--danger)" : "var(--warning)" }}>{r.check_out || "Active"}</div>
                    </div>
                    <div style={{ marginLeft:"auto" }}>
                      <div style={{ fontSize:9, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:1 }}>Sales</div>
                      <div style={{ fontFamily:"var(--font-head)", fontSize:14, fontWeight:800, color: r.sales > 0 ? "var(--success)" : "var(--brand-4)" }}>Rs {r.sales.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ padding:"12px 14px", background:"var(--surface-2)", borderTop:"2px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>
                {combinedRows.filter(r=>r.status==="Present").length}P / {combinedRows.filter(r=>r.status==="Absent").length}A
              </span>
              <span style={{ fontFamily:"var(--font-head)", fontSize:15, fontWeight:800, color:"var(--success)" }}>
                Rs {combinedRows.reduce((s,r) => s + (r.status==="Absent" ? 0 : r.sales), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Target Progress Bar ───────────────────────────────────────────────────────
function TargetProgressBar() {
  const [data, setData] = useState<Record<string,any> | null>(null);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    fetch('/api/auth/ba-target').then(r=>r.json()).then(d => {
      if (d && !d.message) { setData(d); setTimeout(() => setBarWidth(d.pct || 0), 300); }
    }).catch(() => {});
  }, []);

  if (!data || !data.target) return null;

  const { target, mtdSales, todaySales, remaining, perDayNeeded, pct,
    daysLeft, incentiveEarned, totalPay, fixedSalary, currentSlabIdx,
    nextSlabLabel, nextSlabIncentive, targetHit, slabs, storeName } = data;

  const barColor = pct >= 100 ? "var(--success)" : pct >= 75 ? "var(--warning)" : pct >= 50 ? "var(--brand-2)" : "var(--danger)";
  const barGrad  = pct >= 100 ? "linear-gradient(90deg,var(--success-dark),var(--success))"
                 : pct >= 75  ? "linear-gradient(90deg,var(--warning-dark),var(--warning))"
                 : pct >= 50  ? "linear-gradient(90deg,var(--brand-3),var(--brand-2))"
                 :              "linear-gradient(90deg,var(--danger-dark),var(--danger))";

  return (
    <div style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", overflow:"hidden", marginBottom:"var(--gap-lg)" }}>
      <div style={{ background:"linear-gradient(135deg,var(--brand-4),var(--brand-3))", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:14, color:"var(--white)" }}>🎯 Monthly Target Progress</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{storeName} · {new Date().toLocaleString("default",{month:"long"})} {new Date().getFullYear()}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, color: targetHit ? "var(--success)" : "var(--white)" }}>Rs {mtdSales.toLocaleString()}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>of Rs {target.toLocaleString()} target</div>
        </div>
      </div>

      <div style={{ padding:"16px 20px" }}>
        {/* Main progress bar */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)" }}>Target Progress</span>
            <span style={{ fontSize:13, fontWeight:800, color:barColor }}>{pct}%</span>
          </div>
          <div style={{ height:20, background:"var(--surface-2)", borderRadius:"var(--r-full)", overflow:"hidden", position:"relative" }}>
            <div style={{ height:"100%", borderRadius:"var(--r-full)", background:barGrad, width:`${barWidth}%`, transition:"width 1.5s cubic-bezier(0.4,0,0.2,1)", display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:8 }}>
              {pct > 15 && <span style={{ fontSize:10, fontWeight:800, color:"var(--white)" }}>Rs {mtdSales.toLocaleString()}</span>}
            </div>
            <div style={{ position:"absolute", top:0, right:0, height:"100%", width:3, background:"var(--brand-4)", opacity:0.3 }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            <span style={{ fontSize:10, color:"var(--text-subtle)" }}>Rs 0</span>
            <span style={{ fontSize:10, color:"var(--text-subtle)", fontWeight:700 }}>Target: Rs {target.toLocaleString()}</span>
          </div>
        </div>

        {targetHit ? (
          <div style={{ background:"var(--success-bg)", border:"2px solid var(--success-border)", borderRadius:"var(--r-md)", padding:"16px 18px", marginBottom:16, textAlign:"center" }}>
            <div style={{ fontFamily:"var(--font-head)", fontSize:16, fontWeight:800, color:"var(--success-text)", marginBottom:4 }}>Target Achieved! 🎉</div>
            <div style={{ fontSize:12, color:"var(--success)", marginBottom:8 }}>Rs {incentiveEarned.toLocaleString()} incentive added to your salary!</div>
            <div style={{ display:"inline-block", padding:"6px 16px", background:"var(--success)", borderRadius:"var(--r-full)" }}>
              <span style={{ fontFamily:"var(--font-head)", fontSize:13, fontWeight:800, color:"var(--white)" }}>Total Pay: Rs {totalPay.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label:"Remaining",     val:`Rs ${remaining.toLocaleString()}`,    color:"var(--danger)",  sub:"to hit target" },
              { label:"Per Day Needed",val:`Rs ${perDayNeeded.toLocaleString()}`, color:"var(--warning)", sub:`${daysLeft} days left` },
              { label:"Today's Sales", val:`Rs ${todaySales.toLocaleString()}`,   color:"var(--success)", sub:"so far today" },
            ].map(item => (
              <div key={item.label} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:9, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{item.label}</div>
                <div style={{ fontFamily:"var(--font-head)", fontSize:14, fontWeight:800, color:item.color }}>{item.val}</div>
                <div style={{ fontSize:10, color:"var(--text-subtle)", marginTop:2 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        )}

        {slabs?.length > 0 && (
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Incentive Slabs</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {slabs.map((slab: Record<string,any>, i: number) => {
                const slabBase = i === 0 ? target : target * slabs.slice(0,i).reduce((acc: number, s: Record<string,any>) => acc * (1 + s.threshold_pct/100), 1);
                const slabTarget = slabBase * (1 + slab.threshold_pct / 100);
                const slabIncentive = slabTarget * (slab.incentive_pct / 100);
                const achieved = mtdSales >= slabTarget;
                const active   = !achieved && currentSlabIdx === i - 1;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:"var(--r-sm)",
                    background: achieved ? "var(--success-bg)" : active ? "var(--info-bg)" : "var(--surface)",
                    border:`1.5px solid ${achieved ? "var(--success-border)" : active ? "var(--info-border)" : "var(--border)"}` }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background: achieved ? "var(--success)" : active ? "var(--brand-2)" : "var(--border)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:11, fontWeight:800, color: achieved||active ? "var(--white)" : "var(--text-subtle)" }}>
                        {achieved ? "✓" : i+1}
                      </span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:700, color: achieved ? "var(--success-text)" : active ? "var(--brand-4)" : "var(--text-primary)" }}>
                        Slab {i+1} — Rs {Math.round(slabTarget).toLocaleString()}
                      </div>
                      <div style={{ fontSize:10, color:"var(--text-subtle)" }}>{slab.threshold_pct}% above {i === 0 ? "target" : `Slab ${i}`} · {slab.incentive_pct}% incentive</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:"var(--font-head)", fontSize:13, fontWeight:800, color: achieved ? "var(--success)" : active ? "var(--brand-2)" : "var(--text-subtle)" }}>
                        Rs {Math.round(slabIncentive).toLocaleString()}
                      </div>
                      <div style={{ fontSize:9, color:"var(--text-subtle)" }}>{achieved ? "Earned!" : active ? `Rs ${Math.max(0,Math.round(slabTarget-mtdSales)).toLocaleString()} away` : "locked"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Salary summary */}
        <div style={{ marginTop:14, padding:"12px 16px", background:"var(--brand-4)", borderRadius:"var(--r-md)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Fixed Salary</div>
              <div style={{ fontFamily:"var(--font-head)", fontSize:14, fontWeight:800, color:"var(--white)" }}>Rs {fixedSalary.toLocaleString()}</div>
            </div>
            {incentiveEarned > 0 && (
              <>
                <div style={{ color:"rgba(255,255,255,0.2)" }}>+</div>
                <div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Incentive</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:14, fontWeight:800, color:"var(--success)" }}>Rs {Math.round(incentiveEarned).toLocaleString()}</div>
                </div>
              </>
            )}
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Total Expected</div>
            <div style={{ fontFamily:"var(--font-head)", fontSize:18, fontWeight:800, color: incentiveEarned > 0 ? "var(--success)" : "var(--white)" }}>Rs {Math.round(totalPay).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline Target Bar ─────────────────────────────────────────────────────────
function InlineTargetBar() {
  const [data, setData]         = useState<Record<string,any> | null>(null);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    fetch('/api/auth/ba-target').then(r=>r.json()).then(d => {
      if (d && !d.message && d.target) { setData(d); setTimeout(() => setBarWidth(d.pct || 0), 400); }
    }).catch(() => {});
  }, []);

  if (!data || !data.target) return null;

  const { pct, mtdSales, target, remaining, perDayNeeded, daysLeft,
    targetHit, incentiveEarned, fixedSalary, slabs } = data;

  const barColor = pct >= 100 ? "var(--success)" : pct >= 75 ? "var(--warning)" : pct >= 50 ? "var(--brand-2)" : "var(--danger)";
  const barGrad  = pct >= 100 ? "linear-gradient(90deg,var(--success-dark),var(--success))"
                 : pct >= 75  ? "linear-gradient(90deg,var(--warning-dark),var(--warning))"
                 : pct >= 50  ? "linear-gradient(90deg,var(--brand-3),var(--brand-2))"
                 :              "linear-gradient(90deg,var(--danger-dark),var(--danger))";

  const slabPoints = (() => {
    if (!slabs?.length) return [];
    const points: { barPct: number; label: string; targetAmt: number; bonus: number; hit: boolean }[] = [];
    let b = target;
    const lastTarget = slabs.reduce((acc: number, s: Record<string,any>) => acc * (1 + s.threshold_pct / 100), target);
    for (let i = 0; i < slabs.length; i++) {
      b = b * (1 + slabs[i].threshold_pct / 100);
      points.push({ barPct: Math.round((b / lastTarget) * 100), label:`Slab ${i+1}`, targetAmt:Math.round(b), bonus:Math.round(b * slabs[i].incentive_pct / 100), hit: mtdSales >= b });
    }
    return points;
  })();

  const motivMsg = (() => {
    if (targetHit) return null;
    if (daysLeft <= 0) return { msg:"Month ended. Great effort!", color:"var(--text-muted)", bg:"var(--surface)", border:"var(--border)" };
    if (pct >= 75) return { msg:`Just Rs ${remaining.toLocaleString()} away! Sell Rs ${perDayNeeded.toLocaleString()} per day for ${daysLeft} days.`, color:"var(--warning-text)", bg:"var(--warning-bg)", border:"var(--warning-border)" };
    if (pct >= 50) return { msg:`Sell Rs ${perDayNeeded.toLocaleString()} per day for ${daysLeft} days to hit your target!`, color:"var(--brand-4)", bg:"var(--info-bg)", border:"var(--info-border)" };
    return { msg:`Sell Rs ${perDayNeeded.toLocaleString()} per day — hit Rs ${target.toLocaleString()} in ${daysLeft} days!`, color:"var(--brand-4)", bg:"var(--info-bg)", border:"var(--info-border)" };
  })();

  return (
    <div style={{ width:"100%", marginTop:6, paddingTop:16, borderTop:"1.5px solid var(--border)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:28, height:28, borderRadius:"var(--r-sm)", background:"linear-gradient(135deg,var(--brand-4),var(--brand-2))", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--white)"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:"var(--text-primary)", lineHeight:1.2 }}>Monthly Target</div>
            <div style={{ fontSize:10, color:"var(--text-subtle)" }}>{new Date().toLocaleString("default",{month:"long"})} {new Date().getFullYear()}</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"var(--font-head)", fontSize:16, fontWeight:800, color:barColor }}>Rs {mtdSales.toLocaleString()}</div>
          <div style={{ fontSize:10, color:"var(--text-subtle)" }}>of Rs {target.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ marginBottom:6 }}>
        <div style={{ position:"relative", height:16, marginBottom:4 }}>
          {slabPoints.map((p, i) => (
            <div key={i} style={{ position:"absolute", left:`${p.barPct}%`, transform:"translateX(-50%)", textAlign:"center" }}>
              <span style={{ fontSize:8, fontWeight:700, color: p.hit ? "var(--success)" : "var(--border-2)", whiteSpace:"nowrap" }}>S{i+1}</span>
            </div>
          ))}
        </div>
        <div style={{ position:"relative", height:26, background:"var(--surface-2)", borderRadius:"var(--r-full)", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, height:"100%", width:`${barWidth}%`, background:barGrad, borderRadius:"var(--r-full)", transition:"width 1.8s cubic-bezier(0.4,0,0.2,1)", boxShadow:`0 0 12px ${barColor}55` }}/>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent: pct > 50 ? "flex-start" : "flex-end", paddingLeft: pct > 50 ? 12 : 0, paddingRight: pct > 50 ? 0 : 10 }}>
            <span style={{ fontSize:11, fontWeight:800, color: pct > 50 ? "var(--white)" : barColor }}>{pct}%</span>
          </div>
          {slabPoints.map((p, i) => (
            <div key={i} style={{ position:"absolute", top:3, left:`${p.barPct}%`, width:2, height:"calc(100% - 6px)", background:"rgba(255,255,255,0.5)", borderRadius:2 }}/>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
          <span style={{ fontSize:9, color:"var(--text-subtle)" }}>Rs 0</span>
          <span style={{ fontSize:9, color:"var(--text-subtle)", fontWeight:600 }}>Target: Rs {target.toLocaleString()}</span>
        </div>
      </div>

      {motivMsg && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 12px", borderRadius:"var(--r-md)", marginBottom:12, marginTop:4, background:motivMsg.bg, border:`1px solid ${motivMsg.border}` }}>
          <span style={{ fontSize:11, fontWeight:600, color:motivMsg.color, lineHeight:1.6 }}>{motivMsg.msg}</span>
        </div>
      )}

      {targetHit && (
        <div style={{ borderRadius:"var(--r-md)", overflow:"hidden", marginBottom:12, background:"var(--success-bg)", border:"1.5px solid var(--success-border)" }}>
          <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"var(--r-md)", background:"var(--success)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--white)"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a1 1 0 011 1v2a4 4 0 01-4 4H6a4 4 0 01-4-4V5a1 1 0 011-1h1V3a1 1 0 011-1zm0 4v2a2 2 0 002 2h6a2 2 0 002-2V6H5zm7 8a1 1 0 100 2H8a1 1 0 100-2h4z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-head)", fontSize:14, fontWeight:800, color:"var(--success-text)" }}>Target Achieved!</div>
              <div style={{ fontSize:11, color:"var(--success)", marginTop:2 }}>
                <span style={{ fontWeight:700 }}>+Rs {Math.round(incentiveEarned).toLocaleString()}</span> incentive · Total Pay: <span style={{ fontWeight:700 }}>Rs {Math.round(fixedSalary+incentiveEarned).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Salary Breakdown ──────────────────────────────────────────────────────────
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

  return (
    <div style={{ borderRadius:"var(--r-md)", overflow:"hidden", border:"1px solid var(--border)", marginTop:4 }}>
      <div style={{ padding:"9px 14px", background:"var(--surface)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.1em" }}>Salary Breakdown</span>
        <span style={{ fontSize:10, color:"var(--text-subtle)" }}>{new Date().toLocaleString("default",{month:"short"})}</span>
      </div>
      {/* Fixed salary row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderBottom:"1px solid var(--surface-2)", background:"var(--white)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:32, height:32, borderRadius:"var(--r-sm)", background:"linear-gradient(135deg,var(--brand-4),var(--brand-2))", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="var(--white)"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>Fixed Salary</div>
            <div style={{ fontSize:10, color:"var(--text-subtle)" }}>Always paid · base</div>
          </div>
        </div>
        <div style={{ fontFamily:"var(--font-head)", fontSize:15, fontWeight:800, color:"var(--brand-4)" }}>Rs {fixedSalary.toLocaleString()}</div>
      </div>
      {salaryRows.map((s,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderBottom: i<salaryRows.length-1?"1px solid var(--surface-2)":"none", background: s.hit ? "var(--success-bg)" : "var(--white)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, flex:1 }}>
            <div style={{ width:32, height:32, borderRadius:"var(--r-sm)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
              background: s.hit ? "var(--success-bg)" : "var(--surface)",
              border:`1.5px solid ${s.hit ? "var(--success-border)" : "var(--border)"}` }}>
              {s.hit ? <span style={{ fontSize:12, color:"var(--success)" }}>✓</span> : <span style={{ fontSize:11, fontWeight:800, color:"var(--border-2)" }}>{i+1}</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, fontWeight:700, color: s.hit ? "var(--success-text)" : "var(--text-primary)" }}>{s.label}</span>
                {s.hit
                  ? <span style={{ fontSize:9, padding:"1px 6px", borderRadius:"var(--r-full)", fontWeight:700, background:"var(--success-bg)", color:"var(--success)", border:"1px solid var(--success-border)" }}>✓ Earned</span>
                  : <span style={{ fontSize:9, padding:"1px 6px", borderRadius:"var(--r-full)", fontWeight:600, background:"var(--surface)", color:"var(--text-subtle)", border:"1px solid var(--border)" }}>Rs {(s.targetAmt-mtdSales).toLocaleString()} away</span>
                }
              </div>
              <div style={{ fontSize:10, color:"var(--text-subtle)", marginTop:1 }}>Hit Rs {s.targetAmt.toLocaleString()} → +Rs {s.bonus.toLocaleString()} ({s.pct}%)</div>
            </div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
            <div style={{ fontFamily:"var(--font-head)", fontSize:14, fontWeight:800, color: s.hit ? "var(--success)" : "var(--border-2)" }}>Rs {s.total.toLocaleString()}</div>
            <div style={{ fontSize:9, color:"var(--text-subtle)" }}>total pay</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function BADashboard() {
  const router = useRouter();

  const [attendance,   setAttendance]   = useState<AttendanceRecord | null>(null);
  const [assignment,   setAssignment]   = useState<StoreAssignment | null>(null);
  const [status,       setStatus]       = useState<Status>("idle");
  const [timer,        setTimer]        = useState<number>(0);
  const [breakTimer,   setBreakTimer]   = useState<number>(0);

  const [location,     setLocation]     = useState<GpsLocation | null>(null);
  const [locationName, setLocationName] = useState<string>("Fetching location...");

  const [sales,        setSales]        = useState<SalesEntry[]>([]);
  const [skus,         setSkus]         = useState<Sku[]>([]);
  const [brands,       setBrands]       = useState<string[]>([]);

  const [showSaleForm, setShowSaleForm] = useState<boolean>(false);
  const [saleRemarks,  setSaleRemarks]  = useState<string>("");
  const [saleImage,    setSaleImage]    = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saleLines,    setSaleLines]    = useState<SaleLine[]>([{ brand:"", category:"", skuRows:[], selectedSkuIds:[] }]);
  const [brandSales,   setBrandSales]   = useState<Record<string, number>>({});

  const [showZeroModal, setShowZeroModal] = useState<boolean>(false);
  const [zeroRemarks,   setZeroRemarks]   = useState<string>("");

  const [distanceFromStore, setDistanceFromStore] = useState<number | null>(null);
  const [storeCoords,       setStoreCoords]       = useState<{ lat: number; lng: number } | null>(null);
  const [mapLocation,       setMapLocation]       = useState<{ lat: number; lng: number } | null>(null);
  const lastMapUpdateRef = useRef<{ lat: number; lng: number } | null>(null);
  const [storeAddress,      setStoreAddress]      = useState<string>("");

  const [loading,    setLoading]    = useState<boolean>(false);
  const [message,    setMessage]    = useState<ToastMessage | null>(null);
  const [time,       setTime]       = useState<string>("");
  const [showConfirm,setShowConfirm]= useState<boolean>(false);
  const [showRules,  setShowRules]  = useState<boolean>(false);
  const [userName,   setUserName]   = useState<string>("BA");
  const [storeName,  setStoreName]  = useState<string>("");
  const [shiftName,  setShiftName]  = useState<string>("");
  const [monthStats, setMonthStats] = useState<{present:number;absent:number}>({present:0,absent:0});
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [termsScrolled, setTermsScrolled] = useState<boolean>(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchRef   = useRef<number | null>(null);
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
    } else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === "break") {
      breakRef.current = setInterval(() => setBreakTimer(t => t + 1), 1000);
    } else { if (breakRef.current) clearInterval(breakRef.current); }
    return () => { if (breakRef.current) clearInterval(breakRef.current); };
  }, [status]);

  useEffect(() => {
    fetchAttendance();
    fetch('/api/auth/terms')
  .then(r=>r.json())
  .then(d=>{ if(!d.accepted){ setShowTerms(true); } });
    fetchSales();
    fetchSkusAndBrands();
    fetchProfile();
    getLocation();
    fetch('/api/auth/ba-summary?period=month')
      .then(r=>r.json())
      .then(d=>{ if(d?.attendance) setMonthStats({present:d.attendance.present,absent:d.attendance.absent}); });
  }, []);

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
    } catch {}
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
          if (data.attendance.break_start && !data.attendance.break_end)
            setBreakTimer(Math.floor((Date.now() - new Date(data.attendance.break_start).getTime()) / 1000));
        } else if (data.attendance.check_out) {
          setStatus("checkedout");
        }
      }
      if (data.assignment) setAssignment(data.assignment);
      if (data.storeLat && data.storeLng) setStoreCoords({ lat: data.storeLat, lng: data.storeLng });
      if (data.storeAddress) setStoreAddress(data.storeAddress);
    } catch {}
  };

  const fetchSales = async (): Promise<void> => {
    try {
      const res  = await fetch("/api/auth/sales");
      const data = await res.json() as { sales: SalesEntry[]; brandTotals?: Record<string, number> };
      if (data.sales) setSales(data.sales);
      if (data.brandTotals) setBrandSales(data.brandTotals);
    } catch {}
  };

  const fetchSkusAndBrands = async (): Promise<void> => {
    try {
      const res  = await fetch("/api/auth/skus");
      const data = await res.json() as { skus: Sku[] };
      if (data.skus) {
        setSkus(data.skus);
        setBrands([...new Set(data.skus.map(sk => sk.brand_name))]);
      }
    } catch {}
  };

  // ── Location ──────────────────────────────────────────────────────────────────

  const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<void> => {
    setLocationName(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json() as { locality?: string; city?: string; principalSubdivision?: string; localityInfo?: { administrative?: Array<{ name: string; adminLevel: number }> } };
      const parts: string[] = [];
      if (data.locality) parts.push(data.locality);
      else if (data.localityInfo?.administrative) {
        const admins = data.localityInfo.administrative;
        const suburb = admins.find(a => a.adminLevel >= 8);
        const area   = admins.find(a => a.adminLevel === 6 || a.adminLevel === 7);
        if (suburb) parts.push(suburb.name);
        if (area && area.name !== suburb?.name) parts.push(area.name);
      }
      if (data.city && !parts.includes(data.city)) parts.push(data.city);
      if (data.principalSubdivision && parts.length < 2) parts.push(data.principalSubdivision);
      if (parts.length > 0) setLocationName(parts.slice(0,3).join(", "));
      else {
        const r2 = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16&addressdetails=1`, { headers:{"Accept-Language":"en"}, signal:AbortSignal.timeout(5000) });
        const d2 = await r2.json() as { address?: Record<string,string> };
        if (d2?.address) {
          const a = d2.address;
          const p = [a.neighbourhood||a.suburb||a.road, a.city_district||a.town||a.city, a.state].filter(Boolean);
          setLocationName(p.slice(0,3).join(", ") || `${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        }
      }
    } catch { setLocationName(`${lat.toFixed(6)}, ${lon.toFixed(6)}`); }
  };

  const getLocation = (): void => {
    if (!navigator.geolocation) { setLocationName("Geolocation not supported"); return; }
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    bestAccRef.current = 9999;
    setLocationName("Getting GPS...");

    const onSuccess = (pos: GeolocationPosition): void => {
      const { latitude, longitude, accuracy } = pos.coords;
      if (accuracy > 500) return;
      if (accuracy >= bestAccRef.current && bestAccRef.current < 30) return;
      bestAccRef.current = accuracy;
      setLocationName(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      setLocation({ latitude, longitude, accuracy });
      setStoreCoords(prev => {
        if (prev) { const d = getDistanceMeters(latitude, longitude, prev.lat, prev.lng); setDistanceFromStore(Math.round(d)); }
        return prev;
      });
      const last = lastMapUpdateRef.current;
      const movedEnough = !last || getDistanceMeters(latitude, longitude, last.lat, last.lng) > 20;
      if (movedEnough) { lastMapUpdateRef.current = { lat:latitude, lng:longitude }; setMapLocation({ lat:latitude, lng:longitude }); }
      if (accuracy <= 50 && bestAccRef.current === accuracy) reverseGeocode(latitude, longitude).catch(() => {});
    };
    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) { setLocationName("Location permission denied"); setDistanceFromStore(null); }
    };
    const opts: PositionOptions = { enableHighAccuracy:true, timeout:30000, maximumAge:5000 };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, opts);
    watchRef.current = navigator.geolocation.watchPosition(onSuccess, onError, { enableHighAccuracy:true, timeout:30000, maximumAge:5000 });
  };

  // ── Actions ───────────────────────────────────────────────────────────────────

  const handleCircleClick = (): void => {
    const btn = BTN_CONFIG[status];
    if (!btn.action) return;
    if (status === "checkedin") { setShowConfirm(true); return; }
    handleAction(btn.action);
  };

  const getFreshLocation = (): Promise<{ latitude: number; longitude: number } | null> =>
    new Promise(resolve => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        ()  => resolve(location ? { latitude:location.latitude, longitude:location.longitude } : null),
        { enableHighAccuracy:true, timeout:10000, maximumAge:5000 }
      );
    });

  const handleAction = async (action: AttendanceAction): Promise<void> => {
    setShowConfirm(false);
    setLoading(true);
    try {
      let lat = location?.latitude, lng = location?.longitude;
      if (action === "checkin") {
        showMsg("Getting your location...");
        const fresh = await getFreshLocation();
        if (fresh) { lat = fresh.latitude; lng = fresh.longitude; setLocation(prev => prev ? {...prev, latitude:fresh.latitude, longitude:fresh.longitude} : {latitude:fresh.latitude, longitude:fresh.longitude, accuracy:0}); }
      }
      const res  = await fetch("/api/auth/attendance", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action, latitude:lat, longitude:lng}) });
      const data = await res.json() as { attendance?: AttendanceRecord; message?: string };
      if (res.ok && data.attendance) {
        setAttendance(data.attendance);
        if (action === "checkin")     { setStatus("checkedin");  setTimer(0);      showMsg("Checked in successfully!"); }
        if (action === "checkout")    { setStatus("checkedout");                   showMsg("Shift completed! Great work today!"); }
        if (action === "break_start") { setStatus("break");      setBreakTimer(0); showMsg("Break started - enjoy!"); }
        if (action === "break_end")   { setStatus("checkedin");                    showMsg("Break ended - back to work!"); }
      } else { showMsg(data.message || "Error", true); }
    } catch { showMsg("Connection error", true); }
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
      const already = l.skuRows.some(r => r.sku_id === sku.sku_id);
      if (already) return { ...l, skuRows:l.skuRows.filter(r=>r.sku_id!==sku.sku_id), selectedSkuIds:(l.selectedSkuIds||[]).filter(id=>id!==sku.sku_id) };
      const newRow: SkuRow = { sku_id:sku.sku_id, sku_name:sku.sku_name, retail_price:parseFloat(String(sku.retail_price))||0, uom:sku.unit_of_measure||"", qty:1 };
      return { ...l, skuRows:[...l.skuRows, newRow], selectedSkuIds:[...(l.selectedSkuIds||[]), sku.sku_id] };
    }));
  };

  const updateSkuQty = (lineIdx: number, skuId: number, qty: number): void => {
    setSaleLines(prev => prev.map((l: SaleLine, i: number): SaleLine => {
      if (i !== lineIdx) return l;
      return { ...l, skuRows:l.skuRows.map((r: SkuRow): SkuRow => r.sku_id===skuId ? {...r, qty:Math.max(0,qty)} : r) };
    }));
  };

  const addLine    = (): void => setSaleLines(prev => [...prev, { brand:"", category:"", skuRows:[], selectedSkuIds:[] }]);
  const removeLine = (idx: number): void => setSaleLines(prev => prev.filter((_,i) => i !== idx));

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const result = ev.target?.result as string; setSaleImage(result); setImagePreview(result); };
    reader.readAsDataURL(file);
  };

  const handleZeroSale = (): void => { setZeroRemarks(""); setShowZeroModal(true); };

  const submitZeroSale = async (): Promise<void> => {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/sales", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ items:[], remarks:zeroRemarks||"Zero sale - no products sold today", image:null }) });
      const data = await res.json() as { message?: string };
      if (res.ok) { showMsg("Zero sale submitted!"); setShowZeroModal(false); fetchSales(); }
      else showMsg(data.message || "Error", true);
    } catch { showMsg("Connection error", true); }
    setLoading(false);
  };

  const handleDeleteSale = async (saleEntryId: number): Promise<void> => {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/sales", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sales_entry_id: saleEntryId }) });
      const data = await res.json() as { message?: string };
      if (res.ok) { showMsg("Sale entry removed!"); fetchSales(); }
      else showMsg(data.message || "Error", true);
    } catch { showMsg("Connection error", true); }
    setLoading(false);
  };

  const handleAddSale = async (): Promise<void> => {
    const itemsToSave = saleLines.flatMap(l => l.skuRows.map(r => ({ sku_id:r.sku_id, qty:parseInt(String(r.qty))||0, retail_price:r.retail_price }))).filter(i => i.qty > 0);
    if (itemsToSave.length === 0) { showMsg("Please add at least one item with quantity > 0", true); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/sales", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ items:itemsToSave, remarks:saleRemarks, image:null }) });
      const data = await res.json() as { message?: string };
      if (res.ok) {
        const newBrandTotals: Record<string, number> = { ...brandSales };
        saleLines.forEach(line => {
          if (!line.brand) return;
          const lineTotal = line.skuRows.reduce((s,r) => s + r.qty * r.retail_price, 0);
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
      } else { showMsg(data.message || "Error saving sales", true); }
    } catch { showMsg("Connection error", true); }
    setLoading(false);
  };

  // ── Utilities ─────────────────────────────────────────────────────────────────

  const showMsg    = (msg: string, isError: boolean = false): void => { setMessage({ text:msg, error:isError }); setTimeout(() => setMessage(null), 3500); };
  const formatTime = (seconds: number): string => { const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`; };
  const fmtTime    = (dt: string | null | undefined): string => dt ? new Date(dt).toLocaleTimeString("en-PK", { hour:"2-digit", minute:"2-digit" }) : "--:--";
  const fmtDist    = (m: number | null): string => { if (m===null) return ""; if (m>=1000) return `${(m/1000).toFixed(1)}km`; return `${m}m`; };
  const submitTerms = async (): Promise<void> => {
  setLoading(true);
  try {const res = await fetch('/api/auth/terms', { method:'POST' });if (res.ok) { setShowTerms(false); showMsg("Terms accepted. Welcome!"); }else showMsg("Error accepting terms", true);
  } catch { showMsg("Connection error", true); } setLoading(false);};
  const logout     = async (): Promise<void> => { await fetch("/api/auth/logout", { method:"POST" }); router.push("/login"); };


  // ── Derived ───────────────────────────────────────────────────────────────────

  const totalSales = sales.reduce((sum,s) => sum + Number(s.total_sales || 0), 0);
  const liveBrandTotals: Record<string, number> = { ...brandSales };
  saleLines.forEach(line => {
    if (!line.brand || !line.skuRows.length) return;
    line.skuRows.forEach(r => { if (r.qty > 0) liveBrandTotals[line.brand] = (liveBrandTotals[line.brand] || 0) + r.qty * r.retail_price; });
  });
  const salesByBrand    = liveBrandTotals;
  const totalSalesForBar = Math.max(totalSales, Object.values(liveBrandTotals).reduce((s:number,v:number) => s+v, 0));
  const grandTotal      = saleLines.reduce((s,l) => s + l.skuRows.reduce((rs,r) => rs + r.qty * r.retail_price, 0), 0);
  const GEOFENCE_METERS = 200;
  const isWithinRange: boolean = storeCoords === null || (distanceFromStore !== null && distanceFromStore <= GEOFENCE_METERS);
  const locationAllowed: boolean = !["Location permission denied","Geolocation not supported","Fetching location..."].includes(locationName);
  const canCheckIn: boolean = status === "idle" ? (locationAllowed && isWithinRange) : true;
  const btn = BTN_CONFIG[status];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        ${CSS_VARS}
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { background: var(--surface); font-family: var(--font-ui); color: var(--text-primary); }

        /* ── Root ── */
        .root { min-height: 100vh; background: var(--surface); }

        /* ── Topbar ── */
        .topbar {
          background: var(--topbar-bg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: var(--topbar-height);
          gap: 8px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-md);
        }
        .logo { display:flex; align-items:center; gap:8px; min-width:0; flex:1; }
        .logo-name { font-family:var(--font-head); font-weight:800; font-size:13px; color:var(--white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .logo-sub  { font-size:9px; color:rgba(255,255,255,0.45); text-transform:uppercase; letter-spacing:0.08em; white-space:nowrap; }
        .top-clock { font-family:var(--font-head); font-size:15px; font-weight:800; color:#5dd8a8; flex-shrink:0; }
        .top-right { display:flex; align-items:center; gap:6px; flex-shrink:0; }
        .status-pill { padding:3px 8px; border-radius:var(--r-full); background:rgba(93,216,168,0.2); font-size:10px; color:#5dd8a8; font-weight:600; white-space:nowrap; display:flex; align-items:center; gap:4px; }
        .store-pill  { padding:3px 8px; border-radius:var(--r-full); background:rgba(255,255,255,0.1); font-size:10px; color:rgba(255,255,255,0.8); font-weight:600; white-space:nowrap; display:flex; align-items:center; gap:4px; }
        .rules-btn  { padding:4px 10px; border-radius:var(--r-sm); border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.8); font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px; flex-shrink:0; }
        .rules-btn:hover { background:rgba(255,255,255,0.15); }
        .logout-btn { padding:4px 10px; border-radius:var(--r-sm); border:1px solid rgba(255,255,255,0.2); background:transparent; color:rgba(255,255,255,0.7); font-size:11px; cursor:pointer; flex-shrink:0; }
        .logout-btn:hover { background:rgba(255,255,255,0.1); color:var(--white); }

        /* ── Main container ── */
        .main { padding: 20px; max-width: 1200px; margin: 0 auto; }

        /* ── Stat cards row ── */
        .top-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        .scard { background:var(--white); border:1px solid var(--border); border-radius:var(--r-lg); padding:18px 20px; box-shadow:var(--shadow-sm); }
        .scard-label { font-size:10px; color:var(--text-subtle); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; font-weight:600; }

        /* ── Middle grid: checkin | geo ── */
        .mid-grid { display:grid; grid-template-columns:380px 1fr; gap:20px; margin-bottom:20px; align-items:start; }

        /* ── Cards ── */
        .checkin-card { background:var(--white); border:1px solid var(--border); border-radius:var(--r-xl); padding:28px 20px; display:flex; flex-direction:column; align-items:center; gap:18px; box-shadow:var(--shadow-sm); }
        .geo-card     { background:var(--white); border:1px solid var(--border); border-radius:var(--r-xl); padding:20px; display:flex; flex-direction:column; gap:14px; box-shadow:var(--shadow-sm); }

        /* ── Circle button ── */
        .circle-wrap { position:relative; display:flex; align-items:center; justify-content:center; }
        .pulse-ring  { position:absolute; border-radius:50%; animation:pls 2.2s ease-in-out infinite; }
        @keyframes pls { 0%,100%{transform:scale(1);opacity:0.28} 50%{transform:scale(1.12);opacity:0.08} }
        .circle-btn  { width:150px; height:150px; border-radius:50%; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; transition:transform 0.25s, box-shadow 0.25s; position:relative; z-index:1; font-family:var(--font-head); }
        .circle-btn:hover:not(:disabled) { transform:scale(1.06); }
        .circle-btn:disabled { cursor:not-allowed; opacity:0.6; }
        .btn-label { font-size:13px; font-weight:800; letter-spacing:0.08em; }
        .btn-sub   { font-size:10px; letter-spacing:0.04em; opacity:0.7; }
        .timer-big { font-family:var(--font-head); font-size:28px; font-weight:800; letter-spacing:0.04em; }

        /* ── Break button ── */
        .break-btn { padding:9px 24px; border-radius:var(--r-sm); font-family:var(--font-head); font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; letter-spacing:0.04em; width:100%; max-width:260px; }
        .break-idle   { border:2px solid var(--warning); background:var(--warning-bg); color:var(--warning-dark); }
        .break-idle:hover   { background:var(--warning-border); }
        .break-active { border:2px solid var(--warning); background:var(--warning); color:var(--white); }

        /* ── Timeline ── */
        .timeline { width:100%; display:flex; flex-direction:column; gap:7px; }
        .titem    { display:flex; align-items:center; gap:10px; padding:9px 13px; background:var(--surface); border-radius:var(--r-sm); border:1px solid var(--border); }
        .tdot     { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .tlabel   { font-size:12px; color:var(--text-secondary); flex:1; }
        .ttime    { font-size:12px; font-family:var(--font-head); font-weight:700; }

        /* ── Done card ── */
        .done-card { background:linear-gradient(135deg,var(--info-bg),var(--success-bg)); border:2px solid var(--info-border); border-radius:var(--r-lg); padding:20px; text-align:center; width:100%; }
        .done-title{ font-family:var(--font-head); font-size:16px; font-weight:800; color:var(--brand-4); margin-bottom:6px; }

        /* ── Bottom grid ── */
        .bot-grid    { display:grid; grid-template-columns:1fr 320px; gap:20px; }
        .sales-card  { background:var(--white); border:1px solid var(--border); border-radius:var(--r-xl); padding:20px; display:flex; flex-direction:column; gap:12px; box-shadow:var(--shadow-sm); }
        .brands-card { background:var(--white); border:1px solid var(--border); border-radius:var(--r-xl); padding:20px; display:flex; flex-direction:column; gap:14px; box-shadow:var(--shadow-sm); }

        .card-head  { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
        .card-title { font-family:var(--font-head); font-size:14px; font-weight:700; color:var(--text-primary); }

        /* ── Buttons ── */
        .add-btn { padding:7px 14px; border-radius:var(--r-sm); border:none; background:var(--brand-4); color:var(--white); font-size:12px; font-weight:700; cursor:pointer; font-family:var(--font-head); transition:background 0.2s; }
        .add-btn:hover { background:var(--brand-3); }
        .fsave { width:100%; padding:11px; border-radius:var(--r-md); border:none; background:var(--success); color:var(--white); font-family:var(--font-head); font-size:13px; font-weight:700; cursor:pointer; margin-top:8px; letter-spacing:0.04em; transition:background 0.2s; }
        .fsave:hover { background:var(--success-dark); }
        .fsave:disabled { opacity:0.6; cursor:not-allowed; }

        /* ── Sale form ── */
        .sale-form { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:14px; display:flex; flex-direction:column; gap:0; }
        .remarks-input { width:100%; border:1.5px solid var(--border); border-radius:var(--r-sm); padding:8px 12px; font-size:12px; font-family:inherit; resize:vertical; outline:none; color:var(--text-primary); margin-top:8px; }
        .remarks-input:focus { border-color:var(--brand-2); }

        /* ── Sale items ── */
        .empty { text-align:center; color:var(--text-subtle); font-size:13px; padding:20px 0; }
        .sale-item { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:12px 14px; display:flex; align-items:center; gap:12px; }

        /* ── Brand bars ── */
        .brand-row  { display:flex; flex-direction:column; gap:6px; }
        .brand-top  { display:flex; justify-content:space-between; }
        .brand-name { font-size:12px; font-weight:700; color:var(--text-primary); }
        .brand-amt  { font-size:12px; font-weight:700; color:var(--success); }
        .brand-bar  { height:6px; background:var(--surface-2); border-radius:var(--r-full); overflow:hidden; }
        .brand-fill { height:100%; background:linear-gradient(90deg,var(--brand-2),var(--brand-1)); border-radius:var(--r-full); transition:width 0.7s ease; }

        /* ── Summary grid ── */
        .summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; width:100%; }
        .sum-item  { background:var(--surface); border-radius:var(--r-sm); border:1px solid var(--border); padding:10px 14px; }
        .sum-label { font-size:10px; color:var(--text-subtle); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
        .sum-val   { font-family:var(--font-head); font-size:14px; font-weight:800; }

        /* ── Form total ── */
        .form-total { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--info-bg); border-radius:var(--r-sm); border:1px solid var(--info-border); }
        .form-total-label { font-size:12px; font-weight:700; color:var(--brand-4); }
        .form-total-val   { font-family:var(--font-head); font-size:18px; font-weight:800; color:var(--brand-4); }

        /* ── Overlays & Modals ── */
        .overlay { position:fixed; inset:0; background:rgba(13,69,103,0.55); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; backdrop-filter:blur(3px); }
        .modal-box { background:var(--white); border-radius:var(--r-xl); padding:28px 24px; max-width:360px; width:100%; display:flex; flex-direction:column; align-items:center; gap:12px; box-shadow:var(--shadow-lg); }
        .modal-title { font-family:var(--font-head); font-size:18px; font-weight:800; color:var(--text-primary); }
        .modal-sub   { font-size:13px; color:var(--text-secondary); text-align:center; }
        .modal-warn  { font-size:11px; color:var(--warning-dark); background:var(--warning-bg); padding:8px 12px; border-radius:var(--r-sm); text-align:center; width:100%; border:1px solid var(--warning-border); }
        .modal-btns  { display:flex; gap:10px; width:100%; margin-top:6px; }
        .modal-cancel { flex:1; padding:10px; border-radius:var(--r-sm); border:1.5px solid var(--border); background:var(--white); color:var(--text-secondary); font-size:13px; font-weight:600; cursor:pointer; }
        .modal-cancel:hover { background:var(--surface); }
        .modal-confirm { flex:1; padding:10px; border-radius:var(--r-sm); border:none; color:var(--white); font-size:13px; font-weight:700; cursor:pointer; box-shadow:var(--shadow-md); }

        /* ── Rules modal ── */
        .rules-box    { background:var(--white); border-radius:var(--r-xl); padding:24px; max-width:360px; width:100%; display:flex; flex-direction:column; gap:12px; box-shadow:var(--shadow-lg); }
        .rules-header { display:flex; align-items:center; justify-content:space-between; }
        .rules-title  { font-family:var(--font-head); font-size:16px; font-weight:800; color:var(--text-primary); }
        .rules-close  { width:28px; height:28px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface); color:var(--text-secondary); cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center; }
        .rule-item    { display:flex; align-items:flex-start; gap:10px; }
        .rule-dot     { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
        .rule-text    { font-size:13px; color:var(--text-secondary); line-height:1.5; }

        /* ── Toast ── */
        .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); padding:10px 20px; border-radius:var(--r-sm); font-size:13px; font-weight:600; z-index:9999; animation:slideup 0.3s ease; white-space:nowrap; box-shadow:var(--shadow-lg); max-width:90vw; }
        .toast-ok  { background:var(--success); color:var(--white); }
        .toast-err { background:var(--danger);  color:var(--white); }
        @keyframes slideup { from{transform:translateX(-50%) translateY(20px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }

        /* ── Summary table / cards responsive toggle ── */
        .sum-table-wrap { display:block; }
        .sum-cards-wrap { display:none; }

        /* ════════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════════════════ */

        /* ── ≤1100px: collapse bot-grid brands ── */
        @media (max-width:1100px) {
          .brands-card { display:none; }
          .bot-grid { grid-template-columns:1fr; }
        }

        /* ── ≤960px: checkin + geo side by side, slim ── */
        @media (max-width:960px) {
          .mid-grid { grid-template-columns:1fr 1fr; }
          .main { padding:16px; }
        }

        /* ── ≤768px: full single-column ── */
        @media (max-width:768px) {
          .main { padding:12px; }
          .top-stats { grid-template-columns:1fr 1fr; gap:10px; }
          .mid-grid  { grid-template-columns:1fr; }
          .bot-grid  { grid-template-columns:1fr; }
          .scard { padding:14px 16px; }
          .checkin-card { padding:22px 16px; gap:14px; }
          .circle-btn { width:135px; height:135px; }
          .timer-big  { font-size:24px; }
          .logo-sub   { display:none; }
          .store-pill { display:none; }
          .rules-btn span { display:none; }
          .sum-table-wrap { display:none; }
          .sum-cards-wrap { display:block; }
          .topbar { padding:0 14px; }
        }

        /* ── ≤520px: extra-small phones ── */
        @media (max-width:520px) {
          .main { padding:10px; }
          .top-stats { grid-template-columns:1fr 1fr; gap:8px; }
          .scard { padding:12px 14px; }
          .checkin-card { padding:18px 12px; gap:12px; }
          .circle-btn  { width:120px; height:120px; }
          .timer-big   { font-size:22px; }
          .btn-label   { font-size:12px; }
          .topbar { height:50px; padding:0 12px; }
          .top-clock { font-size:13px; }
          .logo-name { font-size:12px; }
          .status-pill { display:none; }
          .logout-btn  { display:none; }
          .summary-grid { grid-template-columns:1fr 1fr; }
          .geo-card { padding:14px; }
          .geo-card > div:first-child { font-size:13px; }
          .modal-box { padding:22px 18px; }
        }

        /* ── ≤380px: very small ── */
        @media (max-width:380px) {
          .top-stats { grid-template-columns:1fr; }
          .circle-btn { width:110px; height:110px; }
          .timer-big  { font-size:20px; }
        }

        /* ── Touch improvements ── */
        @media (hover:none) {
          .circle-btn:active:not(:disabled) { transform:scale(0.96); }
          .add-btn:active  { opacity:0.8; }
          .break-btn:active{ opacity:0.8; }
        }

        select { -webkit-appearance:none; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 20 20' fill='%236a88a0'%3E%3Cpath fillRule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clipRule='evenodd'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:28px !important; }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        input[type=number] { -moz-appearance:textfield; }
      `}</style>

      <div className="root">
        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="logo">
            <div style={{ width:30, height:30, borderRadius:7, background:"var(--brand-1-20)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="rgba(255,255,255,0.9)"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <div className="logo-name">GMPL Field Operations</div>
              <div className="logo-sub">Brand Ambassador Portal</div>
            </div>
          </div>
          <div className="top-clock">{time}</div>
          <div className="top-right">
            <div className="status-pill">
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#5dd8a8" }}/>Online
            </div>
            {storeName && <div className="store-pill"><svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>{storeName}</div>}
            {shiftName && <div className="store-pill"><svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>{shiftName}</div>}
            <button className="rules-btn" onClick={() => setShowRules(true)}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
              <span>Rules</span>
            </button>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main">
          {/* ── TOP STAT CARDS ── */}
          <div className="top-stats">
            {/* Sales card */}
            <div className="scard">
              <div className="scard-label">Sales</div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:4, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:9, color:"var(--text-subtle)", fontWeight:600, marginBottom:2 }}>Today</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:18, fontWeight:800, color:"var(--brand-4)" }}>Rs {totalSales.toLocaleString()}</div>
                </div>
                <div style={{ width:1, height:32, background:"var(--border)", flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:9, color:"var(--text-subtle)", fontWeight:600, marginBottom:2 }}>MTD</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:18, fontWeight:800, color:"var(--success)" }}>Rs {totalSales.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Attendance card */}
            <div className="scard">
              <div className="scard-label">Attendance · {new Date().toLocaleString("default",{month:"long",year:"numeric"})}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, flexWrap:"wrap" }}>
                {[
                  { val:monthStats.present, label:"Present", color:"var(--success)" },
                  { val:monthStats.absent,  label:"Absent",  color:"var(--danger)" },
                  { val:new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate(), label:"Total", color:"var(--text-secondary)" },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{ display:"contents" }}>
                    <div style={{ textAlign:"center", flex:1, minWidth:40 }}>
                      <div style={{ fontFamily:"var(--font-head)", fontSize:26, fontWeight:800, color:item.color, lineHeight:1 }}>{item.val}</div>
                      <div style={{ fontSize:10, color:item.color, fontWeight:600, marginTop:3 }}>{item.label}</div>
                    </div>
                    {i < arr.length - 1 && <div style={{ width:1, height:40, background:"var(--border)", flexShrink:0 }}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Status card */}
            <div className="scard">
              <div className="scard-label">Status Today</div>
              <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
                <span style={{ padding:"4px 12px", borderRadius:"var(--r-full)", fontSize:12, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5, alignSelf:"flex-start",
                  background: status==="checkedin" ? "var(--success-bg)" : status==="break" ? "var(--warning-bg)" : status==="checkedout" ? "var(--info-bg)" : "var(--surface-2)",
                  color:      status==="checkedin" ? "var(--success-text)" : status==="break" ? "var(--warning-text)" : status==="checkedout" ? "var(--brand-4)" : "var(--text-subtle)" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"currentColor" }}/>
                  {status==="idle" ? "Not Checked In" : status==="checkedin" ? "Present" : status==="break" ? "On Break" : "Shift Done"}
                </span>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {storeName && <div style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                    <svg width="11" height="11" viewBox="0 0 20 20" fill="var(--text-subtle)"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                    {storeName}
                  </div>}
                  {shiftName && <div style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                    <svg width="11" height="11" viewBox="0 0 20 20" fill="var(--text-subtle)"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                    {shiftName}
                  </div>}
                </div>
              </div>
            </div>
          </div>

          {/* ── MIDDLE GRID ── */}
          <div className="mid-grid">
            {/* ── CHECK-IN CARD ── */}
            <div className="checkin-card">
              {/* Greeting */}
              <div style={{ textAlign:"center", width:"100%", paddingBottom:2 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginBottom:4 }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="var(--text-subtle)">
                    {new Date().getHours() < 12
                      ? <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                      : <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    }
                  </svg>
                  <span style={{ fontSize:11, color:"var(--text-muted)", fontWeight:500 }}>
                    {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"}
                  </span>
                </div>
                <div style={{ fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, color:"var(--text-primary)", lineHeight:1.2 }}>{userName}</div>
              </div>

              <div style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:-4 }}>
                {status==="idle" && !canCheckIn && distanceFromStore !== null && "You are out of location"}
                {status==="idle" && isWithinRange && locationAllowed && "You are in your location — start your shift!"}
                {status==="idle" && distanceFromStore === null && locationAllowed && "Getting your location..."}
                {status==="idle" && !locationAllowed && "Enable location to check in"}
                {status==="checkedin"  && "You are checked in — working!"}
                {status==="break"      && "Enjoy your break"}
                {status==="checkedout" && "Shift completed for today!"}
              </div>

              {/* Circle */}
              <div className="circle-wrap">
                <div className="pulse-ring" style={{ width:195, height:195, border:`2px solid ${(status==="idle"&&!canCheckIn) ? "var(--border)" : btn.color}`, opacity:(status==="checkedout"||(status==="idle"&&!canCheckIn)) ? 0 : 0.22 }} />
                <div className="pulse-ring" style={{ width:175, height:175, border:`2px solid ${(status==="idle"&&!canCheckIn) ? "var(--border)" : btn.color}`, opacity:(status==="checkedout"||(status==="idle"&&!canCheckIn)) ? 0 : 0.12, animationDelay:"0.5s" }} />
                <button className="circle-btn" disabled={loading||status==="checkedout"||!canCheckIn} onClick={handleCircleClick}
                  style={{
                    background: (status==="idle"&&!canCheckIn) ? "var(--surface-2)" : btn.bg,
                    border:`3px solid ${(status==="idle"&&!canCheckIn) ? "var(--border)" : btn.border}`,
                    boxShadow: (status==="checkedout"||(status==="idle"&&!canCheckIn)) ? "none" : `0 8px 32px ${btn.shadow}, 0 0 0 6px ${btn.bg}`
                  }}>
                  <div className="btn-label" style={{ color:(status==="idle"&&!canCheckIn) ? "var(--text-subtle)" : btn.color }}>
                    {loading ? "..." : btn.label}
                  </div>
                  <div className="btn-sub" style={{ color:(status==="idle"&&!canCheckIn) ? "var(--text-subtle)" : btn.color }}>
                    {loading ? "Please wait" : (status==="idle"&&!canCheckIn&&distanceFromStore!==null) ? `${fmtDist(distanceFromStore)} away` : btn.sub}
                  </div>
                </button>
              </div>

              <div className="timer-big" style={{ color:(status==="idle"&&!canCheckIn) ? "var(--border-2)" : btn.color }}>{formatTime(timer)}</div>

              {status==="checkedin" && <button className="break-btn break-idle" onClick={()=>handleAction("break_start")} disabled={loading}>Take a Break</button>}
              {status==="break"     && <button className="break-btn break-active" onClick={()=>handleAction("break_end")} disabled={loading}>End Break — {formatTime(breakTimer)}</button>}

              {status==="checkedout" && (
                <div className="done-card">
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--info-bg)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="var(--brand-2)"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  </div>
                  <div className="done-title">Shift Complete!</div>
                  <div style={{ fontSize:12, color:"var(--brand-3)" }}>You cannot check in again today. See you tomorrow!</div>
                  {attendance?.check_in && attendance?.check_out && (
                    <div style={{ marginTop:12, fontSize:12, color:"var(--brand-2)", fontWeight:600 }}>{fmtTime(attendance.check_in)} → {fmtTime(attendance.check_out)}</div>
                  )}
                </div>
              )}

              {/* Inline target bar */}
              <InlineTargetBar />

              {/* Leave & Resignation */}
              <div style={{ display:"flex", gap:8, width:"100%" }}>
                <button onClick={() => alert("Leave")}
                  style={{ flex:1, padding:"11px 0", borderRadius:"var(--r-md)", border:"none", background:"var(--brand-4)", color:"var(--white)", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, transition:"background 0.2s" }}
                  onMouseOver={e=>(e.currentTarget.style.background="var(--brand-3)")}
                  onMouseOut={e=>(e.currentTarget.style.background="var(--brand-4)")}>
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                  Apply Leave
                </button>
                <button onClick={() => alert("Resign")}
                  style={{ flex:1, padding:"11px 0", borderRadius:"var(--r-md)", border:"none", background:"var(--danger)", color:"var(--white)", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, transition:"background 0.2s" }}
                  onMouseOver={e=>(e.currentTarget.style.background="var(--danger-dark)")}
                  onMouseOut={e=>(e.currentTarget.style.background="var(--danger)")}>
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
                  Resignation
                </button>
              </div>

              {/* Attendance timeline */}
              {attendance && (
                <div className="timeline">
                  {attendance.check_in    && <div className="titem"><div className="tdot" style={{background:"var(--success)"}}/><div className="tlabel">Checked In</div>    <div className="ttime" style={{color:"var(--success)"}}>{fmtTime(attendance.check_in)}</div></div>}
                  {attendance.break_start && <div className="titem"><div className="tdot" style={{background:"var(--warning)"}}/><div className="tlabel">Break Started</div> <div className="ttime" style={{color:"var(--warning)"}}>{fmtTime(attendance.break_start)}</div></div>}
                  {attendance.break_end   && <div className="titem"><div className="tdot" style={{background:"var(--success)"}}/><div className="tlabel">Break Ended</div>   <div className="ttime" style={{color:"var(--success)"}}>{fmtTime(attendance.break_end)}</div></div>}
                  {attendance.check_out   && <div className="titem"><div className="tdot" style={{background:"var(--danger)"}}/><div className="tlabel">Checked Out</div>   <div className="ttime" style={{color:"var(--danger)"}}>{fmtTime(attendance.check_out)}</div></div>}
                </div>
              )}
            </div>

            {/* ── GEO CARD ── */}
            <div className="geo-card">
              <div style={{ fontFamily:"var(--font-head)", fontSize:14, fontWeight:700, color:"var(--text-primary)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                Live Location
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  {location?.accuracy && (
                    <span style={{ fontSize:10, fontWeight:500, padding:"2px 8px", borderRadius:"var(--r-full)", background:"var(--success-bg)", color:"var(--success-text)", border:"1px solid var(--success-border)" }}>
                      GPS ±{Math.round(location.accuracy)}m
                    </span>
                  )}
                  {distanceFromStore !== null && storeCoords && (
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:"var(--r-full)",
                      background: isWithinRange ? "var(--success-bg)" : "var(--danger-bg)",
                      color:      isWithinRange ? "var(--success-text)" : "var(--danger-text)",
                      border:`1px solid ${isWithinRange ? "var(--success-border)" : "var(--danger-border)"}` }}>
                      {fmtDist(distanceFromStore)} from store
                    </span>
                  )}
                </div>
              </div>

              {/* GPS row */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"var(--surface)", borderRadius:"var(--r-sm)", border:"1px solid var(--border)", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--success)", flexShrink:0, animation:"pls 2s ease-in-out infinite" }} />
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{locationName}</div>
                    {location && <div style={{ fontSize:10, color:"var(--text-subtle)", marginTop:2 }}>Lat: {location.latitude.toFixed(6)} | Lon: {location.longitude.toFixed(6)}</div>}
                  </div>
                </div>
                <button onClick={getLocation} style={{ padding:"5px 12px", borderRadius:"var(--r-sm)", border:"1px solid var(--border)", background:"var(--white)", color:"var(--text-secondary)", fontSize:11, cursor:"pointer", fontWeight:600, flexShrink:0 }}>Refresh</button>
              </div>

              {/* Map */}
              {mapLocation && storeCoords ? (
                <div style={{ position:"relative", borderRadius:"var(--r-md)", overflow:"hidden", border:"1px solid var(--border)" }}>
                  <iframe
                    key={`map-${Math.round(mapLocation.lat*1000)}-${Math.round(mapLocation.lng*1000)}`}
                    title="geofence-map"
                    width="100%"
                    height="300"
                    style={{ border:"none", display:"block" }}
                    srcDoc={`<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<style>html,body,#map{margin:0;padding:0;width:100%;height:300px;}</style>
</head><body><div id="map"></div>
<script>
  var baLat=${mapLocation.lat},baLng=${mapLocation.lng};
  var stLat=${storeCoords.lat},stLng=${storeCoords.lng};
  var dist=${distanceFromStore},within=${isWithinRange};
  var map=L.map('map',{zoomControl:true,attributionControl:true,scrollWheelZoom:true,touchZoom:true,doubleClickZoom:true,dragging:true,tap:true});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'OSM'}).addTo(map);
  map.fitBounds(L.latLngBounds([[baLat,baLng],[stLat,stLng]]).pad(0.35));
  L.circle([stLat,stLng],{radius:200,color:within?'#0d9e6e':'#d94040',fillColor:within?'#0d9e6e':'#d94040',fillOpacity:0.1,weight:2,dashArray:'6,4'}).addTo(map);
  L.polyline([[baLat,baLng],[stLat,stLng]],{color:within?'#0d9e6e':'#d94040',weight:2,dashArray:'5,5',opacity:0.6}).addTo(map);
  L.marker([stLat,stLng],{icon:L.divIcon({html:'<div style="background:#d94040;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>',iconSize:[18,18],iconAnchor:[9,9],className:''})}).addTo(map).bindPopup('<b>Store</b>').openPopup();
  L.marker([baLat,baLng],{icon:L.divIcon({html:'<div style="background:#1570a6;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>',iconSize:[16,16],iconAnchor:[8,8],className:''})}).addTo(map).bindPopup('<b>You</b>');
  var midLat=(baLat+stLat)/2,midLng=(baLng+stLng)/2;
  L.marker([midLat,midLng],{icon:L.divIcon({html:'<div style="background:rgba(13,69,103,0.85);color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">'+dist+'m</div>',className:'',iconAnchor:[25,12]})}).addTo(map);
</script></body></html>`}
                  />
                  <div style={{ position:"absolute", top:8, right:8, zIndex:1000, background:"rgba(255,255,255,0.95)", borderRadius:"var(--r-sm)", padding:"6px 10px", fontSize:10, fontWeight:600, boxShadow:"var(--shadow-sm)", display:"flex", flexDirection:"column", gap:4, pointerEvents:"none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:"50%", background:"var(--brand-2)", border:"2px solid var(--white)" }}/>You</div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:"50%", background:"var(--danger)",  border:"2px solid var(--white)" }}/>Store</div>
                  </div>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${storeCoords.lat},${storeCoords.lng}&travelmode=walking`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ position:"absolute", bottom:8, left:8, zIndex:1000, display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:"var(--r-sm)", background:"var(--brand-4)", color:"var(--white)", fontSize:11, fontWeight:700, textDecoration:"none", boxShadow:"var(--shadow-md)" }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                    Navigate to Store
                  </a>
                </div>
              ) : (
                <div style={{ height:300, background:"var(--surface)", borderRadius:"var(--r-md)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="var(--text-subtle)"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                  </div>
                  <div style={{ fontSize:13, color:"var(--text-subtle)" }}>Waiting for GPS signal...</div>
                </div>
              )}

              {/* Distance status */}
              {storeCoords && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:"10px 14px", borderRadius:"var(--r-sm)", flexWrap:"wrap",
                  background: distanceFromStore===null ? "var(--surface)" : isWithinRange ? "var(--success-bg)" : "var(--danger-bg)",
                  border:`1px solid ${distanceFromStore===null ? "var(--border)" : isWithinRange ? "var(--success-border)" : "var(--danger-border)"}` }}>
                  <div style={{ flex:1, minWidth:120 }}>
                    {distanceFromStore === null ? (
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--text-secondary)" }}>Getting your location...</div>
                    ) : isWithinRange ? (
                      <>
                        <div style={{ fontSize:12, fontWeight:700, color:"var(--success-text)" }}>✓ You are {fmtDist(distanceFromStore)} from store</div>
                        <div style={{ fontSize:10, color:"var(--success)" }}>Within 200m — Check in enabled</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize:12, fontWeight:700, color:"var(--danger-text)" }}>⚠ You are {fmtDist(distanceFromStore)} away</div>
                        <div style={{ fontSize:10, color:"var(--text-subtle)" }}>Move within 200m to check in</div>
                      </>
                    )}
                  </div>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${storeCoords.lat},${storeCoords.lng}&travelmode=walking`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:"var(--r-full)", background:"var(--brand-4)", color:"var(--white)", textDecoration:"none", fontSize:12, fontWeight:700, flexShrink:0, boxShadow:"var(--shadow-sm)" }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                    Directions
                  </a>
                </div>
              )}

              {/* Today Summary */}
              <div style={{ fontSize:11, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600 }}>Today Summary</div>
              <div className="summary-grid">
                {[
                  { label:"Check In",    value:fmtTime(attendance?.check_in),    color:"var(--success)" },
                  { label:"Check Out",   value:fmtTime(attendance?.check_out),   color:"var(--danger)" },
                  { label:"Break Start", value:fmtTime(attendance?.break_start), color:"var(--warning)" },
                  { label:"Break End",   value:fmtTime(attendance?.break_end),   color:"var(--warning)" },
                ].map(item => (
                  <div className="sum-item" key={item.label}>
                    <div className="sum-label">{item.label}</div>
                    <div className="sum-val" style={{ color:item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Salary Breakdown */}
      
            </div>
          </div>
<div style={{ paddingBottom:20}}><SalaryBreakdown /></div>
     

          {/* ── BOTTOM GRID ── */}
          <div className="bot-grid">
            {/* ── SALES CARD ── */}
            <div className="sales-card">
              <div className="card-head">
                <div className="card-title">Today's Sales</div>
                <div style={{ display:"flex", gap:8 }}>
                  {!showSaleForm && (
                    <button onClick={handleZeroSale} disabled={loading}
                      style={{ padding:"7px 14px", borderRadius:"var(--r-sm)", border:"1.5px solid var(--border)", background:"var(--white)", color:"var(--text-muted)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      0 No Sale
                    </button>
                  )}
                  <button className="add-btn" onClick={() => setShowSaleForm(!showSaleForm)}>
                    {showSaleForm ? "Cancel" : "+ Add Sale"}
                  </button>
                </div>
              </div>

              {/* Sale form */}
              {showSaleForm && (
                <div className="sale-form">
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--brand-4)", marginBottom:10 }}>Add Sale Items</div>
                  {saleLines.map((line, idx) => {
                    const catOptions = line.brand ? [...new Set(skus.filter(s=>s.brand_name===line.brand).map(s=>s.category_name))] : [];
                    const availableSkus = (line.brand && line.category) ? skus.filter(s=>s.brand_name===line.brand&&s.category_name===line.category) : [];
                    const lineTotal = line.skuRows.reduce((s,r) => s + r.qty * r.retail_price, 0);
                    return (
                      <div key={`line-${idx}`} style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:"var(--r-md)", padding:12, marginBottom:10 }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, marginBottom:10, alignItems:"end" }}>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Brand</div>
                            <select style={{ width:"100%", padding:"7px 10px", border:"1.5px solid var(--border)", borderRadius:"var(--r-sm)", fontSize:12, outline:"none", color:"var(--text-primary)", background:"var(--white)" }}
                              value={line.brand} onChange={e=>updateLine(idx,"brand",e.target.value)}>
                              <option value="">Select Brand</option>
                              {[...new Set(skus.map(s=>s.brand_name))].map(b=><option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Category</div>
                            <select style={{ width:"100%", padding:"7px 10px", border:"1.5px solid var(--border)", borderRadius:"var(--r-sm)", fontSize:12, outline:"none", color:"var(--text-primary)", background:"var(--white)" }}
                              value={line.category} onChange={e=>updateLine(idx,"category",e.target.value)} disabled={!line.brand}>
                              <option value="">Select Category</option>
                              {catOptions.map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          {saleLines.length > 1 && (
                            <button onClick={()=>removeLine(idx)} style={{ width:28, height:28, borderRadius:"var(--r-sm)", border:"1px solid var(--danger-border)", background:"var(--danger-bg)", color:"var(--danger)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✕</button>
                          )}
                        </div>

                        {availableSkus.length > 0 && (
                          <div style={{ marginBottom: line.skuRows.length ? 10 : 0 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-subtle)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>
                              Select Products <span style={{ color:"var(--border-2)", fontWeight:400, textTransform:"none" }}>(tick all that apply)</span>
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                              {availableSkus.map(sku => {
                                const isChecked = (line.selectedSkuIds||[]).includes(sku.sku_id);
                                return (
                                  <label key={sku.sku_id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:"var(--r-sm)", border:`1.5px solid ${isChecked?"var(--success-border)":"var(--border)"}`, background:isChecked?"var(--success-bg)":"var(--white)", cursor:"pointer", userSelect:"none" }}>
                                    <input type="checkbox" checked={isChecked} onChange={()=>toggleSkuSelection(idx,sku)} style={{ width:15, height:15, accentColor:"var(--brand-2)", flexShrink:0 }} />
                                    <span style={{ flex:1, fontSize:12, fontWeight:isChecked?700:500, color:isChecked?"var(--success-text)":"var(--text-secondary)" }}>{sku.sku_name}</span>
                                    <span style={{ fontSize:11, fontWeight:700, color:"var(--success)", flexShrink:0 }}>Rs {Number(sku.retail_price).toLocaleString()} / {sku.unit_of_measure}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {line.brand && line.category && availableSkus.length === 0 && (
                          <div style={{ padding:10, textAlign:"center", fontSize:11, color:"var(--text-subtle)" }}>No products found for this category</div>
                        )}

                        {line.skuRows.length > 0 && (
                          <div style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", overflow:"hidden" }}>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 96px 80px", gap:4, padding:"6px 10px", background:"var(--surface-2)", borderBottom:"1px solid var(--border)" }}>
                              {["Product","Price","Qty","Total"].map(h=>(
                                <div key={h} style={{ fontSize:9, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.07em", textAlign:h==="Total"?"right":h==="Qty"?"center":"left" }}>{h}</div>
                              ))}
                            </div>
                            {line.skuRows.map(row=>(
                              <div key={row.sku_id} style={{ display:"grid", gridTemplateColumns:"1fr 90px 96px 80px", gap:4, padding:"8px 10px", borderBottom:"1px solid var(--surface-2)", alignItems:"center", background:"var(--success-bg)" }}>
                                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-primary)", lineHeight:1.3 }}>
                                  {row.sku_name}
                                  <span style={{ display:"block", fontSize:9, color:"var(--text-subtle)", fontWeight:400 }}>{row.uom}</span>
                                </div>
                                <div style={{ fontSize:11, fontWeight:700, color:"var(--success)" }}>Rs {row.retail_price.toLocaleString()}</div>
                                <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                                  <button onClick={()=>updateSkuQty(idx,row.sku_id,row.qty-1)} style={{ width:24, height:24, borderRadius:"var(--r-sm)", border:"1px solid var(--danger-border)", background:"var(--danger-bg)", color:"var(--danger)", cursor:"pointer", fontSize:14, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>-</button>
                                  <input type="number" min={1} value={row.qty}
                                    onChange={e=>updateSkuQty(idx,row.sku_id,Math.max(1,parseInt(e.target.value)||1))}
                                    style={{ width:36, textAlign:"center", border:"1.5px solid var(--border)", borderRadius:"var(--r-sm)", fontSize:12, fontWeight:700, padding:"3px 0", outline:"none", color:"var(--text-primary)" }} />
                                  <button onClick={()=>updateSkuQty(idx,row.sku_id,row.qty+1)} style={{ width:24, height:24, borderRadius:"var(--r-sm)", border:"1px solid var(--success-border)", background:"var(--success-bg)", color:"var(--success)", cursor:"pointer", fontSize:14, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                                </div>
                                <div style={{ fontSize:12, fontWeight:800, color:"var(--success)", textAlign:"right" }}>Rs {(row.qty*row.retail_price).toLocaleString()}</div>
                              </div>
                            ))}
                            {lineTotal > 0 && (
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", background:"var(--success-bg)", borderTop:"1px solid var(--success-border)" }}>
                                <span style={{ fontSize:11, color:"var(--success-text)", fontWeight:600 }}>{line.brand} · {line.category} subtotal</span>
                                <span style={{ fontSize:13, fontWeight:800, color:"var(--success-text)" }}>Rs {lineTotal.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button onClick={addLine} style={{ width:"100%", padding:8, border:"1.5px dashed var(--border-2)", borderRadius:"var(--r-sm)", background:"transparent", color:"var(--text-secondary)", fontSize:12, fontWeight:600, cursor:"pointer", marginBottom:10 }}>
                    + Add Another Brand / Category
                  </button>

                  <div className="form-total">
                    <span className="form-total-label">Entry Total</span>
                    <span className="form-total-val">Rs {grandTotal.toLocaleString()}</span>
                  </div>

                  <textarea className="remarks-input" rows={2} placeholder="Remarks (optional)..." value={saleRemarks} onChange={e=>setSaleRemarks(e.target.value)} />
                  <button className="fsave" onClick={handleAddSale} disabled={loading}>{loading ? "Saving..." : "Save Sales Entry"}</button>
                </div>
              )}

              {/* Sales list */}
              {sales.length === 0 ? (
                <div className="empty">No sales recorded today</div>
              ) : (
                sales.map((sale: Record<string,any>, i: number) => {
                  const isZero = Number(sale.total_sales||0) === 0;
                  return (
                    <div className="sale-item" key={i} style={{ flexDirection:"column", alignItems:"stretch", gap:8, background:isZero?"var(--warning-bg)":"var(--surface)", border:`${isZero?"1.5":"1"}px solid ${isZero?"var(--warning-border)":"var(--border)"}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{sale.store_name || "Sales Entry"}</div>
                          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>
                            {sale.sales_date} · {sale.item_count||0} items
                            {isZero && <span style={{ marginLeft:6, padding:"2px 8px", background:"var(--warning-bg)", color:"var(--warning-dark)", borderRadius:"var(--r-full)", fontSize:10, fontWeight:700, border:"1px solid var(--warning-border)" }}>Zero Sale</span>}
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          <div style={{ fontFamily:"var(--font-head)", fontSize:14, fontWeight:800, color:"var(--success)" }}>Rs {Number(sale.total_sales||0).toLocaleString()}</div>
                          <button onClick={()=>handleDeleteSale(sale.sales_entry_id)} disabled={loading}
                            style={{ padding:"4px 10px", borderRadius:"var(--r-sm)", border:`1px solid ${isZero?"var(--warning-border)":"var(--danger-border)"}`, background:isZero?"var(--warning-bg)":"var(--danger-bg)", color:isZero?"var(--warning-dark)":"var(--danger)", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                            {isZero ? "Undo" : "✕"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {sales.length > 0 && (
                <div style={{ borderTop:"1px solid var(--border)", marginTop:12, paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, color:"var(--text-secondary)" }}>Total Today</span>
                  <span style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:18, color:"var(--success)" }}>Rs {totalSales.toLocaleString()}</span>
                </div>
              )}

              {/* Daily photo */}
              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--surface-2)" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:10 }}>📷 Daily Photo</div>
                {!imagePreview ? (
                  <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, padding:"16px 10px", border:"2px dashed var(--info-border)", borderRadius:"var(--r-md)", background:"var(--info-bg)", cursor:"pointer", textAlign:"center" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brand-2)" strokeWidth="1.8">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span style={{ fontSize:11, fontWeight:700, color:"var(--brand-2)" }}>Open Camera</span>
                    <span style={{ fontSize:10, color:"var(--info-border)" }}>Take a photo</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{ display:"none" }} />
                  </label>
                ) : (
                  <div style={{ position:"relative" }}>
                    <img src={imagePreview} alt="preview" style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:"var(--r-sm)", border:"2px solid var(--success-border)", display:"block" }} />
                    <button onClick={()=>{setSaleImage(null);setImagePreview(null);}} style={{ position:"absolute", top:8, right:8, width:30, height:30, borderRadius:"50%", border:"none", background:"rgba(0,0,0,0.65)", color:"var(--white)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    <div style={{ marginTop:6, fontSize:11, color:"var(--success)", fontWeight:600 }}>✓ Photo ready to submit</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── BRANDS CARD (hidden on mobile) ── */}
            <div className="brands-card">
              <div className="card-head"><div className="card-title">Sales by Brand</div></div>
              {brands.length === 0 ? (
                <div className="empty">Loading brands...</div>
              ) : brands.map(brand => {
                const bt  = salesByBrand[brand] || 0;
                const pct = totalSalesForBar > 0 ? (bt/totalSalesForBar)*100 : 0;
                return (
                  <div className="brand-row" key={brand}>
                    <div className="brand-top">
                      <span className="brand-name">{brand}</span>
                      <span className="brand-amt">Rs {bt.toLocaleString()}</span>
                    </div>
                    <div className="brand-bar"><div className="brand-fill" style={{ width:`${pct}%` }}/></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SUMMARY SECTION ── */}
          <div style={{paddingTop:20}}><SummarySection  storeName={storeName} shiftName={shiftName} attendance={attendance} tdSalesAmount={totalSales} /></div>
          
        </div>

        {/* ── ZERO SALE MODAL ── */}
        {showZeroModal && (
          <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowZeroModal(false)}>
            <div className="modal-box">
              <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--warning-bg)", border:"2px solid var(--warning-border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="var(--warning)"><path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
              </div>
              <div className="modal-title">Report Zero Sale?</div>
              <div className="modal-sub">You are about to record that no products were sold today.</div>
              <div style={{ width:"100%", marginTop:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", marginBottom:6 }}>
                  Reason / Remarks <span style={{ color:"var(--text-subtle)", fontWeight:400 }}>(optional)</span>
                </div>
                <textarea rows={3} placeholder="e.g. Store was closed, no customers..." value={zeroRemarks} onChange={e=>setZeroRemarks(e.target.value)}
                  style={{ width:"100%", border:"1.5px solid var(--border)", borderRadius:"var(--r-sm)", padding:"8px 10px", fontSize:12, fontFamily:"inherit", resize:"vertical", outline:"none", color:"var(--text-primary)" }} />
              </div>
              <div className="modal-warn">You can undo this later using the Undo button on the entry.</div>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={()=>setShowZeroModal(false)}>No, Go Back</button>
                <button className="modal-confirm" style={{ background:"var(--warning)", boxShadow:"var(--shadow-md)" }} onClick={submitZeroSale} disabled={loading}>
                  {loading ? "Submitting..." : "Yes, Zero Sale"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKOUT CONFIRM MODAL ── */}
        {showConfirm && (
          <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowConfirm(false)}>
            <div className="modal-box">
              <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--danger-bg)", border:"2px solid var(--danger-border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="var(--danger)"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
              </div>
              <div className="modal-title">Confirm Check Out?</div>
              <div className="modal-sub">Make sure you have added all your sales before checking out.</div>
              <div className="modal-warn">Once you check out, you cannot check in again today!</div>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={()=>setShowConfirm(false)}>No, Go Back</button>
                <button className="modal-confirm" style={{ background:"var(--danger)", boxShadow:"0 4px 12px var(--danger-shadow)" }} onClick={()=>handleAction("checkout")}>
                  Yes, Check Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RULES MODAL ── */}
        {showRules && (
          <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowRules(false)}>
            <div className="rules-box">
              <div className="rules-header">
                <div className="rules-title">Attendance Rules</div>
                <button className="rules-close" onClick={()=>setShowRules(false)}>✕</button>
              </div>
              {RULES.map(i=>(
                <div className="rule-item" key={i.text}>
                  <div className="rule-dot" style={{ background:i.color }}/>
                  <div className="rule-text">{i.text}</div>
                </div>
              ))}
              <div style={{ marginTop:14, padding:"10px 14px", background:"var(--warning-bg)", borderRadius:"var(--r-sm)", fontSize:12, color:"var(--warning-text)", fontWeight:500, border:"1px solid var(--warning-border)" }}>
                Any violations will be flagged and reported to your admin automatically.
              </div>
            </div>
          </div>
        )}

        {message && <div className={`toast ${message.error ? "toast-err" : "toast-ok"}`}>{message.text}</div>}

        {showTerms && (
  <div style={{position:"fixed",inset:0,background:"rgba(13,69,103,0.7)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}}>
    <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:520,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.35)"}}>
      <div style={{background:"linear-gradient(135deg,#0d4567,#10537c)",padding:"18px 22px",flexShrink:0}}>
        <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginBottom:4}}>Terms & Conditions</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>Please read and accept before continuing</div>
      </div>
  <div 
  style={{overflowY:"auto",padding:"18px 22px",flex:1}}
  onScroll={e => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      setTermsScrolled(true);
    }
  }}>
        <div style={{fontSize:12,color:"#334155",lineHeight:1.75,display:"flex",flexDirection:"column",gap:10}}>
          {["Salaries and incentives will be deposited only into the designated bank account.","Duty hours must be followed.","Prior approval is required for leave. Two days of leave will be allowed after two months of regular service with us.","In case of misconduct, false reporting, incorrect information, unapproved leave, or bad behavior, your services will be terminated immediately, and no benefits whatsoever will be provided.","Less than 15 days of work does not qualify for salary or incentives.","One month's notice is mandatory to resign from your role.","The company has the right to terminate your services at any time without prior notice; however, your salary and benefits will be paid up to your final day of work.","You will not take any legal action or file a police report against the company.","You are not entitled to any medical compensation for any accident.","Failure to achieve the assigned target may result in salary reductions and/or delayed payments.","You will not be involved in any financial transactions with the store or collect a salary from the store."].map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"#F8FAFC",borderRadius:10,border:"1px solid #E2E8F0"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"#0d4567",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</div>
              <span>{t}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:16,padding:"14px 16px",background:"#EFF6FF",borderRadius:12,border:"1.5px solid #BFDBFE"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1E3A8A",marginBottom:12,fontStyle:"italic"}}>"I hereby declare that I have read and understood all the above terms and conditions and will follow them in true letter and spirit."</div>
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
     <div style={{padding:"14px 22px",borderTop:"1px solid #E2E8F0",flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={logout} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          Decline & Logout
        </button>
   <button 
  onClick={submitTerms} 
  disabled={loading || !termsScrolled}
  style={{
    flex:2, padding:"11px 0", borderRadius:10, border:"none",
    background:"linear-gradient(135deg,#0d4567,#1570a6)",
    color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer",
    opacity: termsScrolled ? 1 : 0.5
  }}>
  {loading ? "Accepting..." : "I Accept — Continue to Dashboard"}
</button>
       {!termsScrolled && (
          <div style={{textAlign:"center",fontSize:11,color:"#94A3B8"}}>
            ↓ Scroll down to read all terms before accepting
          </div>
        )}
        
      </div>
      
    </div>
  </div>
)}
      </div>
    </>
  );
}