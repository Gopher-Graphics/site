

interface Orb {
  w: number;
  h: number;
  top: string;
  left: string;
  c1: string;
  c2: string;
  dur: string;
  delay: string;
  opacity: number;
}

export function Orbs() {
  const orbs: Orb[] = [
    { w:700, h:700, top:"-15%", left:"-12%", c1:"#7A0019", c2:"#aa0025", dur:"20s", delay:"0s",   opacity:0.4  },
    { w:550, h:550, top:"42%",  left:"60%",  c1:"#FFCC33", c2:"#bb8800", dur:"24s", delay:"-6s",  opacity:0.3  },
    { w:480, h:480, top:"60%",  left:"5%",   c1:"#8B0020", c2:"#FFCC33", dur:"28s", delay:"-10s", opacity:0.25 },
    { w:400, h:400, top:"5%",   left:"55%",  c1:"#FFCC33", c2:"#7A0019", dur:"22s", delay:"-3s",  opacity:0.3  },
    { w:300, h:300, top:"25%",  left:"30%",  c1:"#cc2200", c2:"#ffaa00", dur:"17s", delay:"-8s",  opacity:0.2  },
    { w:240, h:240, top:"70%",  left:"75%",  c1:"#7A0019", c2:"#dd3322", dur:"19s", delay:"-12s", opacity:0.22 },
    { w:180, h:180, top:"15%",  left:"80%",  c1:"#FFE488", c2:"#FFCC33", dur:"14s", delay:"-5s",  opacity:0.18 },
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep maroon gradient base */}
      <div className="absolute inset-0" style={{ background:"linear-gradient(145deg, #0f0003 0%, #2a000a 25%, #1f0006 45%, #380010 65%, #1a0005 85%, #0a0002 100%)" }} />

      {/* Warm ambient zone */}
      <div className="absolute" style={{ top:"15%", left:"40%", width:"60%", height:"60%", background:"radial-gradient(ellipse at center, rgba(180,80,0,0.06), transparent 70%)", filter:"blur(40px)" }} />

      {/* Orbs */}
      {orbs.map((o, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: o.w, height: o.h, top: o.top, left: o.left,
          background: `radial-gradient(circle at 38% 38%, ${o.c1}88, ${o.c2}44, transparent 68%)`,
          opacity: o.opacity,
          filter: "blur(70px)",
          animation: `orbFloat ${o.dur} ease-in-out infinite alternate`,
          animationDelay: o.delay,
        }} />
      ))}

      {/* Faint grid overlay */}
      <div className="absolute inset-0" style={{ backgroundImage:"linear-gradient(rgba(255,204,51,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,204,51,.025) 1px,transparent 1px)", backgroundSize:"52px 52px" }} />

      {/* Top vignette */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height:"30%", background:"linear-gradient(180deg, rgba(0,0,0,0.3), transparent)" }} />

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height:"20%", background:"linear-gradient(0deg, rgba(0,0,0,0.4), transparent)" }} />

      {/* Subtle noise texture */}
      <div className="absolute inset-0" style={{ opacity:0.03, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"128px 128px" }} />
    </div>
  );
}
