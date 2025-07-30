import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AssignmentContext } from '@/types/asn';
import { Serial } from '@/types/serial';
import { Search, AlertTriangle, FileBox, Package, Container } from 'lucide-react';

interface EnhancedAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: AssignmentContext | null;
  serials: Serial[];
  onAssign: (serialIds: string[], context: AssignmentContext) => void;
}

export const EnhancedAssignmentDialog: React.FC<EnhancedAssignmentDialogProps> = ({
  open,
  onOpenChange,
  context,
  serials,
  onAssign,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());

  // Filter serials based on context and search
  const filteredSerials = useMemo(() => {
    if (!context) return [];
    
    let contextSerials = serials;
    
    // Apply context-specific filtering
    if (context.allowedSerials) {
      contextSerials = serials.filter(serial => 
        context.allowedSerials!.includes(serial.id)
      );
    } else {
      // For item/lot assignments, show unassigned serials
      // For pack assignments, show assigned but not shipped serials
      if (context.type === 'pack') {
        contextSerials = serials.filter(serial => 
          serial.status === 'assigned' || serial.status === 'reserved'
        );
      } else {
        contextSerials = serials.filter(serial => 
          serial.status === 'unassigned'
        );
      }
    }
    
    // Apply search filter
    return contextSerials.filter(serial =>
      serial.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serial.buyerPartNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [context, serials, searchQuery]);

  const getIcon = () => {
    if (!context) return null;
    switch (context.type) {
      case 'item': return <FileBox className="w-4 h-4" />;
      case 'lot': return <Package className="w-4 h-4" />;
      case 'pack': return <Container className="w-4 h-4" />;
    }
  };

  const getTitle = () => {
    if (!context) return '';
    switch (context.type) {
      case 'item': return 'Assign to Item';
      case 'lot': return 'Assign to Lot';
      case 'pack': return 'Assign to Package';
    }
  };

  const handleSerialToggle = (serialId: string) => {
    const newSelection = new Set(selectedSerials);
    if (newSelection.has(serialId)) {
      newSelection.delete(serialId);
    } else {
      newSelection.add(serialId);
    }
    setSelectedSerials(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedSerials.size === filteredSerials.length) {
      setSelectedSerials(new Set());
    } else {
      setSelectedSerials(new Set(filteredSerials.map(s => s.id)));
    }
  };

  const handleAssign = () => {
    if (selectedSerials.size > 0 && context) {
      onAssign(Array.from(selectedSerials), context);
      setSelectedSerials(new Set());
      setSearchQuery('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedSerials(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  if (!context) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            Assign serials to <strong>{context.targetName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning for temporary assignments */}
          {context.warning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{context.warning}</AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search available serials</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search serials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Selection controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredSerials.length === 0}
            >
              {selectedSerials.size === filteredSerials.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedSerials.size > 0 && (
              <Badge variant="secondary">
                {selectedSerials.size} selected
              </Badge>
            )}
          </div>

          {/* Serial list */}
          <div className="space-y-2">
            <Label>Available serials ({filteredSerials.length})</Label>
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-2 space-y-1">
                {filteredSerials.map((serial) => (
                  <div
                    key={serial.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSerials.has(serial.id)
                        ? 'bg-selected text-selected-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleSerialToggle(serial.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{serial.serialNumber}</div>
                        {serial.buyerPartNumber && (
                          <div className="text-sm text-muted-foreground">
                            {serial.buyerPartNumber}
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          serial.status === 'unassigned' ? 'border-green-500 text-green-700' :
                          serial.status === 'assigned' ? 'border-blue-500 text-blue-700' :
                          serial.status === 'reserved' ? 'border-orange-500 text-orange-700' :
                          'border-gray-500 text-gray-700'
                        }
                      >
                        {serial.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredSerials.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No available serials found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={selectedSerials.size === 0}
          >
            Assign {selectedSerials.size} serial{selectedSerials.size !== 1 ? 's' : ''}
            {context.isTemporary && ' (Temporary)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};