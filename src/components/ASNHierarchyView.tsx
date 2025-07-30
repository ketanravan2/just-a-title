import React, { useState } from 'react';
import { ASNHierarchy, AssignmentContext } from '@/types/asn';
import { Serial } from '@/types/serial';
import { ASNItemNode } from './ASNItemNode';
import { PackingNode } from './PackingNode';
import { EnhancedAssignmentDialog } from './EnhancedAssignmentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileBox, 
  Container, 
  Plus, 
  Package, 
  TrendingUp 
} from 'lucide-react';

interface ASNHierarchyViewProps {
  hierarchy: ASNHierarchy;
  serials: Serial[];
  onAssignSerials: (serialIds: string[], targetId: string, targetType: string, isTemporary?: boolean) => void;
  className?: string;
}

export const ASNHierarchyView: React.FC<ASNHierarchyViewProps> = ({
  hierarchy,
  serials,
  onAssignSerials,
  className,
}) => {
  const { toast } = useToast();
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean;
    context: AssignmentContext | null;
  }>({ open: false, context: null });

  // Calculate summary statistics
  const totalItems = hierarchy.items.length;
  const totalLots = hierarchy.items.reduce((sum, item) => sum + item.lots.length, 0);
  const totalPackingUnits = hierarchy.packingStructure.reduce((sum, container) => {
    const countUnits = (unit: any): number => {
      return 1 + unit.children.reduce((childSum: number, child: any) => childSum + countUnits(child), 0);
    };
    return sum + countUnits(container);
  }, 0);
  
  const totalSerials = serials.length;
  const assignedSerials = serials.filter(s => s.status !== 'unassigned').length;
  const assignmentRate = totalSerials > 0 ? (assignedSerials / totalSerials) * 100 : 0;

  const handleAssignmentRequest = (context: AssignmentContext) => {
    // Navigate to assignment page with context
    const params = new URLSearchParams({
      type: context.type,
      targetId: context.targetId,
      targetName: context.targetName,
    });
    
    if (context.isTemporary) {
      params.set('temporary', 'true');
    }
    
    // Add buyer part number filter if available
    if (context.buyerPartNumber) {
      params.set('buyerPartNumber', context.buyerPartNumber);
    }
    
    window.location.href = `/assignment?${params.toString()}`;
  };

  const handleGlobalPackAssignment = () => {
    const params = new URLSearchParams({
      type: 'pack',
      targetId: 'global-pack',
      targetName: 'Global Package Assignment',
    });
    
    window.location.href = `/assignment?${params.toString()}`;
  };

  return (
    <div className={className}>
      {/* Summary Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              ASN Overview
            </CardTitle>
            <Button
              onClick={handleGlobalPackAssignment}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Assign to Packing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalItems}</div>
              <div className="text-sm text-muted-foreground">Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalLots}</div>
              <div className="text-sm text-muted-foreground">Lots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalPackingUnits}</div>
              <div className="text-sm text-muted-foreground">Pack Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalSerials}</div>
              <div className="text-sm text-muted-foreground">Total Serials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{assignmentRate.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchical Views */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items" className="gap-2">
            <FileBox className="w-4 h-4" />
            Items & Lots
            <Badge variant="secondary">{totalItems}</Badge>
          </TabsTrigger>
          <TabsTrigger value="packing" className="gap-2">
            <Container className="w-4 h-4" />
            Packing Structure
            <Badge variant="secondary">{hierarchy.packingStructure.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4 mt-6">
          <div className="space-y-4">
            {hierarchy.items.map((item) => (
              <ASNItemNode
                key={item.id}
                item={item}
                onAssignSerials={handleAssignmentRequest}
              />
            ))}
            {hierarchy.items.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No items found in ASN hierarchy
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="packing" className="space-y-4 mt-6">
          <div className="space-y-4">
            {hierarchy.packingStructure.map((container) => (
              <PackingNode
                key={container.id}
                unit={container}
                onAssignSerials={handleAssignmentRequest}
              />
            ))}
            {hierarchy.packingStructure.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No packing structure defined
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};