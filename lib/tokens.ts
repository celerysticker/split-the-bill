import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no 0/O/1/l/I) since the public id sometimes gets
// read aloud or typed by hand off a phone screen.
const idAlphabet = "23456789abcdefghjkmnpqrstuvwxyz";

/**
 * Short public split id, e.g. "k7m2p9qr". Not a secret — collisions are
 * possible at scale, so callers should retry on a unique-constraint error.
 */
export function generateSplitId(): string {
  return customAlphabet(idAlphabet, 8)();
}

/**
 * Long, cryptographically random edit token. This is the only credential
 * in the app — see the tech spec, section 5 — so it uses nanoid's default
 * (crypto-secure) generator at a length that's infeasible to guess.
 */
export function generateEditToken(): string {
  return customAlphabet(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    32,
  )();
}
