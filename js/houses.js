/* Casas, brasões heráldicos e ampulhetas (SVG originais, desenhados à mão) */
(function () {
  const HOUSES = [
    {
      key: "grifinoria", name: "Grifinória",
      mantle: ["#b3262a", "#5c0a0d"], trim: "gold",
      field: ["#f3dc95", "#d9b45a"], charge: "#9b1b1b", animal: "lion",
      sand: ["#ff6b5a", "#c4121e", "#6e0710"], gem: "#d11d26"
    },
    {
      key: "sonserina", name: "Sonserina",
      mantle: ["#2a8a51", "#0b3a1e"], trim: "silver",
      field: ["#2b7a49", "#0f3d22"], charge: "#e3e8ec", animal: "snake",
      sand: ["#7dffb0", "#16a856", "#06522a"], gem: "#17b45c"
    },
    {
      key: "corvinal", name: "Corvinal",
      mantle: ["#2d58b8", "#0d1d4d"], trim: "silver",
      field: ["#c9daf2", "#8eabd6"], charge: "#13254f", animal: "bird",
      sand: ["#8fbaff", "#2557d6", "#0f246e"], gem: "#2f63e0"
    },
    {
      key: "lufalufa", name: "Lufa-Lufa",
      mantle: ["#f0c43c", "#9a6d0b"], trim: "gold",
      field: ["#f7e7a6", "#e5c766"], charge: "#4a4a4a", animal: "badger",
      sand: ["#fff3a6", "#f2c418", "#a7790a"], gem: "#f2c418"
    }
  ];
  const BY_KEY = Object.fromEntries(HOUSES.map(h => [h.key, h]));

  /* ---------- Animais (caixa 100×100) ---------- */
  const ANIMALS = {
    lion: c => `
      <g fill="${c}">
        <path d="M60 62 C78 60 88 46 82 32 C80 26 84 20 90 22" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M90 22 l4 -6 l1 7 l6 1 l-6 4 z"/>
        <path d="M36 32 C48 34 60 44 64 58 C66 68 62 76 54 76 C48 72 44 62 38 54 C33 47 31 40 36 32 Z"/>
        <path d="M38 37 C30 35 24 33 17 35 L13 30 L19 31 L16 26 L22 29 C28 29 35 29 41 31 Z"/>
        <path d="M41 46 C33 48 27 51 21 56 L16 53 L21 52 L18 47 L24 49 C30 45 34 42 40 41 Z"/>
        <path d="M58 68 C60 78 58 86 54 92 L44 93 L46 89 L55 88 C57 82 57 76 55 70 Z"/>
        <path d="M54 70 C48 76 42 80 34 82 L30 88 L28 83 L34 78 C42 76 48 72 52 66 Z"/>
        <path d="M36 9 L39 15 L45 11 L45 18 L52 17 L49 23 L55 26 L49 29 L52 35 L45 34 L44 40 L38 36 L33 41 L31 35 L25 37 L27 31 L22 27 L28 25 L26 18 L32 20 Z"/>
        <path d="M30 22 C24 21 18 24 16 28 C18 32 24 33 30 32 Z"/>
      </g>
      <circle cx="29" cy="24" r="1.4" fill="#fff6d8"/>`,
    snake: c => `
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M62 16 C40 8 22 22 36 36 C50 50 76 50 70 70 C64 88 34 90 28 74 C25 66 32 60 40 62" stroke="#00000066" stroke-width="13"/>
        <path d="M62 16 C40 8 22 22 36 36 C50 50 76 50 70 70 C64 88 34 90 28 74 C25 66 32 60 40 62" stroke="${c}" stroke-width="9"/>
        <path d="M62 16 C40 8 22 22 36 36 C50 50 76 50 70 70 C64 88 34 90 28 74 C25 66 32 60 40 62" stroke="#ffffff" stroke-opacity=".55" stroke-width="2" stroke-dasharray="2 4"/>
      </g>
      <path d="M58 11 C66 8 76 10 78 16 C76 22 66 23 58 20 Z" fill="${c}" stroke="#00000066" stroke-width="1.4"/>
      <circle cx="70" cy="14.5" r="1.4" fill="#0c2a17"/>
      <path d="M78 16 L86 17 M86 17 L90 14 M86 17 L90 20" stroke="#b3262a" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
    bird: c => `
      <g fill="${c}">
        <path d="M50 50 C40 30 46 14 62 4 C60 16 66 20 74 14 C72 26 78 28 88 24 C82 40 72 50 60 55 Z"/>
        <path d="M18 44 C24 40 32 40 40 45 C50 51 62 53 74 55 L92 50 L86 58 L96 64 L76 64 C64 70 48 72 38 64 C32 60 26 54 18 52 Z"/>
        <path d="M19 45 L6 49 L19 52 Z"/>
        <path d="M42 50 C32 40 28 26 34 14 C38 24 44 26 50 22 C50 32 56 36 62 34 C60 44 54 50 48 54 Z" opacity=".82"/>
        <path d="M54 68 L56 80 L52 84 M56 80 L60 84 M62 68 L66 80 L62 84 M66 80 L70 84" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>
      <circle cx="22" cy="46.5" r="1.3" fill="#fff"/>
      <path d="M40 88 C52 84 64 86 76 90" stroke="#6b6355" stroke-width="5" stroke-linecap="round" fill="none"/>`,
    badger: c => `
      <g fill="${c}">
        <ellipse cx="57" cy="52" rx="29" ry="15"/>
        <path d="M36 42 C26 41 16 46 7 55 C15 60 26 62 38 62 Z"/>
        <circle cx="33" cy="41" r="4"/>
        <rect x="33" y="58" width="8" height="20" rx="3"/>
        <rect x="45" y="61" width="8" height="17" rx="3"/>
        <rect x="65" y="59" width="8" height="19" rx="3"/>
        <rect x="76" y="56" width="8" height="20" rx="3"/>
        <path d="M84 46 L95 41 L89 52 Z"/>
        <path d="M33 78 h-4 M45 78 h-4 M65 78 h-4 M76 76 h-4" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      </g>
      <path d="M9 55 C18 50 28 47 38 47" stroke="#f4efe2" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="51" r="1.2" fill="#111"/>`
  };
  const animal = (name, color, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${ANIMALS[name](color)}</g>`;

  function metalDefs(id, kind) {
    const stops = kind === "silver"
      ? ["#ffffff", "#d4d9de", "#8a929a", "#eef1f4", "#6c737b"]
      : ["#fff2c2", "#e9c46a", "#a87b23", "#f1d27f", "#7a5716"];
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      ${stops.map((c, i) => `<stop offset="${[0, .28, .55, .8, 1][i]}" stop-color="${c}"/>`).join("")}
    </linearGradient>`;
  }

  /* ---------- Brasão de casa (estilo heráldico com elmo e folhagens) ---------- */
  const SHIELD = "M46 58 H114 V98 C114 128 98 144 80 154 C62 144 46 128 46 98 Z";
  const MANTLE_L = "M70 44 C48 34 22 40 14 62 C8 80 16 98 30 104 C22 90 24 74 36 68 C28 82 32 98 44 104 C40 88 44 74 52 68 L46 60 Z M46 108 C26 108 12 124 18 146 C22 136 30 130 38 130 C32 142 36 156 48 160 C46 146 50 134 58 128 Z M30 104 C20 108 10 104 6 96 C10 112 22 118 34 114 Z";

  const CURLS = "M58 48 C40 42 24 50 22 66 C21 74 26 78 30 74 C33 70 30 66 27 68 M40 60 C34 66 34 78 40 86 M22 128 C26 120 34 118 40 122 C44 126 40 130 37 128 M30 140 C34 148 40 152 46 152";

  function crestSVG(key, opts = {}) {
    const h = BY_KEY[key];
    const id = `cr-${key}-${opts.uid || "a"}`;
    const mantle = `url(#${id}-mantle)`;
    let field = `<path d="${SHIELD}" fill="url(#${id}-field)"/>`;
    if (key === "lufalufa") {
      field += `<g clip-path="url(#${id}-clip)">${[0, 1, 2, 3].map(i =>
        `<rect x="${82 + i * 9}" y="58" width="4.5" height="100" fill="#1e1a14" opacity=".9"/>`).join("")}
        <path d="M46 58 H80 V160 H46 Z" fill="url(#${id}-field)"/></g>`;
    }
    if (key === "grifinoria") {
      field = `<path d="${SHIELD}" fill="url(#${id}-field)"/><path d="${SHIELD}" fill="none" stroke="#9b1b1b" stroke-width="7"/>`;
    }
    const chargeScale = .58;
    return `
    <svg class="crest" viewBox="0 0 160 186" role="img" aria-label="Brasão da ${h.name}">
      <defs>
        ${metalDefs(id + "-metal", h.trim)}
        ${metalDefs(id + "-gold", "gold")}
        ${metalDefs(id + "-steel", "silver")}
        <linearGradient id="${id}-mantle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${h.mantle[0]}"/><stop offset="1" stop-color="${h.mantle[1]}"/>
        </linearGradient>
        <linearGradient id="${id}-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${h.field[0]}"/><stop offset="1" stop-color="${h.field[1]}"/>
        </linearGradient>
        <radialGradient id="${id}-sheen" cx=".3" cy=".2" r=".9">
          <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="${id}-clip"><path d="${SHIELD}"/></clipPath>
      </defs>
      <!-- folhagem (manto) -->
      <g>
        <path d="${MANTLE_L}" fill="${mantle}" stroke="url(#${id}-metal)" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="${MANTLE_L}" fill="${mantle}" stroke="url(#${id}-metal)" stroke-width="2.2" stroke-linejoin="round" transform="translate(160 0) scale(-1 1)"/>
        <g fill="none" stroke="url(#${id}-metal)" stroke-width="1.3" stroke-linecap="round" opacity=".85">
          <path d="${CURLS}"/><path d="${CURLS}" transform="translate(160 0) scale(-1 1)"/>
        </g>
      </g>
      <!-- elmo -->
      <g>
        <path d="M64 15 C70 8 90 8 96 15 C92 19 68 19 64 15 Z" fill="${h.mantle[0]}" stroke="url(#${id}-metal)" stroke-width="1.4"/>
        <path d="M68 58 L66 32 C66 18 94 18 94 32 L92 58 Z" fill="url(#${id}-steel)" stroke="#3b4148" stroke-width="1.2"/>
        <path d="M70 32 H90 M70 37 H90 M70 42 H90" stroke="#2a2f35" stroke-width="2" stroke-linecap="round"/>
        <path d="M80 22 V54" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.2"/>
      </g>
      <!-- escudo -->
      ${field}
      <g clip-path="url(#${id}-clip)">
        ${animal(h.animal, h.charge, h.animal === "lion" ? 44 : 49, h.animal === "lion" ? 62 : 70, h.animal === "lion" ? .74 : chargeScale)}
        <rect x="40" y="50" width="80" height="110" fill="url(#${id}-sheen)"/>
      </g>
      <path d="${SHIELD}" fill="none" stroke="url(#${id}-metal)" stroke-width="4"/>
      <path d="${SHIELD}" fill="none" stroke="#00000055" stroke-width=".8" transform="translate(80 106) scale(.9) translate(-80 -106)"/>
      <!-- faixa -->
      <path d="M8 160 L26 154 L26 178 L8 184 L15 172 Z" fill="#8a6418"/>
      <path d="M152 160 L134 154 L134 178 L152 184 L145 172 Z" fill="#8a6418"/>
      <path d="M22 152 Q80 168 138 152 L138 174 Q80 190 22 174 Z" fill="url(#${id}-gold)" stroke="#5a3f0c" stroke-width="1"/>
      <text x="80" y="174" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="12.5"
            letter-spacing="1" fill="#3b2a0b">${h.name.toUpperCase()}</text>
    </svg>`;
  }

  /* ---------- Brasão de Hogwarts em tinta (carta e envelope) ---------- */
  function hogwartsCrestSVG(opts = {}) {
    const ink = opts.ink || "#2b1d0e";
    const paper = opts.paper || "transparent";
    const id = "hw-" + (opts.uid || "a");
    return `
    <svg class="crest hw-crest" viewBox="0 0 200 182" role="img" aria-label="Brasão de Hogwarts">
      <defs>
        <path id="${id}-motto" d="M34 150 Q100 182 166 150"/>
        <clipPath id="${id}-clip"><path d="M50 38 H150 V84 C150 122 124 144 100 156 C76 144 50 122 50 84 Z"/></clipPath>
      </defs>
      <g fill="none" stroke="${ink}" stroke-linejoin="round">
        <!-- faixa HOGWARTS -->
        <path d="M30 22 L44 16 L44 34 L30 38 L36 28 Z" fill="${ink}" stroke="none"/>
        <path d="M170 22 L156 16 L156 34 L170 38 L164 28 Z" fill="${ink}" stroke="none"/>
        <path d="M42 12 Q100 -2 158 12 L158 32 Q100 18 42 32 Z" fill="${paper === "transparent" ? "none" : paper}" stroke-width="1.6"/>
        <!-- escudo -->
        <path d="M50 38 H150 V84 C150 122 124 144 100 156 C76 144 50 122 50 84 Z" stroke-width="3" fill="${paper === "transparent" ? "none" : paper}"/>
        <path d="M55 43 H145 V84 C145 118 121 138 100 149 C79 138 55 118 55 84 Z" stroke-width="1"/>
        <g clip-path="url(#${id}-clip)" stroke-width="5"><path d="M100 38 V160 M46 90 H154"/></g>
        <g clip-path="url(#${id}-clip)" stroke="${paper === "transparent" ? "none" : paper}" stroke-width="1.6"><path d="M100 38 V160 M46 90 H154"/></g>
        <!-- mote -->
        <path d="M28 142 Q100 176 172 142 L176 156 Q100 190 24 156 Z" stroke-width="1.4" fill="${paper === "transparent" ? "none" : paper}"/>
      </g>
      <path id="${id}-motto-top" d="M44 28 Q100 14 156 28" fill="none"/>
      <text font-family="Cinzel, serif" font-weight="700" font-size="14.5" letter-spacing="1.6" fill="${ink}" text-anchor="middle">
        <textPath href="#${id}-motto-top" startOffset="50%">HOGWARTS</textPath></text>
      <path id="${id}-motto-low" d="M24 151 Q100 186 176 151" fill="none"/>
      <text font-family="Cinzel, serif" font-weight="600" font-size="5.9" letter-spacing=".2" fill="${ink}" text-anchor="middle">
        <textPath href="#${id}-motto-low" startOffset="50%">DRACO DORMIENS NUNQUAM TITILLANDUS</textPath></text>
      <g clip-path="url(#${id}-clip)">
        ${animal("lion", ink, 56, 42, .42)}
        ${animal("snake", ink, 104, 43, .42)}
        ${animal("badger", ink, 57, 95, .4)}
        ${animal("bird", ink, 104, 93, .4)}
      </g>
      <path d="M88 78 H112 V94 C112 102 106 106 100 108 C94 106 88 102 88 94 Z" fill="${opts.hfill || "#efe0bd"}" stroke="${ink}" stroke-width="1.6"/>
      <text x="100" y="99" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="17" fill="${ink}">H</text>
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

  window.HRM_HOUSES = { HOUSES, BY_KEY, crestSVG, hogwartsCrestSVG, rackSVG, setSand };
})();
