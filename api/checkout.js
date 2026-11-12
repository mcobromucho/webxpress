// WebXpress · Vercel Serverless Function para crear sesiones de Stripe Checkout.
// Requiere STRIPE_SECRET_KEY en las variables de entorno de Vercel.
// Los precios se definen en el servidor para impedir que el navegador los manipule.
const ITEMS = {
  anticipo:   { name: "Anticipo de cita",       amount: 20000 },
  valoracion: { name: "Consulta de valoración", amount: 30000 },
  limpieza:   { name: "Limpieza dental",        amount: 65000 }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return res.status(500).json({ error: "Falta STRIPE_SECRET_KEY" });
  }

  // Vercel normalmente entrega req.body ya parseado; se admite también texto JSON.
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = {};
    }
  }

  const item = ITEMS[body.item];
  if (!item) {
    return res.status(400).json({ error: "Concepto no válido" });
  }

  // SITE_URL es la opción recomendada para fijar el dominio público.
  // VERCEL_URL no incluye protocolo; URL se conserva como compatibilidad con Netlify.
  const site = (
    process.env.SITE_URL ||
    process.env.URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://webxpress3.netlify.app")
  ).replace(/\/+$/, "");

  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${site}/demos/dentista.html?pago=ok#pagar`,
    cancel_url: `${site}/demos/dentista.html#pagar`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "mxn",
    "line_items[0][price_data][unit_amount]": String(item.amount),
    "line_items[0][price_data][product_data][name]": item.name
  });

  if (/^\S+@\S+\.\S+$/.test(body.email || "")) {
    params.set("customer_email", body.email);
  }

  try {
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    const result = await stripeResponse.json();
    if (!stripeResponse.ok || !result.url) {
      console.error("Stripe Checkout error:", result.error?.message || stripeResponse.status);
      return res.status(502).json({ error: "Stripe no pudo crear el pago" });
    }

    return res.status(200).json({ url: result.url });
  } catch (error) {
    console.error("Error al conectar con Stripe:", error);
    return res.status(502).json({ error: "No se pudo conectar con Stripe" });
  }
}
