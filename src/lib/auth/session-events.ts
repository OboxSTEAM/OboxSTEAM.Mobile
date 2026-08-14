type AuthSessionListener = () => void;

const listeners = new Set<AuthSessionListener>();

/** Subscribe to forced logout when refresh fails or the session is no longer valid. */
export function onAuthSessionInvalidated(
  listener: AuthSessionListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitAuthSessionInvalidated(): void {
  for (const listener of listeners) {
    listener();
  }
}
