import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const CLIENT_KEY = 'sbaw8lma7orsl3dfeg';
    const CLIENT_SECRET = 'Nb2JUZ3rOZmIyESBMpVE5ukKhbCzdlx0';
    const REDIRECT_URI = 'https://veridostu-veridostus-projects.vercel.app/api/oauth-callback';

    const { code, state } = req.query;

    const cookie = req.headers.cookie || '';
    const cookies = Object.fromEntries(cookie.split('; ').map(c => c.trim().split('=')));

    if (!state || state !== cookies.state) {
      return res.status(403).json({ error: 'Invalid state parameter' });
    }

    const codeVerifier = cookies.code_verifier;
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

    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = await tokenResponse.text();

    try {
      const data = JSON.parse(text);
      if (!tokenResponse.ok) {
        return res.status(tokenResponse.status).json(data);
      }

      return res.status(200).json(data.data);
    } catch (error) {
      return res.status(500).json({ error: 'Invalid JSON response', raw: text });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
