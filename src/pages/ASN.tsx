import React from 'react';
import { ASNHierarchyView } from '@/components/ASNHierarchyView';
import { SerialAssignmentInterface } from '@/components/SerialAssignmentInterface';
import { IndividualAssignment } from '@/components/IndividualAssignment';
import { useAppState } from '@/contexts/AppStateContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine, Grid3X3, BarChart3, Target } from 'lucide-react';

const ASN: React.FC = () => {
  const { serials, asnHierarchy, assignSerials } = useAppState();

  const assignedCount = serials.filter(s => s.status !== 'unassigned').length;
  const assignmentRate = serials.length > 0 ? (assignedCount / serials.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Advanced Shipping Notice (ASN) Management
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{serials.length} total serials</span>
              <span>•</span>
              <span>{assignedCount} assigned ({assignmentRate.toFixed(1)}%)</span>
              <span>•</span>
              <span>{asnHierarchy.items.length} items with {asnHierarchy.items.reduce((sum, item) => sum + item.lots.length, 0)} lots</span>
            </div>
          </CardHeader>
        </Card>

        {/* Main Interface */}
        <Tabs defaultValue="hierarchy" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hierarchy" className="gap-2">
              <TreePine className="w-4 h-4" />
              ASN Hierarchy
            </TabsTrigger>
            <TabsTrigger value="serials" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
              Serial Grid View
            </TabsTrigger>
            <TabsTrigger value="individual" className="gap-2">
              <Target className="w-4 h-4" />
              Individual Assignment
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hierarchy" className="mt-6">
            <ASNHierarchyView
              hierarchy={asnHierarchy}
              serials={serials}
              onAssignSerials={assignSerials}
            />
          </TabsContent>
          
          <TabsContent value="serials" className="mt-6">
            <SerialAssignmentInterface
              serials={serials}
              onAssignSerials={assignSerials}
            />
          </TabsContent>
          
          <TabsContent value="individual" className="mt-6">
            <IndividualAssignment />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ASN;