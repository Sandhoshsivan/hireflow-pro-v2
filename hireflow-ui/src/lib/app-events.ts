/**
 * Simple pub/sub event bus for cross-component cache invalidation.
 * When any CRUD operation mutates applications, it fires 'applications-changed'.
 * Sidebar, Dashboard, Pipeline, Analytics etc. all subscribe and refetch.
 */

type Listener = () => void;

const listeners: Record<string, Set<Listener>> = {};

export function emit(event: string) {
  listeners[event]?.forEach((fn) => fn());
}

export function on(event: string, fn: Listener): () => void {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(fn);
  return () => {
    listeners[event].delete(fn);
  };
}

// Convenience constants
export const APP_CHANGED = 'applications-changed';
