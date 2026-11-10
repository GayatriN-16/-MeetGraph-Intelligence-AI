import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface StoredGoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp in ms
  scope?: string;
  email?: string;
  name?: string;
  picture?: string;
}

// In-memory state tracking for CSRF validation (state -> timestamp)
const activeOAuthStates = new Map<string, number>();

// Path to encrypted credentials file
const DATA_DIR = path.resolve(process.cwd(), '.data');
const TOKEN_FILE = path.join(DATA_DIR, 'google_tokens.enc');

// Derive 32-byte encryption key from environment or fallback seed
const ENCRYPTION_SECRET = process.env.TOKEN_ENCRYPTION_KEY || process.env.SESSION_SECRET || 'meetgraph-ai-enterprise-secret-key-32b';
const CIPHER_KEY = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

/**
 * Encrypt a string using AES-256-GCM with a random 12-byte IV.
 */
function encryptData(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', CIPHER_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  // Return iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string encrypted with AES-256-GCM.
 */
function decryptData(cipherText: string): string | null {
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', CIPHER_KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.warn('[GoogleAuthService] Decryption error:', err);
    return null;
  }
}

// In-memory cache for decrypted tokens
let cachedTokens: StoredGoogleTokens | null = null;

// Load stored tokens from disk if present
function loadStoredTokens(): StoredGoogleTokens | null {
  if (cachedTokens) return cachedTokens;
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const encrypted = fs.readFileSync(TOKEN_FILE, 'utf8');
      const decrypted = decryptData(encrypted);
      if (decrypted) {
        cachedTokens = JSON.parse(decrypted);
        return cachedTokens;
      }
    }
  } catch (err) {
    console.warn('[GoogleAuthService] Failed to load stored tokens:', err);
  }
  return null;
}

// Save tokens encrypted to disk
function saveTokens(tokens: StoredGoogleTokens | null): void {
  cachedTokens = tokens;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (tokens) {
      const encrypted = encryptData(JSON.stringify(tokens));
      fs.writeFileSync(TOKEN_FILE, encrypted, 'utf8');
    } else {
      if (fs.existsSync(TOKEN_FILE)) {
        fs.unlinkSync(TOKEN_FILE);
      }
    }
  } catch (err) {
    console.warn('[GoogleAuthService] Failed to save tokens to disk:', err);
  }
}

