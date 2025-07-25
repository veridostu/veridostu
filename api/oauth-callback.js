import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const CLIENT_KEY = 'sbaw8lma7orsl3dfeg';
    const CLIENT_SECRET = 'Nb2JUZ3rOZmIyESBMpVE5ukKhbCzdlx0';
    const REDIRECT_URI = 'https://veridostu-veridostus-projects.vercel.app/api/oauth-callback';

    const { code, state } = req.query;
    const cookie = req.headers.cookie || '';
    const cookieMap = Object.fromEntries(cookie.split('; ').map(c => c.split('=')));

    if (!state || state !== cookieMap.state) {
      return res.status(403).json({ error: 'Invalid state parameter' });
    }

    const codeVerifier = cookieMap.code_verifier;
    if (!codeVerifier) {
      return res.status(400).json({ error: 'Missing code_verifier' });
    }

    const params = new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = await tokenRes.text();

    try {
      const json = JSON.parse(text);
      if (!tokenRes.ok) {
        return res.status(tokenRes.status).json(json);
      }
      // Burada token verisini döndür
      return res.status(200).json(json.data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON response', raw: text });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
