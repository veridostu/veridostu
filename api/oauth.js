import crypto from 'crypto';

export default function handler(req, res) {
  const clientKey = 'sbaw8lma7orsl3dfeg';
  const redirectUri = 'https://veridostu-veridostus-projects.vercel.app/api/oauth-callback';

  // PKCE için code_verifier oluştur
  const codeVerifier = crypto.randomBytes(32).toString('base64url');

  // code_challenge (SHA256 base64url)
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // CSRF koruması için state oluştur
  const state = crypto.randomBytes(16).toString('hex');

  // Cookie'leri set et (HttpOnly, secure ayarla production'da)
  res.setHeader('Set-Cookie', [
    `code_verifier=${codeVerifier}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`,
    `state=${state}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`,
  ]);

  // TikTok OAuth authorize URL parametreleri
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://www.tiktok.com/auth/authorize/?${params.toString()}`;

  res.redirect(authUrl);
}
