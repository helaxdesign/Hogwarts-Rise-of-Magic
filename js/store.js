/* Armazenamento: Firebase (compartilhado) ou localStorage (modo local) */
(function () {
  const KEYS = ["grifinoria", "corvinal", "sonserina", "lufalufa"];
  const zero = () => Object.fromEntries(KEYS.map(k => [k, 0]));

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const normName = s => String(s || "").trim().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");

  /* O documento do placar guarda os pontos e o estado da Taça (trancada ou aberta) */
  const split = d => {
    d = d || {};
    return {
      pts: Object.fromEntries(KEYS.map(k => [k, Number(d[k]) || 0])),
      cup: { locked: d.locked === true, by: d.lockedBy || "", at: d.lockedAt || 0 }
    };
  };
  /* ---------- Plataforma de Trabalhos: utilidades ---------- */
  const DAY = 86400000;
  const HW = () => Object.assign({ onTimeDays: 7, lateDays: 7, latePercent: 50 }, (window.HRM_CONFIG || {}).homework);
  const slugKey = s => normName(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const teacherEmail = name => slugKey(name) + "@prof.riseofmagic.app";
  const isStaffEmail = e => /@staff\.riseofmagic\.app$/i.test(e || "");
  const isTeacherEmail = e => /@prof\.riseofmagic\.app$/i.test(e || "");
  /* Prazo: 1 semana no prazo (até 23h59 do 7º dia) + 1 semana de entrega atrasada */
  function deadlines(assignedDate) {
    const [y, m, d] = String(assignedDate).split("-").map(Number);
    const dueAt = new Date(y, m - 1, d + HW().onTimeDays, 23, 59, 59, 999).getTime();
    return { dueAt, closeAt: dueAt + HW().lateDays * DAY };
  }
  const statusOf = (a, now = Date.now()) => now <= a.dueAt ? "open" : now <= a.closeAt ? "late" : "closed";
  const maxPointsFor = (a, late) => late ? Math.floor(a.maxPoints * HW().latePercent / 100) : a.maxPoints;
  const MSG = {
    dupTeacher: "Já existe um professor cadastrado com esse nome. Use outro nome ou faça login.",
    weakPass: "A senha precisa ter pelo menos 6 caracteres.",
    closed: "O prazo deste trabalho terminou. Não é possível entregar.",
    dupSub: "Este aluno já entregou este trabalho.",
    graded: "Este trabalho já foi corrigido.",
    lockedGrade: "A Taça está trancada pela Staff: por enquanto não é possível lançar pontos. Tente de novo quando a Taça for reaberta (ou corrija com 0 pontos).",
    net: "Sem conexão com o servidor."
  };
  function buildAssignment(t, input) {
    const { dueAt, closeAt } = deadlines(input.assignedDate);
    return {
      teacherUid: t.id, teacherName: t.name, subject: t.subject,
      year: Number(input.year), assignedDate: input.assignedDate,
      description: String(input.description || "").trim(), maxPoints: Number(input.maxPoints),
      dueAt, closeAt, createdAt: Date.now()
    };
  }
  function buildSubmission(a, input) {
    const now = Date.now(), st = statusOf(a, now);
    if (st === "closed") throw new Error(MSG.closed);
    const studentKey = slugKey(input.studentName);
    return {
      id: `${a.id}__${studentKey}`,
      data: {
        assignmentId: a.id, teacherUid: a.teacherUid, teacherName: a.teacherName,
        subject: a.subject, assignmentYear: a.year,
        studentName: String(input.studentName).trim(), studentKey, house: input.house,
        studentYear: Number(input.studentYear), text: String(input.text),
        submittedAt: now, late: st === "late", status: "pending"
      }
    };
  }
  const hashPass = async str => {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
    }
    return "plain:" + str;
  };
  const noPass = t => { const c = Object.assign({}, t); delete c.passHash; return c; };

  const LOCKED_MSG = "A Taça está trancada pela moderação. Novos pedidos de pontos não estão sendo aceitos agora.";

  const applyDelta = (points, r) => {
    const p = Object.assign(zero(), points);
    const delta = r.type === "add" ? r.amount : -r.amount;
    p[r.house] = Math.max(0, (Number(p[r.house]) || 0) + delta);
    return p;
  };

  /* ---------- localStorage ---------- */
  function localBackend() {
    const read = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } };
    const write = (k, v) => {
      try { localStorage.setItem(k, JSON.stringify(v)); }
      catch (e) { throw new Error("Sem espaço no navegador. Peça à staff para limpar solicitações antigas."); }
    };
    const byDate = (a, b) => b.createdAt - a.createdAt;
    return {
      mode: "local",
      async getPoints() { return split(read("hrm_points", {})).pts; },
      async getCup() { return split(read("hrm_points", {})).cup; },
      async setCupLocked(locked, by) {
        write("hrm_points", Object.assign(read("hrm_points", {}), { locked, lockedBy: by, lockedAt: Date.now() }));
        window.dispatchEvent(new Event("hrm-points"));
      },
      async resetPoints(by) {
        write("hrm_points", Object.assign(read("hrm_points", {}), zero(), { resetBy: by, resetAt: Date.now() }));
        window.dispatchEvent(new Event("hrm-points"));
      },
      watchPoints(cb, onErr) {
        const emit = () => { const x = split(read("hrm_points", {})); cb(x.pts, x.cup); };
        const onStorage = e => { if (e.key === "hrm_points") emit(); };
        window.addEventListener("storage", onStorage);
        window.addEventListener("hrm-points", emit);
        emit();
        return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("hrm-points", emit); };
      },
      async listRequests() { return read("hrm_requests", []).sort(byDate); },
      async addRequest(r) {
        if (split(read("hrm_points", {})).cup.locked) throw new Error(LOCKED_MSG);
        const all = read("hrm_requests", []); all.push(r); write("hrm_requests", all);
      },
      async resolveRequest(id, approve, by) {
        const all = read("hrm_requests", []);
        const r = all.find(x => x.id === id);
        if (!r) throw new Error("Solicitação não encontrada.");
        if (r.status !== "pending") throw new Error("Esta solicitação já foi analisada.");
        if (approve) { write("hrm_points", applyDelta(read("hrm_points", {}), r)); window.dispatchEvent(new Event("hrm-points")); }
        r.status = approve ? "approved" : "denied";
        r.resolvedAt = Date.now(); r.resolvedBy = by;
        write("hrm_requests", all);
      },
      async adjustPoints(house, delta) {
        write("hrm_points", applyDelta(read("hrm_points", {}), { house, type: delta >= 0 ? "add" : "remove", amount: Math.abs(delta) }));
        window.dispatchEvent(new Event("hrm-points"));
      },
      async listTrainings() { return read("hrm_trainings", []).sort(byDate); },
      async countTrainings(charKey, day) { return read("hrm_trainings", []).filter(t => t.charKey === charKey && t.day === day).length; },
      async addTraining(t, limit) {
        const all = read("hrm_trainings", []);
        if (all.filter(x => x.charKey === t.charKey && x.day === t.day).length >= limit)
          throw new Error(`Este personagem já enviou ${limit} treinos hoje.`);
        all.push(t); write("hrm_trainings", all);
      },
      async deleteTraining(id) { write("hrm_trainings", read("hrm_trainings", []).filter(x => x.id !== id)); },

      /* ----- Professores (modo local: senha guardada como hash neste navegador) ----- */
      async teacherSignup(name, subject, pass) {
        if (String(pass).length < 6) throw new Error(MSG.weakPass);
        const all = read("hrm_teachers", []), key = slugKey(name);
        if (all.some(t => t.key === key)) throw new Error(MSG.dupTeacher);
        all.push({ id: uid(), key, name: name.trim(), nameKey: normName(name), subject, status: "pending",
          createdAt: Date.now(), passHash: await hashPass(key + "|" + pass) });
        write("hrm_teachers", all);
      },
      async teacherLogin(name, pass) {
        const key = slugKey(name), t = read("hrm_teachers", []).find(x => x.key === key);
        if (!t || t.passHash !== await hashPass(key + "|" + pass)) return { ok: false, reason: "invalid" };
        if (t.status !== "approved") return { ok: false, reason: t.status };
        try { sessionStorage.setItem("hrm_teacher", t.id); } catch (e) {}
        return { ok: true };
      },
      currentTeacher() {
        let id = null; try { id = sessionStorage.getItem("hrm_teacher"); } catch (e) {}
        const t = id && read("hrm_teachers", []).find(x => x.id === id && x.status === "approved");
        return t ? noPass(t) : null;
      },
      isStaff() { return false; },
      async logout() { try { sessionStorage.removeItem("hrm_teacher"); } catch (e) {} },
      async listTeachers() { return read("hrm_teachers", []).map(noPass).sort(byDate); },
      async setTeacherStatus(id, status, by) {
        const all = read("hrm_teachers", []), t = all.find(x => x.id === id);
        if (!t) throw new Error("Cadastro não encontrado.");
        Object.assign(t, { status, reviewedBy: by, reviewedAt: Date.now() });
        write("hrm_teachers", all);
      },

      /* ----- Trabalhos ----- */
      async createAssignment(input) {
        const t = this.currentTeacher(); if (!t) throw new Error("Faça login como professor.");
        const a = Object.assign({ id: uid() }, buildAssignment(t, input));
        const all = read("hrm_assignments", []); all.push(a); write("hrm_assignments", all);
        return a;
      },
      async deleteAssignment(id) { write("hrm_assignments", read("hrm_assignments", []).filter(a => a.id !== id)); },
      async listAssignments(f = {}) {
        return read("hrm_assignments", []).filter(a =>
          (f.year == null || a.year === Number(f.year)) && (!f.subject || a.subject === f.subject) &&
          (!f.teacherUid || a.teacherUid === f.teacherUid)).sort(byDate);
      },
      async submitWork(a, input) {
        const { id, data } = buildSubmission(a, input);
        const all = read("hrm_submissions", []);
        if (all.some(x => x.id === id)) throw new Error(MSG.dupSub);
        all.push(Object.assign({ id }, data)); write("hrm_submissions", all);
        return Object.assign({ id }, data);
      },
      async listSubmissions(teacherUid) {
        return read("hrm_submissions", []).filter(x => x.teacherUid === teacherUid).sort((a, b) => b.submittedAt - a.submittedAt);
      },
      async listGraded(f) {
        return read("hrm_submissions", []).filter(x => x.status === "graded" && x.assignmentYear === Number(f.year) &&
          x.subject === f.subject && x.house === f.house).sort((a, b) => b.submittedAt - a.submittedAt);
      },
      async gradeSubmission(id, points, feedback = "") {
        const all = read("hrm_submissions", []), sub = all.find(x => x.id === id);
        if (!sub) throw new Error("Entrega não encontrada.");
        if (sub.status === "graded") throw new Error(MSG.graded);
        const a = read("hrm_assignments", []).find(x => x.id === sub.assignmentId);
        if (!a) throw new Error("O trabalho desta entrega foi excluído.");
        const max = maxPointsFor(a, sub.late);
        if (!Number.isInteger(points) || points < 0 || points > max) throw new Error(`A nota deve ser um número inteiro entre 0 e ${max}.`);
        const pts = read("hrm_points", {});
        if (points > 0 && pts.locked === true) throw new Error(MSG.lockedGrade);
        Object.assign(sub, { status: "graded", points, gradedAt: Date.now(), feedback: String(feedback || "").trim() });
        write("hrm_submissions", all);
        if (points > 0) {
          write("hrm_points", applyDelta(pts, { house: sub.house, type: "add", amount: points }));
          window.dispatchEvent(new Event("hrm-points"));
        }
      }
    };
  }

  /* ---------- Firebase Firestore ---------- */
  const loadScript = src => new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = () => rej(new Error("Falha ao carregar " + src));
    document.head.appendChild(s);
  });

  /* "Staff Dobby" -> staff-dobby@staff.riseofmagic.app (conta criada no Firebase Authentication) */
  const staffEmail = nick => normName(nick).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "@staff.riseofmagic.app";

  async function firebaseBackend(cfg) {
    const v = "10.12.2";
    await loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-app-compat.js`);
    await loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore-compat.js`);
    await loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-auth-compat.js`);
    firebase.initializeApp(cfg);
    const db = firebase.firestore();
    const auth = firebase.auth();
    // espera o Firebase restaurar a sessão (staff ou professor), se houver
    await new Promise(res => { const off = auth.onAuthStateChanged(() => { off(); res(); }); });
    const pointsRef = db.collection("meta").doc("points");
    const reqs = db.collection("requests");
    const trains = db.collection("trainings");
    const teachersCol = db.collection("teachers");
    const asgCol = db.collection("assignments");
    const subCol = db.collection("submissions");
    let teacher = null;
    const loadTeacher = async user => {
      const s = await teachersCol.doc(user.uid).get();
      return s.exists ? Object.assign({ id: user.uid }, s.data()) : null;
    };
    const u0 = auth.currentUser;
    if (u0 && isTeacherEmail(u0.email)) {
      try { const t = await loadTeacher(u0); if (t && t.status === "approved") teacher = t; else await auth.signOut(); }
      catch (e) { await auth.signOut().catch(() => {}); }
    }
    const authErr = e => {
      const c = (e && e.code) || "";
      if (/network/i.test(c)) return new Error(MSG.net);
      if (c === "auth/email-already-in-use") return new Error(MSG.dupTeacher);
      if (c === "auth/weak-password") return new Error(MSG.weakPass);
      if (c === "auth/operation-not-allowed") return new Error("O login por e-mail/senha está desativado no Firebase.");
      if (c === "auth/too-many-requests") return new Error("Muitas tentativas. Aguarde alguns minutos.");
      return new Error("Não foi possível concluir. Tente novamente.");
    };
    const docs = q => q.docs.map(d => Object.assign({ id: d.id }, d.data()));

    return {
      mode: "firebase",
      async getPoints() { const s = await pointsRef.get(); return split(s.exists ? s.data() : {}).pts; },
      async getCup() { const s = await pointsRef.get(); return split(s.exists ? s.data() : {}).cup; },
      async setCupLocked(locked, by) {
        await pointsRef.set({ locked, lockedBy: by, lockedAt: Date.now() }, { merge: true });
      },
      async resetPoints(by) {
        await pointsRef.set(Object.assign(zero(), { resetBy: by, resetAt: Date.now() }), { merge: true });
      },
      watchPoints(cb, onErr) {
        return pointsRef.onSnapshot(s => { const x = split(s.exists ? s.data() : {}); cb(x.pts, x.cup); }, onErr);
      },
      isStaff() { return !!auth.currentUser && isStaffEmail(auth.currentUser.email); },
      staffName() { return (auth.currentUser && auth.currentUser.displayName) || "Staff"; },
      async staffLogin(nick, pass) {
        try {
          const cred = await auth.signInWithEmailAndPassword(staffEmail(nick), pass);
          teacher = null;
          if (!cred.user.displayName) await cred.user.updateProfile({ displayName: nick.trim() }).catch(() => {});
          return true;
        } catch (e) {
          if (/network/i.test(e.code || "")) throw new Error("Sem conexão com o servidor.");
          return false;
        }
      },
      async staffLogout() { teacher = null; await auth.signOut(); },
      async logout() { teacher = null; await auth.signOut(); },

      /* ----- Professores ----- */
      async teacherSignup(name, subject, pass) {
        if (String(pass).length < 6) throw new Error(MSG.weakPass);
        const email = teacherEmail(name);
        let cred;
        try { cred = await auth.createUserWithEmailAndPassword(email, pass); }
        catch (e) {
          if (e.code !== "auth/email-already-in-use") throw authErr(e);
          // Recupera um cadastro que ficou pela metade (conta criada, ficha não salva)
          try { cred = await auth.signInWithEmailAndPassword(email, pass); } catch (e2) { throw new Error(MSG.dupTeacher); }
          if (await loadTeacher(cred.user).catch(() => null)) { await auth.signOut(); throw new Error(MSG.dupTeacher); }
        }
        try {
          await teachersCol.doc(cred.user.uid).set({
            name: name.trim(), nameKey: normName(name), subject, status: "pending", createdAt: Date.now()
          });
        } catch (e) { throw new Error("Não foi possível enviar o cadastro. Tente novamente."); }
        finally { teacher = null; await auth.signOut().catch(() => {}); }
      },
      async teacherLogin(name, pass) {
        let cred;
        try { cred = await auth.signInWithEmailAndPassword(teacherEmail(name), pass); }
        catch (e) { if (/network/i.test(e.code || "")) throw new Error(MSG.net); return { ok: false, reason: "invalid" }; }
        const t = await loadTeacher(cred.user).catch(() => null);
        if (!t || t.status !== "approved") { await auth.signOut(); return { ok: false, reason: t ? t.status : "missing" }; }
        teacher = t;
        return { ok: true };
      },
      currentTeacher() { return teacher; },
      async listTeachers() {
        return docs(await teachersCol.get()).sort((a, b) => b.createdAt - a.createdAt);
      },
      async setTeacherStatus(id, status, by) {
        await teachersCol.doc(id).update({ status, reviewedBy: by, reviewedAt: Date.now() });
      },

      /* ----- Trabalhos ----- */
      async createAssignment(input) {
        if (!teacher) throw new Error("Faça login como professor.");
        const ref = asgCol.doc(uid());
        const a = buildAssignment(teacher, input);
        await ref.set(a);
        return Object.assign({ id: ref.id }, a);
      },
      async deleteAssignment(id) { await asgCol.doc(id).delete(); },
      async listAssignments(f = {}) {
        let q = asgCol;
        if (f.year != null) q = q.where("year", "==", Number(f.year));
        else if (f.subject) q = q.where("subject", "==", f.subject);
        else if (f.teacherUid) q = q.where("teacherUid", "==", f.teacherUid);
        return docs(await q.get()).filter(a =>
          (f.year == null || a.year === Number(f.year)) && (!f.subject || a.subject === f.subject) &&
          (!f.teacherUid || a.teacherUid === f.teacherUid)).sort((a, b) => b.createdAt - a.createdAt);
      },
      async submitWork(a, input) {
        const { id, data } = buildSubmission(a, input);
        try { await subCol.doc(id).set(data); }
        catch (e) {
          if (e.code === "permission-denied") throw new Error(MSG.dupSub + " (ou o prazo terminou)");
          throw new Error("Erro ao entregar. Tente novamente.");
        }
        return Object.assign({ id }, data);
      },
      async listSubmissions(teacherUid) {
        return docs(await subCol.where("teacherUid", "==", teacherUid).get()).sort((a, b) => b.submittedAt - a.submittedAt);
      },
      async listGraded(f) {
        const q = subCol.where("status", "==", "graded").where("assignmentYear", "==", Number(f.year))
          .where("subject", "==", f.subject).where("house", "==", f.house);
        return docs(await q.get()).sort((a, b) => b.submittedAt - a.submittedAt);
      },
      async gradeSubmission(id, points, feedback = "") {
        await db.runTransaction(async tx => {
          const ref = subCol.doc(id);
          const s = await tx.get(ref);
          if (!s.exists) throw new Error("Entrega não encontrada.");
          const sub = s.data();
          if (sub.status === "graded") throw new Error(MSG.graded);
          const as = await tx.get(asgCol.doc(sub.assignmentId));
          if (!as.exists) throw new Error("O trabalho desta entrega foi excluído.");
          const max = maxPointsFor(as.data(), sub.late);
          if (!Number.isInteger(points) || points < 0 || points > max) throw new Error(`A nota deve ser um número inteiro entre 0 e ${max}.`);
          const p = await tx.get(pointsRef);
          const pd = p.exists ? p.data() : {};
          if (points > 0 && pd.locked === true) throw new Error(MSG.lockedGrade);
          tx.update(ref, { status: "graded", points, gradedAt: Date.now(), feedback: String(feedback || "").trim() });
          // os pontos vão direto para a Taça da casa do aluno
          if (points > 0) tx.set(pointsRef, { [sub.house]: (Number(pd[sub.house]) || 0) + points, lastGrade: id }, { merge: true });
        });
      },
      async listRequests() { return docs(await reqs.orderBy("createdAt", "desc").limit(300).get()); },
      async addRequest(r) {
        const s = await pointsRef.get();
        if (split(s.exists ? s.data() : {}).cup.locked) throw new Error(LOCKED_MSG);
        try { await reqs.doc(r.id).set(r); }
        catch (e) { throw new Error(e.code === "permission-denied" ? "O servidor recusou o pedido. A Taça pode ter sido trancada agora há pouco." : "Erro ao enviar. Tente novamente."); }
      },
      async resolveRequest(id, approve, by) {
        await db.runTransaction(async tx => {
          const ref = reqs.doc(id);
          const s = await tx.get(ref);
          if (!s.exists) throw new Error("Solicitação não encontrada.");
          const r = s.data();
          if (r.status !== "pending") throw new Error("Esta solicitação já foi analisada.");
          const p = await tx.get(pointsRef);
          if (approve) tx.set(pointsRef, applyDelta(p.exists ? p.data() : {}, r));
          tx.update(ref, { status: approve ? "approved" : "denied", resolvedAt: Date.now(), resolvedBy: by });
        });
      },
      async adjustPoints(house, delta) {
        await db.runTransaction(async tx => {
          const p = await tx.get(pointsRef);
          tx.set(pointsRef, applyDelta(p.exists ? p.data() : {}, { house, type: delta >= 0 ? "add" : "remove", amount: Math.abs(delta) }));
        });
      },
      async listTrainings() { return docs(await trains.orderBy("createdAt", "desc").limit(200).get()); },
      async countTrainings(charKey, day) {
        return (await trains.where("charKey", "==", charKey).where("day", "==", day).get()).size;
      },
      async addTraining(t, limit) {
        // id determinístico por personagem/dia/slot impede ultrapassar o limite
        for (let slot = 1; slot <= limit; slot++) {
          const ref = trains.doc(`${t.day}__${t.charKey.replace(/[^a-z0-9]+/g, "-")}__${slot}`);
          const ok = await db.runTransaction(async tx => {
            const s = await tx.get(ref);
            if (s.exists) return false;
            tx.set(ref, Object.assign({}, t, { id: ref.id }));
            return true;
          });
          if (ok) return;
        }
        throw new Error(`Este personagem já enviou ${limit} treinos hoje.`);
      },
      async deleteTraining(id) { await trains.doc(id).delete(); }
    };
  }

  const Store = {
    uid, today, normName, KEYS, staffEmail, slugKey, teacherEmail, deadlines, statusOf, maxPointsFor,
    backend: null,
    async init() {
      const cfg = window.HRM_CONFIG && window.HRM_CONFIG.firebase;
      if (cfg) {
        try { this.backend = await firebaseBackend(cfg); return this.backend.mode; }
        catch (e) { console.error(e); this.backend = localBackend(); this.backend.mode = "offline"; return "offline"; }
      }
      this.backend = localBackend();
      return this.backend.mode;
    }
  };
  ["getPoints", "getCup", "setCupLocked", "resetPoints", "watchPoints", "listRequests", "addRequest", "resolveRequest", "adjustPoints",
   "listTrainings", "countTrainings", "addTraining", "deleteTraining",
   "teacherSignup", "teacherLogin", "currentTeacher", "logout", "listTeachers", "setTeacherStatus",
   "createAssignment", "deleteAssignment", "listAssignments", "submitWork", "listSubmissions", "gradeSubmission", "listGraded"].forEach(fn => {
    Store[fn] = (...a) => Store.backend[fn](...a);
  });

  window.HRM_STORE = Store;
})();
