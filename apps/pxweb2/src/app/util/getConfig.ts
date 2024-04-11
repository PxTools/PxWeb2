import { Config } from '../../../public/config/configType';
export const getConfig = () => {
  return (window as any).PxWeb2Config as Config;
};
