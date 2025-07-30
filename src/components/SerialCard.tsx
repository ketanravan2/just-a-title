import React from 'react';
import { Serial, SerialStatus } from '@/types/serial';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Link2 } from 'lucide-react';

interface SerialCardProps {
  serial: Serial;
  isSelected: boolean;
  onSelect: (serialId: string, event: React.MouseEvent) => void;
  onShowInfo: (serial: Serial) => void;
  onLinkChild: (serial: Serial) => void;
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
  onSelect,
  onShowInfo,
  onLinkChild,
  className,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    onSelect(serial.id, event);
  };

  const handleInfoClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onShowInfo(serial);
  };

  const handleLinkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onLinkChild(serial);
  };

  const statusInfo = statusConfig[serial.status];

  return (
    <div
      className={cn(
        'group relative bg-card border rounded-lg p-3 cursor-pointer',
        'transition-all duration-200 hover:shadow-md',
        'touch-manipulation select-none min-h-[80px]',
        isSelected && 'ring-2 ring-selected bg-selected/5',
        className
      )}
      onClick={handleClick}
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

      {/* Action buttons */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInfoClick}
          className="h-6 w-6 p-0"
          title="Show info"
        >
          <Info className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLinkClick}
          className="h-6 w-6 p-0"
          title="Link child serials"
        >
          <Link2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};