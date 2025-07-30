import React, { useState, useCallback, useMemo } from 'react';
import { Serial } from '@/types/serial';
import { SerialCard } from './SerialCard';
import { ActionBar } from './ActionBar';
import { AssignmentDialog } from './AssignmentDialog';
import { SerialInfoDialog } from './SerialInfoDialog';
import { LinkChildSerialsDialog } from './LinkChildSerialsDialog';
import { CreateSerialDialog } from './CreateSerialDialog';
import { BulkCreateDialog } from './BulkCreateDialog';
import { ImportCSVDialog } from './ImportCSVDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Search, CheckSquare, Square, Plus } from 'lucide-react';

interface SerialAssignmentInterfaceProps {
  serials: Serial[];
  onAssignSerials: (serialIds: string[], targetId: string, targetType: 'item' | 'lot' | 'package') => void;
  onCreateSerial?: (serialData: { serialNumber: string; buyerPartNumber: string; customAttributes: Record<string, string> }) => void;
  onBulkCreate?: (data: { prefix: string; startNumber: number; count: number; buyerPartNumber: string }) => void;
  onImportCSV?: (data: { serials: Array<{ serialNumber: string; customAttributes: Record<string, string> }>; buyerPartNumber: string }) => void;
  onLinkChildSerials?: (parentSerialId: string, childSerialIds: string[]) => void;
  availableBuyerPartNumbers?: string[];
  className?: string;
  hideAssignmentDialog?: boolean;
  hideCreateButtons?: boolean;
  contextualBuyerPartNumber?: string; // When context provides part number
  assignmentMode?: 'full' | 'simple';
  assignmentContext?: {
    type: 'item' | 'lot' | 'pack';
    targetId: string;
    targetName: string;
    buyerPartNumber?: string;
    isTemporary?: boolean;
  };
}

