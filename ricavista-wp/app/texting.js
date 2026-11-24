/* =====================================================================
   RICA VISTA TENANT HELP: TEXTING ADAPTER
   ---------------------------------------------------------------------
   Every outgoing text in the app goes through sendPage(). Nothing else
   sends messages. In this demo, TEXTING.mode is "simulated", so no real
   SMS is sent and no network request is made.

   To switch to real texting later:
   1. Deploy the small server endpoint described in /ricavista-wp/PLUG-IN-TEXTING.md
      (it holds the Twilio credentials and calls Twilio's Messages API).
   2. Set TEXTING.mode = "live" and TEXTING.endpoint = "https://<your-endpoint>/send".
   3. Optional: point Twilio's status callback at the same server so
      "sent / delivered / failed" come back from the carrier and not the simulator.
   Never put Twilio credentials in this file. It runs in the browser.
   ===================================================================== */
(function (global) {
  var TEXTING = {
    mode: "simulated",          // "simulated" | "live"
    endpoint: "",               // e.g. "https://ricavista-texting.example.workers.dev/send"
    fromNumber: "+1 (707) 867-6741 (demo sender)"  // the building's texting number once one is bought
  };

  /**
   * sendPage(recipients, message, meta, onStatus)
   *  recipients: [{ name, role, phone }]  (phone in any format)
   *  message:    string (the text body)
   *  meta:       { requestId, kind }  passed through for logging
   *  onStatus:   function(update) called with { to, sid, status, at, error }
   *              status runs queued -> sent -> delivered (or failed)
   *  returns Promise<[{ to, sid, status }]>
   */
  function sendPage(recipients, message, meta, onStatus) {
    var numbers = uniqueNumbers(recipients);

    if (TEXTING.mode === "live") {
      /* ---- SWAP-IN POINT: real texting through your own server ----
         The server receives { to: ["+17075551234", ...], body, requestId }
         and calls Twilio once per number. See PLUG-IN-TEXTING.md. */
      return fetch(TEXTING.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: numbers, body: message, requestId: meta && meta.requestId, kind: meta && meta.kind })
      }).then(function (r) { return r.json(); }).then(function (j) {
        (j.results || []).forEach(function (x) { onStatus && onStatus({ to: x.to, sid: x.sid, status: x.status || "queued", at: Date.now() }); });
        return j.results || [];
      });
    }

    /* ---- SIMULATOR (demo mode): fakes the carrier lifecycle ---- */
    return Promise.resolve(numbers.map(function (to, i) {
      var sid = "SM" + randHex(32);
      var valid = /^\+1\d{10}$/.test(to);
      var base = 350 + i * 250;
      var at = Date.now();
      onStatus && onStatus({ to: to, sid: sid, status: "queued", at: at });
      setTimeout(function () { onStatus && onStatus({ to: to, sid: sid, status: valid ? "sent" : "failed", at: Date.now(), error: valid ? null : "Invalid phone number (simulated error 21211)" }); }, base + 700);
      if (valid) setTimeout(function () { onStatus && onStatus({ to: to, sid: sid, status: "delivered", at: Date.now() }); }, base + 2000);
      return { to: to, sid: sid, status: "queued" };
    }));
  }

  function toE164(phone) {
    var d = String(phone || "").replace(/\D/g, "");
    if (d.length === 11 && d[0] === "1") d = d.slice(1);
    return d.length ? "+1" + d : "";
  }

  function uniqueNumbers(recipients) {
    var out = [];
    (recipients || []).forEach(function (r) {
      var n = toE164(r.phone);
      if (n && out.indexOf(n) === -1) out.push(n);
    });
    return out;
  }

  function randHex(n) {
    var s = "";
    for (var i = 0; i < n; i++) s += "0123456789abcdef"[Math.floor(Math.random() * 16)];
    return s;
  }

  /* SMS segments: 160 chars (GSM-7) or 70 (Unicode); multipart 153 / 67. */
  function segments(text) {
    var gsm = /^[\x0A\x0D\x20-\x7E£¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ¤¡ÄÖÑÜ§¿äöñüà€\^{}\[~\]|\\]*$/.test(text);
    var len = text.length;
    if (gsm) return len <= 160 ? 1 : Math.ceil(len / 153);
    return len <= 70 ? 1 : Math.ceil(len / 67);
  }

  global.RVText = { TEXTING: TEXTING, sendPage: sendPage, toE164: toE164, uniqueNumbers: uniqueNumbers, segments: segments };
})(window);
