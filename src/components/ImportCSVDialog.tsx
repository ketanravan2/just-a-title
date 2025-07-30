import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, AlertCircle } from 'lucide-react';

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportCSV: (data: {
    serials: Array<{
      serialNumber: string;
      customAttributes: Record<string, string>;
    }>;
    buyerPartNumber: string;
  }) => void;
  availableBuyerPartNumbers: string[];
  contextualBuyerPartNumber?: string;
}

export const ImportCSVDialog: React.FC<ImportCSVDialogProps> = ({
  open,
  onOpenChange,
  onImportCSV,
  availableBuyerPartNumbers,
  contextualBuyerPartNumber,
}) => {
  const [buyerPartNumber, setBuyerPartNumber] = useState(contextualBuyerPartNumber || '');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const data = lines.map(line => line.split(',').map(cell => cell.trim()));
        
        if (data.length === 0) {
          setError('CSV file is empty');
          return;
        }

        setCsvData(data);
        setError('');
      } catch (err) {
        setError('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['serialNumber', 'color', 'size', 'material', 'manufacturingDate'],
      ['CPU000001', 'black', 'standard', 'aluminum', '2024-01-15'],
      ['CPU000002', 'silver', 'compact', 'steel', '2024-01-16'],
      ['CPU000003', 'black', 'standard', 'aluminum', '2024-01-17'],
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_serials.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    if (!buyerPartNumber || csvData.length === 0) return;

    const headers = csvData[0];
    const rows = csvData.slice(1);

    if (headers.length === 0 || headers[0] !== 'serialNumber') {
      setError('First column must be "serialNumber"');
      return;
    }

    const serials = rows.map(row => {
      const customAttributes: Record<string, string> = {};
      
      // Skip first column (serial number) and map remaining columns as custom attributes
      for (let i = 1; i < headers.length && i < row.length; i++) {
        if (headers[i] && row[i]) {
          customAttributes[headers[i]] = row[i];
        }
      }

      return {
        serialNumber: row[0],
        customAttributes,
      };
    }).filter(serial => serial.serialNumber); // Filter out empty serial numbers

    onImportCSV({
      serials,
      buyerPartNumber,
    });

    // Reset form
    setBuyerPartNumber(contextualBuyerPartNumber || '');
    setCsvData([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Serials from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with serial numbers and custom attributes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyerPartNumber">Buyer Part Number</Label>
            <Select 
              value={buyerPartNumber} 
              onValueChange={setBuyerPartNumber}
              disabled={!!contextualBuyerPartNumber}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select buyer part number" />
              </SelectTrigger>
              <SelectContent>
                {availableBuyerPartNumbers.map((bpn) => (
                  <SelectItem key={bpn} value={bpn}>
                    {bpn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="csvFile">CSV File</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadSampleCSV}
                className="gap-1"
              >
                <Download className="w-3 h-3" />
                Sample CSV
              </Button>
            </div>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {csvData.length > 0 && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="text-sm">
                <div className="font-medium">Headers: {csvData[0]?.join(', ')}</div>
                <div className="text-muted-foreground">
                  {csvData.length - 1} rows to import
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!buyerPartNumber || csvData.length === 0}
            className="gap-1"
          >
            <Upload className="w-3 h-3" />
            Import {csvData.length > 0 ? csvData.length - 1 : 0} Serials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};