export const googleAuthService = {
  /**
   * Check if Google OAuth credentials are configured in environment
   */
  isConfigured(): boolean {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    return !!(clientId && clientSecret && clientId !== 'MY_GOOGLE_CLIENT_ID');
  },

  /**
   * Generate secure CSRF state token and OAuth 2.0 authorization URL
   */
  generateAuthUrl(): { url: string; state: string; configured: boolean } {
    const configured = this.isConfigured();
    const clientId = process.env.GOOGLE_CLIENT_ID || 'demo_google_client_id';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/google/callback';
    
    // Generate secure 32-byte hex state token
    const state = crypto.randomBytes(32).toString('hex');
    activeOAuthStates.set(state, Date.now());

    // Clean up states older than 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [s, ts] of activeOAuthStates.entries()) {
      if (ts < tenMinutesAgo) activeOAuthStates.delete(s);
    }

    const scopes = [
      'https://www.googleapis.com/auth/meetings.space.readonly',
      'https://www.googleapis.com/auth/meetings.space.created',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return { url, state, configured };
  },

  /**
   * Validate state token to protect against CSRF attacks
   */
  validateState(state: string): boolean {
    if (!state) return false;
    const createdAt = activeOAuthStates.get(state);
    if (!createdAt) return false;
    activeOAuthStates.delete(state);
    return Date.now() - createdAt < 10 * 60 * 1000; // Valid within 10 mins
  },

  /**
   * Exchange OAuth authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(code: string, state: string): Promise<StoredGoogleTokens> {
    if (!this.validateState(state)) {
      throw new Error('Invalid or expired OAuth state parameter (CSRF protection failed)');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/google/callback';

    // If client ID is missing or in sandbox mode, provide developer simulation
    if (!this.isConfigured()) {
      const simulatedTokens: StoredGoogleTokens = {
        accessToken: `simulated_google_token_${Date.now()}`,
        refreshToken: `simulated_refresh_token_${Date.now()}`,
        expiresAt: Date.now() + 3600 * 1000,
        scope: 'https://www.googleapis.com/auth/meetings.space.readonly',
        email: 'developer.workspace@meetgraph.ai',
        name: 'Workspace Engineer',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
      };
      saveTokens(simulatedTokens);
      return simulatedTokens;
    }

    // Call Google OAuth Token Endpoint
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Google token exchange failed (${tokenResponse.status}): ${errText}`);
    }

    const tokenData = await tokenResponse.json();
    const expiresInMs = (tokenData.expires_in || 3600) * 1000;

    // Fetch user profile info with the new access token
    let email = 'connected.user@meetgraph.ai';
    let name = 'Google Workspace User';
    let picture = '';

    try {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (userinfoRes.ok) {
        const userinfo = await userinfoRes.json();
        email = userinfo.email || email;
        name = userinfo.name || name;
        picture = userinfo.picture || picture;
      }
    } catch (e) {
      console.warn('[GoogleAuthService] Failed to fetch userinfo:', e);
    }

    const tokens: StoredGoogleTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + expiresInMs,
      scope: tokenData.scope,
      email,
      name,
      picture
    };

    saveTokens(tokens);
    return tokens;
  },

  /**
   * Connect with a verified developer account for sandbox testing
   */
  connectDeveloperAccount(email: string = 'executive.pilot@meetgraph.ai', name: string = 'Executive Host'): StoredGoogleTokens {
    const tokens: StoredGoogleTokens = {
      accessToken: `dev_access_token_${Date.now()}`,
      refreshToken: `dev_refresh_token_${Date.now()}`,
      expiresAt: Date.now() + 86400 * 1000,
      scope: 'https://www.googleapis.com/auth/meetings.space.readonly',
      email,
      name,
      picture: ''
    };
    saveTokens(tokens);
    return tokens;
  },

  /**
   * Retrieve a valid access token, auto-refreshing if expired
   */
  async getValidAccessToken(): Promise<string | null> {
    const tokens = loadStoredTokens();
    if (!tokens) return null;

    // If token is still valid (with 60-second buffer), return it
    if (Date.now() < tokens.expiresAt - 60000) {
      return tokens.accessToken;
    }

    // Attempt token refresh if refresh_token is available
    if (tokens.refreshToken && this.isConfigured()) {
      try {
        console.log('[GoogleAuthService] Refreshing expired Google access token...');
        const clientId = process.env.GOOGLE_CLIENT_ID || '';
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: tokens.refreshToken,
            grant_type: 'refresh_token'
          })
        });

        if (refreshRes.ok) {
          const refreshedData = await refreshRes.json();
          tokens.accessToken = refreshedData.access_token;
          tokens.expiresAt = Date.now() + (refreshedData.expires_in || 3600) * 1000;
          if (refreshedData.refresh_token) {
            tokens.refreshToken = refreshedData.refresh_token;
          }
          saveTokens(tokens);
          return tokens.accessToken;
        } else {
          console.warn('[GoogleAuthService] Token refresh rejected:', await refreshRes.text());
        }
      } catch (err) {
        console.error('[GoogleAuthService] Failed to refresh token:', err);
      }
    }

    // For simulated tokens, roll forward expiry
    if (tokens.accessToken.startsWith('simulated_') || tokens.accessToken.startsWith('dev_')) {
      tokens.expiresAt = Date.now() + 3600 * 1000;
      saveTokens(tokens);
      return tokens.accessToken;
    }

    return null;
  },

  /**
   * Return connection status and user details without exposing tokens
   */
  getConnectionStatus(): {
    connected: boolean;
    email?: string;
    name?: string;
    picture?: string;
    expiresAt?: number;
    configured: boolean;
  } {
    const tokens = loadStoredTokens();
    const configured = this.isConfigured();

    if (!tokens) {
      return { connected: false, configured };
    }

    return {
      connected: true,
      email: tokens.email,
      name: tokens.name,
      picture: tokens.picture,
      expiresAt: tokens.expiresAt,
      configured
    };
  },

  /**
   * Disconnect Google account and purge stored encrypted tokens
   */
  disconnect(): boolean {
    const tokens = loadStoredTokens();
    if (tokens && tokens.accessToken && this.isConfigured()) {
      // Best-effort revocation
      fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.accessToken}`, {
        method: 'POST'
      }).catch(() => {});
    }
    saveTokens(null);
    return true;
  }
};

