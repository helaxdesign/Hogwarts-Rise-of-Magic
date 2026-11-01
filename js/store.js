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
      async getPoints() { return Object.assign(zero(), read("hrm_points", {})); },
      watchPoints(cb, onErr) {
        const emit = () => cb(Object.assign(zero(), read("hrm_points", {})));
        const onStorage = e => { if (e.key === "hrm_points") emit(); };
        window.addEventListener("storage", onStorage);
        window.addEventListener("hrm-points", emit);
        emit();
        return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("hrm-points", emit); };
      },
      async listRequests() { return read("hrm_requests", []).sort(byDate); },
      async addRequest(r) { const all = read("hrm_requests", []); all.push(r); write("hrm_requests", all); },
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
      async deleteRequest(id) { write("hrm_requests", read("hrm_requests", []).filter(x => x.id !== id)); },
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
      async deleteTraining(id) { write("hrm_trainings", read("hrm_trainings", []).filter(x => x.id !== id)); }
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
    // espera o Firebase restaurar a sessão da staff (se houver)
    await new Promise(res => { const off = auth.onAuthStateChanged(() => { off(); res(); }); });
    const pointsRef = db.collection("meta").doc("points");
    const reqs = db.collection("requests");
    const trains = db.collection("trainings");
    const docs = q => q.docs.map(d => Object.assign({ id: d.id }, d.data()));

    return {
      mode: "firebase",
      async getPoints() { const s = await pointsRef.get(); return Object.assign(zero(), s.exists ? s.data() : {}); },
      watchPoints(cb, onErr) {
        return pointsRef.onSnapshot(s => cb(Object.assign(zero(), s.exists ? s.data() : {})), onErr);
      },
      isStaff() { return !!auth.currentUser; },
      staffName() { return (auth.currentUser && auth.currentUser.displayName) || "Staff"; },
      async staffLogin(nick, pass) {
        try {
          const cred = await auth.signInWithEmailAndPassword(staffEmail(nick), pass);
          if (!cred.user.displayName) await cred.user.updateProfile({ displayName: nick.trim() }).catch(() => {});
          return true;
        } catch (e) {
          if (/network/i.test(e.code || "")) throw new Error("Sem conexão com o servidor.");
          return false;
        }
      },
      async staffLogout() { await auth.signOut(); },
      async listRequests() { return docs(await reqs.orderBy("createdAt", "desc").limit(300).get()); },
      async addRequest(r) { await reqs.doc(r.id).set(r); },
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
      async deleteRequest(id) { await reqs.doc(id).delete(); },
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
    uid, today, normName, KEYS, staffEmail,
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
  ["getPoints", "watchPoints", "listRequests", "addRequest", "resolveRequest", "deleteRequest", "adjustPoints",
   "listTrainings", "countTrainings", "addTraining", "deleteTraining"].forEach(fn => {
    Store[fn] = (...a) => Store.backend[fn](...a);
  });

  window.HRM_STORE = Store;
})();
