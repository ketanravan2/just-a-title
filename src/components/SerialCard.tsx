import React from 'react';
import { Serial, SerialStatus } from '@/types/serial';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SerialCardProps {
  serial: Serial;
  isSelected: boolean;
  isDragOver: boolean;
  onSelect: (serialId: string, event: React.MouseEvent) => void;
  onDragStart: (event: React.DragEvent) => void;
  className?: string;
}

const statusConfig: Record<SerialStatus, { label: string; className: string }> = {
  unassigned: { label: 'Unassigned', className: 'bg-status-unassigned text-foreground' },
  assigned: { label: 'Assigned', className: 'bg-status-assigned text-white' },
  reserved: { label: 'Reserved', className: 'bg-status-reserved text-foreground' },
  shipped: { label: 'Shipped', className: 'bg-status-shipped text-white' },
};

export const SerialCard: React.FC<SerialCardProps> = ({
  serial,
  isSelected,
  isDragOver,
  onSelect,
  onDragStart,
  className,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    onSelect(serial.id, event);
  };

  const handleDragStart = (event: React.DragEvent) => {
    onDragStart(event);
  };

  const statusInfo = statusConfig[serial.status];

  return (
    <div
      className={cn(
        'group relative bg-card border rounded-lg p-3 cursor-pointer',
        'transition-all duration-200 hover:shadow-md',
        'touch-manipulation select-none min-h-[80px]',
        isSelected && 'ring-2 ring-selected bg-selected/5',
        isDragOver && 'ring-2 ring-drag-over bg-drag-over/10',
        className
      )}
      onClick={handleClick}
      draggable={isSelected}
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`Serial ${serial.serialNumber}, ${serial.status}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-selected rounded-full border-2 border-background" />
      )}

      {/* Serial number - prominent display */}
      <div className="font-mono font-semibold text-sm text-foreground mb-2">
        {serial.serialNumber}
      </div>

      {/* Status badge */}
      <Badge 
        className={cn('text-xs mb-2', statusInfo.className)}
        variant="secondary"
      >
        {statusInfo.label}
      </Badge>

      {/* Buyer part number if available */}
      {serial.buyerPartNumber && (
        <div className="text-xs text-muted-foreground truncate">
          BPN: {serial.buyerPartNumber}
        </div>
      )}

      {/* Assignment info for assigned serials */}
      {serial.assignedTo && serial.assignedToType && (
        <div className="text-xs text-muted-foreground mt-1 truncate">
          → {serial.assignedToType}: {serial.assignedTo}
        </div>
      )}

      {/* Drag handle visual indicator when selected */}
      {isSelected && (
        <div className="absolute bottom-1 right-1 text-selected opacity-50">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="10" cy="2" r="1" />
            <circle cx="2" cy="6" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="10" cy="6" r="1" />
            <circle cx="2" cy="10" r="1" />
            <circle cx="6" cy="10" r="1" />
            <circle cx="10" cy="10" r="1" />
          </svg>
        </div>
      )}
    </div>
  );
};