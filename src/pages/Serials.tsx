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
    setChildComponents,
    asnHierarchy,
    partNumbers
  } = useAppState();

  // Extract available buyer part numbers from part numbers state
  const availableBuyerPartNumbers = partNumbers.map(p => p.buyerPartNumber);

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
          onSetChildComponents={setChildComponents}
          availableBuyerPartNumbers={availableBuyerPartNumbers}
          hideCreateButtons={false} // Enable create buttons in main serials view
        />
      </div>
    </div>
  );
};

export default Serials;