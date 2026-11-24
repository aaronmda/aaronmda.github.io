/* Rica Vista Tenant Help: WordPress demo build. One file of app logic.
   Data: localStorage when available. Inside the WordPress embed the browser
   sandbox blocks storage, so data lives in memory until the page reloads. */
(function () {
  "use strict";
  var KEY = "ricavista-wp-demo-v1", PIN = "1825", TZ = "America/Los_Angeles";
  var AARON = "(707) 867-6741";
  var BUILDING = "Rica Vista Apartments, 1825 Poggi Street, Alameda, CA";

  var CATS = [
    { id: "emergency", name: "Emergency", blurb: "Fire, flood, or gas", urg: "emergency" },
    { id: "water", name: "Water leak", blurb: "Drips, bursts, backups", urg: "urgent" },
    { id: "lockout", name: "Lockout", blurb: "Locked out of unit or building", urg: "urgent" },
    { id: "access", name: "Elevator, door, or gate", blurb: "Entry or elevator trouble", urg: "urgent" },
    { id: "noise", name: "Noise or neighbor", blurb: "Noise or neighbor concern", urg: "normal" },
    { id: "pest", name: "Pest", blurb: "Insects, rodents, wildlife", urg: "normal" },
    { id: "maintenance", name: "General maintenance", blurb: "Repairs and unit issues", urg: "normal" },
    { id: "package", name: "Package or office", blurb: "Packages, keys, questions", urg: "normal" }
  ];
  var URG = [{ id: "normal", name: "Normal" }, { id: "urgent", name: "Urgent" }, { id: "emergency", name: "Emergency" }];
  var STAT = [{ id: "new", name: "New", t: "Submitted" }, { id: "acknowledged", name: "Acknowledged", t: "Acknowledged" }, { id: "in_progress", name: "In progress", t: "In progress" }, { id: "done", name: "Done", t: "Resolved" }];

  function defaults() {
    return {
      v: 1,
      people: [
        { id: "p1", name: "Jordan Hale", role: "On-site Manager", phone: AARON },
        { id: "p2", name: "Sam Reyes", role: "Office", phone: AARON },
        { id: "p3", name: "Casey Nguyen", role: "After-hours Emergency", phone: AARON },
        { id: "p4", name: "Morgan Ellis", role: "Maintenance On-Call", phone: AARON },
        { id: "p5", name: "Riley Chen", role: "Maintenance Tech", phone: AARON },
        { id: "p6", name: "Alex Rivera", role: "After-hours Maintenance", phone: AARON }
      ],
      rules: {
        emergency: [{ p: "p1", d: 0 }, { p: "p4", d: 0 }, { p: "p3", d: 5 }],
        water: [{ p: "p4", d: 0 }, { p: "p1", d: 0 }, { p: "p5", d: 15 }],
        lockout: [{ p: "p1", d: 0 }, { p: "p3", d: 10 }],
        access: [{ p: "p4", d: 0 }, { p: "p1", d: 0 }, { p: "p6", d: 15 }],
        noise: [{ p: "p1", d: 0 }, { p: "p2", d: 20 }],
        pest: [{ p: "p4", d: 0 }, { p: "p1", d: 30 }],
        maintenance: [{ p: "p4", d: 0 }, { p: "p5", d: 30 }],
        package: [{ p: "p2", d: 0 }, { p: "p1", d: 60 }]
      },
      urgencyAdds: { normal: [], urgent: [], emergency: [{ p: "p3", d: 0 }] },
      afterHours: { on: true, start: 18, end: 8, weekends: true, adds: [{ p: "p6", d: 0 }] },
      tenantReceipts: true,
      requests: seedRequests(),
      log: [],
      next: 1047
    };
  }
  function seedRequests() {
    var now = Date.now(), H = 3600e3;
    return [
      { id: "RV-1046", unit: "405", cat: "access", urg: "urgent", desc: "EXAMPLE: Courtyard gate is stuck open and will not latch.", name: "", phone: "", at: now - 0.7 * H, status: "new", example: true, timeline: [{ at: now - 0.7 * H, s: "new", note: "Submitted by tenant" }], escal: [] },
      { id: "RV-1045", unit: "321", cat: "noise", urg: "normal", desc: "EXAMPLE: Loud music from a nearby unit since about 10:30 PM.", name: "", phone: "", at: now - 5 * H, status: "in_progress", example: true, timeline: [{ at: now - 5 * H, s: "new", note: "Submitted by tenant" }, { at: now - 4.8 * H, s: "acknowledged", note: "Jordan Hale acknowledged" }, { at: now - 4.6 * H, s: "in_progress", note: "Following up with the neighbor" }], escal: [] },
      { id: "RV-1042", unit: "214", cat: "water", urg: "urgent", desc: "EXAMPLE: Slow leak under the kitchen sink after the dishwasher runs.", name: "", phone: "", at: now - 26 * H, status: "done", example: true, timeline: [{ at: now - 26 * H, s: "new", note: "Submitted by tenant" }, { at: now - 25.7 * H, s: "acknowledged", note: "Morgan Ellis acknowledged" }, { at: now - 22 * H, s: "done", note: "Replaced supply-line washer" }], escal: [] }
    ];
  }

  /* ---------- storage ---------- */
  var storageOK = (function () { try { localStorage.setItem("__rv", "1"); localStorage.removeItem("__rv"); return true; } catch (e) { return false; } })();
  var S;
  function load() {
    if (storageOK) { try { var raw = localStorage.getItem(KEY); if (raw) { var p = JSON.parse(raw); if (p && p.v === 1) { S = p; return; } } } catch (e) {} }
    S = defaults();
  }
  function save() { if (storageOK) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} } }
  window.addEventListener("storage", function (e) { if (e.key === KEY) { load(); render(); } });

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function cat(id) { return CATS.filter(function (c) { return c.id === id; })[0] || { name: id }; }
  function urgName(id) { return (URG.filter(function (u) { return u.id === id; })[0] || { name: id }).name; }
  function stat(id) { return STAT.filter(function (s) { return s.id === id; })[0] || STAT[0]; }
  function person(id) { return S.people.filter(function (p) { return p.id === id; })[0]; }
  function fmtPhone(p) { var d = String(p || "").replace(/\D/g, ""); if (d.length === 11 && d[0] === "1") d = d.slice(1); return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : (p || "no number"); }
  function fmtTime(t) { return new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(t)) + " PT"; }
  function fmtClock(t) { return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date(t)); }
  function isAfterHours(t) {
    var a = S.afterHours; if (!a.on) return false;
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false, weekday: "short" }).formatToParts(new Date(t));
    var h = +parts.filter(function (x) { return x.type === "hour"; })[0].value % 24, wd = parts.filter(function (x) { return x.type === "weekday"; })[0].value;
    if (a.weekends && (wd === "Sat" || wd === "Sun")) return true;
    return a.start > a.end ? (h >= a.start || h < a.end) : (h >= a.start && h < a.end);
  }

  /* ---------- routing: who gets paged ---------- */
  function route(catId, urg, at) {
    var steps = [], why = {};
    function add(list, reason) { (list || []).forEach(function (s) { var ex = steps.filter(function (x) { return x.p === s.p; })[0]; if (ex) { if (s.d < ex.d) ex.d = s.d; return; } steps.push({ p: s.p, d: +s.d || 0, why: reason }); }); }
    add(S.rules[catId], cat(catId).name + " rule");
    add(S.urgencyAdds[urg], urgName(urg) + " urgency");
    if (isAfterHours(at)) add(S.afterHours.adds, "After hours");
    return steps.filter(function (s) { return person(s.p); });
  }
  function messageFor(r, kind) {
    var lines = [
      kind === "escalation" ? "FOLLOW-UP: still not acknowledged" : (r.urg === "emergency" ? "EMERGENCY - Rica Vista Tenant Help" : "Rica Vista Tenant Help"),
      "Request " + r.id + " - Unit " + r.unit,
      cat(r.cat).name + " (" + urgName(r.urg) + ")",
      r.desc.length > 300 ? r.desc.slice(0, 297) + "..." : r.desc,
      r.phone ? "Tenant callback: " + fmtPhone(r.phone) : "",
      "Reply ACK " + r.id.replace("RV-", "") + " to acknowledge."
    ];
    return lines.filter(Boolean).join("\n");
  }
  function receiptFor(r, text) { return "Rica Vista Tenant Help: " + text + " (Request " + r.id + ", Unit " + r.unit + "). Reply STOP to opt out."; }

  /* every outbound text goes through RVText.sendPage (texting.js) */
  function dispatch(r, people, kind, body) {
    var rec = people.map(function (p) { return { name: p.name, role: p.role, phone: p.phone }; });
    var batch = { id: "b" + Date.now() + Math.random().toString(36).slice(2, 5), req: r.id, kind: kind, body: body, at: Date.now(), rows: [] };
    rec.forEach(function (p) {
      var to = RVText.toE164(p.phone);
      var first = batch.rows.filter(function (x) { return x.to === to; })[0];
      batch.rows.push({ name: p.name, role: p.role, to: to, status: first ? "merged" : "queued", mergedWith: first ? first.name : "", sid: "", hist: [] });
    });
    S.log.unshift(batch);
    RVText.sendPage(rec, body, { requestId: r.id, kind: kind }, function (u) {
      batch.rows.forEach(function (row) {
        if (row.to === u.to && row.status !== "merged") { row.status = u.status; row.sid = u.sid; row.error = u.error || ""; row.hist.push({ s: u.status, at: u.at }); }
      });
      save(); paintLive();
    });
    save();
    return batch;
  }

  function submitRequest(f) {
    var at = Date.now();
    var r = { id: "RV-" + (S.next++), unit: f.unit, cat: f.cat, urg: f.urg, desc: f.desc, name: f.name, phone: f.phone, at: at, status: "new", timeline: [{ at: at, s: "new", note: "Submitted by tenant" }], escal: [] };
    var steps = route(r.cat, r.urg, at);
    var now = steps.filter(function (s) { return !s.d; }).map(function (s) { return person(s.p); });
    var later = steps.filter(function (s) { return s.d; });
    r.routed = steps.map(function (s) { var p = person(s.p); return { name: p.name, role: p.role, phone: p.phone, d: s.d, why: s.why }; });
    S.requests.unshift(r);
    r.batch = dispatch(r, now, "page", messageFor(r, "page")).id;
    r.escal = later.map(function (s) { return { p: s.p, d: s.d, due: at + s.d * 60e3, state: "scheduled" }; });
    if (S.tenantReceipts && f.phone) dispatch(r, [{ name: f.name || "Tenant", role: "Tenant, Unit " + f.unit, phone: f.phone }], "receipt", receiptFor(r, "we got your " + cat(r.cat).name.toLowerCase() + " request and paged " + now.length + " staff"));
    save();
    return r;
  }
  function fireEscalations(r, force) {
    var due = r.escal.filter(function (e) { return e.state === "scheduled" && (force || e.due <= Date.now()); });
    if (!due.length) return 0;
    due.forEach(function (e) { e.state = "sent"; });
    dispatch(r, due.map(function (e) { return person(e.p); }).filter(Boolean), "escalation", messageFor(r, "escalation"));
    r.timeline.push({ at: Date.now(), s: r.status, note: "Escalated to " + due.map(function (e) { var p = person(e.p); return p ? p.name : "?"; }).join(", ") });
    save(); return due.length;
  }
  function setStatus(r, s) {
    if (r.status === s) return;
    r.status = s;
    var note = { acknowledged: "Acknowledged by staff", in_progress: "Work in progress", done: "Marked resolved", "new": "Reopened" }[s];
    r.timeline.push({ at: Date.now(), s: s, note: note });
    if (s !== "new") r.escal.forEach(function (e) { if (e.state === "scheduled") e.state = "cancelled"; });
    if (S.tenantReceipts && r.phone) dispatch(r, [{ name: r.name || "Tenant", role: "Tenant, Unit " + r.unit, phone: r.phone }], "update", receiptFor(r, "status is now " + stat(s).t.toLowerCase()));
    save();
  }
  setInterval(function () { var n = 0; (S.requests || []).forEach(function (r) { n += fireEscalations(r, false); }); if (n) render(); }, 15000);

  /* ---------- UI state ---------- */
  var params = new URLSearchParams(location.search);
  var embedded = window.self !== window.top;
  var start = params.get("view") || "tenant";
  var ui = { tab: start === "manager" ? "manager" : (start === "requests" ? "requests" : "tenant"), mtab: "inbox", authed: false, form: { cat: "", urg: "", unit: "", name: "", phone: "", desc: "" }, last: null, err: "", lockTabs: params.get("lock") === "1", phoneIdx: 0 };
  var myUnits = [];

  var LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#24756b"/><path d="M14 46V26l18-12 18 12v20" fill="none" stroke="#f3eee4" stroke-width="4" stroke-linejoin="round"/><rect x="26" y="32" width="12" height="14" rx="2" fill="#f3eee4"/><circle cx="46" cy="18" r="7" fill="#b94a32"/></svg>';

  function shell() {
    var tabs = [["tenant", "Request help"], ["requests", "My requests"], ["manager", "Manager"]];
    var tabHtml = tabs.map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (ui.tab === t[0] ? "on" : "") + '">' + t[1] + "</button>"; }).join("");
    var bar = storageOK
      ? "Demo mode: texts are simulated and nothing is really sent. Data is saved in this browser only."
      : 'Demo mode: texts are simulated and nothing is really sent. In this embedded view, data resets when the page reloads. <button class="linkish" data-act="full" style="background:none;border:0;padding:0;cursor:pointer;text-decoration:underline">Open full screen</button> to keep it.';
    return '<div id="shell"><header class="top"><div class="brand">' + LOGO + '<div><b>Rica Vista Tenant Help</b><small>1825 Poggi Street, Alameda, CA</small></div></div><nav class="tabs" aria-label="Sections">' + tabHtml + '</nav></header><div class="demo-bar">' + bar + '</div><main id="main"></main><footer>Unofficial proof of concept for Rica Vista Apartments. Every staff number defaults to ' + AARON + '. Texting adapter: <b>' + esc(RVText.TEXTING.mode) + "</b>.</footer></div>";
  }

  function render() {
    var m = document.getElementById("main");
    if (!m) { document.body.innerHTML = shell(); m = document.getElementById("main"); }
    document.querySelectorAll(".tabs button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === ui.tab); });
    if (ui.tab === "tenant") m.innerHTML = ui.last ? viewResult(ui.last) : viewForm();
    else if (ui.tab === "requests") m.innerHTML = viewMine();
    else m.innerHTML = ui.authed ? viewManager() : viewPin();
    postHeight();
  }

  /* ---------- tenant: form ---------- */
  function viewForm() {
    var f = ui.form, c = f.cat ? cat(f.cat) : null;
    var cats = CATS.map(function (k) { return '<button type="button" class="cat ' + (k.id === "emergency" ? "emg " : "") + (f.cat === k.id ? "on" : "") + '" data-cat="' + k.id + '"><b>' + k.name + "</b><span>" + k.blurb + "</span></button>"; }).join("");
    var urg = URG.map(function (u) { return '<button type="button" data-urg="' + u.id + '" class="' + (f.urg === u.id ? "on" : "") + (u.id === "emergency" ? " emg" : "") + '">' + u.name + "</button>"; }).join("");
    var preview = "";
    if (f.cat && f.urg) {
      var steps = route(f.cat, f.urg, Date.now());
      preview = '<div class="alert teal small"><b>Who gets paged:</b><div class="who">' + steps.map(function (s) { var p = person(s.p); return "<div><span>" + esc(p.name) + ' <span class="muted">' + esc(p.role) + "</span></span><span>" + (s.d ? '<span class="pill p-scheduled">after ' + s.d + " min if not acknowledged</span>" : '<span class="pill p-sent">right away</span>') + "</span></div>"; }).join("") + "</div></div>";
    }
    return '<div class="narrow"><div class="card"><h1>Request help</h1><p class="muted small" style="margin-top:-.3rem">Tell building staff what is wrong. The right people get a text right away.</p>' +
      (f.cat === "emergency" ? '<div class="alert red"><b>Fire, smoke, gas smell, or someone hurt? Call 911 first.</b> Then send this so staff know.</div>' : "") +
      '<label>What do you need help with?</label><div class="grid-cats">' + cats + "</div>" +
      '<label>How urgent is it?</label><div class="seg">' + urg + "</div>" +
      '<div class="row"><div><label for="f-unit">Unit</label><input id="f-unit" type="text" inputmode="numeric" maxlength="6" placeholder="e.g. 214" value="' + esc(f.unit) + '" data-f="unit"></div>' +
      '<div><label for="f-name">Your name <span class="muted">(optional)</span></label><input id="f-name" type="text" maxlength="60" value="' + esc(f.name) + '" data-f="name"></div></div>' +
      '<label for="f-phone">Text me updates at <span class="muted">(optional)</span></label><input id="f-phone" type="tel" placeholder="(510) 555-0123" value="' + esc(f.phone) + '" data-f="phone">' +
      '<label for="f-desc">Describe the problem</label><textarea id="f-desc" maxlength="600" placeholder="What happened, where, and since when?" data-f="desc">' + esc(f.desc) + "</textarea>" +
      preview + (ui.err ? '<div class="alert red">' + esc(ui.err) + "</div>" : "") +
      '<button type="button" class="btn block' + (f.urg === "emergency" ? " warn" : "") + '" data-act="submit" style="margin-top:.8rem">Send request</button>' +
      '<p class="muted small" style="margin:.6rem 0 0">Demo: submitting shows exactly which numbers would be texted and what they would say. No real text is sent.</p></div></div>';
  }

  /* ---------- tenant: result + simulated SMS ---------- */
  function batchById(id) { return S.log.filter(function (b) { return b.id === id; })[0]; }
  function viewResult(r) {
    var b = batchById(r.batch);
    var receipts = S.log.filter(function (x) { return x.req === r.id && x.kind === "receipt"; });
    return '<div class="card"><span class="pill p-new">' + esc(r.id) + '</span> <h1 style="display:inline;margin-left:.3rem">Request sent</h1><p class="muted" style="margin:.4rem 0 0">' + esc(cat(r.cat).name) + " · " + esc(urgName(r.urg)) + " · Unit " + esc(r.unit) + " · " + fmtTime(r.at) + "</p></div>" +
      '<div class="card"><h2>Simulated text messages</h2><p class="muted small">This is what the texting system would send. Status updates come from the simulator here, and from the carrier once real texting is plugged in.</p>' +
      '<div class="sim"><div id="phone-wrap">' + phoneHtml(b) + "</div><div>" + batchTable(b) +
      (r.escal.length ? '<h3 style="margin-top:1rem">Follow-up pages (escalation)</h3>' + escalHtml(r) : "") +
      receipts.map(function (x) { return '<h3 style="margin-top:1rem">Confirmation text to tenant</h3>' + batchTable(x); }).join("") +
      '<details style="margin-top:1rem"><summary class="small"><b>Adapter call</b> (what the app hands to the texting layer)</summary><pre class="code">sendPage(\n  ' + esc(JSON.stringify(b.rows.filter(function (x) { return x.status !== "merged"; }).map(function (x) { return x.to; }))) + ',\n  ' + esc(JSON.stringify(b.body)) + '\n)\n// mode: "' + esc(RVText.TEXTING.mode) + '"  → no network request in simulated mode</pre></details>' +
      "</div></div></div>" +
      '<div class="row"><button type="button" class="btn soft" data-act="new">Send another request</button><button type="button" class="btn ghost" data-tab="requests">Track my requests</button><button type="button" class="btn ghost" data-tab="manager">See it in the manager console</button></div>';
  }
  function phoneHtml(b) {
    if (!b) return "";
    var rows = b.rows.filter(function (x) { return x.status !== "merged"; });
    var i = Math.min(ui.phoneIdx, rows.length - 1), row = rows[i] || b.rows[0];
    var names = b.rows.filter(function (x) { return x.to === row.to; }).map(function (x) { return x.name; }).join(", ");
    return '<div class="phone" aria-label="Simulated phone"><div class="screen"><div class="sbar"><span>' + fmtClock(b.at).replace(/:\d\d (?=[AP]M)/, " ") + '</span><span>5G ▮▮▮</span></div><div class="thead"><div class="av">RV</div><b>Rica Vista Help</b><div class="muted">to ' + esc(fmtPhone(row.to)) + "<br>" + esc(names) + '</div></div><div class="thread"><div class="bubble">' + esc(b.body) + '</div><div class="bmeta" data-live="phone">' + statusPill(row.status) + " " + RVText.segments(b.body) + " SMS segment(s)</div></div></div></div>" +
      (rows.length > 1 ? '<div class="phone-pick">' + rows.map(function (x, j) { return '<button type="button" class="btn sm ' + (j === i ? "" : "ghost") + '" data-phone="' + j + '">' + esc(fmtPhone(x.to)) + "</button>"; }).join("") + "</div>" : "");
  }
  function statusPill(s) { return '<span class="pill p-' + esc(s) + '">' + esc(s) + "</span>"; }
  function batchTable(b) {
    if (!b) return "";
    return '<div class="tbl-wrap"><table data-batch="' + b.id + '"><thead><tr><th>To</th><th>Number</th><th>Status</th><th>Message ID</th></tr></thead><tbody>' +
      b.rows.map(function (x) { return "<tr><td><b>" + esc(x.name) + '</b><br><span class="muted small">' + esc(x.role) + '</span></td><td class="mono">' + esc(fmtPhone(x.to)) + "</td><td>" + statusPill(x.status) + (x.status === "merged" ? '<br><span class="muted small">same number as ' + esc(x.mergedWith) + ", one text</span>" : "") + (x.error ? '<br><span class="small" style="color:var(--terra)">' + esc(x.error) + "</span>" : "") + '</td><td class="mono small">' + esc(x.sid ? x.sid.slice(0, 12) + "…" : "") + "</td></tr>"; }).join("") +
      "</tbody></table></div>";
  }
  function escalHtml(r) {
    return '<div class="who">' + r.escal.map(function (e) { var p = person(e.p) || { name: "?", role: "" }; return "<div><span>" + esc(p.name) + ' <span class="muted">' + esc(p.role) + " · " + esc(fmtPhone(p.phone)) + "</span></span><span>" + (e.state === "scheduled" ? '<span class="pill p-scheduled">' + e.d + " min if not acknowledged</span>" : statusPill(e.state)) + "</span></div>"; }).join("") + "</div>" +
      (r.escal.some(function (e) { return e.state === "scheduled"; }) ? '<button type="button" class="btn sm ghost" data-act="ff" data-id="' + r.id + '">Demo: skip ahead and send follow-ups now</button>' : "");
  }
  function paintLive() {
    if (ui.tab === "tenant" && ui.last) {
      var pw = document.getElementById("phone-wrap"); if (pw) pw.innerHTML = phoneHtml(batchById(ui.last.batch));
      document.querySelectorAll("table[data-batch]").forEach(function (t) { var b = batchById(t.getAttribute("data-batch")); if (b && t.parentNode) t.parentNode.outerHTML = batchTable(b); });
    } else if (ui.tab === "manager" && ui.authed && ui.mtab === "log") { render(); }
  }

  /* ---------- tenant: my requests ---------- */
  function viewMine() {
    var list = S.requests.filter(function (r) { return myUnits.indexOf(r.unit) !== -1 && !r.example; });
    var note = '<p class="muted small">Requests you send from this screen show up here. On a real system, tenants would sign in or follow a link texted to them.</p>';
    if (!list.length) return '<div class="narrow"><div class="card"><h1>My requests</h1>' + note + '<p>No requests yet.</p><button class="btn" data-tab="tenant" type="button">Request help</button></div></div>';
    return '<div class="narrow"><div class="card"><h1>My requests</h1>' + note + list.map(reqCard).join("") + "</div></div>";
  }
  function reqCard(r, staff) {
    return '<div class="req"><div class="req-h"><div><b>' + esc(cat(r.cat).name) + '</b> <span class="muted small">' + esc(r.id) + " · Unit " + esc(r.unit) + " · " + esc(urgName(r.urg)) + '</span></div><span class="pill p-' + r.status + '">' + esc(staff ? stat(r.status).name : stat(r.status).t) + "</span></div>" +
      '<p style="margin:.4rem 0" class="small">' + esc(r.desc) + "</p>" +
      '<div class="muted small">' + r.timeline.map(function (t) { return fmtTime(t.at) + ": " + esc(t.note); }).join("<br>") + "</div>" + (staff ? staffControls(r) : "") + "</div>";
  }

  /* ---------- manager ---------- */
  function viewPin() {
    return '<div class="card pin"><h1>Manager console</h1><p class="muted small">Staff only. Demo PIN is <b>1825</b>.</p><input id="pin" type="password" inputmode="numeric" maxlength="4" aria-label="PIN" autocomplete="off">' + (ui.err ? '<div class="alert red">' + esc(ui.err) + "</div>" : "") + '<button type="button" class="btn block" data-act="pin" style="margin-top:.7rem">Unlock</button></div>';
  }
  function viewManager() {
    var t = [["inbox", "Inbox"], ["routing", "Routing rules"], ["people", "People & numbers"], ["log", "Text log"], ["plug", "Plug in real texting"]];
    var sub = '<div class="subtabs">' + t.map(function (x) { return '<button type="button" data-mtab="' + x[0] + '" class="' + (ui.mtab === x[0] ? "on" : "") + '">' + x[1] + "</button>"; }).join("") + '<button type="button" data-act="lock" class="btn sm ghost" style="margin-left:auto">Lock</button></div>';
    var body = { inbox: mInbox, routing: mRouting, people: mPeople, log: mLog, plug: mPlug }[ui.mtab]();
    return sub + body;
  }
  function mInbox() {
    var open = S.requests.filter(function (r) { return r.status !== "done"; });
    var k = [["Open", open.length], ["New", S.requests.filter(function (r) { return r.status === "new"; }).length], ["Texts sent", S.log.reduce(function (n, b) { return n + b.rows.filter(function (x) { return x.status !== "merged"; }).length; }, 0)], ["Paging contacts", S.people.length]];
    return '<div class="kpis">' + k.map(function (x) { return '<div class="kpi"><b>' + x[1] + '</b><span class="muted small">' + x[0] + "</span></div>"; }).join("") + "</div>" +
      '<div class="card"><h2>Request inbox</h2>' + S.requests.map(function (r) { return reqCard(r, true); }).join("") + "</div>";
  }
  function staffControls(r) {
    var b = S.log.filter(function (x) { return x.req === r.id && x.kind !== "receipt" && x.kind !== "update"; });
    var paged = b.length ? '<div class="small" style="margin-top:.4rem"><b>Paged:</b> ' + b.map(function (x) { return x.rows.map(function (y) { return esc(y.name) + " " + statusPill(y.status); }).join(", "); }).join("; ") + "</div>" : (r.example ? '<div class="small muted" style="margin-top:.4rem">Example request (seeded, not paged in this session)</div>' : "");
    var sched = r.escal && r.escal.some(function (e) { return e.state === "scheduled"; }) ? '<div class="small" style="margin-top:.3rem"><b>Follow-ups waiting:</b> ' + r.escal.filter(function (e) { return e.state === "scheduled"; }).map(function (e) { var p = person(e.p); return esc(p ? p.name : "?") + " in " + Math.max(0, Math.ceil((e.due - Date.now()) / 60e3)) + " min"; }).join(", ") + ' <button type="button" class="btn sm ghost" data-act="ff" data-id="' + r.id + '">Send now</button></div>' : "";
    var btns = STAT.map(function (s) { return '<button type="button" class="btn sm ' + (r.status === s.id ? "" : "ghost") + '" data-status="' + s.id + '" data-id="' + r.id + '">' + s.name + "</button>"; }).join(" ");
    return paged + sched + '<div class="row" style="margin-top:.5rem;gap:.3rem">' + btns + "</div>";
  }
  function personOptions(sel) { return S.people.map(function (p) { return '<option value="' + p.id + '"' + (p.id === sel ? " selected" : "") + ">" + esc(p.name) + " (" + esc(p.role) + ")</option>"; }).join(""); }
  function delayOptions(d) { return [[0, "right away"], [5, "after 5 min"], [10, "after 10 min"], [15, "after 15 min"], [20, "after 20 min"], [30, "after 30 min"], [60, "after 60 min"]].map(function (o) { return '<option value="' + o[0] + '"' + (+d === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join(""); }
  function stepsEditor(list, path) {
    return list.map(function (s, i) { return '<div class="step"><select data-step="' + path + '" data-i="' + i + '" data-k="p">' + personOptions(s.p) + '</select><select class="dly" data-step="' + path + '" data-i="' + i + '" data-k="d">' + delayOptions(s.d) + '</select><button type="button" class="x" title="Remove" data-rm="' + path + '" data-i="' + i + '">✕</button></div>'; }).join("") +
      '<button type="button" class="btn sm ghost" data-addstep="' + path + '">+ Add person</button>';
  }
  function mRouting() {
    return '<div class="card"><h2>Routing rules</h2><p class="muted small">Pick who gets texted for each kind of request. "Right away" pages immediately; a delay pages that person only if nobody has acknowledged yet. Changes apply to the next request. <span class="saved" id="saved"></span></p>' +
      CATS.map(function (c) { return '<div class="rule"><b>' + c.name + '</b> <span class="muted small">default urgency: ' + urgName(c.urg) + "</span>" + stepsEditor(S.rules[c.id] || [], "rules." + c.id) + "</div>"; }).join("") + "</div>" +
      '<div class="card"><h2>Extra pages by urgency</h2><p class="muted small">Added on top of the category rule.</p>' + URG.map(function (u) { return '<div class="rule"><b>If urgency is ' + u.name + "</b>" + stepsEditor(S.urgencyAdds[u.id] || [], "urgencyAdds." + u.id) + "</div>"; }).join("") + "</div>" +
      '<div class="card"><h2>After hours</h2><label style="font-weight:400"><input type="checkbox" data-ah="on"' + (S.afterHours.on ? " checked" : "") + "> Also page these people between " + hourSel("start", S.afterHours.start) + " and " + hourSel("end", S.afterHours.end) + ' <input type="checkbox" data-ah="weekends"' + (S.afterHours.weekends ? " checked" : "") + "> and all weekend</label>" + stepsEditor(S.afterHours.adds, "afterHours.adds") +
      '<p class="small muted">Right now it is ' + (isAfterHours(Date.now()) ? "<b>after hours</b>" : "<b>business hours</b>") + " in Alameda.</p></div>" +
      '<div class="card"><label style="font-weight:400"><input type="checkbox" data-opt="tenantReceipts"' + (S.tenantReceipts ? " checked" : "") + "> Text tenants a confirmation and status updates when they leave a number</label></div>";
  }
  function hourSel(k, v) { var o = ""; for (var h = 0; h < 24; h++) o += '<option value="' + h + '"' + (h === v ? " selected" : "") + ">" + ((h % 12) || 12) + (h < 12 ? " AM" : " PM") + "</option>"; return '<select data-ahh="' + k + '" style="width:auto;display:inline-block;padding:.2rem">' + o + "</select>"; }
  function mPeople() {
    return '<div class="card"><h2>People & paging numbers</h2><p class="muted small">Change a number here and every rule that uses this person follows it. <span class="saved" id="saved"></span></p>' +
      '<div class="adapter" style="margin-bottom:.8rem"><b>Quick change:</b> set every paging number to <input id="allnum" type="tel" value="' + esc(AARON) + '" style="width:170px;display:inline-block;padding:.3rem .5rem"> <button type="button" class="btn sm" data-act="allnum">Apply to all</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Mobile number</th><th></th></tr></thead><tbody>' +
      S.people.map(function (p, i) { return '<tr><td><input type="text" data-pp="name" data-i="' + i + '" value="' + esc(p.name) + '"></td><td><input type="text" data-pp="role" data-i="' + i + '" value="' + esc(p.role) + '"></td><td><input type="tel" data-pp="phone" data-i="' + i + '" value="' + esc(p.phone) + '"></td><td><button type="button" class="x" data-delp="' + i + '" title="Remove">✕</button></td></tr>'; }).join("") +
      '</tbody></table></div><button type="button" class="btn sm soft" data-act="addp" style="margin-top:.6rem">+ Add person</button></div>' +
      '<div class="card"><button type="button" class="btn sm ghost" data-act="reset">Reset demo data</button> <span class="muted small">Restores the sample people, rules, and requests.</span></div>';
  }
  function mLog() {
    if (!S.log.length) return '<div class="card"><h2>Text log</h2><p class="muted">No texts yet in this session. Send a request from the tenant side to see it here.</p></div>';
    return '<div class="card"><h2>Text log</h2><p class="muted small">Every message that went through <code>sendPage()</code>. Mode: <b>' + esc(RVText.TEXTING.mode) + "</b>. Est. cost at Twilio rates: $" + (S.log.reduce(function (n, b) { return n + b.rows.filter(function (x) { return x.status !== "merged"; }).length * RVText.segments(b.body); }, 0) * 0.0083).toFixed(4) + "</p>" +
      S.log.map(function (b) { return '<div class="req"><div class="req-h"><b>' + esc(b.req) + " · " + esc({ page: "Page", escalation: "Follow-up page", receipt: "Tenant confirmation", update: "Tenant status update" }[b.kind]) + '</b><span class="muted small">' + fmtTime(b.at) + '</span></div><pre class="code" style="white-space:pre-wrap">' + esc(b.body) + "</pre>" + batchTable(b) + "</div>"; }).join("") + "</div>";
  }
  function mPlug() {
    return '<div class="card"><h2>How to plug in real texting</h2>' +
      '<div class="adapter"><b>Current mode: ' + esc(RVText.TEXTING.mode) + '.</b> Every text in this app goes through one function, <code>sendPage(recipients, message)</code>, in <code>texting.js</code>. Today it runs a simulator. Real texting is a swap at that single point.</div>' +
      "<ol><li><b>Get a texting number.</b> Create a Twilio account, buy a local 510 or 707 number (about $1.15 a month), and register it for business texting (A2P 10DLC, about $20 once plus $1.50 a month). Texts cost about $0.0083 each.</li>" +
      "<li><b>Add a tiny server endpoint.</b> The Twilio keys must stay on a server, never in the web page. A free Cloudflare Worker or similar is enough:</li></ol>" +
      '<pre class="code">' + esc('// POST /send  { to: ["+17078676741"], body: "..." }\nexport default {\n  async fetch(req, env) {\n    const { to, body } = await req.json();\n    const auth = "Basic " + btoa(env.TWILIO_SID + ":" + env.TWILIO_TOKEN);\n    const results = [];\n    for (const n of to) {\n      const r = await fetch(\n        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_SID}/Messages.json`,\n        { method: "POST",\n          headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },\n          body: new URLSearchParams({ To: n, From: env.TWILIO_FROM, Body: body }) });\n      const j = await r.json();\n      results.push({ to: n, sid: j.sid, status: j.status });\n    }\n    return Response.json({ results }, { headers: { "Access-Control-Allow-Origin": "*" } });\n  }\n};') + "</pre>" +
      '<ol start="3"><li><b>Flip the switch.</b> In <code>texting.js</code> set <code>TEXTING.mode = "live"</code> and <code>TEXTING.endpoint</code> to the Worker URL. Nothing else in the app changes.</li>' +
      "<li><b>Optional extras:</b> point Twilio's status callback at the server for real delivered/failed updates, and handle replies like <code>ACK 1047</code> to acknowledge from a text. To share requests across phones, store them on the same server (a small database such as Cloudflare D1 or Supabase free tier) instead of the browser.</li></ol>" +
      '<p class="small muted">Rough running cost for one building: $5 to $15 a month.</p></div>';
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button,[data-tab]"); if (!t) return;
    var d = t.dataset;
    if (d.tab) { ui.tab = d.tab; ui.err = ""; if (d.tab === "tenant" && t.closest(".tabs")) ui.last = ui.last; render(); scrollTop(); return; }
    if (d.cat) { ui.form.cat = d.cat; ui.form.urg = cat(d.cat).urg; render(); return; }
    if (d.urg) { ui.form.urg = d.urg; render(); return; }
    if (d.phone != null) { ui.phoneIdx = +d.phone; paintLive(); return; }
    if (d.mtab) { ui.mtab = d.mtab; render(); scrollTop(); return; }
    if (d.status) { var r = S.requests.filter(function (x) { return x.id === d.id; })[0]; if (r) { setStatus(r, d.status); render(); } return; }
    if (d.addstep) { stepsAt(d.addstep).push({ p: S.people[0].id, d: 0 }); save(); render(); return; }
    if (d.rm) { stepsAt(d.rm).splice(+d.i, 1); save(); render(); return; }
    if (d.delp != null) { var p = S.people[+d.delp]; if (S.people.length <= 1) return; S.people.splice(+d.delp, 1); purge(p.id); save(); render(); return; }
    switch (d.act) {
      case "submit": return doSubmit();
      case "new": ui.last = null; ui.form = { cat: "", urg: "", unit: ui.form.unit, name: ui.form.name, phone: ui.form.phone, desc: "" }; ui.phoneIdx = 0; render(); scrollTop(); return;
      case "ff": var rq = S.requests.filter(function (x) { return x.id === d.id; })[0]; if (rq) { fireEscalations(rq, true); render(); } return;
      case "pin": var v = (document.getElementById("pin") || {}).value; if (v === PIN) { ui.authed = true; ui.err = ""; } else ui.err = "That PIN is not right. Demo PIN: 1825."; render(); return;
      case "lock": ui.authed = false; render(); return;
      case "allnum": var n = document.getElementById("allnum").value; if (!RVText.toE164(n) || n.replace(/\D/g, "").length < 10) return flash("Enter a 10-digit number"); S.people.forEach(function (p) { p.phone = fmtPhone(n); }); save(); render(); flash("All numbers updated"); return;
      case "addp": S.people.push({ id: "p" + Date.now().toString(36), name: "New person", role: "Role", phone: AARON }); save(); render(); return;
      case "reset": var keepLog = []; S = defaults(); S.log = keepLog; save(); myUnits = []; ui.last = null; render(); flash("Demo data reset"); return;
      case "full": openFull(); return;
    }
  });
  document.addEventListener("input", function (e) {
    var t = e.target, d = t.dataset;
    if (d.f) { ui.form[d.f] = t.value; return; }
    if (d.pp) { S.people[+d.i][d.pp] = t.value; save(); flash("Saved"); return; }
  });
  document.addEventListener("change", function (e) {
    var t = e.target, d = t.dataset;
    if (d.step) { var s = stepsAt(d.step)[+d.i]; s[d.k] = d.k === "d" ? +t.value : t.value; save(); flash("Saved"); return; }
    if (d.ah) { S.afterHours[d.ah] = t.checked; save(); render(); return; }
    if (d.ahh) { S.afterHours[d.ahh] = +t.value; save(); render(); return; }
    if (d.opt) { S[d.opt] = t.checked; save(); flash("Saved"); return; }
    if (d.pp) render();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.id === "pin") { e.preventDefault(); document.querySelector('[data-act="pin"]').click(); } });

  function stepsAt(path) { var parts = path.split("."), o = S; for (var i = 0; i < parts.length; i++) { if (!o[parts[i]]) o[parts[i]] = []; o = o[parts[i]]; } return o; }
  function purge(pid) { Object.keys(S.rules).forEach(function (k) { S.rules[k] = S.rules[k].filter(function (s) { return s.p !== pid; }); }); Object.keys(S.urgencyAdds).forEach(function (k) { S.urgencyAdds[k] = S.urgencyAdds[k].filter(function (s) { return s.p !== pid; }); }); S.afterHours.adds = S.afterHours.adds.filter(function (s) { return s.p !== pid; }); }
  function flash(msg) { var el = document.getElementById("saved"); if (el) { el.textContent = "✓ " + msg; clearTimeout(flash.t); flash.t = setTimeout(function () { el.textContent = ""; }, 1500); } }
  function doSubmit() {
    var f = ui.form;
    ui.err = !f.cat ? "Pick what you need help with." : !/^\w{1,6}$/.test((f.unit || "").trim()) ? "Enter your unit number." : (f.desc || "").trim().length < 5 ? "Add a short description." : (f.phone && f.phone.replace(/\D/g, "").length < 10 ? "Check the phone number (10 digits) or leave it blank." : "");
    if (ui.err) { render(); return; }
    f.unit = f.unit.trim(); f.desc = f.desc.trim();
    if (myUnits.indexOf(f.unit) === -1) myUnits.push(f.unit);
    ui.last = submitRequest(f); ui.phoneIdx = 0;
    render(); scrollTop();
  }
  function scrollTop() { var s = document.getElementById("shell"); if (s && embedded) s.scrollTop = 0; else window.scrollTo(0, 0); }

  /* ---------- WordPress embed glue (wp-embed protocol) ---------- */
  var secret = (location.hash.match(/secret=([A-Za-z0-9]+)/) || [])[1];
  var FULL = "https://aaronmda.github.io/ricavista-wp/app/";
  function openFull() {
    var url = FULL + "?view=" + ui.tab;
    if (embedded && secret) window.parent.postMessage({ message: "link", value: url, secret: secret }, "*");
    else if (embedded) window.open(url, "_blank");
    else location.href = url;
  }
  function postHeight() {
    if (!embedded) return;
    var inner = document.getElementById("shell");
    var h = inner ? inner.scrollHeight : document.body.scrollHeight;
    var target = Math.max(560, Math.min(h, 1000));
    window.parent.postMessage({ message: "height", value: target, secret: secret || "" }, "*");
  }
  if (embedded) document.documentElement.classList.add("embedded");
  if (window.ResizeObserver) new ResizeObserver(postHeight).observe(document.documentElement);
  window.addEventListener("load", postHeight);
  setInterval(postHeight, 1500);

  window.RVDemo = { state: function () { return S; }, route: route };
  load(); render();
})();
