const SENPAI_IDB_NAME = "senpai_secure_store_v2";
const SENPAI_IDB_KEY_ID = "apiKeyEncKey";
let _senpaiCryptoKeyPromise: Promise<CryptoKey> | null = null;

function openSenpaiIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SENPAI_IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("keys");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getOrCreateCryptoKey(): Promise<CryptoKey> {
  if (_senpaiCryptoKeyPromise) return _senpaiCryptoKeyPromise;
  _senpaiCryptoKeyPromise = (async () => {
    try {
      const db = await openSenpaiIDB();
      const existing = await new Promise<CryptoKey | null>((resolve, reject) => {
        const tx = db.transaction("keys", "readonly");
        const req = tx.objectStore("keys").get(SENPAI_IDB_KEY_ID);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      if (existing) return existing;

      // generate non-extractable AES-GCM key
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("keys", "readwrite");
        tx.objectStore("keys").put(key, SENPAI_IDB_KEY_ID);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return key;
    } catch (err) {
      console.warn("IDB/Crypto not available, generating ephemeral key for session:", err);
      return crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    }
  })();
  return _senpaiCryptoKeyPromise;
}

export async function encryptText(text: string): Promise<string> {
  if (!text) return "";
  try {
    const key = await getOrCreateCryptoKey();
    const data = new TextEncoder().encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error("encryptText failed, using base64 fallback:", err);
    return btoa(encodeURIComponent(text));
  }
}

export async function decryptText(enc: string): Promise<string> {
  if (!enc) return "";
  try {
    const key = await getOrCreateCryptoKey();
    const combined = Uint8Array.from(atob(enc), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    try {
      return decodeURIComponent(atob(enc));
    } catch (_) {
      return "";
    }
  }
}
