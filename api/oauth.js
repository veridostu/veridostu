import crypto from 'crypto';

export default function handler(req, res) {
  const CLIENT_KEY = 'sbaw8lma7orsl3dfeg';
  const REDIRECT_URI = 'https://veridostu-veridostus-projects.vercel.app/api/oauth-callback';

  // PKCE için code_verifier oluştur
  const codeVerifier = crypto.randomBytes(32).toString('base64url');

  // code_challenge hesapla (SHA256 ve base64url)
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // CSRF koruması için state oluştur
  const state = crypto.randomBytes(16).toString('hex');

  // Cookie olarak sakla (HttpOnly, 10 dakika)
  res.setHeader('Set-Cookie', [
    `code_verifier=${codeVerifier}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`,
    `state=${state}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`,
  ]);

  // TikTok authorize URL parametreleri (redirect_uri sadece callback URL, parametresiz)
  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const url = `https://www.tiktok.com/auth/authorize/?${params.toString()}`;

  // Kullanıcıyı TikTok login sayfasına yönlendir
  res.redirect(url);
}
