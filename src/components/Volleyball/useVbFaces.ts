import { useEffect, useSyncExternalStore } from "react";
import { VbFaceData, VolleyballService } from "../../_services/volleyballService";

// Faces for player rows. A table of fifty players asks for fifty faces; they
// are gathered for a moment and fetched together, in one call per hundred,
// and kept for the visit (a face does not change). Null is a player the API
// has no face for, so she is not asked about again.

const BATCH_WAIT_MS = 25;
const BATCH_SIZE = 100;

const faces = new Map<number, VbFaceData | null>();
const queued = new Set<number>();
const asking = new Set<number>();
const listeners = new Set<() => void>();
let timer = 0;

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const flush = () => {
  timer = 0;
  const ids = [...queued];
  queued.clear();
  for (let start = 0; start < ids.length; start += BATCH_SIZE) {
    const batch = ids.slice(start, start + BATCH_SIZE);
    batch.forEach((id) => asking.add(id));
    VolleyballService.getFaces(batch)
      .then((found) => {
        for (const id of batch) faces.set(id, found[String(id)] ?? null);
      })
      .catch(() => {
        // Left unknown: the next row to show her asks again.
      })
      .finally(() => {
        batch.forEach((id) => asking.delete(id));
        notify();
      });
  }
};

const request = (playerId: number) => {
  if (faces.has(playerId) || queued.has(playerId) || asking.has(playerId)) {
    return;
  }
  queued.add(playerId);
  if (!timer) timer = window.setTimeout(flush, BATCH_WAIT_MS);
};

/**
 * A player's face: undefined while it is being fetched, null when there is
 * none. Pass `enabled: false` to skip asking.
 */
export const useVbFace = (playerId: number | null | undefined, enabled = true) => {
  useEffect(() => {
    if (enabled && playerId) request(playerId);
  }, [playerId, enabled]);
  return useSyncExternalStore(subscribe, () =>
    enabled && playerId ? faces.get(playerId) : undefined,
  );
};
