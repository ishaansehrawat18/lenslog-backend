import crypto from "crypto";

// Generates a random token, plus its SHA-256 hash (for DB storage).
// We store only the hash and email only the raw token — same principle
// as password hashing: even a DB leak wouldn't expose usable tokens.
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};