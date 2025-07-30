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
  createSerial: (data: {
    serialNumber: string;
    buyerPartNumber: string;
    customAttributes: Record<string, string>;
  }) => void;
  bulkCreateSerials: (data: {
    prefix: string;
    startNumber: number;
    count: number;
    buyerPartNumber: string;
  }) => void;
  importSerialsFromCSV: (data: {
    serials: Array<{
      serialNumber: string;
      customAttributes: Record<string, string>;
    }>;
    buyerPartNumber: string;
  }) => void;
  linkChildSerials: (parentSerialId: string, childSerialIds: string[]) => void;
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

  const createSerial = (data: {
    serialNumber: string;
    buyerPartNumber: string;
    customAttributes: Record<string, string>;
  }) => {
    const newSerial: Serial = {
      id: `serial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serialNumber: data.serialNumber,
      buyerPartNumber: data.buyerPartNumber,
      status: 'unassigned',
      customAttributes: data.customAttributes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSerials(prevSerials => [...prevSerials, newSerial]);
  };

  const bulkCreateSerials = (data: {
    prefix: string;
    startNumber: number;
    count: number;
    buyerPartNumber: string;
  }) => {
    const newSerials: Serial[] = Array.from({ length: data.count }, (_, i) => ({
      id: `serial-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      serialNumber: `${data.prefix}${String(data.startNumber + i).padStart(6, '0')}`,
      buyerPartNumber: data.buyerPartNumber,
      status: 'unassigned' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    setSerials(prevSerials => [...prevSerials, ...newSerials]);
  };

  const importSerialsFromCSV = (data: {
    serials: Array<{
      serialNumber: string;
      customAttributes: Record<string, string>;
    }>;
    buyerPartNumber: string;
  }) => {
    const newSerials: Serial[] = data.serials.map((serialData, i) => ({
      id: `serial-csv-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      serialNumber: serialData.serialNumber,
      buyerPartNumber: data.buyerPartNumber,
      status: 'unassigned' as const,
      customAttributes: serialData.customAttributes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    setSerials(prevSerials => [...prevSerials, ...newSerials]);
  };

  const linkChildSerials = (parentSerialId: string, childSerialIds: string[]) => {
    setSerials(prevSerials =>
      prevSerials.map(serial => {
        if (serial.id === parentSerialId) {
          // Update parent serial
          return {
            ...serial,
            childSerials: [...(serial.childSerials || []), ...childSerialIds],
            updatedAt: new Date(),
          };
        } else if (childSerialIds.includes(serial.id)) {
          // Update child serials
          return {
            ...serial,
            parentSerial: parentSerialId,
            updatedAt: new Date(),
          };
        }
        return serial;
      })
    );
  };

  return (
    <AppStateContext.Provider value={{
      serials,
      asnHierarchy,
      updateSerials,
      assignSerials,
      createSerial,
      bulkCreateSerials,
      importSerialsFromCSV,
      linkChildSerials,
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