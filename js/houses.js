/* Casas, brasões (escudo com a inicial) e ampulhetas (SVG originais) */
(function () {
  const HOUSES = [
    {
      key: "grifinoria", name: "Grifinória",
      field: ["#a3242a", "#5a0a0e"], metal: "gold",
      sand: ["#ff6b5a", "#c4121e", "#6e0710"], gem: "#d11d26"
    },
    {
      key: "sonserina", name: "Sonserina",
      field: ["#23774a", "#0a2e19"], metal: "silver",
      sand: ["#7dffb0", "#16a856", "#06522a"], gem: "#17b45c"
    },
    {
      key: "corvinal", name: "Corvinal",
      field: ["#2a4f9e", "#0c1a44"], metal: "bronze",
      sand: ["#8fbaff", "#2557d6", "#0f246e"], gem: "#2f63e0"
    },
    {
      key: "lufalufa", name: "Lufa-Lufa",
      field: ["#f6cf3a", "#c58f0c"], metal: "black",
      sand: ["#fff3a6", "#f2c418", "#a7790a"], gem: "#f2c418"
    }
  ];
  const BY_KEY = Object.fromEntries(HOUSES.map(h => [h.key, h]));

  const METALS = {
    gold:   ["#fff2c2", "#e9c46a", "#a87b23", "#f1d27f", "#7a5716"],
    silver: ["#ffffff", "#d4d9de", "#8a929a", "#eef1f4", "#6c737b"],
    bronze: ["#ffe2bf", "#d39a5c", "#8a5426", "#e8b27a", "#6a3d18"],
    black:  ["#5a5248", "#2a2620", "#0e0c0a", "#3a342c", "#060504"]
  };
  function metalDefs(id, kind) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      ${METALS[kind].map((c, i) => `<stop offset="${[0, .28, .55, .8, 1][i]}" stop-color="${c}"/>`).join("")}
    </linearGradient>`;
  }

  /* ---------- Brasão da casa: escudo nas cores da casa com a inicial ---------- */
  const SHIELD = "M24 14 H136 V70 C136 112 110 134 80 148 C50 134 24 112 24 70 Z";
  const SHIELD_IN = "M33 23 H127 V70 C127 106 104 125 80 137 C56 125 33 106 33 70 Z";

  function crestSVG(key, opts = {}) {
    const h = BY_KEY[key];
    const id = `cr-${key}-${opts.uid || "a"}`;
    const ink = h.metal === "black" ? "#f6cf3a" : "#1a1206";
    return `
    <svg class="crest" viewBox="0 0 160 186" role="img" aria-label="Brasão da ${h.name}">
      <defs>
        ${metalDefs(id + "-metal", h.metal)}
        ${metalDefs(id + "-gold", "gold")}
        <linearGradient id="${id}-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${h.field[0]}"/><stop offset="1" stop-color="${h.field[1]}"/>
        </linearGradient>
        <radialGradient id="${id}-sheen" cx=".32" cy=".18" r=".85">
          <stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <filter id="${id}-emboss" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.2" flood-color="#000" flood-opacity=".55"/>
        </filter>
      </defs>
      <!-- escudo -->
      <path d="${SHIELD}" fill="url(#${id}-field)"/>
      <path d="${SHIELD}" fill="url(#${id}-sheen)"/>
      <path d="${SHIELD_IN}" fill="none" stroke="url(#${id}-metal)" stroke-width="1.6" opacity=".9"/>
      ${h.metal === "black" ? `<path d="${SHIELD}" fill="none" stroke="url(#${id}-gold)" stroke-width="7.5"/>` : ""}
      <path d="${SHIELD}" fill="none" stroke="url(#${id}-metal)" stroke-width="5"/>
      <path d="${SHIELD}" fill="none" stroke="#00000066" stroke-width="1"/>
      <!-- pequena estrela no alto -->
      <path d="M80 30 l2.6 5.4 5.9.8-4.3 4.1 1 5.8L80 43.3l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="url(#${id}-metal)" opacity=".95"/>
      <!-- inicial -->
      <text x="80" y="112" text-anchor="middle" font-family="Cinzel Decorative, Cinzel, serif" font-weight="900"
            font-size="66" fill="url(#${id}-metal)" stroke="${ink}" stroke-opacity=".35" stroke-width=".8"
            filter="url(#${id}-emboss)">${h.name[0]}</text>
      <!-- faixa com o nome -->
      <path d="M8 156 L26 150 L26 174 L8 180 L15 168 Z" fill="#8a6418"/>
      <path d="M152 156 L134 150 L134 174 L152 180 L145 168 Z" fill="#8a6418"/>
      <path d="M22 148 Q80 164 138 148 L138 170 Q80 186 22 170 Z" fill="url(#${id}-gold)" stroke="#5a3f0c" stroke-width="1"/>
      <text x="80" y="170" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="12.5"
            letter-spacing="1" fill="#3b2a0b">${h.name.toUpperCase()}</text>
    </svg>`;
  }

  /* ---------- Ampulhetas: estante de bronze com 4 tubos ---------- */
  const COL = 100, TOP_FULL = 82, TOP_EMPTY = 150, BOT_BASE = 404, BOT_FULL = 190;

  function tube(h, i) {
    const cx = i * COL + 50;
    const top = `M${cx - 22} 78 H${cx + 22} V128 C${cx + 22} 142 ${cx + 4} 148 ${cx + 3} 156 H${cx - 3} C${cx - 4} 148 ${cx - 22} 142 ${cx - 22} 128 Z`;
    const bot = `M${cx - 3} 160 C${cx - 4} 166 ${cx - 20} 170 ${cx - 20} 182 V366 C${cx - 26} 368 ${cx - 28} 374 ${cx - 28} 380 C${cx - 28} 396 ${cx - 14} 404 ${cx} 404 C${cx + 14} 404 ${cx + 28} 396 ${cx + 28} 380 C${cx + 28} 374 ${cx + 26} 368 ${cx + 20} 366 V182 C${cx + 20} 170 ${cx + 4} 166 ${cx + 3} 160 Z`;
    const sid = `hg-${h.key}`;
    const sparks = Array.from({ length: 7 }, (_, k) =>
      `<circle class="spark" cx="${cx - 14 + ((k * 37) % 28)}" cy="${200 + ((k * 53) % 150)}" r="${k % 3 ? .9 : 1.3}" style="animation-delay:${(-k * .7).toFixed(1)}s"/>`).join("");
    return `
      <g class="tube" data-house="${h.key}">
        <defs>
          <linearGradient id="${sid}-sand" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="${h.sand[2]}"/><stop offset=".35" stop-color="${h.sand[1]}"/>
            <stop offset=".6" stop-color="${h.sand[0]}"/><stop offset="1" stop-color="${h.sand[2]}"/>
          </linearGradient>
          <clipPath id="${sid}-top"><path d="${top}"/></clipPath>
          <clipPath id="${sid}-bot"><path d="${bot}"/></clipPath>
        </defs>
        <!-- vidro -->
        <path d="${top}" fill="url(#rk-glass)"/>
        <path d="${bot}" fill="url(#rk-glass)"/>
        <!-- areia de cima -->
        <g clip-path="url(#${sid}-top)">
          <rect class="sand-top" x="${cx - 30}" y="${TOP_FULL}" width="60" height="${160 - TOP_FULL}" fill="url(#${sid}-sand)"/>
          <rect class="sand-top" x="${cx - 30}" y="${TOP_FULL}" width="60" height="${160 - TOP_FULL}" fill="url(#rk-glint)"/>
        </g>
        <!-- fio -->
        <rect class="sand-stream" x="${cx - .9}" y="156" width="1.8" height="0" fill="${h.sand[0]}"/>
        <!-- areia de baixo -->
        <g clip-path="url(#${sid}-bot)">
          <rect class="sand-bot" x="${cx - 30}" y="${BOT_BASE}" width="60" height="0" fill="url(#${sid}-sand)"/>
          <rect class="sand-bot glint" x="${cx - 30}" y="${BOT_BASE}" width="60" height="0" fill="url(#rk-glint)"/>
          <g class="sparks" fill="${h.sand[0]}">${sparks}</g>
        </g>
        <!-- reflexos -->
        <path d="${top}" fill="none" stroke="#fff8e6" stroke-opacity=".5" stroke-width="1"/>
        <path d="${bot}" fill="none" stroke="#fff8e6" stroke-opacity=".5" stroke-width="1"/>
        <path d="M${cx - 15} 86 V130 M${cx - 14} 186 V360" stroke="#fff" stroke-opacity=".35" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M${cx + 14} 190 V350" stroke="#fff" stroke-opacity=".12" stroke-width="1.4" stroke-linecap="round"/>
        <!-- tampa de bronze -->
        <path d="M${cx - 27} 74 Q${cx - 27} 50 ${cx} 46 Q${cx + 27} 50 ${cx + 27} 74 Z" fill="url(#rk-bronze)" stroke="#3d2a0a" stroke-width="1"/>
        <path d="M${cx - 20} 62 Q${cx} 54 ${cx + 20} 62" stroke="#fff3c4" stroke-opacity=".5" fill="none" stroke-width="1.2"/>
        <rect x="${cx - 30}" y="72" width="60" height="8" rx="2" fill="url(#rk-bronze)" stroke="#3d2a0a" stroke-width=".8"/>
        <path d="M${cx} 22 L${cx + 4} 38 L${cx - 4} 38 Z" fill="url(#rk-bronze)"/>
        <circle cx="${cx}" cy="42" r="5.5" fill="${h.gem}" stroke="url(#rk-bronze)" stroke-width="1.6"/>
        <circle cx="${cx - 1.6}" cy="40.4" r="1.6" fill="#fff" opacity=".7"/>
        <!-- anel do gargalo -->
        <rect x="${cx - 7}" y="153" width="14" height="7" rx="2" fill="url(#rk-bronze)"/>
        <!-- aro e pé da taça -->
        <rect x="${cx - 30}" y="364" width="60" height="7" rx="2" fill="url(#rk-bronze)" stroke="#3d2a0a" stroke-width=".8"/>
        <path d="M${cx - 30} 380 C${cx - 30} 398 ${cx - 15} 408 ${cx} 408 C${cx + 15} 408 ${cx + 30} 398 ${cx + 30} 380" fill="none" stroke="url(#rk-bronze)" stroke-width="3"/>
        <path d="M${cx - 12} 408 H${cx + 12} L${cx + 18} 420 H${cx - 18} Z" fill="url(#rk-bronze)" stroke="#3d2a0a" stroke-width=".8"/>
      </g>`;
  }

  function rod(x) {
    return `
      <g class="rod">
        <rect x="${x - 2}" y="14" width="4" height="414" rx="1.5" fill="url(#rk-rod)"/>
        <path d="M${x} 0 L${x + 3} 8 L${x} 14 L${x - 3} 8 Z M${x - 9} 8 H${x + 9}" fill="url(#rk-bronze)" stroke="url(#rk-bronze)" stroke-width="2"/>
        <path d="M${x} 440 L${x + 3} 432 L${x} 426 L${x - 3} 432 Z M${x - 9} 432 H${x + 9}" fill="url(#rk-bronze)" stroke="url(#rk-bronze)" stroke-width="2"/>
        <circle cx="${x}" cy="95" r="4" fill="url(#rk-bronze)"/>
        <circle cx="${x}" cy="350" r="4" fill="url(#rk-bronze)"/>
      </g>`;
  }

  function rackSVG() {
    const W = COL * HOUSES.length;
    return `
    <svg class="rack" viewBox="-8 0 ${W + 16} 442" role="img" aria-label="Ampulhetas das quatro casas">
      <defs>
        <linearGradient id="rk-bronze" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f7dc95"/><stop offset=".3" stop-color="#c08a33"/>
          <stop offset=".6" stop-color="#6e4a14"/><stop offset=".85" stop-color="#d9a955"/><stop offset="1" stop-color="#5a3c0e"/>
        </linearGradient>
        <linearGradient id="rk-rod" x1="0" x2="1">
          <stop offset="0" stop-color="#5a3c0e"/><stop offset=".5" stop-color="#f3d38a"/><stop offset="1" stop-color="#5a3c0e"/>
        </linearGradient>
        <linearGradient id="rk-glass" x1="0" x2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".25" stop-color="#fff" stop-opacity=".04"/>
          <stop offset=".75" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".15"/>
        </linearGradient>
        <linearGradient id="rk-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".03"/>
        </linearGradient>
        <pattern id="rk-glint" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="2" r=".5" fill="#fff" opacity=".8"/><circle cx="4.5" cy="5" r=".35" fill="#fff" opacity=".5"/>
        </pattern>
      </defs>
      <!-- placas de vidro da estante -->
      <rect x="0" y="86" width="${W}" height="22" fill="url(#rk-plate)" stroke="#c9a25a" stroke-opacity=".55" stroke-width="1.2"/>
      <rect x="0" y="338" width="${W}" height="22" fill="url(#rk-plate)" stroke="#c9a25a" stroke-opacity=".55" stroke-width="1.2"/>
      ${HOUSES.map(tube).join("")}
      ${Array.from({ length: HOUSES.length + 1 }, (_, i) => rod(i * COL)).join("")}
    </svg>`;
  }

  /* Ajusta a areia de um tubo para a fração f (0..1 = quanto já desceu) */
  function setSand(g, f, flowing) {
    f = Math.max(0, Math.min(1, f));
    const yt = TOP_FULL + f * (TOP_EMPTY - TOP_FULL);
    g.querySelectorAll(".sand-top").forEach(r => {
      r.setAttribute("y", yt.toFixed(2));
      r.setAttribute("height", Math.max(0, 160 - yt).toFixed(2));
    });
    const yb = BOT_BASE - f * (BOT_BASE - BOT_FULL);
    g.querySelectorAll(".sand-bot").forEach(r => {
      r.setAttribute("y", yb.toFixed(2));
      r.setAttribute("height", (BOT_BASE - yb).toFixed(2));
    });
    const stream = g.querySelector(".sand-stream");
    const show = flowing && f < 0.999;
    stream.setAttribute("height", show ? Math.max(0, yb - 156).toFixed(2) : "0");
    stream.classList.toggle("on", show);
    g.querySelector(".sparks").classList.toggle("on", show);
  }

  window.HRM_HOUSES = { HOUSES, BY_KEY, crestSVG, rackSVG, setSand };
})();
