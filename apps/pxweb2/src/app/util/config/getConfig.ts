import { Config } from './configType';
export const getConfig = () => {
  return (window as any).PxWeb2Config as Config;
};
