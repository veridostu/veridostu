import crypto from 'crypto';

export default async function handler(req, res) {
  const CLIENT_KEY = 'sbaw8lma7orsl3dfeg';
  const REDIRECT_URI = 'https://veridostu-veridostus-projects.vercel.app/api/oauth-callback';

  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  res.setHeader('Set-Cookie', [
    `state=${state}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`,
    `code_verifier=${codeVerifier}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`,
  ]);

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  res.redirect(authUrl);
}
