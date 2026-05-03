import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "./api";

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
function ReceiptScannerModal({ onClose, groups, showToast, C, currentUserId, onDone }) {
  const [stage, setStage]           = useState("upload");
  const [dragOver, setDragOver]     = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [splitMode, setSplitMode]   = useState("equally");
  const [ocrProgress, setOcrProgress] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  // item_assignments: { item_id: [user_id, ...] }  — used for by_item split
  const [itemAssignments, setItemAssignments] = useState({});
  const fileRef = useRef(null);

  const grp = groups.find(g => g.id === selectedGroupId);

  // When scanned data arrives and we're in by_item mode, init all items → all members
  useEffect(() => {
    if (scannedData && grp && splitMode === "by_item") {
      const init = {};
      (scannedData.items || []).forEach(it => {
        init[String(it.id)] = grp.members.map(m => m.user_id);
      });
      setItemAssignments(init);
    }
  }, [scannedData, splitMode, selectedGroupId]);

  // ── Step 1: Tesseract OCR in browser ──────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    if (!selectedGroupId) { showToast("Select a group first", "error"); return; }
    setStage("ocr"); setErrorMsg(""); setOcrProgress("Loading OCR engine…");
    try {
      // Load Tesseract.js v5 from CDN dynamically — no npm needed
      if (!window.Tesseract) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js";
          s.onload = resolve;
          s.onerror = () => reject(new Error("Failed to load Tesseract.js"));
          document.head.appendChild(s);
        });
      }
      setOcrProgress("Reading receipt image…");
      const result = await window.Tesseract.recognize(file, "eng", {
        logger: m => {
          if (m.status === "recognizing text")
            setOcrProgress(`Reading… ${Math.round((m.progress||0)*100)}%`);
        }
      });
      const rawText = result.data.text;
      if (!rawText || rawText.trim().length < 10)
        throw new Error("Could not read text from image. Try a clearer photo in good lighting.");

      // ── Step 2: Send raw text to Groq via backend ──────────────────────────
      setStage("parsing"); setOcrProgress("Extracting expense items…");
      const parsed = await api.parseReceipt(rawText);
      setScannedData(parsed);
      setStage("result");
    } catch (err) {
      setErrorMsg(err.message || "Scanning failed. Try a clearer image.");
      setStage("upload");
    }
  };

  // ── Step 3: Confirm → backend creates expense + receipt record ─────────────
  const confirm = async () => {
    if (!scannedData || !grp) return;
    setStage("confirming");
    try {
      const memberIds = grp.members.map(m => m.user_id);
      // Build payload — always include item_assignments (even empty) to avoid KeyError
      const payload = {
        group_id:         selectedGroupId,
        paid_by_user_id:  currentUserId,
        date:             scannedData.date || new Date().toISOString().slice(0,10),
        merchant:         scannedData.merchant || "Receipt",
        total:            scannedData.total,
        subtotal:         scannedData.subtotal || scannedData.total,
        tax:              scannedData.tax  || 0,
        tip:              scannedData.tip  || 0,
        items:            (scannedData.items || []).map(it => ({
          id: String(it.id), name: it.name, amount: Number(it.amount),
        })),
        split_type:       splitMode,
        split_members:    memberIds,           // used for equally split
        item_assignments: itemAssignments,     // used for by_item split (always sent)
      };
      const result = await api.confirmReceipt(payload);
      showToast(`✅ ₹${scannedData.total} from "${scannedData.merchant}" added!`, "success");
      if (result.share_link) {
        setTimeout(() => {
          if (window.confirm(`Share receipt breakdown?
${result.share_link}`))
            navigator.clipboard.writeText(result.share_link)
              .then(() => showToast("Link copied! 📋", "success"));
        }, 400);
      }
      onDone ? onDone() : onClose();
    } catch (err) {
      showToast(err.message || "Failed to save receipt", "error");
      setStage("result");
    }
  };

  const toggleItemMember = (itemId, userId) => {
    setItemAssignments(prev => {
      const cur = prev[itemId] || [];
      const next = cur.includes(userId)
        ? cur.filter(u => u !== userId)
        : [...cur, userId];
      // Must have at least 1 person per item
      return { ...prev, [itemId]: next.length > 0 ? next : cur };
    });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal pop" style={{ maxWidth:560 }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:22 }}>🧾</span>
            <h2 style={{ fontWeight:800,fontSize:"1.15rem",color:C.dark }}>Scan Receipt</h2>
          </div>
          <button className="btn-g" style={{ fontSize:20 }} onClick={onClose}>×</button>
        </div>

        {/* Group selector */}
        {groups.length === 0 ? (
          <div style={{ padding:"12px 16px",borderRadius:10,background:C.light,marginBottom:16,fontSize:13,color:C.muted }}>
            ⚠️ Create a group first before scanning a receipt.
          </div>
        ) : (
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12,fontWeight:700,color:C.muted,display:"block",marginBottom:6 }}>SPLIT IN GROUP</label>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {groups.map(g => (
                <button key={g.id} onClick={() => setSelectedGroupId(g.id)}
                  style={{ padding:"6px 14px",borderRadius:99,border:`1.5px solid ${selectedGroupId===g.id?C.primary:C.border}`,background:selectedGroupId===g.id?C.primary:"transparent",color:selectedGroupId===g.id?"#fff":C.dark,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .2s" }}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div style={{ padding:"10px 14px",borderRadius:9,background:"#2d0a0a",color:"#ff6b6b",fontSize:13,marginBottom:14 }}>
            ❌ {errorMsg}
          </div>
        )}

        {/* UPLOAD */}
        {stage === "upload" && (
          <div onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files?.[0];if(f)handleFile(f);}}
            onClick={()=>fileRef.current?.click()}
            style={{ border:`2px dashed ${dragOver?C.primary:C.border}`,borderRadius:16,padding:"48px 24px",textAlign:"center",cursor:"pointer",transition:"all .2s",background:dragOver?`${C.primary}12`:"transparent" }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
              onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
            <div style={{ fontSize:48,marginBottom:12 }}>📸</div>
            <div style={{ fontWeight:700,fontSize:15,color:C.dark,marginBottom:6 }}>Drop receipt image here</div>
            <div style={{ fontSize:13,color:C.muted,marginBottom:4 }}>or click to browse • JPG, PNG, HEIC</div>
            <div style={{ fontSize:11,color:C.muted }}>AI reads and extracts items & totals</div>
          </div>
        )}

        {/* OCR / PARSING progress */}
        {(stage === "ocr" || stage === "parsing") && (
          <div style={{ textAlign:"center",padding:"48px 0" }}>
            <div style={{ width:80,height:80,border:`3px solid ${C.border}`,borderRadius:12,margin:"0 auto 20px",position:"relative",overflow:"hidden",background:C.bg }}>
              <div style={{ position:"absolute",inset:0,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:2,padding:8 }}>
                {Array.from({length:36}).map((_,i) => <div key={i} style={{ background:C.border,borderRadius:2 }}/>)}
              </div>
              <div className="scan-line"/>
            </div>
            <div style={{ fontWeight:700,fontSize:15,color:C.dark,marginBottom:8 }}>
              {stage === "ocr" ? "Reading image…" : "Extracting items with AI…"}
            </div>
            <div style={{ fontSize:13,color:C.muted }}>{ocrProgress}</div>
          </div>
        )}

        {/* CONFIRMING */}
        {stage === "confirming" && (
          <div style={{ textAlign:"center",padding:"48px 0" }}>
            <div style={{ fontSize:40,marginBottom:16 }}>💾</div>
            <div style={{ fontWeight:700,fontSize:15,color:C.dark }}>Saving to group…</div>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && scannedData && (
          <div>
            {/* Parsed receipt */}
            <div className="card" style={{ padding:0,overflow:"hidden",marginBottom:16 }}>
              <div style={{ padding:"12px 16px",background:`linear-gradient(135deg,${C.primary},${C.mid})`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:14,color:"#fff" }}>{scannedData.merchant || "Receipt"}</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.7)" }}>{scannedData.date || "Today"}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:800,fontSize:"1.2rem",color:"#fff" }}>₹{scannedData.total}</div>
                  {scannedData.tax > 0 && <div style={{ fontSize:11,color:"rgba(255,255,255,.7)" }}>incl. tax ₹{scannedData.tax}</div>}
                </div>
              </div>
              <div style={{ maxHeight:160,overflowY:"auto" }}>
                {(scannedData.items||[]).map((it,i) => (
                  <div key={it.id||i} style={{ display:"flex",justifyContent:"space-between",padding:"8px 16px",borderBottom:i<scannedData.items.length-1?`1px solid ${C.border}`:"none",fontSize:13 }}>
                    <span style={{ color:C.dark }}>{it.name}</span>
                    <span style={{ fontWeight:600,color:C.dark }}>₹{Number(it.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Split mode */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12,fontWeight:700,color:C.muted,display:"block",marginBottom:8 }}>HOW TO SPLIT</label>
              <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                {[{v:"equally",l:"⚖️ Equal"},{v:"by_item",l:"🍽️ By Item"}].map(m => (
                  <button key={m.v} onClick={()=>setSplitMode(m.v)}
                    style={{ flex:1,padding:"8px",borderRadius:9,border:`1.5px solid ${splitMode===m.v?C.primary:C.border}`,background:splitMode===m.v?C.primary:"transparent",color:splitMode===m.v?"#fff":C.dark,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .2s" }}>
                    {m.l}
                  </button>
                ))}
              </div>

              {/* Equal split: show per-person amounts */}
              {grp && splitMode === "equally" && (
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {grp.members.map(m => (
                    <div key={m.user_id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:9,background:C.bg }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:26,height:26,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:11 }}>{(m.name||"?")[0]}</div>
                        <span style={{ fontSize:13,fontWeight:600,color:C.dark }}>{m.name}</span>
                      </div>
                      <span style={{ fontSize:13,fontWeight:700,color:C.accent }}>₹{Math.round(scannedData.total/(grp.members.length||1))}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* By-item split: assign each item to members */}
              {grp && splitMode === "by_item" && (
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  <div style={{ fontSize:12,color:C.muted,marginBottom:2 }}>Tap names to toggle who shares each item. Tax & tip distributed proportionally.</div>
                  {(scannedData.items||[]).map(it => (
                    <div key={it.id} style={{ padding:"10px 12px",borderRadius:10,background:C.bg }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                        <span style={{ fontSize:13,fontWeight:600,color:C.dark }}>{it.name}</span>
                        <span style={{ fontSize:13,fontWeight:700,color:C.accent }}>₹{Number(it.amount).toLocaleString()}</span>
                      </div>
                      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                        {grp.members.map(m => {
                          const assigned = (itemAssignments[String(it.id)]||[]).includes(m.user_id);
                          return (
                            <button key={m.user_id} onClick={()=>toggleItemMember(String(it.id), m.user_id)}
                              style={{ padding:"4px 10px",borderRadius:99,border:`1.5px solid ${assigned?C.primary:C.border}`,background:assigned?C.primary:"transparent",color:assigned?"#fff":C.muted,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s" }}>
                              {m.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display:"flex",gap:10 }}>
              <button className="btn-p" style={{ flex:1 }} onClick={confirm}>✓ Add to Group</button>
              <button className="btn-o" onClick={()=>{setStage("upload");setScannedData(null);setErrorMsg("");setItemAssignments({});}}>Re-scan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NOTIFICATION BELL ────────────────────────────────────────────────────────
function NotificationBell({ C, showToast }) {
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState([]);
  const [unread, setUnread]   = useState(0);

  const load = async () => {
    try {
      const data = await api.getNotifications();
      setNotifs(data);
      setUnread(data.filter(n => !n.read).length);
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifs(p => p.map(n => n.id===id ? {...n,read:true} : n));
      setUnread(p => Math.max(0,p-1));
    } catch {}
  };

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifs(p => p.map(n => ({...n,read:true})));
      setUnread(0);
    } catch {}
  };

  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:34,height:34,borderRadius:10,background:C.light,border:`1.5px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,position:"relative" }}>
        🔔
        {unread > 0 && (
          <div style={{ position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"#e05555",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </button>
      {open && (
        <>
          <div style={{ position:"fixed",inset:0,zIndex:199 }} onClick={()=>setOpen(false)}/>
          <div style={{ position:"absolute",top:42,right:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,minWidth:300,maxWidth:340,boxShadow:"0 8px 32px rgba(0,0,0,.25)",zIndex:200,overflow:"hidden" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontWeight:700,fontSize:14,color:C.dark }}>Notifications</span>
              {unread > 0 && <button className="btn-g" style={{ fontSize:11,padding:"3px 8px" }} onClick={markAll}>Mark all read</button>}
            </div>
            <div style={{ maxHeight:340,overflowY:"auto" }}>
              {notifs.length === 0
                ? <div style={{ padding:28,textAlign:"center",color:C.muted,fontSize:13 }}>No notifications yet 🔕</div>
                : notifs.slice(0,20).map(n => (
                  <div key={n.id} onClick={()=>markRead(n.id)}
                    style={{ display:"flex",gap:10,padding:"10px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:n.read?"transparent":`${C.primary}12`,transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                    onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":`${C.primary}12`}>
                    <span style={{ fontSize:18,flexShrink:0 }}>{n.icon}</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,color:C.dark,lineHeight:1.45 }}>{n.text}</div>
                      <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{n.time}</div>
                    </div>
                    {!n.read && <div style={{ width:7,height:7,borderRadius:"50%",background:C.primary,flexShrink:0,marginTop:5 }}/>}
                  </div>
                ))
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ setPage, user, setUser, showToast, C, palette, setPalette, onSignOut }) {
  const [showPalette, setShowPalette] = useState(false);
  return (
    <nav style={{ position:"sticky",top:0,zIndex:100,background:C.surface,borderBottom:`1px solid ${C.border}`,height:60,display:"flex",alignItems:"center",padding:"0 24px",gap:14 }}>
      <button onClick={() => setPage(user?"dashboard":"landing")} style={{ display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer" }}>
        <div style={{ width:34,height:34,borderRadius:10,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff",fontFamily:"serif",letterSpacing:"-1px" }}>₹</div>
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
          <NotificationBell C={C} showToast={showToast}/>
          <button onClick={() => setPage("dashboard")} style={{ width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary},${C.mid})`,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:15 }}>
            {(user.name||"U")[0]}
          </button>
          <button className="btn-g" onClick={onSignOut}>Sign out</button>
        </div>
      )}
    </nav>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ setPage, showToast, C }) {
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
        <div style={{ maxWidth:1100,margin:"0 auto",textAlign:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12,justifyContent:"center" }}>
            <div style={{ width:30,height:30,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>💚</div>
            <span style={{ fontWeight:800,fontSize:15,color:C.dark }}>SplitGreen</span>
          </div>
          <p style={{ fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.7 }}>The easiest way to split bills with friends, family, and flatmates.</p>
          <div style={{ fontSize:12,color:C.muted }}>© 2026 SplitGreen. All rights reserved.</div>
        </div>
      </footer>

      {showScanner && (
        <ReceiptScannerModal
          onClose={() => setShowScanner(false)}
          groups={[]}
          showToast={showToast}
          C={C}
          currentUserId={null}
        />
      )}
    </div>
  );
}

// ─── GOOGLE AUTH HOOK ─────────────────────────────────────────────────────────
// Uses @react-oauth/google (installed, wrapping app in main.jsx).
// The Google button calls signInWithGoogleCredential with the id_token credential
// from Google. We send that credential to our backend /auth/google which verifies
// it server-side and returns our own JWT. Never decode the JWT on the frontend.
function useGoogleAuth(setUser, showToast, setPage) {
  const [googleLoading, setGoogleLoading] = useState(false);

  const signInWithGoogleCredential = async (credentialResponse) => {
    // credentialResponse.credential is the Google ID token (JWT)
    if (!credentialResponse?.credential) {
      showToast("Google sign-in failed. No credential received.", "error");
      return;
    }
    setGoogleLoading(true);
    try {
      const data = await api.googleSignin(credentialResponse.credential);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      showToast(`Welcome, ${data.user.name}! 🎉`, "success");
      setPage("dashboard");
    } catch (err) {
      showToast(err.message || "Google sign-in failed. Try again.", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return { signInWithGoogleCredential, googleLoading };
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ type, setPage, setUser, showToast, C }) {
  const [step, setStep] = useState("main");
  const [form, setForm] = useState({ name:"",email:"",password:"",confirm:"",agree:false,otp:["","","","","",""] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const { signInWithGoogleCredential, googleLoading } = useGoogleAuth(setUser, showToast, setPage);

  const validate = () => {
    const e = {};
    if (type==="signup" && !form.name.trim()) e.name="Name required";
    if (!form.email.includes("@")) e.email="Valid email required";
    if (form.password.length < 8) e.password="Min 8 characters";
    if (type==="signup" && form.password!==form.confirm) e.confirm="Passwords don't match";
    if (type==="signup" && !form.agree) e.agree="Please accept terms";
    return e;
  };

  // ── REAL submit: calls backend signup or signin ───────────────────────────
  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (type === "signup") {
        // Backend sends OTP email, then we move to OTP screen
        await api.signup(form.name, form.email, form.password);
        showToast("Check your email for the 6-digit code! 📧", "success");
        setStep("otp");
      } else {
        // Signin: get token, store it, go to dashboard
        const data = await api.signin(form.email, form.password);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}! 🎉`, "success");
        setPage("dashboard");
      }
    } catch (err) {
      showToast(err.message || "Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const otp = [...form.otp]; otp[idx] = val;
    setForm(f => ({...f,otp}));
    if (val && idx < 5) otpRefs.current[idx+1]?.focus();
  };

  // ── REAL verifyOtp: calls backend, stores token ───────────────────────────
  const verifyOtp = async () => {
    setLoading(true);
    try {
      const data = await api.verifyOtp(form.email, form.otp.join(""));
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      showToast("Welcome to SplitGreen! 🎉", "success");
      setPage("dashboard");
    } catch (err) {
      showToast(err.message || "Invalid or expired OTP. Try again.", "error");
    } finally {
      setLoading(false);
    }
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
        <button className="btn-g" style={{ width:"100%",marginBottom:8 }} onClick={async()=>{
          try { await api.resendOtp(form.email); showToast("New code sent! Check your inbox 📧","success"); }
          catch(err) { showToast(err.message||"Failed to resend","error"); }
        }}>Resend code</button>
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
        {/* GoogleLogin renders the official Google button, handles the popup,
            and calls onSuccess with { credential: "<id_token>" }.
            We pass that id_token straight to our backend /auth/google. */}
        <div style={{ marginBottom:14, display:"flex", justifyContent:"center" }}>
          <GoogleLogin
            onSuccess={signInWithGoogleCredential}
            onError={() => showToast("Google sign-in failed. Try again.", "error")}
            useOneTap={false}
            theme="outline"
            size="large"
            width="376"
            text={type === "signup" ? "signup_with" : "signin_with"}
          />
        </div>
        {googleLoading && (
          <div style={{ textAlign:"center", fontSize:13, color:C.muted, marginBottom:8 }}>
            Signing in with Google…
          </div>
        )}
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
  const [groups, setGroups] = useState([]);
  const [netBalance, setNetBalance] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expForm, setExpForm] = useState({ desc:"",amount:"",groupId:"",paidBy:"",split:"equally",category:"📦",date:new Date().toISOString().slice(0,10), splitData: {} });
  const [expLoading, setExpLoading] = useState(false);

  useEffect(() => {
    api.getGroups().then(data => {
      setGroups(data);
      setNetBalance(data.reduce((s, g) => s + (g.balance || 0), 0));
    }).catch(() => showToast("Failed to load groups","error"))
    .finally(() => setLoading(false));
  }, []);

  const refreshGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
      setNetBalance(data.reduce((s, g) => s + (g.balance || 0), 0));
      if (selectedGroup) {
        const updated = data.find(g => g.id === selectedGroup.id);
        if (updated) setSelectedGroup(updated);
      }
    } catch {}
  };

  // Initialize split_data when group or split type changes
  
  const initializeSplitData = (groupId, splitType, amount) => {
  const group = groups.find(g => g.id === groupId);
  if (!group || splitType === "equally") {
    setExpForm(f => ({...f, splitData: {}}));
    return;
  }

  const members = group.members || [];
  const data = {};
  const amt = amount ? parseFloat(amount) : 0;
  
  if (splitType === "percentage") {
    // Equal percentages by default
    const pct = parseFloat((100 / members.length).toFixed(2));
    members.forEach((m, i) => {
      data[m.user_id] = i === 0 ? parseFloat((100 - pct * (members.length - 1)).toFixed(2)) : pct;
    });
  } else if (splitType === "exact") {
    // Equal amounts by default
    const perPerson = parseFloat((amt / members.length).toFixed(2));
    members.forEach((m, i) => {
      data[m.user_id] = i === 0 ? parseFloat((amt - perPerson * (members.length - 1)).toFixed(2)) : perPerson;
    });
  } else if (splitType === "shares") {
    // 1 share per person by default
    members.forEach(m => {
      data[m.user_id] = 1;
    });
  }
  
  setExpForm(f => ({...f, splitData: data}));
  };

  const navItems = [
    {icon:"📊",label:"Overview",   key:"overview"},
    {icon:"👥",label:"Groups",     key:"groups"},
    {icon:"💳",label:"Expenses",   key:"expenses"},
    {icon:"💸",label:"Settlements",key:"settlements"},
    {icon:"⚙️",label:"Settings",  key:"settings"},
  ];

  const addExp = async e => {
  e.preventDefault();
  if (!expForm.groupId) { showToast("Please select a group","error"); return; }
  
  const group = groups.find(g => g.id === expForm.groupId);
  if (!group) { showToast("Group not found","error"); return; }
  
  // Validate split_data for manual splits
  if (expForm.split !== "equally") {
    const members = group.members || [];
    const splitValues = Object.values(expForm.splitData);
    const total = splitValues.reduce((s, v) => s + parseFloat(v || 0), 0);
    
    // Check all members have values
    const missingMembers = members.filter(m => !expForm.splitData[m.user_id] && expForm.splitData[m.user_id] !== 0);
    if (missingMembers.length > 0) {
      showToast("Please specify amount for all members", "error");
      return;
    }
    
    if (expForm.split === "percentage") {
      if (Math.abs(total - 100) > 0.1) {
        showToast(`Percentages must sum to 100% (currently ${total.toFixed(1)}%)`, "error");
        return;
      }
    } else if (expForm.split === "exact") {
      const amt = parseFloat(expForm.amount);
      if (Math.abs(total - amt) > 0.1) {
        showToast(`Amounts must sum to ₹${amt} (currently ₹${total.toFixed(2)})`, "error");
        return;
      }
    }
  }
  
  setExpLoading(true);
  try {
    const paidById = expForm.paidBy || user.id;
    const payload = {
      desc: expForm.desc,
      amount: parseFloat(expForm.amount),
      group_id: expForm.groupId,
      paid_by_user_id: paidById,
      date: expForm.date,
      category: expForm.category,
      split_type: expForm.split,
      tags: [],
    };
    
    // ✅ ADD split_data for manual splits
    if (expForm.split !== "equally" && Object.keys(expForm.splitData).length > 0) {
      // Convert all values to numbers
      const convertedData = {};
      Object.entries(expForm.splitData).forEach(([key, val]) => {
        convertedData[key] = parseFloat(val);
      });
      payload.split_data = convertedData;
    }
    
    await api.createExpense(payload);
    showToast(`"${expForm.desc}" added! 💳`, "success");
    setModal(false);
    setExpForm({ 
      desc:"",
      amount:"",
      groupId:"",
      paidBy:"",
      split:"equally",
      category:"📦",
      date:new Date().toISOString().slice(0,10),
      splitData: {}  // ✅ Reset splitData
    });
    await refreshGroups();
  } catch (err) {
    showToast(err.message || "Failed to add expense", "error");
  } finally {
    setExpLoading(false);
  }
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
              <div style={{ fontSize:11,color:C.muted }}>{user?.email||""}</div>
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
            <div style={{ fontSize:"1.6rem",fontWeight:800 }}>{netBalance>=0?"+":""}{netBalance>=0?"₹":"- ₹"}{Math.abs(Math.round(netBalance)).toLocaleString()}</div>
            <div style={{ fontSize:12,marginTop:2,opacity:.8 }}>{netBalance>=0?"You are owed":"You owe"}</div>
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
            {!selectedGroup && <p style={{ color:C.muted,fontSize:13 }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>}
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
            {tab==="overview"    && <OverviewTab C={C} user={user} showToast={showToast}/>}
            {tab==="groups"      && !selectedGroup && <GroupsTab groups={groups} setGroups={setGroups} setSelectedGroup={setSelectedGroup} showToast={showToast} C={C} refreshGroups={refreshGroups}/>}
            {tab==="groups"      && selectedGroup  && <GroupDetail group={selectedGroup} setGroup={setSelectedGroup} showToast={showToast} C={C} refreshGroups={refreshGroups} currentUserId={user?.id}/>}
            {tab==="expenses"    && <ExpensesTab showToast={showToast} C={C} groups={groups}/>}
            {tab==="settlements" && <SettlementsTab showToast={showToast} C={C}/>}
            {tab==="settings"    && <SettingsTab user={user} showToast={showToast} C={C} onSignOut={()=>{ localStorage.removeItem("access_token"); localStorage.removeItem("user"); window.location.reload(); }}/>}
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
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:13 }}>
                <div>
                  <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Amount (₹)</label>
                  <input 
                    required 
                    className="inp" 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={expForm.amount} 
                    onChange={e=>{
                      setExpForm(f=>({...f,amount:e.target.value}));
                      if (expForm.split === "exact" && expForm.groupId) {
                        setTimeout(() => initializeSplitData(expForm.groupId, "exact", e.target.value), 50);
                      }
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Date</label>
                  <input required className="inp" type="date" value={expForm.date} onChange={e=>setExpForm(f=>({...f,date:e.target.value}))}/>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:13 }}>
                <div>
                  <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Group</label>
                    <select 
                    required 
                    className="inp" 
                    value={expForm.groupId} 
                    onChange={e=>{
                      const g = groups.find(x=>x.id===e.target.value);
                      setExpForm(f=>({...f,groupId:e.target.value,paidBy:user.id}));
                      if (expForm.split !== "equally") {
                        setTimeout(() => initializeSplitData(e.target.value, expForm.split, expForm.amount), 50);
                      }
                    }}
                  >
                    <option value="">Select group…</option>
                    {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Paid by</label>
                  <select className="inp" value={expForm.paidBy} onChange={e=>setExpForm(f=>({...f,paidBy:e.target.value}))}>
                    {expForm.groupId
                      ? groups.find(g=>g.id===expForm.groupId)?.members?.map(m=>(
                          <option key={m.user_id} value={m.user_id}>{m.name}{m.user_id===user.id?" (you)":""}</option>
                        ))
                      : <option value={user.id}>You</option>
                    }
                  </select>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:13 }}>
                <div style={{ gridColumn:"1 / -1" }}>
                <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>
                  Split Method
                </label>
                <select 
                  className="inp" 
                  value={expForm.split} 
                  onChange={e=>{
                    setExpForm(f=>({...f,split:e.target.value}));
                    if (e.target.value !== "equally" && expForm.groupId) {
                      setTimeout(() => initializeSplitData(expForm.groupId, e.target.value, expForm.amount), 50);
                    } else {
                      setExpForm(f=>({...f,splitData:{}}));
                    }
                  }}
                >
                    <option value="equally">Split Equally</option>
                    <option value="percentage">By Percentage (%)</option>
                    <option value="exact">Exact Amounts (₹)</option>
                    <option value="shares">By Shares</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Category</label>
                  <select className="inp" value={expForm.category} onChange={e=>setExpForm(f=>({...f,category:e.target.value}))}>
                    {["📦","🍽️","🏨","🚗","🛒","⚡","🎬","✈️","🏥","📚"].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* ✅ MANUAL SPLIT INPUTS */}
              {expForm.split !== "equally" && expForm.groupId && (() => {
                const group = groups.find(g => g.id === expForm.groupId);
                if (!group) return null;
                
                const members = group.members || [];
                const splitValues = Object.values(expForm.splitData);
                const totalInput = splitValues.reduce((s, v) => s + parseFloat(v || 0), 0);
                const isPercentage = expForm.split === "percentage";
                const isExact = expForm.split === "exact";
                const isShares = expForm.split === "shares";
                const expectedTotal = isPercentage ? 100 : (isExact ? parseFloat(expForm.amount || 0) : 0);
                const isValid = isPercentage || isExact ? Math.abs(totalInput - expectedTotal) < 0.1 : true;
                
                return (
                  <div style={{ 
                    marginBottom:13, 
                    padding:14, 
                    background:C.bg, 
                    borderRadius:12,
                    border:`2px solid ${isValid ? C.border : '#e05555'}`
                  }}>
                    <div style={{ 
                      fontSize:12, 
                      fontWeight:700, 
                      marginBottom:12, 
                      color:C.dark,
                      display:"flex",
                      justifyContent:"space-between",
                      alignItems:"center"
                    }}>
                      <span>
                        {isPercentage && "Specify percentage for each member:"}
                        {isExact && "Specify exact amount for each member:"}
                        {isShares && "Specify shares for each member:"}
                      </span>
                      <span style={{ 
                        fontSize:11, 
                        color: isValid ? C.accent : "#e05555",
                        fontWeight:700,
                        background: isValid ? C.light : "#2d0a0a",
                        padding:"3px 10px",
                        borderRadius:20
                      }}>
                        {isPercentage && `${totalInput.toFixed(1)}% / 100%`}
                        {isExact && `₹${totalInput.toFixed(2)} / ₹${expectedTotal.toFixed(2)}`}
                        {isShares && `${totalInput} shares`}
                      </span>
                    </div>
                    
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {members.map(m => (
                        <div key={m.user_id} style={{ 
                          display:"grid", 
                          gridTemplateColumns:"1fr 120px", 
                          gap:10, 
                          alignItems:"center"
                        }}>
                          <label style={{ 
                            fontSize:13, 
                            color:C.dark,
                            fontWeight: m.user_id === user.id ? 600 : 400
                          }}>
                            {m.name}{m.user_id === user.id ? " (you)" : ""}
                          </label>
                          <div style={{ position:"relative" }}>
                            <input
                              type="number"
                              step={isPercentage ? "0.1" : isExact ? "0.01" : "1"}
                              min="0"
                              max={isPercentage ? "100" : undefined}
                              className="inp"
                              value={expForm.splitData[m.user_id] || ""}
                              onChange={e => {
                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                setExpForm(f => ({
                                  ...f,
                                  splitData: {
                                    ...f.splitData,
                                    [m.user_id]: val
                                  }
                                }));
                              }}
                              placeholder="0"
                              style={{ paddingRight: isPercentage ? 28 : 14, textAlign:"right" }}
                            />
                            {isPercentage && (
                              <span style={{ 
                                position:"absolute", 
                                right:10, 
                                top:"50%", 
                                transform:"translateY(-50%)",
                                fontSize:13,
                                color:C.muted,
                                pointerEvents:"none",
                                fontWeight:600
                              }}>%</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Quick actions */}
                    <div style={{ 
                      display:"flex", 
                      gap:6, 
                      marginTop:12,
                      paddingTop:12,
                      borderTop:`1px solid ${C.border}`
                    }}>
                      <button
                        type="button"
                        className="btn-g"
                        style={{ fontSize:11, padding:"6px 12px", flex:1 }}
                        onClick={() => initializeSplitData(expForm.groupId, expForm.split, expForm.amount)}
                      >
                        Reset to Equal
                      </button>
                      {!isValid && (isPercentage || isExact) && (
                        <button
                          type="button"
                          className="btn-g"
                          style={{ fontSize:11, padding:"6px 12px", flex:1 }}
                          onClick={() => {
                            // Auto-fix by adjusting first member
                            const members = group.members || [];
                            const data = {...expForm.splitData};
                            const diff = expectedTotal - totalInput;
                            if (members.length > 0) {
                              const firstMemberId = members[0].user_id;
                              data[firstMemberId] = parseFloat(((data[firstMemberId] || 0) + diff).toFixed(2));
                              setExpForm(f => ({...f, splitData: data}));
                            }
                          }}
                        >
                          Auto-Fix ({totalInput > expectedTotal ? '-' : '+'}{Math.abs(totalInput - expectedTotal).toFixed(2)})
                        </button>
                      )}
                    </div>
                    
                    {!isValid && (
                      <div style={{ 
                        fontSize:11, 
                        color:"#e05555", 
                        marginTop:8,
                        fontWeight:600 
                      }}>
                        {isPercentage && `❌ Total must be 100% (currently ${totalInput.toFixed(1)}%)`}
                        {isExact && `❌ Total must be ₹${expectedTotal.toFixed(2)} (currently ₹${totalInput.toFixed(2)})`}
                      </div>
                    )}
                  </div>
                );
              })()}
              <button type="submit" className="btn-p" style={{ width:"100%" }} disabled={expLoading}>
                {expLoading ? "Adding…" : "Add Expense →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showReceipt && (
        <ReceiptScannerModal
          onClose={() => setShowReceipt(false)}
          onDone={async () => { setShowReceipt(false); await refreshGroups(); }}
          groups={groups}
          showToast={showToast}
          C={C}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, C }) {
  return (
    <div className="card">
      <div style={{ fontSize:26,marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:"1.45rem",fontWeight:800,marginBottom:3,color:C.dark }}>{value}</div>
      <div style={{ fontSize:12,color:C.muted }}>{label}</div>
      {sub && <div style={{ fontSize:11,color:C.accent,marginTop:4,fontWeight:600 }}>{sub}</div>}
    </div>
  );
}

function OverviewTab({ user, C, showToast }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getActivity(8),
      api.getGroups(),
    ]).then(([s, a, g]) => {
      setStats(s);
      setActivity(a);
      setGroups(g);
    }).catch(() => showToast("Failed to load overview","error"))
    .finally(() => setLoadingStats(false));
  }, []);

  // Derive "who owes you" from group balances
  const owedToYou = groups.reduce((s, g) => s + Math.max(g.balance || 0, 0), 0);
  const youOwe    = groups.reduce((s, g) => s + Math.max(-(g.balance || 0), 0), 0);

  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:18 }}>
        {loadingStats ? [1,2,3,4].map(i=><Skeleton key={i} h={100} r={16}/>) : <>
          <StatCard icon="💰" label="Owed to You"        value={`₹${Math.round(owedToYou).toLocaleString()}`}     C={C}/>
          <StatCard icon="📤" label="You Owe Others"     value={`₹${Math.round(youOwe).toLocaleString()}`}         C={C}/>
          <StatCard icon="✅" label="Total Split"        value={`₹${Math.round(stats?.total_split||0).toLocaleString()}`} sub="all time" C={C}/>
          <StatCard icon="👥" label="Active Groups"      value={`${stats?.groups_count||0}`}                        C={C}/>
        </>}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16 }}>
        {/* Groups balance overview */}
        <div className="card">
          <h3 style={{ fontWeight:700,marginBottom:14,fontSize:15,color:C.dark }}>Balance by Group</h3>
          {groups.length === 0
            ? <div style={{ color:C.muted,fontSize:13 }}>No groups yet — create one to get started!</div>
            : groups.map(g => (
              <div key={g.id} style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:13,fontWeight:600,color:C.dark }}>{g.name}</span>
                  <span style={{ fontSize:13,fontWeight:700,color:(g.balance||0)>=0?C.accent:"#e05555" }}>
                    {(g.balance||0)>=0?"+":""} ₹{Math.abs(Math.round(g.balance||0)).toLocaleString()}
                  </span>
                </div>
                <div className="prog">
                  <div className="prog-f" style={{ width:`${Math.min(100, Math.abs(g.balance||0)/500*100)}%` }}/>
                </div>
              </div>
            ))
          }
        </div>

        {/* Recent activity */}
        <div className="card">
          <h3 style={{ fontWeight:700,marginBottom:14,fontSize:15,color:C.dark }}>Recent Activity</h3>
          {activity.length === 0
            ? <div style={{ color:C.muted,fontSize:13 }}>No activity yet.</div>
            : activity.map((a,i) => (
              <div key={a.id||i} style={{ display:"flex",gap:11,padding:"9px 0",borderBottom:i<activity.length-1?`1px solid ${C.border}`:"none" }}>
                <div style={{ width:32,height:32,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,color:C.dark }}>{a.text}</div>
                  <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{a.time}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── GROUPS ───────────────────────────────────────────────────────────────────
function GroupsTab({ groups, setGroups, setSelectedGroup, showToast, C, refreshGroups }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin]     = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode]     = useState("");
  const [creating, setCreating]     = useState(false);
  const [joining, setJoining]       = useState(false);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      await api.createGroup(newGroupName.trim());
      showToast(`Group "${newGroupName}" created! 👥`, "success");
      setNewGroupName(""); setShowCreate(false);
      await refreshGroups();
    } catch (err) {
      showToast(err.message || "Failed to create group", "error");
    } finally {
      setCreating(false);
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      // Accept full URL or just the code
      const code = joinCode.trim().split("/join/").pop().split("/")[0];
      await api.joinGroup(code);
      showToast("Joined group! 🎉", "success");
      setJoinCode(""); setShowJoin(false);
      await refreshGroups();
    } catch (err) {
      showToast(err.message || "Invalid or expired invite code", "error");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14 }}>
        {groups.map(g => {
          const isAdmin = g.members?.find(m => m.role === "admin") !== undefined;
          return (
            <div key={g.id} className="card" style={{ cursor:"pointer",transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 10px 28px ${C.primary}22`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                <div style={{ fontSize:32 }}>👥</div>
                <span className={(g.balance||0)>=0?"badge-g":"badge-r"}>
                  {(g.balance||0)>=0?"+":""}₹{Math.abs(Math.round(g.balance||0)).toLocaleString()}
                </span>
              </div>
              <div style={{ fontWeight:700,fontSize:15,marginBottom:5,color:C.dark }}>{g.name}</div>
              <div style={{ color:C.muted,fontSize:13,marginBottom:14 }}>
                {g.expenses_count||0} expenses · {g.members?.length||0} members
              </div>
              <div style={{ display:"flex",marginBottom:14 }}>
                {(g.members||[]).slice(0,4).map((m,j)=>(
                  <div key={m.user_id||j} style={{ width:28,height:28,borderRadius:"50%",background:j===0?C.primary:C.mid,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,border:`2px solid ${C.surface}`,marginLeft:j?-8:0 }}>
                    {(m.name||"?")[0]}
                  </div>
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
        <button style={{ border:`2px dashed ${C.border}`,borderRadius:18,padding:20,background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,color:C.muted,transition:"all .2s",minHeight:180 }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}
          onClick={()=>setShowJoin(true)}>
          <span style={{ fontSize:28 }}>🔗</span>
          <span style={{ fontWeight:600,fontSize:14 }}>Join via Link</span>
        </button>
      </div>

      {showCreate && (
        <div className="modal-bg" onClick={()=>setShowCreate(false)}>
          <div className="modal pop" onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontWeight:800,fontSize:"1.2rem",marginBottom:20,color:C.dark }}>Create New Group</h2>
            <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Group Name</label>
            <input className="inp" placeholder="e.g. Weekend Trip" value={newGroupName}
              onChange={e=>setNewGroupName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&createGroup()}
              style={{ marginBottom:16 }}/>
            <div style={{ display:"flex",gap:10 }}>
              <button className="btn-p" style={{ flex:1 }} onClick={createGroup} disabled={creating}>
                {creating ? "Creating…" : "Create Group"}
              </button>
              <button className="btn-o" onClick={()=>setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showJoin && (
        <div className="modal-bg" onClick={()=>setShowJoin(false)}>
          <div className="modal pop" onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontWeight:800,fontSize:"1.2rem",marginBottom:8,color:C.dark }}>🔗 Join a Group</h2>
            <p style={{ fontSize:13,color:C.muted,marginBottom:16 }}>Paste the invite link or just the code at the end of it.</p>
            <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Invite Link or Code</label>
            <input className="inp" placeholder="https://… or just the code"
              value={joinCode} onChange={e=>setJoinCode(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&joinGroup()}
              style={{ marginBottom:16 }}/>
            <div style={{ display:"flex",gap:10 }}>
              <button className="btn-p" style={{ flex:1 }} onClick={joinGroup} disabled={joining}>
                {joining ? "Joining…" : "Join Group"}
              </button>
              <button className="btn-o" onClick={()=>setShowJoin(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GROUP DETAIL ─────────────────────────────────────────────────────────────
function GroupDetail({ group, setGroup, showToast, C, refreshGroups, currentUserId }) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [detailTab, setDetailTab]         = useState("expenses");
  const [groupActivity, setGroupActivity] = useState([]);

  const isAdmin = group.members?.some(m => m.user_id === currentUserId && m.role === "admin");

  useEffect(() => {
    Promise.all([
      api.getExpenses({ group_id: group.id }),
      api.getGroupBalances(group.id),
      api.getGroupActivity(group.id, 20),
    ]).then(([exps, bals, acts]) => {
      setExpenses(exps);
      setBalances(bals);
      setGroupActivity(acts);
    }).catch((err) => {
      const msg = err?.message || "";
      if (msg.includes("403") || msg.includes("not a member") || msg.includes("removed") || msg.includes("kicked")) {
        showToast("You have been removed from this group by the admin.", "error");
      } else if (msg.includes("404") || msg.includes("not found")) {
        showToast("This group no longer exists.", "error");
      } else {
        showToast("Failed to load group details", "error");
      }
      setGroup(null);
    })
    .finally(() => setLoadingDetail(false));
  }, [group.id]);

  const leaveGroup = async () => {
    if (!window.confirm(`Leave "${group.name}"? You will lose access to its expenses.`)) return;
    try {
      await api.leaveGroup(group.id);
      showToast(`Left "${group.name}"`, "success");
      await refreshGroups();
      setGroup(null);
    } catch (err) {
      showToast(err.message || "Failed to leave group", "error");
    }
  };

  const deleteGroup = async () => {
    if (!window.confirm(`Delete "${group.name}"? This will permanently delete all expenses and cannot be undone.`)) return;
    try {
      await api.deleteGroup(group.id);
      showToast(`"${group.name}" deleted`, "success");
      await refreshGroups();
      setGroup(null);
    } catch (err) {
      showToast(err.message || "Failed to delete group", "error");
    }
  };

  const addMember = async () => {
    if (!newMemberEmail.trim()) return;
    setAddingMember(true);
    try {
      await api.addMember(group.id, newMemberEmail.trim());
      showToast(`Member added! 👥`, "success");
      setNewMemberEmail(""); setShowAddMember(false);
      await refreshGroups();
    } catch (err) {
      showToast(err.message || "User not found. Make sure they have a SplitGreen account.", "error");
    } finally {
      setAddingMember(false);
    }
  };

  const removeMember = async (userId, name) => {
    try {
      await api.removeMember(group.id, userId);
      showToast(`${name} removed`, "success");
      await refreshGroups();
    } catch (err) {
      showToast(err.message || "Failed to remove member", "error");
    }
  };

  const getInviteLink = async () => {
    try {
      const data = await api.getInviteLink(group.id);
      setInviteLink(data.invite_link);
      setShowInvite(true);
    } catch (err) {
      showToast(err.message || "Failed to get invite link", "error");
    }
  };

  const deleteExpense = async (expId, desc) => {
    try {
      await api.deleteExpense(expId);
      showToast(`"${desc}" deleted`, "success");
      setExpenses(prev => prev.filter(e => e.id !== expId));
      await refreshGroups();
    } catch (err) {
      showToast(err.message || "Failed to delete expense", "error");
    }
  };

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="fade">
      {/* Summary cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20 }}>
        {[
          {label:"Total Spent",  value:`₹${Math.round(totalSpent).toLocaleString()}`, icon:"💰"},
          {label:"Members",      value:`${group.members?.length||0}`, icon:"👥"},
          {label:"Expenses",     value:`${expenses.length}`, icon:"📋"},
          {label:"Your Balance", value:`${(group.balance||0)>=0?"+":""}₹${Math.abs(Math.round(group.balance||0)).toLocaleString()}`, icon:"⚖️"},
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:"center",padding:16 }}>
            <div style={{ fontSize:22,marginBottom:5 }}>{s.icon}</div>
            <div style={{ fontWeight:800,fontSize:"1.15rem",color:C.dark }}>{s.value}</div>
            <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16 }}>
        {/* Members */}
        <div className="card">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <h3 style={{ fontWeight:700,fontSize:15,color:C.dark }}>👥 Members</h3>
            <div style={{ display:"flex",gap:6 }}>
              <button className="btn-o" style={{ fontSize:11,padding:"5px 10px" }} onClick={getInviteLink}>🔗 Invite</button>
              {isAdmin && <button className="btn-p" style={{ fontSize:11,padding:"5px 10px" }} onClick={() => setShowAddMember(true)}>+ Add</button>}
              {isAdmin && <button className="btn-danger" style={{ fontSize:11,padding:"5px 10px" }} onClick={deleteGroup}>Delete Group</button>}
              {!isAdmin && <button className="btn-danger" style={{ fontSize:11,padding:"5px 10px" }} onClick={leaveGroup}>Leave</button>}
            </div>
          </div>
          {(group.members||[]).map(m => (
            <div key={m.user_id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:m.role==="admin"?C.primary:C.mid,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0 }}>
                {(m.name||"?")[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <span style={{ fontWeight:600,fontSize:13,color:C.dark }}>{m.name}</span>
                  {m.role==="admin" && <span style={{ background:C.primary,color:"#fff",fontSize:9,fontWeight:700,padding:"1px 7px",borderRadius:20 }}>ADMIN</span>}
                  {m.user_id===currentUserId && <span style={{ color:C.muted,fontSize:11 }}>(you)</span>}
                </div>
              </div>
              {isAdmin && m.user_id !== currentUserId && (
                <button onClick={()=>removeMember(m.user_id, m.name)}
                  style={{ fontSize:13,padding:"4px 8px",borderRadius:7,border:"1px solid #3d1010",background:"#2d0a0a",color:"#ff6b6b",cursor:"pointer" }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Balances */}
        <div className="card">
          <h3 style={{ fontWeight:700,fontSize:15,marginBottom:16,color:C.dark }}>💸 Balances</h3>
          {loadingDetail ? <Skeleton h={80} /> : balances.length === 0 ? (
            <div style={{ textAlign:"center",padding:30,color:C.muted }}>
              <div style={{ fontSize:32,marginBottom:8 }}>🎉</div>
              <div style={{ fontSize:14,fontWeight:600 }}>All settled up!</div>
            </div>
          ) : balances.map(b => (
            <div key={b.user_id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
              <div>
                <span style={{ fontWeight:600,fontSize:13,color:C.dark }}>{b.name}</span>
                {b.owes_you > 0 && <div style={{ fontSize:12,color:"#4a9e5c",marginTop:2 }}>Owes you ₹{b.owes_you.toLocaleString()}</div>}
                {b.you_owe > 0  && <div style={{ fontSize:12,color:"#ff6b6b",marginTop:2 }}>You owe ₹{b.you_owe.toLocaleString()}</div>}
              </div>
              <span className={b.net>=0?"badge-g":"badge-r"}>
                {b.net>=0?"+":""}₹{Math.abs(b.net).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses / Activity tabs */}
      <div className="card" style={{ padding:0,overflow:"hidden" }}>
        <div style={{ display:"flex",borderBottom:`1px solid ${C.border}` }}>
          {[{k:"expenses",l:"📋 Expenses"},{k:"activity",l:"⚡ Activity"}].map(t => (
            <button key={t.k} onClick={()=>setDetailTab(t.k)}
              style={{ flex:1,padding:"14px",border:"none",cursor:"pointer",fontWeight:detailTab===t.k?700:500,fontSize:13,background:"transparent",color:detailTab===t.k?C.dark:C.muted,borderBottom:detailTab===t.k?`2px solid ${C.primary}`:"2px solid transparent",transition:"all .2s" }}>
              {t.l}
            </button>
          ))}
        </div>
        {loadingDetail ? (
          <div style={{ padding:20 }}><Skeleton h={60}/></div>
        ) : detailTab === "activity" ? (
          <div style={{ padding:"8px 0" }}>
            {groupActivity.length === 0
              ? <div style={{ textAlign:"center",padding:36,color:C.muted }}>No activity yet</div>
              : groupActivity.map((a,i) => (
                <div key={a.id||i} style={{ display:"flex",gap:12,padding:"10px 20px",borderBottom:i<groupActivity.length-1?`1px solid ${C.border}`:"none" }}>
                  <div style={{ width:32,height:32,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{a.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,color:C.dark }}>{a.text}</div>
                    <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{a.time}</div>
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.bg }}>
                {["","Description","Amount","Paid By","Date","Your Share",""].map((h,i)=>(
                  <th key={i} style={{ padding:"10px 16px",textAlign:"left",fontSize:12,fontWeight:700,color:C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} style={{ borderTop:`1px solid ${C.border}` }}>
                  <td style={{ padding:"12px 16px",fontSize:18 }}>{e.category}</td>
                  <td style={{ padding:"12px 16px",fontWeight:600,fontSize:13,color:C.dark }}>{e.desc}</td>
                  <td style={{ padding:"12px 16px",fontWeight:700,fontSize:13,color:C.dark }}>₹{e.amount.toLocaleString()}</td>
                  <td style={{ padding:"12px 16px",fontSize:13,color:C.muted }}>{e.paid_by_name}</td>
                  <td style={{ padding:"12px 16px",color:C.muted,fontSize:13 }}>{e.date}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span className={e.your_share===0?"badge-g":e.paid_by_user_id===currentUserId?"badge-g":"badge-r"}>
                      ₹{(e.your_share||0).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    {e.paid_by_user_id===currentUserId && (
                      <button onClick={()=>deleteExpense(e.id,e.desc)}
                        style={{ fontSize:12,padding:"3px 8px",borderRadius:6,border:"1px solid #3d1010",background:"#2d0a0a",color:"#ff6b6b",cursor:"pointer" }}>✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loadingDetail && detailTab==="expenses" && expenses.length===0 && (
          <div style={{ textAlign:"center",padding:36,color:C.muted }}>No expenses yet. Add one with the + button above!</div>
        )}
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <div className="modal-bg" onClick={()=>setShowAddMember(false)}>
          <div className="modal pop" onClick={e=>e.stopPropagation()} style={{ maxWidth:380 }}>
            <h2 style={{ fontWeight:800,fontSize:"1.1rem",marginBottom:16,color:C.dark }}>Add Member</h2>
            <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Their Email Address</label>
            <input className="inp" type="email" placeholder="friend@example.com"
              value={newMemberEmail} onChange={e=>setNewMemberEmail(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addMember()}
              style={{ marginBottom:6 }}/>
            <p style={{ fontSize:11,color:C.muted,marginBottom:16 }}>They must already have a SplitGreen account.</p>
            <div style={{ display:"flex",gap:10 }}>
              <button className="btn-p" style={{ flex:1 }} onClick={addMember} disabled={addingMember}>
                {addingMember ? "Adding…" : "Add Member"}
              </button>
              <button className="btn-o" onClick={()=>setShowAddMember(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite link modal */}
      {showInvite && (
        <div className="modal-bg" onClick={()=>setShowInvite(false)}>
          <div className="modal pop" onClick={e=>e.stopPropagation()} style={{ maxWidth:420 }}>
            <h2 style={{ fontWeight:800,fontSize:"1.1rem",marginBottom:12,color:C.dark }}>🔗 Invite Link</h2>
            <p style={{ fontSize:13,color:C.muted,marginBottom:14 }}>Share this link — expires in 7 days.</p>
            <div style={{ display:"flex",gap:8 }}>
              <input className="inp" readOnly value={inviteLink} style={{ flex:1,fontSize:12 }}/>
              <button className="btn-p" onClick={()=>{ navigator.clipboard.writeText(inviteLink); showToast("Link copied! 📋","success"); }}>Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EXPENSES TAB ─────────────────────────────────────────────────────────────
function ExpensesTab({ showToast, C, groups }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");

  useEffect(() => {
    api.getExpenses({}).then(setExpenses)
      .catch(() => showToast("Failed to load expenses","error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getExpenses({ group_id: filterGroup || undefined, search: search || undefined })
      .then(setExpenses).catch(() => {});
  }, [search, filterGroup]);

  return (
    <div>
      <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap" }}>
        <input className="inp" placeholder="🔍 Search expenses..." value={search}
          onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }}/>
        <select className="inp" style={{ width:180 }} value={filterGroup} onChange={e=>setFilterGroup(e.target.value)}>
          <option value="">All Groups</option>
          {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>
      <div className="card" style={{ padding:0,overflow:"hidden" }}>
        {loading ? <div style={{ padding:20 }}><Skeleton h={200}/></div> : (
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.bg }}>
                {["","Description","Group","Amount","Paid By","Date","Your Share"].map((h,i)=>(
                  <th key={i} style={{ padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:700,color:C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map(e=>(
                <tr key={e.id} style={{ borderTop:`1px solid ${C.border}`,transition:"background .12s" }}
                  onMouseEnter={ev=>ev.currentTarget.style.background=C.bg}
                  onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"12px 16px",fontSize:20 }}>{e.category}</td>
                  <td style={{ padding:"12px 16px",fontWeight:600,fontSize:13,color:C.dark }}>{e.desc}</td>
                  <td style={{ padding:"12px 16px",fontSize:13,color:C.muted }}>{e.group_name}</td>
                  <td style={{ padding:"12px 16px",fontWeight:700,fontSize:13,color:C.dark }}>₹{e.amount.toLocaleString()}</td>
                  <td style={{ padding:"12px 16px",fontSize:13,color:C.dark }}>{e.paid_by_name}</td>
                  <td style={{ padding:"12px 16px",color:C.muted,fontSize:13 }}>{e.date}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span className="badge-r">₹{(e.your_share||0).toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && expenses.length===0 && (
          <div style={{ textAlign:"center",padding:36,color:C.muted }}>No expenses found</div>
        )}
      </div>
    </div>
  );
}

// ─── SETTLEMENTS ──────────────────────────────────────────────────────────────
function SettlementsTab({ showToast, C }) {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    try {
      const s = await api.getSettlements();
      setSettlements(s);
    } catch {
      showToast("Failed to load settlements","error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const record = async (id) => {
    setRecording(id);
    try {
      await api.recordSettlement(id);
      showToast("Settlement recorded ✅","success");
      await load();
    } catch (err) {
      showToast(err.message || "Failed to record","error");
    } finally {
      setRecording(null);
    }
  };

  const deleteOne = async (id) => {
    if (!window.confirm("Delete this settlement record?")) return;
    setDeleting(id);
    try {
      await api.deleteSettlement(id);
      showToast("Settlement deleted","success");
      await load();
    } catch (err) {
      showToast(err.message || "Failed to delete","error");
    } finally {
      setDeleting(null);
    }
  };

  const clearAllSettled = async () => {
    if (!window.confirm("Delete all settled transaction history? This cannot be undone.")) return;
    setClearing(true);
    try {
      const res = await api.clearSettledTransactions();
      showToast(res.message || "Cleared settled history","success");
      await load();
    } catch (err) {
      showToast(err.message || "Failed to clear","error");
    } finally {
      setClearing(false);
    }
  };

  const remind = async (userId, name) => {
    try {
      await api.sendReminder(userId);
      showToast(`Reminder sent to ${name}!`,"success");
    } catch (err) {
      showToast(err.message || "Failed to send reminder","error");
    }
  };

  if (loading) return <div style={{ display:"flex",flexDirection:"column",gap:14 }}><Skeleton h={80}/><Skeleton h={80}/></div>;

  const pending = settlements.filter(s=>s.status==="pending");
  const settled = settlements.filter(s=>s.status==="settled");

  return (
    <div>
      {/* Pending settlements */}
      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {pending.length === 0 && (
          <div className="card" style={{ textAlign:"center",padding:40,color:C.muted }}>
            <div style={{ fontSize:36,marginBottom:10 }}></div>
            <div style={{ fontWeight:700,fontSize:15 }}>All settled up!</div>
            <div style={{ fontSize:13,marginTop:6 }}>No pending settlements across any groups.</div>
          </div>
        )}
        {pending.map(s => (
          <div key={s.id} className="card" style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:C.accent,fontSize:16 }}>
              {(s.from_user_name||"?")[0]}
            </div>
            <div style={{ flex:1,minWidth:120 }}>
              <span style={{ fontWeight:600,fontSize:14,color:C.dark }}>{s.from_user_name}</span>
              <span style={{ color:C.muted,margin:"0 8px",fontSize:13 }}>→</span>
              <span style={{ fontWeight:600,fontSize:14,color:C.dark }}>{s.to_user_name}</span>
              {s.group_name && <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{s.group_name}</div>}
            </div>
            <span style={{ fontWeight:800,fontSize:"1.05rem",color:C.dark }}>₹{s.amount.toLocaleString()}</span>
            <div style={{ display:"flex",gap:8,flexShrink:0 }}>
              <button className="btn-g" style={{ fontSize:12 }} title="Send reminder" onClick={()=>remind(s.from_user_id, s.from_user_name)}>Remind</button>
              <button className="btn-p" style={{ fontSize:13,padding:"8px 18px" }}
                disabled={recording===s.id} onClick={()=>record(s.id)}>
                {recording===s.id ? "…" : "✓ Mark Settled"}
              </button>
              <button onClick={()=>deleteOne(s.id)} disabled={deleting===s.id}
                style={{ fontSize:12,padding:"6px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,cursor:"pointer" }}
                title="Delete this settlement">
                {deleting===s.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Settled history */}
      {settled.length > 0 && (
        <div style={{ marginTop:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <h3 style={{ fontWeight:700,fontSize:14,color:C.muted }}>SETTLED HISTORY ({settled.length})</h3>
            <button onClick={clearAllSettled} disabled={clearing}
              style={{ fontSize:12,padding:"6px 14px",borderRadius:8,border:"1px solid #ff6b6b",background:"transparent",color:"#ff6b6b",cursor:"pointer",fontWeight:600 }}>
              {clearing ? "Clearing…" : "Clear All Settled"}
            </button>
          </div>
          {settled.map(s => (
            <div key={s.id} className="card" style={{ display:"flex",alignItems:"center",gap:14,opacity:.65,marginBottom:8 }}>
              <span style={{ fontSize:14 }}>✅</span>
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:600,fontSize:13,color:C.dark }}>{s.from_user_name} → {s.to_user_name}</span>
                {s.group_name && <div style={{ fontSize:11,color:C.muted }}>{s.group_name}</div>}
              </div>
              <span style={{ fontWeight:700,color:C.dark }}>₹{s.amount.toLocaleString()}</span>
              <button onClick={()=>deleteOne(s.id)} disabled={deleting===s.id}
                style={{ fontSize:12,padding:"4px 8px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,cursor:"pointer" }}
                title="Delete">
                {deleting===s.id ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsTab({ user, showToast, C, onSignOut }) {
  const [name, setName]         = useState(user?.name || "");
  const [email, setEmail]       = useState(user?.email || "");
  const [notif, setNotif]       = useState(user?.preferences?.email_notifications ?? true);
  const [saving, setSaving]     = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await api.updateMe({ name, email });
      localStorage.setItem("user", JSON.stringify(updated));
      showToast("Profile updated ✅","success");
    } catch (err) {
      showToast(err.message || "Failed to save","error");
    } finally {
      setSaving(false);
    }
  };

  const savePrefs = async (updates) => {
    setSavingPrefs(true);
    try {
      await api.updatePreferences(updates);
      showToast("Preferences saved","success");
    } catch {}
    finally { setSavingPrefs(false); }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This permanently deletes your account and all data.")) return;
    try {
      await api.deleteAccount();
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      showToast("Account deleted","success");
      onSignOut && onSignOut();
    } catch (err) {
      showToast(err.message || "Failed to delete account","error");
    }
  };

  return (
    <div style={{ maxWidth:520 }}>
      <div className="card" style={{ marginBottom:14 }}>
        <h3 style={{ fontWeight:700,marginBottom:16,fontSize:15,color:C.dark }}>Profile</h3>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Full Name</label>
          <input className="inp" value={name} onChange={e=>setName(e.target.value)}/>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13,fontWeight:600,marginBottom:5,display:"block",color:C.dark }}>Email</label>
          <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <button className="btn-p" style={{ fontSize:13 }} onClick={saveProfile} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="card" style={{ marginBottom:14 }}>
        <h3 style={{ fontWeight:700,marginBottom:14,fontSize:15,color:C.dark }}>Preferences</h3>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontSize:14,color:C.dark }}>Email notifications</span>
          <Toggle on={notif} set={v=>{setNotif(v); savePrefs({email_notifications:v});}} C={C}/>
        </div>

      </div>

      <div className="card" style={{ border:"1.5px solid #3d1010" }}>
        <h3 style={{ fontWeight:700,marginBottom:6,color:"#ff6b6b",fontSize:15 }}>Danger Zone</h3>
        <p style={{ color:C.muted,fontSize:13,marginBottom:12 }}>Permanently delete your account and all data. This cannot be undone.</p>
        <button className="btn-danger" onClick={deleteAccount}>Delete My Account</button>
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

  // ── Restore session on page load/refresh ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const saved = localStorage.getItem("user");
    if (token && saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
        setPage("dashboard");
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // ── Listen for token expiry event fired by api.js ─────────────────────────
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setPage("signin");
      showToast("Session expired. Please sign in again.", "error");
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  // ── Sign out handler (passed to Navbar) ──────────────────────────────────
  const handleSignOut = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("landing");
    showToast("Signed out successfully", "success");
  };

  // ── Auth guard ────────────────────────────────────────────────────────────
  // React 18 batches setUser + setPage so we must also check localStorage
  // to avoid the flash-redirect back to landing after sign-in.
  const hasStoredSession = !!localStorage.getItem("access_token") && !!localStorage.getItem("user");
  const isLoggedIn = user !== null || hasStoredSession;
  const safePage = (page === "dashboard" && !isLoggedIn) ? "landing" : page;

  // Keep user state in sync when page is dashboard but user state is null (restored from storage)
  const effectiveUser = user || (() => {
    if (hasStoredSession) {
      try { return JSON.parse(localStorage.getItem("user")); } catch {}
    }
    return null;
  })();

  const isLanding = safePage === "landing" || safePage === "signup" || safePage === "signin";

  return (
    <div style={{ minHeight:"100vh",background:C.bg,position:"relative" }}>
      <style>{buildStyle(C)}</style>
      {isLanding ? <PixelRain C={C}/> : <Particles C={C}/>}
      <div style={{ position:"relative",zIndex:1 }}>
        <Navbar setPage={setPage} user={effectiveUser} setUser={setUser} showToast={showToast} C={C} palette={palette} setPalette={setPalette} onSignOut={handleSignOut}/>
        {safePage==="landing"   && <Landing   setPage={setPage} showToast={showToast} C={C}/>}
        {safePage==="signup"    && <Auth      type="signup" setPage={setPage} setUser={setUser} showToast={showToast} C={C}/>}
        {safePage==="signin"    && <Auth      type="signin" setPage={setPage} setUser={setUser} showToast={showToast} C={C}/>}
        {safePage==="dashboard" && <Dashboard user={effectiveUser} setPage={setPage} showToast={showToast} C={C}/>}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
    </div>
  );
}