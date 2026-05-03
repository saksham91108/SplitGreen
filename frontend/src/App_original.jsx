import { useState, useEffect, useRef } from "react";

// ─── PALETTES ─────────────────────────────────────────────────────────────────
const PALETTES = {
  forest: {
    name: "Dark Jungle",
    emoji: "🌿",
    primary:  "#1a6b2a",
    mid:      "#2d9e45",
    light:    "#0d2e14",
    bg:       "#060f08",
    dark:     "#b8f0c4",
    muted:    "#4a8a57",
    border:   "#112418",
    surface:  "#0b1e0e",
    accent:   "#3ddc68",
    particle: "#1a6b2a",
  },
  midnight: {
    name: "Midnight",
    emoji: "🌙",
    primary:  "#7C6EDB",
    mid:      "#A898F0",
    light:    "#2A2550",
    bg:       "#12102A",
    dark:     "#F0EEFF",
    muted:    "#9B8FC8",
    border:   "#2E2960",
    surface:  "#1E1B42",
    accent:   "#A898F0",
    particle: "#7C6EDB",
  },
  desert: {
    name: "Desert",
    emoji: "🏜️",
    primary:  "#C8844A",
    mid:      "#E0A870",
    light:    "#F5E6D3",
    bg:       "#F7EFE5",
    dark:     "#3A2510",
    muted:    "#8A6040",
    border:   "#DEC8B0",
    surface:  "#FFFAF5",
    accent:   "#A05C2A",
    particle: "#C8844A",
  },
  ocean: {
    name: "Ocean",
    emoji: "🌊",
    primary:  "#2E86AB",
    mid:      "#5BA4C8",
    light:    "#C8E6F4",
    bg:       "#EAF6FB",
    dark:     "#0A2540",
    muted:    "#4A7A9B",
    border:   "#B0D8EC",
    surface:  "#FFFFFF",
    accent:   "#1A5F7A",
    particle: "#2E86AB",
  },
  cherry: {
    name: "Cherry Blossom",
    emoji: "🌸",
    primary:  "#D45C7A",
    mid:      "#E88FA4",
    light:    "#FCE4EC",
    bg:       "#FFF0F4",
    dark:     "#3A0A18",
    muted:    "#9A4460",
    border:   "#F0C0CF",
    surface:  "#FFFFFF",
    accent:   "#A82048",
    particle: "#D45C7A",
  },
  slate: {
    name: "Slate",
    emoji: "🪨",
    primary:  "#4A6080",
    mid:      "#7090B0",
    light:    "#D0DCE8",
    bg:       "#1A2030",
    dark:     "#E8EEF4",
    muted:    "#8090A8",
    border:   "#283848",
    surface:  "#222C3C",
    accent:   "#90B0D0",
    particle: "#4A6080",
  },
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INITIAL_GROUPS = [
  {
    id: 1, name: "Trip to Goa", emoji: "🏖️",
    members: [
      { name: "You",   role: "admin",  contribution: 5000 },
      { name: "Rahul", role: "member", contribution: 2500 },
      { name: "Priya", role: "member", contribution: 1500 },
      { name: "Amit",  role: "member", contribution: 500  },
    ],
    balance: 450,
    expenses: [
      { id: 1, desc: "Hotel Booking", amount: 4500, paidBy: "You",   date: "Dec 01", cat: "🏨" },
      { id: 2, desc: "Dinner",        amount: 1800, paidBy: "Rahul", date: "Dec 02", cat: "🍽️" },
      { id: 3, desc: "Scuba Diving",  amount: 2200, paidBy: "Amit",  date: "Dec 03", cat: "🤿" },
    ],
  },
  {
    id: 2, name: "Flat Expenses", emoji: "🏠",
    members: [
      { name: "You",   role: "member", contribution: 800  },
      { name: "Vikas", role: "admin",  contribution: 1200 },
      { name: "Sneha", role: "member", contribution: 1000 },
    ],
    balance: -280,
    expenses: [
      { id: 4, desc: "Electricity", amount: 2200, paidBy: "Vikas", date: "Nov 30", cat: "⚡" },
      { id: 5, desc: "Groceries",   amount: 850,  paidBy: "You",   date: "Nov 28", cat: "🛒" },
      { id: 6, desc: "Internet",    amount: 999,  paidBy: "Vikas", date: "Nov 25", cat: "📡" },
    ],
  },
  {
    id: 3, name: "Office Lunch", emoji: "🍱",
    members: [
      { name: "You",   role: "admin",  contribution: 600 },
      { name: "Divya", role: "member", contribution: 400 },
      { name: "Rajan", role: "member", contribution: 520 },
    ],
    balance: 130,
    expenses: [
      { id: 7, desc: "Team Lunch",  amount: 1200, paidBy: "You",   date: "Nov 27", cat: "🍽️" },
      { id: 8, desc: "Snacks",      amount: 320,  paidBy: "Divya", date: "Nov 26", cat: "🍿" },
    ],
  },
];

// ─── PIXEL RAIN (landing bg only) ────────────────────────────────────────────
function PixelRain({ C }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const hex2rgb = h => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
    const col = hex2rgb(C.particle || "#4a8a57");
    const COLS = 60;
    const drops = Array.from({length:COLS}, () => Math.random() * -80);
    const chars = "₹$01✓△◇●■▲SPLIT".split("");
    const colW = () => canvas.width / COLS;

    const draw = () => {
      ctx.fillStyle = `rgba(${Math.max(0,col.r-70)},${Math.max(0,col.g-70)},${Math.max(0,col.b-70)},0.04)`;
      ctx.fillRect(0,0,canvas.width,canvas.height);
      const cw = colW();
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random()*chars.length)];
        const alpha = Math.random()*0.5+0.08;
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
        ctx.font = `${Math.floor(Math.random()*5)+9}px monospace`;
        ctx.fillText(ch, i*cw + Math.random()*4, y*16);
        if (y*16 > canvas.height && Math.random() > 0.97) drops[i] = 0;
        drops[i] += 0.5 + Math.random()*0.3;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [C.particle]);

  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0 }}/>;
}

// ─── PARTICLES (dashboard bg) ─────────────────────────────────────────────────
function Particles({ C }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const hex2rgb = h => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
    const col = hex2rgb(C.particle);
    const pts = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i=0; i<55; i++) pts.push({ x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, r:Math.random()*2.5+0.5, dx:(Math.random()-.5)*.35, dy:(Math.random()-.5)*.35, a:Math.random()*.45+.08 });
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (const p of pts) {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${col.r},${col.g},${col.b},${p.a})`; ctx.fill();
        p.x+=p.dx; p.y+=p.dy;
        if(p.x<0||p.x>canvas.width) p.dx*=-1;
        if(p.y<0||p.y>canvas.height) p.dy*=-1;
      }
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
        if(d<110){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(${col.r},${col.g},${col.b},${.07*(1-d/110)})`;ctx.lineWidth=.8;ctx.stroke();}
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [C.particle]);
  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0 }}/>;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const buildStyle = (C) => `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Sora',sans-serif;background:${C.bg};color:${C.dark};}
button,input,select,textarea{font-family:'Sora',sans-serif;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:${C.mid};border-radius:99px;}
:focus-visible{outline:2px solid ${C.primary};outline-offset:2px;}
.fade{animation:fade .4s ease both;}
@keyframes fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.pop{animation:pop .3s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes pop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
.inp{width:100%;background:${C.surface};border:1.5px solid ${C.border};border-radius:10px;padding:11px 14px;font-size:14px;color:${C.dark};outline:none;transition:border .2s;}
.inp:focus{border-color:${C.primary};box-shadow:0 0 0 3px ${C.primary}28;}
.card{background:${C.surface};border:1px solid ${C.border};border-radius:18px;padding:20px;}
.btn-p{background:${C.primary};color:#fff;border:none;padding:11px 24px;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;transition:all .2s;}
.btn-p:hover{opacity:.88;transform:translateY(-1px);}
.btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-o{background:transparent;color:${C.primary};border:1.5px solid ${C.primary};padding:9px 22px;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;transition:all .2s;}
.btn-o:hover{background:${C.light};}
.btn-g{background:transparent;border:none;color:${C.muted};padding:8px 14px;border-radius:8px;cursor:pointer;transition:all .2s;font-size:14px;}
.btn-g:hover{background:${C.light};color:${C.dark};}
.btn-danger{background:#e05555;color:#fff;border:none;padding:8px 16px;border-radius:9px;cursor:pointer;font-weight:600;font-size:13px;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);}
.modal{background:${C.surface};border-radius:20px;padding:28px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;border:1px solid ${C.border};}
.nav-i{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:10px;margin:2px 6px;color:${C.muted};font-weight:500;font-size:14px;transition:all .2s;cursor:pointer;border:none;background:transparent;width:calc(100% - 12px);text-align:left;}
.nav-i:hover{background:${C.light};color:${C.accent};}
.nav-i.act{background:${C.primary};color:#fff;}
.toast{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 20px;border-radius:12px;font-weight:500;font-size:14px;animation:slideUp .3s ease;}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.ts{background:${C.primary};color:#fff;}
.te{background:#e05555;color:#fff;}
.badge-g{background:${C.light};color:${C.accent};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;}
.badge-r{background:#2d0a0a;color:#ff6b6b;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;}
.shimmer{background:linear-gradient(90deg,${C.border} 25%,${C.light} 50%,${C.border} 75%);background-size:200% 100%;animation:sh 1.4s infinite;}
@keyframes sh{0%{background-position:-200% 0}100%{background-position:200% 0}}
.sidebar{width:240px;min-width:240px;background:${C.surface};border-right:1px solid ${C.border};height:100vh;position:sticky;top:0;display:flex;flex-direction:column;}
.prog{height:6px;border-radius:999px;background:${C.border};overflow:hidden;}
.prog-f{height:100%;border-radius:999px;background:linear-gradient(90deg,${C.primary},${C.mid});}
.tog{width:44px;height:24px;border-radius:999px;border:none;cursor:pointer;position:relative;transition:background .3s;}
.tog-k{width:17px;height:17px;border-radius:50%;background:#fff;position:absolute;top:3.5px;transition:left .3s;box-shadow:0 1px 3px rgba(0,0,0,.2);}
@media(max-width:860px){.sidebar{display:none;}}
/* Receipt scan animation */
@keyframes scanLine{0%{top:0}100%{top:100%}}
.scan-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${C.primary},transparent);animation:scanLine 1.5s ease-in-out infinite;}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast ${type==="success"?"ts":"te"}`}>
      {type==="success"?"✅":"❌"} {msg}
      <button onClick={onClose} style={{ background:"none",border:"none",color:"inherit",marginLeft:8,cursor:"pointer",fontSize:18 }}>×</button>
    </div>
  );
}
function Toggle({ on, set, C }) {
  return (
    <button className="tog" style={{ background:on?C.primary:C.border }} onClick={() => set(!on)}>
      <div className="tog-k" style={{ left:on?24:3.5 }}/>
    </button>
  );
}
function Skeleton({ h=80, r=14 }) {
  return <div className="shimmer" style={{ height:h,borderRadius:r }}/>;
}

