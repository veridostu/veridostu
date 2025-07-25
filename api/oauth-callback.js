import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const clientKey = 'sbaw8lma7orsl3dfeg';
    const clientSecret = 'Nb2JUZ3rOZmIyESBMpVE5ukKhbCzdlx0';
    const redirectUri = 'https://veridostu-veridostus-projects.vercel.app/api/oauth-callback';

    const { code, state } = req.query;

    const cookie = req.headers.cookie || '';
    const cookies = Object.fromEntries(cookie.split('; ').map(c => c.split('=')));

    if (!state || state !== cookies.state) {
      return res.status(403).json({ error: 'Invalid state parameter' });
    }

    const codeVerifier = cookies.code_verifier;
    if (!codeVerifier) {
      return res.status(400).json({ error: 'Missing code_verifier' });
    }

    // Token isteği için parametreler
    const params = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
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

      // Access token ve diğer bilgiler burada
      return res.status(200).json(data.data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON response', raw: text });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
