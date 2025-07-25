// api/oauth-callback.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
  const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
  const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;

  const { code, state } = req.query;
  const cookie = req.headers.cookie || '';
  const cookieMap = Object.fromEntries(cookie.split('; ').map(c => c.split('=')));

  if (state !== cookieMap.state) {
    return res.status(403).send('Invalid state parameter');
  }

  const codeVerifier = cookieMap.code_verifier;
  if (!codeVerifier) {
    return res.status(400).send('Missing code_verifier');
  }

  const body = new URLSearchParams({
    client_key: CLIENT_KEY,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const json = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json(json);
    }

    res.status(200).json(json.data); // token ve user info dönecek
  } catch (err) {
    console.error(err);
    res.status(500).send('OAuth error');
  }
}
