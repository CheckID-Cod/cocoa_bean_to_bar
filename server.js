const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Contact form endpoint ────────────────────────────────────────────────────
app.post('/send-email', async (req, res) => {
  const { to, reply_to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  const from = 'Motte Chocolat <noreply@mottechocolat.com>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, reply_to, subject, html })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json({ id: data.id });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── Fallback : serve index.html ──────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Motte Chocolat server running on port ${PORT}`);
});
