"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TABS = ["overview","employees","assignments","stores","prices","attendance","sales"];

const IcoOverview = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>;
const IcoEmployees = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>;
const IcoAssign = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/></svg>;
const IcoPrices = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>;
const IcoAttend = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>;
const IcoStore = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>;
const IcoSales = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>;
const IcoSearch = () => <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>;
const IcoCsv = () => <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>;
const IcoEdit = () => <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>;
const IcoDelete = () => <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>;

const TAB_ICONS: Record<string, React.ReactElement> = { overview:<IcoOverview/>, employees:<IcoEmployees/>, assignments:<IcoAssign/>, stores:<IcoStore/>, prices:<IcoPrices/>, attendance:<IcoAttend/>, sales:<IcoSales/> };
const TAB_LABELS: Record<string, string> = { overview:"Overview", employees:"Employees", assignments:"Assignments", stores:"Stores", prices:"Prices", attendance:"Attendance", sales:"Sales" };

// ─── Employee Detail Modal ───────────────────────────────────────────────────
type DetailModalData = {
  emp: Record<string,any>;
  allSales: Record<string,any>[];
  empAttRows: Record<string,any>[];
};

function EmployeeDetailModal({
  data, onClose, detailPeriod, setDetailPeriod, openKeys, setOpenKeys
}: {
  data: DetailModalData | null;
  onClose: () => void;
  detailPeriod: "day"|"month"|"year";
  setDetailPeriod: (p: "day"|"month"|"year") => void;
  openKeys: Set<string>;
  setOpenKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  if (!data) return null;
  const { emp, allSales, empAttRows } = data;

  const getPk = (date: string) => {
    if (detailPeriod === "month") return (date || "").slice(0, 7);
    if (detailPeriod === "year")  return (date || "").slice(0, 4);
    return date || "";
  };

  const periodGroups: Record<string, { items: Record<string,any>[]; total: number }> = {};
  const periodOrder: string[] = [];
  allSales.forEach((r: Record<string,any>) => {
    const pk = getPk(r.date);
    if (!periodGroups[pk]) { periodGroups[pk] = { items: [], total: 0 }; periodOrder.push(pk); }
    periodGroups[pk].items.push(r);
    periodGroups[pk].total += Number(r.total_amount || 0);
  });
  const periodKeys = [...new Set(periodOrder)].sort().reverse();
  const grandTotal = allSales.reduce((s: number, r: Record<string,any>) => s + Number(r.total_amount || 0), 0);
  const daysPresent = empAttRows.filter((a: Record<string,any>) => a.status === "Present").length;

  const fmtDate = (d: string) => {
    if (!d) return "";
    try { const dt = new Date(d); const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${String(dt.getDate()).padStart(2,"0")}-${months[dt.getMonth()]}-${dt.getFullYear()}`; } catch { return d; }
  };
  const dlCsv = (rows: Record<string,any>[], headers: string[], keys: string[], filename: string, dateKeys: string[] = []) => {
    if (!rows.length) return;
    const csv = [headers.join(","), ...rows.map(r => keys.map((k,i) => { const v = r[k] ?? ""; const formatted = dateKeys.includes(k) ? fmtDate(String(v)) : String(v); return `"${formatted.replace(/"/g, '""')}"`;}).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = filename;
    a.click();
  };

  const dlSales = () => dlCsv(
    allSales,
    ["Date","Store","Brand","Category","SKU","Qty","Price (Rs)","Total (Rs)","Remarks"],
    ["date","store_name","brand_name","category_name","sku_name","qty","retail_price","total_amount","remarks"],
    `sales_${(emp.full_name||"").replace(/ /g,"_")}.csv`,
    ["date"]
  );
  const dlAtt = () => dlCsv(
    empAttRows,
    ["Date","Store","Shift","Check In","Check Out","Hours","Status"],
    ["date","store_name","shift_name","check_in","check_out","hours","status"],
    `attendance_${(emp.full_name||"").replace(/ /g,"_")}.csv`,
    ["date"]
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:300,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",padding:"20px 12px"}} onClick={onClose}>
      <div style={{background:"#F1F5F9",borderRadius:14,width:"100%",maxWidth:860,overflow:"hidden",margin:"auto"}} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{background:"#0F172A",padding:"14px 18px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:15,color:"#fff"}}>{emp.full_name}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:2}}>{emp.employee_code} · {emp.role_name} · {emp.store_name||"No Store"}</div>
            <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
              <div><div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",marginBottom:2}}>Total Sales</div><div style={{fontSize:15,fontWeight:800,color:"#10B981"}}>Rs {grandTotal.toLocaleString()}</div></div>
              <div><div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",marginBottom:2}}>Days Present</div><div style={{fontSize:15,fontWeight:800,color:"#60A5FA"}}>{daysPresent}</div></div>
              <div><div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",marginBottom:2}}>TSC</div><div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{emp.tsc_name||"—"}</div></div>
              <div><div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",marginBottom:2}}>AM</div><div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{emp.am_name||"—"}</div></div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>✕ Close</button>
            <div style={{display:"flex",gap:5}}>
              <button onClick={()=>{dlSales();setTimeout(dlAtt,600);}} style={{padding:"4px 10px",borderRadius:6,border:"none",background:"#10B981",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>↓ Both</button>
              <button onClick={dlSales} style={{padding:"4px 10px",borderRadius:6,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>↓ Sales</button>
              <button onClick={dlAtt}   style={{padding:"4px 10px",borderRadius:6,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>↓ Att</button>
            </div>
          </div>
        </div>

        <div style={{padding:"14px 14px 20px"}}>
          {/* Period toggle */}
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {(["day","month","year"] as const).map(p => (
              <button key={p} onClick={()=>{ setDetailPeriod(p); setOpenKeys(new Set()); }}
                style={{padding:"5px 14px",borderRadius:20,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",background:detailPeriod===p?"#1E3A8A":"#E2E8F0",color:detailPeriod===p?"#fff":"#64748B"}}>
                {p==="day"?"Day by Day":p==="month"?"Monthly":"Yearly"}
              </button>
            ))}
          </div>

          {/* Sales section */}
          <div style={{background:"#fff",borderRadius:10,marginBottom:10,overflow:"hidden"}}>
            <div style={{padding:"9px 14px",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:700}}>Sales — {detailPeriod==="day"?"Daily":detailPeriod==="month"?"Monthly":"Yearly"}</span>
              <span style={{fontWeight:800,color:"#10B981",fontSize:13}}>Rs {grandTotal.toLocaleString()}</span>
            </div>
            {periodKeys.length === 0
              ? <div style={{padding:28,textAlign:"center",color:"#94A3B8",fontSize:12}}>No sales data</div>
              : periodKeys.map(pk => {
                  const { items, total } = periodGroups[pk];
                  const skuItems = items.filter((i: Record<string,any>) => i.sku_name);
                  const isOpen = openKeys.has(pk);
                  const toggle = () => setOpenKeys(prev => { const n = new Set(prev); n.has(pk) ? n.delete(pk) : n.add(pk); return n; });
                  return (
                    <div key={pk} style={{borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{display:"flex",alignItems:"center",padding:"10px 14px",cursor:"pointer",gap:10}} onClick={toggle}>
                        <div style={{flex:1}}>
                          <span style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:12}}>{pk}</span>
                          <span style={{marginLeft:10,fontSize:10,color:"#94A3B8"}}>{skuItems.length} SKU{skuItems.length!==1?"s":""}</span>
                        </div>
                        <span style={{fontWeight:800,color:"#10B981",fontFamily:"Poppins,sans-serif"}}>Rs {total.toLocaleString()}</span>
                        <span style={{fontSize:11,color:"#94A3B8",width:14,textAlign:"center"}}>{isOpen?"▲":"▼"}</span>
                      </div>
                      {isOpen && (
                        <div style={{background:"#F8FAFC",padding:"4px 14px 10px 28px"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                            <thead>
                              <tr style={{color:"#94A3B8",fontSize:9,textTransform:"uppercase"}}>
                                <th style={{textAlign:"left",padding:"4px 6px 4px 0",fontWeight:700}}>Brand</th>
                                <th style={{textAlign:"left",padding:"4px 6px",fontWeight:700}}>SKU</th>
                                <th style={{textAlign:"center",padding:"4px 6px",fontWeight:700}}>Qty</th>
                                <th style={{textAlign:"right",padding:"4px 0 4px 6px",fontWeight:700}}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {skuItems.map((item: Record<string,any>, ii: number) => (
                                <tr key={ii} style={{borderTop:"1px solid #E2E8F0"}}>
                                  <td style={{padding:"5px 6px 5px 0"}}><span style={{padding:"2px 7px",borderRadius:20,fontSize:9,fontWeight:700,background:"#DBEAFE",color:"#1D4ED8",display:"inline-block",whiteSpace:"nowrap"}}>{item.brand_name}</span></td>
                                  <td style={{padding:"5px 6px",maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.sku_name}</td>
                                  <td style={{textAlign:"center",padding:"5px 6px"}}>{item.qty}</td>
                                  <td style={{textAlign:"right",padding:"5px 0 5px 6px",fontWeight:700,color:"#10B981"}}>Rs {Number(item.total_amount||0).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })
            }
          </div>

          {/* Attendance section */}
          <div style={{background:"#fff",borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"9px 14px",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:700}}>Attendance</span>
              <span style={{fontWeight:800,color:"#1E3A8A",fontSize:12}}>{daysPresent} present / {empAttRows.length} total</span>
            </div>
            {empAttRows.length === 0
              ? <div style={{padding:28,textAlign:"center",color:"#94A3B8",fontSize:12}}>No attendance data in this date range</div>
              : <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"#F8FAFC"}}>
                        {["Date","Store","Shift","Check In","Check Out","Hours","Status"].map(h => (
                          <th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",borderBottom:"1px solid #E2E8F0"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {empAttRows.map((a: Record<string,any>, i: number) => (
                        <tr key={i} style={{borderBottom:"1px solid #F8FAFC"}}>
                          <td style={{padding:"7px 10px",fontFamily:"monospace",fontSize:10}}>{a.date}</td>
                          <td style={{padding:"7px 10px",fontSize:11}}>{a.store_name}</td>
                          <td style={{padding:"7px 10px",fontSize:11}}>{a.shift_name}</td>
                          <td style={{padding:"7px 10px",fontSize:11,color:"#10B981"}}>{a.check_in||"—"}</td>
                          <td style={{padding:"7px 10px",fontSize:11}}>{a.check_out||<span style={{color:"#F59E0B"}}>Active</span>}</td>
                          <td style={{padding:"7px 10px",fontSize:11}}>{a.hours||"—"}</td>
                          <td style={{padding:"7px 10px"}}><span style={{padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700,display:"inline-block",background:a.status==="Present"?"#DCFCE7":"#FEE2E2",color:a.status==="Present"?"#16A34A":"#DC2626"}}>{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [tab, setTab] = useState<string>("overview");
  const [overview, setOverview] = useState<Record<string, any> | null>(null);
  const [employees, setEmployees] = useState<Record<string, any>[]>([]);
  const [pending, setPending] = useState<Record<string, any>[]>([]);
  const [stores, setStores] = useState<Record<string, any>[]>([]);
  const [shifts, setShifts] = useState<Record<string, any>[]>([]);
  const [cities, setCities] = useState<Record<string, any>[]>([]);
  const [catalog, setCatalog] = useState<{ brands:Record<string,any>[], categories:Record<string,any>[], skus:Record<string,any>[] }>({ brands:[], categories:[], skus:[] });
  const [attRows, setAttRows] = useState<Record<string, any>[]>([]);
  const [salesRows, setSalesRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ text:string, err:boolean, undo:(() => void) | null }>({ text:"", err:false, undo:null });
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [empSearch, setEmpSearch] = useState<string>("");
  const [empRoleFilter, setEmpRoleFilter] = useState<string>("all");
  const [attDateFrom, setAttDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [attDateTo, setAttDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [attRole, setAttRole] = useState<string>("all");
  const [attEmp, setAttEmp] = useState<string>("all");
  const [attStore, setAttStore] = useState<string>("all");
  const [attSearch, setAttSearch] = useState<string>("");
  const [saleDateFrom, setSaleDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [saleDateTo, setSaleDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [saleEmp, setSaleEmp] = useState<string>("all");
  const [saleStore, setSaleStore] = useState<string>("all");
  const [saleBrand, setSaleBrand] = useState<string>("all");
  const [saleSearch, setSaleSearch] = useState<string>("");
  const [priceBrand, setPriceBrand] = useState<string>("all");
  const [topPerformers, setTopPerformers] = useState<{topBAs:Record<string,any>[],topTSCs:Record<string,any>[],topAMs:Record<string,any>[]}>({topBAs:[],topTSCs:[],topAMs:[]});
  const [topPeriod, setTopPeriod] = useState<string>("month");
  const [selectedPerformer, setSelectedPerformer] = useState<Record<string,any>|null>(null);
  const [priceSearch, setPriceSearch] = useState<string>("");
  const [showAddEmp, setShowAddEmp] = useState<boolean>(false);
  const [addForm, setAddForm] = useState<Record<string, string>>({ full_name:"", email:"", password:"", role_id:"4", phone:"", store_id:"", shift_id:"", cnic:"", father_name:"", address:"", bank_name:"", bank_account:"", iban:"" });
  const [showModal, setShowModal] = useState<{ type: string; mode: string; [key: string]: unknown } | null>(null);
  const [showEditEmp, setShowEditEmp] = useState<Record<string, any> | null>(null);
  const [modalForm, setModalForm] = useState<Record<string, any>>({});
  const [editPriceId, setEditPriceId] = useState<number | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<string>("");
  const [storeLatLng, setStoreLatLng] = useState<Record<number, { lat: string; lng: string; address: string; name: string }>>({});
  // Detail modal state
  const [detailModal, setDetailModal] = useState<DetailModalData | null>(null);
  const [detailPeriod, setDetailPeriod] = useState<"day"|"month"|"year">("day");
  const [detailOpenKeys, setDetailOpenKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit",second:"2-digit"})), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { fetchAll(); fetchTopPerformers("month"); }, []);
  useEffect(() => { if(tab==="attendance") fetchAtt(); }, [tab,attDateFrom,attDateTo,attRole,attEmp,attStore]);
  useEffect(() => { if(tab==="sales") fetchSales(); }, [tab,saleDateFrom,saleDateTo,saleEmp,saleStore]);
  useEffect(() => { if(tab==="prices") fetchCatalog(); }, [tab]);

  const showToast = (text: string, err: boolean = false, undoFn: (() => void) | null = null) => {
    if (undoTimer) clearTimeout(undoTimer);
    setToast({ text, err, undo: undoFn });
    const t = setTimeout(() => setToast({ text:"", err:false, undo:null }), undoFn ? 10000 : 3000);
    setUndoTimer(t);
  };

  const fetchAll = async () => {
    try {
      const [u, o] = await Promise.all([
        fetch("/api/auth/admin-user").then(r=>r.json()),
        fetch("/api/auth/admin-reports?type=overview").then(r=>r.json()),
      ]);
      setEmployees(u.employees||[]); setPending(u.pending||[]);
      const storesData = u.stores||[];
      setStores(storesData); setShifts(u.shifts||[]); setCities(u.cities||[]);
      const initLatLng: Record<number, { lat: string; lng: string; address: string; name: string }> = {};
      storesData.forEach((st: Record<string,any>) => {
        initLatLng[st.store_id] = { lat: String(st.latitude ?? ""), lng: String(st.longitude ?? ""), address: String(st.address ?? ""), name: String(st.store_name ?? "") };
      });
      setStoreLatLng(initLatLng);
      if (o?.stats) Object.keys(o.stats).forEach(k => { o.stats[k] = Number(o.stats[k]) || 0; });
      setOverview(o);
    } catch (_err: unknown) {}
  };

  const fetchTopPerformers = async (period: string = "month") => {
    try {
      const d = await fetch(`/api/auth/topperformers?period=${period}&limit=10`).then(r=>r.json());
      setTopPerformers({ topBAs: d.topBAs||[], topTSCs: d.topTSCs||[], topAMs: d.topAMs||[] });
    } catch (_e: unknown) {}
  };

  const fetchCatalog = async () => {
    try { const d = await fetch("/api/auth/admin-catalog").then(r=>r.json()); setCatalog(d); } catch (_err: unknown) {}
  };

  const fetchAtt = async () => {
    setLoading(true);
    try {
      const isGrp = attEmp.startsWith("grp:");
      const p = new URLSearchParams({ type:"attendance", date_from:attDateFrom, date_to:attDateTo, role: isGrp ? attEmp.replace("grp:","") : attRole, employee_id: isGrp ? "all" : attEmp, store_id:attStore });
      const d = await fetch(`/api/auth/admin-reports?${p}`).then(r=>r.json());
      setAttRows(d.rows||[]);
    } catch (_err: unknown) {}
    setLoading(false);
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const isGrp = saleEmp.startsWith("grp:");
      const p = new URLSearchParams({ type:"sales", date_from:saleDateFrom, date_to:saleDateTo, employee_id: isGrp ? "all" : saleEmp, role: isGrp ? saleEmp.replace("grp:","") : "all", store_id:saleStore });
      const d = await fetch(`/api/auth/admin-reports?${p}`).then(r=>r.json());
      setSalesRows(d.rows||[]);
    } catch (_err: unknown) {}
    setLoading(false);
  };

  const doAction = async (url: string, action: string, body: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      const res = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action,...body}) });
      const d = await res.json();
      if (res.ok) { showToast("✓ " + (d.message||"Done")); fetchAll(); if(tab==="prices") fetchCatalog(); }
      else showToast(d.message||"Error", true);
    } catch (_err: unknown) { showToast("Connection error", true); }
    setLoading(false);
  };

  const downloadReport = async (type: 'attendance_download'|'sales_download', opts: { employee_id?: string; role_filter?: string; store_id?: string; date_from?: string; date_to?: string; } = {}) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-reports', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type, date_from:opts.date_from||attDateFrom, date_to:opts.date_to||attDateTo, employee_id:opts.employee_id||'all', role_filter:opts.role_filter||'all', store_id:opts.store_id||'all' }) });
      const data = await res.json();
      if (!res.ok || !data.rows?.length) { showToast('No data to download', true); setLoading(false); return; }
      const rows = data.rows as Record<string, unknown>[];
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${data.filename || type}.csv`; a.click();
      showToast(`✓ Downloaded ${rows.length} rows`);
    } catch (_e: unknown) { showToast('Download failed', true); }
    setLoading(false);
  };

  const checkAndDelete = async (emp: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-user', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'check_records', employee_id:emp.employee_id }) });
      const data = await res.json();
      setLoading(false);
      if (data.has_records) {
        if (!confirm(`⚠ WARNING: ${emp.full_name} has records:\n• ${data.attendance_count} attendance records\n• ${data.sales_count} sales entries\n\nDeleting will permanently remove ALL their data.\n\nAre you sure?`)) return;
      } else {
        if (!confirm(`Delete ${emp.full_name}? This cannot be undone.`)) return;
      }
      await doAction('/api/auth/admin-user', 'delete_employee', { user_id:emp.user_id, employee_id:emp.employee_id });
    } catch (_e: unknown) { setLoading(false); showToast('Error checking records', true); }
  };

  const doDelete = (label: string, action: string, body: Record<string, unknown>, catalogAction: boolean = false) => {
    showToast(`${label} deleted`, false, () => { fetchAll(); if(catalogAction) fetchCatalog(); showToast("Reverted"); });
    if (catalogAction) fetch("/api/auth/admin-catalog", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action,...body}) }).then(()=>fetchCatalog());
    else fetch("/api/auth/admin-user", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action,...body}) }).then(()=>fetchAll());
  };

  const addEmployee = async () => {
    const isBA = addForm.role_id === "4";
    if (!addForm.full_name) { showToast("Full name is required", true); return; }
    if (!addForm.password)  { showToast("Password is required", true); return; }
    const cp = (addForm.phone||"").replace(/[\s\-]/g,"");
    if (!cp || !/^03\d{9}$/.test(cp)) { showToast("Phone must be 11 digits starting with 03", true); return; }
    if (isBA) {
      if (!addForm.cnic || !/^\d{5}-\d{7}-\d{1}$/.test(addForm.cnic)) { showToast("CNIC format: 12345-1234567-1", true); return; }
      if (!addForm.father_name) { showToast("Father/Husband name required for BA", true); return; }
      if (!addForm.bank_name)   { showToast("Bank name required for BA", true); return; }
      if (!addForm.bank_account && !addForm.iban) { showToast("Bank account or IBAN required", true); return; }
    }
    await doAction("/api/auth/admin-user", "add_employee", addForm);
    setShowAddEmp(false);
    setAddForm({ full_name:"", email:"", password:"", role_id:"4", phone:"", store_id:"", shift_id:"", cnic:"", father_name:"", address:"", bank_name:"", bank_account:"", iban:"" });
  };

  const saveCatalogModal = async () => {
    if (!showModal) return;
    const { type, mode } = showModal;
    if (type === "store" && mode === "add") {
      const name = (showModal.store_name as string) || "";
      if (!name) { showToast("Store name is required", true); return; }
      setLoading(true);
      try {
        const lat = (showModal.latitude as string) || "";
        const lng = (showModal.longitude as string) || "";
        const res = await fetch("/api/auth/admin-user", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action:"add_store", store_name:name, latitude: lat ? parseFloat(lat) : null, longitude: lng ? parseFloat(lng) : null, address:(showModal.address as string)||"" }) });
        const data = await res.json();
        if (res.ok) { showToast("Store added!"); setShowModal(null); fetchAll(); }
        else showToast(data.message || "Error", true);
      } catch (_e: unknown) { showToast("Connection error", true); }
      setLoading(false);
      return;
    }
    let action, body;
    if (type==="brand") { action = mode==="add"?"add_brand":"update_brand"; body = { brand_name:modalForm.brand_name, ...(mode==="edit"?{brand_id:modalForm.brand_id}:{}) }; }
    else if (type==="category") { action = mode==="add"?"add_category":"update_category"; body = { category_name:modalForm.category_name, brand_id:modalForm.brand_id, ...(mode==="edit"?{category_id:modalForm.category_id}:{}) }; }
    else { action = mode==="add"?"add_sku":"update_sku"; body = { sku_name:modalForm.sku_name, unit_of_measure:modalForm.unit_of_measure||"CTN", retail_price:parseFloat(modalForm.retail_price)||0, category_id:modalForm.category_id, ...(mode==="edit"?{sku_id:modalForm.sku_id}:{}) }; }
    await fetch("/api/auth/admin-catalog", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action,...body}) });
    fetchCatalog(); showToast(`✓ ${type} ${mode==="add"?"added":"updated"}`); setShowModal(null);
  };

  const reCheckin = async (employee_id: number, date: string) => {
    try {
      const res = await fetch("/api/auth/attendance", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ employee_id, date }) });
      const d = await res.json();
      if (res.ok) { showToast("✓ Employee re-checked in"); fetchAtt(); }
      else showToast(d.message||"Error", true);
    } catch (_err: unknown) { showToast("Connection error", true); }
  };

  const s = {padding:"7px 10px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:12,outline:"none",background:"#fff",width:"100%"};
  const inp = {padding:"8px 12px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:13,outline:"none",width:"100%"};

  const baList  = employees.filter(e=>e.role_name==="Brand Ambassador");
  const tscList = employees.filter(e=>e.role_name==="TSC");
  const amList  = employees.filter(e=>e.role_name==="Area Manager");

  const filteredEmps = employees.filter(e=>{
    const matchRole = empRoleFilter==="all" || e.role_name===(empRoleFilter==="BA"?"Brand Ambassador":empRoleFilter==="TSC"?"TSC":empRoleFilter==="AM"?"Area Manager":"Admin");
    const matchSearch = !empSearch || 
      e.full_name?.toLowerCase().includes(empSearch.toLowerCase()) || 
      e.email?.toLowerCase().includes(empSearch.toLowerCase()) || 
      e.employee_code?.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.cnic?.includes(empSearch.replace(/[-\s]/g, "")) ||
      e.phone?.includes(empSearch.replace(/[\s-]/g, ""));
    return matchRole && matchSearch;
  });

  const filteredAtt = attRows.filter(a=>!attSearch||a.full_name?.toLowerCase().includes(attSearch.toLowerCase())||a.employee_code?.toLowerCase().includes(attSearch.toLowerCase())||a.store_name?.toLowerCase().includes(attSearch.toLowerCase()));

  const filteredSales = salesRows.filter(r=>
    (saleBrand==="all"||r.brand_name===saleBrand) &&
    (!saleSearch||r.full_name?.toLowerCase().includes(saleSearch.toLowerCase())||r.store_name?.toLowerCase().includes(saleSearch.toLowerCase())||r.sku_name?.toLowerCase().includes(saleSearch.toLowerCase()))
  );

  const filteredPrices = catalog.skus.filter(p=>(priceBrand==="all"||p.brand_name===priceBrand)&&(!priceSearch||p.sku_name?.toLowerCase().includes(priceSearch.toLowerCase())||p.category_name?.toLowerCase().includes(priceSearch.toLowerCase())));
  const saleBrands = [...new Set(salesRows.map(r=>r.brand_name).filter(Boolean))];

  // Group sales for display
  const buildGroups = (rows: Record<string,any>[]) => {
    const groups: Record<string, {summary: Record<string,any>, items: Record<string,any>[]}> = {};
    const order: string[] = [];
    rows.forEach(r => {
      const k = `${r.employee_code||r.full_name}__${r.date}__${r.store_name}`;
      if (!groups[k]) { groups[k] = { summary:r, items:[] }; order.push(k); }
      groups[k].items.push(r);
    });
    return { groups, order };
  };

  const openDetailModal = async (summary: Record<string,any>, items: Record<string,any>[]) => {
    const empKey = summary.employee_code || summary.full_name;
    setDetailPeriod("day");
    setDetailOpenKeys(new Set());
    // Use cached attRows if available for this employee, else fetch from API
    let empAttRowsData = attRows.filter(a => (a.employee_code||a.full_name) === empKey);
    if (empAttRowsData.length === 0) {
      try {
        const p = new URLSearchParams({ type:"attendance", date_from:"2020-01-01", date_to:new Date().toISOString().split("T")[0], employee_id: String(summary.employee_id_num || summary.employee_id || "all") });
        const d = await fetch(`/api/auth/admin-reports?${p}`).then(r=>r.json());
        empAttRowsData = (d.rows||[]).filter((a: Record<string,any>) => (a.employee_code||a.full_name) === empKey);
      } catch (_e: unknown) {}
    }
    setDetailModal({
      emp: summary,
      allSales: filteredSales.filter(r => (r.employee_code||r.full_name) === empKey),
      empAttRows: empAttRowsData,
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#F1F5F9;font-family:'Inter',sans-serif}
        .root{min-height:100vh;color:#0F172A}

        /* ── TOPBAR ── */
        .topbar{background:#0F172A;display:flex;align-items:center;padding:0 16px;height:52px;position:sticky;top:0;z-index:100;gap:8px}
        .topbar-left{display:flex;align-items:center;gap:8px;flex:1;min-width:0;overflow:hidden}
        .logo-avatar{width:28px;height:28px;border-radius:7px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-family:'Poppins',sans-serif;font-weight:800;font-size:10px;color:#fff;flex-shrink:0}
        .logo-name{font-family:'Poppins',sans-serif;font-weight:800;font-size:12px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}
        .logo-sub{font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap}
        .topbar-clock{font-family:'Poppins',sans-serif;font-size:14px;font-weight:800;color:#10B981;flex-shrink:0;padding:0 8px}
        .topbar-right{display:flex;align-items:center;gap:6px;flex-shrink:0}

        /* ── LAYOUT ── */
        .layout{display:flex;min-height:calc(100vh - 52px)}
        .sidebar{width:175px;background:#fff;border-right:1px solid #E2E8F0;padding:10px 0;flex-shrink:0;position:sticky;top:52px;height:calc(100vh - 52px);overflow-y:auto}
        .stab{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:12px;font-weight:600;cursor:pointer;color:#64748B;border-left:3px solid transparent;transition:all 0.12s;white-space:nowrap}
        .stab:hover{background:#F8FAFC;color:#0F172A}
        .stab.active{background:#EFF6FF;color:#1E3A8A;border-left-color:#1E3A8A}
        .stab-badge{margin-left:auto;padding:1px 5px;border-radius:20px;font-size:9px;font-weight:700;background:#FEE2E2;color:#DC2626}
        .main{flex:1;padding:16px;overflow-y:auto;padding-bottom:60px!important;min-width:0}

        /* ── STAT CARDS ── */
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
        .sc{background:#fff;border:1px solid #E2E8F0;border-radius:11px;padding:12px 14px;border-top:3px solid}
        .sc-label{font-size:9px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px}
        .sc-value{font-family:'Poppins',sans-serif;font-size:20px;font-weight:800}
        .sv{font-family:'Poppins',sans-serif;font-size:20px;font-weight:800}
        .sc-sub{font-size:11px;color:#64748B}
        .sc-row{display:flex;gap:8px;margin-top:5px;align-items:center}
        .sc-dot{width:7px;height:7px;border-radius:50%}
        .sc-present{font-size:11px;font-weight:700;color:#10B981}
        .sc-absent{font-size:11px;font-weight:700;color:#EF4444}
        .sc-tiny{font-size:10px;color:#94A3B8}
        .sc-sales-row{display:flex;gap:12px;margin-top:4px;align-items:flex-end}
        .sc-sales-lbl{font-size:9px;font-weight:700;color:#94A3B8;letter-spacing:0.06em;margin-bottom:2px}
        .sc-sales-ld{font-family:'Poppins',sans-serif;font-size:14px;font-weight:800;color:#1E3A8A}
        .sc-sales-mtd{font-family:'Poppins',sans-serif;font-size:14px;font-weight:800;color:#10B981}
        .sc-divider{width:1px;height:28px;background:#E2E8F0}
        .sc-footer{display:flex;gap:12px;margin-top:5px}
        .sc-stores{font-size:10px;color:#94A3B8}
        .sc-pending{font-size:10px;color:#EF4444;font-weight:700}

        /* ── CARD ── */
        .card{background:#fff;border:1px solid #E2E8F0;border-radius:11px;overflow:hidden;margin-bottom:12px}
        .ch{padding:10px 14px;border-bottom:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px}
        .ct{font-family:'Poppins',sans-serif;font-size:13px;font-weight:700}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .section-title{font-family:'Poppins',sans-serif;font-size:14px;font-weight:800;margin-bottom:12px}

        /* ── FILTER BAR ── */
        .fb{background:#fff;border:1px solid #E2E8F0;border-radius:9px;padding:10px 12px;margin-bottom:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;width:100%}
        .fb .fl{flex:1 1 140px;min-width:0}
        .fl{display:flex;flex-direction:column;gap:3px}
        .fl-label{font-size:9px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.05em}
        .fl input,.fl select{padding:6px 8px;border:1.5px solid #E2E8F0;border-radius:7px;font-size:12px;outline:none;width:100%;background:#fff}
        .sw{position:relative}
        .sw input{padding:6px 8px 6px 26px;border:1.5px solid #E2E8F0;border-radius:7px;font-size:12px;outline:none;width:100%}
        .si{position:absolute;left:7px;top:50%;transform:translateY(-50%);color:#94A3B8;pointer-events:none;display:flex}

        /* ── TABLE ── */
        .tbl{overflow-x:auto;width:100%;-webkit-overflow-scrolling:touch}
        table{width:100%;border-collapse:collapse}
        th{padding:7px 10px;text-align:left;font-size:9px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;background:#F8FAFC;border-bottom:1px solid #E2E8F0;white-space:nowrap;position:sticky;top:0}
        td{padding:7px 10px;font-size:12px;color:#334155;border-bottom:1px solid #F8FAFC}
        tr:hover td{background:#FAFAFA}
        .tr-right{text-align:right}
        .tr-center{text-align:center}
        .td-mono{font-family:monospace;font-size:10px}
        .td-muted{font-size:10px;color:#64748B;font-family:monospace}
        .td-bold{font-weight:700}
        .td-name{font-weight:600}
        .td-sm{font-size:11px}
        .td-green{font-weight:800;color:#10B981;font-family:'Poppins',sans-serif}
        .td-active{color:#F59E0B}
        .sale-row:hover td{background:#EFF6FF!important;cursor:pointer}

        /* ── BADGES ── */
        .b{padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;display:inline-block;white-space:nowrap}
        .bg{background:#DCFCE7;color:#16A34A}
        .br{background:#FEE2E2;color:#DC2626}
        .by{background:#FEF3C7;color:#D97706}
        .bgr{background:#F1F5F9;color:#64748B}
        .bbl{background:#DBEAFE;color:#1D4ED8}
        .bpu{background:#F3E8FF;color:#7C3AED}
        .b-xs{font-size:9px}

        /* ── BUTTONS ── */
        .btn{padding:5px 10px;border-radius:7px;border:none;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.12s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}
        .bp{background:#1E3A8A;color:#fff} .bp:hover{background:#1e40af}
        .bg2{background:#10B981;color:#fff} .bg2:hover{background:#059669}
        .brd{background:#EF4444;color:#fff} .brd:hover{background:#DC2626}
        .bgray{background:#F1F5F9;color:#64748B;border:1px solid #E2E8F0}
        .bya{background:#F59E0B;color:#fff}
        .btn-sm{padding:3px 7px;font-size:10px}
        .btn-del{background:#FEF2F2;color:#EF4444;border:1px solid #FCA5A5}
        .btn-group{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
        .btn-group-right{display:flex;gap:7px;flex-wrap:wrap;align-items:center}

        /* ── MODAL ── */
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
        .modal{background:#fff;border-radius:13px;padding:20px;width:500px;max-width:100%;max-height:90vh;overflow-y:auto}
        .modal-title{font-family:'Poppins',sans-serif;font-size:14px;font-weight:800;margin-bottom:12px}
        .fg{display:flex;flex-direction:column;gap:3px;margin-bottom:10px}
        .fg label{font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.05em}
        .fg input,.fg select{padding:8px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;outline:none;width:100%}
        .fgr{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .fgr2{grid-column:span 2}
        .fg-hint{font-size:10px;color:#94A3B8;margin-top:3px}
        .section-sep{font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin:14px 0 8px;padding-top:10px;border-top:1px solid #F1F5F9}
        .modal-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}

        /* ── TOAST ── */
        .toast{position:fixed;bottom:20px;right:20px;padding:10px 16px;border-radius:9px;font-size:12px;font-weight:600;z-index:999;box-shadow:0 4px 20px rgba(0,0,0,0.12);display:flex;align-items:center;gap:10px;animation:su 0.2s}
        @keyframes su{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .toast-ok{background:#DCFCE7;color:#16A34A}
        .toast-err{background:#FEE2E2;color:#DC2626}
        .toast-undo-btn{padding:2px 8px;border:1px solid currentColor;border-radius:5px;background:transparent;cursor:pointer;font-size:11px;font-weight:700;color:inherit}

        /* ── MISC ── */
        .empty{padding:28px;text-align:center;color:#94A3B8;font-size:12px}
        .dl-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px;padding:8px 10px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:9px}
        .dl-label{font-size:11px;font-weight:700;color:#64748B;white-space:nowrap}
        .rank-badge{width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800}
        .store-input{width:100%;padding:6px 8px;border:1.5px solid #E2E8F0;border-radius:6px;font-size:12px;outline:none}
        .store-name-input{font-weight:600}
        .gps-set{font-size:10px;color:#10B981;font-weight:700}
        .gps-unset{font-size:10px;color:#F59E0B;font-weight:700}
        .price-edit-wrap{display:flex;gap:5px;align-items:center}
        .price-edit-input{padding:3px 6px;border:1.5px solid #1E3A8A;border-radius:6px;font-size:12px;width:75px;outline:none}
        .price-click{font-weight:600;cursor:pointer;color:#1E3A8A;display:flex;align-items:center;gap:4px}
        .sku-name-cell{font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .period-selector{display:flex;gap:6px;align-items:center}
        .top-header-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px}

        /* ── EMPLOYEE CARDS (mobile) ── */
        .emp-row{display:none}
        .emp-card{display:block;padding:10px 14px;border-bottom:1px solid #F1F5F9}
        .emp-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
        .emp-card-name{font-weight:700;font-size:13px}
        .emp-card-code{font-size:10px;color:#64748B;font-family:monospace}
        .emp-card-email{font-size:11px;color:#94A3B8}
        .emp-card-badges{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
        .emp-card-info{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px}
        .emp-card-action{display:flex;justify-content:flex-end}
        .emp-actions-select{padding:7px 10px;border:1.5px solid #E2E8F0;border-radius:7px;font-size:12px;outline:none;background:#fff;width:120px}
        .emp-actions-select-full{width:100%}

        /* ── MOBILE NAV ── */
        .mobnav{display:none}
        .mobnavitem{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 1px;cursor:pointer;font-size:8px;font-weight:700;color:#94A3B8;border:none;background:none;transition:color 0.1s;min-width:0}
        .mobnavitem.active{color:#1E3A8A}

        /* ── PENDING CARD ── */
        .pending-card{margin-bottom:12px;border-top:3px solid #F59E0B}
        .pending-actions{display:flex;gap:5px}

        /* ── ASSIGNMENT TABLE ── */
        .assign-current{display:flex;gap:4px;flex-wrap:wrap;align-items:center}
        .assign-name{font-weight:600;font-size:13px}
        .assign-code{font-size:10px;color:#94A3B8;font-family:monospace}

        /* ── OVERVIEW RANK ── */
        .rank-1{background:#F59E0B;color:#fff}
        .rank-2{background:#94A3B8;color:#fff}
        .rank-3{background:#CD7C2F;color:#fff}
        .rank-other{background:#E2E8F0;color:#64748B}

        /* ── RESPONSIVE ── */
        @media(min-width:601px){
          .emp-row{display:table-row}
          .emp-card{display:none}
        }
        @media(max-width:1024px){
          .stats-grid{grid-template-columns:1fr 1fr}
          .two-col{grid-template-columns:1fr}
        }
        @media(max-width:768px){
          .sidebar{display:none}
          .mobnav{display:flex;position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E2E8F0;z-index:100;padding:4px 0}
          .layout{flex-direction:column}
          .main{padding:10px;padding-bottom:72px!important;min-width:0}
          .tbl{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%}
          .tbl table{min-width:0;width:100%}
          .fb{flex-wrap:wrap}
          .fb .fl{flex:1 1 calc(50% - 4px);min-width:0}
          .modal{width:94%!important;max-height:90vh;overflow-y:auto}
          .modal-bg{padding:10px;align-items:flex-end}
          .modal{border-radius:16px 16px 0 0;max-width:100%;width:100%!important;margin:0}
          .stats-grid{grid-template-columns:1fr 1fr;gap:8px}
          .two-col{grid-template-columns:1fr}
          .sc{padding:10px 12px}
          .sc-value{font-size:17px!important}
          .sv{font-size:17px!important}
          .ch{flex-wrap:wrap;gap:6px}
          .fgr{grid-template-columns:1fr}
          .fgr2{grid-column:span 1}
          .topbar{padding:0 10px;height:48px}
          .logo-sub{display:none}
          .section-title{font-size:13px}
          th{font-size:9px;padding:6px 8px;white-space:nowrap}
          td{font-size:11px;padding:6px 8px}
          .hide-md{display:none!important}
        }
        @media(max-width:600px){
          .hide-sm{display:none!important}
          .tbl{overflow-x:auto;-webkit-overflow-scrolling:touch}
          .tbl table{min-width:0;table-layout:auto}
          .stats-grid{grid-template-columns:1fr 1fr;gap:6px}
          .main{padding:8px;padding-bottom:72px!important}
          th,td{padding:5px 6px;font-size:10px}
          .btn{padding:4px 7px;font-size:10px}
          .btn-group{flex-wrap:wrap;gap:4px}
          .dl-row{flex-wrap:wrap;gap:4px}
          .fb .fl{flex:1 1 100%}
          .ch{flex-direction:column;align-items:flex-start}
        }
        @media(max-width:480px){
          .stats-grid{grid-template-columns:1fr 1fr}
          .logo-name{max-width:110px;font-size:11px}
          .topbar-clock{font-size:12px;padding:0 4px}
          .dl-row{gap:4px}
          .sc-value{font-size:15px!important}
          .sv{font-size:15px!important}
        }
        @media(max-width:360px){
          .logo-avatar{display:none}
          .stats-grid{grid-template-columns:1fr}
        }
      `}</style>

      <div className="root">
        <div className="topbar">
          <div className="topbar-left">
            <div className="logo-avatar">AD</div>
            <div className="topbar-left-text">
              <div className="logo-name">GMPL — Admin Dashboard</div>
              <div className="logo-sub">Super Admin · Full Access</div>
            </div>
          </div>
          <div className="topbar-clock">{time}</div>
          <div className="topbar-right">
            {pending.length>0&&<span className="b br" style={{fontSize:10}}>{pending.length} Pending</span>}
            <span className="b" style={{background:"rgba(239,68,68,0.15)",color:"#FCA5A5",fontSize:10}}>Admin</span>
            <button className="btn bgray td-sm" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});router.push("/login");}}>Logout</button>
          </div>
        </div>

        <div className="layout">
          <div className="sidebar">
            {TABS.map(t=>(
              <div key={t} className={`stab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
                {TAB_ICONS[t]} {TAB_LABELS[t]}
                {t==="employees"&&pending.length>0&&<span className="b br" style={{marginLeft:"auto",fontSize:9,padding:"1px 5px"}}>{pending.length}</span>}
              </div>
            ))}
          </div>
          <div className="mobnav">
            {TABS.map(t=>(
              <button key={t} className={`mobnavitem ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
                {TAB_ICONS[t]}<span>{TAB_LABELS[t]}</span>
              </button>
            ))}
          </div>

          <div className="main">
            {toast.text&&(
              <div className={`toast ${toast.err?"toast-err":"toast-ok"}`}>
                {toast.text}
                {toast.undo&&<button className="toast-undo-btn" onClick={()=>{toast.undo!();setToast({text:"",err:false,undo:null});}}>Undo</button>}
              </div>
            )}

            {/* OVERVIEW */}
            {tab==="overview"&&(
              <>
                <div className="section-title">Overview — Today</div>
                <div className="stats-grid">
                  <div className="sc" style={{borderTopColor:"#1E3A8A"}}>
                    <div className="sc-label">Area Managers</div>
                    <div className="sc-row" style={{alignItems:"baseline",gap:6,marginTop:2}}><div className="sv" style={{color:"#1E3A8A"}}>{overview?.stats?.total_ams||0}</div><div className="sc-sub">Total</div></div>
                    <div style={{display:"flex",gap:8,marginTop:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:"50%",background:"#10B981"}}/><span style={{fontSize:11,fontWeight:700,color:"#10B981"}}>{overview?.stats?.present_ams||0}</span><span style={{fontSize:10,color:"#94A3B8"}}>Present</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:"50%",background:"#EF4444"}}/><span style={{fontSize:11,fontWeight:700,color:"#EF4444"}}>{(overview?.stats?.total_ams||0)-(overview?.stats?.present_ams||0)}</span><span style={{fontSize:10,color:"#94A3B8"}}>Absent</span></div>
                    </div>
                  </div>
                  <div className="sc" style={{borderTopColor:"#0F766E"}}>
                    <div className="sc-label">TSCs</div>
                    <div className="sc-row" style={{alignItems:"baseline",gap:6,marginTop:2}}><div className="sv" style={{color:"#0F766E"}}>{overview?.stats?.total_tscs||0}</div><div className="sc-sub">Total</div></div>
                    <div style={{display:"flex",gap:8,marginTop:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:"50%",background:"#10B981"}}/><span style={{fontSize:11,fontWeight:700,color:"#10B981"}}>{overview?.stats?.present_tscs||0}</span><span style={{fontSize:10,color:"#94A3B8"}}>Present</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:"50%",background:"#EF4444"}}/><span style={{fontSize:11,fontWeight:700,color:"#EF4444"}}>{(overview?.stats?.total_tscs||0)-(overview?.stats?.present_tscs||0)}</span><span style={{fontSize:10,color:"#94A3B8"}}>Absent</span></div>
                    </div>
                  </div>
                  <div className="sc" style={{borderTopColor:"#10B981"}}>
                    <div className="sc-label">Brand Ambassadors</div>
                    <div className="sc-row" style={{alignItems:"baseline",gap:6,marginTop:2}}><div className="sv" style={{color:"#10B981"}}>{overview?.stats?.total_bas||0}</div><div className="sc-sub">Total</div></div>
                    <div style={{display:"flex",gap:8,marginTop:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:"50%",background:"#10B981"}}/><span style={{fontSize:11,fontWeight:700,color:"#10B981"}}>{overview?.stats?.present_bas||0}</span><span style={{fontSize:10,color:"#94A3B8"}}>Present</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:"50%",background:"#EF4444"}}/><span style={{fontSize:11,fontWeight:700,color:"#EF4444"}}>{(overview?.stats?.total_bas||0)-(overview?.stats?.present_bas||0)}</span><span style={{fontSize:10,color:"#94A3B8"}}>Absent</span></div>
                    </div>
                  </div>
                  <div className="sc" style={{borderTopColor:"#7C3AED"}}>
                    <div className="sc-label">Sales</div>
                    <div style={{display:"flex",gap:12,marginTop:4,alignItems:"flex-end"}}>
                      <div><div style={{fontSize:9,fontWeight:700,color:"#94A3B8",letterSpacing:"0.06em",marginBottom:2}}>LAST DAY</div><div style={{fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:800,color:"#1E3A8A"}}>Rs {Number(overview?.stats?.ld_sales||0).toLocaleString()}</div></div>
                      <div style={{width:1,height:28,background:"#E2E8F0"}}/>
                      <div><div style={{fontSize:9,fontWeight:700,color:"#94A3B8",letterSpacing:"0.06em",marginBottom:2}}>MTD</div><div style={{fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:800,color:"#10B981"}}>Rs {Number(overview?.stats?.mtd_sales||0).toLocaleString()}</div></div>
                    </div>
                    <div style={{display:"flex",gap:12,marginTop:5}}>
                      <div style={{fontSize:10,color:"#94A3B8"}}>{overview?.stats?.total_stores||0} Stores</div>
                      {(overview?.stats?.pending_approvals||0)>0&&<div style={{fontSize:10,color:"#EF4444",fontWeight:700}}>⚠ {overview?.stats?.pending_approvals} Pending</div>}
                    </div>
                  </div>
                </div>
                <div className="two-col">
                  <div className="card"><div className="ch"><div className="ct">Sales by Store — Today</div></div>
                    <div className="tbl"><table><thead><tr><th>Store</th><th>BAs</th><th>Sales</th></tr></thead>
                    <tbody>{(overview?.salesByStore||[]).map((r: Record<string,any>,i: number)=><tr key={i}><td className="td-name">{r.store_name}</td><td>{r.ba_count}</td><td style={{fontWeight:700,color:"#10B981"}}>Rs {Number(r.total_sales||0).toLocaleString()}</td></tr>)}</tbody></table></div>
                  </div>
                  <div className="card"><div className="ch"><div className="ct">Sales by Brand — Today</div></div>
                    <div className="tbl"><table><thead><tr><th>Brand</th><th>Sales</th></tr></thead>
                    <tbody>{(overview?.salesByBrand||[]).map((r: Record<string,any>,i: number)=><tr key={i}><td className="td-name">{r.brand_name}</td><td style={{fontWeight:700,color:"#10B981"}}>Rs {Number(r.total_sales||0).toLocaleString()}</td></tr>)}</tbody></table></div>
                  </div>
                </div>
                <div style={{marginTop:4}}>
                  <div className="top-header-row">
                    <div className="section-title" style={{fontSize:13,marginBottom:0}}>Top Performers</div>
                    <div className="btn-group">
                      {(["today","week","month"] as string[]).map(p=>(<button key={p} onClick={()=>{setTopPeriod(p);fetchTopPerformers(p);}} className={`btn btn-sm ${topPeriod===p?"bp":"bgray"}`}>{p==="today"?"Today":p==="week"?"This Week":"This Month"}</button>))}
                    </div>
                  </div>
                  <div className="card" style={{marginBottom:10}}>
                    <div className="ch"><div className="ct">🏆 Top Brand Ambassadors — Sales</div></div>
                    <div className="tbl"><table>
                      <thead><tr><th>#</th><th>Name</th><th>Code</th><th>Store</th><th>TSC</th><th>Days Present</th><th>Entries</th><th>Units</th><th style={{textAlign:"right"}}>Total Sales</th></tr></thead>
                      <tbody>{topPerformers.topBAs.length===0?<tr><td colSpan={9} className="empty">No sales data for this period</td></tr>:topPerformers.topBAs.map((ba,i)=>(
                        <tr key={ba.employee_id} style={{cursor:"pointer"}} onClick={()=>setSelectedPerformer({...ba,role:"Brand Ambassador"})}>
                          <td><span style={{width:22,height:22,borderRadius:"50%",background:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#CD7C2F":"#E2E8F0",color:i<3?"#fff":"#64748B",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{i+1}</span></td>
                          <td className="td-name">{ba.full_name}</td><td style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace"}}>{ba.employee_code}</td>
                          <td className="td-sm">{ba.store_name||"—"}</td><td className="td-sm">{ba.tsc_name||"—"}</td>
                          <td className="tr-center"><span className="b bg">{ba.days_present}</span></td>
                          <td className="tr-center">{ba.sales_entries}</td><td className="tr-center">{ba.total_units}</td>
                          <td style={{textAlign:"right",fontWeight:800,color:"#10B981",fontFamily:"Poppins,sans-serif"}}>Rs {Number(ba.total_sales).toLocaleString()}</td>
                        </tr>
                      ))}</tbody>
                    </table></div>
                  </div>
                  <div className="two-col">
                    <div className="card"><div className="ch"><div className="ct">⭐ Top TSCs — Team Sales</div></div>
                      <div className="tbl"><table><thead><tr><th>#</th><th>Name</th><th>City</th><th>BAs</th><th style={{textAlign:"right"}}>Team Sales</th></tr></thead>
                      <tbody>{topPerformers.topTSCs.length===0?<tr><td colSpan={5} className="empty">No data</td></tr>:topPerformers.topTSCs.map((t,i)=>(
                        <tr key={t.employee_id} style={{cursor:"pointer"}} onClick={()=>setSelectedPerformer({...t,role:"TSC"})}>
                          <td><span style={{width:22,height:22,borderRadius:"50%",background:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#CD7C2F":"#E2E8F0",color:i<3?"#fff":"#64748B",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{i+1}</span></td>
                          <td className="td-name">{t.full_name}</td><td className="td-sm">{t.city_name||"—"}</td>
                          <td className="tr-center"><span className="b bbl">{t.ba_count}</span></td>
                          <td style={{textAlign:"right",fontWeight:800,color:"#10B981",fontFamily:"Poppins,sans-serif"}}>Rs {Number(t.total_sales).toLocaleString()}</td>
                        </tr>
                      ))}</tbody></table></div>
                    </div>
                    <div className="card"><div className="ch"><div className="ct">🥇 Top Area Managers</div></div>
                      <div className="tbl"><table><thead><tr><th>#</th><th>Name</th><th>City</th><th>TSCs</th><th>BAs</th><th style={{textAlign:"right"}}>Territory Sales</th></tr></thead>
                      <tbody>{topPerformers.topAMs.length===0?<tr><td colSpan={6} className="empty">No data</td></tr>:topPerformers.topAMs.map((a,i)=>(
                        <tr key={a.employee_id} style={{cursor:"pointer"}} onClick={()=>setSelectedPerformer({...a,role:"Area Manager"})}>
                          <td><span style={{width:22,height:22,borderRadius:"50%",background:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#CD7C2F":"#E2E8F0",color:i<3?"#fff":"#64748B",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{i+1}</span></td>
                          <td className="td-name">{a.full_name}</td><td className="td-sm">{a.city_name||"—"}</td>
                          <td className="tr-center">{a.tsc_count}</td><td className="tr-center">{a.ba_count}</td>
                          <td style={{textAlign:"right",fontWeight:800,color:"#10B981",fontFamily:"Poppins,sans-serif"}}>Rs {Number(a.total_sales).toLocaleString()}</td>
                        </tr>
                      ))}</tbody></table></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EMPLOYEES */}
            {tab==="employees"&&(
              <>
                {pending.length>0&&(
                  <div className="card pending-card">
                    <div className="ch"><div className="ct">Pending Approvals ({pending.length})</div></div>
                    <div className="tbl"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Applied</th><th>Actions</th></tr></thead>
                    <tbody>{pending.map(p=>(
                      <tr key={p.user_id}>
                        <td className="td-name">{p.full_name}</td><td className="td-sm">{p.email}</td>
                        <td><span className="b by">{p.role_name}</span></td>
                        <td className="td-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="pending-actions">
                          <button className="btn bg2" onClick={()=>doAction("/api/auth/admin-user","approve",{user_id:p.user_id})}>Approve</button>
                          <button className="btn brd" onClick={async()=>{if(!confirm(`Reject and delete ${p.full_name}?`))return;await doAction("/api/auth/admin-user","reject",{user_id:p.user_id});fetchAll();}}>Reject</button>
                        </td>
                      </tr>
                    ))}</tbody></table></div>
                  </div>
                )}
                <div className="card">
                  <div className="ch">
                    <div className="ct">All Employees ({filteredEmps.length})</div>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                      <div className="sw" style={{width:220}}><span className="si"><IcoSearch/></span><input placeholder="Name, CNIC, phone, code..." value={empSearch} onChange={e=>setEmpSearch(e.target.value)} /></div>
                      <select value={empRoleFilter} onChange={e=>setEmpRoleFilter(e.target.value)} style={{...s,width:110}}>
                        <option value="all">All Roles</option><option value="BA">BA Only</option><option value="TSC">TSC Only</option><option value="AM">AM Only</option><option value="Admin">Admin Only</option>
                      </select>
                      <button className="btn bp" onClick={()=>setShowAddEmp(true)}>+ Add Employee</button>
                    </div>
                  </div>
                  <div className="tbl"><table>
                    <thead><tr><th>Code</th><th>Name</th><th>Phone</th><th>CNIC / ID</th><th>Role</th><th>Store</th><th>Shift</th><th>TSC</th><th>AM/City</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {filteredEmps.length===0?<tr><td colSpan={11} className="empty">No employees found</td></tr>
                      :filteredEmps.map((e: Record<string,any>,i: number)=>(
                        <tr key={i} className="emp-row">
                          <td className="td-muted">{e.employee_code}</td>
                          <td className="td-name">{e.full_name}</td>
                          <td style={{fontSize:11,fontFamily:"monospace"}}>{e.phone||"—"}</td>
                          <td style={{fontSize:10,fontFamily:"monospace",color:"#64748B"}}>{e.cnic||"—"}</td>
                          <td><span className="b bgr">{e.role_name}</span></td>
                          <td className="td-sm">{e.store_name||"—"}</td><td className="td-sm">{e.shift_name||"—"}</td>
                          <td className="td-sm">{e.tsc_name||"—"}</td><td className="td-sm">{e.am_name||e.city_name||"—"}</td>
                          <td><span className={`b ${e.is_active?"bg":"br"}`}>{e.is_active?"Active":"Inactive"}</span></td>
                          <td>
                            <select value="" onChange={(ev)=>{const v=ev.target.value;ev.currentTarget.value="";
                              if(v==="edit"){setShowEditEmp({user_id:e.user_id,employee_id:e.employee_id,full_name:e.full_name||"",email:e.email||"",phone:e.phone||"",role_id:String(e.role_id||"")});}
                              else if(v==="delete"){checkAndDelete(e);}
                              else if(v==="deactivate"){if(!confirm(`Deactivate ${e.full_name}?`))return;doDelete(`Employee ${e.full_name}`,"deactivate",{user_id:e.user_id,employee_id:e.employee_id});}
                              else if(v==="activate"){if(!confirm(`Activate ${e.full_name}?`))return;doAction("/api/auth/admin-user","activate",{user_id:e.user_id});}
                            }} className="emp-actions-select">
                              <option value="" disabled>Actions</option>
                              <option value="edit">Edit</option><option value="delete">Delete</option>
                              {e.is_active?<option value="deactivate">Deactivate</option>:<option value="activate">Activate</option>}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                  {filteredEmps.length===0?null:filteredEmps.map((e: Record<string,any>,i: number)=>(
                    <div key={`mc-${i}`} className="emp-card">
                      <div className="emp-card-top">
                        <div>
                          <div className="emp-card-name">{e.full_name}</div>
                          <div className="emp-card-code">{e.employee_code}</div>
                          {e.phone&&<div style={{fontSize:11,color:"#64748B",fontFamily:"monospace"}}>{e.phone}</div>}
                          {e.cnic&&<div style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace"}}>CNIC: {e.cnic}</div>}
                        </div>
                        <div className="emp-card-badges"><span className="b bgr">{e.role_name}</span><span className={`b ${e.is_active?"bg":"br"}`}>{e.is_active?"Active":"Inactive"}</span></div>
                      </div>
                      <div className="emp-card-info">
                        {e.store_name&&<span className="b bg" style={{fontSize:10}}>Store: {e.store_name}</span>}
                        {e.shift_name&&<span className="b bgr" style={{fontSize:10}}>{e.shift_name}</span>}
                        {e.tsc_name&&<span style={{fontSize:10,color:"#64748B"}}>TSC: {e.tsc_name}</span>}
                        {(e.am_name||e.city_name)&&<span style={{fontSize:10,color:"#64748B"}}>AM: {e.am_name||e.city_name}</span>}
                      </div>
                      <div className="emp-card-action">
                        <select value="" onChange={(ev)=>{const v=ev.target.value;ev.currentTarget.value="";
                          if(v==="edit"){setShowEditEmp({user_id:e.user_id,employee_id:e.employee_id,full_name:e.full_name||"",email:e.email||"",phone:e.phone||"",role_id:String(e.role_id||"")});}
                          else if(v==="delete"){checkAndDelete(e);}
                          else if(v==="deactivate"){if(!confirm(`Deactivate ${e.full_name}?`))return;doDelete(`Employee ${e.full_name}`,"deactivate",{user_id:e.user_id,employee_id:e.employee_id});}
                          else if(v==="activate"){if(!confirm(`Activate ${e.full_name}?`))return;doAction("/api/auth/admin-user","activate",{user_id:e.user_id});}
                        }} className="emp-actions-select emp-actions-select-full">
                          <option value="" disabled>Actions</option>
                          <option value="edit">Edit</option><option value="delete">Delete</option>
                          {e.is_active?<option value="deactivate">Deactivate</option>:<option value="activate">Activate</option>}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ASSIGNMENTS */}
            {tab==="assignments"&&(
              <>
                <div className="section-title">Manage Assignments</div>
                <div className="card" style={{marginBottom:12}}>
                  <div className="ch"><div className="ct">Brand Ambassadors — Store / Shift / TSC</div></div>
                  <div className="tbl"><table style={{width:"100%"}}>
                    <thead><tr><th>Employee</th><th>Current</th><th>New Store</th><th>New Shift</th><th>New TSC</th><th style={{width:140}}>Actions</th></tr></thead>
                    <tbody>{baList.length===0?<tr><td colSpan={6} className="empty">No Brand Ambassadors</td></tr>:baList.map((ba: Record<string,any>)=>(
                      <tr key={ba.employee_id}>
                        <td><div className="assign-name">{ba.full_name}</div><div style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace"}}>{ba.employee_code}</div></td>
                        <td><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{ba.store_name?<span className="b bg">{ba.store_name}</span>:<span className="b br">No Store</span>}{ba.shift_name&&<span className="b bgr">{ba.shift_name}</span>}{ba.tsc_name&&<span style={{fontSize:10,color:"#64748B"}}>{ba.tsc_name}</span>}</div></td>
                        <td><select id={`bs-${ba.employee_id}`} style={s}><option value="">Select Store</option>{stores.map(st=><option key={`st-${st.store_id}`} value={st.store_id}>{st.store_name}</option>)}</select></td>
                        <td><select id={`bsh-${ba.employee_id}`} style={s}><option value="">Select Shift</option>{shifts.map(sh=><option key={`sh-${sh.shift_id}`} value={sh.shift_id}>{sh.shift_name}</option>)}</select></td>
                        <td><select id={`bt-${ba.employee_id}`} style={s}><option value="">Select TSC</option>{tscList.map(t=><option key={t.employee_id} value={t.employee_id}>{t.full_name}</option>)}</select></td>
                        <td><div style={{display:"flex",gap:5}}>
                          <button className="btn bp btn-sm" onClick={()=>{const store=(document.getElementById(`bs-${ba.employee_id}`) as HTMLSelectElement).value;const shift=(document.getElementById(`bsh-${ba.employee_id}`) as HTMLSelectElement).value;const tsc=(document.getElementById(`bt-${ba.employee_id}`) as HTMLSelectElement).value;if(!store||!shift){showToast("Select store & shift",true);return;}doAction("/api/auth/admin-user","assign_store",{employee_id:ba.employee_id,store_id:store,shift_id:shift,tsc_employee_id:tsc||null});}}>Assign</button>
                          {ba.store_name&&<button className="btn brd btn-sm" onClick={()=>doDelete(`${ba.full_name} assignment`,"remove_assignment",{employee_id:ba.employee_id})}>Remove</button>}
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
                <div className="card" style={{marginBottom:12}}>
                  <div className="ch"><div className="ct">TSC — AM & Store Assignment</div></div>
                  <div className="tbl"><table style={{width:"100%"}}>
                    <thead><tr><th>Employee</th><th>Current AM</th><th>Assign AM</th><th>City</th><th>Assign Store</th><th style={{width:160}}>Actions</th></tr></thead>
                    <tbody>{tscList.length===0?<tr><td colSpan={6} className="empty">No TSCs</td></tr>:tscList.map((tsc: Record<string,any>)=>(
                      <tr key={tsc.employee_id}>
                        <td><div className="assign-name">{tsc.full_name}</div><div style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace"}}>{tsc.employee_code}</div></td>
                        <td>{tsc.am_name?<span className="b bg">{tsc.am_name}</span>:<span className="b br">None</span>}</td>
                        <td><select id={`ta-${tsc.employee_id}`} style={s}><option value="">Select AM</option>{amList.map(a=><option key={a.employee_id} value={a.employee_id}>{a.full_name}</option>)}</select></td>
                        <td><select id={`tc-${tsc.employee_id}`} style={s}><option value="">Select City</option>{cities.map(c=><option key={`c-${c.city_id}`} value={c.city_id}>{c.city_name}</option>)}</select></td>
                        <td><select id={`ts-${tsc.employee_id}`} style={s}><option value="">Select Store</option>{stores.map(st=><option key={`st-${st.store_id}`} value={st.store_id}>{st.store_name}</option>)}</select></td>
                        <td><div style={{display:"flex",gap:5}}>
                          <button className="btn bp btn-sm" onClick={()=>{const a=(document.getElementById(`ta-${tsc.employee_id}`) as HTMLSelectElement).value;const c=(document.getElementById(`tc-${tsc.employee_id}`) as HTMLSelectElement).value;if(!a||!c){showToast("Select AM & city",true);return;}doAction("/api/auth/admin-user","assign_tsc",{tsc_employee_id:tsc.employee_id,am_employee_id:a,city_id:c});}}>AM</button>
                          <button className="btn bg2 btn-sm" onClick={()=>{const st=(document.getElementById(`ts-${tsc.employee_id}`) as HTMLSelectElement).value;if(!st){showToast("Select store",true);return;}doAction("/api/auth/admin-user","assign_tsc_store",{tsc_employee_id:tsc.employee_id,store_id:st});}}>Store</button>
                          {tsc.am_name&&<button className="btn brd btn-sm" onClick={()=>doDelete(`${tsc.full_name} AM assignment`,"remove_tsc_am",{tsc_employee_id:tsc.employee_id})}>Remove</button>}
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
                <div className="card">
                  <div className="ch"><div className="ct">Area Managers — City Assignment</div></div>
                  <div className="tbl"><table style={{width:"100%"}}>
                    <thead><tr><th>Employee</th><th>Current City</th><th>Assign City</th><th style={{width:140}}>Actions</th></tr></thead>
                    <tbody>{amList.length===0?<tr><td colSpan={4} className="empty">No Area Managers</td></tr>:amList.map((am: Record<string,any>)=>(
                      <tr key={am.employee_id}>
                        <td><div className="assign-name">{am.full_name}</div><div style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace"}}>{am.employee_code}</div></td>
                        <td>{am.city_name?<span className="b bg">{am.city_name}</span>:<span className="b br">None</span>}</td>
                        <td><select id={`ac-${am.employee_id}`} style={s}><option value="">Select City</option>{cities.map(c=><option key={`c-${c.city_id}`} value={c.city_id}>{c.city_name}</option>)}</select></td>
                        <td><div style={{display:"flex",gap:5}}>
                          <button className="btn bp btn-sm" onClick={()=>{const c=(document.getElementById(`ac-${am.employee_id}`) as HTMLSelectElement).value;if(!c){showToast("Select city",true);return;}doAction("/api/auth/admin-user","assign_am_city",{am_employee_id:am.employee_id,city_id:c});}}>Assign</button>
                          {am.city_name&&<button className="btn brd btn-sm" onClick={()=>doDelete(`${am.full_name} city assignment`,"remove_am_city",{am_employee_id:am.employee_id})}>Remove</button>}
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              </>
            )}

            {/* STORES */}
            {tab==="stores"&&(
              <>
                <div className="top-header-row" style={{marginBottom:12}}>
                  <div className="section-title" style={{marginBottom:0}}>Store Locations</div>
                  <button className="btn bp" onClick={()=>setShowModal({type:"store",mode:"add"})}>+ Add Store</button>
                </div>
                <div className="card">
                  <div className="ch"><div className="ct">Store GPS Coordinates</div><div style={{fontSize:11,color:"#64748B"}}>Used for geofence check-in validation (200m radius)</div></div>
                  <div className="tbl"><table style={{width:"100%"}}>
                    <thead><tr><th>Store Name</th><th>Address</th><th>Latitude</th><th>Longitude</th><th>GPS</th><th style={{width:130}}>Actions</th></tr></thead>
                    <tbody>{stores.length===0?<tr><td colSpan={6} className="empty">No stores found</td></tr>:stores.map(st=>(
                      <tr key={`st-${st.store_id}`}>
                        <td><input type="text" value={storeLatLng[st.store_id]?.name??st.store_name} onChange={e=>setStoreLatLng(prev=>({...prev,[st.store_id]:{...prev[st.store_id],name:e.target.value}}))} className="store-input store-name-input"/></td>
                        <td><input type="text" placeholder="Street, Area, City" value={storeLatLng[st.store_id]?.address??""} onChange={e=>setStoreLatLng(prev=>({...prev,[st.store_id]:{...prev[st.store_id],address:e.target.value}}))} className="store-input"/></td>
                        <td><input type="number" step="0.000001" placeholder="33.566678" value={storeLatLng[st.store_id]?.lat??""} onChange={e=>setStoreLatLng(prev=>({...prev,[st.store_id]:{...prev[st.store_id],lat:e.target.value}}))} className="store-input"/></td>
                        <td><input type="number" step="0.000001" placeholder="73.155161" value={storeLatLng[st.store_id]?.lng??""} onChange={e=>setStoreLatLng(prev=>({...prev,[st.store_id]:{...prev[st.store_id],lng:e.target.value}}))} className="store-input"/></td>
                        <td className="tr-center">{st.latitude&&st.longitude?<span className="gps-set">✓ Set</span>:<span className="gps-unset">⚠ Not set</span>}</td>
                        <td><div style={{display:"flex",gap:4}}>
                          <button className="btn bp btn-sm" onClick={async()=>{const ll=storeLatLng[st.store_id];if(!ll?.lat||!ll?.lng){showToast("Enter latitude and longitude",true);return;}setLoading(true);try{const res=await fetch("/api/auth/admin-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"update_store_location",store_id:st.store_id,store_name:ll.name||st.store_name,latitude:parseFloat(ll.lat),longitude:parseFloat(ll.lng),address:ll.address||""})});const data=await res.json();if(res.ok){showToast(`${st.store_name} updated!`);fetchAll();}else showToast(data.message||"Error",true);}catch(_e:unknown){showToast("Connection error",true);}setLoading(false);}}>Save</button>
                          <button className="btn btn-sm btn-del" onClick={()=>doDelete(`Delete ${st.store_name}?`,"delete_store",{store_id:st.store_id})}>Del</button>
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              </>
            )}

            {/* PRICES */}
            {tab==="prices"&&(
              <>
                <div className="card" style={{marginBottom:12}}>
                  <div className="ch"><div className="ct">Brands ({catalog.brands.length})</div><button className="btn bp" onClick={()=>{setShowModal({type:"brand",mode:"add"});setModalForm({});}}>+ Add Brand</button></div>
                  <div className="tbl"><table><thead><tr><th>Brand Name</th><th>Categories</th><th>SKUs</th><th>Actions</th></tr></thead>
                  <tbody>{catalog.brands.map((br: Record<string,any>)=>(<tr key={br.brand_id}><td className="td-name">{br.brand_name}</td><td>{catalog.categories.filter(c=>c.brand_id===br.brand_id).length}</td><td>{catalog.skus.filter(sk=>sk.brand_id===br.brand_id).length}</td><td style={{display:"flex",gap:4}}><button className="btn bya btn-sm" onClick={()=>{setShowModal({type:"brand",mode:"edit"});setModalForm({brand_id:br.brand_id,brand_name:br.brand_name});}}><IcoEdit/> Edit</button><button className="btn brd btn-sm" onClick={()=>{if(confirm(`Delete brand "${br.brand_name}"?`))doDelete(`Brand ${br.brand_name}`,"delete_brand",{brand_id:br.brand_id},true);}}><IcoDelete/> Delete</button></td></tr>))}</tbody>
                  </table></div>
                </div>
                <div className="card" style={{marginBottom:12}}>
                  <div className="ch"><div className="ct">Categories ({catalog.categories.length})</div><button className="btn bp" onClick={()=>{setShowModal({type:"category",mode:"add"});setModalForm({});}}>+ Add Category</button></div>
                  <div className="tbl"><table><thead><tr><th>Brand</th><th>Category Name</th><th>SKUs</th><th>Actions</th></tr></thead>
                  <tbody>{catalog.categories.map((cat: Record<string,any>)=>(<tr key={cat.category_id}><td><span className="b bbl">{cat.brand_name}</span></td><td className="td-name">{cat.category_name}</td><td>{catalog.skus.filter(sk=>sk.category_id===cat.category_id).length}</td><td style={{display:"flex",gap:4}}><button className="btn bya btn-sm" onClick={()=>{setShowModal({type:"category",mode:"edit"});setModalForm({category_id:cat.category_id,category_name:cat.category_name,brand_id:cat.brand_id});}}><IcoEdit/> Edit</button><button className="btn brd btn-sm" onClick={()=>{if(confirm(`Delete category "${cat.category_name}"?`))doDelete(`Category ${cat.category_name}`,"delete_category",{category_id:cat.category_id},true);}}><IcoDelete/> Delete</button></td></tr>))}</tbody>
                  </table></div>
                </div>
                <div className="card">
                  <div className="ch"><div className="ct">SKUs & Prices ({filteredPrices.length})</div>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                      <select value={priceBrand} onChange={e=>setPriceBrand(e.target.value)} style={{...s,width:110}}><option value="all">All Brands</option>{catalog.brands.map(br=><option key={br.brand_id} value={br.brand_name}>{br.brand_name}</option>)}</select>
                      <div className="sw" style={{width:160}}><span className="si"><IcoSearch/></span><input placeholder="Search SKU..." value={priceSearch} onChange={e=>setPriceSearch(e.target.value)} /></div>
                      <button className="btn bp" onClick={()=>{setShowModal({type:"sku",mode:"add"});setModalForm({unit_of_measure:"CTN"});}}>+ Add SKU</button>
                    </div>
                  </div>
                  <div className="tbl"><table>
                    <thead><tr><th>Brand</th><th>Category</th><th>SKU Name</th><th>UOM</th><th>Price (Rs)</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>{filteredPrices.map((p: Record<string,any>)=>(<tr key={p.sku_id}>
                      <td><span className="b bbl">{p.brand_name}</span></td><td style={{fontSize:11,color:"#64748B"}}>{p.category_name}</td>
                      <td className="sku-name-cell">{p.sku_name}</td>
                      <td style={{fontSize:11,color:"#94A3B8"}}>{p.unit_of_measure}</td>
                      <td>{editPriceId===p.sku_id?<div className="price-edit-wrap"><input type="number" value={editPriceVal} onChange={e=>setEditPriceVal(e.target.value)} className="price-edit-input" autoFocus/><button className="btn bg2 btn-sm" onClick={async()=>{await doAction("/api/auth/admin-catalog","update_price",{sku_id:p.sku_id,retail_price:parseFloat(editPriceVal)});setEditPriceId(null);fetchCatalog();}}>Save</button><button className="btn bgray btn-sm" onClick={()=>setEditPriceId(null)}>Cancel</button></div>:<span style={{fontWeight:600,cursor:"pointer",color:"#1E3A8A",display:"flex",alignItems:"center",gap:4}} onClick={()=>{setEditPriceId(p.sku_id);setEditPriceVal(p.retail_price);}}>Rs {Number(p.retail_price).toLocaleString()} <IcoEdit/></span>}</td>
                      <td><span className={`b ${p.is_active?"bg":"br"}`}>{p.is_active?"Active":"Inactive"}</span></td>
                      <td style={{display:"flex",gap:4}}><button className="btn bya btn-sm" onClick={()=>{setShowModal({type:"sku",mode:"edit"});setModalForm({sku_id:p.sku_id,sku_name:p.sku_name,unit_of_measure:p.unit_of_measure,retail_price:p.retail_price,category_id:p.category_id});}}><IcoEdit/></button><button className="btn brd btn-sm" onClick={()=>{if(confirm(`Remove SKU "${p.sku_name}"?`))doDelete(`SKU ${p.sku_name}`,"delete_sku",{sku_id:p.sku_id},true);}}><IcoDelete/></button></td>
                    </tr>))}</tbody>
                  </table></div>
                </div>
              </>
            )}

            {/* ATTENDANCE */}
            {tab==="attendance"&&(
              <>
                <div className="fb">
                  <div className="fl"><label className="fl-label">From</label><input type="date" value={attDateFrom} onChange={e=>setAttDateFrom(e.target.value)}/></div>
                  <div className="fl"><label className="fl-label">To</label><input type="date" value={attDateTo} onChange={e=>setAttDateTo(e.target.value)}/></div>
                  <div className="fl"><label className="fl-label">Role</label>
                    <select value={attRole} onChange={e=>setAttRole(e.target.value)}>
                      <option value="all">All Roles</option><option value="Brand Ambassador">BA Only</option><option value="TSC">TSC Only</option><option value="Area Manager">AM Only</option>
                    </select>
                  </div>
                  <div className="fl"><label className="fl-label">Employee</label>
                    <select value={attEmp} onChange={e=>setAttEmp(e.target.value)}>
                      <option key="all" value="all">All Employees</option>
                      <option key="grp-ba" value="grp:Brand Ambassador">— All BA</option>
                      <option key="grp-tsc" value="grp:TSC">— All TSC</option>
                      <option key="grp-am" value="grp:Area Manager">— All AM</option>
                      {employees.map(e=><option key={`emp-${e.employee_id}`} value={e.employee_id}>{e.full_name}</option>)}
                    </select>
                  </div>
                  <div className="fl"><label className="fl-label">Store</label>
                    <select value={attStore} onChange={e=>setAttStore(e.target.value)}>
                      <option value="all">All Stores</option>{stores.map(st=><option key={`st-${st.store_id}`} value={st.store_id}>{st.store_name}</option>)}
                    </select>
                  </div>
                  <div className="fl"><label className="fl-label">Search</label>
                    <div className="sw"><span className="si"><IcoSearch/></span><input placeholder="Name, code, store..." value={attSearch} onChange={e=>setAttSearch(e.target.value)}/></div>
                  </div>
                </div>
                <div className="dl-row">
                  <span className="dl-label">Download:</span>
                  <button className="btn bg2 btn-sm" onClick={()=>downloadReport('attendance_download',{date_from:attDateFrom,date_to:attDateTo,employee_id:attEmp.startsWith("grp:")?"all":attEmp,role_filter:attEmp.startsWith("grp:")?attEmp.replace("grp:",""):attRole,store_id:attStore})} style={{display:"flex",alignItems:"center",gap:4}}><IcoCsv/> Filtered</button>
                  <button className="btn bp btn-sm" onClick={()=>downloadReport('attendance_download',{date_from:attDateFrom,date_to:attDateTo})} style={{display:"flex",alignItems:"center",gap:4}}><IcoCsv/> All</button>
                  {(["Brand Ambassador","TSC","Area Manager"] as string[]).map(r=>(<button key={r} className="btn bgray btn-sm" onClick={()=>downloadReport('attendance_download',{date_from:attDateFrom,date_to:attDateTo,role_filter:r})} style={{display:"flex",alignItems:"center",gap:4}}><IcoCsv/> {r==="Brand Ambassador"?"All BA":r==="Area Manager"?"All AM":"All TSC"}</button>))}
                </div>
                <div className="card">
                  <div className="ch"><div className="ct">Attendance Records</div><span style={{fontSize:11,color:"#64748B"}}>{filteredAtt.length} records</span></div>
                  <div className="tbl"><table>
                    <thead><tr><th>Date</th><th>Name</th><th>Code</th><th>Role</th><th>Store</th><th>Shift</th><th>In</th><th>Out</th><th>Hours</th><th>Status</th><th>TSC</th><th>AM</th><th>Action</th></tr></thead>
                    <tbody>
                      {loading?<tr><td colSpan={13} className="empty">Loading...</td></tr>
                      :filteredAtt.length===0?<tr><td colSpan={13} className="empty">No records found</td></tr>
                      :filteredAtt.map((a: Record<string,any>,i: number)=>(
                        <tr key={i}>
                          <td className="td-mono">{a.date}</td>
                          <td className="td-name">{a.full_name}</td>
                          <td className="td-muted">{a.employee_code}</td>
                          <td><span className="b bgr b-xs">{a.role_name}</span></td>
                          <td>{a.store_name}</td><td className="td-sm">{a.shift_name}</td>
                          <td className="td-sm">{a.check_in||"—"}</td>
                          <td className="td-sm">{a.check_out||<span style={{color:"#F59E0B"}}>Active</span>}</td>
                          <td className="td-sm">{a.hours}</td>
                          <td><span className={`b ${a.status==="Present"?"bg":"br"}`}>{a.status}</span></td>
                          <td className="td-sm">{a.tsc_name||"—"}</td>
                          <td className="td-sm">{a.am_name||"—"}</td>
                          <td>{a.check_out&&<button className="btn bg2 btn-sm" onClick={()=>reCheckin(a.employee_id_num||0,a.date)}>Re-Check In</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>
              </>
            )}

            {/* SALES */}
            {tab==="sales"&&(
              <>
                <div className="fb">
                  <div className="fl"><label className="fl-label">From</label><input type="date" value={saleDateFrom} onChange={e=>setSaleDateFrom(e.target.value)}/></div>
                  <div className="fl"><label className="fl-label">To</label><input type="date" value={saleDateTo} onChange={e=>setSaleDateTo(e.target.value)}/></div>
                  <div className="fl"><label className="fl-label">Employee</label>
                    <select value={saleEmp} onChange={e=>setSaleEmp(e.target.value)}>
                      <option key="all" value="all">All Employees</option>
                      <option key="grp-ba" value="grp:Brand Ambassador">— All BA</option>
                      <option key="grp-tsc" value="grp:TSC">— All TSC</option>
                      <option key="grp-am" value="grp:Area Manager">— All AM</option>
                      {employees.map(e=><option key={`emp-${e.employee_id}`} value={e.employee_id}>{e.full_name}</option>)}
                    </select>
                  </div>
                  <div className="fl"><label className="fl-label">Store</label>
                    <select value={saleStore} onChange={e=>setSaleStore(e.target.value)}>
                      <option value="all">All Stores</option>{stores.map(st=><option key={`st-${st.store_id}`} value={st.store_id}>{st.store_name}</option>)}
                    </select>
                  </div>
                  <div className="fl"><label className="fl-label">Brand</label>
                    <select value={saleBrand} onChange={e=>setSaleBrand(e.target.value)}>
                      <option value="all">All Brands</option>{saleBrands.map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="fl"><label className="fl-label">Search</label>
                    <div className="sw"><span className="si"><IcoSearch/></span><input placeholder="Name, store, SKU..." value={saleSearch} onChange={e=>setSaleSearch(e.target.value)}/></div>
                  </div>
                </div>
                <div className="dl-row">
                  <span className="dl-label">Download:</span>
                  <button className="btn bg2 btn-sm" onClick={async()=>{const empId=saleEmp.startsWith("grp:")?"all":saleEmp;const roleF=saleEmp.startsWith("grp:")?saleEmp.replace("grp:",""):"all";await downloadReport("sales_download",{date_from:saleDateFrom,date_to:saleDateTo,employee_id:empId,role_filter:roleF,store_id:saleStore});setTimeout(()=>downloadReport("attendance_download",{date_from:saleDateFrom,date_to:saleDateTo,employee_id:empId,role_filter:roleF,store_id:saleStore}),800);}} style={{display:"flex",alignItems:"center",gap:4}}><IcoCsv/> Sales + Att</button>
                  <button className="btn bp btn-sm" onClick={()=>downloadReport("sales_download",{date_from:saleDateFrom,date_to:saleDateTo})} style={{display:"flex",alignItems:"center",gap:4}}><IcoCsv/> All Sales</button>
                  {(["Brand Ambassador","TSC","Area Manager"] as string[]).map(r=>(<button key={r} className="btn bgray btn-sm" onClick={()=>downloadReport('sales_download',{date_from:saleDateFrom,date_to:saleDateTo,role_filter:r})} style={{display:"flex",alignItems:"center",gap:4}}><IcoCsv/> {r==="Brand Ambassador"?"All BA":r==="Area Manager"?"All AM":"All TSC"}</button>))}
                </div>
                <div className="card">
                  <div className="ch">
                    <div className="ct">Sales Records</div>
                    <span style={{fontSize:11,color:"#64748B"}}>
                      {buildGroups(filteredSales).order.length} entries · Total: <strong style={{color:"#10B981"}}>Rs {filteredSales.reduce((a,r)=>a+Number(r.total_amount||0),0).toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="tbl"><table>
                    <thead><tr><th>Date</th><th>Name</th><th>Code</th><th>Role</th><th>Store</th><th>SKUs</th><th>TSC</th><th>AM</th><th style={{textAlign:"right"}}>Total Sales</th></tr></thead>
                    <tbody>
                      {loading?<tr><td colSpan={9} className="empty">Loading...</td></tr>
                      :filteredSales.length===0?<tr><td colSpan={9} className="empty">No records found</td></tr>
                      :(() => { const { groups, order } = buildGroups(filteredSales); return order.map((k, gi) => {
                        const { summary, items } = groups[k];
                        const total = items.reduce((s,i)=>s+Number(i.total_amount||0),0);
                        const skuCount = items.filter(i=>i.sku_name).length;
                        return (
                          <tr key={gi} className="sale-row" onClick={()=>openDetailModal(summary, items)}>
                            <td className="td-mono">{summary.date}</td>
                            <td className="td-bold">{summary.full_name}</td>
                            <td className="td-muted">{summary.employee_code}</td>
                            <td><span className="b bgr b-xs" >{summary.role_name}</span></td>
                            <td className="td-sm">{summary.store_name}</td>
                            <td className="tr-center"><span className="b bbl" style={{fontSize:10}}>{skuCount} SKU{skuCount!==1?"s":""}</span></td>
                            <td className="td-sm">{summary.tsc_name||"—"}</td>
                            <td className="td-sm">{summary.am_name||"—"}</td>
                            <td className="tr-right td-green">Rs {total.toLocaleString()}</td>
                          </tr>
                        );
                      })})()}
                    </tbody>
                  </table></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ADD EMPLOYEE MODAL */}
        {showAddEmp&&(
          <div className="modal-bg" onClick={()=>setShowAddEmp(false)}>
            <div className="modal" style={{width:540}} onClick={e=>e.stopPropagation()}>
              <div className="modal-title">Add New Employee</div>
              <div className="section-sep">Basic Information</div>
              <div className="fgr" style={{marginBottom:10}}>
                <div className="fg"><label>Full Name *</label><input style={inp} value={addForm.full_name} onChange={e=>setAddForm({...addForm,full_name:e.target.value})} placeholder="Full name"/></div>
                <div className="fg"><label>Role *</label><select style={s} value={addForm.role_id} onChange={e=>setAddForm({...addForm,role_id:e.target.value})}><option value="4">Brand Ambassador</option><option value="3">TSC</option><option value="2">Area Manager</option><option value="1">Admin</option></select></div>
                <div className="fg"><label>Phone *</label><input style={inp} value={addForm.phone} onChange={e=>setAddForm({...addForm,phone:e.target.value.replace(/\D/g,"").slice(0,11)})} placeholder="03001234567" maxLength={11}/></div>
                <div className="fg"><label>Email (optional)</label><input style={inp} type="email" value={addForm.email} onChange={e=>setAddForm({...addForm,email:e.target.value})} placeholder="email@example.com"/></div>
                <div className="fg"><label>Password *</label><input style={inp} type="password" value={addForm.password} onChange={e=>setAddForm({...addForm,password:e.target.value})} placeholder="Min 8 characters"/></div>
                <div className="fg"><label className="fl-label">Store</label><select style={s} value={addForm.store_id} onChange={e=>setAddForm({...addForm,store_id:e.target.value})}><option value="">No store yet</option>{stores.map(st=><option key={`st-${st.store_id}`} value={st.store_id}>{st.store_name}</option>)}</select></div>
              </div>
              <div className="fg" style={{marginBottom:10}}><label>Shift</label><select style={s} value={addForm.shift_id} onChange={e=>setAddForm({...addForm,shift_id:e.target.value})}><option value="">No shift yet</option>{shifts.map(sh=><option key={`sh-${sh.shift_id}`} value={sh.shift_id}>{sh.shift_name} ({sh.start_time?.slice(0,5)}-{sh.end_time?.slice(0,5)})</option>)}</select></div>
              {addForm.role_id==="4"&&(<>
                <div className="section-sep">Identity — Required for BA</div>
                <div className="fgr" style={{marginBottom:10}}>
                  <div className="fg"><label>CNIC *</label><input style={inp} value={addForm.cnic} placeholder="12345-1234567-1" maxLength={15} onChange={e=>{const d=e.target.value.replace(/\D/g,"").slice(0,13);let v=d;if(d.length>5)v=d.slice(0,5)+"-"+d.slice(5);if(d.length>12)v=d.slice(0,5)+"-"+d.slice(5,12)+"-"+d.slice(12);setAddForm({...addForm,cnic:v});}}/><div style={{fontSize:10,color:"#94A3B8",marginTop:3}}>Format: 12345-1234567-1</div></div>
                  <div className="fg"><label>Father / Husband Name *</label><input style={inp} value={addForm.father_name} onChange={e=>setAddForm({...addForm,father_name:e.target.value})} placeholder="Muhammad Ahmed"/></div>
                </div>
                <div className="fg" style={{marginBottom:10}}><label>Address (optional)</label><input style={inp} value={addForm.address} onChange={e=>setAddForm({...addForm,address:e.target.value})} placeholder="House #, Street, City"/></div>
                <div className="section-sep">Bank Account — Required for BA</div>
                <div className="fg" style={{marginBottom:10}}><label>Bank Name *</label><select style={s} value={addForm.bank_name} onChange={e=>setAddForm({...addForm,bank_name:e.target.value})}><option value="">Select Bank</option>{["Meezan Bank","HBL","UBL","MCB","Allied Bank","Bank Alfalah","Faysal Bank","Standard Chartered","Askari Bank","Bank of Punjab","NBP","Soneri Bank","Silk Bank","JS Bank","Habib Metro","Bank Al-Habib","Summit Bank","SadaPay","NayaPay","EasyPaisa","JazzCash","Neon","Other"].map(b=><option key={b} value={b}>{b}</option>)}</select></div>
                <div className="fgr" style={{marginBottom:10}}>
                  <div className="fg"><label>Account Number *</label><input style={inp} value={addForm.bank_account} onChange={e=>setAddForm({...addForm,bank_account:e.target.value})} placeholder="Account number"/></div>
                  <div className="fg"><label>IBAN {addForm.bank_name==="Meezan Bank"?"(recommended)":"(optional)"}</label><input style={inp} value={addForm.iban} onChange={e=>setAddForm({...addForm,iban:e.target.value.toUpperCase()})} placeholder="PK36XXXX..."/></div>
                </div>
              </>)}
              <div className="modal-footer">
                <button className="btn bgray" onClick={()=>setShowAddEmp(false)}>Cancel</button>
                <button className="btn bp" onClick={addEmployee} disabled={loading}>{loading?"Adding...":"Add Employee"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD STORE MODAL */}
        {showModal?.type==="store"&&(
          <div className="modal-bg" onClick={()=>setShowModal(null)}>
            <div className="modal" style={{width:480}} onClick={e=>e.stopPropagation()}>
              <div className="modal-title">Add New Store</div>
              <div className="fgr">
                <div className="fg" style={{gridColumn:"span 2"}}><label>Store Name *</label><input style={inp} placeholder="e.g. Store D - G-9 Markaz" value={String(showModal.store_name||"")} onChange={e=>setShowModal(p=>p?{...p,store_name:e.target.value}:p)}/></div>
                <div className="fg" style={{gridColumn:"span 2"}}><label>Address</label><input style={inp} placeholder="Street, Area, City" value={String(showModal.address||"")} onChange={e=>setShowModal(p=>p?{...p,address:e.target.value}:p)}/></div>
                <div className="fg"><label>Latitude</label><input style={inp} type="number" step="0.000001" placeholder="33.566678" value={String(showModal.latitude||"")} onChange={e=>setShowModal(p=>p?{...p,latitude:e.target.value}:p)}/></div>
                <div className="fg"><label>Longitude</label><input style={inp} type="number" step="0.000001" placeholder="73.155161" value={String(showModal.longitude||"")} onChange={e=>setShowModal(p=>p?{...p,longitude:e.target.value}:p)}/></div>
                <div className="fg"><label>City</label><select style={s} value={String(showModal.city_id||"1")} onChange={e=>setShowModal(p=>p?{...p,city_id:e.target.value}:p)}>{cities.map(c=><option key={`c-${c.city_id}`} value={c.city_id}>{c.city_name}</option>)}</select></div>
              </div>
              <div className="modal-footer">
                <button className="btn bgray" onClick={()=>setShowModal(null)}>Cancel</button>
                <button className="btn bp" onClick={saveCatalogModal} disabled={loading}>{loading?"Adding...":"Add Store"}</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT EMPLOYEE MODAL */}
        {showEditEmp&&(
          <div className="modal-bg" onClick={()=>setShowEditEmp(null)}>
            <div className="modal" style={{width:480}} onClick={e=>e.stopPropagation()}>
              <div className="modal-title">Edit Employee</div>
              <div className="fgr">
                <div className="fg" style={{gridColumn:"span 2"}}><label>Full Name *</label><input style={inp} value={String(showEditEmp.full_name||"")} onChange={e=>setShowEditEmp((p: Record<string,any>|null)=>p?{...p,full_name:e.target.value}:p)}/></div>
                <div className="fg"><label>Phone *</label><input style={inp} value={String(showEditEmp.phone||"")} onChange={e=>setShowEditEmp((p: Record<string,any>|null)=>p?{...p,phone:e.target.value.replace(/\D/g,"").slice(0,11)}:p)} placeholder="03001234567" maxLength={11}/></div>
                <div className="fg"><label className="fl-label">Role</label><select style={s} value={String(showEditEmp.role_id||"")} onChange={e=>setShowEditEmp((p: Record<string,any>|null)=>p?{...p,role_id:e.target.value}:p)}><option value="4">Brand Ambassador</option><option value="3">TSC</option><option value="2">Area Manager</option><option value="1">Admin</option></select></div>
                <div className="fg" style={{gridColumn:"span 2"}}><label>Email (optional)</label><input style={inp} type="email" value={String(showEditEmp.email||"")} onChange={e=>setShowEditEmp((p: Record<string,any>|null)=>p?{...p,email:e.target.value}:p)} placeholder="email@example.com"/></div>
              </div>
              <div className="modal-footer">
                <button className="btn bgray" onClick={()=>setShowEditEmp(null)}>Cancel</button>
                <button className="btn bp" onClick={async()=>{
                  if(!showEditEmp)return;
                  const full_name=String(showEditEmp.full_name||"").trim();
                  const phone=String(showEditEmp.phone||"").replace(/[\s\-]/g,"");
                  const email=String(showEditEmp.email||"").trim();
                  if(!full_name){showToast("Full name is required",true);return;}
                  if(!phone||!/^03\d{9}$/.test(phone)){showToast("Phone must be 11 digits starting with 03",true);return;}
                  await doAction("/api/auth/admin-user","update_employee",{user_id:showEditEmp.user_id,employee_id:showEditEmp.employee_id,full_name,email:email||null,phone,role_id:showEditEmp.role_id});
                  setShowEditEmp(null);
                }} disabled={loading}>{loading?"Saving...":"Save"}</button>
              </div>
            </div>
          </div>
        )}

        {/* CATALOG MODAL */}
        {showModal&&showModal.type!=="store"&&(
          <div className="modal-bg" onClick={()=>setShowModal(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-title">{showModal.mode==="add"?"Add":"Edit"} {showModal.type.charAt(0).toUpperCase()+showModal.type.slice(1)}</div>
              {showModal.type==="brand"&&(<div className="fg"><label>Brand Name *</label><input style={inp} value={modalForm.brand_name||""} onChange={e=>setModalForm({...modalForm,brand_name:e.target.value})} placeholder="e.g. Wavy"/></div>)}
              {showModal.type==="category"&&(<><div className="fg"><label>Brand *</label><select style={s} value={modalForm.brand_id||""} onChange={e=>setModalForm({...modalForm,brand_id:parseInt(e.target.value)})}><option value="">Select Brand</option>{catalog.brands.map(br=><option key={br.brand_id} value={br.brand_id}>{br.brand_name}</option>)}</select></div><div className="fg"><label>Category Name *</label><input style={inp} value={modalForm.category_name||""} onChange={e=>setModalForm({...modalForm,category_name:e.target.value})} placeholder="e.g. Dishwasher"/></div></>)}
              {showModal.type==="sku"&&(<><div className="fg"><label>Category *</label><select style={s} value={modalForm.category_id||""} onChange={e=>setModalForm({...modalForm,category_id:parseInt(e.target.value)})}><option value="">Select Category</option>{catalog.categories.map(c=><option key={c.category_id} value={c.category_id}>{c.brand_name} → {c.category_name}</option>)}</select></div><div className="fg"><label>SKU Name *</label><input style={inp} value={modalForm.sku_name||""} onChange={e=>setModalForm({...modalForm,sku_name:e.target.value})} placeholder="e.g. Dishwash Liquid 475ml"/></div><div className="fgr"><div className="fg"><label>Unit of Measure</label><select style={s} value={modalForm.unit_of_measure||"CTN"} onChange={e=>setModalForm({...modalForm,unit_of_measure:e.target.value})}><option value="CTN">CTN</option><option value="PCS">PCS</option><option value="Pack">Pack</option><option value="KG">KG</option><option value="LTR">LTR</option><option value="ML">ML</option></select></div><div className="fg"><label>Retail Price (Rs) *</label><input style={inp} type="number" value={modalForm.retail_price||""} onChange={e=>setModalForm({...modalForm,retail_price:e.target.value})} placeholder="0.00"/></div></div></>)}
              <div className="modal-footer">
                <button className="btn bgray" onClick={()=>setShowModal(null)}>Cancel</button>
                <button className="btn bp" onClick={saveCatalogModal} disabled={loading}>{loading?"Saving...":"Save"}</button>
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYEE DETAIL MODAL */}
        <EmployeeDetailModal
          data={detailModal}
          onClose={()=>setDetailModal(null)}
          detailPeriod={detailPeriod}
          setDetailPeriod={setDetailPeriod}
          openKeys={detailOpenKeys}
          setOpenKeys={setDetailOpenKeys}
        />
      </div>
    </>
  );
}