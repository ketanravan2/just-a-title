import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ChildComponent {
  buyerPartNumber: string;
  quantity: number;
}

interface SetChildComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetChildComponents: (serialId: string, childComponents: ChildComponent[]) => void;
  availableBuyerPartNumbers: string[];
  serialId: string;
  serialNumber: string;
  existingChildComponents?: ChildComponent[];
}

export const SetChildComponentDialog: React.FC<SetChildComponentDialogProps> = ({
  open,
  onOpenChange,
  onSetChildComponents,
  availableBuyerPartNumbers,
  serialId,
  serialNumber,
  existingChildComponents = [],
}) => {
  const [childComponents, setChildComponents] = useState<ChildComponent[]>(existingChildComponents);
  const [selectedPartNumber, setSelectedPartNumber] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddComponent = () => {
    if (!selectedPartNumber || quantity < 1) return;

    // Check if part number already exists
    const existingIndex = childComponents.findIndex(
      comp => comp.buyerPartNumber === selectedPartNumber
    );

    if (existingIndex !== -1) {
      // Update existing quantity
      const updated = [...childComponents];
      updated[existingIndex].quantity = quantity;
      setChildComponents(updated);
    } else {
      // Add new component
      setChildComponents(prev => [...prev, {
        buyerPartNumber: selectedPartNumber,
        quantity,
      }]);
    }

    // Reset form
    setSelectedPartNumber('');
    setQuantity(1);
  };

  const handleRemoveComponent = (buyerPartNumber: string) => {
    setChildComponents(prev => 
      prev.filter(comp => comp.buyerPartNumber !== buyerPartNumber)
    );
  };

  const handleSubmit = () => {
    onSetChildComponents(serialId, childComponents);
    onOpenChange(false);
  };

  const availablePartNumbers = availableBuyerPartNumbers.filter(
    bpn => !childComponents.some(comp => comp.buyerPartNumber === bpn)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Child Components</DialogTitle>
          <DialogDescription>
            Define child components required for serial: {serialNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new component */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Add Child Component</h4>
            
            <div className="space-y-2">
              <Label htmlFor="partNumber">Buyer Part Number</Label>
              <Select value={selectedPartNumber} onValueChange={setSelectedPartNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Select part number" />
                </SelectTrigger>
                <SelectContent>
                  {availablePartNumbers.map((bpn) => (
                    <SelectItem key={bpn} value={bpn}>
                      {bpn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Required</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
              />
            </div>

            <Button 
              onClick={handleAddComponent}
              disabled={!selectedPartNumber || quantity < 1}
              className="w-full"
            >
              Add Component
            </Button>
          </div>

          {/* Existing components */}
          {childComponents.length > 0 && (
            <div className="space-y-2">
              <Label>Child Components</Label>
              <div className="space-y-2">
                {childComponents.map((component) => (
                  <div key={component.buyerPartNumber} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {component.buyerPartNumber}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Qty: {component.quantity}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveComponent(component.buyerPartNumber)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Child Components
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
