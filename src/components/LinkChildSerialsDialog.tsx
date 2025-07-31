import React, { useState, useMemo } from 'react';
import { Serial } from '@/types/serial';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LinkChildSerialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentSerial: Serial | null;
  availableSerials: Serial[];
  availableBuyerPartNumbers: string[];
  onLinkSerials: (parentSerialId: string, childSerialIds: string[]) => void;
}

export const LinkChildSerialsDialog: React.FC<LinkChildSerialsDialogProps> = ({
  open,
  onOpenChange,
  parentSerial,
  availableSerials,
  availableBuyerPartNumbers,
  onLinkSerials,
}) => {
  const [selectedBuyerPartNumber, setSelectedBuyerPartNumber] = useState<string>('');
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);

  // Get existing child serials grouped by buyer part number
  const existingChildSerials = useMemo(() => {
    if (!parentSerial?.childSerials) return {};
    
    const childSerials = availableSerials.filter(serial => 
      parentSerial.childSerials!.includes(serial.id)
    );
    
    return childSerials.reduce((acc, serial) => {
      if (!acc[serial.buyerPartNumber]) {
        acc[serial.buyerPartNumber] = [];
      }
      acc[serial.buyerPartNumber].push(serial);
      return acc;
    }, {} as Record<string, Serial[]>);
  }, [parentSerial?.childSerials, availableSerials]);

  // Get available serials for linking (not already child serials)
  const filteredSerials = availableSerials.filter(serial => 
    serial.buyerPartNumber === selectedBuyerPartNumber &&
    serial.id !== parentSerial?.id &&
    !parentSerial?.childSerials?.includes(serial.id)
  );

  const handleSerialToggle = (serialId: string) => {
    setSelectedSerials(prev => 
      prev.includes(serialId)
        ? prev.filter(id => id !== serialId)
        : [...prev, serialId]
    );
  };

  const handleSubmit = () => {
    if (parentSerial && selectedSerials.length > 0) {
      onLinkSerials(parentSerial.id, selectedSerials);
      setSelectedSerials([]);
      setSelectedBuyerPartNumber('');
      onOpenChange(false);
    }
  };

  const reset = () => {
    setSelectedSerials([]);
    setSelectedBuyerPartNumber('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) reset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Link Child Serials</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Parent Serial: <Badge variant="outline">{parentSerial?.serialNumber}</Badge> 
              ({parentSerial?.buyerPartNumber})
            </p>
          </div>

          {/* Existing Child Serials */}
          {Object.keys(existingChildSerials).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Existing Child Serials</h3>
              <div className="space-y-3">
                {Object.entries(existingChildSerials).map(([partNumber, serials]) => (
                  <Card key={partNumber}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{partNumber}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {serials.map((serial) => (
                          <div key={serial.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                            <span>{serial.serialNumber}</span>
                            <Badge variant={serial.status === 'assigned' ? 'default' : 'secondary'} className="text-xs">
                              {serial.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {/* Add New Child Serials */}
          <div>
            <h3 className="text-sm font-medium mb-3">Add New Child Serials</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Buyer Part Number
                </label>
                <Select 
                  value={selectedBuyerPartNumber} 
                  onValueChange={setSelectedBuyerPartNumber}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose buyer part number..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBuyerPartNumbers
                      .filter(partNumber => partNumber !== parentSerial?.buyerPartNumber)
                      .map((partNumber) => (
                        <SelectItem key={partNumber} value={partNumber}>
                          {partNumber}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBuyerPartNumber && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select Serials to Link ({filteredSerials.length} available)
                  </label>
                  <ScrollArea className="h-48 border rounded-md p-4">
                    <div className="space-y-2">
                      {filteredSerials.map((serial) => (
                        <div key={serial.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={serial.id}
                            checked={selectedSerials.includes(serial.id)}
                            onCheckedChange={() => handleSerialToggle(serial.id)}
                          />
                          <label 
                            htmlFor={serial.id} 
                            className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                          >
                            <span>{serial.serialNumber}</span>
                            <div className="flex gap-2">
                              <Badge variant={serial.status === 'assigned' ? 'default' : 'secondary'}>
                                {serial.status}
                              </Badge>
                              {serial.assignmentDetails && (
                                <Badge variant="outline" className="text-xs">
                                  {serial.assignmentDetails.targetName}
                                </Badge>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                      {filteredSerials.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No available serials for this buyer part number
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          <Separator />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={selectedSerials.length === 0}
            >
              Link {selectedSerials.length} Serial{selectedSerials.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
