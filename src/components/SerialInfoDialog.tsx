import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Serial } from '@/types/serial';
import { Separator } from '@/components/ui/separator';
import { Calendar, Package, Hash, Tag } from 'lucide-react';

interface SerialInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serial: Serial | null;
}

export const SerialInfoDialog: React.FC<SerialInfoDialogProps> = ({
  open,
  onOpenChange,
  serial,
}) => {
  if (!serial) return null;

  const statusConfig = {
    unassigned: { label: 'Unassigned', className: 'bg-status-unassigned text-foreground' },
    assigned: { label: 'Assigned', className: 'bg-status-assigned text-white' },
    reserved: { label: 'Reserved', className: 'bg-status-reserved text-foreground' },
    shipped: { label: 'Shipped', className: 'bg-status-shipped text-white' },
  };

  const statusInfo = statusConfig[serial.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Serial Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
              <div className="font-mono text-lg">{serial.serialNumber}</div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div>
                  <Badge className={statusInfo.className} variant="secondary">
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>

              {serial.buyerPartNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Buyer Part Number</label>
                  <div className="text-sm">{serial.buyerPartNumber}</div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Info */}
          {serial.assignedTo && serial.assignedToType && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Assignment</span>
                </div>
                <div className="text-sm">
                  <span className="capitalize">{serial.assignedToType}:</span> {serial.assignedTo}
                </div>
              </div>
            </>
          )}

          {/* Custom Attributes */}
          {serial.customAttributes && Object.keys(serial.customAttributes).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Custom Attributes</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(serial.customAttributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Child Serials */}
          {serial.childSerials && serial.childSerials.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Child Serials ({serial.childSerials.length})</span>
                <div className="text-sm text-muted-foreground">
                  {serial.childSerials.slice(0, 3).join(', ')}
                  {serial.childSerials.length > 3 && ` +${serial.childSerials.length - 3} more`}
                </div>
              </div>
            </>
          )}

          {/* Parent Serial */}
          {serial.parentSerial && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Parent Serial</span>
                <div className="text-sm text-muted-foreground font-mono">{serial.parentSerial}</div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Timestamps</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{serial.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{serial.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};