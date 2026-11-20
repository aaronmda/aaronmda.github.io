(function () {
  const app = document.getElementById("app");
  const nav = document.getElementById("admin-nav");
  document.getElementById("banner").innerHTML = RVUI.demoBanner("Demo PIN: <strong>1825</strong>.");

  document.getElementById("logout").addEventListener("click", () => {
    RV.logoutAdmin();
    location.hash = "#/";
    route();
  });

  function authed() { return RV.isAdminAuthed(); }

  function route() {
    if (!authed()) {
      nav.hidden = true;
      renderPin();
      return;
    }
    nav.hidden = false;
    const parts = (location.hash || "#/inbox").replace(/^#/, "").split("/").filter(Boolean);
    const view = parts[0] || "inbox";
    document.querySelectorAll("#admin-nav [data-nav]").forEach((a) => {
      if (a.getAttribute("data-nav") === (view === "request" ? "inbox" : view)) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (view === "routing") renderRouting();
    else if (view === "people") renderPeople();
    else if (view === "log") renderLog();
    else if (view === "request" && parts[1]) renderRequest(decodeURIComponent(parts[1]));
    else renderInbox();
  }

  function renderPin() {
    app.innerHTML =
      '<div class="pin-gate card">' +
        '<p class="eyebrow">Manager Console</p>' +
        "<h1>Staff sign in</h1>" +
        "<p>This console is PIN-protected so tenants browsing the demo don’t change routing by accident.</p>" +
        '<p class="note"><strong>Demo PIN: 1825</strong> — shown here on purpose for this proof of concept.</p>' +
        '<form id="pin-form" class="field" style="margin-top:1rem">' +
          '<label for="pin">PIN</label>' +
          '<input id="pin" class="input pin-code" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" value="1825">' +
          '<button type="submit" class="btn btn-primary btn-block" style="margin-top:.8rem">Enter console</button>' +
          '<p class="alert alert-error" id="pin-err" hidden></p>' +
        "</form></div>";
    document.getElementById("pin-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = RV.confirmPin(document.getElementById("pin").value);
      if (!ok) {
        const err = document.getElementById("pin-err");
        err.hidden = false;
        err.textContent = "That PIN didn’t match. For this demo, use 1825.";
        return;
      }
      location.hash = "#/inbox";
      route();
    });
  }

  function renderInbox() {
    const rows = RV.allRequests();
    app.innerHTML = '<p class="eyebrow">Manager Console</p><h1>Request inbox</h1>' +
      "<p class='muted'>Status changes appear for the tenant on the portal and in the app. Sample requests are labeled.</p>" +
      '<div class="table-wrap card" style="padding:0"><table class="data"><thead><tr><th>Request</th><th>Unit</th><th>Category</th><th>Status</th><th>When</th></tr></thead><tbody>' +
      rows.map((r) => {
        const cat = RV.categoryById(r.categoryId);
        return "<tr><td><a href='#/request/" + encodeURIComponent(r.id) + "'>" + RV.escapeHtml(r.id) + "</a> " + RVUI.samplePill(r) + "</td><td>" + RV.escapeHtml(r.unit) + "</td><td>" + RV.escapeHtml(cat ? cat.name : r.categoryId) + "</td><td>" + RVUI.statusPill(r.status) + "</td><td>" + RV.escapeHtml(RV.relativeTime(r.createdAt)) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function renderRequest(id) {
    const req = RV.getRequest(id);
    if (!req) { app.innerHTML = "<p>Request not found.</p>"; return; }
    const statuses = RV.STATUSES.map((s) => {
      const on = s.id === req.status;
      return '<button type="button" class="btn btn-sm ' + (on ? "btn-primary" : "btn-ghost") + '" data-status="' + s.id + '"' + (on ? " disabled" : "") + ">" + RV.escapeHtml(s.name) + "</button>";
    }).join("");
    const queued = (req.pages || []).some((p) => p.kind === "escalation" && (p.state === "queued" || p.state === "pending") && req.status === "new");
    app.innerHTML =
      '<p><a href="#/inbox">← Inbox</a></p>' +
      RVUI.requestDetail(req) +
      '<div class="card" style="margin-top:1rem"><h3>Update status</h3><div class="cta-row" id="status-actions">' + statuses + "</div>" +
      (queued ? '<div class="cta-row"><button type="button" class="btn btn-soft" id="run-esc">Prepare escalation text now</button></div><p class="hint">Use this to demonstrate a follow-up if no one has acknowledged the request yet.</p>' : "") +
      "</div>";
    RVUI.bindNotify(app, req, { onOpened: () => renderRequest(id) });
    document.querySelectorAll("#status-actions [data-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        RV.setStatus(id, btn.getAttribute("data-status"), "Building staff (manager console)");
        renderRequest(id);
      });
    });
    const esc = document.getElementById("run-esc");
    if (esc) esc.addEventListener("click", () => {
      try {
        RV.runEscalation(id);
        const latest = RV.getRequest(id);
        app.insertAdjacentHTML("afterbegin", "<div class='alert alert-ok'>Escalation is ready. Send the follow-up text below if you want to notify the next person on the list.</div>");
        const card = RVUI.notifyCard(latest, { mode: "escalation" });
        esc.closest(".card").insertAdjacentHTML("beforebegin", card);
        RVUI.bindNotify(app, latest, { mode: "escalation", onOpened: () => renderRequest(id) });
      } catch (err) {
        alert(err.message);
      }
    });
  }

  function renderRouting() {
    const recips = RV.recipients();
    const recipOpts = recips.map((r) => '<option value="' + RV.escapeHtml(r.id) + '">' + RV.escapeHtml(r.name + " · " + r.role) + "</option>").join("");
    app.innerHTML = '<p class="eyebrow">Manager Console</p><h1>Routing rules</h1>' +
      "<p>Each category can notify one or more people. A delay of 0 minutes means they are listed immediately. A delay of N minutes means they are listed next if the request is still unacknowledged.</p>" +
      RV.CATEGORIES.map((c) => {
        const rule = RV.ruleByCategory(c.id);
        const steps = (rule.steps || []).map((s, i) => stepRow(s, i, recipOpts)).join("") || "<p class='hint'>No one is assigned yet.</p>";
        return '<section class="card rule-card" data-category="' + c.id + '"><h3>' + RV.escapeHtml(c.name) + "</h3>" +
          '<p class="hint">' + RV.escapeHtml(c.blurb) + "</p><div class='steps'>" + steps + "</div>" +
          '<div class="cta-row"><button type="button" class="btn btn-sm btn-soft" data-add>Add person</button><button type="button" class="btn btn-sm btn-primary" data-save>Save this category</button></div>' +
          '<p class="hint save-msg" hidden></p></section>';
      }).join("");

    app.querySelectorAll(".rule-card").forEach((card) => {
      card.querySelector("[data-add]").addEventListener("click", () => {
        const wrap = card.querySelector(".steps");
        const i = wrap.querySelectorAll(".step-row").length;
        wrap.insertAdjacentHTML("beforeend", stepRow({ recipientId: recips[0] ? recips[0].id : "", methods: ["sms"], delayMinutes: 0 }, i, recipOpts));
      });
      card.querySelector("[data-save]").addEventListener("click", () => {
        const steps = Array.from(card.querySelectorAll(".step-row")).map((row) => {
          const methods = Array.from(row.querySelectorAll('input[type="checkbox"]:checked')).map((c) => c.value);
          return {
            recipientId: row.querySelector(".recip").value,
            methods,
            delayMinutes: Number(row.querySelector(".delay").value) || 0
          };
        });
        RV.setRule(card.getAttribute("data-category"), steps);
        const msg = card.querySelector(".save-msg");
        msg.hidden = false;
        msg.textContent = "Saved. The next request in this category will use these people and numbers.";
      });
      card.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-remove]");
        if (rm) rm.closest(".step-row").remove();
      });
    });
  }

  function stepRow(step, i, recipOpts) {
    const methods = RV.METHODS.map((m) => {
      const on = (step.methods || []).indexOf(m.id) !== -1;
      return '<label class="tiny" style="font-weight:700;margin-right:.5rem"><input type="checkbox" value="' + m.id + '"' + (on ? " checked" : "") + "> " + m.name + "</label>";
    }).join("");
    const opts = recipOpts.replace('value="' + step.recipientId + '"', 'value="' + step.recipientId + '" selected');
    return '<div class="step-row">' +
      '<select class="select recip">' + opts + "</select>" +
      "<div>" + methods + "</div>" +
      '<label class="tiny" style="font-weight:700">After <input class="input delay" type="number" min="0" step="1" value="' + (Number(step.delayMinutes) || 0) + '" style="min-height:40px;width:5.5rem;display:inline-block"> min</label>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-remove>Remove</button></div>';
  }

  function renderPeople() {
    const rows = RV.recipients();
    app.innerHTML = '<p class="eyebrow">Manager Console</p><h1>People and numbers</h1>' +
      "<p>Change a number here and the next text or call for that person will use it. Sample staff names are for this demonstration.</p>" +
      '<div class="table-wrap card" style="padding:0;margin-bottom:1rem"><table class="data"><thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Email</th><th>Hours</th><th></th></tr></thead><tbody>' +
      rows.map((r) => "<tr><td>" + RV.escapeHtml(r.name) + (r.demo ? " <span class='pill pill-sample'>Sample</span>" : "") + "</td><td>" + RV.escapeHtml(r.role) + "</td><td>" + RV.escapeHtml(RV.formatPhone(r.phone)) + "</td><td>" + RV.escapeHtml(r.email || "—") + "</td><td>" + RV.escapeHtml(r.hours || "—") + "</td><td><button type='button' class='btn btn-sm btn-ghost' data-edit='" + RV.escapeHtml(r.id) + "'>Edit</button> <button type='button' class='btn btn-sm btn-ghost' data-del='" + RV.escapeHtml(r.id) + "'>Remove</button></td></tr>").join("") +
      "</tbody></table></div>" +
      '<div class="card" id="person-form-card"><h3 id="person-form-title">Add a person</h3>' + personForm() + "</div>" +
      '<div class="cta-row"><button type="button" class="btn btn-ghost" id="reset-demo">Reset sample data</button></div>';

    function personForm(person) {
      const p = person || { id: "", name: "", role: "", phone: "", email: "", hours: "" };
      return '<form id="person-form">' +
        '<input type="hidden" name="personId" value="' + RV.escapeHtml(p.id) + '">' +
        '<div class="grid-2">' +
        '<div class="field"><label for="p-name">Name</label><input id="p-name" name="name" class="input" required value="' + RV.escapeHtml(p.name) + '"></div>' +
        '<div class="field"><label for="p-role">Role</label><input id="p-role" name="role" class="input" placeholder="On-site Manager, Maintenance On-Call…" value="' + RV.escapeHtml(p.role) + '"></div>' +
        '<div class="field"><label for="p-phone">Phone</label><input id="p-phone" name="phone" class="input" inputmode="tel" value="' + RV.escapeHtml(p.phone) + '" placeholder="(707) 867-6741"></div>' +
        '<div class="field"><label for="p-email">Email</label><input id="p-email" name="email" class="input" value="' + RV.escapeHtml(p.email) + '"></div>' +
        '</div><div class="field"><label for="p-hours">On-call hours</label><input id="p-hours" name="hours" class="input" value="' + RV.escapeHtml(p.hours) + '"></div>' +
        '<div class="cta-row"><button type="submit" class="btn btn-primary">Save person</button>' +
        (p.id ? '<button type="button" class="btn btn-ghost" id="cancel-edit">Cancel</button>' : "") +
        "</div><p class='hint' id='person-msg' hidden></p></form>";
    }

    app.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const person = RV.recipientById(btn.getAttribute("data-edit"));
        const card = document.getElementById("person-form-card");
        card.innerHTML = "<h3 id='person-form-title'>Edit person</h3>" + personForm(person);
        bindPersonForm();
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    app.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.confirm("Remove this person from the directory and from routing rules?")) {
          RV.deleteRecipient(btn.getAttribute("data-del"));
          renderPeople();
        }
      });
    });
    document.getElementById("reset-demo").addEventListener("click", () => {
      if (window.confirm("Reset all requests, routing, and people back to the sample data?")) {
        RV.resetDemo();
        renderPeople();
      }
    });
    bindPersonForm();

    function bindPersonForm() {
      const form = document.getElementById("person-form");
      if (!form) return;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        try {
          RV.upsertRecipient({
            id: form.personId.value || undefined,
            name: form.name.value,
            role: form.role.value,
            phone: form.phone.value,
            email: form.email.value,
            hours: form.hours.value
          });
          renderPeople();
        } catch (err) {
          const msg = document.getElementById("person-msg");
          msg.hidden = false;
          msg.textContent = err.message;
        }
      });
      const cancel = document.getElementById("cancel-edit");
      if (cancel) cancel.addEventListener("click", renderPeople);
    }
  }

  function renderLog() {
    const pages = RV.pages();
    app.innerHTML = '<p class="eyebrow">Manager Console</p><h1>Page log</h1>' +
      "<p>This log records texts and calls prepared for each request. When someone taps <strong>Send text</strong>, the entry is marked <em>Text opened on device</em>. The message is not sent automatically in this demo — the resident or staff member still confirms it in Messages. A production version would send from a building number on its own.</p>" +
      '<div class="table-wrap card" style="padding:0"><table class="data"><thead><tr><th>When</th><th>Request</th><th>Who</th><th>Method</th><th>To</th><th>Status</th></tr></thead><tbody>' +
      pages.map((p) => {
        const when = p.state === "queued" ? "Scheduled " + RV.formatTime(p.scheduledAt) : RV.formatTime(p.openedAt || p.at);
        const cat = RV.categoryById(p.categoryId);
        return "<tr><td>" + RV.escapeHtml(when) + "</td><td>" + RV.escapeHtml(p.requestId) + (p.unit ? " · Unit " + RV.escapeHtml(p.unit) : "") + "<div class='tiny muted'>" + RV.escapeHtml(cat ? cat.name : "") + "</div></td><td>" + RV.escapeHtml(p.recipientName) + "<div class='tiny muted'>" + RV.escapeHtml(p.role) + "</div></td><td>" + RV.escapeHtml(RV.methodName(p.method)) + "</td><td>" + RV.escapeHtml(p.method === "email" ? p.to : RV.formatPhone(p.to)) + "</td><td>" + RVUI.pageStatePill(p.state) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  window.addEventListener("hashchange", route);
  RV.subscribe(() => {
    if (!authed()) return;
    /* Don't hijack an in-progress edit; inbox/log can stay until navigation. */
  });
  route();
})();
