/* Rica Vista Tenant Help — shared store (localStorage). Demo only; no real pages are sent. */
(function (global) {
  const KEY = "ricavista-tenant-help-v1";
  const ADMIN_SESSION = "ricavista-admin-session";
  const PIN = "1825";
  const TZ = "America/Los_Angeles";

  const BUILDING = {
    name: "Rica Vista Apartments",
    shortName: "Rica Vista",
    address: "1825 Poggi Street",
    city: "Alameda, CA",
    zip: "94501",
    line: "1825 Poggi Street, Alameda, CA"
  };

  const CATEGORIES = [
    { id: "emergency", name: "Emergency", short: "Emergency", blurb: "Fire, flood, or gas", call911: true, defaultUrgency: "emergency" },
    { id: "water", name: "Water leak", short: "Water leak", blurb: "Drips, bursts, or backups", call911: false, defaultUrgency: "urgent" },
    { id: "lockout", name: "Lockout", short: "Lockout", blurb: "Locked out of a unit or building", call911: false, defaultUrgency: "urgent" },
    { id: "access", name: "Elevator, door, or gate", short: "Access", blurb: "Entry, elevator, or gate trouble", call911: false, defaultUrgency: "urgent" },
    { id: "noise", name: "Noise or neighbor", short: "Noise", blurb: "Noise or a neighbor concern", call911: false, defaultUrgency: "normal" },
    { id: "pest", name: "Pest", short: "Pest", blurb: "Insects, rodents, or wildlife", call911: false, defaultUrgency: "normal" },
    { id: "maintenance", name: "General maintenance", short: "Maintenance", blurb: "Repairs and unit issues", call911: false, defaultUrgency: "normal" },
    { id: "package", name: "Package or office", short: "Office", blurb: "Packages, keys, or office questions", call911: false, defaultUrgency: "normal" }
  ];

  const URGENCY = [
    { id: "normal", name: "Normal" },
    { id: "urgent", name: "Urgent" },
    { id: "emergency", name: "Emergency" }
  ];

  const METHODS = [
    { id: "sms", name: "SMS" },
    { id: "call", name: "Call" },
    { id: "email", name: "Email" }
  ];

  const STATUSES = [
    { id: "new", name: "New", tenant: "Submitted" },
    { id: "acknowledged", name: "Acknowledged", tenant: "Acknowledged" },
    { id: "in_progress", name: "In progress", tenant: "In progress" },
    { id: "done", name: "Done", tenant: "Resolved" }
  ];

  const EXAMPLE_UNITS = ["101", "104", "108", "112", "201", "207", "212", "214", "221", "305", "321", "330", "405", "412", "418"];

  const DEFAULT_RECIPIENTS = [
    { id: "r-jordan", name: "Jordan Hale", role: "On-site Manager", phone: "(707) 867-6741", email: "jordan.hale@example.demo", hours: "Mon–Fri 9:00 AM–6:00 PM PT", demo: true },
    { id: "r-sam", name: "Sam Reyes", role: "Office", phone: "(707) 867-6741", email: "sam.reyes@example.demo", hours: "Mon–Fri 9:00 AM–6:00 PM PT", demo: true },
    { id: "r-casey", name: "Casey Nguyen", role: "After-hours Emergency", phone: "(707) 867-6741", email: "casey.nguyen@example.demo", hours: "Evenings, nights & weekends", demo: true },
    { id: "r-morgan", name: "Morgan Ellis", role: "Maintenance On-Call", phone: "(707) 867-6741", email: "morgan.ellis@example.demo", hours: "Mon–Fri 8:00 AM–5:00 PM PT", demo: true },
    { id: "r-riley", name: "Riley Chen", role: "Maintenance Tech", phone: "(707) 867-6741", email: "riley.chen@example.demo", hours: "Mon–Sat 8:00 AM–5:00 PM PT", demo: true },
    { id: "r-alex", name: "Alex Rivera", role: "After-hours Maintenance", phone: "(707) 867-6741", email: "alex.rivera@example.demo", hours: "Evenings, nights & weekends", demo: true }
  ];

  /* delayMinutes: 0 = page immediately; otherwise page if still unacknowledged after N minutes */
  const DEFAULT_RULES = [
    { categoryId: "emergency", steps: [
      { recipientId: "r-jordan", methods: ["sms", "call"], delayMinutes: 0 },
      { recipientId: "r-morgan", methods: ["sms", "call"], delayMinutes: 0 },
      { recipientId: "r-casey", methods: ["sms", "call"], delayMinutes: 5 }
    ]},
    { categoryId: "water", steps: [
      { recipientId: "r-morgan", methods: ["sms"], delayMinutes: 0 },
      { recipientId: "r-jordan", methods: ["sms"], delayMinutes: 0 },
      { recipientId: "r-riley", methods: ["sms"], delayMinutes: 15 }
    ]},
    { categoryId: "lockout", steps: [
      { recipientId: "r-jordan", methods: ["sms", "call"], delayMinutes: 0 },
      { recipientId: "r-casey", methods: ["sms", "call"], delayMinutes: 10 }
    ]},
    { categoryId: "access", steps: [
      { recipientId: "r-morgan", methods: ["sms"], delayMinutes: 0 },
      { recipientId: "r-jordan", methods: ["sms"], delayMinutes: 0 },
      { recipientId: "r-alex", methods: ["sms", "call"], delayMinutes: 15 }
    ]},
    { categoryId: "noise", steps: [
      { recipientId: "r-jordan", methods: ["sms"], delayMinutes: 0 },
      { recipientId: "r-sam", methods: ["sms"], delayMinutes: 20 }
    ]},
    { categoryId: "pest", steps: [
      { recipientId: "r-morgan", methods: ["sms"], delayMinutes: 0 },
      { recipientId: "r-jordan", methods: ["email"], delayMinutes: 30 }
    ]},
    { categoryId: "maintenance", steps: [
      { recipientId: "r-morgan", methods: ["sms"], delayMinutes: 0 },
      { recipientId: "r-riley", methods: ["sms"], delayMinutes: 30 }
    ]},
    { categoryId: "package", steps: [
      { recipientId: "r-sam", methods: ["sms", "email"], delayMinutes: 0 },
      { recipientId: "r-jordan", methods: ["email"], delayMinutes: 60 }
    ]}
  ];

  const listeners = new Set();
  let state = null;

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function uid(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function minutesAgo(mins) { return Date.now() - mins * 60 * 1000; }

  function categoryById(id) { return CATEGORIES.find((c) => c.id === id) || null; }
  function statusById(id) { return STATUSES.find((s) => s.id === id) || STATUSES[0]; }
  function methodName(id) { return (METHODS.find((m) => m.id === id) || { name: id }).name; }

  function recipientById(id, snap) {
    const s = snap || state;
    return (s.recipients || []).find((r) => r.id === id) || null;
  }

  function ruleByCategory(categoryId, snap) {
    const s = snap || state;
    return (s.rules || []).find((r) => r.categoryId === categoryId) || { categoryId, steps: [] };
  }

  function seedPagesForRequest(req, snap) {
    const pages = [];
    for (const p of req.pages) {
      const rec = recipientById(p.recipientId, snap);
      pages.push(Object.assign({}, p, {
        requestId: req.id,
        unit: req.unit,
        categoryId: req.categoryId,
        to: p.to || targetFor(rec, p.method)
      }));
    }
    return pages;
  }

  function targetFor(rec, method) {
    if (!rec) return "Unknown";
    if (method === "email") return rec.email || "no email on file";
    return rec.phone || "no number on file";
  }

  function buildPages(req, steps, recipients, at, queuedOnly) {
    const pages = [];
    for (const step of steps) {
      const rec = recipients.find((r) => r.id === step.recipientId);
      const delay = Number(step.delayMinutes) || 0;
      const isQueued = delay > 0;
      if (queuedOnly && !isQueued) continue;
      for (const method of step.methods || []) {
        pages.push({
          id: uid("pg"),
          requestId: req.id,
          recipientId: step.recipientId,
          recipientName: rec ? rec.name : "Unknown",
          role: rec ? rec.role : "",
          method,
          to: targetFor(rec, method),
          at: isQueued ? at : at,
          scheduledAt: isQueued ? at + delay * 60 * 1000 : at,
          delayMinutes: delay,
          kind: isQueued ? "escalation" : "immediate",
          state: isQueued ? "queued" : "pending"
        });
      }
    }
    return pages;
  }

  function seedState() {
    const recipients = clone(DEFAULT_RECIPIENTS);
    const rules = clone(DEFAULT_RULES);
    const snap = { recipients, rules };

    const r1At = minutesAgo(26 * 60);
    const r1 = {
      id: "RV-1042",
      unit: "214",
      categoryId: "water",
      description: "EXAMPLE — Slow leak under the kitchen sink. A small puddle forms after the dishwasher runs.",
      photoName: null,
      photoDataUrl: null,
      urgency: "urgent",
      createdAt: r1At,
      status: "acknowledged",
      example: true,
      timeline: [
        { at: r1At, status: "new", note: "Request submitted by tenant", actor: "Tenant · Unit 214" },
        { at: r1At + 18 * 60 * 1000, status: "acknowledged", note: "Staff acknowledged the request.", actor: "Morgan Ellis (example)" }
      ],
      pages: []
    };
    r1.pages = buildPages(r1, ruleByCategory("water", snap).steps, recipients, r1At);
    r1.pages.forEach((p) => {
      if (p.kind === "escalation") p.state = "cancelled";
    });

    const r2At = minutesAgo(3 * 24 * 60);
    const r2 = {
      id: "RV-1038",
      unit: "108",
      categoryId: "package",
      description: "EXAMPLE — Holding a grocery delivery for pickup. Driver left it at the office door after hours.",
      photoName: null,
      photoDataUrl: null,
      urgency: "normal",
      createdAt: r2At,
      status: "done",
      example: true,
      timeline: [
        { at: r2At, status: "new", note: "Request submitted by tenant", actor: "Tenant · Unit 108" },
        { at: r2At + 40 * 60 * 1000, status: "acknowledged", note: "Staff acknowledged the request.", actor: "Sam Reyes (example)" },
        { at: r2At + 3 * 60 * 60 * 1000, status: "in_progress", note: "Package logged and held at the office.", actor: "Sam Reyes (example)" },
        { at: r2At + 20 * 60 * 60 * 1000, status: "done", note: "Tenant picked up the package.", actor: "Sam Reyes (example)" }
      ],
      pages: []
    };
    r2.pages = buildPages(r2, ruleByCategory("package", snap).steps, recipients, r2At);
    r2.pages.forEach((p) => { if (p.kind === "escalation") p.state = "cancelled"; });

    const r3At = minutesAgo(5 * 60);
    const r3 = {
      id: "RV-1045",
      unit: "321",
      categoryId: "noise",
      description: "EXAMPLE — Loud music from a nearby unit starting around 10:30 PM, still going.",
      photoName: null,
      photoDataUrl: null,
      urgency: "normal",
      createdAt: r3At,
      status: "in_progress",
      example: true,
      timeline: [
        { at: r3At, status: "new", note: "Request submitted by tenant", actor: "Tenant · Unit 321" },
        { at: r3At + 12 * 60 * 1000, status: "acknowledged", note: "Staff acknowledged the request.", actor: "Jordan Hale (example)" },
        { at: r3At + 25 * 60 * 1000, status: "in_progress", note: "Staff is following up.", actor: "Jordan Hale (example)" }
      ],
      pages: []
    };
    r3.pages = buildPages(r3, ruleByCategory("noise", snap).steps, recipients, r3At);
    r3.pages.forEach((p) => { if (p.kind === "escalation") p.state = "cancelled"; });

    const r4At = minutesAgo(40);
    const r4 = {
      id: "RV-1046",
      unit: "405",
      categoryId: "access",
      description: "EXAMPLE — Courtyard gate is stuck open and will not latch. Anyone can walk in.",
      photoName: null,
      photoDataUrl: null,
      urgency: "urgent",
      createdAt: r4At,
      status: "new",
      example: true,
      timeline: [
        { at: r4At, status: "new", note: "Request submitted by tenant", actor: "Tenant · Unit 405" }
      ],
      pages: []
    };
    r4.pages = buildPages(r4, ruleByCategory("access", snap).steps, recipients, r4At);

    function markOpenedIfHistorical(req, treatPending) {
      req.pages.forEach((p) => {
        if (p.kind === "immediate") p.state = treatPending ? "pending" : "opened";
        if (p.state === "opened") p.openedAt = req.createdAt + 20 * 1000;
      });
    }
    markOpenedIfHistorical(r1, false);
    markOpenedIfHistorical(r2, false);
    markOpenedIfHistorical(r3, false);
    markOpenedIfHistorical(r4, true);

    const requests = [r4, r3, r1, r2];
    let pages = [];
    requests.forEach((req) => { pages = pages.concat(seedPagesForRequest(req, snap)); });

    return {
      version: 1,
      recipients,
      rules,
      requests,
      pages,
      currentUnit: "",
      nextRequestNum: 1047
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        state = seedState();
        persist();
        return state;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.requests)) {
        state = seedState();
        persist();
        return state;
      }
      state = parsed;
      if (!Array.isArray(state.pages)) state.pages = [];
      return state;
    } catch (err) {
      state = seedState();
      return state;
    }
  }

  function persist() {
    localStorage.setItem(KEY, JSON.stringify(state));
    emit();
  }

  function emit() {
    listeners.forEach((fn) => {
      try { fn(state); } catch (e) { /* ignore */ }
    });
  }

  function getState() {
    if (!state) load();
    return state;
  }

  function resetDemo() {
    state = seedState();
    persist();
    return state;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return function () { listeners.delete(fn); };
  }

  window.addEventListener("storage", (ev) => {
    if (ev.key === KEY) {
      try {
        state = ev.newValue ? JSON.parse(ev.newValue) : seedState();
        emit();
      } catch (e) { /* ignore */ }
    }
  });

  function setUnit(unit) {
    getState();
    state.currentUnit = String(unit || "").trim();
    persist();
  }

  function getUnit() {
    return getState().currentUnit || "";
  }

  function nextId() {
    const n = state.nextRequestNum || 1100;
    state.nextRequestNum = n + 1;
    return "RV-" + n;
  }

  function submitRequest(payload) {
    getState();
    const unit = String(payload.unit || "").trim();
    const categoryId = payload.categoryId;
    const cat = categoryById(categoryId);
    if (!unit) throw new Error("Please enter a unit.");
    if (!cat) throw new Error("Please choose a category.");
    const description = String(payload.description || "").trim();
    if (!description) throw new Error("Please add a short description.");
    let urgency = payload.urgency || cat.defaultUrgency || "normal";
    if (cat.call911) urgency = "emergency";
    const at = Date.now();
    const req = {
      id: nextId(),
      unit,
      categoryId,
      description,
      photoName: payload.photoName || null,
      photoDataUrl: payload.photoDataUrl || null,
      urgency,
      createdAt: at,
      status: "new",
      example: !!payload.example,
      timeline: [{ at, status: "new", note: "Request submitted by tenant", actor: "Tenant · Unit " + unit }],
      pages: []
    };
    const steps = ruleByCategory(categoryId).steps || [];
    req.pages = buildPages(req, steps, state.recipients, at);
    state.pages = (state.pages || []).concat(req.pages.map((p) => Object.assign({}, p, {
      requestId: req.id,
      unit: req.unit,
      categoryId: req.categoryId
    })));
    state.currentUnit = unit;
    state.requests.unshift(req);
    persist();
    return req;
  }

  function getRequest(id) {
    return getState().requests.find((r) => r.id === id) || null;
  }

  function requestsForUnit(unit) {
    const u = String(unit || "").trim();
    return getState().requests.filter((r) => r.unit === u);
  }

  function allRequests() {
    return getState().requests.slice().sort((a, b) => b.createdAt - a.createdAt);
  }

  function cancelQueuedFor(requestId, at, note) {
    const req = getRequest(requestId);
    if (!req) return;
    req.pages.forEach((p) => {
      if (p.state === "queued") p.state = "cancelled";
    });
    (state.pages || []).forEach((p) => {
      if (p.requestId === requestId && p.state === "queued") p.state = "cancelled";
    });
    if (note) {
      /* timeline note added by caller */
    }
  }

  function setStatus(id, status, actor) {
    getState();
    const req = getRequest(id);
    if (!req) throw new Error("Request not found.");
    if (!statusById(status) || status === req.status) {
      if (status === req.status) return req;
    }
    const at = Date.now();
    req.status = status;
    const labels = {
      acknowledged: "Staff acknowledged the request.",
      in_progress: "Staff marked this as in progress.",
      done: "Staff marked this as resolved.",
      new: "Status set back to new."
    };
    req.timeline.push({
      at,
      status,
      note: labels[status] || ("Status changed to " + status),
      actor: actor || "Building staff (demo)"
    });
    if (status === "acknowledged" || status === "in_progress" || status === "done") {
      cancelQueuedFor(id, at);
    }
    persist();
    return req;
  }

  function recipients() { return getState().recipients.slice(); }

  function upsertRecipient(data) {
    getState();
    const name = String(data.name || "").trim();
    const role = String(data.role || "").trim();
    const phone = String(data.phone || "").trim();
    if (!name) throw new Error("Name is required.");
    if (!phone && !String(data.email || "").trim()) throw new Error("Add a phone number or email.");
    if (data.id) {
      const existing = recipientById(data.id);
      if (!existing) throw new Error("Person not found.");
      existing.name = name;
      existing.role = role || existing.role;
      existing.phone = phone;
      existing.email = String(data.email || "").trim();
      existing.hours = String(data.hours || "").trim();
      /* Keep page-log history, but future pages will use new numbers via buildPages */
    } else {
      state.recipients.push({
        id: uid("r"),
        name,
        role: role || "Staff",
        phone,
        email: String(data.email || "").trim(),
        hours: String(data.hours || "Hours not set").trim(),
        demo: false
      });
    }
    persist();
  }

  function deleteRecipient(id) {
    getState();
    state.recipients = state.recipients.filter((r) => r.id !== id);
    state.rules.forEach((rule) => {
      rule.steps = rule.steps.filter((s) => s.recipientId !== id);
    });
    persist();
  }

  function setRule(categoryId, steps) {
    getState();
    const cleaned = (steps || []).map((s) => ({
      recipientId: s.recipientId,
      methods: (s.methods || []).filter(Boolean),
      delayMinutes: Math.max(0, Number(s.delayMinutes) || 0)
    })).filter((s) => s.recipientId && s.methods.length);
    const existing = state.rules.find((r) => r.categoryId === categoryId);
    if (existing) existing.steps = cleaned;
    else state.rules.push({ categoryId, steps: cleaned });
    persist();
  }

  function pages() {
    return (getState().pages || []).slice().sort((a, b) => {
      const ta = a.kind === "escalation" && a.state === "queued" ? a.scheduledAt : a.at;
      const tb = b.kind === "escalation" && b.state === "queued" ? b.scheduledAt : b.at;
      return tb - ta;
    });
  }

  function runEscalation(requestId) {
    getState();
    const req = getRequest(requestId);
    if (!req) throw new Error("Request not found.");
    if (req.status !== "new") throw new Error("This request was already acknowledged. Queued pages were cancelled.");
    const at = Date.now();
    let count = 0;
    function fire(p) {
      if (p.requestId === requestId && p.state === "queued") {
        p.state = "pending";
        p.at = at;
        count += 1;
      }
    }
    req.pages.forEach(fire);
    (state.pages || []).forEach(fire);
    if (count === 0) throw new Error("No queued escalation pages to send.");
    req.timeline.push({
      at,
      status: req.status,
      note: "Escalation is ready: additional staff should be notified because the request is still unacknowledged.",
      actor: "Routing rules"
    });
    persist();
    return count;
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(d);
  }

  function formatTimeFull(ts) {
    const d = new Date(ts);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(d);
  }

  function relativeTime(ts) {
    const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + " min ago";
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + " hr" + (hrs === 1 ? "" : "s") + " ago";
    const days = Math.round(hrs / 24);
    return days + " day" + (days === 1 ? "" : "s") + " ago";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function confirmPin(pin) {
    const ok = String(pin || "").trim() === PIN;
    if (ok) sessionStorage.setItem(ADMIN_SESSION, "1");
    return ok;
  }

  function isAdminAuthed() {
    return sessionStorage.getItem(ADMIN_SESSION) === "1";
  }

  function logoutAdmin() {
    sessionStorage.removeItem(ADMIN_SESSION);
  }

  function resizeImage(file, max = 800) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (!file.type || !file.type.startsWith("image/")) {
        return reject(new Error("Please choose a photo."));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read that photo."));
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          let dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          if (dataUrl.length > 180000) dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          if (dataUrl.length > 220000) {
            resolve({ name: file.name, dataUrl: null, skipped: true });
            return;
          }
          resolve({ name: file.name, dataUrl, skipped: false });
        };
        img.onerror = () => reject(new Error("Could not open that photo."));
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function immediatePages(req) {
    return (req.pages || []).filter((p) => p.kind === "immediate");
  }

  function queuedPages(req) {
    return (req.pages || []).filter((p) => p.kind === "escalation");
  }

  function uniquePeople(pageList) {
    const seen = new Map();
    (pageList || []).forEach((p) => {
      const key = p.recipientId + ":" + p.kind + ":" + p.delayMinutes;
      if (!seen.has(key)) {
        seen.set(key, { recipientId: p.recipientId, name: p.recipientName, role: p.role, methods: [p.method], to: [p.to], kind: p.kind, delayMinutes: p.delayMinutes, state: p.state });
      } else {
        const row = seen.get(key);
        if (!row.methods.includes(p.method)) row.methods.push(p.method);
        if (!row.to.includes(p.to)) row.to.push(p.to);
      }
    });
    return Array.from(seen.values());
  }


  function digits(phone) {
    return String(phone || "").replace(/\D/g, "");
  }

  function formatPhone(phone) {
    const d = digits(phone);
    if (d.length === 11 && d[0] === "1") {
      return "(" + d.slice(1, 4) + ") " + d.slice(4, 7) + "-" + d.slice(7);
    }
    if (d.length === 10) {
      return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    }
    return String(phone || "").trim() || "No number";
  }

  function telUrl(phone) {
    const d = digits(phone);
    if (!d) return "";
    return "tel:+1" + (d.length === 11 && d[0] === "1" ? d.slice(1) : d);
  }

  function isIOS() {
    const ua = navigator.userAgent || "";
    const iOSDevice = /iPad|iPhone|iPod/.test(ua);
    const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return iOSDevice || iPadOS;
  }

  function isAndroid() {
    return /Android/i.test(navigator.userAgent || "");
  }

  function isMobile() {
    return isIOS() || isAndroid() || /Mobi|webOS|BlackBerry|Opera Mini/i.test(navigator.userAgent || "");
  }

  function isDesktop() {
    return !isMobile();
  }

  function pageStateLabel(state) {
    return ({
      pending: "Ready to send",
      opened: "Text opened on device",
      queued: "Queued — send if unacknowledged",
      cancelled: "Cancelled"
    })[state] || state;
  }

  function liveRecipient(id) {
    return recipientById(id) || null;
  }

  function targetsForPages(pageList, useLive) {
    const rows = [];
    const seenPhone = new Set();
    (pageList || []).forEach((p) => {
      const rec = useLive ? liveRecipient(p.recipientId) : null;
      const name = rec ? rec.name : p.recipientName;
      const role = rec ? rec.role : p.role;
      const phone = rec ? rec.phone : (p.method === "email" ? "" : p.to);
      const email = rec ? rec.email : (p.method === "email" ? p.to : "");
      const d = digits(phone);
      rows.push({
        recipientId: p.recipientId,
        name,
        role,
        method: p.method,
        phone,
        phoneDigits: d,
        email,
        to: p.method === "email" ? (email || p.to) : formatPhone(phone || p.to),
        kind: p.kind,
        state: p.state,
        delayMinutes: p.delayMinutes
      });
      if (d) seenPhone.add(d);
    });
    return rows;
  }

  function uniquePhones(rows) {
    const map = new Map();
    (rows || []).forEach((r) => {
      if (!r.phoneDigits) return;
      if (!map.has(r.phoneDigits)) {
        map.set(r.phoneDigits, { phone: r.phone, phoneDigits: r.phoneDigits, people: [] });
      }
      const entry = map.get(r.phoneDigits);
      if (!entry.people.some((p) => p.recipientId === r.recipientId)) {
        entry.people.push({ recipientId: r.recipientId, name: r.name, role: r.role });
      }
    });
    return Array.from(map.values());
  }

  function pagesForSend(req, mode) {
    const pages = req.pages || [];
    if (mode === "escalation") return pages.filter((p) => p.kind === "escalation" && p.state !== "cancelled");
    if (mode === "pending") return pages.filter((p) => p.state === "pending" || (p.kind === "immediate" && p.state === "opened"));
    if (mode === "immediate") return pages.filter((p) => p.kind === "immediate");
    return pages.filter((p) => p.state !== "cancelled" && p.method !== "email");
  }

  function notifyLine(req, mode) {
    const rows = targetsForPages(pagesForSend(req, mode || "immediate"), true);
    const people = [];
    rows.forEach((r) => {
      if (!people.some((p) => p.recipientId === r.recipientId)) {
        people.push(r);
      }
    });
    return people.map((p) => p.name + " (" + p.role + ")").join(", ");
  }

  function buildPageMessage(req, mode) {
    const cat = categoryById(req.categoryId);
    const urgency = (URGENCY.find((u) => u.id === req.urgency) || { name: req.urgency }).name;
    const who = notifyLine(req, mode || "immediate");
    const desc = String(req.description || "").trim();
    const clipped = desc.length > 400 ? desc.slice(0, 397) + "…" : desc;
    const header = (mode === "escalation")
      ? "FOLLOW-UP (still unacknowledged)"
      : "Rica Vista Tenant Help";
    const lines = [
      header,
      BUILDING.line,
      "Request " + req.id + " · Unit " + req.unit,
      "Category: " + (cat ? cat.name : req.categoryId),
      "Urgency: " + urgency,
      who ? "Notify: " + who : "",
      "",
      clipped,
      "",
      "Submitted " + formatTimeFull(req.createdAt)
    ].filter((line, i, arr) => line !== "" || (arr[i - 1] !== "" && arr[i + 1] !== ""));
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function smsUrlFromParts(phoneDigitsList, body) {
    const unique = [];
    (phoneDigitsList || []).forEach((d) => {
      const n = digits(d);
      if (n && unique.indexOf(n) === -1) unique.push(n);
    });
    if (!unique.length) return "";
    const addresses = unique.join(",");
    const encoded = encodeURIComponent(body);
    if (isIOS()) {
      return "sms:/open?addresses=" + addresses + "&body=" + encoded;
    }
    return "sms:" + addresses + "?body=" + encoded;
  }

  function smsUrl(req, mode) {
    const rows = targetsForPages(pagesForSend(req, mode || "immediate"), true).filter((r) => r.method !== "email");
    const phones = uniquePhones(rows).map((u) => u.phoneDigits);
    return smsUrlFromParts(phones, buildPageMessage(req, mode || "immediate"));
  }

  function smstoPayload(req, mode) {
    const rows = targetsForPages(pagesForSend(req, mode || "immediate"), true).filter((r) => r.method !== "email");
    const phones = uniquePhones(rows);
    if (!phones.length) return "";
    /* SMSTO is the usual QR payload; cameras on iOS and Android open a text. One number after dedupe is typical. */
    return "SMSTO:" + phones[0].phoneDigits + ":" + buildPageMessage(req, mode || "immediate");
  }

  function callTargets(req, mode) {
    const rows = targetsForPages(pagesForSend(req, mode || "immediate"), true);
    return uniquePhones(rows);
  }

  function markTextsOpened(requestId, mode) {
    getState();
    const req = getRequest(requestId);
    if (!req) throw new Error("Request not found.");
    const at = Date.now();
    let count = 0;
    function shouldMark(p) {
      if (p.state === "cancelled") return false;
      if (mode === "escalation") return p.kind === "escalation";
      return p.kind === "immediate";
    }
    req.pages.forEach((p) => {
      if (!shouldMark(p)) return;
      p.state = "opened";
      p.openedAt = at;
      count += 1;
    });
    (state.pages || []).forEach((p) => {
      if (p.requestId !== requestId || !shouldMark(p)) return;
      p.state = "opened";
      p.openedAt = at;
    });
    persist();
    return count;
  }


  load();

  global.RV = {
    KEY, PIN, BUILDING, CATEGORIES, URGENCY, METHODS, STATUSES, EXAMPLE_UNITS, TZ,
    load, getState, resetDemo, subscribe,
    setUnit, getUnit, submitRequest, getRequest, requestsForUnit, allRequests, setStatus,
    recipients, upsertRecipient, deleteRecipient, recipientById,
    ruleByCategory, setRule, pages, runEscalation,
    categoryById, statusById, methodName,
    formatTime, formatTimeFull, relativeTime, escapeHtml,
    confirmPin, isAdminAuthed, logoutAdmin, resizeImage,
    immediatePages, queuedPages, uniquePeople, targetFor,
    digits, formatPhone, telUrl, isIOS, isAndroid, isMobile, isDesktop,
    pageStateLabel, targetsForPages, uniquePhones, pagesForSend,
    buildPageMessage, smsUrl, smsUrlFromParts, smstoPayload, callTargets,
    markTextsOpened, notifyLine
  };
})(window);
