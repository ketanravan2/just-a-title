import React from 'react';
import { SerialAssignmentInterface } from '@/components/SerialAssignmentInterface';
import { useAppState } from '@/contexts/AppStateContext';

const Serials: React.FC = () => {
  const { 
    serials, 
    assignSerials, 
    createSerial, 
    bulkCreateSerials, 
    importSerialsFromCSV, 
    linkChildSerials,
    asnHierarchy 
  } = useAppState();

  // Extract available buyer part numbers from ASN hierarchy
  const availableBuyerPartNumbers = Array.from(
    new Set(
      asnHierarchy.items.flatMap(item => [
        item.buyerPartNumber,
        ...item.lots.map(lot => lot.buyerPartNumber)
      ]).filter(Boolean)
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <SerialAssignmentInterface
          serials={serials}
          onAssignSerials={assignSerials}
          onCreateSerial={createSerial}
          onBulkCreate={bulkCreateSerials}
          onImportCSV={importSerialsFromCSV}
          onLinkChildSerials={linkChildSerials}
          availableBuyerPartNumbers={availableBuyerPartNumbers}
          hideCreateButtons={false} // Enable create buttons in main serials view
        />
      </div>
    </div>
  );
};

export default Serials;