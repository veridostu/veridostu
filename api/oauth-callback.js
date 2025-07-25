export default async function handler(req, res) {
  try {
    const CLIENT_KEY = 'sbaw8lma7orsl3dfeg';
    const CLIENT_SECRET = 'Nb2JUZ3rOZmIyESBMpVE5ukKhbCzdlx0';
    const REDIRECT_URI = 'https://veridostu-veridostus-projects.vercel.app/api/oauth-callback';

    const { code, state } = req.query;

    // Cookie'den state ve code_verifier oku
    const cookie = req.headers.cookie || '';
    const cookieMap = Object.fromEntries(cookie.split('; ').map(c => c.split('=')));

    if (!state || state !== cookieMap.state) {
      return res.status(403).send('Invalid state parameter');
    }

    const codeVerifier = cookieMap.code_verifier;
    if (!codeVerifier) {
      return res.status(400).send('Missing code_verifier');
    }

    // Token alma için body hazırla
    const body = new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    // TikTok token endpoint'ine POST isteği yap
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const text = await tokenRes.text();

    // Gelen cevabı JSON parse et ve hata kontrolü yap
    try {
      const json = JSON.parse(text);
      if (!tokenRes.ok) {
        return res.status(tokenRes.status).json(json);
      }
      // Başarılı token bilgilerini döndür
      return res.status(200).json(json.data);
    } catch (parseError) {
      console.error('TikTok JSON parse error:', text);
      return res.status(500).json({ error: 'Invalid JSON response from TikTok', raw: text });
    }

  } catch (error) {
    console.error('Internal server error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
