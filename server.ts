import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // PayU Hash Generation
  app.post("/api/payu/hash", (req, res) => {
    const { txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 } = req.body;
    const key = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_MERCHANT_SALT;
    const payuEnv = process.env.PAYU_ENV || "test";
    const payuUrl = payuEnv === "prod" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment";

    if (!key || !salt) {
      return res.status(500).json({ error: "PayU credentials not configured" });
    }

    // Hash Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1 || ""}|${udf2 || ""}|${udf3 || ""}|${udf4 || ""}|${udf5 || ""}||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    res.json({ hash, key, payuUrl });
  });

  // PayU Response Handler (Success/Failure)
  app.post("/api/payu/response", (req, res) => {
    const payuResponse = req.body;
    const salt = process.env.PAYU_MERCHANT_SALT;

    // Verify Hash
    // Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const { status, udf1, udf2, udf3, udf4, udf5, email, firstname, productinfo, amount, txnid, key, hash: receivedHash } = payuResponse;
    const hashString = `${salt}|${status}||||||${udf5 || ""}|${udf4 || ""}|${udf3 || ""}|${udf2 || ""}|${udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");

    if (calculatedHash !== receivedHash) {
      // Hash mismatch - potential tampering
      return res.redirect(`/order-status?status=failed&reason=hash_mismatch&txnid=${txnid}`);
    }

    if (status === "success") {
      res.redirect(`/order-status?status=success&txnid=${txnid}&amount=${amount}`);
    } else {
      res.redirect(`/order-status?status=failed&txnid=${txnid}&reason=${payuResponse.error_Message || "payment_failed"}`);
    }
  });

  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = "https://toletbro.com";
    const today = new Date().toISOString().split('T')[0];
    
    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/search/hyderabad</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/scan</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about-us</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/list-property</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files from dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // SPA Fallback: Serve index.html for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
