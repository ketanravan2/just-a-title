export type SerialStatus = 'unassigned' | 'assigned' | 'reserved' | 'shipped';

export interface Serial {
  id: string;
  serialNumber: string;
  buyerPartNumber?: string;
  status: SerialStatus;
  assignedTo?: string;
  assignedToType?: 'item' | 'lot' | 'package';
  createdAt: Date;
  updatedAt: Date;
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