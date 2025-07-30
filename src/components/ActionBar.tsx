import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Package, Users, FileBox, X } from 'lucide-react';

interface ActionBarProps {
  selectedCount: number;
  onAssignToItem?: () => void;
  onAssignToLot?: () => void;
  onAssignToPackage?: () => void;
  onAssign?: () => void;
  onUnassign?: () => void;
  onClearSelection: () => void;
  className?: string;
  mode?: 'full' | 'simple';
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  onAssignToItem,
  onAssignToLot,
  onAssignToPackage,
  onAssign,
  onUnassign,
  onClearSelection,
  className,
  mode = 'full',
}) => {
  if (selectedCount === 0) return null;

  return (
    <Card className={cn(
      'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50',
      'bg-card/95 backdrop-blur-sm border shadow-lg',
      'p-4 flex items-center gap-4',
      'animate-in slide-in-from-bottom-4 duration-300',
      className
    )}>
      {/* Selection count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-selected text-selected-foreground">
          {selectedCount} selected
        </Badge>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {mode === 'simple' ? (
          <>
            {onAssign && (
              <Button size="sm" onClick={onAssign} className="gap-2">
                Assign
              </Button>
            )}
            {onUnassign && (
              <Button size="sm" variant="outline" onClick={onUnassign} className="gap-2">
                Unassign
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onAssignToItem}
              className="gap-2"
            >
              <FileBox className="w-4 h-4" />
              Assign to Item
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onAssignToLot}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Assign to Lot
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onAssignToPackage}
              className="gap-2"
            >
              <Package className="w-4 h-4" />
              Assign to Package
            </Button>
          </>
        )}
      </div>

      {/* Clear selection */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
        Clear
      </Button>
    </Card>
  );
};