# Rica Vista Tenant Help: how to plug in real texting

The demo never sends a real text. Every outgoing message goes through one function,
`sendPage(recipients, message, meta, onStatus)` in `app/texting.js`. In demo mode it
runs a simulator that fakes the carrier lifecycle (queued, sent, delivered, or failed).

## Steps
1. **Texting number.** Create a Twilio account, buy a local number (about $1.15/month),
   and register it for business texting (A2P 10DLC: about $20 once + $1.50/month).
   Messages cost about $0.0083 per SMS segment.
2. **Server endpoint.** Twilio keys must live on a server, never in the web page.
   A free Cloudflare Worker is enough:

```js
// POST /send  { to: ["+17078676741"], body: "...", requestId: "RV-1047" }
export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors() });
    const { to, body } = await req.json();
    const auth = "Basic " + btoa(env.TWILIO_SID + ":" + env.TWILIO_TOKEN);
    const results = [];
    for (const n of to) {
      const r = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_SID}/Messages.json`,
        { method: "POST",
          headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ To: n, From: env.TWILIO_FROM, Body: body }) });
      const j = await r.json();
      results.push({ to: n, sid: j.sid, status: j.status });
    }
    return Response.json({ results }, { headers: cors() });
  }
};
function cors() {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" };
}
```
   Lock it down before real use (shared secret header, rate limit, only allow numbers in the
   staff list), because anyone who finds the URL could otherwise send texts.
3. **Flip the switch.** In `app/texting.js` set `TEXTING.mode = "live"` and
   `TEXTING.endpoint = "https://<worker>/send"`. Nothing else in the app changes.
4. **Optional.** Point Twilio's status callback at the server for real delivered/failed
   updates; handle replies like `ACK 1047`; store requests in a small database
   (Cloudflare D1, Supabase free tier) so tenants and staff see the same inbox on every device.

Running cost for one building: about $5 to $15 a month.
