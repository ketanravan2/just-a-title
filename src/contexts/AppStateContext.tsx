import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Serial } from '@/types/serial';
import { ASNHierarchy } from '@/types/asn';
import { mockSerials } from '@/data/mockData';
import { mockASNHierarchy } from '@/data/asnMockData';

interface AppStateContextType {
  serials: Serial[];
  asnHierarchy: ASNHierarchy;
  updateSerials: (serials: Serial[]) => void;
  assignSerials: (
    serialIds: string[], 
    targetId: string, 
    targetType: 'item' | 'lot' | 'package',
    isTemporary?: boolean
  ) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serials, setSerials] = useState<Serial[]>(mockSerials);
  const [asnHierarchy] = useState<ASNHierarchy>(mockASNHierarchy);

  const updateSerials = (newSerials: Serial[]) => {
    setSerials(newSerials);
  };

  const assignSerials = (
    serialIds: string[], 
    targetId: string, 
    targetType: 'item' | 'lot' | 'package',
    isTemporary?: boolean
  ) => {
    setSerials(prevSerials =>
      prevSerials.map(serial =>
        serialIds.includes(serial.id)
          ? {
              ...serial,
              status: targetId === '' ? 'unassigned' as const : 
                     (isTemporary ? 'reserved' as const : 'assigned' as const),
              assignedTo: targetId === '' ? undefined : targetId,
              assignedToType: targetId === '' ? undefined : targetType,
              updatedAt: new Date(),
            }
          : serial
      )
    );
  };

  return (
    <AppStateContext.Provider value={{
      serials,
      asnHierarchy,
      updateSerials,
      assignSerials,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};