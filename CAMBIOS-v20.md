# WebXpress v20: migración de Netlify a Vercel
- Dominio cambiado a iwebxpress.vercel.app (canonical, OG, schema, sitemap, robots, llms.txt, demos y función de Stripe).
- `_headers` (Netlify) reemplazado por `vercel.json` con los mismos encabezados de seguridad (CSP, HSTS, etc.) y caché.
- `netlify/functions/checkout.js` movido a `api/checkout.js` (formato Vercel). Endpoint nuevo: `/api/checkout`. Variable opcional `SITE_URL` para el dominio de retorno de Stripe.
- Aviso de privacidad: proveedor de alojamiento ahora dice Vercel.
- Sin cambios: diseño, textos, demos, imágenes. El enlace a ai-optima.netlify.app (analizador) se dejó igual porque es otro sitio.

## Actualización de paquetes y precios
- Paquetes: Página Web Esencial $2,500 · Negocio · Ventas y Citas $4,500 · Todo Incluido · Sistema 24/7 $6,900 (pago único), con sus textos, "para quién es" y botones propios.
- Encabezado con subtítulo, condiciones de pago (50% / 50%) y nota de dominio propio.
- "Complementos" ahora es "Servicios adicionales" (10 servicios, precio por cotizar).
- Eliminado el texto "Ejemplo sencillo · se personaliza al 100%" de "Mira cómo se vería tu página".
- Coherencia: FAQ, datos estructurados (schema.org), llms.txt, noscript y calculadora de entrega.
- Sin cambios: diseño, interfaz, demos e imágenes.
