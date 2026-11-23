// Compass Seed Diagnostic -> Baserow (Schooler Ventures CRM > Contacts).
// Netlify Function (v2). The Baserow token lives ONLY in Netlify env vars; nothing secret is in the page.
// Env vars (set in Netlify > Site configuration > Environment variables):
//   BASEROW_TOKEN     required. A Baserow *database token* with "create" permission on the Contacts table only.
//   BASEROW_TABLE_ID  optional, default 1279234 (Contacts).
//   BASEROW_URL       optional, default https://api.baserow.io
//   ALLOWED_ORIGINS   optional, comma list, default https://leadershipduplicationsystem.com,https://www.leadershipduplicationsystem.com,https://living-compass.netlify.app
const SOURCE_WEBSITE = 8535727;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const clean = (v, n = 200) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n);
const cleanLong = (v, n = 4000) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, n);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "method" });
  const allowed = (process.env.ALLOWED_ORIGINS || "https://leadershipduplicationsystem.com,https://www.leadershipduplicationsystem.com,https://living-compass.netlify.app").split(",").map((s) => s.trim());
  const origin = req.headers.get("origin");
  if (origin && !allowed.includes(origin)) return json(403, { ok: false, error: "origin" });
  const token = process.env.BASEROW_TOKEN;
  if (!token) return json(503, { ok: false, error: "not configured" });
  const base = (process.env.BASEROW_URL || "https://api.baserow.io").replace(/\/+$/, "");
  const table = process.env.BASEROW_TABLE_ID || "1279234";

  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: "body" }); }
  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const phone = clean(body.phone, 40).replace(/[^0-9+()\-. x]/g, "");
  if (!name || !EMAIL.test(email) || phone.replace(/\D/g, "").length < 7) return json(400, { ok: false, error: "fields" });

  const parts = String(name).split(/\s+/);
  const first = parts[0] || "";
  const last = parts.slice(1).join(" ");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const answers = Array.isArray(body.answers) ? body.answers : [];
  const detail = answers.map((a) => `${clean(a.prompt, 120)}: ${clean((a.picked || []).join("; "), 400)}`).filter(Boolean).join("\n");
  const seed = cleanLong(body.seed);
  const notes = `Compass Seed Diagnostic, ${today}\n${seed}${detail ? `\n\n${detail}` : ""}`.slice(0, 4000);
  const row = {
    "First name": first,
    "Last name": clean(last),
    "Email": email,
    "Phone": phone,
    "Source": SOURCE_WEBSITE,
    "Last contact date": today,
    "Their note": cleanLong(body.words),
    "Notes": notes,
  };
  const r = await fetch(`${base}/api/database/rows/table/${encodeURIComponent(table)}/?user_field_names=true`, {
    method: "POST",
    headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });
  if (!r.ok) { console.error("baserow row failed", r.status, (await r.text()).slice(0, 300)); return json(502, { ok: false, error: "save" }); }
  return json(200, { ok: true });
};
