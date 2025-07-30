import React from 'react';
import { SerialAssignmentInterface } from '@/components/SerialAssignmentInterface';
import { useAppState } from '@/contexts/AppStateContext';

const Serials: React.FC = () => {
  const { serials, assignSerials } = useAppState();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <SerialAssignmentInterface
          serials={serials}
          onAssignSerials={assignSerials}
        />
      </div>
    </div>
  );
};

export default Serials;