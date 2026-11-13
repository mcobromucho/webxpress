# Conectar el pago con tarjeta a Stripe (demo Dentsmile)

Hoy la pestaña **Pagar** es una simulación: no mueve dinero, no guarda datos y solo acepta tarjetas de prueba
(`4242 4242 4242 4242` aprueba · `4000 0000 0000 0002` rechaza). Para cobrar de verdad hay dos caminos.

## Camino A · Links de pago (el más rápido, ~10 min, sin código de servidor)
1. Crea tu cuenta en stripe.com y activa tu cuenta (datos del negocio y bancarios).
2. Panel de Stripe > **Payment Links** > crea un link por concepto (Anticipo $200, Valoración $300, Limpieza $650, moneda MXN).
   En cada link, en "After payment", pon como redirección: `https://TU-SITIO/demos/dentista.html?pago=ok#pagar`
3. Abre `demos/stripe.js` y pega los links arriba:
   ```js
   links: { anticipo: "https://buy.stripe.com/...", valoracion: "https://buy.stripe.com/...", limpieza: "https://buy.stripe.com/..." },
   ```
   Con eso, la página oculta los campos de tarjeta y el botón manda al pago seguro de Stripe. Funciona publicando el proyecto en Vercel como siempre.

## Camino B · Stripe Checkout con función de Vercel (precios controlados por tu servidor)
1. Sube el proyecto a Vercel con Git o con Vercel CLI (la carpeta `api/` incluye `checkout.js`).
2. Vercel > Project > Settings > Environment Variables: agrega `STRIPE_SECRET_KEY` (empieza con `sk_test_` para probar y `sk_live_` para cobrar).
3. En `demos/stripe.js` pon: `endpoint: "/api/checkout"`.
4. Después de agregar la variable, haz un nuevo deploy (Vercel solo la lee en deploys nuevos).
5. Prueba primero en modo de prueba de Stripe y luego cambia a la llave `sk_live_`.

## Importante
- Nunca pongas la llave secreta (`sk_...`) dentro de un archivo .html o .js del sitio; solo en variables de entorno.
- La tarjeta la captura Stripe en su página: tu sitio nunca toca los datos de la tarjeta.
- Para confirmar citas de forma automática (no solo mostrar "pago recibido") se necesita un webhook de Stripe: se cotiza aparte.
