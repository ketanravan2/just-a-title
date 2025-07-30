import React, { useState } from 'react';
import { PackingUnit, AssignmentContext } from '@/types/asn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronRight, 
  Container, 
  Truck, 
  Package2,
  Plus 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackingNodeProps {
  unit: PackingUnit;
  onAssignSerials: (context: AssignmentContext) => void;
  className?: string;
}

const getPackingIcon = (type: PackingUnit['type']) => {
  switch (type) {
    case 'container':
      return <Container className="w-4 h-4" />;
    case 'pallet':
      return <Truck className="w-4 h-4" />;
    case 'carton':
      return <Package2 className="w-4 h-4" />;
  }
};

const getPackingColor = (type: PackingUnit['type']) => {
  switch (type) {
    case 'container':
      return 'border-l-blue-500';
    case 'pallet':
      return 'border-l-green-500';
    case 'carton':
      return 'border-l-orange-500';
  }
};

export const PackingNode: React.FC<PackingNodeProps> = ({ 
  unit, 
  onAssignSerials,
  className 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const hasChildren = unit.children.length > 0;
  const assignmentProgress = unit.totalSerials > 0 ? (unit.assignedSerials / unit.totalSerials) * 100 : 0;
  
  const handlePackAssignment = () => {
    const context: AssignmentContext = {
      type: 'pack',
      targetId: unit.id,
      targetName: `${unit.type.toUpperCase()} ${unit.identifier}`,
    };
    onAssignSerials(context);
  };

  return (
    <Card className={cn('border-l-4', getPackingColor(unit.type), className)}>
      <CardContent className="p-4">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-center justify-between mb-3">
            <CollapsibleTrigger className="flex items-center gap-2 hover:bg-muted/50 rounded-md p-1 -ml-1">
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : (
                getPackingIcon(unit.type)
              )}
              <div className="text-left">
                <div className="font-semibold text-sm capitalize">
                  {unit.type} {unit.identifier}
                </div>
                <div className="text-xs text-muted-foreground">
                  Level {unit.level + 1} • {hasChildren ? `${unit.children.length} child units` : 'End unit'}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {unit.assignedSerials}/{unit.totalSerials} packed
              </Badge>
              <Button
                size="sm"
                onClick={handlePackAssignment}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                Assign
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <Progress value={assignmentProgress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {assignmentProgress.toFixed(0)}% packed
            </div>
          </div>

          {/* Children */}
          {hasChildren && (
            <CollapsibleContent className="space-y-3 ml-6 border-l-2 border-muted pl-4">
              {unit.children.map((child) => (
                <PackingNode
                  key={child.id}
                  unit={child}
                  onAssignSerials={onAssignSerials}
                />
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
};