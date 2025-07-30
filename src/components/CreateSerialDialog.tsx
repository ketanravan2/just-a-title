import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

interface CreateSerialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSerial: (serialData: {
    serialNumber: string;
    buyerPartNumber: string;
    customAttributes: Record<string, string>;
  }) => void;
  availableBuyerPartNumbers: string[];
}

export const CreateSerialDialog: React.FC<CreateSerialDialogProps> = ({
  open,
  onOpenChange,
  onCreateSerial,
  availableBuyerPartNumbers,
}) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [buyerPartNumber, setBuyerPartNumber] = useState('');
  const [customAttributes, setCustomAttributes] = useState<Array<{key: string, value: string}>>([]);

  const handleAddAttribute = () => {
    setCustomAttributes([...customAttributes, { key: '', value: '' }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customAttributes];
    updated[index][field] = value;
    setCustomAttributes(updated);
  };

  const handleSubmit = () => {
    if (!serialNumber || !buyerPartNumber) return;
    
    const attributes: Record<string, string> = {};
    customAttributes.forEach(attr => {
      if (attr.key && attr.value) {
        attributes[attr.key] = attr.value;
      }
    });

    onCreateSerial({
      serialNumber,
      buyerPartNumber,
      customAttributes: attributes,
    });

    // Reset form
    setSerialNumber('');
    setBuyerPartNumber('');
    setCustomAttributes([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Serial</DialogTitle>
          <DialogDescription>
            Add a new serial number with custom attributes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Enter serial number"
            />
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Custom Attributes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttribute}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
            </div>
            
            {customAttributes.map((attr, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Attribute name"
                  value={attr.key}
                  onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                />
                <Input
                  placeholder="Attribute value"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveAttribute(index)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!serialNumber || !buyerPartNumber}
          >
            Create Serial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};