// ─── RECEIPT SCANNER MODAL ────────────────────────────────────────────────────
function ReceiptScannerModal({ onClose, groups, showToast, C }) {
  const [stage, setStage] = useState("upload"); // upload | scanning | result | split
  const [dragOver, setDragOver] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || null);
  const [splitMode, setSplitMode] = useState("equal");
  const [customSplits, setCustomSplits] = useState({});
  const fileRef = useRef(null);

  const fakeReceipts = [
    { restaurant:"Spice Garden", items:[{n:"Butter Chicken",p:340},{n:"Dal Makhani",p:220},{n:"Naan x4",p:120},{n:"Lassi x2",p:160},{n:"Service Charge",p:84}], total:924, date:"Apr 15" },
    { restaurant:"Café Central", items:[{n:"Cappuccino x3",p:450},{n:"Sandwich x2",p:360},{n:"Pastry",p:120},{n:"GST",p:93}], total:1023, date:"Apr 14" },
    { restaurant:"Pizza Point", items:[{n:"Margherita (L)",p:480},{n:"Pepperoni (M)",p:420},{n:"Garlic Bread",p:150},{n:"Coke x4",p:200},{n:"Delivery",p:49}], total:1299, date:"Apr 13" },
  ];

  const handleFile = () => {
    setStage("scanning");
    setTimeout(() => {
      const r = fakeReceipts[Math.floor(Math.random()*fakeReceipts.length)];
      setScannedData(r);
      const grp = groups.find(g => g.id === selectedGroup);
      if (grp) {
        const init = {};
        grp.members.forEach(m => { init[m.name] = Math.round(r.total / grp.members.length); });
        setCustomSplits(init);
      }
      setStage("result");
    }, 2200);
  };

  const grp = groups.find(g => g.id === selectedGroup);
  const totalCustom = Object.values(customSplits).reduce((a,b) => a+Number(b), 0);
  const remainder = scannedData ? scannedData.total - totalCustom : 0;

  const applyEqualSplit = () => {
    if (!grp || !scannedData) return;
    const init = {};
    grp.members.forEach(m => { init[m.name] = Math.round(scannedData.total / grp.members.length); });
    setCustomSplits(init);
  };

  useEffect(() => {
    if (splitMode === "equal" && grp && scannedData) applyEqualSplit();
  }, [splitMode, selectedGroup]);

  const confirm = () => {
    showToast(`₹${scannedData.total} from ${scannedData.restaurant} split among ${grp?.members.length} members! 🧾`, "success");
    onClose();
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal pop" style={{ maxWidth:540 }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:22 }}>🧾</span>
            <h2 style={{ fontWeight:800,fontSize:"1.15rem",color:C.dark }}>Scan Receipt</h2>
          </div>
          <button className="btn-g" style={{ fontSize:20 }} onClick={onClose}>×</button>
        </div>

        {/* Group selector */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12,fontWeight:700,color:C.muted,display:"block",marginBottom:6 }}>SPLIT IN GROUP</label>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {groups.map(g => (
              <button key={g.id} onClick={() => setSelectedGroup(g.id)}
                style={{ padding:"6px 14px",borderRadius:99,border:`1.5px solid ${selectedGroup===g.id?C.primary:C.border}`,background:selectedGroup===g.id?C.primary:"transparent",color:selectedGroup===g.id?"#fff":C.dark,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .2s" }}>
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
        </div>

        {stage === "upload" && (
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleFile();}}
            onClick={() => fileRef.current?.click()}
            style={{ border:`2px dashed ${dragOver?C.primary:C.border}`,borderRadius:16,padding:"48px 24px",textAlign:"center",cursor:"pointer",transition:"all .2s",background:dragOver?`${C.primary}12`:"transparent" }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
            <div style={{ fontSize:48,marginBottom:12 }}>📸</div>
            <div style={{ fontWeight:700,fontSize:15,color:C.dark,marginBottom:6 }}>Drop receipt image here</div>
            <div style={{ fontSize:13,color:C.muted,marginBottom:20 }}>or click to browse • JPG, PNG, HEIC</div>
            <button className="btn-p" onClick={e=>{e.stopPropagation();handleFile();}}>Use Demo Receipt →</button>
          </div>
        )}

        {stage === "scanning" && (
          <div style={{ textAlign:"center",padding:"48px 0" }}>
            <div style={{ width:80,height:80,border:`3px solid ${C.border}`,borderRadius:12,margin:"0 auto 20px",position:"relative",overflow:"hidden",background:C.bg }}>
              <div style={{ position:"absolute",inset:0,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:2,padding:8 }}>
                {Array.from({length:36}).map((_,i) => <div key={i} style={{ background:C.border,borderRadius:2 }}/>)}
              </div>
              <div className="scan-line"/>
            </div>
            <div style={{ fontWeight:700,fontSize:15,color:C.dark,marginBottom:4 }}>Scanning receipt…</div>
            <div style={{ fontSize:13,color:C.muted }}>Extracting line items & amounts</div>
          </div>
        )}

        {stage === "result" && scannedData && (
          <div>
            {/* Scanned items */}
            <div className="card" style={{ padding:0,overflow:"hidden",marginBottom:16 }}>
              <div style={{ padding:"12px 16px",background:`linear-gradient(135deg,${C.primary},${C.mid})`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:14,color:"#fff" }}>{scannedData.restaurant}</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.7)" }}>{scannedData.date}</div>
                </div>
                <div style={{ fontWeight:800,fontSize:"1.2rem",color:"#fff" }}>₹{scannedData.total}</div>
              </div>
              {scannedData.items.map((it,i) => (
                <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"9px 16px",borderBottom:i<scannedData.items.length-1?`1px solid ${C.border}`:"none",fontSize:13 }}>
                  <span style={{ color:C.dark }}>{it.n}</span>
                  <span style={{ fontWeight:600,color:C.dark }}>₹{it.p}</span>
                </div>
              ))}
            </div>

            {/* Split mode */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                {["equal","custom"].map(m => (
                  <button key={m} onClick={()=>setSplitMode(m)}
                    style={{ flex:1,padding:"8px",borderRadius:9,border:`1.5px solid ${splitMode===m?C.primary:C.border}`,background:splitMode===m?C.primary:"transparent",color:splitMode===m?"#fff":C.dark,fontWeight:600,fontSize:13,cursor:"pointer",textTransform:"capitalize",transition:"all .2s" }}>
                    {m === "equal" ? "⚖️ Equal Split" : "✏️ Custom Split"}
                  </button>
                ))}
              </div>

              {grp && splitMode === "custom" && (
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {grp.members.map(m => (
                    <div key={m.name} style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:28,height:28,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,flexShrink:0 }}>{m.name[0]}</div>
                      <span style={{ flex:1,fontSize:13,fontWeight:600,color:C.dark }}>{m.name}</span>
                      <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                        <span style={{ fontSize:13,color:C.muted }}>₹</span>
                        <input type="number" className="inp" style={{ width:90,padding:"6px 10px",fontSize:13 }}
                          value={customSplits[m.name] || ""} onChange={e => setCustomSplits(s => ({...s,[m.name]:e.target.value}))}/>
                      </div>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:9,background:Math.abs(remainder)>1?"#2d0a0a":C.light,marginTop:4 }}>
                    <span style={{ fontSize:12,fontWeight:600,color:Math.abs(remainder)>1?"#ff6b6b":C.accent }}>
                      {Math.abs(remainder) <= 1 ? "✓ Total matches!" : remainder > 0 ? `₹${remainder} unassigned` : `₹${Math.abs(remainder)} over-assigned`}
                    </span>
                    <span style={{ fontSize:12,fontWeight:700,color:C.dark }}>₹{totalCustom} / ₹{scannedData.total}</span>
                  </div>
                </div>
              )}

              {grp && splitMode === "equal" && (
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {grp.members.map(m => (
                    <div key={m.name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:9,background:C.bg }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:26,height:26,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:11 }}>{m.name[0]}</div>
                        <span style={{ fontSize:13,fontWeight:600,color:C.dark }}>{m.name}</span>
                      </div>
                      <span style={{ fontSize:13,fontWeight:700,color:C.accent }}>₹{Math.round(scannedData.total/grp.members.length)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display:"flex",gap:10 }}>
              <button className="btn-p" style={{ flex:1 }} onClick={confirm} disabled={splitMode==="custom"&&Math.abs(remainder)>2}>
                ✓ Add to Group
              </button>
              <button className="btn-o" onClick={() => setStage("upload")}>Re-scan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ setPage, user, setUser, showToast, C, palette, setPalette }) {
  const [showPalette, setShowPalette] = useState(false);
  return (
    <nav style={{ position:"sticky",top:0,zIndex:100,background:C.surface,borderBottom:`1px solid ${C.border}`,height:60,display:"flex",alignItems:"center",padding:"0 24px",gap:14 }}>
      <button onClick={() => setPage(user?"dashboard":"landing")} style={{ display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer" }}>
        <div style={{ width:34,height:34,borderRadius:10,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>💚</div>
        <span style={{ fontWeight:800,fontSize:16,color:C.dark }}>SplitGreen</span>
      </button>
      <div style={{ flex:1 }}/>
      <div style={{ position:"relative" }}>
        <button onClick={() => setShowPalette(p=>!p)} title="Change colour palette"
          style={{ width:34,height:34,borderRadius:10,background:C.light,border:`1.5px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>
          🎨
        </button>
        {showPalette && (
          <div style={{ position:"absolute",top:42,right:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:14,minWidth:200,boxShadow:"0 8px 32px rgba(0,0,0,.2)",zIndex:200 }}>
            <div style={{ fontSize:12,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:.5 }}>COLOUR PALETTE</div>
            {Object.entries(PALETTES).map(([key, p]) => (
              <button key={key} onClick={() => { setPalette(key); setShowPalette(false); showToast(`${p.emoji} ${p.name} palette applied!`,"success"); }}
                style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,border:"none",background:palette===key?C.light:"transparent",width:"100%",cursor:"pointer",transition:"background .15s" }}>
                <div style={{ width:22,height:22,borderRadius:"50%",background:p.primary,border:`2px solid ${palette===key?C.accent:C.border}` }}/>
                <span style={{ fontSize:13,fontWeight:palette===key?700:500,color:C.dark }}>{p.emoji} {p.name}</span>
                {palette===key && <span style={{ marginLeft:"auto",fontSize:12,color:C.accent }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      {!user ? (
        <div style={{ display:"flex",gap:10 }}>
          <button className="btn-g" onClick={() => setPage("signin")}>Sign In</button>
          <button className="btn-p" onClick={() => setPage("signup")}>Get Started</button>
        </div>
      ) : (
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <button onClick={() => setPage("dashboard")} style={{ width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary},${C.mid})`,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:15 }}>
            {(user.name||"U")[0]}
          </button>
          <button 
          className="btn-g" 
          onClick={async () => 
            {
              try { await api.logout(); } catch {}
              localStorage.removeItem("access_token");
              localStorage.removeItem("user");
              setUser(null);
              setPage("landing");
              showToast("Signed out","success");
            }
          }>Sign out</button>
        </div>
      )}
    </nav>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ setPage, C }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x:0,y:0 });
  const [hovering, setHovering] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const animRef = useRef(null);
  const cur = useRef({ x:0,y:0 });

  const onMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx=(e.clientX-rect.left-rect.width/2)/(rect.width/2);
    const dy=(e.clientY-rect.top-rect.height/2)/(rect.height/2);
    const tx=dy*-12, ty=dx*12;
    if(animRef.current) cancelAnimationFrame(animRef.current);
    const go = () => { cur.current.x+=(tx-cur.current.x)*.12; cur.current.y+=(ty-cur.current.y)*.12; setTilt({x:cur.current.x,y:cur.current.y}); animRef.current=requestAnimationFrame(go); };
    animRef.current=requestAnimationFrame(go);
  };
  const onLeave = () => {
    setHovering(false);
    if(animRef.current) cancelAnimationFrame(animRef.current);
    const ease=()=>{ cur.current.x+=(0-cur.current.x)*.08; cur.current.y+=(0-cur.current.y)*.08; setTilt({x:cur.current.x,y:cur.current.y}); if(Math.abs(cur.current.x)>.05||Math.abs(cur.current.y)>.05) animRef.current=requestAnimationFrame(ease); else setTilt({x:0,y:0}); };
    animRef.current=requestAnimationFrame(ease);
  };
  useEffect(() => () => { if(animRef.current) cancelAnimationFrame(animRef.current); },[]);

  const recent = [
    {icon:"🍕",name:"Pizza Night",     sub:"2h ago",    amt:"+₹350",pos:true},
    {icon:"🚗",name:"Uber to Airport", sub:"Yesterday", amt:"-₹280",pos:false},
    {icon:"🎬",name:"Movie Tickets",   sub:"2 days ago",amt:"+₹180",pos:true},
  ];

  return (
    <div style={{ position:"relative",zIndex:1 }}>
      {/* HERO */}
      <section style={{ padding:"80px 24px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",width:480,height:480,borderRadius:"50%",background:`radial-gradient(circle,${C.primary}18 0%,transparent 70%)`,top:-160,right:-60,pointerEvents:"none" }}/>
        <div style={{ position:"absolute",width:320,height:320,borderRadius:"50%",background:`radial-gradient(circle,${C.mid}11 0%,transparent 70%)`,bottom:-100,left:-40,pointerEvents:"none" }}/>

        <div style={{ maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:60,flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 360px",maxWidth:520 }} className="fade">
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:C.light,color:C.accent,borderRadius:999,padding:"6px 14px",fontSize:13,fontWeight:600,marginBottom:24,border:`1px solid ${C.border}` }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:C.accent }}/>
              Now with AI-powered receipt scanning
            </div>
            <h1 style={{ fontSize:"clamp(2.4rem,5vw,3.8rem)",fontWeight:800,lineHeight:1.1,color:C.dark,marginBottom:20,letterSpacing:"-1.5px" }}>
              Split expenses<br/><span style={{ color:C.accent }}>effortlessly</span>
            </h1>
            <p style={{ fontSize:"1.05rem",color:C.muted,lineHeight:1.85,marginBottom:36,maxWidth:420 }}>
              Track, split, and settle bills with your people. No more awkward money conversations — just scan a receipt and go.
            </p>
            <div style={{ display:"flex",gap:12,flexWrap:"wrap",marginBottom:40 }}>
              <button className="btn-p" style={{ fontSize:15,padding:"13px 28px" }} onClick={() => setPage("signup")}>Get Started Free →</button>
              <button className="btn-o" style={{ fontSize:15,padding:"13px 24px" }} onClick={() => setPage("dashboard")}>▷ Watch Demo</button>
            </div>
            {/* Receipt scan CTA */}
            <button onClick={() => setShowScanner(true)} style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 18px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.surface,cursor:"pointer",transition:"all .2s",width:"100%",maxWidth:340 }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>
              <span style={{ fontSize:22 }}>🧾</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:13,fontWeight:700,color:C.dark }}>Try Receipt Scanner</div>
                <div style={{ fontSize:11,color:C.muted }}>Upload a photo — we'll extract & split the bill</div>
              </div>
              <span style={{ marginLeft:"auto",color:C.muted,fontSize:16 }}>→</span>
            </button>
          </div>

          {/* Tilt card */}
          <div style={{ flex:"1 1 320px",maxWidth:400,position:"relative" }}
            ref={cardRef} onMouseMove={onMove} onMouseEnter={()=>setHovering(true)} onMouseLeave={onLeave}>
            <div style={{ transform:`perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovering?1.02:1})`,transition:hovering?"transform 0.05s":"transform 0.7s cubic-bezier(.22,1,.36,1)",willChange:"transform",borderRadius:22,boxShadow:`0 ${hovering?30:14}px ${hovering?60:28}px ${C.primary}33` }}>
              <div style={{ background:C.surface,borderRadius:22,overflow:"hidden",border:`1px solid ${C.border}` }}>
                <div style={{ background:`linear-gradient(135deg,${C.primary},${C.mid})`,padding:"22px 22px 26px" }}>
                  <div style={{ fontSize:13,color:"rgba(255,255,255,.8)",marginBottom:3 }}>Welcome back,</div>
                  <div style={{ fontSize:20,fontWeight:800,color:"#fff",marginBottom:16 }}>Priya</div>
                  <div style={{ background:"rgba(255,255,255,.18)",borderRadius:12,padding:"13px 16px" }}>
                    <div style={{ fontSize:12,color:"rgba(255,255,255,.8)",marginBottom:3 }}>Your Balance</div>
                    <div style={{ fontSize:"1.7rem",fontWeight:800,color:"#fff" }}>+₹2,450</div>
                    <div style={{ fontSize:12,color:"rgba(255,255,255,.75)",marginTop:3 }}>You are owed money</div>
                  </div>
                </div>
                <div style={{ padding:"8px 14px 18px" }}>
                  <div style={{ fontWeight:700,fontSize:13,marginBottom:8,color:C.dark }}>Recent Activity</div>
                  {recent.map((r,i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<recent.length-1?`1px solid ${C.border}`:"none" }}>
                      <div style={{ width:34,height:34,borderRadius:"50%",background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{r.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600,fontSize:13,color:C.dark }}>{r.name}</div>
                        <div style={{ fontSize:11,color:C.muted,marginTop:1 }}>{r.sub}</div>
                      </div>
                      <div style={{ fontWeight:700,fontSize:13,color:r.pos?"#4a9e5c":"#e05555" }}>{r.amt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background:C.surface,padding:"64px 24px",borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <h2 style={{ textAlign:"center",fontSize:"clamp(1.6rem,3vw,2.4rem)",fontWeight:800,marginBottom:48,color:C.dark }}>
            Everything you need to split fairly
          </h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:24 }}>
            {[
              {icon:"👥",title:"Group Expenses",    desc:"Create groups for trips, roommates, or events."},
              {icon:"🧾",title:"Receipt Scanning",  desc:"Snap a photo of any receipt and we extract every line item automatically."},
              {icon:"⚖️",title:"Custom Splitting",  desc:"Set different contribution amounts per person — totally flexible."},
              {icon:"💸",title:"Easy Settlements",  desc:"See who owes what and record payments with a single tap."},
            ].map((f,i) => (
              <div key={i} className="card" style={{ textAlign:"center" }}>
                <div style={{ fontSize:36,marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontWeight:700,marginBottom:8,fontSize:15,color:C.dark }}>{f.title}</h3>
                <p style={{ fontSize:13,color:C.muted,lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:C.surface,borderTop:`1px solid ${C.border}`,padding:"40px 24px 32px" }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ display:"flex",flexWrap:"wrap",gap:40,marginBottom:36,justifyContent:"space-between" }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                <div style={{ width:30,height:30,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>💚</div>
                <span style={{ fontWeight:800,fontSize:15,color:C.dark }}>SplitGreen</span>
              </div>
              <p style={{ fontSize:13,color:C.muted,maxWidth:220,lineHeight:1.7 }}>The easiest way to split bills with friends, family, and flatmates.</p>
            </div>
            {[
              {title:"Product", links:["Features","Receipt Scanner","Groups","Settlements"]},
              {title:"Support", links:["Help Centre","Privacy Policy","Terms of Service","Contact Us"]},
              {title:"Company", links:["About","Blog","Careers","Press"]},
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:12,fontWeight:700,color:C.muted,marginBottom:12,letterSpacing:.5 }}>{col.title.toUpperCase()}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize:13,color:C.dark,marginBottom:8,cursor:"pointer",opacity:.7,transition:"opacity .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=.7}>{l}</div>
                ))}
              </div>
            ))}
          </div>

          {/* App store badges */}
          <div style={{ display:"flex",gap:12,flexWrap:"wrap",marginBottom:28,alignItems:"center" }}>
            <span style={{ fontSize:13,color:C.muted,fontWeight:600 }}>Get the app:</span>
            {[
              {icon:"🍎",label:"App Store",sub:"iOS"},
              {icon:"🤖",label:"Google Play",sub:"Android"},
              {icon:"🪟",label:"Microsoft Store",sub:"Windows"},
            ].map(s => (
              <button key={s.label} style={{ display:"flex",alignItems:"center",gap:9,padding:"9px 16px",borderRadius:11,border:`1.5px solid ${C.border}`,background:"transparent",cursor:"pointer",transition:"border .2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <span style={{ fontSize:20 }}>{s.icon}</span>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:10,color:C.muted }}>Available on</div>
                  <div style={{ fontSize:13,fontWeight:700,color:C.dark }}>{s.label}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 }}>
            <div style={{ fontSize:12,color:C.muted }}>© 2026 SplitGreen. All rights reserved.</div>
            <div style={{ display:"flex",gap:16 }}>
              {[
                {emoji:"𝕏",label:"Twitter/X"},
                {emoji:"in",label:"LinkedIn"},
                {emoji:"f",label:"Facebook"},
                {emoji:"📸",label:"Instagram"},
              ].map(s => (
                <button key={s.label} style={{ width:34,height:34,borderRadius:"50%",border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:C.muted,transition:"all .2s" }}
                  title={s.label}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                  {s.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {showScanner && (
        <ReceiptScannerModal
          onClose={() => setShowScanner(false)}
          groups={INITIAL_GROUPS}
          showToast={(m,t) => { setShowScanner(false); }}
          C={C}
        />
      )}
    </div>
  );
}

// ─── GOOGLE AUTH HOOK ─────────────────────────────────────────────────────────
function useGoogleAuth(setUser, showToast, setPage) {
  const googleBtnRef = useRef(null);

  useEffect(() => {
    // Load the Google Identity Services script
    if (document.getElementById("gsi-script")) return;
    const script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const signInWithGoogle = () => {
    if (!window.google?.accounts?.id) {
      showToast("Google Sign-In loading, please try again","error");
      return;
    }
    window.google.accounts.id.initialize({
      // Replace with your actual Google Client ID from Google Cloud Console
      client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      callback: (response) => {
        try {
          // Decode JWT payload (base64 middle part)
          const payload = JSON.parse(atob(response.credential.split(".")[1]));
          const googleUser = {
            name: payload.name || "Google User",
            email: payload.email || "",
            picture: payload.picture || "",
            fromGoogle: true,
          };
          setUser(googleUser);
          showToast(`Welcome, ${googleUser.name}! 🎉`, "success");
          setPage("dashboard");
        } catch {
          showToast("Google sign-in failed. Try again.", "error");
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: render button in a hidden div then click it
        const div = document.createElement("div");
        div.style.cssText = "position:fixed;opacity:0;pointer-events:none;top:0;left:0;";
        document.body.appendChild(div);
        window.google.accounts.id.renderButton(div, { type:"standard", size:"large" });
        setTimeout(() => { div.querySelector("div[role='button']")?.click(); }, 100);
        setTimeout(() => document.body.removeChild(div), 3000);
      }
    });
  };

  return { signInWithGoogle };
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ type, setPage, setUser, showToast, C }) {
  const [step, setStep] = useState("main");
  const [form, setForm] = useState({ name:"",email:"",password:"",confirm:"",agree:false,otp:["","","","","",""] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const { signInWithGoogle } = useGoogleAuth(setUser, showToast, setPage);

  const validate = () => {
    const e = {};
    if (type==="signup" && !form.name.trim()) e.name="Name required";
    if (!form.email.includes("@")) e.email="Valid email required";
    if (form.password.length < 8) e.password="Min 8 characters";
    if (type==="signup" && form.password!==form.confirm) e.confirm="Passwords don't match";
    if (type==="signup" && !form.agree) e.agree="Please accept terms";
    return e;
  };
  const submit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1000);
  };
  const handleOtp = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const otp = [...form.otp]; otp[idx] = val;
    setForm(f => ({...f,otp}));
    if (val && idx < 5) otpRefs.current[idx+1]?.focus();
  };
  const verifyOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser({ name:form.name||"User", email:form.email });
      showToast("Welcome to SplitGreen! 🎉","success");
      setPage("dashboard");
    }, 900);
  };

  if (step==="otp") return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",zIndex:1 }}>
      <div className="card pop" style={{ maxWidth:400,width:"100%",textAlign:"center",padding:32 }}>
        <div style={{ fontSize:44,marginBottom:14 }}>📧</div>
        <h2 style={{ fontWeight:800,fontSize:"1.4rem",marginBottom:8,color:C.dark }}>Verify your email</h2>
        <p style={{ color:C.muted,fontSize:14,marginBottom:28 }}>Enter the 6-digit code sent to <strong>{form.email}</strong></p>
        <div style={{ display:"flex",gap:8,justifyContent:"center",marginBottom:24 }}>
          {form.otp.map((v,i) => (
            <input key={i} ref={el=>otpRefs.current[i]=el} maxLength={1} value={v}
              onChange={e=>handleOtp(e.target.value,i)}
              onKeyDown={e=>e.key==="Backspace"&&!v&&i>0&&otpRefs.current[i-1]?.focus()}
              style={{ width:48,height:56,border:`2px solid ${C.border}`,borderRadius:10,textAlign:"center",fontSize:22,fontWeight:700,background:C.bg,color:C.dark,outline:"none",transition:"border .2s" }}
              onFocus={e=>e.target.style.borderColor=C.primary}
              onBlur={e=>e.target.style.borderColor=C.border}/>
          ))}
        </div>
        <button className="btn-p" style={{ width:"100%",marginBottom:12 }} onClick={verifyOtp} disabled={loading||form.otp.join("").length<6}>
          {loading?"Verifying...":"Verify & Continue →"}
        </button>
        <button className="btn-g" onClick={() => setStep("main")}>← Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",zIndex:1 }}>
      <div className="card pop" style={{ maxWidth:440,width:"100%",padding:32 }}>
        <div style={{ textAlign:"center",marginBottom:24 }}>
          <div style={{ width:48,height:48,borderRadius:14,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 14px" }}>💚</div>
          <h1 style={{ fontWeight:800,fontSize:"1.6rem",marginBottom:6,color:C.dark }}>{type==="signup"?"Create account":"Welcome back"}</h1>
          <p style={{ color:C.muted,fontSize:14 }}>{type==="signup"?"Join 50,000+ users":"Sign in to your account"}</p>
        </div>
        <button onClick={signInWithGoogle}
          style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 16px",border:`1.5px solid ${C.border}`,borderRadius:10,background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:C.dark,transition:"border .2s",width:"100%",marginBottom:14 }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={{flexShrink:0}}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
          <div style={{ flex:1,height:1,background:C.border }}/><span style={{ color:C.muted,fontSize:12 }}>or</span><div style={{ flex:1,height:1,background:C.border }}/>
        </div>
        <form onSubmit={submit}>
          {type==="signup" && (
            <div style={{ marginBottom:13 }}>
              <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Full name</label>
              <input className="inp" placeholder="Riya Sharma" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
              {errors.name && <div style={{ color:"#e05555",fontSize:12,marginTop:3 }}>{errors.name}</div>}
            </div>
          )}
          <div style={{ marginBottom:13 }}>
            <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Email</label>
            <input className="inp" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            {errors.email && <div style={{ color:"#e05555",fontSize:12,marginTop:3 }}>{errors.email}</div>}
          </div>
          <div style={{ marginBottom:13 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <label style={{ fontSize:13,fontWeight:600,color:C.dark }}>Password</label>
              {type==="signin" && <button type="button" className="btn-g" style={{ fontSize:12,padding:"0 4px" }} onClick={() => showToast("Reset link sent! 📧","success")}>Forgot?</button>}
            </div>
            <input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
            {errors.password && <div style={{ color:"#e05555",fontSize:12,marginTop:3 }}>{errors.password}</div>}
          </div>
          {type==="signup" && <>
            <div style={{ marginBottom:13 }}>
              <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Confirm password</label>
              <input className="inp" type="password" placeholder="••••••••" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))}/>
              {errors.confirm && <div style={{ color:"#e05555",fontSize:12,marginTop:3 }}>{errors.confirm}</div>}
            </div>
            <label style={{ display:"flex",alignItems:"flex-start",gap:9,marginBottom:14,cursor:"pointer",fontSize:13,color:C.dark }}>
              <input type="checkbox" checked={form.agree} onChange={e=>setForm(f=>({...f,agree:e.target.checked}))} style={{ accentColor:C.primary,marginTop:2,flexShrink:0 }}/>
              I agree to the <span style={{ color:C.primary,textDecoration:"underline" }}>Terms</span> and <span style={{ color:C.primary,textDecoration:"underline" }}>Privacy Policy</span>
            </label>
            {errors.agree && <div style={{ color:"#e05555",fontSize:12,marginBottom:10 }}>{errors.agree}</div>}
          </>}
          <button className="btn-p" type="submit" style={{ width:"100%" }} disabled={loading}>
            {loading?"Please wait...":(type==="signup"?"Create Account →":"Sign In →")}
          </button>
        </form>
        <div style={{ textAlign:"center",marginTop:16,fontSize:13,color:C.muted }}>
          {type==="signup"?"Already have an account? ":"Don't have an account? "}
          <button className="btn-g" style={{ fontSize:13,fontWeight:700,color:C.primary,padding:"0 4px" }} onClick={() => setPage(type==="signup"?"signin":"signup")}>
            {type==="signup"?"Sign in":"Sign up free"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, setPage, showToast, C }) {
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expForm, setExpForm] = useState({ desc:"",amount:"",group:"Trip to Goa",paidBy:"You",split:"equally" });

  useEffect(() => { setTimeout(() => setLoading(false), 900); }, []);

  const navItems = [
    {icon:"📊",label:"Overview",   key:"overview"},
    {icon:"👥",label:"Groups",     key:"groups"},
    {icon:"💳",label:"Expenses",   key:"expenses"},
    {icon:"💸",label:"Settlements",key:"settlements"},
    {icon:"⚙️",label:"Settings",  key:"settings"},
  ];

  const addExp = e => {
    e.preventDefault(); setModal(false);
    showToast(`"${expForm.desc}" added!`,"success");
    setExpForm({ desc:"",amount:"",group:"Trip to Goa",paidBy:"You",split:"equally" });
  };

  return (
    <div style={{ display:"flex",minHeight:"calc(100vh - 60px)" }}>
      <aside className="sidebar">
        <div style={{ padding:"16px 12px 10px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.bg,borderRadius:12,marginBottom:4 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary},${C.mid})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:16 }}>
              {(user?.name||"U")[0]}
            </div>
            <div>
              <div style={{ fontWeight:700,fontSize:13,color:C.dark }}>{user?.name||"User"}</div>
              <div style={{ fontSize:11,color:C.muted }}>Free plan</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1,padding:"0 4px" }}>
          {navItems.map(n => (
            <button key={n.key} className={`nav-i ${tab===n.key?"act":""}`} onClick={() => { setTab(n.key); setSelectedGroup(null); }}>
              <span style={{ fontSize:17 }}>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding:12 }}>
          <div style={{ background:`linear-gradient(135deg,${C.primary},${C.mid})`,borderRadius:14,padding:"16px 14px",color:"#fff" }}>
            <div style={{ fontSize:12,marginBottom:4,opacity:.8 }}>Net Balance</div>
            <div style={{ fontSize:"1.6rem",fontWeight:800 }}>+₹300</div>
            <div style={{ fontSize:12,marginTop:2,opacity:.8 }}>You are owed</div>
          </div>
        </div>
      </aside>

      <main style={{ flex:1,padding:"22px 24px",overflow:"auto",minWidth:0 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:10 }}>
          <div>
            {selectedGroup ? (
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <button onClick={() => setSelectedGroup(null)} className="btn-g" style={{ padding:"6px 10px",fontSize:18 }}>←</button>
                <h1 style={{ fontSize:"1.5rem",fontWeight:800,color:C.dark }}>{selectedGroup.emoji} {selectedGroup.name}</h1>
              </div>
            ) : (
              <h1 style={{ fontSize:"1.5rem",fontWeight:800,marginBottom:2,color:C.dark }}>
                {tab==="overview"?`Hey ${(user?.name||"there").split(" ")[0]} 👋`:navItems.find(n=>n.key===tab)?.label}
              </h1>
            )}
            {!selectedGroup && <p style={{ color:C.muted,fontSize:13 }}>Wednesday, 15 April 2026</p>}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button className="btn-g" style={{ fontSize:13,display:"flex",alignItems:"center",gap:6 }} onClick={() => setShowReceipt(true)}>🧾 Scan Receipt</button>
            <button className="btn-p" style={{ fontSize:13 }} onClick={() => setModal(true)}>+ Add Expense</button>
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14 }}>
              {[1,2,3,4].map(i=><Skeleton key={i} h={100} r={16}/>)}
            </div>
          </div>
        ) : (
          <div className="fade">
            {tab==="overview"    && <OverviewTab C={C}/>}
            {tab==="groups"      && !selectedGroup && <GroupsTab groups={groups} setGroups={setGroups} setSelectedGroup={setSelectedGroup} showToast={showToast} C={C}/>}
            {tab==="groups"      && selectedGroup  && <GroupDetail group={selectedGroup} setGroup={setSelectedGroup} groups={groups} setGroups={setGroups} showToast={showToast} C={C}/>}
            {tab==="expenses"    && <ExpensesTab showToast={showToast} C={C}/>}
            {tab==="settlements" && <SettlementsTab showToast={showToast} C={C}/>}
            {tab==="settings"    && <SettingsTab user={user} showToast={showToast} C={C}/>}
          </div>
        )}
      </main>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal pop" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h2 style={{ fontWeight:800,fontSize:"1.2rem",color:C.dark }}>Add Expense</h2>
              <button className="btn-g" style={{ fontSize:20 }} onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={addExp}>
              <div style={{ marginBottom:13 }}>
                <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Description</label>
                <input required className="inp" placeholder="e.g. Dinner at restaurant" value={expForm.desc} onChange={e=>setExpForm(f=>({...f,desc:e.target.value}))}/>
              </div>
              <div style={{ marginBottom:13 }}>
                <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Amount (₹)</label>
                <input required className="inp" type="number" placeholder="0.00" value={expForm.amount} onChange={e=>setExpForm(f=>({...f,amount:e.target.value}))}/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:13 }}>
                <div>
                  <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Group</label>
                  <select className="inp" value={expForm.group} onChange={e=>setExpForm(f=>({...f,group:e.target.value}))}>
                    {groups.map(g=><option key={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Paid by</label>
                  <select className="inp" value={expForm.paidBy} onChange={e=>setExpForm(f=>({...f,paidBy:e.target.value}))}>
                    {["You","Rahul","Priya","Amit","Vikas"].map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-p" style={{ width:"100%" }}>Add Expense →</button>
            </form>
          </div>
        </div>
      )}

      {showReceipt && (
        <ReceiptScannerModal onClose={() => setShowReceipt(false)} groups={groups} showToast={showToast} C={C}/>
      )}
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, trend, up, C }) {
  return (
    <div className="card">
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
        <div style={{ fontSize:26 }}>{icon}</div>
        <span style={{ fontSize:12,fontWeight:600,color:up?"#4a9e5c":"#e05555" }}>{trend}</span>
      </div>
      <div style={{ fontSize:"1.45rem",fontWeight:800,marginBottom:3,color:C.dark }}>{value}</div>
      <div style={{ fontSize:12,color:C.muted }}>{label}</div>
    </div>
  );
}
function OverviewTab({ C }) {
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:18 }}>
        <StatCard icon="💰" label="Owed to You"        value="₹1,670" trend="+12%" up={true}  C={C}/>
        <StatCard icon="📤" label="You Owe Others"     value="₹1,000" trend="-8%"  up={false} C={C}/>
        <StatCard icon="✅" label="Settled This Month" value="₹3,200" trend="+24%" up={true}  C={C}/>
        <StatCard icon="👥" label="Active Groups"      value="3"      trend="="    up={true}  C={C}/>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16 }}>
        <div className="card">
          <h3 style={{ fontWeight:700,marginBottom:16,fontSize:15,color:C.dark }}>Monthly Spending</h3>
          <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:140,paddingBottom:20 }}>
            {[{m:"Aug",v:3200},{m:"Sep",v:5100},{m:"Oct",v:2800},{m:"Nov",v:6400},{m:"Dec",v:4100}].map(d => (
              <div key={d.m} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                <div style={{ width:"100%",background:`linear-gradient(180deg,${C.primary},${C.mid})`,borderRadius:"6px 6px 0 0",height:`${(d.v/6400)*100}%`,minHeight:4 }}/>
                <span style={{ fontSize:11,color:C.muted,fontWeight:600 }}>{d.m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontWeight:700,marginBottom:14,fontSize:15,color:C.dark }}>Who Owes You</h3>
          {[{name:"Rahul",value:450},{name:"Priya",value:220},{name:"Amit",value:330}].map(d => (
            <div key={d.name} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                <span style={{ fontSize:13,fontWeight:600,color:C.dark }}>{d.name}</span>
                <span style={{ fontSize:13,fontWeight:700,color:C.accent }}>₹{d.value}</span>
              </div>
              <div className="prog"><div className="prog-f" style={{ width:`${(d.value/450)*100}%` }}/></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 style={{ fontWeight:700,marginBottom:14,fontSize:15,color:C.dark }}>Recent Activity</h3>
        {[
          {icon:"💳",text:"Rahul paid ₹1800 for Dinner",   time:"2h ago"},
          {icon:"✅",text:"Priya settled ₹400 with you",   time:"5h ago"},
          {icon:"➕",text:"Amit added Scuba Diving ₹2200", time:"1d ago"},
          {icon:"💰",text:"You paid ₹4500 for Hotel",      time:"3d ago"},
        ].map((a,i)=>(
          <div key={i} style={{ display:"flex",gap:11,padding:"9px 0",borderBottom:i<3?`1px solid ${C.border}`:"none" }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,color:C.dark }}>{a.text}</div>
              <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GROUPS ───────────────────────────────────────────────────────────────────
function GroupsTab({ groups, setGroups, setSelectedGroup, showToast, C }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14 }}>
        {groups.map(g => {
          const myRole = g.members.find(m=>m.name==="You")?.role;
          const totalContrib = g.members.reduce((s,m)=>s+(m.contribution||0),0);
          return (
            <div key={g.id} className="card" style={{ cursor:"pointer",transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 10px 28px ${C.primary}22`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                <div style={{ fontSize:32 }}>{g.emoji}</div>
                <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                  {myRole==="admin" && <span style={{ background:C.primary,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20 }}>ADMIN</span>}
                  <span className={g.balance>=0?"badge-g":"badge-r"}>{g.balance>=0?"+":""}₹{Math.abs(g.balance)}</span>
                </div>
              </div>
              <div style={{ fontWeight:700,fontSize:15,marginBottom:5,color:C.dark }}>{g.name}</div>
              <div style={{ color:C.muted,fontSize:13,marginBottom:6 }}>{g.expenses.length} expenses · {g.members.length} members</div>
              <div style={{ fontSize:12,color:C.accent,fontWeight:600,marginBottom:14 }}>Total contrib. target: ₹{totalContrib.toLocaleString()}</div>
              <div style={{ display:"flex",marginBottom:14 }}>
                {g.members.slice(0,4).map((m,j)=>(
                  <div key={m.name} style={{ width:28,height:28,borderRadius:"50%",background:j===0?C.primary:C.mid,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,border:`2px solid ${C.surface}`,marginLeft:j?-8:0 }}>{m.name[0]}</div>
                ))}
              </div>
              <button className="btn-o" style={{ width:"100%",fontSize:13 }} onClick={() => setSelectedGroup(g)}>View Details →</button>
            </div>
          );
        })}
        <button style={{ border:`2px dashed ${C.border}`,borderRadius:18,padding:20,background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,color:C.muted,transition:"all .2s",minHeight:180 }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}
          onClick={()=>setShowCreate(true)}>
          <span style={{ fontSize:28 }}>+</span>
          <span style={{ fontWeight:600,fontSize:14 }}>New Group</span>
        </button>
      </div>
      {showCreate && (
        <div className="modal-bg" onClick={()=>setShowCreate(false)}>
          <div className="modal pop" onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontWeight:800,fontSize:"1.2rem",marginBottom:20,color:C.dark }}>Create New Group</h2>
            <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Group Name</label>
            <input className="inp" placeholder="e.g. Weekend Trip" value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} style={{ marginBottom:16 }}/>
            <div style={{ display:"flex",gap:10 }}>
              <button className="btn-p" style={{ flex:1 }} onClick={() => {
                if (!newGroupName.trim()) return;
                setGroups(gs=>[...gs,{ id:Date.now(),name:newGroupName,emoji:"👥",members:[{name:"You",role:"admin",contribution:1000}],balance:0,expenses:[] }]);
                setNewGroupName(""); setShowCreate(false);
                showToast(`Group "${newGroupName}" created!`,"success");
              }}>Create Group</button>
              <button className="btn-o" onClick={()=>setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GROUP DETAIL ─────────────────────────────────────────────────────────────
function GroupDetail({ group, setGroup, groups, setGroups, showToast, C }) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditContribs, setShowEditContribs] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberContrib, setNewMemberContrib] = useState(1000);
  // local editable contributions keyed by name
  const [contribDraft, setContribDraft] = useState(
    Object.fromEntries(group.members.map(m => [m.name, m.contribution || 0]))
  );

  const myRole = group.members.find(m => m.name === "You")?.role;
  const isAdmin = myRole === "admin";

  const totalSpent = group.expenses.reduce((s,e) => s+e.amount, 0);
  const totalContrib = group.members.reduce((s,m) => s+(m.contribution||0), 0);

  const memberStats = group.members.map(m => {
    const paid = group.expenses.filter(e=>e.paidBy===m.name).reduce((s,e)=>s+e.amount, 0);
    const owes = (m.contribution||0) - paid;
    return { ...m, paid, owes };
  });

  const syncGroup = updated => {
    setGroups(gs => gs.map(g => g.id===updated.id ? updated : g));
    setGroup(updated);
  };

  const makeAdmin = name => {
    const updated = { ...group, members: group.members.map(m => ({ ...m, role: m.name===name?"admin":(m.name==="You"?"admin":"member") })) };
    syncGroup(updated); showToast(`${name} is now an admin!`, "success");
  };
  const removeMember = name => {
    if (name==="You") { showToast("You can't remove yourself","error"); return; }
    const updated = { ...group, members: group.members.filter(m=>m.name!==name) };
    syncGroup(updated); showToast(`${name} removed`, "success");
  };
  const addMember = () => {
    if (!newMemberName.trim()) return;
    if (group.members.find(m=>m.name===newMemberName)) { showToast("Member already exists","error"); return; }
    const updated = { ...group, members: [...group.members, { name:newMemberName, role:"member", contribution:Number(newMemberContrib) }] };
    syncGroup(updated);
    setContribDraft(d => ({...d,[newMemberName]:Number(newMemberContrib)}));
    setNewMemberName(""); setShowAddMember(false);
    showToast(`${newMemberName} added!`, "success");
  };
  const saveContribs = () => {
    const updated = { ...group, members: group.members.map(m => ({...m, contribution: Number(contribDraft[m.name])||0})) };
    syncGroup(updated); setShowEditContribs(false);
    showToast("Contributions updated! ✅", "success");
  };

  return (
    <div className="fade">
      {/* Summary */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20 }}>
        {[
          {label:"Total Spent",    value:`₹${totalSpent.toLocaleString()}`, icon:"💰"},
          {label:"Total Target",   value:`₹${totalContrib.toLocaleString()}`, icon:"🎯"},
          {label:"Members",        value:`${group.members.length}`, icon:"👥"},
          {label:"Expenses",       value:`${group.expenses.length}`, icon:"📋"},
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:"center",padding:16 }}>
            <div style={{ fontSize:22,marginBottom:5 }}>{s.icon}</div>
            <div style={{ fontWeight:800,fontSize:"1.15rem",color:C.dark }}>{s.value}</div>
            <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16 }}>
        {/* Members & Contributions */}
        <div className="card">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <h3 style={{ fontWeight:700,fontSize:15,color:C.dark }}>👥 Members & Contributions</h3>
            <div style={{ display:"flex",gap:6 }}>
              {isAdmin && <>
                <button className="btn-o" style={{ fontSize:11,padding:"5px 10px" }} onClick={() => { setContribDraft(Object.fromEntries(group.members.map(m=>[m.name,m.contribution||0]))); setShowEditContribs(true); }}>✏️ Edit</button>
                <button className="btn-p" style={{ fontSize:11,padding:"5px 10px" }} onClick={() => setShowAddMember(true)}>+ Add</button>
              </>}
            </div>
          </div>
          {memberStats.map(m => (
            <div key={m.name} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:m.role==="admin"?C.primary:C.mid,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0 }}>{m.name[0]}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                  <span style={{ fontWeight:600,fontSize:13,color:C.dark }}>{m.name}</span>
                  {m.role==="admin" && <span style={{ background:C.primary,color:"#fff",fontSize:9,fontWeight:700,padding:"1px 7px",borderRadius:20 }}>ADMIN</span>}
                </div>
                <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>
                  Target: <strong style={{ color:C.dark }}>₹{(m.contribution||0).toLocaleString()}</strong>
                  {" · "}Paid: <strong style={{ color:C.dark }}>₹{m.paid.toLocaleString()}</strong>
                </div>
                <div style={{ marginTop:5 }}>
                  <div className="prog">
                    <div className="prog-f" style={{ width:`${Math.min(100,m.contribution>0?(m.paid/m.contribution)*100:0)}%` }}/>
                  </div>
                </div>
                <div style={{ fontSize:11,marginTop:3 }}>
                  {m.owes > 0
                    ? <span style={{ color:"#ff6b6b" }}>Still owes ₹{m.owes.toLocaleString()}</span>
                    : <span style={{ color:"#4a9e5c" }}>✓ Contributed ₹{Math.abs(m.owes).toLocaleString()} extra</span>}
                </div>
              </div>
              {isAdmin && m.name !== "You" && (
                <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                  <button onClick={()=>removeMember(m.name)} title="Remove" style={{ fontSize:13,padding:"4px 8px",borderRadius:7,border:"1px solid #3d1010",background:"#2d0a0a",color:"#ff6b6b",cursor:"pointer" }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pending settlements */}
        <div className="card">
          <h3 style={{ fontWeight:700,fontSize:15,marginBottom:16,color:C.dark }}>💸 Pending Settlements</h3>
          {memberStats.filter(m=>m.owes!==0).length===0 ? (
            <div style={{ textAlign:"center",padding:30,color:C.muted }}>
              <div style={{ fontSize:32,marginBottom:8 }}>🎉</div>
              <div style={{ fontSize:14,fontWeight:600 }}>All settled up!</div>
            </div>
          ) : memberStats.filter(m=>m.owes!==0).map(m => (
            <div key={m.name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
              <div>
                <span style={{ fontWeight:600,fontSize:13,color:C.dark }}>{m.name}</span>
                {m.owes>0
                  ? <div style={{ fontSize:12,color:"#ff6b6b",marginTop:2 }}>Owes ₹{m.owes.toLocaleString()}</div>
                  : <div style={{ fontSize:12,color:"#4a9e5c",marginTop:2 }}>To receive ₹{Math.abs(m.owes).toLocaleString()}</div>}
              </div>
              <span className={m.owes>0?"badge-r":"badge-g"}>
                {m.owes>0?`-₹${m.owes.toLocaleString()}`:`+₹${Math.abs(m.owes).toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expense list */}
      <div className="card" style={{ padding:0,overflow:"hidden" }}>
        <div style={{ padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h3 style={{ fontWeight:700,fontSize:15,color:C.dark }}>📋 Expenses</h3>
          <button className="btn-g" style={{ fontSize:12,display:"flex",alignItems:"center",gap:5,padding:"6px 12px" }} onClick={() => setShowReceiptScanner(true)}>
            🧾 Scan Receipt
          </button>
        </div>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["","Description","Amount","Paid By","Date","Your Share"].map((h,i)=>(
                <th key={i} style={{ padding:"10px 16px",textAlign:"left",fontSize:12,fontWeight:700,color:C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.expenses.map(e => (
              <tr key={e.id} style={{ borderTop:`1px solid ${C.border}` }}>
                <td style={{ padding:"12px 16px",fontSize:18 }}>{e.cat}</td>
                <td style={{ padding:"12px 16px",fontWeight:600,fontSize:13,color:C.dark }}>{e.desc}</td>
                <td style={{ padding:"12px 16px",fontWeight:700,fontSize:13,color:C.dark }}>₹{e.amount.toLocaleString()}</td>
                <td style={{ padding:"12px 16px",fontSize:13,color:C.muted }}>{e.paidBy}</td>
                <td style={{ padding:"12px 16px",color:C.muted,fontSize:13 }}>{e.date}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span className={e.paidBy==="You"?"badge-g":"badge-r"}>
                    {e.paidBy==="You"?`+₹${Math.round(e.amount*(1-1/group.members.length))}`:`-₹${Math.round(e.amount/group.members.length)}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {group.expenses.length===0 && <div style={{ textAlign:"center",padding:36,color:C.muted }}>No expenses yet</div>}
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <div className="modal-bg" onClick={()=>setShowAddMember(false)}>
          <div className="modal pop" onClick={e=>e.stopPropagation()} style={{ maxWidth:380 }}>
            <h2 style={{ fontWeight:800,fontSize:"1.1rem",marginBottom:16,color:C.dark }}>Add Member</h2>
            <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Name</label>
            <input className="inp" placeholder="Member name" value={newMemberName} onChange={e=>setNewMemberName(e.target.value)} style={{ marginBottom:12 }}/>
            <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Their Contribution Target (₹)</label>
            <input className="inp" type="number" value={newMemberContrib} onChange={e=>setNewMemberContrib(e.target.value)} style={{ marginBottom:16 }}/>
            <div style={{ display:"flex",gap:10 }}>
              <button className="btn-p" style={{ flex:1 }} onClick={addMember}>Add Member</button>
              <button className="btn-o" onClick={()=>setShowAddMember(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit individual contributions modal */}
      {showEditContribs && (
        <div className="modal-bg" onClick={()=>setShowEditContribs(false)}>
          <div className="modal pop" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
              <h2 style={{ fontWeight:800,fontSize:"1.1rem",color:C.dark }}>Individual Contribution Targets</h2>
              <button className="btn-g" style={{ fontSize:20 }} onClick={()=>setShowEditContribs(false)}>×</button>
            </div>
            <p style={{ color:C.muted,fontSize:13,marginBottom:18 }}>Set a custom contribution amount for each member based on their usage or income.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
              {group.members.map(m => (
                <div key={m.name} style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:34,height:34,borderRadius:"50%",background:m.role==="admin"?C.primary:C.mid,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0 }}>{m.name[0]}</div>
                  <span style={{ flex:1,fontSize:14,fontWeight:600,color:C.dark }}>{m.name}</span>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:14,color:C.muted,fontWeight:700 }}>₹</span>
                    <input type="number" className="inp" style={{ width:110,padding:"7px 10px",fontSize:14 }}
                      value={contribDraft[m.name] ?? ""} onChange={e=>setContribDraft(d=>({...d,[m.name]:e.target.value}))}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:10,background:C.bg,marginBottom:16 }}>
              <span style={{ fontSize:13,color:C.muted }}>Total target</span>
              <span style={{ fontWeight:800,fontSize:15,color:C.accent }}>₹{Object.values(contribDraft).reduce((a,b)=>a+Number(b||0),0).toLocaleString()}</span>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button className="btn-p" style={{ flex:1 }} onClick={saveContribs}>Save Contributions</button>
              <button className="btn-o" onClick={()=>setShowEditContribs(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showReceiptScanner && (
        <ReceiptScannerModal
          onClose={() => setShowReceiptScanner(false)}
          groups={groups}
          showToast={showToast}
          C={C}
        />
      )}
    </div>
  );
}
const ALL_EXPENSES = INITIAL_GROUPS.flatMap(g => g.expenses.map(e => ({...e, group:g.name})));

function ExpensesTab({ showToast, C }) {
  const [search, setSearch] = useState("");
  const filtered = ALL_EXPENSES.filter(e => e.desc.toLowerCase().includes(search.toLowerCase()) || e.group.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap" }}>
        <input className="inp" placeholder="🔍 Search expenses..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }}/>
        <select className="inp" style={{ width:160 }}>
          <option>All Groups</option>
          {INITIAL_GROUPS.map(g=><option key={g.id}>{g.name}</option>)}
        </select>
      </div>
      <div className="card" style={{ padding:0,overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["","Description","Group","Amount","Paid By","Date","Share"].map((h,i)=>(
                <th key={i} style={{ padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:700,color:C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e=>(
              <tr key={e.id} style={{ borderTop:`1px solid ${C.border}`,transition:"background .12s" }}
                onMouseEnter={ev=>ev.currentTarget.style.background=C.bg}
                onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                <td style={{ padding:"12px 16px",fontSize:20 }}>{e.cat}</td>
                <td style={{ padding:"12px 16px",fontWeight:600,fontSize:13,color:C.dark }}>{e.desc}</td>
                <td style={{ padding:"12px 16px",fontSize:13,color:C.muted }}>{e.group}</td>
                <td style={{ padding:"12px 16px",fontWeight:700,fontSize:13,color:C.dark }}>₹{e.amount.toLocaleString()}</td>
                <td style={{ padding:"12px 16px",fontSize:13,color:C.dark }}>{e.paidBy}</td>
                <td style={{ padding:"12px 16px",color:C.muted,fontSize:13 }}>{e.date}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span className={e.paidBy==="You"?"badge-g":"badge-r"}>
                    {e.paidBy==="You"?`+₹${Math.round(e.amount*.75)}`:`-₹${Math.round(e.amount/4)}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{ textAlign:"center",padding:36,color:C.muted }}>No expenses found</div>}
      </div>
    </div>
  );
}

// ─── SETTLEMENTS ──────────────────────────────────────────────────────────────
function SettlementsTab({ showToast, C }) {
  const [done, setDone] = useState([]);
  const list = [
    {from:"Rahul",to:"You",  amount:450,group:"Trip to Goa"},
    {from:"You",  to:"Priya",amount:200,group:"Office Lunch"},
    {from:"Amit", to:"You",  amount:330,group:"Trip to Goa"},
    {from:"You",  to:"Vikas",amount:350,group:"Flat Expenses"},
  ];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
      {list.map((s,i)=>(
        <div key={i} className="card" style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",opacity:done.includes(i)?.45:1,transition:"opacity .3s" }}>
          <div style={{ width:36,height:36,borderRadius:"50%",background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:C.accent }}>{s.from[0]}</div>
          <div style={{ flex:1,minWidth:120 }}>
            <span style={{ fontWeight:600,fontSize:14,color:C.dark }}>{s.from}</span>
            <span style={{ color:C.muted,margin:"0 8px",fontSize:13 }}>→</span>
            <span style={{ fontWeight:600,fontSize:14,color:C.dark }}>{s.to}</span>
            <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{s.group}</div>
          </div>
          <span style={{ fontWeight:800,fontSize:"1.05rem",color:C.dark }}>₹{s.amount}</span>
          {done.includes(i) ? <span style={{ color:"#4a9e5c",fontWeight:700,fontSize:13 }}>✅ Done</span> : (
            <button className="btn-p" style={{ fontSize:13,padding:"8px 18px" }} onClick={() => { setDone(d=>[...d,i]); showToast("Settlement recorded ✅","success"); }}>Record</button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsTab({ user, showToast, C }) {
  const [notif, setNotif]   = useState(true);
  const [currency, setCurrency] = useState("INR ₹");
  return (
    <div style={{ maxWidth:520 }}>
      <div className="card" style={{ marginBottom:14 }}>
        <h3 style={{ fontWeight:700,marginBottom:16,fontSize:15,color:C.dark }}>Profile</h3>
        {[["Full Name","text",user?.name||"Alex"],["Email","email",user?.email||"alex@example.com"]].map(([l,t,v])=>(
          <div key={l} style={{ marginBottom:12 }}>
            <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>{l}</label>
            <input className="inp" type={t} defaultValue={v}/>
          </div>
        ))}
        <button className="btn-p" style={{ fontSize:13,marginTop:6 }} onClick={() => showToast("Profile updated ✅","success")}>Save</button>
      </div>
      <div className="card" style={{ marginBottom:14 }}>
        <h3 style={{ fontWeight:700,marginBottom:14,fontSize:15,color:C.dark }}>Preferences</h3>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontSize:14,color:C.dark }}>Email notifications</span>
          <Toggle on={notif} set={nv=>{setNotif(nv);showToast("Notifications "+(nv?"enabled":"disabled"),nv?"success":"error");}} C={C}/>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0" }}>
          <span style={{ fontSize:14,color:C.dark }}>Currency</span>
          <select className="inp" value={currency} onChange={e=>setCurrency(e.target.value)} style={{ width:"auto",minWidth:110,fontSize:13,padding:"7px 10px" }}>
            {["INR ₹","USD $","EUR €","GBP £"].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="card" style={{ border:"1.5px solid #3d1010" }}>
        <h3 style={{ fontWeight:700,marginBottom:6,color:"#ff6b6b",fontSize:15 }}>Danger Zone</h3>
        <p style={{ color:C.muted,fontSize:13,marginBottom:12 }}>Permanently delete your account and all data.</p>
        <button className="btn-danger" onClick={() => showToast("Contact support to delete account","error")}>Delete Account</button>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]       = useState("landing");
  const [user, setUser]       = useState(null);
  const [toast, setToast]     = useState(null);
  const [palette, setPalette] = useState("forest");
  const C = PALETTES[palette];

  const showToast = (msg, type="success") => setToast({ msg, type });
  const demoUser = user || { name:"Demo User", email:"demo@example.com" };

  const isLanding = page === "landing" || page === "signup" || page === "signin";

  return (
    <div style={{ minHeight:"100vh",background:C.bg,position:"relative" }}>
      <style>{buildStyle(C)}</style>
      {/* Pixel rain on landing/auth, particles on dashboard */}
      {isLanding ? <PixelRain C={C}/> : <Particles C={C}/>}
      <div style={{ position:"relative",zIndex:1 }}>
        <Navbar setPage={setPage} user={user} setUser={setUser} showToast={showToast} C={C} palette={palette} setPalette={setPalette}/>
        {page==="landing"   && <Landing   setPage={setPage} C={C}/>}
        {page==="signup"    && <Auth      type="signup" setPage={setPage} setUser={setUser} showToast={showToast} C={C}/>}
        {page==="signin"    && <Auth      type="signin" setPage={setPage} setUser={setUser} showToast={showToast} C={C}/>}
        {page==="dashboard" && <Dashboard user={demoUser} setPage={setPage} showToast={showToast} C={C}/>}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </div>
  );
}
