import { useState, useEffect, useCallback } from "react";

// ─── Supabase ────────────────────────────────────────────────────────────────
const URL  = "https://pbvgvbazzsnhlfyjzgss.supabase.co";
const KEY  = "sb_publishable_j7X6ft345NVpTsBG7lVJlQ__ktV_0_y";

async function api(path, method = "GET", body = null) {
  const r = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": KEY,
      "Authorization": `Bearer ${KEY}`,
      "Prefer": "return=representation",
    },
    body: body ? JSON.stringify(body) : null,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(t);
  return t ? JSON.parse(t) : [];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATS = ["Tiles", "Adhesive", "Picture Tile", "Beeding", "Sanitaryware", "Others"];
const LOW  = 10;

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      "#F5F4F0",   // warm off-white — tile showroom feel
  surface: "#FFFFFF",
  border:  "#E2DDD6",
  text:    "#1C1917",
  muted:   "#78716C",
  accent:  "#C2410C",   // terracotta — tiles' own colour
  accentL: "#FFF0EB",
  blue:    "#1D4ED8",
  blueL:   "#EFF6FF",
  green:   "#15803D",
  greenL:  "#F0FDF4",
  yellow:  "#B45309",
  yellowL: "#FFFBEB",
  red:     "#B91C1C",
  redL:    "#FEF2F2",
  dark:    "#1C1917",
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const row   = (extra={}) => ({ display:"flex", alignItems:"center", ...extra });
const col   = (extra={}) => ({ display:"flex", flexDirection:"column", ...extra });
const card  = (extra={}) => ({ background: C.surface, borderRadius:12, border:`1px solid ${C.border}`, ...extra });

function Spinner({ size=20, color="#fff" }) {
  return (
    <>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:size, height:size, border:`2.5px solid transparent`, borderTop:`2.5px solid ${color}`, borderRadius:"50%", animation:"sp .7s linear infinite", flexShrink:0 }} />
    </>
  );
}

function Badge({ label, bg, color }) {
  return <span style={{ background:bg, color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:.3 }}>{label}</span>;
}

function Inp({ label, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:5, letterSpacing:.6, textTransform:"uppercase" }}>{label}</label>}
      <input style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.surface }} {...props} />
    </div>
  );
}

function Sel({ label, children, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:5, letterSpacing:.6, textTransform:"uppercase" }}>{label}</label>}
      <select style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.surface, cursor:"pointer" }} {...props}>{children}</select>
    </div>
  );
}

function Btn({ children, bg=C.accent, loading=false, full=false, outline=false, small=false, ...props }) {
  const base = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
    padding: small ? "7px 14px" : "11px 20px",
    borderRadius:8, border: outline ? `1.5px solid ${C.border}` : "none",
    background: outline ? C.surface : bg,
    color: outline ? C.text : "#fff",
    fontWeight:700, fontSize: small ? 13 : 14,
    cursor: props.disabled ? "not-allowed" : "pointer",
    opacity: props.disabled ? .65 : 1,
    width: full ? "100%" : "auto",
    fontFamily:"inherit", transition:"opacity .15s",
  };
  return <button style={base} {...props}>{loading ? <Spinner size={16} color={outline ? C.text : "#fff"} /> : null}{children}</button>;
}

