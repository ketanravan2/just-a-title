import React, { useState, useMemo } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SerialAssignmentInterface } from './SerialAssignmentInterface';
import { Package, Box, Container, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const IndividualAssignment: React.FC = () => {
  const { serials, asnHierarchy, assignSerials, createSerial, bulkCreateSerials, importSerialsFromCSV, linkChildSerials, setChildComponents, partNumbers } = useAppState();
  const { toast } = useToast();
  const [assignmentType, setAssignmentType] = useState<'items' | 'package'>('items');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');

  // Get available items
  const availableItems = asnHierarchy.items;

  // Get available lots for selected item
  const availableLots = useMemo(() => {
    if (!selectedItem) return [];
    const item = availableItems.find(item => item.id === selectedItem);
    return item?.lots || [];
  }, [selectedItem, availableItems]);

  // Get available packages
  const availablePackages = asnHierarchy.packingStructure;

  // Filter serials based on selection
  const filteredSerials = useMemo(() => {
    let filtered = serials;

    if (assignmentType === 'items' && selectedItem) {
      const item = availableItems.find(item => item.id === selectedItem);
      if (item) {
        filtered = filtered.filter(serial => serial.buyerPartNumber === item.buyerPartNumber);
      }
    }

    return filtered;
  }, [serials, assignmentType, selectedItem, availableItems]);

  const handleAssignSerials = (
    serialIds: string[], 
    targetId: string, 
    targetType: 'item' | 'lot' | 'package',
    isTemporary?: boolean,
    targetName?: string
  ) => {
    let actualTargetId = targetId;
    let actualTargetType = targetType;

    // Determine the actual target based on current selection
    if (assignmentType === 'items') {
      if (selectedLot) {
        actualTargetId = selectedLot;
        actualTargetType = 'lot';
      } else if (selectedItem) {
        actualTargetId = selectedItem;
        actualTargetType = 'item';
      }
    } else if (assignmentType === 'package' && selectedPackage) {
      actualTargetId = selectedPackage;
      actualTargetType = 'package';
    }

    // Check for overassignment
    const targetSerials = getTargetSerials(actualTargetId, actualTargetType);
    const availableCapacity = getAvailableCapacity(actualTargetId, actualTargetType);
    
    if (availableCapacity !== null && serialIds.length > availableCapacity) {
      toast({
        title: "Overassignment Warning",
        description: `You're trying to assign ${serialIds.length} serials but only ${availableCapacity} slots are available.`,
        variant: "destructive",
      });
      return;
    }

    // Get the actual target name
    let actualTargetName = targetName;
    if (!actualTargetName) {
      if (actualTargetType === 'item') {
        const item = availableItems.find(i => i.id === actualTargetId);
        actualTargetName = item?.name;
      } else if (actualTargetType === 'lot') {
        const lot = availableLots.find(l => l.id === actualTargetId);
        actualTargetName = lot?.number;
      } else if (actualTargetType === 'package') {
        const pkg = availablePackages.find(p => p.id === actualTargetId);
        actualTargetName = pkg?.identifier;
      }
    }

    assignSerials(serialIds, actualTargetId, actualTargetType, isTemporary, actualTargetName);
  };

  const getTargetSerials = (targetId: string, targetType: 'item' | 'lot' | 'package') => {
    return serials.filter(s => s.assignedTo === targetId && s.assignedToType === targetType);
  };

  const getAvailableCapacity = (targetId: string, targetType: 'item' | 'lot' | 'package') => {
    if (targetType === 'lot') {
      const lot = availableLots.find(l => l.id === targetId);
      if (lot) {
        const assignedCount = getTargetSerials(targetId, targetType).length;
        return lot.serialCount - assignedCount;
      }
    }
    return null; // No capacity limit for items and packages
  };

  const getAssignmentContext = () => {
    if (assignmentType === 'items') {
      if (selectedLot) {
        const lot = availableLots.find(lot => lot.id === selectedLot);
        return {
          type: 'lot' as const,
          targetId: selectedLot,
          targetName: lot?.number || '',
          buyerPartNumber: lot?.buyerPartNumber,
        };
      } else if (selectedItem) {
        const item = availableItems.find(item => item.id === selectedItem);
        return {
          type: 'item' as const,
          targetId: selectedItem,
          targetName: item?.name || '',
          buyerPartNumber: item?.buyerPartNumber,
        };
      }
    } else if (assignmentType === 'package' && selectedPackage) {
      const pkg = availablePackages.find(pkg => pkg.id === selectedPackage);
      return {
        type: 'pack' as const,
        targetId: selectedPackage,
        targetName: pkg?.identifier || '',
      };
    }
    return null;
  };

  const canShowSerials = () => {
    if (assignmentType === 'items') {
      return selectedItem; // Show serials when item is selected (lot is optional)
    }
    return selectedPackage; // Show serials when package is selected
  };

  const assignmentContext = getAssignmentContext();

  return (
    <div className="space-y-6">
      {/* Assignment Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Individual Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label>Assignment Level</Label>
            <Select value={assignmentType} onValueChange={(value: 'items' | 'package') => {
              setAssignmentType(value);
              setSelectedItem('');
              setSelectedLot('');
              setSelectedPackage('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="items">Items / Lots</SelectItem>
                <SelectItem value="package">Package</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items/Lots Selection */}
          {assignmentType === 'items' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Part Number</Label>
                <Select value={selectedItem} onValueChange={(value) => {
                  setSelectedItem(value);
                  setSelectedLot(''); // Reset lot when item changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {item.buyerPartNumber} - {item.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItem && availableLots.length > 0 && (
                <div className="space-y-2">
                  <Label>Lot Number</Label>
                  <Select value={selectedLot} onValueChange={setSelectedLot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLots.map((lot) => (
                        <SelectItem key={lot.id} value={lot.id}>
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4" />
                            {lot.number}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Package Selection */}
          {assignmentType === 'package' && (
            <div className="space-y-2">
              <Label>Container ID</Label>
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select container" />
                </SelectTrigger>
                <SelectContent>
                  {availablePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      <div className="flex items-center gap-2">
                        <Container className="w-4 h-4" />
                        {pkg.identifier} ({pkg.type})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Serial Grid */}
      {canShowSerials() && assignmentContext && (
        <SerialAssignmentInterface
          serials={filteredSerials}
          onAssignSerials={handleAssignSerials}
          onCreateSerial={createSerial}
          onBulkCreate={bulkCreateSerials}
          onImportCSV={importSerialsFromCSV}
          onLinkChildSerials={linkChildSerials}
          onSetChildComponents={setChildComponents}
          availableBuyerPartNumbers={availableItems.map(item => item.buyerPartNumber)}
          hideAssignmentDialog={true}
          hideCreateButtons={assignmentType === 'package'} // Hide for package, enable for items/lots
          assignmentMode="simple"
          assignmentContext={assignmentContext}
          contextualBuyerPartNumber={assignmentContext?.buyerPartNumber}
        />
      )}

      {/* No Selection State */}
      {!canShowSerials() && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Please select {assignmentType === 'items' ? 'an item' : 'a container'} to view available serials</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};