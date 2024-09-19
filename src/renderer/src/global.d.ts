export {};

declare global {
  interface Window {
    // Expose some Api through preload script
    ipc: {
      send: (event: string, payload?: any) => void;
      on: (
        event: K,
        callback: (event: K, payload: EventMap[K]) => void
      ) => void;
    };
    removeLoading: () => void;
  }
}
