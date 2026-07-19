import { expectedToken } from "./_auth.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }
  const body = req.body || {};
  const username = body.username;
  const password = body.password;
  const validUser = process.env.APP_USER;
  const validPass = process.env.APP_PASS;
  if (!validUser || !validPass) {
    res.status(500).json({ error: "Login no configurado" });
    return;
  }
  if (username === validUser && password === validPass) {
    const token = expectedToken();
    res.setHeader(
      "Set-Cookie",
      "vivero_auth=" + encodeURIComponent(token) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + (60 * 60 * 24 * 7)
    );
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ error: "Usuario o clave incorrectos" });
  }
}
