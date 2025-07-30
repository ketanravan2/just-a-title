import { Serial, Item, Lot, Package, SerialStatus } from '@/types/serial';

// Generate realistic mock serials linked to ASN items
export const mockSerials: Serial[] = [
  // CPU serials (BPN-CPU-001) - 20 total
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `serial-cpu-${i + 1}`,
    serialNumber: `CPU${String(i + 1).padStart(6, '0')}`,
    buyerPartNumber: 'BPN-CPU-001',
    status: i < 12 ? 'assigned' as const : 'unassigned' as const,
    assignedTo: i < 8 ? 'lot-001-A' : i < 12 ? 'lot-001-B' : undefined,
    assignedToType: i < 12 ? 'lot' as const : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  })),
  
  // Memory serials (BPN-MEM-002) - 15 total
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `serial-mem-${i + 1}`,
    serialNumber: `MEM${String(i + 1).padStart(6, '0')}`,
    buyerPartNumber: 'BPN-MEM-002',
    status: i < 6 ? 'assigned' as const : 'unassigned' as const,
    assignedTo: i < 6 ? 'lot-002-A' : undefined,
    assignedToType: i < 6 ? 'lot' as const : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  })),
  
  // GPU serials (BPN-GPU-003) - 8 total (no lots, direct item assignment)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `serial-gpu-${i + 1}`,
    serialNumber: `GPU${String(i + 1).padStart(6, '0')}`,
    buyerPartNumber: 'BPN-GPU-003',
    status: i < 3 ? 'assigned' as const : 'unassigned' as const,
    assignedTo: i < 3 ? 'item-003' : undefined,
    assignedToType: i < 3 ? 'item' as const : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  })),
  
  // NIC serials (BPN-NIC-004) - 25 total
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `serial-nic-${i + 1}`,
    serialNumber: `NIC${String(i + 1).padStart(6, '0')}`,
    buyerPartNumber: 'BPN-NIC-004',
    status: i < 15 ? 'assigned' as const : 'unassigned' as const,
    assignedTo: i < 10 ? 'lot-004-A' : i < 15 ? 'lot-004-B' : undefined,
    assignedToType: i < 15 ? 'lot' as const : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  })),
];

export const mockItems: Item[] = Array.from({ length: 12 }, (_, i) => ({
  id: `item-${i + 1}`,
  name: `Item ${i + 1}`,
  partNumber: `ITM-${String(i + 1).padStart(3, '0')}`,
  description: `High-quality component for manufacturing process ${i + 1}`,
}));

export const mockLots: Lot[] = Array.from({ length: 8 }, (_, i) => ({
  id: `lot-${i + 1}`,
  number: `LOT${String(i + 1).padStart(4, '0')}`,
  description: `Production lot batch ${i + 1}`,
  itemCount: Math.floor(Math.random() * 50) + 10,
}));

export const mockPackages: Package[] = Array.from({ length: 5 }, (_, i) => {
  const packageStatuses = ['pending', 'shipped', 'delivered'] as const;
  return {
    id: `package-${i + 1}`,
    trackingNumber: `PKG${String(i + 1).padStart(8, '0')}`,
    carrier: ['FedEx', 'UPS', 'DHL', 'USPS'][Math.floor(Math.random() * 4)],
    status: packageStatuses[Math.floor(Math.random() * 3)],
  };
});