export async function basicCredentialsAccepted(request, expected) {
  if (!expected || expected.length < 24) return false;
  const supplied = request.headers.get("Authorization") || "";
  if (!supplied.startsWith("Basic ") || supplied.length > 1024) return false;

  let decoded;
  try { decoded = atob(supplied.slice(6)); }
  catch { return false; }

  const [actualHash, expectedHash] = await Promise.all([
    sha256(decoded),
    sha256(`analytics:${expected}`)
  ]);
  let difference = 0;
  for (let index = 0; index < expectedHash.length; index += 1) {
    difference |= actualHash[index] ^ expectedHash[index];
  }
  return difference === 0;
}

export async function rateLimitAccepted(binding, key) {
  if (!binding?.limit) return false;
  const result = await binding.limit({ key });
  return result.success === true;
}

export function requestClientKey(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown-client";
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return new Uint8Array(digest);
}
