/* Shared UI helpers for Rica Vista Tenant Help */
(function (global) {
  const ICONS = {
    emergency: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M12 3 2.8 20.2h18.4L12 3zm0 5.6 5.7 10.1H6.3L12 8.6zM11 12h2v3.4h-2V12zm0 4.3h2V18h-2v-1.7z"/></svg>',
    water: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M12 2s7 7.2 7 12.2A7 7 0 1 1 5 14.2C5 9.2 12 2 12 2z"/></svg>',
    lockout: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M8 10V8a4 4 0 1 1 8 0v2h1.5A1.5 1.5 0 0 1 19 11.5v8A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10H8zm2 0h4V8a2 2 0 1 0-4 0v2z"/></svg>',
    access: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M4 4h6v16H4V4zm10 0h6v7h-6V4zm0 9h6v7h-6v-7z"/></svg>',
    noise: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4V9zm12.2 1.2a3 3 0 0 1 0 3.6l-1.3-1.1a1.3 1.3 0 0 0 0-1.4l1.3-1.1zm2.3-2.4a6 6 0 0 1 0 8.4l-1.3-1.2a4.3 4.3 0 0 0 0-6l1.3-1.2z"/></svg>',
    pest: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M12 4a4 4 0 0 1 3.5 2H20v2h-3.1c.07.33.1.66.1 1v1h3v2h-3v1c0 .34-.03.67-.1 1H20v2h-4.5A4 4 0 0 1 8.5 16H4v-2h3.1A5 5 0 0 1 7 13H4v-2h3v-1c0-.34.03-.67.1-1H4V6h4.5A4 4 0 0 1 12 4z"/></svg>',
    maintenance: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M21 7.5 16.5 3l-2.1 2.1 1.8 1.8-2.8 2.8-1.8-1.8L9.5 10l4.5 4.5L3 25l2 0 11-11 4.5 4.5 2.1-2.1-1.8-1.8 2.8-2.8 1.8 1.8L25 9.5 21 5.5 19.2 7.3 16.4 4.5 18.5 2.4"/></svg>',
    package: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9zM12 12l8.2-4.1L12 5 3.8 7.9 12 12z"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 3 11h2v9h6v-6h2v6h6v-9h2L12 3z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 6h14v2H5V6zm0 5h14v2H5v-2zm0 5h14v2H5v-2z"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 9h2V7h-2v2zm0 8h2v-6h-2v6zm1-14a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>'
  };

  /* Simple wrench for maintenance — the path above may be messy; use a cleaner one */
  ICONS.maintenance = '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path fill="currentColor" d="M21.2 7.2a5 5 0 0 1-6.7 4.7l-7.8 7.8a2 2 0 1 1-2.8-2.8l7.8-7.8a5 5 0 0 1 6.2-6.7l-2.3 2.3 2.6 2.6 2.3-2.3c.5.9.7 1.9.7 3z"/></svg>';

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function icon(id) { return ICONS[id] || ICONS.info; }

  function demoBanner(extra) {
    return '<div class="demo-banner" role="status"><strong>Proof of concept · Sample data.</strong> In this demo, a request opens a text on your phone — nothing is sent until you tap Send in Messages. A production version would notify staff automatically from a building number.' + (extra ? " " + extra : "") + "</div>";
  }

  function statusPill(status) {
    const s = RV.statusById(status);
    return '<span class="pill pill-' + RV.escapeHtml(status) + '">' + RV.escapeHtml(s.tenant || s.name) + "</span>";
  }

  function samplePill(req) {
    return req && req.example ? '<span class="pill pill-sample">Sample data</span>' : "";
  }

  function pageStatePill(state) {
    const cls = state === "opened" ? "opened" : state === "queued" ? "queued" : state === "cancelled" ? "cancelled" : "pending";
    return '<span class="pill pill-' + cls + '">' + RV.escapeHtml(RV.pageStateLabel(state)) + "</span>";
  }

  function categoryGrid(selectedId, name) {
    return '<div class="cat-grid" role="group" aria-label="Request category">' +
      RV.CATEGORIES.map((c) => {
        const on = c.id === selectedId;
        return '<button type="button" class="cat-tile' + (c.call911 ? " is-emergency" : "") + (on ? " is-selected" : "") + '" data-cat="' + c.id + '" aria-pressed="' + on + '"' + (name ? ' name="' + name + '"' : "") + ">" +
          icon(c.id) + "<strong>" + RV.escapeHtml(c.name) + "</strong><span>" + RV.escapeHtml(c.blurb) + "</span></button>";
      }).join("") + "</div>";
  }

  function urgencyRow(selected, lockedEmergency) {
    return '<div class="urgency-row" role="group" aria-label="Urgency">' +
      RV.URGENCY.map((u) => {
        const on = u.id === selected;
        const disabled = lockedEmergency && u.id !== "emergency";
        return '<button type="button" class="urg-btn ' + u.id + '" data-urgency="' + u.id + '" aria-pressed="' + on + '"' + (disabled ? " disabled" : "") + ">" + RV.escapeHtml(u.name) + "</button>";
      }).join("") + "</div>";
  }

  function unitOptions(current) {
    const set = new Set(RV.EXAMPLE_UNITS);
    if (current && !set.has(current)) set.add(current);
    return Array.from(set).map((u) => {
      return '<option value="' + RV.escapeHtml(u) + '"' + (u === current ? " selected" : "") + ">" + RV.escapeHtml(u) + "</option>";
    }).join("");
  }

  function requestForm(opts) {
    const unit = opts.unit || RV.getUnit() || "";
    const cat = opts.categoryId || "";
    const urgency = opts.urgency || "normal";
    const desc = opts.description || "";
    const c = RV.categoryById(cat);
    const emergency = !!(c && c.call911);
    return (
      '<form class="request-form" novalidate>' +
        '<div class="field unit-row">' +
          '<div class="field" style="flex:1">' +
            '<label for="unit-select">Unit</label>' +
            '<select id="unit-select" class="select" name="unitSelect">' +
              '<option value="">Select a unit</option>' +
              unitOptions(unit) +
            "</select>" +
            '<span class="hint">Example units for this demo. You can also type any unit.</span>' +
          "</div>" +
          '<div class="field" style="flex:1">' +
            '<label for="unit-input">Or type a unit</label>' +
            '<input id="unit-input" class="input" name="unit" value="' + RV.escapeHtml(unit) + '" placeholder="e.g. 212" autocomplete="off">' +
          "</div>" +
        "</div>" +
        '<div class="field"><span class="field-label" id="cat-label" style="font-weight:700;display:block;margin-bottom:.45rem">What do you need help with?</span>' +
          categoryGrid(cat) +
          '<input type="hidden" name="categoryId" value="' + RV.escapeHtml(cat) + '">' +
        "</div>" +
        '<div id="emergency-panel">' + (emergency ? emergencyGuidance() : "") + "</div>" +
        '<div class="field"><label for="description">Description</label>' +
          '<textarea id="description" name="description" required placeholder="What is happening, and where?">' + RV.escapeHtml(desc) + "</textarea></div>" +
        '<div class="field"><label for="photo">Photo (optional)</label>' +
          '<input id="photo" name="photo" type="file" accept="image/*">' +
          '<span class="hint">Preview only in this demo. A small copy may be saved on this device.</span>' +
          '<div class="photo-preview" id="photo-preview" hidden></div></div>' +
        '<div class="field"><label>Urgency</label>' + urgencyRow(emergency ? "emergency" : urgency, emergency) +
          '<input type="hidden" name="urgency" value="' + RV.escapeHtml(emergency ? "emergency" : urgency) + '">' +
        "</div>" +
        '<button type="submit" class="btn btn-primary btn-block" id="submit-request">Submit request</button>' +
        '<p class="hint" style="margin-top:.7rem">Submitting prepares a text to the staff assigned to this category. On a phone, you can send it from your own Messages app. On a computer, you can copy the message or scan a QR code.</p>' +
      "</form>"
    );
  }

  function emergencyGuidance() {
    return '<div class="call-911" role="alert"><h3>Call 911 first if anyone is in danger</h3>' +
      "<p>If this is a fire, flood, gas leak, or a medical emergency, contact emergency services first. This form notifies building staff — it does not reach 911.</p>" +
      '<div class="cta-row" style="margin-top:0"><a class="btn btn-danger" href="tel:911">Call 911</a></div></div>';
  }

  function bindForm(root, onSubmit) {
    const form = root.querySelector(".request-form");
    if (!form) return;
    const catInput = form.querySelector('input[name="categoryId"]');
    const urgInput = form.querySelector('input[name="urgency"]');
    const unitSelect = form.querySelector("#unit-select");
    const unitInput = form.querySelector("#unit-input");
    const preview = form.querySelector("#photo-preview");
    const emergencyPanel = form.querySelector("#emergency-panel");
    let photo = null;

    form.querySelectorAll(".cat-tile").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-cat");
        catInput.value = id;
        form.querySelectorAll(".cat-tile").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-selected", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        const c = RV.categoryById(id);
        emergencyPanel.innerHTML = c && c.call911 ? emergencyGuidance() : "";
        if (c && c.call911) {
          urgInput.value = "emergency";
          form.querySelectorAll(".urg-btn").forEach((u) => {
            const on = u.getAttribute("data-urgency") === "emergency";
            u.setAttribute("aria-pressed", on ? "true" : "false");
            u.disabled = u.getAttribute("data-urgency") !== "emergency";
          });
        } else {
          const def = (c && c.defaultUrgency) ? c.defaultUrgency : "normal";
          urgInput.value = def;
          form.querySelectorAll(".urg-btn").forEach((u) => {
            u.disabled = false;
            u.setAttribute("aria-pressed", u.getAttribute("data-urgency") === def ? "true" : "false");
          });
        }
      });
    });

    form.querySelectorAll(".urg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        urgInput.value = btn.getAttribute("data-urgency");
        form.querySelectorAll(".urg-btn").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      });
    });

    unitSelect.addEventListener("change", () => {
      if (unitSelect.value) unitInput.value = unitSelect.value;
    });

    form.querySelector("#photo").addEventListener("change", async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      photo = null;
      preview.hidden = true;
      preview.innerHTML = "";
      if (!file) return;
      try {
        photo = await RV.resizeImage(file);
        if (photo && photo.dataUrl) {
          preview.hidden = false;
          preview.innerHTML = '<img alt="Selected photo preview" src="' + photo.dataUrl + '">';
        } else if (photo && photo.skipped) {
          preview.hidden = false;
          preview.innerHTML = "<p class='hint'>Photo noted, but it was too large to store in this demo.</p>";
        }
      } catch (err) {
        preview.hidden = false;
        preview.innerHTML = "<p class='hint'>" + RV.escapeHtml(err.message) + "</p>";
      }
    });

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const unit = (unitInput.value || unitSelect.value || "").trim();
      const categoryId = catInput.value;
      const description = (form.description.value || "").trim();
      const urgency = urgInput.value;
      onSubmit({ unit, categoryId, description, urgency, photo, event: ev });
    });
  }

  function whoList(req, mode) {
    const rows = RV.targetsForPages(RV.pagesForSend(req, mode || "immediate"), true);
    const people = [];
    rows.forEach((r) => {
      let p = people.find((x) => x.recipientId === r.recipientId);
      if (!p) {
        p = { recipientId: r.recipientId, name: r.name, role: r.role, methods: [], phone: r.phone, email: r.email };
        people.push(p);
      }
      if (!p.methods.includes(r.method)) p.methods.push(r.method);
    });
    return people;
  }

  function dedupeNote(req, mode) {
    const phones = RV.uniquePhones(RV.targetsForPages(RV.pagesForSend(req, mode || "immediate"), true).filter((r) => r.method !== "email"));
    if (phones.length === 1 && phones[0].people.length > 1) {
      return "<p class='hint'>These roles currently share the same number, so one text covers everyone listed.</p>";
    }
    if (phones.length > 1) {
      return "<p class='hint'>This request notifies more than one number. The text is addressed to each of them.</p>";
    }
    return "";
  }

  function notifyCard(req, opts) {
    opts = opts || {};
    const mode = opts.mode || "immediate";
    const people = whoList(req, mode);
    const sms = RV.smsUrl(req, mode);
    const message = RV.buildPageMessage(req, mode);
    const calls = RV.callTargets(req, mode);
    const cat = RV.categoryById(req.categoryId);
    const mobile = RV.isMobile();
    const peopleHtml = people.length
      ? "<ul class='person-list'>" + people.map((p) => {
          return "<li><div><strong>" + RV.escapeHtml(p.name) + "</strong><div class='tiny muted'>" + RV.escapeHtml(p.role) + " · " + RV.escapeHtml(p.methods.map(RV.methodName).join(", ")) + "</div></div><div>" + RV.escapeHtml(RV.formatPhone(p.phone)) + "</div></li>";
        }).join("") + "</ul>"
      : "<p>No staff are assigned to this category yet. Add a recipient in the manager console.</p>";

    const callBtns = calls.map((c, i) => {
      const roles = c.people.map((p) => p.role).join(", ");
      const label = cat && cat.call911 ? (calls.length === 1 ? "Call staff" : "Call " + roles) : (calls.length === 1 ? "Call staff" : "Call " + (c.people[0] ? c.people[0].name : "staff"));
      return '<a class="btn ' + (cat && cat.call911 ? "btn-danger" : "btn-ghost") + '" href="' + RV.escapeHtml(RV.telUrl(c.phoneDigits)) + '" data-tel="1">' + RV.escapeHtml(label) + " · " + RV.escapeHtml(RV.formatPhone(c.phone)) + "</a>";
    }).join("");

    const smsBtn = sms
      ? '<a class="btn btn-primary" id="send-text-btn" data-sms="1" href="' + RV.escapeHtml(sms) + '">Send text</a>'
      : "";

    const mobileBlock = mobile
      ? ('<div class="mobile-send cta-row">' + smsBtn + callBtns + "</div>")
      : "";

    const desktopBlock = mobile ? "" : (
      '<div class="desktop-send">' +
        '<div class="qr-wrap">' +
          '<div><p class="eyebrow">On a computer</p><p class="small muted" style="margin:.2rem 0 .5rem">This computer may not open Messages. Copy the text, or scan the code with a phone. You can also try Send text if your computer has a messaging app.</p>' +
            '<div class="cta-row"><button type="button" class="btn btn-soft" data-copy="1">Copy message</button>' + smsBtn + callBtns + "</div>" +
            '<p class="hint copy-status" hidden></p></div>' +
          '<div><div class="qr-box" data-qr="1"></div><p class="tiny muted">Scan to open Messages</p></div>' +
        "</div></div>"
    );

    return (
      '<div class="notify-card" data-request-id="' + RV.escapeHtml(req.id) + '" data-mode="' + RV.escapeHtml(mode) + '">' +
        "<h3>Who will be notified</h3>" +
        peopleHtml +
        dedupeNote(req, mode) +
        "<p class='eyebrow'>Message</p>" +
        '<pre class="message-preview" data-message="1">' + RV.escapeHtml(message) + "</pre>" +
        mobileBlock +
        desktopBlock +
      "</div>"
    );
  }

  function bindNotify(root, req, opts) {
    const card = root.querySelector(".notify-card");
    if (!card) return;
    const mode = card.getAttribute("data-mode") || "immediate";
    const payload = RV.smstoPayload(req, mode);
    const qrEl = card.querySelector("[data-qr]");
    if (qrEl && payload && global.RVQR) {
      try { RVQR.render(qrEl, payload); } catch (err) { qrEl.innerHTML = "<p class='hint'>QR code could not be drawn.</p>"; }
    }
    const copyBtn = card.querySelector("[data-copy]");
    const status = card.querySelector(".copy-status");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const text = RV.buildPageMessage(req, mode);
        try {
          await navigator.clipboard.writeText(text);
          if (status) { status.hidden = false; status.textContent = "Message copied."; }
        } catch (e) {
          if (status) { status.hidden = false; status.textContent = "Copy wasn’t available. You can select the message and copy it yourself."; }
        }
      });
    }
    card.querySelectorAll("[data-sms]").forEach((a) => {
      a.addEventListener("click", () => {
        try { RV.markTextsOpened(req.id, mode); } catch (e) { /* ignore */ }
        if (opts && opts.onOpened) opts.onOpened();
      });
    });
  }

  function timeline(req) {
    const items = (req.timeline || []).slice().sort((a, b) => a.at - b.at);
    return '<ol class="timeline">' + items.map((t) => {
      const st = RV.statusById(t.status);
      return "<li><div>" + statusPill(t.status) + "</div><div>" + RV.escapeHtml(t.note) + "</div>" +
        '<div class="who">' + RV.escapeHtml(t.actor) + "</div>" +
        '<div class="when">' + RV.escapeHtml(RV.formatTimeFull(t.at)) + "</div></li>";
    }).join("") + "</ol>";
  }

  function requestList(requests, hrefFn) {
    if (!requests.length) {
      return '<div class="empty"><p>No requests for this unit yet.</p></div>';
    }
    return '<div class="req-list">' + requests.map((r) => {
      const cat = RV.categoryById(r.categoryId);
      const href = hrefFn ? hrefFn(r) : "#/request/" + encodeURIComponent(r.id);
      return '<a class="req-item" href="' + href + '"><div class="req-item-top">' +
        statusPill(r.status) + samplePill(r) + "</div>" +
        "<h3>" + RV.escapeHtml(cat ? cat.name : r.categoryId) + " · Unit " + RV.escapeHtml(r.unit) + "</h3>" +
        '<div class="req-meta">' + RV.escapeHtml(r.id) + " · " + RV.escapeHtml(RV.relativeTime(r.createdAt)) + "</div>" +
        "<p class='small' style='margin:.35rem 0 0'>" + RV.escapeHtml(r.description) + "</p></a>";
    }).join("") + "</div>";
  }

  function requestDetail(req, opts) {
    opts = opts || {};
    const cat = RV.categoryById(req.categoryId);
    const urg = (RV.URGENCY.find((u) => u.id === req.urgency) || { name: req.urgency }).name;
    const photo = req.photoDataUrl ? '<div class="photo-preview" style="max-width:280px"><img alt="Attached photo preview" src="' + req.photoDataUrl + '"></div>' : (req.photoName ? "<p class='hint'>A photo was attached (" + RV.escapeHtml(req.photoName) + ").</p>" : "");
    const queued = RV.queuedPages(req).filter((p) => p.state === "queued" || p.state === "pending");
    let esc = "";
    if (queued.length && req.status === "new") {
      const mins = queued[0].delayMinutes;
      esc = "<p class='hint'>If this is not acknowledged in " + mins + " minutes, the next person on the list should also be notified.</p>";
    }
    return (
      '<article class="card">' +
        '<div class="req-item-top">' + statusPill(req.status) + samplePill(req) + "</div>" +
        "<p class='eyebrow' style='margin-top:.7rem'>" + RV.escapeHtml(req.id) + "</p>" +
        "<h2>" + RV.escapeHtml(cat ? cat.name : "Request") + " · Unit " + RV.escapeHtml(req.unit) + "</h2>" +
        "<p class='req-meta'>Urgency: " + RV.escapeHtml(urg) + " · " + RV.escapeHtml(RV.formatTimeFull(req.createdAt)) + "</p>" +
        "<p>" + RV.escapeHtml(req.description) + "</p>" + photo +
        (cat && cat.call911 ? emergencyGuidance() : "") +
        "<h3 style='margin-top:1.2rem'>Notification</h3>" +
        notifyCard(req, { mode: "immediate" }) + esc +
        "<h3 style='margin-top:1.4rem'>Status</h3>" +
        timeline(req) +
      "</article>"
    );
  }

  function fontsAndMeta(title, prefix, opts) {
    opts = opts || {};
    const p = prefix || "";
    let extra = "";
    if (opts.pwa) {
      extra = '<link rel="manifest" href="manifest.json">' +
        '<meta name="apple-mobile-web-app-capable" content="yes">' +
        '<meta name="apple-mobile-web-app-title" content="Rica Vista">' +
        '<meta name="mobile-web-app-capable" content="yes">';
    }
    return (
      '<meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
      "<title>" + title + "</title>" +
      '<meta name="description" content="Rica Vista Tenant Help is a proof of concept for resident requests and staff notification at 1825 Poggi Street, Alameda, CA.">' +
      '<meta name="theme-color" content="#1a5f56">' +
      '<link rel="icon" href="' + p + 'icons/logo.svg" type="image/svg+xml">' +
      extra +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&display=swap" rel="stylesheet">' +
      '<link rel="stylesheet" href="' + p + 'css/styles.css">'
    );
  }

  global.RVUI = {
    icon, demoBanner, statusPill, samplePill, pageStatePill,
    categoryGrid, requestForm, bindForm, emergencyGuidance,
    notifyCard, bindNotify, timeline, requestList, requestDetail,
    whoList, el, fontsAndMeta
  };
})(window);
