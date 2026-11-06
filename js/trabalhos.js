/* Hogwarts: Rise of Magic — Plataforma de Trabalhos
 * Alunos: veem e entregam trabalhos. Professores: criam e corrigem. Staff: aprova professores.
 * Usa os utilitários de js/app.js (window.HRM_UI) e os dados de js/store.js (window.HRM_STORE).
 */
(function () {
  const CFG = window.HRM_CONFIG;
  const S = window.HRM_STORE;
  const H = window.HRM_HOUSES;
  const U = () => window.HRM_UI;

  const SUBJECTS = CFG.subjects;
  const SUBJ = Object.fromEntries(SUBJECTS.map(x => [x.slug, x]));
  const subjName = slug => (SUBJ[slug] && SUBJ[slug].name) || slug;
  const latePct = () => (CFG.homework && CFG.homework.latePercent) || 50;

  const pad = n => String(n).padStart(2, "0");
  const fmtDay = ts => { const d = new Date(ts); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
  const fmtDayStr = str => String(str || "").split("-").reverse().join("/");
  const fmtDateTime = ts => new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const profName = n => /^prof/i.test(String(n).trim()) ? n : `Prof. ${n}`;
  const yearTxt = n => `${n}º ano`;

  const STATUS = {
    open:   { label: "Aberto",           cls: "open" },
    late:   { label: "Entrega atrasada", cls: "late" },
    closed: { label: "Encerrado",        cls: "closed" }
  };

  /* Entregas feitas neste aparelho (para mostrar "Entregue" ao aluno) */
  const mine = {
    all() { try { return JSON.parse(localStorage.getItem("hrm_my_subs")) || {}; } catch (e) { return {}; } },
    add(sub) {
      const m = mine.all();
      m[`${sub.assignmentId}__${sub.studentKey}`] = { late: sub.late, at: sub.submittedAt };
      try { localStorage.setItem("hrm_my_subs", JSON.stringify(m)); } catch (e) {}
    },
    get(a) {
      const name = U().profile.get().name;
      return name ? mine.all()[`${a.id}__${S.slugKey(name)}`] || null : null;
    }
  };

  /* =====================================================
     ROTAS DOS ALUNOS
     #/trabalhos · #/trabalhos/ano/3 · #/trabalhos/materia/pocoes[/3]
     ===================================================== */
  function viewTrabalhos(v, parts) {
    if (parts[1] === "ano" && Number(parts[2]) >= 1 && Number(parts[2]) <= 7) return yearPage(v, Number(parts[2]));
    if (parts[1] === "materia" && SUBJ[parts[2]]) return subjectPage(v, parts[2], Number(parts[3]) || 0);
    return home(v);
  }

  const backLink = (href, text) => `<a class="back-link" href="${href}">‹ ${text}</a>`;
  const subjectButtons = (year) => `
    <section class="subjects">
      <h2 class="section-title">Matérias</h2>
      <div class="subject-grid">
        ${SUBJECTS.map(x => `<a class="subject-btn" href="#/trabalhos/materia/${x.slug}${year ? "/" + year : ""}">${x.name}</a>`).join("")}
      </div>
    </section>`;

  async function home(v) {
    const { esc } = U();
    const pr = U().profile.get();
    v.innerHTML = `
      <section class="hero small">
        <p class="eyebrow">Escola de Magia e Bruxaria</p>
        <h1 class="page-title">Plataforma de Trabalhos</h1>
        <p class="lead">Escolha o seu ano para ver o Mural de Deveres e entregar seus trabalhos.</p>
      </section>
      ${pr.name ? `
      <section class="me-card">
        <span>Aluno(a): <b>${esc(pr.name)}</b>${pr.house ? ` ${U().houseBadge(pr.house)}` : ""}${pr.year ? ` · ${yearTxt(pr.year)}` : ""}</span>
        ${pr.year ? `<a class="link" href="#/trabalhos/ano/${pr.year}">Ir para o meu ano</a>` : ""}
      </section>` : ""}
      <section class="year-grid">
        ${[1, 2, 3, 4, 5, 6, 7].map(y => `
          <a class="year-btn" href="#/trabalhos/ano/${y}">
            <b>${y}º</b><span>ano</span><small data-count="${y}">&nbsp;</small>
          </a>`).join("")}
      </section>
      ${subjectButtons(0)}
      <section class="panel prof-cta">
        <h3>É professor(a)?</h3>
        <p>Crie trabalhos para os alunos e corrija as entregas na sua área privada.</p>
        <a class="btn btn-gold" href="#/professor"><span>Área do Professor</span></a>
      </section>`;
    try {
      const all = await S.listAssignments({});
      const now = Date.now();
      for (let y = 1; y <= 7; y++) {
        const n = all.filter(a => a.year === y && S.statusOf(a, now) !== "closed").length;
        const el = v.querySelector(`[data-count="${y}"]`);
        if (el) el.textContent = n ? `${n} trabalho${n > 1 ? "s" : ""}` : "nenhum aberto";
      }
    } catch (e) {}
  }

  async function yearPage(v, y) {
    v.innerHTML = `
      <section class="hero small">
        ${backLink("#/trabalhos", "Plataforma de Trabalhos")}
        <p class="eyebrow">${yearTxt(y)}</p>
        <h1 class="page-title">Mural de Deveres</h1>
        <p class="lead">Trabalhos do ${yearTxt(y)} que ainda aceitam entregas.</p>
      </section>
      <section class="hw-list" id="hwList"><p class="muted center">Carregando…</p></section>
      ${subjectButtons(y)}`;
    let list = [];
    try { list = await S.listAssignments({ year: y }); }
    catch (e) { $id("hwList").innerHTML = `<p class="muted center">Não foi possível carregar os trabalhos.</p>`; return; }
    const now = Date.now();
    const open = list.filter(a => S.statusOf(a, now) !== "closed").sort((a, b) => a.dueAt - b.dueAt);
    renderCards($id("hwList"), open, `Nenhum trabalho aberto para o ${yearTxt(y)} no momento. ✦`, () => yearPage(v, y));
  }

  async function subjectPage(v, slug, yearFilter) {
    v.innerHTML = `
      <section class="hero small">
        ${backLink(yearFilter ? `#/trabalhos/ano/${yearFilter}` : "#/trabalhos", yearFilter ? `Mural do ${yearTxt(yearFilter)}` : "Plataforma de Trabalhos")}
        <p class="eyebrow">Matéria</p>
        <h1 class="page-title">${subjName(slug)}</h1>
      </section>
      <nav class="chips" aria-label="Filtrar por ano">
        <a class="chip ${yearFilter ? "" : "active"}" href="#/trabalhos/materia/${slug}">Todos os anos</a>
        ${[1, 2, 3, 4, 5, 6, 7].map(y => `<a class="chip ${yearFilter === y ? "active" : ""}" href="#/trabalhos/materia/${slug}/${y}">${y}º</a>`).join("")}
      </nav>
      <section id="subjList"><p class="muted center">Carregando…</p></section>`;
    let list = [];
    try { list = await S.listAssignments({ subject: slug }); }
    catch (e) { $id("subjList").innerHTML = `<p class="muted center">Não foi possível carregar os trabalhos.</p>`; return; }
    const now = Date.now();
    const years = yearFilter ? [yearFilter] : [1, 2, 3, 4, 5, 6, 7];
    const box = $id("subjList");
    const groups = years.map(y => {
      const ofYear = list.filter(a => a.year === y);
      return { y, open: ofYear.filter(a => S.statusOf(a, now) !== "closed").sort((a, b) => a.dueAt - b.dueAt),
               closed: ofYear.filter(a => S.statusOf(a, now) === "closed").sort((a, b) => b.closeAt - a.closeAt) };
    }).filter(g => g.open.length || g.closed.length);
    if (!groups.length) {
      box.innerHTML = `<p class="muted center empty">Nenhum trabalho de ${subjName(slug)}${yearFilter ? ` para o ${yearTxt(yearFilter)}` : ""} ainda.</p>`;
      return;
    }
    box.innerHTML = groups.map(g => `
      <section class="year-group">
        <h2 class="section-title">${subjName(slug)} · ${yearTxt(g.y)}</h2>
        <div class="hw-list" data-open="${g.y}"></div>
        ${g.closed.length ? `<details class="closed-box"><summary>Trabalhos encerrados (${g.closed.length})</summary><div class="hw-list" data-closed="${g.y}"></div></details>` : ""}
      </section>`).join("");
    const again = () => subjectPage(v, slug, yearFilter);
    groups.forEach(g => {
      renderCards(box.querySelector(`[data-open="${g.y}"]`), g.open, "Nenhum trabalho aberto neste ano.", again);
      if (g.closed.length) renderCards(box.querySelector(`[data-closed="${g.y}"]`), g.closed, "", again);
    });
  }

  function $id(id) { return document.getElementById(id); }

  /* Cartão de um trabalho (visão do aluno) */
  function cardHTML(a) {
    const { esc, fmt } = U();
    const st = S.statusOf(a);
    const done = mine.get(a);
    const lateMax = S.maxPointsFor(a, true);
    const long = a.description.length > 420;
    let action = "";
    if (done) {
      action = `<span class="hw-done ${done.late ? "late" : ""}">✓ ${done.late ? "Entregue atrasado" : "Entregue"} em ${fmtDateTime(done.at)}</span>`;
    } else if (st === "open") {
      action = `<button class="btn btn-gold btn-block" data-deliver="${esc(a.id)}"><span>Entregar trabalho</span></button>`;
    } else if (st === "late") {
      action = `<button class="btn btn-no btn-block" data-deliver="${esc(a.id)}"><span>Entregar atrasado</span></button>`;
    } else {
      action = `<span class="hw-done closed">Encerrado: não aceita mais entregas</span>`;
    }
    return `
      <article class="hw-card st-${STATUS[st].cls}">
        <header class="hw-head">
          <span class="hw-subject">${esc(subjName(a.subject))}</span>
          <span class="hw-status ${STATUS[st].cls}">${STATUS[st].label}</span>
        </header>
        <p class="hw-meta">${esc(profName(a.teacherName))} · ${yearTxt(a.year)}</p>
        <div class="hw-desc ${long ? "clamp" : ""}">${esc(a.description)}</div>
        ${long ? `<button class="link tiny" data-more>Ler descrição completa</button>` : ""}
        <dl class="hw-dates">
          <div><dt>Passado em</dt><dd>${fmtDayStr(a.assignedDate)}</dd></div>
          <div><dt>Entrega até</dt><dd>${fmtDay(a.dueAt)}</dd></div>
          <div><dt>Com atraso até</dt><dd>${fmtDay(a.closeAt)}</dd></div>
          <div><dt>Vale</dt><dd>${fmt(a.maxPoints)} pts${st === "late" ? ` · agora até ${fmt(lateMax)}` : ""}</dd></div>
        </dl>
        <footer class="hw-foot">${action}</footer>
      </article>`;
  }

  function renderCards(box, list, emptyMsg, onChange) {
    if (!box) return;
    box.innerHTML = list.length ? list.map(cardHTML).join("") : (emptyMsg ? `<p class="muted center empty">${emptyMsg}</p>` : "");
    box.querySelectorAll("[data-more]").forEach(b => b.addEventListener("click", () => {
      const d = b.previousElementSibling; d.classList.toggle("clamp");
      b.textContent = d.classList.contains("clamp") ? "Ler descrição completa" : "Mostrar menos";
    }));
    box.querySelectorAll("[data-deliver]").forEach(b => b.addEventListener("click", () => {
      const a = list.find(x => x.id === b.dataset.deliver);
      if (a) openDeliver(a, onChange);
    }));
  }

  /* =====================================================
     ENTREGA DO ALUNO
     ===================================================== */
  function openDeliver(a, onDone) {
    const { esc, fmt, houseOptions, YEARS, toast, openSheet, closeSheet, profile } = U();
    const st = S.statusOf(a);
    const late = st === "late";
    openSheet(`
      <h2 class="sheet-title">${late ? "Entregar atrasado" : "Entregar trabalho"}</h2>
      <div class="hw-summary">
        <b>${esc(subjName(a.subject))}</b> · ${esc(profName(a.teacherName))} · ${yearTxt(a.year)}
        <small>Entrega até ${fmtDay(a.dueAt)} · vale ${fmt(a.maxPoints)} pts</small>
      </div>
      ${late ? `<p class="late-warn">⚠ O prazo normal terminou. Esta entrega ficará marcada como <b>atrasada</b> e valerá no máximo <b>${fmt(S.maxPointsFor(a, true))} pontos</b> (${latePct()}%).</p>` : ""}
      <form id="deliverForm" class="form" novalidate>
        <label class="field"><span>Nome do aluno</span>
          <input name="name" required maxlength="60" autocomplete="off" placeholder="Nome do personagem"></label>
        <div class="row">
          <label class="field"><span>Casa</span><select name="house" required>${houseOptions()}</select></label>
          <label class="field"><span>Ano escolar</span>
            <select name="year" required>${YEARS.map((y, i) => `<option value="${i + 1}">${y}</option>`).join("")}</select></label>
        </div>
        <label class="field"><span>Texto do trabalho</span>
          <textarea name="text" rows="14" required placeholder="Escreva aqui o seu trabalho…"></textarea></label>
        <p class="muted tiny right" id="dvCount">0 caracteres</p>
        <button class="btn ${late ? "btn-no" : "btn-gold"} btn-block" type="submit"><span>${late ? "Entregar atrasado" : "Entregar trabalho"}</span></button>
      </form>`, body => {
      const form = body.querySelector("#deliverForm");
      form.year.value = String(a.year);
      const pr = profile.get();
      if (pr.year) form.year.value = String(pr.year);
      profile.fill(form, { name: "name", house: "house" });
      const count = () => { body.querySelector("#dvCount").textContent = `${fmt(form.text.value.length)} caracteres`; };
      form.text.addEventListener("input", count);
      form.addEventListener("submit", async ev => {
        ev.preventDefault();
        const name = form.name.value.trim(), house = form.house.value, year = Number(form.year.value), text = form.text.value;
        if (!name) return toast("Informe o nome do aluno.", "err");
        if (!house) return toast("Selecione a casa.", "err");
        if (!text.trim()) return toast("Escreva o texto do trabalho.", "err");
        if (text.length > 900000) return toast("O texto é grande demais para um único envio (máx. ~900 mil caracteres).", "err");
        if (!confirm(`Entregar o trabalho de ${subjName(a.subject)}${late ? " ATRASADO" : ""}? Depois de entregue não é possível editar.`)) return;
        const btn = form.querySelector("button[type=submit]");
        btn.disabled = true; btn.classList.add("loading");
        try {
          const sub = await S.submitWork(a, { studentName: name, house, studentYear: year, text });
          profile.save({ name, house, year, yearLabel: U().yearLabel(year) });
          mine.add(sub);
          closeSheet();
          toast(sub.late ? "Trabalho entregue (atrasado). 🦉" : "Trabalho entregue! Boa sorte. 🦉", "ok");
          if (onDone) setTimeout(onDone, 400);
        } catch (e) {
          toast(e.message || "Erro ao entregar.", "err");
          btn.disabled = false; btn.classList.remove("loading");
        }
      });
    });
  }

  /* =====================================================
     ÁREA DO PROFESSOR (#/professor)
     ===================================================== */
  let profTab = "entregas", subFilter = "pending";

  function viewProfessor(v) {
    const t = S.currentTeacher();
    if (!t) return profAuth(v);
    return profPanel(v, t);
  }

  function profAuth(v, mode = "login") {
    const { esc } = U();
    v.innerHTML = `
      <section class="hero small">
        ${backLink("#/trabalhos", "Plataforma de Trabalhos")}
        <p class="eyebrow">Acesso restrito</p>
        <h1 class="page-title">Área do Professor</h1>
        <p class="lead">Professores criam trabalhos e corrigem as entregas dos alunos.</p>
      </section>
      <div class="tabs tabs-2 narrow" role="tablist">
        <button data-mode="login" class="${mode === "login" ? "active" : ""}">Entrar</button>
        <button data-mode="signup" class="${mode === "signup" ? "active" : ""}">Cadastrar</button>
      </div>
      <section class="panel login">
        ${mode === "login" ? `
        <form id="profLogin" class="form" novalidate>
          <label class="field"><span>Nome do professor</span><input name="name" autocomplete="username" required placeholder="Como foi cadastrado"></label>
          <label class="field"><span>Senha</span><input name="pass" type="password" autocomplete="current-password" required></label>
          <button class="btn btn-gold btn-block" type="submit"><span>Entrar</span></button>
        </form>` : `
        <form id="profSignup" class="form" novalidate>
          <label class="field"><span>Nome do professor</span><input name="name" maxlength="60" autocomplete="username" required placeholder="Ex.: Severus Snape"></label>
          <label class="field"><span>Matéria que leciona</span>
            <select name="subject" required><option value="" disabled selected>Escolha a matéria</option>
              ${SUBJECTS.map(x => `<option value="${x.slug}">${esc(x.name)}</option>`).join("")}</select></label>
          <label class="field"><span>Senha</span><input name="pass" type="password" autocomplete="new-password" minlength="6" required placeholder="Mínimo de 6 caracteres"></label>
          <label class="field"><span>Repita a senha</span><input name="pass2" type="password" autocomplete="new-password" required></label>
          <p class="muted tiny">O cadastro vai para a Staff como <b>"Aguardando aprovação"</b>. Você só consegue entrar depois de aprovado.</p>
          <button class="btn btn-gold btn-block" type="submit"><span>Enviar cadastro</span></button>
        </form>`}
      </section>`;
    v.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => profAuth(v, b.dataset.mode)));
    const { toast } = U();
    const busy = (btn, on) => { btn.disabled = on; btn.classList.toggle("loading", on); };

    const login = v.querySelector("#profLogin");
    if (login) login.addEventListener("submit", async ev => {
      ev.preventDefault();
      const btn = login.querySelector("button");
      if (!login.name.value.trim() || !login.pass.value) return toast("Preencha o nome e a senha.", "err");
      busy(btn, true);
      try {
        const r = await S.teacherLogin(login.name.value, login.pass.value);
        if (r.ok) { toast("Bem-vindo(a) à Área do Professor.", "ok"); profTab = "entregas"; return viewProfessor(v); }
        const msg = {
          pending: "Seu cadastro ainda está aguardando aprovação da Staff.",
          rejected: "Seu cadastro foi recusado pela Staff.",
          missing: "Cadastro não encontrado. Faça o cadastro novamente."
        }[r.reason] || "Nome ou senha incorretos.";
        login.classList.remove("shake"); void login.offsetWidth; login.classList.add("shake");
        toast(msg, "err");
      } catch (e) { toast(e.message || "Erro ao entrar.", "err"); }
      busy(btn, false);
    });

    const signup = v.querySelector("#profSignup");
    if (signup) signup.addEventListener("submit", async ev => {
      ev.preventDefault();
      const f = signup, btn = f.querySelector("button");
      const name = f.name.value.trim();
      if (!name) return toast("Informe o nome do professor.", "err");
      if (!f.subject.value) return toast("Escolha a matéria.", "err");
      if (f.pass.value.length < 6) return toast("A senha precisa ter pelo menos 6 caracteres.", "err");
      if (f.pass.value !== f.pass2.value) return toast("As senhas não conferem.", "err");
      busy(btn, true);
      try {
        await S.teacherSignup(name, f.subject.value, f.pass.value);
        v.querySelector(".panel.login").innerHTML = `
          <div class="center">
            <div class="lock-icon" aria-hidden="true">🦉</div>
            <h3>Cadastro enviado!</h3>
            <p>Seu cadastro como professor(a) de <b>${U().esc(subjName(f.subject.value))}</b> está <b>aguardando aprovação</b> da Staff.
            Assim que for aprovado, entre com o nome <b>${U().esc(name)}</b> e a sua senha.</p>
            <button class="btn btn-gold" data-mode="login"><span>Ir para o login</span></button>
          </div>`;
        v.querySelector(".panel.login [data-mode]").addEventListener("click", () => profAuth(v, "login"));
      } catch (e) { toast(e.message || "Erro ao cadastrar.", "err"); busy(btn, false); }
    });
  }

  async function profPanel(v, t) {
    const { esc } = U();
    v.innerHTML = `
      <section class="hero small">
        ${backLink("#/trabalhos", "Plataforma de Trabalhos")}
        <p class="eyebrow">Área do Professor</p>
        <h1 class="page-title">${esc(profName(t.name))}</h1>
        <p class="lead">${esc(subjName(t.subject))}</p>
        <button class="link logout-link" id="profLogout">Sair</button>
      </section>
      <div class="tabs tabs-3" role="tablist">
        <button data-tab="entregas">Entregas</button>
        <button data-tab="trabalhos">Meus trabalhos</button>
        <button data-tab="novo">Novo trabalho</button>
      </div>
      <section id="profBody"></section>`;
    v.querySelector("#profLogout").addEventListener("click", async () => { await S.logout(); U().toast("Até logo!"); viewProfessor(v); });
    v.querySelectorAll(".tabs [data-tab]").forEach(b => b.addEventListener("click", () => { profTab = b.dataset.tab; drawProf(v, t); }));
    drawProf(v, t);
  }

  async function drawProf(v, t) {
    v.querySelectorAll(".tabs [data-tab]").forEach(b => b.classList.toggle("active", b.dataset.tab === profTab));
    const box = v.querySelector("#profBody");
    if (profTab === "novo") return drawNew(v, t, box);
    box.innerHTML = `<p class="muted center">Carregando…</p>`;
    let asg = [], subs = [];
    try { [asg, subs] = await Promise.all([S.listAssignments({ teacherUid: t.id }), S.listSubmissions(t.id)]); }
    catch (e) { box.innerHTML = `<p class="muted center">Não foi possível carregar seus dados.</p>`; return; }
    const pendingN = subs.filter(s => s.status !== "graded").length;
    const tabBtn = v.querySelector('.tabs [data-tab="entregas"]');
    if (tabBtn) tabBtn.innerHTML = `Entregas${pendingN ? ` <i>${pendingN}</i>` : ""}`;
    if (profTab === "trabalhos") return drawMine(v, t, box, asg, subs);
    return drawSubs(v, t, box, asg, subs);
  }

  /* --- Entregas recebidas --- */
  function drawSubs(v, t, box, asg, subs) {
    const { esc, houseBadge } = U();
    const byId = Object.fromEntries(asg.map(a => [a.id, a]));
    const items = subs.filter(s => subFilter === "all" || (subFilter === "pending" ? s.status !== "graded" : s.status === "graded"));
    box.innerHTML = `
      <nav class="chips">
        <button class="chip ${subFilter === "pending" ? "active" : ""}" data-f="pending">Não corrigidos</button>
        <button class="chip ${subFilter === "graded" ? "active" : ""}" data-f="graded">Corrigidos</button>
        <button class="chip ${subFilter === "all" ? "active" : ""}" data-f="all">Todos</button>
      </nav>
      <div class="staff-list">
        ${items.length ? items.map(s => {
          const a = byId[s.assignmentId];
          return `
          <button class="sub-card ${s.late ? "late" : ""} ${s.status === "graded" ? "graded" : ""}" data-sub="${esc(s.id)}">
            <span class="sub-top"><b>${esc(s.studentName)}</b>
              <span class="pill ${s.status === "graded" ? "ok" : "todo"}">${s.status === "graded" ? `Corrigido · ${s.points} pts` : "Não corrigido"}</span></span>
            <span class="sub-meta">${houseBadge(s.house)} <span class="muted">${yearTxt(s.studentYear)}</span>
              <span class="pill ${s.late ? "late" : "ontime"}">${s.late ? "Entregue atrasado" : "No prazo"}</span></span>
            <span class="muted tiny">${a ? `${yearTxt(a.year)} · passado em ${fmtDayStr(a.assignedDate)} · ` : ""}entregue em ${fmtDateTime(s.submittedAt)}</span>
            ${a ? `<span class="sub-desc">${esc(a.description.slice(0, 110))}${a.description.length > 110 ? "…" : ""}</span>` : ""}
          </button>`;
        }).join("") : `<p class="muted center empty">${subFilter === "pending" ? "Nenhuma entrega esperando correção. ✦" : "Nenhuma entrega aqui."}</p>`}
      </div>`;
    box.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => { subFilter = b.dataset.f; drawSubs(v, t, box, asg, subs); }));
    box.querySelectorAll("[data-sub]").forEach(b => b.addEventListener("click", () => {
      const s = subs.find(x => x.id === b.dataset.sub);
      openGrade(s, byId[s.assignmentId], () => drawProf(v, t));
    }));
    U().setRefresh(() => { if (profTab === "entregas" && document.getElementById("profBody") && document.getElementById("sheet").hidden) drawProf(v, t); }, 60000);
  }

  /* --- Correção de uma entrega --- */
  function openGrade(s, a, onDone) {
    const { esc, fmt, houseBadge, toast, openSheet, closeSheet } = U();
    const max = a ? S.maxPointsFor(a, s.late) : 0;
    const house = H.BY_KEY[s.house] ? H.BY_KEY[s.house].name : s.house;
    openSheet(`
      <h2 class="sheet-title">Correção</h2>
      <div class="grade-head">
        <p><b class="big">${esc(s.studentName)}</b> ${houseBadge(s.house)} <span class="muted">${yearTxt(s.studentYear)}</span></p>
        <p class="muted tiny">${a ? `${esc(subjName(a.subject))} · ${yearTxt(a.year)} · ` : ""}entregue em ${fmtDateTime(s.submittedAt)}</p>
        <p><span class="pill ${s.late ? "late" : "ontime"}">${s.late ? "Entregue atrasado" : "Entregue no prazo"}</span>
           <span class="pill ${s.status === "graded" ? "ok" : "todo"}">Status: ${s.status === "graded" ? "Corrigido" : "Não corrigido"}</span></p>
      </div>
      ${a ? `<details class="closed-box"><summary>Enunciado do trabalho</summary><div class="hw-desc">${esc(a.description)}</div></details>` : ""}
      <h3 class="label">Texto do aluno <small class="muted">(${fmt(s.text.length)} caracteres)</small></h3>
      <div class="work-text">${esc(s.text)}</div>
      ${s.status === "graded" ? `
        <div class="grade-done"><b>${fmt(s.points)} pontos</b> atribuídos${s.gradedAt ? ` em ${fmtDateTime(s.gradedAt)}` : ""}${s.points > 0 ? ` e somados à Taça da ${esc(house)}` : ""}.</div>` : !a ? `
        <p class="late-warn">O trabalho desta entrega foi excluído, então não é possível corrigir.</p>` : `
        <form id="gradeForm" class="form" novalidate>
          <label class="field"><span>Pontos recebidos (0 a ${fmt(max)})</span>
            <input name="points" type="number" inputmode="numeric" min="0" max="${max}" step="1" required placeholder="Ex.: ${Math.min(max, 10)}"></label>
          <p class="muted tiny">${s.late
            ? `Entrega atrasada: vale no máximo ${latePct()}% dos ${fmt(a.maxPoints)} pontos do trabalho.`
            : `Entrega no prazo: vale até ${fmt(a.maxPoints)} pontos.`} Os pontos vão automaticamente para a Taça da <b>${esc(house)}</b>.</p>
          <button class="btn btn-gold btn-block" type="submit"><span>Salvar correção</span></button>
        </form>`}`, body => {
      const form = body.querySelector("#gradeForm");
      if (!form) return;
      const label = form.querySelector("button span");
      form.points.addEventListener("input", () => {
        const n = parseInt(form.points.value, 10);
        label.textContent = n > 0 ? `Corrigir e enviar ${fmt(n)} pts à ${house}` : "Salvar correção";
      });
      form.addEventListener("submit", async ev => {
        ev.preventDefault();
        const n = Number(form.points.value);
        if (form.points.value === "" || !Number.isInteger(n) || n < 0 || n > max) return toast(`Informe um número inteiro de 0 a ${max}.`, "err");
        if (!confirm(`Confirmar ${fmt(n)} pontos para ${s.studentName}${n > 0 ? ` (somados à Taça da ${house})` : ""}? A correção não pode ser alterada depois.`)) return;
        const btn = form.querySelector("button");
        btn.disabled = true; btn.classList.add("loading");
        try {
          await S.gradeSubmission(s.id, n);
          closeSheet();
          toast(n > 0 ? `Corrigido! +${fmt(n)} pontos para a ${house}. ✨` : "Correção salva.", "ok");
          setTimeout(onDone, 400);
        } catch (e) { toast(e.message || "Erro ao salvar a correção.", "err"); btn.disabled = false; btn.classList.remove("loading"); }
      });
    });
  }

  /* --- Meus trabalhos --- */
  function drawMine(v, t, box, asg, subs) {
    const { esc, fmt, toast } = U();
    const now = Date.now();
    box.innerHTML = asg.length ? `<div class="staff-list">${asg.map(a => {
      const st = S.statusOf(a, now);
      const mineSubs = subs.filter(s => s.assignmentId === a.id);
      const todo = mineSubs.filter(s => s.status !== "graded").length;
      return `
        <article class="hw-card compact st-${STATUS[st].cls}">
          <header class="hw-head"><span class="hw-subject">${yearTxt(a.year)}</span><span class="hw-status ${STATUS[st].cls}">${STATUS[st].label}</span></header>
          <div class="hw-desc clamp">${esc(a.description)}</div>
          <dl class="hw-dates">
            <div><dt>Passado em</dt><dd>${fmtDayStr(a.assignedDate)}</dd></div>
            <div><dt>Entrega até</dt><dd>${fmtDay(a.dueAt)}</dd></div>
            <div><dt>Com atraso até</dt><dd>${fmtDay(a.closeAt)}</dd></div>
            <div><dt>Vale</dt><dd>${fmt(a.maxPoints)} pts</dd></div>
          </dl>
          <footer class="hw-foot split">
            <span class="muted tiny">${mineSubs.length} entrega(s)${todo ? ` · <b class="todo-txt">${todo} para corrigir</b>` : ""}</span>
            ${mineSubs.length ? "" : `<button class="link tiny" data-del="${esc(a.id)}">Excluir trabalho</button>`}
          </footer>
        </article>`;
    }).join("")}</div>` : `<p class="muted center empty">Você ainda não criou nenhum trabalho.</p>
      <p class="center"><button class="btn btn-gold" id="goNew"><span>Criar o primeiro trabalho</span></button></p>`;
    const go = box.querySelector("#goNew");
    if (go) go.addEventListener("click", () => { profTab = "novo"; drawProf(v, t); });
    box.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", async () => {
      if (!confirm("Excluir este trabalho? Ele sai do mural dos alunos.")) return;
      try { await S.deleteAssignment(b.dataset.del); toast("Trabalho excluído."); drawProf(v, t); }
      catch (e) { toast(e.message || "Erro ao excluir.", "err"); }
    }));
  }

  /* --- Novo trabalho --- */
  function drawNew(v, t, box) {
    const { esc, fmt, toast, YEARS } = U();
    box.innerHTML = `
      <section class="panel">
        <h3>Novo trabalho de ${esc(subjName(t.subject))}</h3>
        <p class="muted">A matéria e o seu nome entram automaticamente no trabalho.</p>
        <form id="newHw" class="form" novalidate>
          <div class="row">
            <label class="field"><span>Ano acadêmico</span>
              <select name="year" required><option value="" disabled selected>Ano</option>${YEARS.map((y, i) => `<option value="${i + 1}">${y}</option>`).join("")}</select></label>
            <label class="field"><span>Data em que foi passado</span>
              <input name="date" type="date" required max="${S.today()}" value="${S.today()}"></label>
          </div>
          <label class="field"><span>Descrição do trabalho</span>
            <textarea name="description" rows="8" required placeholder="Explique o que os alunos devem fazer…"></textarea></label>
          <label class="field"><span>Pontuação máxima</span>
            <input name="max" type="number" inputmode="numeric" min="1" max="1000" required placeholder="Ex.: 20"></label>
          <div class="deadline-preview" id="dlPrev"></div>
          <button class="btn btn-gold btn-block" type="submit"><span>Publicar trabalho</span></button>
        </form>
      </section>`;
    const f = box.querySelector("#newHw");
    const prev = () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date.value)) { box.querySelector("#dlPrev").innerHTML = ""; return; }
      const d = S.deadlines(f.date.value), m = parseInt(f.max.value, 10) || 0;
      const lateMax = Math.floor(m * latePct() / 100);
      box.querySelector("#dlPrev").innerHTML = `
        <div><span class="dot open"></span><b>No prazo</b> até ${fmtDay(d.dueAt)}${m ? ` · até ${fmt(m)} pts` : ""}</div>
        <div><span class="dot late"></span><b>Entrega atrasada</b> até ${fmtDay(d.closeAt)}${m ? ` · até ${fmt(lateMax)} pts` : ""}</div>
        <div><span class="dot closed"></span><b>Encerrado</b> depois disso</div>`;
    };
    f.addEventListener("input", prev); prev();
    f.addEventListener("submit", async ev => {
      ev.preventDefault();
      const year = Number(f.year.value), max = Number(f.max.value), desc = f.description.value.trim();
      if (!year) return toast("Escolha o ano acadêmico.", "err");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date.value)) return toast("Informe a data em que o trabalho foi passado.", "err");
      if (f.date.value > S.today()) return toast("A data não pode ser no futuro.", "err");
      if (!desc) return toast("Escreva a descrição do trabalho.", "err");
      if (!Number.isInteger(max) || max < 1 || max > 1000) return toast("A pontuação máxima deve ser um número inteiro de 1 a 1000.", "err");
      if (S.statusOf(S.deadlines(f.date.value)) === "closed") return toast("Com essa data, o prazo (inclusive o de atraso) já teria terminado.", "err");
      const btn = f.querySelector("button[type=submit]");
      btn.disabled = true; btn.classList.add("loading");
      try {
        await S.createAssignment({ year, assignedDate: f.date.value, description: desc, maxPoints: max });
        toast(`Trabalho publicado no mural do ${yearTxt(year)}! ✨`, "ok");
        profTab = "trabalhos"; drawProf(v, t);
      } catch (e) {
        toast(e.message || "Erro ao publicar.", "err");
        btn.disabled = false; btn.classList.remove("loading");
      }
    });
  }

  /* =====================================================
     STAFF: APROVAÇÃO DE PROFESSORES (#/staff/professores)
     ===================================================== */
  let teacherFilter = "pending";
  async function staffTeachers(v) {
    const { esc, toast, staffHeader, bindLogout, staffName } = U();
    v.innerHTML = staffHeader("Professores") + `
      <div class="tabs tabs-3" role="tablist">
        <button data-f="pending">Aguardando</button>
        <button data-f="approved">Aprovados</button>
        <button data-f="rejected">Recusados</button>
      </div>
      <section id="tList" class="staff-list"><p class="muted center">Carregando…</p></section>`;
    bindLogout(v);
    v.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => { teacherFilter = b.dataset.f; draw(); }));
    let list = [];
    try { list = await S.listTeachers(); }
    catch (e) { v.querySelector("#tList").innerHTML = `<p class="muted center">Erro ao carregar os cadastros.</p>`; return; }
    const ST = { pending: "Aguardando aprovação", approved: "Aprovado", rejected: "Recusado" };
    function draw() {
      v.querySelectorAll("[data-f]").forEach(b => b.classList.toggle("active", b.dataset.f === teacherFilter));
      const n = list.filter(t => t.status === "pending").length;
      v.querySelector('[data-f="pending"]').innerHTML = `Aguardando${n ? ` <i>${n}</i>` : ""}`;
      const items = list.filter(t => t.status === teacherFilter);
      v.querySelector("#tList").innerHTML = items.length ? items.map(t => `
        <article class="req teacher ${t.status}" data-id="${esc(t.id)}">
          <div class="req-info">
            <div class="req-top"><b>${esc(t.name)}</b><span class="pill ${t.status === "approved" ? "ok" : t.status === "rejected" ? "late" : "todo"}">${ST[t.status] || t.status}</span></div>
            <p>Matéria: <b>${esc(subjName(t.subject))}</b></p>
            <p class="muted tiny">Cadastro em ${fmtDateTime(t.createdAt)}${t.reviewedBy ? ` · ${t.status === "approved" ? "aprovado" : "analisado"} por ${esc(t.reviewedBy)}${t.reviewedAt ? ` em ${fmtDateTime(t.reviewedAt)}` : ""}` : ""}</p>
            <p class="muted tiny">Login do professor: <b>${esc(t.name)}</b> + a senha que ele definiu</p>
            <div class="req-actions">
              ${t.status !== "approved" ? `<button class="btn btn-ok" data-act="approved">Aprovar</button>` : ""}
              ${t.status === "pending" ? `<button class="btn btn-no" data-act="rejected">Recusar</button>` : ""}
              ${t.status === "approved" ? `<button class="btn btn-no" data-act="rejected">Suspender acesso</button>` : ""}
            </div>
          </div>
        </article>`).join("") : `<p class="muted center empty">${teacherFilter === "pending" ? "Nenhum cadastro aguardando aprovação. ✦" : "Nenhum professor aqui."}</p>`;
      v.querySelectorAll("#tList [data-act]").forEach(b => b.addEventListener("click", async () => {
        const id = b.closest("[data-id]").dataset.id, st = b.dataset.act;
        const t = list.find(x => x.id === id);
        if (st === "rejected" && !confirm(t.status === "approved" ? `Suspender o acesso de ${t.name}?` : `Recusar o cadastro de ${t.name}?`)) return;
        b.disabled = true;
        try {
          await S.setTeacherStatus(id, st, staffName());
          Object.assign(t, { status: st, reviewedBy: staffName(), reviewedAt: Date.now() });
          toast(st === "approved" ? `${t.name} aprovado(a)! Já pode entrar e criar trabalhos.` : "Cadastro atualizado.", "ok");
          draw();
        } catch (e) { toast(e.message || "Erro.", "err"); b.disabled = false; }
      }));
    }
    draw();
  }

  window.HRM_SCHOOL = { viewTrabalhos, viewProfessor, staffTeachers };
})();
