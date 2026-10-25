
const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 10
}));

app.post("/api/message", async (req, res) => {
  const { message } = req.body || {};


  if (typeof message !== "string" ||
      !message.trim() ||
      message.length > 1500) {
    return res.status(400).json({
      error: "Message invalide (1 à 1500 caractères)."
    });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    return res.status(500).json({
      error: "Le serveur Discord n'est pas configuré."
    });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "**Nouveau message du site**\n" + message.trim(),
        allowed_mentions: { parse: [] }
      })
    });

    if (!response.ok) throw new Error("Discord webhook error");

    res.json({ success: true });
  } catch {
    res.status(502).json({
      error: "Impossible d'envoyer le message à Discord."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Serveur démarré sur le port " + PORT);
});
