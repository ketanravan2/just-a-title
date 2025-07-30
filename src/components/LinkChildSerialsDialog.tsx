import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Serial } from '@/types/serial';
import { Badge } from '@/components/ui/badge';
import { Link2 } from 'lucide-react';

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
  const [selectedBuyerPartNumber, setSelectedBuyerPartNumber] = useState('');
  const [selectedChildSerials, setSelectedChildSerials] = useState<Set<string>>(new Set());

  // Filter serials by selected buyer part number
  const filteredSerials = useMemo(() => {
    if (!selectedBuyerPartNumber) return [];
    
    return availableSerials.filter(serial => 
      serial.buyerPartNumber === selectedBuyerPartNumber &&
      serial.id !== parentSerial?.id && // Don't include parent
      !serial.parentSerial && // Don't include serials that already have a parent
      serial.status === 'unassigned' // Only unassigned serials
    );
  }, [selectedBuyerPartNumber, availableSerials, parentSerial?.id]);

  const handleSerialToggle = (serialId: string, checked: boolean) => {
    const newSelection = new Set(selectedChildSerials);
    if (checked) {
      newSelection.add(serialId);
    } else {
      newSelection.delete(serialId);
    }
    setSelectedChildSerials(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedChildSerials.size === filteredSerials.length) {
      setSelectedChildSerials(new Set());
    } else {
      setSelectedChildSerials(new Set(filteredSerials.map(s => s.id)));
    }
  };

  const handleSubmit = () => {
    if (!parentSerial || selectedChildSerials.size === 0) return;
    
    onLinkSerials(parentSerial.id, Array.from(selectedChildSerials));
    
    // Reset form
    setSelectedBuyerPartNumber('');
    setSelectedChildSerials(new Set());
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedBuyerPartNumber('');
    setSelectedChildSerials(new Set());
    onOpenChange(false);
  };

  if (!parentSerial) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Link Child Serials
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Parent Serial Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">Parent Serial</div>
            <div className="font-mono">{parentSerial.serialNumber}</div>
            {parentSerial.buyerPartNumber && (
              <div className="text-xs text-muted-foreground">
                BPN: {parentSerial.buyerPartNumber}
              </div>
            )}
          </div>

          {/* Buyer Part Number Selection */}
          <div className="space-y-2">
            <Label>Child Buyer Part Number</Label>
            <Select value={selectedBuyerPartNumber} onValueChange={setSelectedBuyerPartNumber}>
              <SelectTrigger>
                <SelectValue placeholder="Select buyer part number for child serials" />
              </SelectTrigger>
              <SelectContent>
                {availableBuyerPartNumbers
                  .filter(bpn => bpn !== parentSerial.buyerPartNumber) // Exclude parent's BPN
                  .map((bpn) => (
                    <SelectItem key={bpn} value={bpn}>
                      {bpn}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available Serials */}
          {selectedBuyerPartNumber && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Available Serials</Label>
                {filteredSerials.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedChildSerials.size === filteredSerials.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>

              {filteredSerials.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No available unassigned serials for this buyer part number
                </div>
              ) : (
                <ScrollArea className="h-48 border rounded-md p-2">
                  <div className="space-y-2">
                    {filteredSerials.map((serial) => (
                      <div key={serial.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={serial.id}
                          checked={selectedChildSerials.has(serial.id)}
                          onCheckedChange={(checked) => 
                            handleSerialToggle(serial.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={serial.id}
                          className="flex-1 text-sm font-mono cursor-pointer"
                        >
                          {serial.serialNumber}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {serial.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {selectedChildSerials.size > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedChildSerials.size} serial{selectedChildSerials.size !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedChildSerials.size === 0}
            className="gap-1"
          >
            <Link2 className="w-3 h-3" />
            Link {selectedChildSerials.size} Serial{selectedChildSerials.size !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};