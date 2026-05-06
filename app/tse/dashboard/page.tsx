"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type BA = {
  employee_id: number; employee_code: string; ba_name: string;
  store_name: string; shift_name: string;
  check_in: string | null; check_out: string | null; att_status: string | null;
  days_present_mtd: number; total_working_days: number;
  ld_sales: number; mtd_sales: number;
};

export default function TSEDashboard() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [selected, setSelected] = useState<BA | null>(null);

  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/tse");
      const json = await res.json();
      setData(json);
    } catch (_e: unknown) {}
    setLoading(false);
  };

  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); };

  const fmt = (dt: string | null | undefined) =>
    dt ? new Date(dt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—";

  const pct = (present: number, total: number) =>
    total > 0 ? Math.round((present / total) * 100) : 0;

  const bas: BA[] = data?.bas || [];
  const stats = data?.stats || {};
  const topBAs: BA[] = data?.topBAs || [];

  // group by store
  const byStore = bas.reduce((acc: Record<string, BA[]>, ba) => {
    if (!acc[ba.store_name]) acc[ba.store_name] = [];
    acc[ba.store_name].push(ba);
    return acc;
  }, {});

  const TABS = [
    { key: "overview",   label: "Overview" },
    { key: "attendance", label: "Attendance" },
    { key: "sales",      label: "Sales" },
  ];

  return (
    <>
      <style>{`
        :root {
          --brand-1: #126291;
          --brand-2: #1570a6;
          --brand-3: #10537c;
          --brand-4: #0d4567;

          --brand-1-15: rgba(18,98,145,0.15);
          --brand-2-20: rgba(21,112,166,0.20);
          --brand-4-20: rgba(13,69,103,0.20);

          --topbar-bg:   var(--brand-4);
          --tab-active:  var(--brand-3);
          --btn-primary: var(--brand-3);
          --badge-role:  rgba(255,255,255,0.2);
          --badge-text:  rgba(255,255,255,0.85);
          --clock-color: rgba(255,255,255,0.75);

          --success:      #10B981;
          --success-bg:   #DCFCE7;
          --success-text: #16A34A;
          --danger:       #EF4444;
          --danger-bg:    #FEE2E2;
          --danger-text:  #DC2626;
          --warning:      #F59E0B;
          --warning-bg:   #FEF3C7;
          --warning-text: #D97706;
          --info:         #1D4ED8;
          --info-bg:      #DBEAFE;

          --white:   #ffffff;
          --surface: #F8FAFC;
          --bg:      #F1F5F9;
          --border:  #E2E8F0;

          --text-primary:   #0F172A;
          --text-secondary: #334155;
          --text-muted:     #64748B;
          --text-subtle:    #94A3B8;

          --shadow-modal: rgba(0,0,0,0.45);
          --shadow-card:  rgba(18,98,145,0.15);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--bg);font-family:inherit}
        .root{min-height:100vh;color:var(--text-primary)}
        .topbar{background:var(--topbar-bg);display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px;gap:8px;position:sticky;top:0;z-index:100}
        .logo{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
        .logo-av{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#fff;flex-shrink:0}
        .logo-name{font-weight:800;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .logo-sub{font-size:9px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.1em}
        .clock{font-size:15px;font-weight:800;color:var(--clock-color);flex-shrink:0}
        .tright{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .pill{padding:3px 10px;border-radius:20px;background:var(--badge-role);font-size:11px;color:var(--badge-text);font-weight:600}
        .logout{padding:5px 12px;border-radius:7px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.7);font-size:11px;cursor:pointer}
        .logout:hover{background:rgba(255,255,255,0.1)}
        .main{padding:16px 20px;max-width:1100px;margin:0 auto}
        .tabs{display:flex;gap:4px;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:4px;width:fit-content;margin-bottom:16px}
        .tab{padding:7px 20px;border-radius:7px;border:none;font-size:13px;font-weight:600;cursor:pointer;color:var(--text-muted);background:transparent;transition:all 0.15s}
        .tab.active{background:var(--tab-active);color:#fff}
        .sg{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px}
        .sc{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px 16px;border-top:3px solid}
        .sl{font-size:9px;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px}
        .sv{font-size:20px;font-weight:800}
        .ss{font-size:10px;color:var(--text-subtle);margin-top:2px}
        .pct-wrap{display:flex;align-items:center;gap:8px}
        .pct-bar{flex:1;height:6px;background:var(--border);border-radius:10px;overflow:hidden}
        .pct-fill{height:100%;border-radius:10px;transition:width 0.5s}
        .card{background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:12px}
        .ch{padding:10px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px}
        .ct{font-size:13px;font-weight:700}
        .tbl{overflow-x:auto;-webkit-overflow-scrolling:touch}
        table{width:100%;border-collapse:collapse}
        th{padding:7px 12px;text-align:left;font-size:9px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.05em;background:var(--surface);border-bottom:1px solid var(--border);white-space:nowrap}
        td{padding:8px 12px;font-size:12px;border-bottom:1px solid var(--surface);color:var(--text-secondary)}
        tr:hover td{background:var(--surface)}
        .b{padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;display:inline-block;white-space:nowrap}
        .bg{background:var(--success-bg);color:var(--success-text)}
        .br{background:var(--danger-bg);color:var(--danger-text)}
        .bgr{background:var(--bg);color:var(--text-muted)}
        .by{background:var(--warning-bg);color:var(--warning-text)}
        .bbl{background:var(--info-bg);color:var(--info)}
        .empty{padding:28px;text-align:center;color:var(--text-subtle);font-size:13px}
        .ldmtd{display:flex;flex-direction:column;gap:1px}
        .ld-val{font-weight:700;color:var(--brand-4);font-size:11px}
        .mtd-val{font-weight:700;color:var(--success);font-size:11px}
        .ld-lbl,.mtd-lbl{font-size:9px;color:var(--text-subtle);font-weight:500}
        .perf-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px}
        .perf-card{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:12px;cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden}
        .perf-card:hover{border-color:var(--brand-2);transform:translateY(-2px);box-shadow:0 4px 12px var(--shadow-card)}
        .perf-rank{position:absolute;top:8px;right:8px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff}
        .perf-name{font-weight:700;font-size:12px;color:var(--text-primary);margin-bottom:2px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .perf-store{font-size:10px;color:var(--text-muted);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .perf-sales{font-weight:800;font-size:14px;color:var(--success)}
        .perf-sub{font-size:9px;color:var(--text-subtle)}
        .overlay{position:fixed;inset:0;background:var(--shadow-modal);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
        .modal{background:var(--white);border-radius:14px;padding:20px;width:420px;max-width:100%;max-height:90vh;overflow-y:auto}
        .mt{font-size:15px;font-weight:800;margin-bottom:12px}
        .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .detail-box{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px}
        .detail-lbl{font-size:9px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px}
        .detail-val{font-size:13px;font-weight:700;color:var(--text-primary)}
        .btn{padding:6px 14px;border-radius:7px;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s}
        .btn-teal{background:var(--btn-primary);color:#fff}
        .btn-gray{background:var(--bg);color:var(--text-muted);border:1px solid var(--border)}
        @media(max-width:900px){.sg{grid-template-columns:1fr 1fr 1fr}.perf-grid{grid-template-columns:1fr 1fr 1fr}}
        @media(max-width:600px){
          .sg{grid-template-columns:1fr 1fr}
          .perf-grid{grid-template-columns:1fr 1fr}
          .main{padding:10px}
          .topbar{padding:0 10px}
          .logo-sub{display:none}
          .clock{font-size:12px}
          th,td{padding:5px 6px;font-size:10px}
          .tbl{overflow-x:auto;-webkit-overflow-scrolling:touch}
          .tabs{flex-wrap:wrap;width:100%}
          .tab{flex:1;text-align:center;padding:6px 8px;font-size:11px}
          .ch{flex-wrap:wrap;gap:6px}
        }
        @media(max-width:380px){.sg{grid-template-columns:1fr}.perf-grid{grid-template-columns:1fr}}
      `}</style>

      <div className="root">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="logo">
            <div className="logo-av">TS</div>
            <div>
              <div className="logo-name">GMPL — {data?.tseName || data?.tseName || "TSE Dashboard"}</div>
              <div className="logo-sub">Territory Sales Executive · {data?.amName ? `AM: ${data.amName}` : ""}</div>
            </div>
          </div>
          <div className="clock">{time}</div>
          <div className="tright">
            <span className="pill">TSE</span>
            <button className="logout" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main">
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>Loading...</div>
          ) : (
            <>
              {/* TABS */}
              <div className="tabs">
                {TABS.map(t => (
                  <button key={t.key} className={`tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW ── */}
              {tab === "overview" && (
                <>
                  {/* Stat cards — combined */}
                  <div className="sg" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
                    {/* BAs: Total / Present / Absent */}
                    <div className="sc" style={{ borderTopColor: "var(--brand-2)" }}>
                      <div className="sl">Brand Ambassadors</div>
                      <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:2}}>
                        <div style={{fontSize:24,fontWeight:800,color:"var(--brand-2)"}}>{stats.total_bas||0}</div>
                        <div style={{fontSize:12,color:"#64748B"}}>Total</div>
                      </div>
                      <div style={{display:"flex",gap:10,marginTop:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:"#10B981"}}/>
                          <span style={{fontSize:12,fontWeight:700,color:"#10B981"}}>{stats.present_today||0}</span>
                          <span style={{fontSize:10,color:"#94A3B8"}}>Present</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:"#EF4444"}}/>
                          <span style={{fontSize:12,fontWeight:700,color:"#EF4444"}}>{stats.absent_today||0}</span>
                          <span style={{fontSize:10,color:"#94A3B8"}}>Absent</span>
                        </div>
                      </div>
                    </div>

                    {/* LD / MTD Sales */}
                    <div className="sc" style={{ borderTopColor: "var(--brand-4)" }}>
                      <div className="sl">Sales</div>
                      <div style={{display:"flex",gap:16,marginTop:4,alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",letterSpacing:"0.06em",marginBottom:2}}>LAST DAY</div>
                          <div style={{fontSize:16,fontWeight:800,color:"var(--brand-4)"}}>Rs {Number(stats.ld_sales||0).toLocaleString()}</div>
                        </div>
                        <div style={{width:1,height:32,background:"#E2E8F0"}}/>
                        <div>
                          <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",letterSpacing:"0.06em",marginBottom:2}}>MTD</div>
                          <div style={{fontSize:16,fontWeight:800,color:"#10B981"}}>Rs {Number(stats.mtd_sales||0).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="ss" style={{marginTop:4}}>Month To Date</div>
                    </div>

                    {/* Attendance % */}
                    <div className="sc" style={{ borderTopColor: "#F59E0B" }}>
                      <div className="sl">Attendance Rate</div>
                      <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:2}}>
                        <div style={{fontSize:24,fontWeight:800,color:stats.att_pct>=80?"#10B981":stats.att_pct>=50?"#F59E0B":"#EF4444"}}>{stats.att_pct||0}%</div>
                        <div style={{fontSize:11,color:"#64748B"}}>Today</div>
                      </div>
                      <div className="pct-wrap" style={{marginTop:6}}>
                        <div className="pct-bar">
                          <div className="pct-fill" style={{width:`${stats.att_pct||0}%`,background:stats.att_pct>=80?"#10B981":stats.att_pct>=50?"#F59E0B":"#EF4444"}}/>
                        </div>
                        <span style={{fontSize:10,fontWeight:600,color:"#64748B"}}>{stats.att_pct||0}%</span>
                      </div>
                      <div className="ss">MTD avg {stats.avg_att_pct_mtd||0}%</div>
                    </div>
                  </div>

                  {/* BA Table — all with LD/MTD */}
                  <div className="card" style={{ marginBottom: 14 }}>
                    <div className="ch">
                      <div className="ct">All BAs — Today Summary</div>
                      <span style={{ fontSize: 11, color: "#64748B" }}>{bas.length} BAs · {new Date().toLocaleDateString("en-PK")}</span>
                    </div>
                    <div className="tbl">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Store</th>
                            <th>Shift</th>
                            <th>Status</th>
                            <th>In / Out</th>
                            <th>Att MTD</th>
                            <th>LD Sales / MTD Sales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bas.length === 0 ? (
                            <tr><td colSpan={8} className="empty">No BAs assigned</td></tr>
                          ) : bas.map(ba => {
                            const attPctMTD = pct(ba.days_present_mtd, ba.total_working_days);
                            return (
                              <tr key={ba.employee_id} style={{ cursor: "pointer" }} onClick={() => setSelected(ba)}>
                                <td style={{ fontWeight: 600 }}>{ba.ba_name}</td>
                                <td style={{ fontFamily: "monospace", fontSize: 10, color: "#94A3B8" }}>{ba.employee_code}</td>
                                <td style={{ fontSize: 11 }}>{ba.store_name}</td>
                                <td style={{ fontSize: 11 }}>{ba.shift_name || "—"}</td>
                                <td>
                                  <span className={`b ${ba.check_in ? "bg" : "br"}`}>
                                    {ba.check_in ? (ba.check_out ? "Done" : "Present") : "Absent"}
                                  </span>
                                </td>
                                <td style={{ fontSize: 11 }}>
                                  {ba.check_in ? `${fmt(ba.check_in)} → ${ba.check_out ? fmt(ba.check_out) : "active"}` : "—"}
                                </td>
                                <td>
                                  <div className="pct-wrap">
                                    <div className="pct-bar" style={{ width: 50 }}>
                                      <div className="pct-fill" style={{ width: `${attPctMTD}%`, background: attPctMTD >= 80 ? "#10B981" : attPctMTD >= 50 ? "#F59E0B" : "#EF4444" }} />
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>{attPctMTD}%</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="ldmtd">
                                    <div>
                                      <span className="ld-lbl">LD </span>
                                      <span className="ld-val">Rs {Number(ba.ld_sales).toLocaleString()}</span>
                                    </div>
                                    <div>
                                      <span className="mtd-lbl">MTD </span>
                                      <span className="mtd-val">Rs {Number(ba.mtd_sales).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    🏆 Top Performing BAs — This Month
                  </div>
                  <div className="perf-grid">
                    {topBAs.length === 0 ? (
                      <div style={{ gridColumn: "span 5", textAlign: "center", padding: 20, color: "#94A3B8", fontSize: 13 }}>No sales data yet</div>
                    ) : topBAs.map((ba, i) => (
                      <div key={ba.employee_id} className="perf-card" onClick={() => setSelected(ba)}>
                        <div className="perf-rank" style={{ background: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#CD7C2F" : "#E2E8F0", color: i < 3 ? "#fff" : "#64748B" }}>
                          {i + 1}
                        </div>
                        <div className="perf-name">{ba.ba_name}</div>
                        <div className="perf-store">{ba.store_name}</div>
                        <div className="perf-sales">Rs {Number(ba.mtd_sales).toLocaleString()}</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:2}}>
                          <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:20,background:"#DCFCE7",color:"#16A34A"}}>{ba.days_present_mtd}P / {Math.max(0,Number(ba.total_working_days)-Number(ba.days_present_mtd))}A</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── ATTENDANCE ── */}
              {tab === "attendance" && (
                <div className="card">
                  <div className="ch">
                    <div className="ct">BA Attendance — Today & MTD</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="b bg">{bas.filter(b => b.check_in).length} Present</span>
                      <span className="b br">{bas.filter(b => !b.check_in).length} Absent</span>
                      <span className="b by">{stats.att_pct || 0}% Rate</span>
                    </div>
                  </div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th><th>Code</th><th>Store</th><th>Shift</th>
                          <th>Today Status</th><th>Check In</th><th>Check Out</th>
                          <th>Days Present MTD</th><th>Working Days</th><th>Att %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bas.length === 0 ? <tr><td colSpan={10} className="empty">No BAs assigned</td></tr>
                          : bas.map(ba => {
                            const ap = pct(ba.days_present_mtd, ba.total_working_days);
                            return (
                              <tr key={ba.employee_id} style={{ cursor: "pointer" }} onClick={() => setSelected(ba)}>
                                <td style={{ fontWeight: 600 }}>{ba.ba_name}</td>
                                <td style={{ fontFamily: "monospace", fontSize: 10, color: "#94A3B8" }}>{ba.employee_code}</td>
                                <td style={{ fontSize: 11 }}>{ba.store_name}</td>
                                <td style={{ fontSize: 11 }}>{ba.shift_name || "—"}</td>
                                <td><span className={`b ${ba.check_in ? "bg" : "br"}`}>{ba.check_in ? (ba.check_out ? "Done" : "Present") : "Absent"}</span></td>
                                <td style={{ fontSize: 11 }}>{fmt(ba.check_in)}</td>
                                <td style={{ fontSize: 11 }}>{fmt(ba.check_out)}</td>
                                <td style={{ textAlign: "center", fontWeight: 700 }}>
                                  <span style={{color:"#10B981"}}>{ba.days_present_mtd}P</span>
                                  <span style={{color:"#94A3B8",margin:"0 2px"}}>/</span>
                                  <span style={{color:"#EF4444"}}>{Math.max(0,Number(ba.total_working_days)-Number(ba.days_present_mtd))}A</span>
                                </td>
                                <td style={{ textAlign: "center" }}>{ba.total_working_days}</td>
                                <td>
                                  <div className="pct-wrap">
                                    <div className="pct-bar" style={{ width: 50 }}>
                                      <div className="pct-fill" style={{ width: `${ap}%`, background: ap >= 80 ? "#10B981" : ap >= 50 ? "#F59E0B" : "#EF4444" }} />
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700 }}>{ap}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── SALES ── */}
              {tab === "sales" && (
                <div className="card">
                  <div className="ch">
                    <div className="ct">BA Sales — LD & MTD</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#64748B" }}>
                        LD: <strong style={{ color: "var(--brand-4)" }}>Rs {Number(stats.ld_sales || 0).toLocaleString()}</strong>
                        &nbsp;·&nbsp; MTD: <strong style={{ color: "#10B981" }}>Rs {Number(stats.mtd_sales || 0).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="tbl">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th><th>Name</th><th>Code</th><th>Store</th><th>Status</th>
                          <th>LD Sales</th><th>MTD Sales</th><th>Days Sold MTD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...bas].sort((a, b) => Number(b.mtd_sales) - Number(a.mtd_sales)).map((ba, i) => (
                          <tr key={ba.employee_id} style={{ cursor: "pointer" }} onClick={() => setSelected(ba)}>
                            <td>
                              <span style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#CD7C2F" : "#E2E8F0", color: i < 3 ? "#fff" : "#64748B", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{i + 1}</span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{ba.ba_name}</td>
                            <td style={{ fontFamily: "monospace", fontSize: 10, color: "#94A3B8" }}>{ba.employee_code}</td>
                            <td style={{ fontSize: 11 }}>{ba.store_name}</td>
                            <td><span className={`b ${ba.check_in ? "bg" : "br"}`}>{ba.check_in ? "Present" : "Absent"}</span></td>
                            <td style={{ fontWeight: 700, color: "var(--brand-4)" }}>Rs {Number(ba.ld_sales).toLocaleString()}</td>
                            <td style={{ fontWeight: 700, color: "#10B981" }}>Rs {Number(ba.mtd_sales).toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>{ba.days_present_mtd}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* BA DETAIL MODAL */}
        {selected && (
          <div className="overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div className="mt" style={{ margin: 0 }}>{selected.ba_name}</div>
                <button onClick={() => setSelected(null)} style={{ border: "none", background: "#F1F5F9", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 16, color: "#64748B" }}>×</button>
              </div>
              <div className="detail-grid" style={{ marginBottom: 12 }}>
                {[
                  { label: "Employee Code",    value: selected.employee_code },
                  { label: "Store",            value: selected.store_name },
                  { label: "Shift",            value: selected.shift_name || "—" },
                  { label: "Today Status",     value: selected.check_in ? (selected.check_out ? "Shift Done" : "Present") : "Absent" },
                  { label: "Check In",         value: fmt(selected.check_in) },
                  { label: "Check Out",        value: fmt(selected.check_out) },
                  { label: "Days Present MTD", value: `${selected.days_present_mtd} / ${selected.total_working_days}` },
                  { label: "Attendance %",     value: `${pct(selected.days_present_mtd, selected.total_working_days)}%` },
                  { label: "LD Sales",         value: `Rs ${Number(selected.ld_sales).toLocaleString()}` },
                  { label: "MTD Sales",        value: `Rs ${Number(selected.mtd_sales).toLocaleString()}` },
                ].map(item => (
                  <div key={item.label} className="detail-box">
                    <div className="detail-lbl">{item.label}</div>
                    <div className="detail-val" style={{ color: item.label.includes("Sales") ? (item.label === "LD Sales" ? "var(--brand-4)" : "#10B981") : "var(--text-primary)" }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="btn btn-gray" onClick={() => setSelected(null)}>Close</button>
                <button className="btn btn-teal" onClick={() => { setTab("attendance"); setSelected(null); }}>View in Attendance</button>
                <button className="btn btn-teal" onClick={() => { setTab("sales"); setSelected(null); }}>View in Sales</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}