(function () {
  const host = document.getElementById("demo-host");
  const startBtn = document.getElementById("guided-demo-btn");
  const SAMPLE = {
    unit: "212",
    categoryId: "water",
    urgency: "urgent",
    example: true,
    description: "SAMPLE — Slow leak under the kitchen sink in Unit 212. A small puddle forms after the dishwasher runs. This is a guided demo request."
  };

  const STEPS = 5;
  let step = 1;
  let demoReq = null;

  function close() {
    host.innerHTML = "";
    startBtn.focus();
  }

  function dots() {
    return '<div class="step-dots" aria-hidden="true">' +
      Array.from({ length: STEPS }, (_, i) => '<span class="' + (i + 1 === step ? "is-on" : "") + '"></span>').join("") +
      "</div>";
  }

  function shell(title, body, actions) {
    return '<div class="modal-backdrop" role="presentation" id="demo-backdrop">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="demo-title">' +
        '<div class="modal-head"><div><p class="eyebrow">Guided demo</p><h2 id="demo-title">' + title + "</h2></div>" +
        '<button type="button" class="btn btn-ghost btn-sm" data-close>Close</button></div>' +
        dots() + body +
        '<div class="cta-row">' + actions + "</div></div></div>";
  }

  function render() {
    let title = "";
    let body = "";
    let actions = "";
    if (step === 1) {
      title = "Try a sample request";
      body = "<p>You’ll walk through a clearly labeled sample request from Unit 212 — a water leak — then see who is notified, and how staff can acknowledge it.</p>" +
        "<p class='hint'>This uses sample data. If you send the text from your phone, it will go to the staff number configured in this demo. Nothing is sent until you tap Send in Messages.</p>";
      actions = '<button type="button" class="btn btn-primary" data-next>Start</button>';
    } else if (step === 2) {
      title = "1. A resident submits a request";
      body = '<div class="card" style="box-shadow:none"><p class="pill pill-sample">Sample data</p>' +
        "<p><strong>Unit 212</strong> · Water leak · Urgent</p>" +
        "<p>" + RV.escapeHtml(SAMPLE.description) + "</p></div>" +
        "<p class='hint' style='margin-top:.8rem'>Routing for water leaks currently notifies Maintenance On-Call and the On-site Manager right away, then Maintenance Tech if it is not acknowledged.</p>";
      actions = '<button type="button" class="btn btn-ghost" data-back>Back</button><button type="button" class="btn btn-primary" data-submit>Submit sample request</button>';
    } else if (step === 3 && demoReq) {
      title = "2. The text is ready to send";
      body = "<p>The request is on file as <strong>" + RV.escapeHtml(demoReq.id) + "</strong>. Staff assigned to this category are listed below. On a phone, tap Send text to open Messages with this note already filled in. On a computer, copy it or scan the QR code.</p>" +
        RVUI.notifyCard(demoReq, { mode: "immediate" });
      actions = '<button type="button" class="btn btn-ghost" data-back>Back</button><button type="button" class="btn btn-primary" data-next>Next: staff acknowledge</button>';
    } else if (step === 4 && demoReq) {
      title = "3. Staff acknowledge the request";
      body = "<p>In the manager console, staff see the same request in the inbox and can mark it acknowledged, in progress, or done. That status appears for the tenant right away.</p>" +
        "<div class='card' style='box-shadow:none'><p class='eyebrow'>Manager inbox (sample)</p>" +
        "<h3>Water leak · Unit 212</h3><p class='req-meta'>" + RV.escapeHtml(demoReq.id) + " · " + RVUI.statusPill(demoReq.status) + "</p></div>";
      actions = '<button type="button" class="btn btn-ghost" data-back>Back</button><button type="button" class="btn btn-primary" data-ack>Acknowledge request</button>';
    } else if (step === 5 && demoReq) {
      demoReq = RV.getRequest(demoReq.id) || demoReq;
      title = "4. The tenant can see the update";
      body = "<p>The request now shows as acknowledged, with a simple timeline. You can keep exploring the Tenant Portal, Tenant App, or Manager Console (demo PIN <strong>1825</strong>).</p>" +
        RVUI.timeline(demoReq);
      actions = '<a class="btn btn-primary" href="portal/">Open Tenant Portal</a><a class="btn btn-ghost" href="admin/">Open Manager Console</a><button type="button" class="btn btn-ghost" data-close>Done</button>';
    }

    host.innerHTML = shell(title, body, actions);
    const modal = host.querySelector(".modal");
    if (step === 3 && demoReq) RVUI.bindNotify(modal, demoReq);
    host.querySelector("[data-close]").addEventListener("click", close);
    host.querySelector("#demo-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "demo-backdrop") close();
    });
    const next = host.querySelector("[data-next]");
    if (next) next.addEventListener("click", () => { step += 1; render(); });
    const back = host.querySelector("[data-back]");
    if (back) back.addEventListener("click", () => { step -= 1; render(); });
    const submit = host.querySelector("[data-submit]");
    if (submit) submit.addEventListener("click", () => {
      demoReq = RV.submitRequest(SAMPLE);
      step = 3;
      render();
    });
    const ack = host.querySelector("[data-ack]");
    if (ack) ack.addEventListener("click", () => {
      if (demoReq) RV.setStatus(demoReq.id, "acknowledged", "Jordan Hale (sample walkthrough)");
      step = 5;
      render();
    });
    modal.querySelector(".btn-primary, .btn-accent, [data-next], [data-submit], [data-ack]") && modal.focus();
  }

  startBtn.addEventListener("click", () => {
    step = 1;
    demoReq = null;
    render();
  });
})();
