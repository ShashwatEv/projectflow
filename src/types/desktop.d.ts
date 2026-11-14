export {};

declare global {
  interface Window {
    projectFlowDesktop?: {
      isDesktop: boolean;
      openExternal: (url: string) => Promise<void>;
      onAuthCallback: (listener: (url: string) => void) => () => void;
    };
  }
}
