import React, { useState } from 'react';
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
import { AssignmentTarget } from '@/types/serial';
import { mockItems, mockLots, mockPackages } from '@/data/mockData';
import { Search, FileBox, Users, Package } from 'lucide-react';

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSerials: string[];
  assignmentType: 'item' | 'lot' | 'package' | null;
  onAssign: (targetId: string, targetType: 'item' | 'lot' | 'package') => void;
}

export const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  open,
  onOpenChange,
  selectedSerials,
  assignmentType,
  onAssign,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  // Get targets based on assignment type
  const getTargets = () => {
    switch (assignmentType) {
      case 'item':
        return mockItems.map(item => ({
          id: item.id,
          type: 'item' as const,
          name: item.name,
          details: item.partNumber,
        }));
      case 'lot':
        return mockLots.map(lot => ({
          id: lot.id,
          type: 'lot' as const,
          name: lot.number,
          details: `${lot.itemCount} items`,
        }));
      case 'package':
        return mockPackages.map(pkg => ({
          id: pkg.id,
          type: 'package' as const,
          name: pkg.trackingNumber,
          details: `${pkg.carrier} - ${pkg.status}`,
        }));
      default:
        return [];
    }
  };

  const targets = getTargets().filter(target =>
    target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    target.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = () => {
    switch (assignmentType) {
      case 'item': return <FileBox className="w-4 h-4" />;
      case 'lot': return <Users className="w-4 h-4" />;
      case 'package': return <Package className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleAssign = () => {
    if (selectedTarget && assignmentType) {
      onAssign(selectedTarget, assignmentType);
      setSelectedTarget(null);
      setSearchQuery('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedTarget(null);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            Assign to {assignmentType}
          </DialogTitle>
          <DialogDescription>
            Assign {selectedSerials.length} selected serial{selectedSerials.length !== 1 ? 's' : ''} to a {assignmentType}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search {assignmentType}s</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={`Search ${assignmentType}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Target list */}
          <div className="space-y-2">
            <Label>Available {assignmentType}s</Label>
            <ScrollArea className="h-48 border rounded-md">
              <div className="p-2 space-y-1">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTarget === target.id
                        ? 'bg-selected text-selected-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedTarget(target.id)}
                  >
                    <div className="font-medium">{target.name}</div>
                    {target.details && (
                      <div className="text-sm text-muted-foreground">
                        {target.details}
                      </div>
                    )}
                  </div>
                ))}
                {targets.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No {assignmentType}s found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Selected serials preview */}
          <div className="space-y-2">
            <Label>Selected serials</Label>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {selectedSerials.slice(0, 10).map((serialId) => (
                <Badge key={serialId} variant="secondary" className="text-xs">
                  {serialId}
                </Badge>
              ))}
              {selectedSerials.length > 10 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedSerials.length - 10} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedTarget}
          >
            Assign {selectedSerials.length} serial{selectedSerials.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};