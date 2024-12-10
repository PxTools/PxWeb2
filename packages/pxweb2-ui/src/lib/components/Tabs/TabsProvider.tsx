//Adapted from: Juliana Godoy Viana, a11ytabs (MIT licensed, original copyright notice included in copyright_notice.txt)
//Modification: Merged together code from TabsContext.tsx and TabContainer.tsx to TabsProvider.tsx
import { createContext, ReactNode, Dispatch, SetStateAction } from 'react';

interface TabContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabContext = createContext<TabContextType>({
  activeTab: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setActiveTab: (_id: string) => {},
});

interface TabProviderProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

const TabsProvider: React.FC<TabProviderProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

export { TabContext, TabsProvider };
