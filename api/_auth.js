import crypto from "crypto";

export function expectedToken() {
  const user = process.env.APP_USER || "";
  const pass = process.env.APP_PASS || "";
  return crypto.createHash("sha256").update(user + ":" + pass).digest("hex");
}

export function isAuthorized(req) {
  const user = process.env.APP_USER;
  const pass = process.env.APP_PASS;
  if (!user || !pass) return false;
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)vivero_auth=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  return !!token && token === expectedToken();
}
