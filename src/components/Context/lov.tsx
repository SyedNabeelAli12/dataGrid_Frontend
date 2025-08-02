
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchLOVs } from "../../services/lovApi";
import { LOVData,LOVContextType } from '../../types/types';



const LOVContext = createContext<LOVContextType | undefined>(undefined);

export const LOVProvider = ({ children }: { children: ReactNode }) => {
  const [lovs, setLovs] = useState<LOVData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLOVs = async () => {
      try {
        const data = await fetchLOVs();
        setLovs(data);
      } catch (error) {
        console.error("Failed to fetch LOVs", error);
        
      } finally {
        setLoading(false);
      }
    };

    getLOVs();
  }, []);

  return (
    <LOVContext.Provider value={{ lovs, loading }}>
      {children}
    </LOVContext.Provider>
  );
};

export const useLOVs = () => {
  const context = useContext(LOVContext);
  if (context === undefined) {
    throw new Error("useLOVs must be used within a LOVProvider");
  }
  return context;
};
