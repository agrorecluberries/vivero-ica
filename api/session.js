import { isAuthorized } from "./_auth.js";

export default function handler(req, res) {
  res.status(200).json({ ok: isAuthorized(req) });
}
