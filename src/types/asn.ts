export interface ASNItem {
  id: string;
  name: string;
  partNumber: string;
  buyerPartNumber: string;
  description?: string;
  lots: ASNLot[];
  totalSerials: number;
  assignedSerials: number;
}

export interface ASNLot {
  id: string;
  number: string;
  itemId: string;
  buyerPartNumber: string;
  description?: string;
  totalSerials: number;
  assignedSerials: number;
  serialCount: number;
}

export interface PackingUnit {
  id: string;
  type: 'container' | 'pallet' | 'carton';
  identifier: string;
  parentId?: string;
  children: PackingUnit[];
  totalSerials: number;
  assignedSerials: number;
  level: number;
}

export interface ASNHierarchy {
  items: ASNItem[];
  packingStructure: PackingUnit[];
}

export interface AssignmentContext {
  type: 'item' | 'lot' | 'pack';
  targetId: string;
  targetName: string;
  buyerPartNumber?: string;
  allowedSerials?: string[];
  isTemporary?: boolean;
  warning?: string;
}