export const SerialAssignmentInterface: React.FC<SerialAssignmentInterfaceProps> = ({
  serials,
  onAssignSerials,
  onCreateSerial,
  onBulkCreate,
  onImportCSV,
  onLinkChildSerials,
  availableBuyerPartNumbers = [],
  className,
  hideAssignmentDialog = false,
  hideCreateButtons = false,
  assignmentMode = 'full',
  assignmentContext,
  contextualBuyerPartNumber,
}) => {
  const { toast } = useToast();
  
  // State management
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    assignmentMode === 'simple' ? 'unassigned' : 'all'
  );
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean;
    type: 'item' | 'lot' | 'package' | null;
  }>({ open: false, type: null });
  const [infoDialog, setInfoDialog] = useState<{ open: boolean; serial: Serial | null }>({ open: false, serial: null });
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; serial: Serial | null }>({ open: false, serial: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [bulkCreateDialog, setBulkCreateDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);

  // Filter and search serials
  const filteredSerials = useMemo(() => {
    return serials.filter((serial) => {
      const matchesSearch = 
        serial.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serial.buyerPartNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;
      
      const matchesStatus = statusFilter === 'all' || serial.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [serials, searchQuery, statusFilter]);

  // Selection handlers
  const handleSerialSelect = useCallback((serialId: string, event: React.MouseEvent) => {
    const serialIndex = filteredSerials.findIndex(s => s.id === serialId);
    
    if (event.shiftKey && lastSelectedIndex !== null) {
      // Range selection
      const start = Math.min(lastSelectedIndex, serialIndex);
      const end = Math.max(lastSelectedIndex, serialIndex);
      const newSelection = new Set(selectedSerials);
      
      for (let i = start; i <= end; i++) {
        newSelection.add(filteredSerials[i].id);
      }
      
      setSelectedSerials(newSelection);
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select toggle
      const newSelection = new Set(selectedSerials);
      if (newSelection.has(serialId)) {
        newSelection.delete(serialId);
      } else {
        newSelection.add(serialId);
      }
      setSelectedSerials(newSelection);
      setLastSelectedIndex(serialIndex);
    } else {
      // Single selection
      setSelectedSerials(new Set([serialId]));
      setLastSelectedIndex(serialIndex);
    }
  }, [filteredSerials, selectedSerials, lastSelectedIndex]);

  const handleSelectAll = useCallback(() => {
    if (selectedSerials.size === filteredSerials.length) {
      setSelectedSerials(new Set());
    } else {
      setSelectedSerials(new Set(filteredSerials.map(s => s.id)));
    }
    setLastSelectedIndex(null);
  }, [filteredSerials, selectedSerials.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedSerials(new Set());
    setLastSelectedIndex(null);
  }, []);

  // Assignment handlers
  const openAssignmentDialog = useCallback((type: 'item' | 'lot' | 'package') => {
    if (selectedSerials.size === 0) {
      toast({
        title: "No serials selected",
        description: "Please select one or more serials to assign.",
        variant: "destructive",
      });
      return;
    }
    
    setAssignmentDialog({ open: true, type });
  }, [selectedSerials.size, toast]);

  const handleAssignment = useCallback((targetId: string, targetType: 'item' | 'lot' | 'package') => {
    const serialIds = Array.from(selectedSerials);
    onAssignSerials(serialIds, targetId, targetType);
    
    toast({
      title: "Assignment successful",
      description: `${serialIds.length} serial${serialIds.length !== 1 ? 's' : ''} assigned to ${targetType}.`,
    });
    
    setSelectedSerials(new Set());
    setLastSelectedIndex(null);
  }, [selectedSerials, onAssignSerials, toast]);

  const handleSimpleAssignment = useCallback(() => {
    if (selectedSerials.size === 0 || !assignmentContext) return;
    
    const targetType = assignmentContext.type === 'pack' ? 'package' : assignmentContext.type;
    const serialIds = Array.from(selectedSerials);
    onAssignSerials(serialIds, assignmentContext.targetId, targetType);
    
    toast({
      title: "Assignment successful",
      description: `${serialIds.length} serial${serialIds.length !== 1 ? 's' : ''} assigned to ${assignmentContext.targetName}.`,
    });
    
    setSelectedSerials(new Set());
    setLastSelectedIndex(null);
  }, [selectedSerials, assignmentContext, onAssignSerials, toast]);

  const handleUnassignment = useCallback(() => {
    if (selectedSerials.size === 0) return;
    
    const serialIds = Array.from(selectedSerials);
    onAssignSerials(serialIds, '', 'item'); // Passing empty targetId to unassign
    
    toast({
      title: "Unassignment successful",
      description: `${serialIds.length} serial${serialIds.length !== 1 ? 's' : ''} unassigned.`,
    });
    
    setSelectedSerials(new Set());
    setLastSelectedIndex(null);
  }, [selectedSerials, onAssignSerials, toast]);

  // Check selected serials status to determine button visibility
  const selectedSerialsData = useMemo(() => {
    return filteredSerials.filter(s => selectedSerials.has(s.id));
  }, [filteredSerials, selectedSerials]);

  const hasUnassignedSerials = selectedSerialsData.some(s => s.status === 'unassigned');
  const hasAssignedSerials = selectedSerialsData.some(s => s.status !== 'unassigned');

  // Dialog handlers
  const handleShowInfo = useCallback((serial: Serial) => {
    setInfoDialog({ open: true, serial });
  }, []);

  const handleLinkChild = useCallback((serial: Serial) => {
    setLinkDialog({ open: true, serial });
  }, []);

  // Create handlers
  const handleCreateSerial = useCallback((data: { serialNumber: string; buyerPartNumber: string; customAttributes: Record<string, string> }) => {
    onCreateSerial?.(data);
    toast({
      title: "Serial created",
      description: `Serial ${data.serialNumber} created successfully.`,
    });
  }, [onCreateSerial, toast]);

  const handleBulkCreate = useCallback((data: { prefix: string; startNumber: number; count: number; buyerPartNumber: string }) => {
    onBulkCreate?.(data);
    toast({
      title: "Bulk create successful",
      description: `${data.count} serials created successfully.`,
    });
  }, [onBulkCreate, toast]);

  const handleImportCSV = useCallback((data: { serials: Array<{ serialNumber: string; customAttributes: Record<string, string> }>; buyerPartNumber: string }) => {
    onImportCSV?.(data);
    toast({
      title: "Import successful",
      description: `${data.serials.length} serials imported successfully.`,
    });
  }, [onImportCSV, toast]);

  const handleLinkChildSerials = useCallback((parentSerialId: string, childSerialIds: string[]) => {
    onLinkChildSerials?.(parentSerialId, childSerialIds);
    toast({
      title: "Child serials linked",
      description: `${childSerialIds.length} child serial${childSerialIds.length !== 1 ? 's' : ''} linked successfully.`,
    });
  }, [onLinkChildSerials, toast]);

  const allSelected = filteredSerials.length > 0 && selectedSerials.size === filteredSerials.length;
  const someSelected = selectedSerials.size > 0 && selectedSerials.size < filteredSerials.length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header and controls */}
      <Card>
        <CardHeader>
          <CardTitle>Serial Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Actions row */}
          {!hideCreateButtons && (
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setCreateDialog(true)}
                  disabled={!onCreateSerial}
                >
                  <Plus className="w-4 h-4" />
                  Create Serial
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setBulkCreateDialog(true)}
                  disabled={!onBulkCreate}
                >
                  <Plus className="w-4 h-4" />
                  Bulk Create
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setImportDialog(true)}
                  disabled={!onImportCSV}
                >
                  <Plus className="w-4 h-4" />
                  Import CSV
                </Button>
              </div>
            </div>
          )}

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search serials or part numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selection controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="gap-2"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {allSelected ? 'Deselect All' : 'Select All Visible'}
              </Button>
              
              {selectedSerials.size > 0 && (
                <Badge variant="secondary">
                  {selectedSerials.size} of {filteredSerials.length} selected
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredSerials.length} of {serials.length} serials
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serial grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {filteredSerials.map((serial) => (
          <SerialCard
            key={serial.id}
            serial={serial}
            isSelected={selectedSerials.has(serial.id)}
            onSelect={handleSerialSelect}
            onShowInfo={handleShowInfo}
            onLinkChild={handleLinkChild}
            className="animate-in fade-in-0 duration-200"
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredSerials.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'No serials match your search criteria.' 
                : 'No serials available.'}
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action bar - appears when serials are selected */}
      {selectedSerials.size > 0 && (
        <ActionBar
          selectedCount={selectedSerials.size}
          onAssignToItem={assignmentMode === 'full' ? () => openAssignmentDialog('item') : undefined}
          onAssignToLot={assignmentMode === 'full' ? () => openAssignmentDialog('lot') : undefined}
          onAssignToPackage={assignmentMode === 'full' ? () => openAssignmentDialog('package') : undefined}
          onAssign={assignmentMode === 'simple' && hasUnassignedSerials ? handleSimpleAssignment : undefined}
          onUnassign={assignmentMode === 'simple' && hasAssignedSerials ? handleUnassignment : undefined}
          onClearSelection={handleClearSelection}
          mode={assignmentMode}
        />
      )}

      {/* Assignment dialog */}
      {!hideAssignmentDialog && (
        <AssignmentDialog
          open={assignmentDialog.open}
          onOpenChange={(open) => setAssignmentDialog({ open, type: null })}
          selectedSerials={Array.from(selectedSerials)}
          assignmentType={assignmentDialog.type}
          onAssign={handleAssignment}
        />
      )}

      {/* Info dialog */}
      <SerialInfoDialog
        open={infoDialog.open}
        onOpenChange={(open) => setInfoDialog({ open, serial: null })}
        serial={infoDialog.serial}
      />

      {/* Link child serials dialog */}
      <LinkChildSerialsDialog
        open={linkDialog.open}
        onOpenChange={(open) => setLinkDialog({ open, serial: null })}
        parentSerial={linkDialog.serial}
        availableSerials={serials}
        availableBuyerPartNumbers={availableBuyerPartNumbers}
        onLinkSerials={handleLinkChildSerials}
      />

      {/* Create serial dialog */}
      <CreateSerialDialog
        open={createDialog}
        onOpenChange={setCreateDialog}
        onCreateSerial={handleCreateSerial}
        availableBuyerPartNumbers={availableBuyerPartNumbers}
        contextualBuyerPartNumber={contextualBuyerPartNumber}
      />

      {/* Bulk create dialog */}
      <BulkCreateDialog
        open={bulkCreateDialog}
        onOpenChange={setBulkCreateDialog}
        onBulkCreate={handleBulkCreate}
        availableBuyerPartNumbers={availableBuyerPartNumbers}
        contextualBuyerPartNumber={contextualBuyerPartNumber}
      />

      {/* Import CSV dialog */}
      <ImportCSVDialog
        open={importDialog}
        onOpenChange={setImportDialog}
        onImportCSV={handleImportCSV}
        availableBuyerPartNumbers={availableBuyerPartNumbers}
        contextualBuyerPartNumber={contextualBuyerPartNumber}
      />
    </div>
  );
};