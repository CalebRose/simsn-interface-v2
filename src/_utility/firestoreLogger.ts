/**
 * Lightweight Firestore read logger — development only.
 *
 * Call logFirestoreRead() after every getDocs / getDoc / onSnapshot delivery
 * to track exactly how many documents are being read and from where.
 * The session total resets on page reload.
 */

let _sessionReadCount = 0;

export function logFirestoreRead(operation: string, docCount: number): void {
  if (import.meta.env.MODE !== "development") return;
  _sessionReadCount += docCount;
  console.log(
    `%c[Firestore Read]%c ${operation} — ${docCount} doc${docCount !== 1 ? "s" : ""}  ·  session total: ${_sessionReadCount}`,
    "color: #34d399; font-weight: bold;",
    "color: inherit;",
  );
}

export function resetFirestoreReadCount(): void {
  _sessionReadCount = 0;
}
