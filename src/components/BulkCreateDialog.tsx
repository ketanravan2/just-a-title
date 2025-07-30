import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BulkCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBulkCreate: (data: {
    prefix: string;
    startNumber: number;
    count: number;
    buyerPartNumber: string;
  }) => void;
  availableBuyerPartNumbers: string[];
}

export const BulkCreateDialog: React.FC<BulkCreateDialogProps> = ({
  open,
  onOpenChange,
  onBulkCreate,
  availableBuyerPartNumbers,
}) => {
  const [prefix, setPrefix] = useState('');
  const [startNumber, setStartNumber] = useState(1);
  const [count, setCount] = useState(10);
  const [buyerPartNumber, setBuyerPartNumber] = useState('');

  const handleSubmit = () => {
    if (!prefix || !buyerPartNumber || count < 1) return;
    
    onBulkCreate({
      prefix,
      startNumber,
      count,
      buyerPartNumber,
    });

    // Reset form
    setPrefix('');
    setStartNumber(1);
    setCount(10);
    setBuyerPartNumber('');
    onOpenChange(false);
  };

  const previewSerials = () => {
    if (!prefix) return [];
    return Array.from({ length: Math.min(count, 3) }, (_, i) => 
      `${prefix}${String(startNumber + i).padStart(6, '0')}`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Create Serials</DialogTitle>
          <DialogDescription>
            Generate multiple serial numbers with sequential numbering.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">Serial Prefix</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g., CPU, MEM, GPU"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startNumber">Start Number</Label>
              <Input
                id="startNumber"
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                min="1"
                max="1000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerPartNumber">Buyer Part Number</Label>
            <Select value={buyerPartNumber} onValueChange={setBuyerPartNumber}>
              <SelectTrigger>
                <SelectValue placeholder="Select buyer part number" />
              </SelectTrigger>
              <SelectContent>
                {availableBuyerPartNumbers.map((bpn) => (
                  <SelectItem key={bpn} value={bpn}>
                    {bpn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {prefix && (
            <div className="space-y-2">
              <Label>Preview (first 3)</Label>
              <div className="text-sm text-muted-foreground">
                {previewSerials().map((serial, i) => (
                  <div key={i}>{serial}</div>
                ))}
                {count > 3 && <div>... and {count - 3} more</div>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!prefix || !buyerPartNumber || count < 1}
          >
            Create {count} Serials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};