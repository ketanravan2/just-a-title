import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SerialAssignmentInterface } from '@/components/SerialAssignmentInterface';
import { useAppState } from '@/contexts/AppStateContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Box, Container } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Assignment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { serials, assignSerials, asnHierarchy } = useAppState();

  const targetType = searchParams.get('type') as 'item' | 'lot' | 'pack';
  const targetId = searchParams.get('targetId') || '';
  const targetName = searchParams.get('targetName') || '';
  const buyerPartNumber = searchParams.get('buyerPartNumber');
  const isTemporary = searchParams.get('temporary') === 'true';

  // Filter serials based on context
  const filteredSerials = useMemo(() => {
    console.log('Assignment filtering:', { 
      totalSerials: serials.length, 
      buyerPartNumber, 
      targetType,
      serialSample: serials.slice(0, 3)
    });
    
    let filtered = serials;

    // Filter by buyer part number if specified
    if (buyerPartNumber) {
      filtered = filtered.filter(serial => serial.buyerPartNumber === buyerPartNumber);
      console.log(`Filtered by buyer part number ${buyerPartNumber}:`, filtered.length);
    }

    // Filter by packing context - serials should match items in the package
    if (targetType === 'pack') {
      // For packing assignments, show all unassigned serials
      // In a real app, this would be filtered based on items in the package
      filtered = filtered.filter(serial => serial.status === 'unassigned');
      console.log('Filtered for packing (unassigned only):', filtered.length);
    }

    console.log('Final filtered serials:', filtered.length);
    return filtered;
  }, [serials, buyerPartNumber, targetType]);

  const getIcon = () => {
    switch (targetType) {
      case 'item': return <Package className="w-5 h-5" />;
      case 'lot': return <Box className="w-5 h-5" />;
      case 'pack': return <Container className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    const typeLabel = targetType === 'pack' ? 'Package' : targetType.charAt(0).toUpperCase() + targetType.slice(1);
    return `Assign Serials to ${typeLabel}: ${targetName}`;
  };

  const handleAssignSerials = (
    serialIds: string[], 
    assignTargetId: string, 
    assignTargetType: 'item' | 'lot' | 'package'
  ) => {
    // Use the original assignment context
    assignSerials(serialIds, targetId, targetType === 'pack' ? 'package' : targetType, isTemporary);
    
    toast({
      title: "Assignment successful",
      description: `${serialIds.length} serial${serialIds.length !== 1 ? 's' : ''} assigned to ${targetName}.`,
    });

    // Navigate back to ASN page
    navigate('/asn');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/asn')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to ASN
              </Button>
              <div className="flex items-center gap-2">
                {getIcon()}
                <CardTitle>{getTitle()}</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{filteredSerials.length} available serials</span>
              {buyerPartNumber && (
                <>
                  <span>•</span>
                  <span>Filtered by buyer part: {buyerPartNumber}</span>
                </>
              )}
              {isTemporary && (
                <>
                  <span>•</span>
                  <span className="text-orange-600 font-medium">Temporary Assignment</span>
                </>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Assignment Interface */}
        <SerialAssignmentInterface
          serials={filteredSerials}
          onAssignSerials={handleAssignSerials}
          hideAssignmentDialog={true}
          assignmentMode="simple"
          assignmentContext={{
            type: targetType,
            targetId,
            targetName,
            buyerPartNumber,
            isTemporary
          }}
        />
      </div>
    </div>
  );
};

export default Assignment;