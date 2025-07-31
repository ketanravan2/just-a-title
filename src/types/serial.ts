export type SerialStatus = 'unassigned' | 'assigned' | 'reserved' | 'shipped';

export interface Serial {
  id: string;
  serialNumber: string;
  buyerPartNumber: string; // Make required - serial is always tied to a specific part number
  status: SerialStatus;
  assignedTo?: string;
  assignedToType?: 'item' | 'lot' | 'package';
  assignmentDetails?: {
    targetId: string;
    targetType: 'item' | 'lot' | 'package';
    targetName: string;
    assignedAt: Date;
    isTemporary?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  customAttributes?: Record<string, string>;
  childSerials?: string[];
  parentSerial?: string;
}

export interface Item {
  id: string;
  name: string;
  partNumber: string;
  description?: string;
}

export interface Lot {
  id: string;
  number: string;
  description?: string;
  itemCount: number;
}

export interface Package {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'shipped' | 'delivered';
}

export interface AssignmentTarget {
  id: string;
  type: 'item' | 'lot' | 'package';
  name: string;
  details?: string;
}

export interface DragData {
  serialIds: string[];
  type: 'serial-selection';
}