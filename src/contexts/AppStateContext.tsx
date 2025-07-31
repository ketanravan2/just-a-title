import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Serial, PartNumber, ChildComponent } from '@/types/serial';
import { ASNHierarchy } from '@/types/asn';
import { mockSerials } from '@/data/mockData';
import { mockASNHierarchy } from '@/data/asnMockData';

interface AppStateContextType {
  serials: Serial[];
  asnHierarchy: ASNHierarchy;
  partNumbers: PartNumber[];
  updateSerials: (serials: Serial[]) => void;
  assignSerials: (
    serialIds: string[], 
    targetId: string, 
    targetType: 'item' | 'lot' | 'package',
    isTemporary?: boolean,
    targetName?: string
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
  setChildComponents: (serialId: string, childComponents: ChildComponent[]) => void;
  createPartNumber: (data: {
    partNumber: string;
    buyerPartNumber: string;
    name: string;
    description: string;
  }) => void;
  getSerialsByBuyerPartNumber: (buyerPartNumber: string) => Serial[];
  getAssignedSerials: (targetId: string, targetType: 'item' | 'lot' | 'package') => Serial[];
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serials, setSerials] = useState<Serial[]>(mockSerials);
  const [asnHierarchy] = useState<ASNHierarchy>(mockASNHierarchy);
  
  // Initialize part numbers from ASN hierarchy
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>(() => {
    const initialPartNumbers: PartNumber[] = [];
    
    asnHierarchy.items.forEach(item => {
      if (item.buyerPartNumber && !initialPartNumbers.some(p => p.buyerPartNumber === item.buyerPartNumber)) {
        initialPartNumbers.push({
          id: `part-${item.id}`,
          partNumber: item.partNumber,
          buyerPartNumber: item.buyerPartNumber,
          name: item.name,
          description: item.description,
        });
      }
      
      item.lots.forEach(lot => {
        if (lot.buyerPartNumber && !initialPartNumbers.some(p => p.buyerPartNumber === lot.buyerPartNumber)) {
          initialPartNumbers.push({
            id: `part-lot-${lot.id}`,
            partNumber: lot.buyerPartNumber,
            buyerPartNumber: lot.buyerPartNumber,
            name: `${item.name} - ${lot.number}`,
            description: lot.description,
          });
        }
      });
    });
    
    return initialPartNumbers;
  });

  const updateSerials = (newSerials: Serial[]) => {
    setSerials(newSerials);
  };

  const assignSerials = (
    serialIds: string[], 
    targetId: string, 
    targetType: 'item' | 'lot' | 'package',
    isTemporary?: boolean,
    targetName?: string
  ) => {
    setSerials(prevSerials =>
      prevSerials.map(serial => {
        if (!serialIds.includes(serial.id)) return serial;
        
        // Check if serial is already assigned to prevent double assignment
        if (serial.assignedTo && serial.assignedTo !== targetId && targetId !== '') {
          console.warn(`Serial ${serial.serialNumber} is already assigned to ${serial.assignedTo}`);
          return serial;
        }
        
        if (targetId === '') {
          // Unassign serial
          return {
            ...serial,
            status: 'unassigned' as const,
            assignedTo: undefined,
            assignedToType: undefined,
            assignmentDetails: undefined,
            updatedAt: new Date(),
          };
        } else {
          // Assign serial
          return {
            ...serial,
            status: isTemporary ? 'reserved' as const : 'assigned' as const,
            assignedTo: targetId,
            assignedToType: targetType,
            assignmentDetails: {
              targetId,
              targetType,
              targetName: targetName || targetId,
              assignedAt: new Date(),
              isTemporary,
            },
            updatedAt: new Date(),
          };
        }
      })
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
          // Update parent serial - merge with existing child serials, avoid duplicates
          const existingChildSerials = serial.childSerials || [];
          const newChildSerials = [...new Set([...existingChildSerials, ...childSerialIds])];
          return {
            ...serial,
            childSerials: newChildSerials,
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

  const getSerialsByBuyerPartNumber = (buyerPartNumber: string): Serial[] => {
    return serials.filter(serial => serial.buyerPartNumber === buyerPartNumber);
  };

  const getAssignedSerials = (targetId: string, targetType: 'item' | 'lot' | 'package'): Serial[] => {
    return serials.filter(serial => 
      serial.assignedTo === targetId && serial.assignedToType === targetType
    );
  };

  const setChildComponents = (serialId: string, childComponents: ChildComponent[]) => {
    setSerials(prevSerials =>
      prevSerials.map(serial => {
        if (serial.id === serialId) {
          return {
            ...serial,
            childComponents,
            updatedAt: new Date(),
          };
        }
        return serial;
      })
    );
  };

  const createPartNumber = (data: {
    partNumber: string;
    buyerPartNumber: string;
    name: string;
    description: string;
  }) => {
    const newPartNumber: PartNumber = {
      id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      partNumber: data.partNumber,
      buyerPartNumber: data.buyerPartNumber,
      name: data.name,
      description: data.description,
    };
    
    setPartNumbers(prevPartNumbers => [...prevPartNumbers, newPartNumber]);
  };

  return (
    <AppStateContext.Provider value={{
      serials,
      asnHierarchy,
      partNumbers,
      updateSerials,
      assignSerials,
      createSerial,
      bulkCreateSerials,
      importSerialsFromCSV,
      linkChildSerials,
      setChildComponents,
      createPartNumber,
      getSerialsByBuyerPartNumber,
      getAssignedSerials,
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