import { createContext, useContext, useState, ReactNode } from "react";

interface PrivacyContextType {
  privacyMode: boolean;
  togglePrivacy: () => void;
  maskValue: (formatted: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  privacyMode: false,
  togglePrivacy: () => {},
  maskValue: (v) => v,
});

export const usePrivacy = () => useContext(PrivacyContext);

export const PrivacyProvider = ({ children }: { children: ReactNode }) => {
  const [privacyMode, setPrivacyMode] = useState(false);

  const togglePrivacy = () => setPrivacyMode((p) => !p);

  const maskValue = (formatted: string) => {
    if (!privacyMode) return formatted;
    // Replace digits with * but keep currency prefix and sign
    return formatted.replace(/[\d.,]+/g, "****");
  };

  return (
    <PrivacyContext.Provider value={{ privacyMode, togglePrivacy, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  );
};
