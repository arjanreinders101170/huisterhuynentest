/* ═══ PII normalization & hashing for Meta CAPI ═══
 * Meta requires SHA-256 hex of normalized lowercase values for em/ph/fn/ln/country.
 * client_ip_address and client_user_agent are sent in clear (Meta hashes server-side).
 */

import crypto from "node:crypto";

const sha256Hex = (s: string): string => crypto.createHash("sha256").update(s).digest("hex");

const trimLower = (s: string): string => s.trim().toLowerCase();

export function hashEmail(email?: string): string | undefined {
  if (!email) return undefined;
  return sha256Hex(trimLower(email));
}

export function hashPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  /* Meta wants digits only, no leading + */
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  return sha256Hex(digits);
}

export function hashName(name?: string): string | undefined {
  if (!name) return undefined;
  return sha256Hex(trimLower(name));
}

export function hashCountry(country?: string): string | undefined {
  if (!country) return undefined;
  return sha256Hex(country.trim().toLowerCase());
}

export function hashExternalId(id?: string): string | undefined {
  if (!id) return undefined;
  return sha256Hex(id);
}
