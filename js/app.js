/* Hogwarts: Rise of Magic — aplicação */
(function () {
  const CFG = window.HRM_CONFIG;
  const H = window.HRM_HOUSES;
  const S = window.HRM_STORE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = n => Number(n || 0).toLocaleString("pt-BR");
  const fmtDate = ts => new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const YEARS = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "7º ano"];
  const countChars = t => [...String(t || "").trim()].length;

  /* ---------- utilidades de interface ---------- */
  let toastTimer;
  function toast(msg, kind = "") {
    const t = $("#toast");
    t.textContent = msg; t.className = "toast show " + kind;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.className = "toast", 3600);
  }

  function openSheet(html, onMount) {
    $("#sheetBody").innerHTML = html;
    $("#sheet").hidden = false; $("#sheetBackdrop").hidden = false;
    requestAnimationFrame(() => { $("#sheet").classList.add("open"); $("#sheetBackdrop").classList.add("open"); });
    document.body.classList.add("locked");
    if (onMount) onMount($("#sheetBody"));
  }
  function closeSheet() {
    $("#sheet").classList.remove("open"); $("#sheetBackdrop").classList.remove("open");
    document.body.classList.remove("locked");
    setTimeout(() => { $("#sheet").hidden = true; $("#sheetBackdrop").hidden = true; $("#sheetBody").innerHTML = ""; }, 350);
  }
  $("#sheetClose").addEventListener("click", closeSheet);
  $("#sheetBackdrop").addEventListener("click", closeSheet);

  function showImage(src) { $("#lightboxImg").src = src; $("#lightbox").hidden = false; }
  $("#lightbox").addEventListener("click", () => { $("#lightbox").hidden = true; $("#lightboxImg").src = ""; });

  /* Comprime a imagem do print para caber no armazenamento */
  function compressImage(file, max = 1100, quality = 0.72) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error("Envie uma imagem (print da cena)."));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        let q = quality, data = c.toDataURL("image/jpeg", q);
        while (data.length > 700000 && q > 0.35) { q -= 0.1; data = c.toDataURL("image/jpeg", q); }
        resolve(data);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não foi possível ler a imagem.")); };
      img.src = url;
    });
  }

  function houseOptions(sel = "") {
    return `<option value="" disabled ${sel ? "" : "selected"}>Escolha a casa</option>` +
      H.HOUSES.map(h => `<option value="${h.key}" ${sel === h.key ? "selected" : ""}>${h.name}</option>`).join("");
  }
  const houseBadge = k => { const h = H.BY_KEY[k]; return h ? `<span class="hbadge hb-${k}">${h.name}</span>` : ""; };

  /* ---------- faíscas douradas ---------- */
  (function sparkles() {
    const box = $("#sparkles");
    const n = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 26;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDelay = (-Math.random() * 14).toFixed(2) + "s";
      s.style.animationDuration = (10 + Math.random() * 10).toFixed(2) + "s";
      s.style.setProperty("--sz", (1.5 + Math.random() * 2.5).toFixed(1) + "px");
      s.style.setProperty("--dx", ((Math.random() - .5) * 60).toFixed(0) + "px");
      box.appendChild(s);
    }
  })();

  const ready = S.init();

  /* =====================================================
     CARTA
     ===================================================== */
  $("#letterCrest").innerHTML = H.hogwartsCrestSVG({ uid: "letter", ink: "#24180b" });
  $("#envCrest").innerHTML = H.hogwartsCrestSVG({ uid: "env", ink: "#3a2812", hfill: "#ead6ad" });
  $("#sealCrest").innerHTML = H.hogwartsCrestSVG({ uid: "seal", ink: "#3d0505", hfill: "transparent" });
  // contornos curvos do envelope (polígonos gerados a partir de curvas)
  (function shapeEnvelope() {
    const bez = (p0, p1, p2, p3, n = 14) => Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n, u = 1 - t;
      return [u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]];
    });
    const poly = pts => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(",")})`;
    const mirror = pts => pts.map(([x, y]) => [100 - x, y]).reverse();
    // aba de cima com "ombros" curvos e ponta arredondada
    const flapR = [...bez([100, 0], [96, 14], [80, 18], [72, 30]), ...bez([72, 30], [64, 42], [58, 58], [50, 60])];
    $(".env-flap").style.clipPath = poly([[0, 0], [100, 0], ...flapR.slice(1), ...mirror(flapR).slice(1)]);
    // abas laterais
    const sideL = [[0, 0], ...bez([0, 0], [18, 22], [40, 40], [44, 58]).slice(1), ...bez([44, 58], [46, 70], [20, 86], [0, 100]).slice(1)];
    $(".env-side-l").style.clipPath = poly(sideL);
    $(".env-side-r").style.clipPath = poly(mirror(sideL));
    // bolso de baixo
    const pocketL = bez([0, 100], [16, 86], [38, 66], [50, 60]);
    $(".env-pocket").style.clipPath = poly([...pocketL, ...mirror(pocketL).slice(1)]);
  })();
  let opened = false;
  $("#envelope").addEventListener("click", () => {
    if (opened) return; opened = true;
    const wrap = $("#envelopeWrap");
    wrap.classList.add("opening");
    $("#introHint").classList.add("fade");
    if (navigator.vibrate) navigator.vibrate(18);
    setTimeout(() => wrap.classList.add("rise"), 650);
    setTimeout(() => {
      wrap.classList.add("gone");
      $("#letter").classList.add("show");
    }, 1700);
  });
  $("#enterBtn").addEventListener("click", () => {
    $("#intro").classList.add("leave");
    $("#app").hidden = false;
    setTimeout(() => { $("#intro").remove(); }, 900);
    ready.then(route);
  });

  /* =====================================================
     ROTEAMENTO
     ===================================================== */
  const views = { salao: viewSalao, treinos: viewTreinos, staff: viewStaff };
  let refreshTimer, stopWatch;
  function route() {
    if ($("#app").hidden) return;
    const r = (location.hash.replace(/^#\/?/, "") || "salao").split("/")[0];
    const name = views[r] ? r : "salao";
    $$(".tabbar a").forEach(a => a.classList.toggle("active", a.dataset.route === name));
    clearInterval(refreshTimer);
    if (stopWatch) { stopWatch(); stopWatch = null; }
    const v = $("#view");
    v.classList.remove("enter"); void v.offsetWidth; v.classList.add("enter");
    views[name](v);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  /* =====================================================
     SALÃO PRINCIPAL
     ===================================================== */
  const sandState = {};
  function viewSalao(v) {
    v.innerHTML = `
      <section class="hero">
        <div class="candles" aria-hidden="true">${"<span></span>".repeat(7)}</div>
        <p class="eyebrow">Bem-vindo ao</p>
        <h1 class="page-title">Salão Principal</h1>
        <p class="lead">A Taça das Casas está em disputa. Cada grão de areia é um ponto conquistado.</p>
      </section>
      <section class="hall" id="hourglasses">
        <div class="hall-row hall-crests">
          ${H.HOUSES.map(h => `<div class="hall-crest" data-house="${h.key}">${H.crestSVG(h.key, { uid: "salao" })}</div>`).join("")}
        </div>
        <div class="hall-rack">${H.rackSVG()}</div>
        <div class="hall-row hall-points">
          ${H.HOUSES.map(h => `
            <div class="hall-pt hb-${h.key}" data-house="${h.key}">
              <span class="num" data-points="${h.key}">0</span><small>pontos</small>
            </div>`).join("")}
        </div>
      </section>
      <div class="leader" id="leader"></div>
      <section class="panel cta" id="cta"></section>`;
    stopWatch = S.watchPoints((pts, cup) => { renderPoints(pts); renderCta(cup); },
      () => toast("Não foi possível carregar os pontos.", "err"));
  }

  function renderCta(cup) {
    const box = $("#cta"); if (!box) return;
    const key = cup.locked ? "locked" : "open";
    if (box.dataset.state === key) return;
    box.dataset.state = key;
    box.classList.toggle("locked", cup.locked);
    box.innerHTML = cup.locked ? `
        <div class="lock-icon" aria-hidden="true">🔒</div>
        <h3>A Taça está trancada</h3>
        <p>A moderação encerrou o envio de pedidos de pontos por enquanto. Assim que a Taça for reaberta, você poderá enviar novamente.</p>
        <button class="btn btn-gold" disabled><span>Envios trancados</span></button>` : `
        <h3>Ganhou ou perdeu pontos em cena?</h3>
        <p>Envie o pedido com o print da cena. A moderação confere e, se aprovado, a areia da ampulheta se move.</p>
        <button class="btn btn-gold" id="reqBtn"><span>Solicitar pontos</span></button>`;
    const btn = $("#reqBtn");
    if (btn) btn.addEventListener("click", openPointsForm);
    if (cup.locked && !$("#sheet").hidden && $("#pointsForm")) { closeSheet(); toast("A Taça acabou de ser trancada pela moderação.", "err"); }
  }

  function renderPoints(pts) {
    if (!$("#hourglasses")) return;
    const max = Math.max(...Object.values(pts), 0);
    const capacity = Math.max(500, Math.ceil((max * 1.25) / 100) * 100);
    H.HOUSES.forEach(h => {
      const lead = max > 0 && pts[h.key] === max;
      animateNumber($(`[data-points="${h.key}"]`), pts[h.key]);
      animateSand($(`.tube[data-house="${h.key}"]`), h.key, pts[h.key] / capacity);
      $$(`.hall [data-house="${h.key}"]`).forEach(el => el.classList.toggle("is-leader", lead));
    });
    const leaders = H.HOUSES.filter(h => max > 0 && pts[h.key] === max);
    $("#leader").innerHTML = leaders.length === 1
      ? `<span>✦</span> ${leaders[0].name} lidera a Taça das Casas <span>✦</span>`
      : max > 0 ? `<span>✦</span> Empate na liderança <span>✦</span>` : `<span>✦</span> A disputa ainda não começou <span>✦</span>`;
  }

  function animateNumber(el, to) {
    const from = Number(el.dataset.v || 0); el.dataset.v = to;
    const t0 = performance.now(), dur = 1400;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function animateSand(svg, key, target) {
    const from = sandState[key] ?? 0;
    target = Math.max(0, Math.min(1, target));
    sandState[key] = target;
    if (Math.abs(from - target) < 0.0005) { H.setSand(svg, target, false); return; }
    const t0 = performance.now(), dur = 2200 + Math.abs(target - from) * 1500;
    const step = now => {
      if (!svg.isConnected) return;
      const k = Math.min(1, (now - t0) / dur);
      const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      H.setSand(svg, from + (target - from) * e, k < 1);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function openPointsForm() {
    openSheet(`
      <h2 class="sheet-title">Solicitação de Pontos</h2>
      <p class="sheet-sub">Seu pedido será enviado à moderação junto com o print.</p>
      <form id="pointsForm" class="form" novalidate>
        <label class="field"><span>Nome do personagem</span>
          <input name="name" required maxlength="60" autocomplete="off" placeholder="Ex.: Lyra Blackwood"></label>
        <div class="row">
          <label class="field"><span>Ano escolar</span>
            <select name="year" required><option value="" disabled selected>Ano</option>${YEARS.map(y => `<option>${y}</option>`).join("")}</select></label>
          <label class="field"><span>Casa</span><select name="house" required>${houseOptions()}</select></label>
        </div>
        <div class="field"><span>Ação</span>
          <div class="seg">
            <label><input type="radio" name="type" value="add" checked><span>＋ Adicionar</span></label>
            <label><input type="radio" name="type" value="remove"><span>－ Retirar</span></label>
          </div>
        </div>
        <label class="field"><span>Quantidade de pontos</span>
          <input name="amount" type="number" inputmode="numeric" min="1" max="1000" required placeholder="Ex.: 10"></label>
        <label class="field"><span>Contexto <em>(opcional)</em></span>
          <textarea name="note" rows="2" maxlength="400" placeholder="Ex.: Aula de Poções — resposta correta ao Prof. Slughorn"></textarea></label>
        <label class="field file-field"><span>Print da cena</span>
          <input name="print" type="file" accept="image/*" required>
          <span class="file-drop" id="fileDrop"><b>Toque para anexar o print</b><small>PNG ou JPG</small></span>
          <img class="file-preview" id="filePreview" alt="" hidden>
        </label>
        <button class="btn btn-gold btn-block" type="submit"><span>Enviar coruja à moderação</span></button>
      </form>`, body => {
      const form = $("#pointsForm", body);
      const fileIn = form.print;
      fileIn.addEventListener("change", () => {
        const f = fileIn.files[0]; if (!f) return;
        const p = $("#filePreview", body); p.src = URL.createObjectURL(f); p.hidden = false;
        $("#fileDrop", body).querySelector("b").textContent = f.name;
      });
      form.addEventListener("submit", async ev => {
        ev.preventDefault();
        const fd = new FormData(form);
        const name = String(fd.get("name") || "").trim();
        const amount = parseInt(fd.get("amount"), 10);
        if (!name) return toast("Informe o nome do personagem.", "err");
        if (!fd.get("year")) return toast("Selecione o ano escolar.", "err");
        if (!fd.get("house")) return toast("Selecione a casa.", "err");
        if (!amount || amount < 1 || amount > 1000) return toast("Quantidade deve ser entre 1 e 1000.", "err");
        if (!fileIn.files[0]) return toast("Anexe o print da cena.", "err");
        const btn = form.querySelector("button[type=submit]");
        btn.disabled = true; btn.classList.add("loading");
        try {
          const image = await compressImage(fileIn.files[0]);
          await S.addRequest({
            id: S.uid(), name, year: fd.get("year"), house: fd.get("house"),
            type: fd.get("type"), amount, note: String(fd.get("note") || "").trim(),
            image, status: "pending", createdAt: Date.now()
          });
          closeSheet();
          toast("Coruja enviada! Aguarde a análise da moderação. 🦉", "ok");
        } catch (e) {
          toast(e.message || "Erro ao enviar.", "err");
          btn.disabled = false; btn.classList.remove("loading");
        }
      });
    });
  }

  /* =====================================================
     TREINOS DE PERÍCIAS
     ===================================================== */
  function viewTreinos(v) {
    const types = CFG.skillTypes;
    v.innerHTML = `
      <section class="hero small">
        <p class="eyebrow">Sala de Treinamento</p>
        <h1 class="page-title">Treino de Perícias</h1>
        <p class="lead">Aprimore seu personagem. Limite de <b>${CFG.trainingsPerDay} treinos por dia</b> por personagem.</p>
      </section>
      <section class="rules">
        ${Object.entries(types).map(([k, t]) => `
          <div class="rule rule-${k}"><b>${t.label.replace("Perícia ", "")}</b>
            <span>${fmt(t.chars)} caracteres</span><em>+${t.pp} PP</em></div>`).join("")}
      </section>
      <section class="panel">
        <form id="trainForm" class="form" novalidate>
          <label class="field"><span>Nome do personagem</span>
            <input name="name" required maxlength="60" autocomplete="off" placeholder="Ex.: Lyra Blackwood"></label>
          <div class="row">
            <label class="field"><span>Casa</span><select name="house" required>${houseOptions()}</select></label>
            <label class="field"><span>Perícia</span>
              <input name="skill" required maxlength="50" autocomplete="off" placeholder="Ex.: Feitiços"></label>
          </div>
          <div class="field"><span>Tipo de perícia</span>
            <div class="types">
              ${Object.entries(types).map(([k, t], i) => `
                <label class="type-card"><input type="radio" name="kind" value="${k}" ${i === 0 ? "checked" : ""}>
                  <span><b>${t.label.replace("Perícia ", "")}</b><small>${fmt(t.chars)} car.</small><em>+${t.pp} PP</em></span></label>`).join("")}
            </div>
          </div>
          <label class="field"><span>Cena do treino</span>
            <textarea name="scene" rows="9" required placeholder="Cole aqui a cena do treino…"></textarea></label>
          <div class="meter"><div class="meter-bar"><i id="meterFill"></i></div>
            <p id="meterText">0 / 1.500 caracteres</p></div>
          <p class="daily" id="daily"></p>
          <button class="btn btn-gold btn-block" type="submit" id="trainBtn" disabled><span>Registrar treino</span></button>
        </form>
      </section>
      <section class="log">
        <h2 class="section-title">Registro de Treinos</h2>
        <div id="trainLog" class="log-list"><p class="muted center">Carregando…</p></div>
      </section>`;

    const form = $("#trainForm");
    let usedToday = 0, checkTimer;
    const req = () => types[form.kind.value];
    const update = () => {
      const n = countChars(form.scene.value), need = req().chars;
      const pct = Math.min(100, (n / need) * 100);
      $("#meterFill").style.width = pct + "%";
      $("#meterFill").classList.toggle("done", n >= need);
      $("#meterText").innerHTML = `${fmt(n)} / ${fmt(need)} caracteres` + (n >= need ? ` · <b>pronto!</b>` : ` · faltam ${fmt(need - n)}`);
      $("#trainBtn").disabled = n < need || usedToday >= CFG.trainingsPerDay || !form.name.value.trim();
      $("#trainBtn span").textContent = `Registrar treino · +${req().pp} PP`;
    };
    const checkDaily = async () => {
      const key = S.normName(form.name.value);
      if (!key) { usedToday = 0; $("#daily").textContent = ""; update(); return; }
      try { usedToday = await S.countTrainings(key, S.today()); } catch (e) { usedToday = 0; }
      const left = CFG.trainingsPerDay - usedToday;
      $("#daily").className = "daily " + (left <= 0 ? "full" : "");
      $("#daily").textContent = left <= 0
        ? `Limite diário atingido (${usedToday}/${CFG.trainingsPerDay}). Volte amanhã!`
        : `Treinos hoje: ${usedToday}/${CFG.trainingsPerDay}`;
      update();
    };
    form.addEventListener("input", e => {
      if (e.target.name === "name") { clearTimeout(checkTimer); checkTimer = setTimeout(checkDaily, 400); }
      update();
    });
    form.addEventListener("change", update);
    update();

    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const name = form.name.value.trim(), house = form.house.value, skill = form.skill.value.trim();
      const kind = form.kind.value, t = types[kind], scene = form.scene.value.trim(), chars = countChars(scene);
      if (!name) return toast("Informe o nome do personagem.", "err");
      if (!house) return toast("Selecione a casa.", "err");
      if (!skill) return toast("Informe a perícia.", "err");
      if (chars < t.chars) return toast(`A cena precisa de ${fmt(t.chars)} caracteres.`, "err");
      const btn = $("#trainBtn"); btn.disabled = true; btn.classList.add("loading");
      try {
        await S.addTraining({
          id: S.uid(), name, charKey: S.normName(name), house, skill, kind,
          pp: t.pp, chars, scene, day: S.today(), createdAt: Date.now()
        }, CFG.trainingsPerDay);
        toast(`Treino registrado! +${t.pp} PP em ${skill}. ✨`, "ok");
        form.scene.value = "";
        await checkDaily(); loadLog();
      } catch (e) {
        toast(e.message || "Erro ao registrar treino.", "err");
        await checkDaily();
      } finally { btn.classList.remove("loading"); update(); }
    });

    async function loadLog() {
      let list;
      try { list = await S.listTrainings(); } catch (e) { $("#trainLog").innerHTML = `<p class="muted center">Não foi possível carregar.</p>`; return; }
      $("#trainLog").innerHTML = list.length ? list.slice(0, 30).map(t => `
        <div class="log-item">
          <div><b>${esc(t.name)}</b> ${houseBadge(t.house)}
            <small>${esc(t.skill)} · ${esc(types[t.kind]?.label.replace("Perícia ", "") || t.kind)} · ${fmtDate(t.createdAt)}</small></div>
          <span class="pp">+${t.pp} PP</span>
        </div>`).join("") : `<p class="muted center">Nenhum treino registrado ainda.</p>`;
    }
    loadLog();
  }

  /* =====================================================
     PAINEL DA STAFF
     ===================================================== */
  const STAFF_HASH = "bffc207891f716a7b4dad06ca16a8c3de28287d67c3439c4b59fca46504f0c05";
  const cloud = () => S.backend && S.backend.mode === "firebase";
  const isStaff = () => {
    if (cloud()) return S.backend.isStaff();
    try { return sessionStorage.getItem("hrm_staff") === STAFF_HASH; } catch (e) { return false; }
  };
  const staffName = () => {
    if (cloud()) return S.backend.staffName();
    try { return sessionStorage.getItem("hrm_staff_nick") || "Staff"; } catch (e) { return "Staff"; }
  };
  async function staffLoginCheck(nick, pass) {
    if (cloud()) return S.backend.staffLogin(nick, pass);
    const h = await sha256(nick.trim().toLowerCase() + "|" + pass);
    if (h !== STAFF_HASH) return false;
    try { sessionStorage.setItem("hrm_staff", h); sessionStorage.setItem("hrm_staff_nick", nick.trim()); } catch (e) {}
    return true;
  }

  async function sha256(str) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    }
    return sha256Fallback(str);
  }

  function viewStaff(v) { isStaff() ? staffPanel(v) : staffLogin(v); }

  function staffLogin(v) {
    v.innerHTML = `
      <section class="hero small">
        <p class="eyebrow">Acesso restrito</p>
        <h1 class="page-title">Sala da Staff</h1>
        <p class="lead">Somente monitores e professores autorizados.</p>
      </section>
      <section class="panel login">
        <div class="keyhole" aria-hidden="true"></div>
        <form id="loginForm" class="form" novalidate>
          <label class="field"><span>Nickname</span><input name="nick" autocomplete="username" required></label>
          <label class="field"><span>Senha</span><input name="pass" type="password" autocomplete="current-password" required></label>
          <button class="btn btn-gold btn-block" type="submit"><span>Entrar</span></button>
        </form>
      </section>`;
    $("#loginForm").addEventListener("submit", async ev => {
      ev.preventDefault();
      const f = ev.target, btn = f.querySelector("button");
      btn.disabled = true; btn.classList.add("loading");
      let ok = false, failed = false;
      try { ok = await staffLoginCheck(f.nick.value, f.pass.value); }
      catch (e) { failed = true; toast(e.message || "Erro ao entrar.", "err"); }
      btn.disabled = false; btn.classList.remove("loading");
      if (ok) {
        toast("Bem-vindo(a) à Sala da Staff.", "ok");
        route();
      } else if (!failed) {
        f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake");
        toast("Nickname ou senha incorretos.", "err");
      }
    });
  }

  let staffTab = "pending";
  function staffPanel(v) {
    v.innerHTML = `
      <section class="hero small">
        <p class="eyebrow">Painel da Staff</p>
        <h1 class="page-title">Moderação</h1>
        <button class="link" id="logout">Sair</button>
      </section>
      <section class="stats" id="stats"></section>
      <div class="tabs" role="tablist">
        <button data-tab="pending">Pendentes</button>
        <button data-tab="history">Histórico</button>
        <button data-tab="trainings">Treinos</button>
        <button data-tab="adjust">Taça</button>
      </div>
      <section id="staffList" class="staff-list"></section>`;
    $("#logout").addEventListener("click", async () => {
      if (cloud()) await S.backend.staffLogout();
      try { sessionStorage.removeItem("hrm_staff"); } catch (e) {}
      route();
    });
    $$(".tabs button").forEach(b => b.addEventListener("click", () => { staffTab = b.dataset.tab; renderStaff(); }));
    renderStaff();
    refreshTimer = setInterval(() => { if (staffTab === "pending") renderStaff(); }, 30000);
  }

  async function renderStaff() {
    const box = $("#staffList"); if (!box) return;
    $$(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === staffTab));
    let reqs = [], pts = {};
    try { [reqs, pts] = await Promise.all([S.listRequests(), S.getPoints()]); }
    catch (e) { box.innerHTML = `<p class="muted center">Erro ao carregar dados.</p>`; return; }
    const pending = reqs.filter(r => r.status === "pending");
    $("#stats").innerHTML = H.HOUSES.map(h => `
      <div class="stat hb-${h.key}"><small>${h.name}</small><b>${fmt(pts[h.key])}</b></div>`).join("");
    $('.tabs [data-tab="pending"]').innerHTML = `Pendentes${pending.length ? ` <i>${pending.length}</i>` : ""}`;

    if (staffTab === "pending") {
      box.innerHTML = pending.length ? pending.map(reqCard).join("") : `<p class="muted center empty">Nenhuma coruja aguardando. ✦</p>`;
    } else if (staffTab === "history") {
      const done = reqs.filter(r => r.status !== "pending");
      box.innerHTML = done.length ? done.map(reqCard).join("") : `<p class="muted center empty">Nenhuma solicitação analisada ainda.</p>`;
    } else if (staffTab === "trainings") {
      return renderStaffTrainings(box);
    } else {
      return renderAdjust(box);
    }
    bindReqCards(box);
  }

  function reqCard(r) {
    const add = r.type === "add";
    const st = { pending: "Pendente", approved: "Aprovada", denied: "Negada" }[r.status];
    return `
      <article class="req ${r.status}" data-id="${esc(r.id)}">
        <button class="req-img" data-img aria-label="Ver print"><img src="${esc(r.image)}" alt="Print de ${esc(r.name)}" loading="lazy"></button>
        <div class="req-info">
          <div class="req-top"><b>${esc(r.name)}</b><span class="amt ${add ? "plus" : "minus"}">${add ? "+" : "−"}${fmt(r.amount)}</span></div>
          <p>${houseBadge(r.house)} <span class="muted">${esc(r.year)}</span></p>
          ${r.note ? `<p class="note">“${esc(r.note)}”</p>` : ""}
          <p class="muted tiny">${fmtDate(r.createdAt)}${r.status !== "pending" ? ` · <span class="st st-${r.status}">${st}</span>${r.resolvedBy ? ` por ${esc(r.resolvedBy)}` : ""}` : ""}</p>
          ${r.status === "pending" ? `
          <div class="req-actions">
            <button class="btn btn-ok" data-act="approve">Aprovar</button>
            <button class="btn btn-no" data-act="deny">Negar</button>
          </div>` : `<button class="link tiny" data-act="delete">Excluir registro</button>`}
        </div>
      </article>`;
  }

  function bindReqCards(box) {
    const by = staffName();
    $$(".req", box).forEach(card => {
      const id = card.dataset.id;
      card.querySelector("[data-img]").addEventListener("click", () => showImage(card.querySelector("img").src));
      $$("[data-act]", card).forEach(b => b.addEventListener("click", async () => {
        const act = b.dataset.act;
        if (act === "delete" && !confirm("Excluir este registro do histórico?")) return;
        $$("button", card).forEach(x => x.disabled = true);
        try {
          if (act === "delete") await S.deleteRequest(id);
          else await S.resolveRequest(id, act === "approve", by);
          card.classList.add("leaving");
          toast(act === "approve" ? "Aprovada! Pontos aplicados à casa." : act === "deny" ? "Solicitação negada." : "Registro excluído.", act === "deny" ? "" : "ok");
          setTimeout(renderStaff, 380);
        } catch (e) { toast(e.message || "Erro.", "err"); renderStaff(); }
      }));
    });
  }

  async function renderStaffTrainings(box) {
    let list;
    try { list = await S.listTrainings(); } catch (e) { box.innerHTML = `<p class="muted center">Erro ao carregar.</p>`; return; }
    const types = CFG.skillTypes;
    box.innerHTML = list.length ? list.map(t => `
      <article class="req train" data-id="${esc(t.id)}">
        <div class="req-info">
          <div class="req-top"><b>${esc(t.name)}</b><span class="amt plus">+${t.pp} PP</span></div>
          <p>${houseBadge(t.house)} <span class="muted">${esc(t.skill)} · ${esc(types[t.kind]?.label || t.kind)}</span></p>
          <p class="muted tiny">${fmtDate(t.createdAt)} · ${fmt(t.chars)} caracteres</p>
          <details><summary>Ler cena</summary><div class="scene">${esc(t.scene)}</div></details>
          <button class="link tiny" data-del>Excluir treino</button>
        </div>
      </article>`).join("") : `<p class="muted center empty">Nenhum treino registrado.</p>`;
    $$("[data-del]", box).forEach(b => b.addEventListener("click", async () => {
      if (!confirm("Excluir este treino? O personagem poderá enviar outro hoje.")) return;
      try { await S.deleteTraining(b.closest(".req").dataset.id); toast("Treino excluído."); renderStaff(); }
      catch (e) { toast(e.message || "Erro.", "err"); }
    }));
  }

  async function renderAdjust(box) {
    let cup = { locked: false };
    try { cup = await S.getCup(); } catch (e) {}
    const when = cup.at ? ` em ${fmtDate(cup.at)}` : "";
    box.innerHTML = `
      <div class="panel cup-panel ${cup.locked ? "locked" : ""}">
        <h3>${cup.locked ? "🔒 Taça trancada" : "🔓 Taça aberta"}</h3>
        <p class="muted">${cup.locked
          ? `Ninguém consegue enviar pedidos de pontos.${cup.by ? ` Trancada por ${esc(cup.by)}${when}.` : ""} Pedidos que já estavam pendentes ainda podem ser aprovados ou negados.`
          : `Os jogadores podem enviar pedidos de pontos normalmente.${cup.by ? ` Aberta por ${esc(cup.by)}${when}.` : ""}`}</p>
        <button class="btn btn-block ${cup.locked ? "btn-ok" : "btn-no"}" id="lockBtn">
          <span>${cup.locked ? "Abrir a Taça" : "Trancar a Taça"}</span></button>
      </div>

      <div class="panel">
        <h3>Ajuste direto de pontos</h3>
        <p class="muted">Para correções da staff (não precisa de print).</p>
        <form id="adjForm" class="form" novalidate>
          <label class="field"><span>Casa</span><select name="house" required>${houseOptions()}</select></label>
          <div class="field"><span>Ação</span>
            <div class="seg">
              <label><input type="radio" name="type" value="add" checked><span>＋ Adicionar</span></label>
              <label><input type="radio" name="type" value="remove"><span>－ Remover</span></label>
            </div>
          </div>
          <label class="field"><span>Quantidade de pontos</span>
            <input name="amount" type="number" inputmode="numeric" min="1" max="100000" placeholder="Ex.: 10" required></label>
          <button class="btn btn-gold btn-block"><span>Aplicar ajuste</span></button>
        </form>
      </div>

      <div class="panel danger-panel">
        <h3>Zerar a Taça</h3>
        <p class="muted">Volta os pontos das quatro casas para 0 e começa uma nova disputa. O histórico de pedidos é mantido. Essa ação não pode ser desfeita.</p>
        <button class="btn btn-no btn-block" id="resetBtn"><span>Reset geral dos pontos</span></button>
      </div>`;

    $("#lockBtn").addEventListener("click", async ev => {
      const lock = !cup.locked;
      if (lock && !confirm("Trancar a Taça? Ninguém mais conseguirá enviar pedidos de pontos até ela ser aberta.")) return;
      ev.currentTarget.disabled = true;
      try { await S.setCupLocked(lock, staffName()); toast(lock ? "Taça trancada. 🔒" : "Taça aberta! Os pedidos estão liberados. 🔓", "ok"); }
      catch (e) { toast("Não foi possível alterar a Taça. " + (e.message || ""), "err"); }
      renderStaff();
    });

    $("#adjForm").addEventListener("submit", async ev => {
      ev.preventDefault();
      const f = ev.target, n = parseInt(f.amount.value, 10), add = f.type.value === "add";
      if (!f.house.value) return toast("Escolha a casa.", "err");
      if (!n || n < 1) return toast("Informe uma quantidade maior que zero.", "err");
      const h = H.BY_KEY[f.house.value].name;
      if (!confirm(`${add ? "Adicionar" : "Remover"} ${fmt(n)} pontos ${add ? "à" : "da"} ${h}?`)) return;
      try {
        await S.adjustPoints(f.house.value, add ? n : -n);
        toast(`${add ? "+" : "−"}${fmt(n)} pontos para ${h}.`, "ok"); f.reset(); renderStaff();
      } catch (e) { toast(e.message || "Erro.", "err"); }
    });

    $("#resetBtn").addEventListener("click", async () => {
      if (!confirm("Zerar os pontos de TODAS as casas? Essa ação não pode ser desfeita.")) return;
      if (!confirm("Tem certeza? A Taça vai recomeçar do 0.")) return;
      try { await S.resetPoints(staffName()); toast("Pontos zerados. Uma nova disputa começa! ✨", "ok"); renderStaff(); }
      catch (e) { toast(e.message || "Erro ao zerar.", "err"); }
    });
  }

  /* SHA-256 de reserva (para navegadores sem crypto.subtle, ex.: arquivo local) */
  function sha256Fallback(ascii) {
    const r = (v, a) => (v >>> a) | (v << (32 - a));
    const bytes = new TextEncoder().encode(ascii);
    const K = [], Hh = [];
    let p = 2, n = 0;
    const isP = x => { for (let i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; };
    while (n < 64) { if (isP(p)) { if (n < 8) Hh[n] = (Math.pow(p, 1 / 2) * 4294967296) | 0; K[n++] = (Math.pow(p, 1 / 3) * 4294967296) | 0; } p++; }
    const l = bytes.length, words = [];
    const buf = new Uint8Array(((l + 9 + 63) >> 6) << 6);
    buf.set(bytes); buf[l] = 0x80;
    const dv = new DataView(buf.buffer); dv.setUint32(buf.length - 4, l * 8);
    for (let i = 0; i < buf.length; i += 4) words.push(dv.getUint32(i));
    const hash = Hh.slice();
    for (let j = 0; j < words.length; j += 16) {
      const w = words.slice(j, j + 16), o = hash.slice();
      for (let i = 0; i < 64; i++) {
        if (i >= 16) {
          const a = w[i - 15], b = w[i - 2];
          w[i] = (w[i - 16] + (r(a, 7) ^ r(a, 18) ^ (a >>> 3)) + w[i - 7] + (r(b, 17) ^ r(b, 19) ^ (b >>> 10))) | 0;
        }
        const [A, B, C, D, E, F, G, Hx] = hash;
        const t1 = (Hx + (r(E, 6) ^ r(E, 11) ^ r(E, 25)) + ((E & F) ^ (~E & G)) + K[i] + w[i]) | 0;
        const t2 = ((r(A, 2) ^ r(A, 13) ^ r(A, 22)) + ((A & B) ^ (A & C) ^ (B & C))) | 0;
        hash.unshift((t1 + t2) | 0); hash[4] = (hash[4] + t1) | 0; hash.pop();
      }
      for (let i = 0; i < 8; i++) hash[i] = (hash[i] + o[i]) | 0;
    }
    return hash.map(x => (x >>> 0).toString(16).padStart(8, "0")).join("");
  }

  /* ---------- início ---------- */
  ready.then(mode => {
    if (mode === "firebase") return;
    const chip = $("#modeChip");
    chip.textContent = mode === "offline" ? "Sem conexão" : "Modo local";
    chip.title = mode === "offline"
      ? "Não foi possível conectar ao servidor. Os dados não estão sendo salvos na nuvem."
      : "Os dados ficam só neste aparelho. Configure o Firebase em js/config.js para salvar na nuvem.";
    chip.hidden = false;
  });
  if (!location.hash) history.replaceState(null, "", "#/salao");
})();
