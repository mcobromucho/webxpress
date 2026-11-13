// WebXpress · crea una sesión de Stripe Checkout (sin librerías: usa fetch).
// Requiere la variable de entorno STRIPE_SECRET_KEY en Vercel (Project Settings > Environment Variables).
// Los precios viven AQUÍ, en el servidor, para que nadie pueda cambiarlos desde el navegador.
const ITEMS = {
  anticipo:   { name: "Anticipo de cita",       amount: 20000 }, // centavos: $200.00 MXN
  valoracion: { name: "Consulta de valoración", amount: 30000 },
  limpieza:   { name: "Limpieza dental",        amount: 65000 }
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: "Falta STRIPE_SECRET_KEY" });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  const item = ITEMS[body.item];
  if (!item) return res.status(400).json({ error: "Concepto no válido" });

  const site = process.env.SITE_URL || "https://iwebxpress.vercel.app";
  const p = new URLSearchParams({
    mode: "payment",
    success_url: `${site}/demos/dentista.html?pago=ok#pagar`,
    cancel_url: `${site}/demos/dentista.html#pagar`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "mxn",
    "line_items[0][price_data][unit_amount]": String(item.amount),
    "line_items[0][price_data][product_data][name]": item.name
  });
  if (/^\S+@\S+\.\S+$/.test(body.email || "")) p.set("customer_email", body.email);

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: p
  });
  const j = await r.json();
  if (!r.ok || !j.url) return res.status(502).json({ error: "Stripe no pudo crear el pago" });
  return res.status(200).json({ url: j.url });
};
