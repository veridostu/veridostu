import fetch from 'node-fetch';

export default async function handler(req, res) {
  const CLIENT_KEY = 'sbaw0l3nydig66h4mh';       // TikTok geliştirici panelinden al
  const CLIENT_SECRET = 'b6QKfBUtl3FViptahuhbsRF4u9Kny17k'; // TikTok geliştirici panelinden al
  const REDIRECT_URI = 'https://digitorya.com/social-media/oauth/callback/tiktok';

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
  });

  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // Access token, refresh token ve diğer veriler data.data içinde
    return res.status(200).json(data.data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
