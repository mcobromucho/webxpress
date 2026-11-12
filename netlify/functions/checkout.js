// WebXpress · crea una sesión de Stripe Checkout (sin librerías: usa fetch).
// Requiere la variable de entorno STRIPE_SECRET_KEY en Netlify (Site configuration > Environment variables).
// Los precios viven AQUÍ, en el servidor, para que nadie pueda cambiarlos desde el navegador.
const ITEMS = {
  anticipo:   { name: "Anticipo de cita",       amount: 20000 }, // centavos: $200.00 MXN
  valoracion: { name: "Consulta de valoración", amount: 30000 },
  limpieza:   { name: "Limpieza dental",        amount: 65000 }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: "Falta STRIPE_SECRET_KEY" }) };

  let body = {}; try { body = JSON.parse(event.body || "{}"); } catch (_) {}
  const item = ITEMS[body.item];
  if (!item) return { statusCode: 400, body: JSON.stringify({ error: "Concepto no válido" }) };

  const site = process.env.URL || "https://webxpress3.netlify.app";
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
  if (!r.ok || !j.url) return { statusCode: 502, body: JSON.stringify({ error: "Stripe no pudo crear el pago" }) };
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: j.url }) };
};
