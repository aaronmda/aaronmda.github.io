(function () {
  const app = document.getElementById("app");
  document.getElementById("banner").innerHTML = RVUI.demoBanner();

  function route() {
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
    const view = parts[0] || "home";
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const on = a.getAttribute("data-nav") === (view === "request" || view === "confirm" ? "requests" : view === "home" ? "home" : view);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (view === "new") renderNew();
    else if (view === "requests") renderList();
    else if (view === "request" && parts[1]) renderDetail(decodeURIComponent(parts[1]));
    else if (view === "confirm" && parts[1]) renderConfirm(decodeURIComponent(parts[1]));
    else renderHome();
  }

  function unitBar() {
    const unit = RV.getUnit();
    return unit
      ? '<p>Your unit: <span class="unit-chip">Unit ' + RV.escapeHtml(unit) + '</span> <button type="button" class="btn btn-ghost btn-sm" id="change-unit">Change</button></p>'
      : "<p class='muted'>Select a unit to see your request history and to send a new request.</p>";
  }

  function bindUnitChange() {
    const b = document.getElementById("change-unit");
    if (b) b.addEventListener("click", () => {
      const next = window.prompt("Enter your unit number", RV.getUnit() || "");
      if (next && next.trim()) { RV.setUnit(next.trim()); route(); }
    });
  }

  function renderHome() {
    const unit = RV.getUnit();
    const recent = unit ? RV.requestsForUnit(unit).slice(0, 3) : [];
    app.innerHTML =
      "<p class='eyebrow'>Tenant Portal</p>" +
      "<h1>How can we help?</h1>" +
      "<p class='lede muted'>Use this page on any computer or phone browser. If you would rather have an app-like shortcut, you can also <a href='../app/'>open the Tenant App</a> and add it to your home screen.</p>" +
      unitBar() +
      '<div class="cta-row"><a class="btn btn-primary" href="#/new">New request</a><a class="btn btn-ghost" href="#/requests">My requests</a></div>' +
      (recent.length ? "<h2 style='margin-top:2rem'>Recent requests</h2>" + RVUI.requestList(recent, (r) => "#/request/" + encodeURIComponent(r.id)) : "");
    bindUnitChange();
  }

  function renderNew() {
    app.innerHTML = "<p class='eyebrow'>Tenant Portal</p><h1>New request</h1>" + RVUI.requestForm({ unit: RV.getUnit() });
    const formRoot = app;
    RVUI.bindForm(formRoot, (payload) => {
      try {
        const req = RV.submitRequest(payload);
        location.hash = "#/confirm/" + encodeURIComponent(req.id);
      } catch (err) {
        let box = formRoot.querySelector(".alert");
        if (!box) {
          box = document.createElement("div");
          box.className = "alert alert-error";
          formRoot.querySelector(".request-form").prepend(box);
        }
        box.textContent = err.message || "Please check the form and try again.";
      }
    });
  }

  function renderConfirm(id) {
    const req = RV.getRequest(id);
    if (!req) { app.innerHTML = "<p>That request was not found.</p>"; return; }
    app.innerHTML =
      "<p class='eyebrow'>Request submitted</p>" +
      "<h1>Your request is on file</h1>" +
      "<p>Reference <strong>" + RV.escapeHtml(req.id) + "</strong>. Review who will be notified, then send the text from your phone. Staff can also be called, which is especially important for emergencies.</p>" +
      RVUI.requestDetail(req);
    RVUI.bindNotify(app, req, { onOpened: () => renderConfirm(id) });
  }

  function renderList() {
    const unit = RV.getUnit();
    app.innerHTML = "<p class='eyebrow'>Tenant Portal</p><h1>My requests</h1>" + unitBar() +
      (unit ? RVUI.requestList(RV.requestsForUnit(unit), (r) => "#/request/" + encodeURIComponent(r.id))
        : "<p>Enter a unit to see requests for that home.</p>" + RVUI.requestForm({ unit: "" }));
    bindUnitChange();
    if (!unit) {
      RVUI.bindForm(app, (payload) => {
        if (payload.unit) { RV.setUnit(payload.unit); route(); }
      });
    }
  }

  function renderDetail(id) {
    const req = RV.getRequest(id);
    if (!req) { app.innerHTML = "<p>That request was not found.</p>"; return; }
    app.innerHTML = '<p><a href="#/requests">← My requests</a></p>' + RVUI.requestDetail(req);
    RVUI.bindNotify(app, req, { onOpened: () => renderDetail(id) });
  }

  window.addEventListener("hashchange", route);
  RV.subscribe(() => { /* stay on current view; details refresh only if we want */ });
  route();
})();
