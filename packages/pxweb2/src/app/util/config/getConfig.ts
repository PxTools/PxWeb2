import { Config } from './configType';

// Extend the global Window interface to include PxWeb2Config
declare global {
  interface Window {
    PxWeb2Config: Config;
  }
}

export const getConfig = () => {
  return window.PxWeb2Config;
};
