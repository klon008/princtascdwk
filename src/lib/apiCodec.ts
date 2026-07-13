/**
 * Расшифровка параметра &api= (AES-256-GCM, совместимо с bot/cards/album_token.py).
 */

function b64urlDecode(data: string): Uint8Array {
  const pad = "=".repeat((4 - (data.length % 4)) % 4);
  const bin = atob((data + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "decrypt",
  ]);
}

export async function decodeApiParam(
  encoded: string,
  secret: string,
): Promise<string | null> {
  if (!encoded || !secret) return null;
  try {
    const raw = b64urlDecode(encoded);
    if (raw.length < 13) return null;
    const nonce = raw.slice(0, 12);
    const ciphertext = raw.slice(12);
    const key = await deriveKey(secret);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(plain).replace(/\/$/, "");
  } catch {
    return null;
  }
}

export const DEV_API_BASE = "http://127.0.0.1:18770";

export async function resolveApiBase(
  apiParam: string | null,
  secret: string,
): Promise<string> {
  if (apiParam) {
    const decoded = await decodeApiParam(apiParam, secret);
    if (decoded) return decoded;
  }
  if (import.meta.env.DEV) return DEV_API_BASE;
  return "";
}
