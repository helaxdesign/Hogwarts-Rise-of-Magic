/* Casas, brasões e ampulhetas (SVG desenhados à mão, originais) */
(function () {
  const HOUSES = [
    {
      key: "grifinoria", name: "Grifinória", animal: "Leão", motto: "Coragem",
      field: ["#9b1b1b", "#560909"], metal: "#e8c26a", letter: "#f6dc94",
      sand: ["#ff6b5a", "#b3121b", "#6e0710"], glow: "rgba(230,60,50,.45)"
    },
    {
      key: "corvinal", name: "Corvinal", animal: "Águia", motto: "Sabedoria",
      field: ["#24438f", "#0d1838"], metal: "#c99a5b", letter: "#f0cf94",
      sand: ["#7fb0ff", "#2650c4", "#10276e"], glow: "rgba(70,120,255,.45)"
    },
    {
      key: "sonserina", name: "Sonserina", animal: "Serpente", motto: "Ambição",
      field: ["#1f6a3d", "#0a2b17"], metal: "#cfd6dc", letter: "#e7ecef",
      sand: ["#6dfaa5", "#14a352", "#06522a"], glow: "rgba(40,200,110,.42)"
    },
    {
      key: "lufalufa", name: "Lufa-Lufa", animal: "Texugo", motto: "Lealdade",
      field: ["#f0c43c", "#b0820f"], metal: "#2a2418", letter: "#2a2418",
      sand: ["#fff1a0", "#f2c418", "#a7790a"], glow: "rgba(255,205,40,.45)"
    }
  ];
  const BY_KEY = Object.fromEntries(HOUSES.map(h => [h.key, h]));

  const SHIELD = "M14 18 H86 V58 C86 88 66 104 50 114 C34 104 14 88 14 58 Z";
  const SHIELD_IN = "M20 24 H80 V58 C80 84 63 98 50 107 C37 98 20 84 20 58 Z";

  function star(cx, cy, r, fill) {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const rr = i % 2 ? r * 0.45 : r;
      d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(2) + " " + (cy + rr * Math.sin(a)).toFixed(2);
    }
    return `<path d="${d}Z" fill="${fill}"/>`;
  }

  function goldDefs(id) {
    return `
      <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff2c2"/><stop offset=".28" stop-color="#e9c46a"/>
        <stop offset=".55" stop-color="#a87b23"/><stop offset=".8" stop-color="#f1d27f"/>
        <stop offset="1" stop-color="#8a621a"/>
      </linearGradient>`;
  }

  /* Brasão de uma casa */
  function crestSVG(key, opts = {}) {
    const h = BY_KEY[key];
    const id = `cr-${key}-${opts.uid || "a"}`;
    const isLufa = key === "lufalufa";
    return `
    <svg class="crest" viewBox="0 0 100 130" role="img" aria-label="Brasão da ${h.name}">
      <defs>
        ${goldDefs(id)}
        <linearGradient id="${id}-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${h.field[0]}"/><stop offset="1" stop-color="${h.field[1]}"/>
        </linearGradient>
        <radialGradient id="${id}-sheen" cx=".35" cy=".25" r=".8">
          <stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="${id}-clip"><path d="${SHIELD}"/></clipPath>
      </defs>
      <!-- ornamento superior -->
      <path d="M50 2 L54 9 L50 16 L46 9 Z" fill="url(#${id}-gold)"/>
      <path d="M30 14 C38 6 44 12 50 12 C56 12 62 6 70 14" fill="none" stroke="url(#${id}-gold)" stroke-width="1.6"/>
      <circle cx="30" cy="14" r="2" fill="url(#${id}-gold)"/><circle cx="70" cy="14" r="2" fill="url(#${id}-gold)"/>
      <!-- escudo -->
      <path d="${SHIELD}" fill="url(#${id}-field)"/>
      <g clip-path="url(#${id}-clip)">
        <rect x="0" y="18" width="100" height="20" fill="${isLufa ? "#2a2418" : h.metal}" opacity="${isLufa ? ".9" : ".92"}"/>
        ${star(32, 28, 4.2, isLufa ? "#f0c43c" : h.field[1])}
        ${star(50, 28, 4.2, isLufa ? "#f0c43c" : h.field[1])}
        ${star(68, 28, 4.2, isLufa ? "#f0c43c" : h.field[1])}
        <rect x="0" y="0" width="100" height="130" fill="url(#${id}-sheen)"/>
      </g>
      <path d="${SHIELD}" fill="none" stroke="url(#${id}-gold)" stroke-width="3.2"/>
      <path d="${SHIELD_IN}" fill="none" stroke="url(#${id}-gold)" stroke-width=".8" opacity=".7"/>
      <text x="50" y="86" text-anchor="middle" font-family="Cinzel Decorative, serif" font-weight="700"
            font-size="34" fill="${h.letter}" stroke="${isLufa ? "#00000033" : "#00000055"}" stroke-width=".6">${h.name[0]}</text>
      <!-- faixa -->
      <path d="M8 112 L20 108 L20 124 L8 128 L13 120 Z" fill="#7a5a1e"/>
      <path d="M92 112 L80 108 L80 124 L92 128 L87 120 Z" fill="#7a5a1e"/>
      <path d="M18 106 Q50 116 82 106 L82 122 Q50 132 18 122 Z" fill="url(#${id}-gold)"/>
      <text x="50" y="121.5" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="7.4"
            letter-spacing="1.2" fill="#3b2a0b">${h.animal.toUpperCase()}</text>
    </svg>`;
  }

  /* Brasão de Hogwarts (esquartelado) para a carta */
  function hogwartsCrestSVG() {
    const id = "cr-hw";
    const q = HOUSES;
    return `
    <svg class="crest" viewBox="0 0 100 130" role="img" aria-label="Brasão de Hogwarts">
      <defs>
        ${goldDefs(id)}
        <clipPath id="${id}-clip"><path d="${SHIELD}"/></clipPath>
      </defs>
      <path d="M50 2 L54 9 L50 16 L46 9 Z" fill="url(#${id}-gold)"/>
      <path d="M30 14 C38 6 44 12 50 12 C56 12 62 6 70 14" fill="none" stroke="url(#${id}-gold)" stroke-width="1.6"/>
      <g clip-path="url(#${id}-clip)">
        <rect x="0" y="0" width="50" height="66" fill="${q[0].field[0]}"/>
        <rect x="50" y="0" width="50" height="66" fill="${q[2].field[0]}"/>
        <rect x="0" y="66" width="50" height="64" fill="${q[3].field[0]}"/>
        <rect x="50" y="66" width="50" height="64" fill="${q[1].field[0]}"/>
        <path d="M50 0 V130 M0 66 H100" stroke="url(#${id}-gold)" stroke-width="5"/>
      </g>
      <path d="${SHIELD}" fill="none" stroke="url(#${id}-gold)" stroke-width="3.2"/>
      <circle cx="50" cy="64" r="15" fill="#f4e6c2" stroke="url(#${id}-gold)" stroke-width="2.5"/>
      <text x="50" y="72.5" text-anchor="middle" font-family="Cinzel Decorative, serif" font-weight="900" font-size="23" fill="#5a3d0c">H</text>
      <path d="M18 106 Q50 116 82 106 L82 122 Q50 132 18 122 Z" fill="url(#${id}-gold)"/>
      <text x="50" y="121.2" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="6.2"
            letter-spacing=".6" fill="#3b2a0b">HOGWARTS</text>
    </svg>`;
  }

  /* Ampulheta. A fração "f" (0..1) é a parte da areia que já desceu. */
  const GLASS = "M24 20 L96 20 C96 64 66 94 63 112 C66 130 96 160 96 204 L24 204 C24 160 54 130 57 112 C54 94 24 64 24 20 Z";
  const TOP_BULB = "M24 20 L96 20 C96 64 66 94 63 112 L57 112 C54 94 24 64 24 20 Z";
  const BOT_BULB = "M57 112 L63 112 C66 130 96 160 96 204 L24 204 C24 160 54 130 57 112 Z";

  function hourglassSVG(key) {
    const h = BY_KEY[key];
    const id = `hg-${key}`;
    return `
    <svg class="hourglass" viewBox="0 0 120 230" role="img" aria-label="Ampulheta da ${h.name}">
      <defs>
        ${goldDefs(id)}
        <linearGradient id="${id}-rod" x1="0" x2="1">
          <stop offset="0" stop-color="#7a5716"/><stop offset=".45" stop-color="#ffe7a6"/><stop offset="1" stop-color="#7a5716"/>
        </linearGradient>
        <linearGradient id="${id}-sand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${h.sand[0]}"/><stop offset=".5" stop-color="${h.sand[1]}"/><stop offset="1" stop-color="${h.sand[2]}"/>
        </linearGradient>
        <linearGradient id="${id}-glass" x1="0" x2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".2" stop-color="#fff" stop-opacity=".03"/>
          <stop offset=".8" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/>
        </linearGradient>
        <pattern id="${id}-glint" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="2" r=".55" fill="#fff" opacity=".75"/>
          <circle cx="5" cy="5.5" r=".4" fill="#fff" opacity=".45"/>
        </pattern>
        <clipPath id="${id}-top"><path d="${TOP_BULB}"/></clipPath>
        <clipPath id="${id}-bot"><path d="${BOT_BULB}"/></clipPath>
      </defs>

      <!-- vidro -->
      <path d="${GLASS}" fill="url(#${id}-glass)"/>

      <!-- areia superior -->
      <g clip-path="url(#${id}-top)">
        <rect class="sand-top" x="0" y="24" width="120" height="88" fill="url(#${id}-sand)"/>
        <rect class="sand-top glint" x="0" y="24" width="120" height="88" fill="url(#${id}-glint)"/>
      </g>
      <!-- fio de areia caindo -->
      <rect class="sand-stream" x="59.1" y="110" width="1.8" height="0" fill="${h.sand[0]}"/>
      <!-- areia inferior -->
      <g clip-path="url(#${id}-bot)">
        <path class="sand-bot" d="" fill="url(#${id}-sand)"/>
        <path class="sand-bot glint" d="" fill="url(#${id}-glint)"/>
      </g>

      <!-- contorno e reflexo do vidro -->
      <path d="${GLASS}" fill="none" stroke="#fff6dc" stroke-opacity=".55" stroke-width="1.2"/>
      <path d="M31 28 C33 58 46 82 54 98" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
      <path d="M31 196 C33 168 44 146 53 130" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2" stroke-linecap="round"/>

      <!-- colunas -->
      <rect x="7" y="16" width="5" height="192" rx="2" fill="url(#${id}-rod)"/>
      <rect x="108" y="16" width="5" height="192" rx="2" fill="url(#${id}-rod)"/>
      <g fill="url(#${id}-gold)">
        <ellipse cx="9.5" cy="66" rx="4.5" ry="3"/><ellipse cx="110.5" cy="66" rx="4.5" ry="3"/>
        <ellipse cx="9.5" cy="112" rx="5" ry="4"/><ellipse cx="110.5" cy="112" rx="5" ry="4"/>
        <ellipse cx="9.5" cy="158" rx="4.5" ry="3"/><ellipse cx="110.5" cy="158" rx="4.5" ry="3"/>
      </g>

      <!-- tampas -->
      <path d="M2 10 Q60 0 118 10 L118 20 L2 20 Z" fill="url(#${id}-gold)"/>
      <rect x="6" y="18" width="108" height="4" rx="1.5" fill="#6b4a12"/>
      <path d="M2 214 Q60 224 118 214 L118 206 L2 206 Z" fill="url(#${id}-gold)"/>
      <rect x="6" y="203" width="108" height="4" rx="1.5" fill="#6b4a12"/>
      <circle cx="60" cy="8" r="3" fill="${h.sand[1]}" stroke="url(#${id}-gold)" stroke-width="1"/>
      <circle cx="60" cy="217" r="3" fill="${h.sand[1]}" stroke="url(#${id}-gold)" stroke-width="1"/>
    </svg>`;
  }

  /* Ajusta a areia de uma ampulheta para a fração f (0..1 = quanto já desceu) */
  function setSand(svg, f, flowing) {
    f = Math.max(0, Math.min(1, f));
    const topY = 26 + f * (112 - 26);
    svg.querySelectorAll(".sand-top").forEach(r => {
      r.setAttribute("y", topY.toFixed(2));
      r.setAttribute("height", Math.max(0, 112 - topY).toFixed(2));
    });
    // a câmara inferior é mais larga embaixo: usa raiz para encher de modo natural
    const fill = Math.sqrt(f);
    const yb = 204 - fill * (204 - 126);
    const mound = 7 * Math.min(1, f * 6);
    const d = f < 0.002 ? "" :
      `M0 206 L0 ${(yb + mound).toFixed(2)} Q60 ${(yb - mound).toFixed(2)} 120 ${(yb + mound).toFixed(2)} L120 206 Z`;
    svg.querySelectorAll(".sand-bot").forEach(p => p.setAttribute("d", d));
    const stream = svg.querySelector(".sand-stream");
    const show = flowing && f < 0.999;
    stream.setAttribute("height", show ? Math.max(0, yb - 110 - mound * 0.5).toFixed(2) : "0");
    stream.classList.toggle("on", show);
  }

  window.HRM_HOUSES = { HOUSES, BY_KEY, crestSVG, hogwartsCrestSVG, hourglassSVG, setSand };
})();
