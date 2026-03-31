import React, { useEffect, useRef, useMemo, useState } from 'react';

export default function ShuttleVisualizer() {
  const canvasRef = useRef(null);
  const [time, setTime] = useState(0);

  const [aiResponse, setAiResponse] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTopic, setActiveTopic] = useState("");

  const CX = 950; 
  const CY = 480; 
  const FLOOR_Y = 880; 
  const GOLD = '#ffd700'; 
  const GOLD_DIM = 'rgba(255, 215, 0, 0.3)';
  const GOLD_DARK = 'rgba(255, 215, 0, 0.1)';

  useEffect(() => {
    let animationFrameId;
    const renderUI = () => {
      setTime(prev => prev + 0.01);
      animationFrameId = requestAnimationFrame(renderUI);
    };
    renderUI();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      // Use offsetWidth/Height to perfectly match CSS scaled container bounds
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let particles = Array.from({ length: 400 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.45 + (Math.random() - 0.5) * 600,
      vx: 1 + Math.random() * 2,
      vy: 0,
      life: Math.random() * 100
    }));

    let mouse = { x: 0, y: 0 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach(p => {
        let dx = (mouse.x || canvas.width/2) - p.x;
        let dy = (mouse.y || canvas.height/2) - p.y;

        if (mouse.x !== 0 || mouse.y !== 0) {
           p.vx += dx * 0.00001;
           p.vy += dy * 0.00002;
        }

        p.x -= p.vx; 
        p.y += Math.sin(p.x * 0.01) + p.vy;

        if (p.x < 0) {
          p.x = canvas.width;
          p.y = canvas.height * 0.45 + (Math.random() - 0.5) * 600;
          p.vx = 1 + Math.random() * 2;
          p.vy = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,215,0,0.8)";
        ctx.fill();

        const localFloor = canvas.height * 0.8;
        if (p.y < localFloor + 100) {
          const rY = localFloor + (localFloor - p.y);
          const rOpacity = Math.max(0, 1 - (rY - localFloor) / 200) * 0.5;
          if (rOpacity > 0.01) {
             ctx.beginPath();
             ctx.arc(p.x, rY, 1.2, 0, Math.PI * 2);
             ctx.fillStyle = `rgba(255,215,0,${rOpacity})`;
             ctx.fill();
          }
        }
      });
      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const feathers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const z = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      const x0 = CX - 30,  y0 = CY + 40 * sinA;
      const x1 = CX - 200, y1 = CY + 105 * sinA;
      const x2 = CX - 350, y2 = CY + 175 * sinA;
      const x3 = CX - 500, y3 = CY + 245 * sinA;
      const x4 = CX - 650, y4 = CY + 310 * sinA;
      
      const stem = `${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
      const w1 = 18 * Math.abs(sinA), w2 = 32 * Math.abs(sinA), w3 = 38 * Math.abs(sinA);
      
      let ribs = [];
      for(let step = 0.25; step <= 0.85; step += 0.08) {
         const bx = x0 + (x4 - x0) * step;
         const by = y0 + (y4 - y0) * step;
         const bw = (step < 0.8 ? (step / 0.8) * 38 : (1 - step)/0.2 * 38) * Math.abs(sinA);
         ribs.push(`M ${bx + 15},${by} L ${bx - 12},${by - bw} M ${bx + 15},${by} L ${bx - 12},${by + bw}`);
      }

      const outline = `M ${x0},${y0} Q ${x1},${y1 - w1 * 1.5} ${x2},${y2 - w2} Q ${x3},${y3 - w3} ${x4},${y4} Q ${x3},${y3 + w3} ${x2},${y2 + w2} Q ${x1},${y1 + w1 * 1.5} ${x0},${y0} Z`;
      arr.push({ z, stem, outline, ribs: ribs.join(" ") });
    }
    return arr.sort((a, b) => a.z - b.z);
  }, []);

  const labels = [
    { text: "FLUID DYNAMICS", top: "15%", left: "15%" },
    { text: "ANGLED FEATHER SOCKETS", top: "15%", left: "40%" },
    { text: "16-GOOSE FEATHER ARRAY", top: "25%", left: "50%" },
    { text: "VISUALIZING AIRFLOW", top: "30%", left: "62%" },
    { text: "COMPOSITE CORK CORE", top: "72%", left: "48%" },
    { text: "STRUCTURAL INTEGRITY", top: "68%", left: "68%" },
  ];

  const runAiDiagnostic = async (topic) => {
    setIsAnalyzing(true);
    setActiveTopic(topic);
    setAiResponse("");
    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const prompt = `Aerospace analysis of: ${topic}. Give 2-3 sentences of technical engineering data. No markdown. Plain text. Clinical tone.`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Link error.");
    } catch (e) {
      setAiResponse("Diagnostic failure.");
    }
    setIsAnalyzing(false);
  };

  return (
    // Restored fluid w-full h-full fully unbound cover
    <div className="flicker-effect relative w-full h-full bg-transparent overflow-hidden select-none font-sans uppercase">
      
      {/* Canvas natively bound to container bounds securely */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-80 mix-blend-screen pointer-events-none" />

      {/* Synchronized Hero Bounds seamlessly stretching 100% of About layout using slice */}
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full z-10">
        <defs>
          <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" /><feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="refGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="refMask">
            <rect x="0" y="880" width="1920" height="200" fill="url(#refGradient)" />
          </mask>
        </defs>

        {/* --- FLOOR GRID --- */}
        <g stroke={GOLD_DARK} strokeWidth="1" className="pointer-events-none">
           {[880, 930, 1000].map(y => <line key={y} x1="0" y1={y} x2="1920" y2={y} />)}
           {Array.from({length: 21}).map((_, i) => {
              const xT = i * 100 - 100;
              const xB = xT + (xT - 960) * 0.6;
              return <line key={i} x1={xT} y1="880" x2={xB} y2="1080" />;
           })}
        </g>

        {/* --- MAIN SHUTTLECOCK MODEL (restored raw GOLD stroke over broken gradients) --- */}
        <g id="shuttlecock" filter="url(#bloom)" className="shuttle pointer-events-none">
          <g id="cork-head" stroke={GOLD}>
             <path d={`M ${CX} ${CY - 65} A 100 65 0 0 1 ${CX + 95} ${CY} A 100 65 0 0 1 ${CX} ${CY + 65}`} fill="#020202" strokeWidth="2" />
             <ellipse cx={CX} cy={CY} rx="22" ry="65" fill="#020202" strokeWidth="1.5" />
             {Array.from({length: 12}).map((_, i) => (
                <ellipse key={i} cx={CX + i*8} cy={CY} rx={22 - i*1.8} ry={65 * Math.sqrt(1 - Math.pow(i/12, 2))} fill="none" strokeWidth="0.5" opacity="0.4" />
             ))}
          </g>

          <g id="feather-array" stroke={GOLD}>
            {feathers.map((f, i) => (
              <g key={i} opacity={f.z < 0 ? 0.3 : 1}>
                {/* SVG Feather Animations */}
                <path d={f.outline} fill="#020202" strokeWidth="0.8" className="feather-path stroke-gold" />
                <path d={f.ribs} fill="none" strokeWidth="0.4" opacity="0.6" className="feather-path stroke-gold" style={{ animationDelay: '0.5s' }} />
                <polyline points={f.stem} fill="none" strokeWidth={f.z < 0 ? 0.5 : 1.8} className="feather-path stroke-gold" style={{ animationDelay: '0.2s' }} />
              </g>
            ))}
          </g>

          <ellipse cx={CX - 210} cy={CY} rx="45" ry="110" fill="none" stroke={GOLD} strokeWidth="2" className="feather-path" style={{ animationDelay: '1s' }} />
          <ellipse cx={CX - 360} cy={CY} rx="70" ry="180" fill="none" stroke={GOLD} strokeWidth="2" className="feather-path" style={{ animationDelay: '1.2s' }} />
        </g>

        {/* --- FLOOR REFLECTION --- */}
        <g transform={`translate(0, ${FLOOR_Y * 2}) scale(1, -1)`} mask="url(#refMask)" className="pointer-events-none">
           <use href="#shuttlecock" opacity="0.4" />
        </g>

        {/* Label Pointer Lines Embedded Directly into SVG coordinates guaranteeing pristine mapping */}
        {labels.map((l, i) => (
           <g key={i} className="pointer-label" style={{ cursor: "pointer", pointerEvents: "auto" }} transform={`translate(${parseFloat(l.left)/100 * 1920}, ${parseFloat(l.top)/100 * 1080})`} onClick={() => runAiDiagnostic(l.text)}>
              <line x1="-90" y1="0" x2="-10" y2="0" stroke="rgba(255,215,0,0.6)" strokeWidth="2" />
              <text x="0" y="4" fill={GOLD} fontSize="11" letterSpacing="0.1em" className="hover-glow">{l.text}</text>
           </g>
        ))}

        {/* --- RIGHT HUD PANEL - Hidden on mobile entirely to avoid slicing constraints --- */}
        <g transform="translate(1410, 70)" className="hidden lg:block pointer-events-none">
           <rect width="460" height="780" fill="rgba(2,2,2,0.6)" stroke={GOLD_DIM} strokeWidth="1" />
           <path d="M0 20 L0 0 L20 0 M440 0 L460 0 L460 20 M460 760 L460 780 L440 780 M20 780 L0 780 L0 760" fill="none" stroke={GOLD} strokeWidth="2" />
           
           <text x="30" y="40" fill={GOLD} fontSize="18" letterSpacing="0.2em" fontWeight="bold">BLUEPRINT ANALYSIS</text>
           <line x1="30" y1="55" x2="430" y2="55" stroke={GOLD_DIM} strokeWidth="1" />
           
           <text x="30" y="80" fill={GOLD} fontSize="8" opacity="0.6">FLIGHT DATA ACCURACY: 99.8%</text>
           <text x="430" y="80" fill={GOLD} fontSize="8" opacity="0.6" textAnchor="end">DATASTREAM: ACTIVE</text>

           <g transform="translate(230, 260)">
             <g className="radial-diagram">
                <g stroke={GOLD} fill="none">
                  <circle cx="0" cy="0" r="150" strokeWidth="1" strokeOpacity="0.8" />
                  <circle cx="0" cy="0" r="100" strokeWidth="0.5" strokeOpacity="0.5" strokeDasharray="4 4" />
                  <circle cx="0" cy="0" r="50" strokeWidth="0.5" strokeOpacity="0.3" />
                  <line x1="0" y1="-150" x2="0" y2="150" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="-150" y1="0" x2="150" y2="0" strokeWidth="0.5" strokeOpacity="0.4" />
                </g>
             </g>
             <g className="radial-diagram" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
                {Array.from({length: 16}).map((_, i) => (
                  <g key={i} transform={`rotate(${i * 22.5})`}>
                      <line x1="150" y1="0" x2="160" y2="0" stroke={GOLD_DIM} strokeWidth="1" />
                  </g>
                ))}
             </g>
           </g>

           <g transform="translate(30, 480)" fill={GOLD}>
              <text y="0" fontSize="10">VELOCITY METRICS</text>
              <text y="20" fontSize="14">AXIAL: {(0.94 + Math.sin(time)*0.01).toFixed(4)} m/s</text>
              <line y1="35" x2="400" y2="35" stroke={GOLD_DIM} strokeWidth="1" />
              
              <g transform="translate(0, 60)">
                <text fontSize="11">&gt; ENGINEERING WITH INTENT</text>
                <text y="30" fontSize="11">&gt; FLIGHT PATH STABILITY: 99.6%</text>
                <text y="60" fontSize="11">&gt; PRECISION ANGLE OPTIMIZATION</text>
                
                <g transform="translate(250, 45)">
                   {Array.from({length: 8}).map((_, i) => (
                      <rect key={i} x={i * 15} y={15 - (Math.sin(time*2 + i)*15)} width="10" height={Math.max(0, 10 + Math.sin(time*2 + i)*15)} opacity="0.6" />
                   ))}
                </g>
              </g>
           </g>

           {/* Button Overlay pointer bounds bound securely in SVG */}
           <g transform="translate(30, 660)" className="cursor-pointer" style={{ pointerEvents: "auto" }} onClick={() => runAiDiagnostic("FULL SYSTEM INTEGRITY")}>
              <rect width="400" height="40" fill={isAnalyzing ? GOLD_DIM : "rgba(255,215,0,0.1)"} stroke={GOLD} strokeWidth="1.5" />
              <text x="200" y="26" textAnchor="middle" fill={GOLD} fontSize="14" letterSpacing="0.1em">
                {isAnalyzing ? "SYSTEM SCANNING..." : "✨ RUN FULL AI DIAGNOSTIC ✨"}
              </text>
           </g>

           <text x="30" y="740" fill={GOLD} fontSize="12" opacity="0.8">DESIGN LAB - AERION SPORTS INNOVATION</text>
        </g>
      </svg>

      {/* AI TERMINAL OVERLAY */}
      <div className={`absolute left-4 md:left-10 bottom-4 md:bottom-10 w-[calc(100%-32px)] md:w-[420px] p-8 border border-[#ffd700] bg-black/90 backdrop-blur-xl text-[#ffd700] transition-all duration-500 z-50 pointer-events-auto ${activeTopic ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="flex justify-between items-center mb-6 border-b border-[#ffd700]/30 pb-2">
           <h3 className="text-sm tracking-[0.3em] font-bold">✨ AI DIAGNOSTICS</h3>
           <button onClick={() => setActiveTopic("")} className="hover:text-white pointer-events-auto">✕</button>
        </div>
        <div className="text-[10px] text-[#ffd700]/60 mb-4 tracking-widest">ANALYSIS TARGET: {activeTopic}</div>
        <div className="text-sm leading-relaxed min-h-[100px] tracking-wide">
          {isAnalyzing ? (
            <div className="flex flex-col gap-4">
               <div className="animate-pulse">Accessing Aerion Cloud Databanks...</div>
               <div className="h-1 bg-[#ffd700]/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#ffd700] w-1/3 animate-loading"></div>
               </div>
            </div>
          ) : <p>{aiResponse}</p>}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;700&display=swap');
        * { font-family: 'Oswald', sans-serif; }
        
        .animate-loading { 
          animation: loading 1.2s infinite ease-in-out; 
        }
        @keyframes loading {
          0% { left: -33%; }
          100% { left: 100%; }
        }

        .shuttle {
          animation: shimmer 4s linear infinite;
        }
        @keyframes shimmer {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
          100% { filter: brightness(1); }
        }

        .feather-path {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw 2s ease forwards;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }

        .pointer-label {
          transition: filter 0.2s;
        }
        .pointer-label:hover {
          filter: brightness(1.5);
        }
        .pointer-label:hover line {
          stroke: #ffd700;
          stroke-width: 3;
        }
        .hover-glow {
          transition: text-shadow 0.2s;
        }
        .pointer-label:hover .hover-glow {
          text-shadow: 0 0 8px rgba(255,215,0,0.6);
        }

        .radial-diagram {
          animation: rotateRadial 15s linear infinite;
        }
        @keyframes rotateRadial {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .flicker-effect {
          animation: flicker 6s infinite;
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.98; }
        }
      `}</style>
    </div>
  );
}