function Modal({ onClose, children, wide=false }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(28,25,23,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ ...card(), padding:28, width:"100%", maxWidth: wide ? 520 : 420, boxShadow:"0 20px 60px rgba(0,0,0,.25)", maxHeight:"90vh", overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

function ModalTitle({ children }) {
  return <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:20 }}>{children}</div>;
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function Login({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!u.trim() || !p.trim()) { setErr("Enter username and password."); return; }
    setBusy(true); setErr("");
    try {
      const rows = await api(`users?username=eq.${encodeURIComponent(u.trim())}&password=eq.${encodeURIComponent(p)}&select=*`);
      if (rows.length) onLogin(rows[0]);
      else setErr("Username or password is incorrect.");
    } catch { setErr("Cannot connect. Check your internet."); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,#1C0A00 0%,#3B1A0A 50%,#C2410C 100%)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", padding:16 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        {/* Logo block */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, background:"rgba(255,255,255,.12)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 14px", border:"1.5px solid rgba(255,255,255,.2)" }}>🪨</div>
          <div style={{ fontSize:26, fontWeight:900, color:"#fff", letterSpacing:-1 }}>TileStock</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.55)", marginTop:5 }}>Inventory Management</div>
        </div>

        {/* Card */}
        <div style={{ ...card(), padding:"32px 28px" }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:20 }}>Sign in to your account</div>

          {err && (
            <div style={{ background:C.redL, color:C.red, border:`1px solid #FECACA`, borderRadius:8, padding:"10px 13px", fontSize:13, marginBottom:16, fontWeight:500 }}>
              {err}
            </div>
          )}

          <Inp label="Username" placeholder="Enter your username" value={u} onChange={e=>{setU(e.target.value);setErr("")}} onKeyDown={e=>e.key==="Enter"&&go()} autoFocus />
          <Inp label="Password" type="password" placeholder="Enter your password" value={p} onChange={e=>{setP(e.target.value);setErr("")}} onKeyDown={e=>e.key==="Enter"&&go()} />

          <div style={{ marginTop:6 }}>
            <Btn full bg={C.accent} loading={busy} disabled={busy} onClick={go}>
              {!busy && "Sign In →"}
            </Btn>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:"rgba(255,255,255,.35)" }}>
          Only authorised staff can access this system
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — user management
// ══════════════════════════════════════════════════════════════════════════════
function Admin({ me, onLogout, onStock }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ name:"", username:"", password:"", role:"user" });
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await api("users?select=*&order=created_at.asc")); }
    catch { setErr("Failed to load users."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd()  { setForm({ name:"", username:"", password:"", role:"user" }); setEditing(null); setErr(""); setModal(true); }
  function openEdit(u){ setForm({ name:u.name, username:u.username, password:u.password, role:u.role }); setEditing(u); setErr(""); setModal(true); }

  async function save() {
    if (!form.name.trim()||!form.username.trim()||!form.password.trim()) { setErr("All fields required."); return; }
    setBusy(true); setErr("");
    try {
      if (editing) await api(`users?id=eq.${editing.id}`, "PATCH", { name:form.name.trim(), username:form.username.trim(), password:form.password, role:form.role });
      else         await api("users", "POST", { name:form.name.trim(), username:form.username.trim(), password:form.password, role:form.role });
      await load(); setModal(false);
    } catch(e) {
      setErr(e.message.includes("unique") ? "Username already taken." : "Save failed. Try again.");
    } finally { setBusy(false); }
  }

  async function del(id) {
    if (id === me.id) return alert("You cannot delete your own account.");
    if (!confirm("Delete this user?")) return;
    try { await api(`users?id=eq.${id}`, "DELETE"); setUsers(p=>p.filter(u=>u.id!==id)); }
    catch { alert("Delete failed."); }
  }

  const admins = users.filter(u=>u.role==="admin").length;
  const staff  = users.filter(u=>u.role==="user").length;

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:C.bg, minHeight:"100vh" }}>
      {/* Top bar */}
      <div style={{ background:C.dark, padding:"0 24px", height:56, ...row({ justifyContent:"space-between" }) }}>
        <div style={{ ...row({ gap:12 }) }}>
          <span style={{ fontSize:18, fontWeight:900, color:"#fff", letterSpacing:-.5 }}>🪨 TileStock</span>
          <Badge label="ADMIN" bg={C.accent} color="#fff" />
        </div>
        <div style={{ ...row({ gap:10 }) }}>
          <span style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>👤 {me.name}</span>
          <Btn small bg="#374151" onClick={onStock}>📦 Stock</Btn>
          <Btn small outline onClick={onLogout}>Logout</Btn>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px" }}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          {[
            { n:users.length, label:"Total Users",  icon:"👥", accent:C.blue  },
            { n:admins,       label:"Admins",        icon:"🛡️", accent:C.accent },
            { n:staff,        label:"Staff",         icon:"👤", accent:C.green },
          ].map((s,i)=>(
            <div key={i} style={{ ...card({ padding:"18px 20px", borderLeft:`4px solid ${s.accent}` }) }}>
              <div style={{ fontSize:22 }}>{s.icon}</div>
              <div style={{ fontSize:26, fontWeight:800, color:C.text, marginTop:4 }}>{s.n}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Users card */}
        <div style={card()}>
          <div style={{ padding:"16px 20px", ...row({ justifyContent:"space-between" }), borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.text }}>All Users</div>
            <Btn small bg={C.accent} onClick={openAdd}>+ Add User</Btn>
          </div>

          {loading ? (
            <div style={{ padding:48, textAlign:"center" }}><Spinner size={28} color={C.accent} /></div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                <thead>
                  <tr style={{ background:C.bg }}>
                    {["Name","Username","Role","Actions"].map(h=>(
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted, letterSpacing:.6, textTransform:"uppercase", borderBottom:`1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u,i)=>(
                    <tr key={u.id} style={{ borderBottom:`1px solid ${C.border}`, background: i%2===0 ? C.surface : C.bg }}>
                      <td style={{ padding:"13px 16px", fontWeight:600, color:C.text }}>
                        <div style={{ ...row({ gap:10 }) }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background: u.role==="admin" ? C.accentL : C.greenL, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color: u.role==="admin" ? C.accent : C.green }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px", color:C.muted, fontFamily:"monospace", fontSize:13 }}>{u.username}</td>
                      <td style={{ padding:"13px 16px" }}>
                        <Badge label={u.role==="admin"?"Admin":"Staff"} bg={u.role==="admin"?C.accentL:C.greenL} color={u.role==="admin"?C.accent:C.green} />
                      </td>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ ...row({ gap:8 }) }}>
                          <Btn small outline onClick={()=>openEdit(u)}>✏️ Edit</Btn>
                          {u.id!==me.id && <Btn small bg={C.red} onClick={()=>del(u.id)}>🗑️</Btn>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length===0 && (
                    <tr><td colSpan={4} style={{ padding:40, textAlign:"center", color:C.muted }}>No users yet. Add one above.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <Modal onClose={()=>setModal(false)}>
          <ModalTitle>{editing ? "Edit User" : "Add New User"}</ModalTitle>
          {err && <div style={{ background:C.redL, color:C.red, borderRadius:8, padding:"9px 12px", fontSize:13, marginBottom:14, fontWeight:500 }}>{err}</div>}
          <Inp label="Full Name" placeholder="e.g. Ahmed Khan" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
          <Inp label="Username" placeholder="e.g. ahmed123" value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} />
          <Inp label="Password" placeholder="Set a password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} />
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:8, letterSpacing:.6, textTransform:"uppercase" }}>Role</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["user","👤 Staff"],["admin","🛡️ Admin"]].map(([v,l])=>(
                <button key={v} onClick={()=>setForm(p=>({...p,role:v}))}
                  style={{ padding:"10px", borderRadius:8, border:`1.5px solid ${form.role===v?C.accent:C.border}`, background:form.role===v?C.accentL:C.surface, color:form.role===v?C.accent:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ ...row({ gap:10 }) }}>
            <Btn full outline onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn full bg={C.accent} loading={busy} disabled={busy} onClick={save}>{!busy&&(editing?"Save Changes":"Create User")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STOCK PAGE
// ══════════════════════════════════════════════════════════════════════════════
function Stock({ me, onLogout, onAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("All");
  const [filter, setFilter]     = useState("all"); // all | low | out
  const [modal, setModal]       = useState(null);  // null | add | edit | adjust
  const [form, setForm]         = useState({});
  const [editId, setEditId]     = useState(null);
  const [adjQty, setAdjQty]     = useState("");
  const [adjType, setAdjType]   = useState("add");
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState("");

  const isAdmin = me.role === "admin";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try { setProducts(await api("products?select=*&order=name.asc")); }
    catch { setErr("Failed to load stock."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const visible = products.filter(p => {
    const q = search.toLowerCase();
    const ms = !q || p.name.toLowerCase().includes(q) || (p.company||"").toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const mc = cat === "All" || p.category === cat;
    const mf = filter==="all" ? true : filter==="low" ? (p.quantity>0&&p.quantity<=LOW) : p.quantity===0;
    return ms && mc && mf;
  });

  const total    = products.reduce((s,p)=>s+p.quantity,0);
  const lowCount = products.filter(p=>p.quantity>0&&p.quantity<=LOW).length;
  const outCount = products.filter(p=>p.quantity===0).length;

  function openAdd()  { setForm({ name:"", company:"", category:"Tiles", quantity:"" }); setErr(""); setModal("add"); }
  function openEdit(p){ setForm({ name:p.name, company:p.company||"", category:p.category, quantity:p.quantity }); setEditId(p.id); setErr(""); setModal("edit"); }
  function openAdj(p) { setEditId(p.id); setAdjQty(""); setAdjType("add"); setErr(""); setModal("adjust"); }

  async function saveProduct() {
    if (!form.name.trim()||!form.company.trim()||form.quantity==="") { setErr("All fields required."); return; }
    setBusy(true); setErr("");
    try {
      if (modal==="add") {
        const rows = await api("products","POST",{ name:form.name.trim(), company:form.company.trim(), category:form.category, quantity:parseInt(form.quantity)||0 });
        setProducts(p=>[...p,rows[0]].sort((a,b)=>a.name.localeCompare(b.name)));
      } else {
        await api(`products?id=eq.${editId}`,"PATCH",{ name:form.name.trim(), company:form.company.trim(), category:form.category, quantity:parseInt(form.quantity)||0 });
        setProducts(p=>p.map(x=>x.id===editId?{...x,...form,quantity:parseInt(form.quantity)||0}:x));
      }
      setModal(null);
    } catch(e) { setErr("Save failed. Try again."); }
    finally { setBusy(false); }
  }

  async function applyAdj() {
    const n = Math.abs(parseInt(adjQty)||0);
    if (!n) { setErr("Enter a valid quantity."); return; }
    const prod = products.find(p=>p.id===editId);
    const newQ = adjType==="add" ? prod.quantity+n : Math.max(0,prod.quantity-n);
    setBusy(true); setErr("");
    try {
      await api(`products?id=eq.${editId}`,"PATCH",{ quantity:newQ });
      setProducts(p=>p.map(x=>x.id===editId?{...x,quantity:newQ}:x));
      setModal(null);
    } catch { setErr("Update failed."); }
    finally { setBusy(false); }
  }

  async function del(id) {
    if (!confirm("Remove this product from stock?")) return;
    try { await api(`products?id=eq.${id}`,"DELETE"); setProducts(p=>p.filter(x=>x.id!==id)); }
    catch { alert("Delete failed."); }
  }

  function badge(qty) {
    if (qty===0)    return { label:"Out of stock", bg:C.redL,    color:C.red    };
    if (qty<=LOW)   return { label:"Low stock",    bg:C.yellowL, color:C.yellow };
    return              { label:"In stock",      bg:C.greenL,  color:C.green  };
  }

  const cur = products.find(p=>p.id===editId);
  const previewQty = cur && adjQty !== "" ? (adjType==="add" ? cur.quantity+(Math.abs(parseInt(adjQty)||0)) : Math.max(0,cur.quantity-(Math.abs(parseInt(adjQty)||0)))) : null;

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:C.bg, minHeight:"100vh" }}>
      {/* Top bar */}
      <div style={{ background:C.dark, padding:"0 24px", height:56, ...row({ justifyContent:"space-between" }) }}>
        <span style={{ fontSize:18, fontWeight:900, color:"#fff", letterSpacing:-.5 }}>🪨 TileStock</span>
        <div style={{ ...row({ gap:10 }) }}>
          <span style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>👤 {me.name}</span>
          {isAdmin && <Btn small bg={C.accent} onClick={onAdmin}>⚙️ Admin</Btn>}
          <Btn small outline onClick={onLogout}>Logout</Btn>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 16px" }}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { n:products.length,         label:"Products",    icon:"📦", accent:C.blue,   bg:C.blueL  },
            { n:total,                   label:"Total Units", icon:"🗃️", accent:C.accent, bg:C.accentL},
            { n:lowCount, click:()=>setFilter("low"), label:"Low Stock",   icon:"⚠️",  accent:C.yellow, bg:C.yellowL},
            { n:outCount, click:()=>setFilter("out"), label:"Out of Stock",icon:"❌",  accent:C.red,    bg:C.redL   },
          ].map((s,i)=>(
            <div key={i} onClick={s.click} style={{ ...card({ padding:"16px 18px", borderLeft:`4px solid ${s.accent}`, cursor:s.click?"pointer":"default" }) }}>
              <div style={{ fontSize:20 }}>{s.icon}</div>
              <div style={{ fontSize:24, fontWeight:800, color:C.text, marginTop:4 }}>{s.n}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ ...card({ padding:"14px 16px", marginBottom:16 }) }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search product or company…"
              style={{ flex:1, minWidth:180, padding:"9px 13px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, outline:"none", fontFamily:"inherit", background:C.surface }}
            />
            <select value={cat} onChange={e=>setCat(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit", background:C.surface, cursor:"pointer" }}>
              {["All",...CATS].map(c=><option key={c}>{c}</option>)}
            </select>
            <div style={{ ...row({ gap:6 }) }}>
              {[["all","All"],["low","⚠️ Low"],["out","❌ Out"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)}
                  style={{ padding:"9px 14px", borderRadius:8, border:`1.5px solid ${filter===v?C.accent:C.border}`, background:filter===v?C.accentL:C.surface, color:filter===v?C.accent:C.muted, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  {l}
                </button>
              ))}
            </div>
            <Btn small bg="#6B7280" onClick={fetchProducts}>🔄</Btn>
            <Btn small bg={C.accent} onClick={openAdd}>
            + Add Product
            </Btn>
          </div>
        </div>

        {/* Table */}
        <div style={card({ overflow:"hidden" })}>
          {loading ? (
            <div style={{ padding:60, textAlign:"center" }}><Spinner size={32} color={C.accent} /></div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                <thead>
                  <tr style={{ background:C.bg }}>
                    {["Product Name","Company","Category","Quantity","Status","Actions"].map(h=>(
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.muted, letterSpacing:.6, textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.length===0 ? (
                    <tr><td colSpan={6} style={{ padding:48, textAlign:"center", color:C.muted }}>
                      {search||cat!=="All"||filter!=="all" ? "No products match your filters." : "No products yet. Add your first product."}
                    </td></tr>
                  ) : visible.map((p,i)=>{
                    const b = badge(p.quantity);
                    return (
                      <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.surface:C.bg }}>
                        <td style={{ padding:"13px 16px", fontWeight:700, color:C.text }}>{p.name}</td>
                        <td style={{ padding:"13px 16px", color:C.muted }}>{p.company}</td>
                        <td style={{ padding:"13px 16px" }}>
                          <Badge label={p.category} bg={C.accentL} color={C.accent} />
                        </td>
                        <td style={{ padding:"13px 16px", fontWeight:800, fontSize:17, color: p.quantity===0?C.red:p.quantity<=LOW?C.yellow:C.text }}>
                          {p.quantity}
                        </td>
                        <td style={{ padding:"13px 16px" }}>
                          <Badge label={b.label} bg={b.bg} color={b.color} />
                        </td>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ ...row({ gap:8 }) }}>
                            <Btn small bg={C.blue} onClick={()=>openAdj(p)}>± Adjust</Btn>
                            {isAdmin && <>
                              <Btn small outline onClick={()=>openEdit(p)}>✏️</Btn>
                              <Btn small bg={C.red} onClick={()=>del(p.id)}>🗑️</Btn>
                            </>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Footer count */}
          {!loading && visible.length>0 && (
            <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.border}`, fontSize:12, color:C.muted }}>
              Showing {visible.length} of {products.length} products
            </div>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {(modal==="add"||modal==="edit") && (
        <Modal onClose={()=>setModal(null)}>
          <ModalTitle>{modal==="add"?"Add New Product":"Edit Product"}</ModalTitle>
          {err && <div style={{ background:C.redL, color:C.red, borderRadius:8, padding:"9px 12px", fontSize:13, marginBottom:14, fontWeight:500 }}>{err}</div>}
          <Inp label="Product Name" placeholder="e.g. Glossy Marble 60×60" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
          <Inp label="Company Name" placeholder="e.g. RAK Ceramics" value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} />
          <Inp label="Quantity" type="number" placeholder="0" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} />
          <Sel label="Category" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </Sel>
          <div style={{ ...row({ gap:10 }), marginTop:4 }}>
            <Btn full outline onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn full bg={C.accent} loading={busy} disabled={busy} onClick={saveProduct}>{!busy&&(modal==="add"?"Add Product":"Save Changes")}</Btn>
          </div>
        </Modal>
      )}

      {/* ── ADJUST MODAL ── */}
      {modal==="adjust" && cur && (
        <Modal onClose={()=>setModal(null)}>
          <ModalTitle>Adjust Stock</ModalTitle>
          <div style={{ background:C.bg, borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
            <div style={{ fontSize:13, color:C.muted, marginBottom:2 }}>Product</div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{cur.name}</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>Current quantity: <b style={{ color:C.text, fontSize:18 }}>{cur.quantity}</b></div>
          </div>
          {err && <div style={{ background:C.redL, color:C.red, borderRadius:8, padding:"9px 12px", fontSize:13, marginBottom:14, fontWeight:500 }}>{err}</div>}

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:8, letterSpacing:.6, textTransform:"uppercase" }}>Action</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["add","➕ Add Stock"],["remove","➖ Remove Stock"]].map(([v,l])=>(
                <button key={v} onClick={()=>setAdjType(v)}
                  style={{ padding:"11px", borderRadius:8, border:`1.5px solid ${adjType===v?(v==="add"?C.green:C.red):C.border}`, background:adjType===v?(v==="add"?C.greenL:C.redL):C.surface, color:adjType===v?(v==="add"?C.green:C.red):C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Inp label="Quantity" type="number" min={0} placeholder="Enter quantity" value={adjQty} onChange={e=>{setAdjQty(e.target.value);setErr("");}} />

          {previewQty !== null && (
            <div style={{ background: previewQty===0?C.redL:previewQty<=LOW?C.yellowL:C.greenL, borderRadius:8, padding:"11px 14px", marginBottom:16, ...row({ justifyContent:"space-between" }) }}>
              <span style={{ fontSize:13, color:C.muted }}>New quantity will be</span>
              <span style={{ fontSize:20, fontWeight:900, color: previewQty===0?C.red:previewQty<=LOW?C.yellow:C.green }}>{previewQty}</span>
            </div>
          )}

          <div style={{ ...row({ gap:10 }) }}>
            <Btn full outline onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn full bg={adjType==="add"?C.green:C.red} loading={busy} disabled={busy} onClick={applyAdj}>{!busy&&(adjType==="add"?"Add Stock":"Remove Stock")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [me,   setMe]   = useState(()=>{ try{const v=sessionStorage.getItem("ts_user");return v?JSON.parse(v):null;}catch{return null;} });
  const [page, setPage] = useState("stock");

  function login(user) { sessionStorage.setItem("ts_user",JSON.stringify(user)); setMe(user); setPage("stock"); }
  function logout()    { sessionStorage.removeItem("ts_user"); setMe(null); setPage("stock"); }

  if (!me) return <Login onLogin={login} />;
  if (page==="admin" && me.role==="admin") return <Admin me={me} onLogout={logout} onStock={()=>setPage("stock")} />;
  return <Stock me={me} onLogout={logout} onAdmin={()=>setPage("admin")} />;
}
