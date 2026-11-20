(function () {
  const app = document.getElementById("app");
  document.getElementById("banner").innerHTML = RVUI.demoBanner();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  function setUnitLabel() {
    const u = RV.getUnit();
    document.getElementById("app-unit-label").textContent = u ? "Unit " + u : "Tenant Help";
  }

  function tabs(view) {
    document.querySelectorAll(".tabbar [data-tab]").forEach((a) => {
      const on = a.getAttribute("data-tab") === view;
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function route() {
    const parts = (location.hash || "#/").replace(/^#/, "").split("/").filter(Boolean);
    const view = parts[0] || "home";
    setUnitLabel();
    if (view === "new") { tabs("new"); renderNew(); }
    else if (view === "requests") { tabs("requests"); renderList(); }
    else if (view === "request" && parts[1]) { tabs("requests"); renderDetail(decodeURIComponent(parts[1])); }
    else if (view === "confirm" && parts[1]) { tabs("requests"); renderConfirm(decodeURIComponent(parts[1])); }
    else if (view === "info") { tabs("info"); renderInfo(); }
    else { tabs("home"); renderHome(); }
  }

  function renderHome() {
    const unit = RV.getUnit();
    app.innerHTML =
      "<h1 style='font-size:1.7rem'>Need help?</h1>" +
      "<p class='muted'>Rica Vista Apartments · 1825 Poggi Street, Alameda, CA</p>" +
      (unit
        ? '<p>Signed in as <span class="unit-chip">Unit ' + RV.escapeHtml(unit) + '</span> <button type="button" class="btn btn-ghost btn-sm" id="change-unit">Change</button></p>'
        : '<div class="field"><label for="home-unit">Your unit</label><input id="home-unit" class="input" placeholder="e.g. 212" value=""><button type="button" class="btn btn-primary btn-block" id="save-unit" style="margin-top:.6rem">Continue</button></div>') +
      '<a class="btn btn-primary btn-block" href="#/new" style="margin-top:.8rem">New request</a>' +
      '<a class="btn btn-ghost btn-block" href="#/requests" style="margin-top:.6rem">My requests</a>' +
      installCard();
    const save = document.getElementById("save-unit");
    if (save) save.addEventListener("click", () => {
      const v = (document.getElementById("home-unit").value || "").trim();
      if (v) { RV.setUnit(v); route(); }
    });
    const ch = document.getElementById("change-unit");
    if (ch) ch.addEventListener("click", () => {
      const next = window.prompt("Enter your unit number", RV.getUnit() || "");
      if (next && next.trim()) { RV.setUnit(next.trim()); route(); }
    });
  }

  function installCard() {
    return '<div class="card" style="margin-top:1.2rem"><p class="eyebrow">Add to Home Screen</p>' +
      "<h3>Use it like an app</h3>" +
      "<p class='small'>On iPhone or iPad: open this page in Safari, tap the Share button, then <strong>Add to Home Screen</strong>.</p>" +
      "<p class='small'>On Android: open the browser menu and tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>" +
      '<button type="button" class="btn btn-soft btn-block" id="install-btn" hidden>Install Tenant Help</button></div>';
  }

  function hookInstall() {
    const btn = document.getElementById("install-btn");
    if (btn && window.__deferredPrompt) {
      btn.hidden = false;
      btn.onclick = async () => {
        window.__deferredPrompt.prompt();
        await window.__deferredPrompt.userChoice;
        window.__deferredPrompt = null;
        btn.hidden = true;
      };
    }
  }

  function renderNew() {
    app.innerHTML = "<h1 style='font-size:1.6rem'>New request</h1>" + RVUI.requestForm({ unit: RV.getUnit() });
    RVUI.bindForm(app, (payload) => {
      try {
        const req = RV.submitRequest(payload);
        location.hash = "#/confirm/" + encodeURIComponent(req.id);
      } catch (err) {
        alert(err.message);
      }
    });
  }

  function renderConfirm(id) {
    const req = RV.getRequest(id);
    if (!req) { app.innerHTML = "<p>Request not found.</p>"; return; }
    app.innerHTML = "<h1 style='font-size:1.6rem'>Request saved</h1><p class='muted'>Reference " + RV.escapeHtml(req.id) + ". Send the text from this phone, or call staff if this is urgent.</p>" + RVUI.requestDetail(req);
    RVUI.bindNotify(app, req, { onOpened: () => renderConfirm(id) });
  }

  function renderList() {
    const unit = RV.getUnit();
    app.innerHTML = "<h1 style='font-size:1.6rem'>My requests</h1>" +
      (unit
        ? RVUI.requestList(RV.requestsForUnit(unit), (r) => "#/request/" + encodeURIComponent(r.id))
        : "<p>Enter your unit on the Home tab first.</p>");
  }

  function renderDetail(id) {
    const req = RV.getRequest(id);
    if (!req) { app.innerHTML = "<p>Request not found.</p>"; return; }
    app.innerHTML = '<p><a href="#/requests">← Activity</a></p>' + RVUI.requestDetail(req);
    RVUI.bindNotify(app, req, { onOpened: () => renderDetail(id) });
  }

  function renderInfo() {
    app.innerHTML =
      "<h1 style='font-size:1.6rem'>About this app</h1>" +
      "<p>This is a proof of concept for Rica Vista Apartments at 1825 Poggi Street, Alameda, CA. It is not an official building service.</p>" +
      "<p>In this demo, sending a request opens a text on <em>your</em> phone, already addressed to the staff number in the manager console. A production version would send automatically from a building number (for example, through Twilio), including after-hours follow-up.</p>" +
      installCard() +
      '<div class="card" style="margin-top:1rem"><p class="eyebrow">A note on native apps</p>' +
      "<p>This is an installable web app (PWA). A true iOS or Android app in the App Store or Google Play could be built with Capacitor or Expo, using the same screens. Apple charges a $99 yearly developer fee; Google Play charges a $25 one-time registration fee. Store apps can also add push notifications alongside text messages.</p></div>" +
      '<p style="margin-top:1rem"><a href="../">Back to the main page</a> · <a href="../how-it-works/">How paging works</a> · <a href="../admin/">Manager Console</a></p>';
    hookInstall();
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__deferredPrompt = e;
    hookInstall();
  });

  window.addEventListener("hashchange", route);
  route();
  hookInstall();
})();
