import { createContext } from "react";

// Isolated from DMContext.tsx so that HMR updates to the provider/hooks file
// do not create a new context object (which would break useContext matching).
export interface DMContextShape {
  // Intentionally opaque here — the full interface lives in DMContext.tsx.
  // Using `unknown` so callers must use the typed useDMStore hook.
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DMContext = createContext<any>(null);
