/**
 * Konverge AI — demo password gate
 * ================================
 *
 * Vercel Routing Middleware. It runs on Vercel before any page or file is
 * served, so the demo (and its code) stays hidden until the visitor enters
 * the password.
 *
 * Vercel finds this file because it is named middleware.js and sits beside
 * package.json. Do not move or rename it.
 *
 * Password
 *   Kdemo@123 by default. To change it without touching code, add an
 *   environment variable DEMO_PASSWORD in the Vercel project settings.
 *
 * After a correct password the browser keeps a cookie for 7 days, so the
 * visitor is not asked again on every page load.
 *
 * Note: this only runs on Vercel. `npm run dev` on your own computer opens
 * the demo without a password.
 */

const COOKIE = "kd_demo_access";
const LOGIN_PATH = "/__login";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const password = () => process.env.DEMO_PASSWORD || "Kdemo@123";

/** The cookie holds a hash of the password, never the password itself. */
async function passKey(value) {
  const bytes = new TextEncoder().encode(`${value}:konverge-demo-access`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares without leaking where two strings diverge. */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

function readCookie(request, name) {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

function loginPage(showError) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Direct Material Sourcing · Konverge.AI</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap">
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F6F8FB;color:#0B1F3A;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:24px 16px}
.card{width:100%;max-width:380px;background:#fff;border:1px solid #E6EAF0;border-radius:20px;padding:28px 26px;
  box-shadow:0 16px 45px rgba(11,31,58,.09)}
.logo{font-weight:900;font-size:26px;letter-spacing:-.8px;line-height:1}
.logo span{color:#FF6B2C}
.sol{font-size:12px;font-weight:700;color:#687384;margin:8px 0 22px}
label{display:block;font-size:11.5px;font-weight:700;margin-bottom:6px}
input{width:100%;border:1px solid #E6EAF0;border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;color:#0B1F3A}
input:focus{outline:none;border-color:#FF6B2C;box-shadow:0 0 0 3px rgba(255,107,44,.15)}
button{width:100%;margin-top:14px;border:1px solid #FF6B2C;background:#FF6B2C;color:#fff;font:inherit;font-weight:700;
  font-size:14px;border-radius:12px;padding:10px;cursor:pointer}
button:hover{background:#E85C20;border-color:#E85C20}
.err{background:#FEECEC;border:1px solid #FBD5D5;color:#9F3120;border-radius:10px;padding:9px 12px;font-size:12.5px;margin-bottom:14px}
.note{font-size:11px;color:#90A0AC;margin-top:16px;line-height:1.5}
</style></head>
<body><main class="card">
<div class="logo">Konverge<span>.AI</span></div>
<div class="sol">Direct Material Sourcing · V0 concept demo</div>
${showError ? '<div class="err" role="alert">That password didn’t work. Check it and try again.</div>' : ""}
<form method="post" action="${LOGIN_PATH}">
<label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
<button type="submit">Open demo</button>
</form>
<div class="note">Prototype on synthetic data. Ask your Konverge AI contact for the password.</div>
</main></body></html>`;
  return new Response(html, {
    status: 401,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const expected = await passKey(password());

  if (url.pathname === LOGIN_PATH && request.method === "POST") {
    let given = "";
    try {
      const form = await request.formData();
      given = String(form.get("password") || "");
    } catch {
      given = "";
    }
    if (!safeEqual(await passKey(given), expected)) return loginPage(true);
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/",
        "Set-Cookie": `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store"
      }
    });
  }

  const cookie = readCookie(request, COOKIE);
  if (cookie && safeEqual(cookie, expected)) return; // let the demo load

  return loginPage(false);
}

export const config = {
  // Every path, including the built JavaScript, so nothing loads before the password.
  matcher: ["/((?!favicon.ico|robots.txt).*)"]
};
