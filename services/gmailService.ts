import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const googleAuthInstance = getAuth(app);

export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGmailAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(googleAuthInstance, async (gUser: User | null) => {
    if (gUser) {
      if (cachedAccessToken) {
        if (onSuccess) onSuccess(gUser, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onFailure) onFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onFailure) onFailure();
    }
  });
};

export const googleGmailSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(googleAuthInstance, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Gmail Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGmailAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const gmailLogout = async () => {
  await signOut(googleAuthInstance);
  cachedAccessToken = null;
};

export const sendGmailEmail = async ({
  to,
  subject,
  bodyHtml,
}: {
  to: string;
  subject: string;
  bodyHtml: string;
}): Promise<boolean> => {
  const token = await getGmailAccessToken();
  if (!token) {
    throw new Error('Access token is missing. Please sign in with Google.');
  }

  // Construct RFC 822 formatted raw email matching UTF-8
  const headerLines = [
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `To: ${to}`,
    `Subject: ${subject}`,
    ``,
    bodyHtml
  ];

  const rawMail = headerLines.join('\r\n');
  
  // Base64url safe encode
  const encodedMail = btoa(unescape(encodeURIComponent(rawMail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMail,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send mail via Gmail API:', errorText);
    throw new Error(`Gmail API error: ${response.status} - ${errorText}`);
  }

  return true;
};
