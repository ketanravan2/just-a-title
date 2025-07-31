import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreatePartNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePartNumber: (data: {
    partNumber: string;
    buyerPartNumber: string;
    name: string;
    description: string;
  }) => void;
}

export const CreatePartNumberDialog: React.FC<CreatePartNumberDialogProps> = ({
  open,
  onOpenChange,
  onCreatePartNumber,
}) => {
  const [partNumber, setPartNumber] = useState('');
  const [buyerPartNumber, setBuyerPartNumber] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!partNumber || !buyerPartNumber || !name) return;
    
    onCreatePartNumber({
      partNumber,
      buyerPartNumber,
      name,
      description,
    });

    // Reset form
    setPartNumber('');
    setBuyerPartNumber('');
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Part Number</DialogTitle>
          <DialogDescription>
            Add a new part number to the system for serial creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="e.g., CPU-X1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerPartNumber">Buyer Part Number</Label>
            <Input
              id="buyerPartNumber"
              value={buyerPartNumber}
              onChange={(e) => setBuyerPartNumber(e.target.value)}
              placeholder="e.g., BPN-CPU-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-Performance CPU"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Advanced 8-core processor for enterprise systems"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!partNumber || !buyerPartNumber || !name}
          >
            Create Part Number
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};