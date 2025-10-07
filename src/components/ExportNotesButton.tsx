import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileDown, ChevronDown } from 'lucide-react';

interface Note {
  id: string;
  number: number;
  note: string;
  timestamp: string;
}

interface ExportNotesButtonProps {
  notes: Note[];
  disabled: boolean;
}

const ExportNotesButton = ({ notes, disabled }: ExportNotesButtonProps) => {
  const formatAsTxt = () => {
    return notes
      .map(note => {
        const date = new Date(note.timestamp).toLocaleString('pl-PL');
        return `Numer: ${note.number}\nData: ${date}\nNotatka: ${note.note}\n\n---\n`;
      })
      .join('');
  };

  const formatAsCsv = () => {
    const header = 'Numer,Data,Notatka\n';
    const rows = notes
      .map(note => {
        const date = new Date(note.timestamp).toLocaleString('pl-PL');
        const sanitizedNote = `"${note.note.replace(/"/g, '""')}"`; // Handle quotes in notes
        return `${note.number},${date},${sanitizedNote}`;
      })
      .join('\n');
    return header + rows;
  };

  const formatAsJson = () => {
    return JSON.stringify(notes, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: 'txt' | 'csv' | 'json') => {
    if (notes.length === 0) return;

    switch (format) {
      case 'txt':
        downloadFile(formatAsTxt(), 'notatki.txt', 'text/plain;charset=utf-8');
        break;
      case 'csv':
        downloadFile(formatAsCsv(), 'notatki.csv', 'text/csv;charset=utf-8');
        break;
      case 'json':
        downloadFile(formatAsJson(), 'notatki.json', 'application/json;charset=utf-8');
        break;
    }
  };

  return (
    <div className="flex items-center">
      <Button onClick={() => handleExport('txt')} disabled={disabled} variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-r-none">
        <FileDown className="mr-2 h-4 w-4" />
        Eksportuj
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={disabled} variant="outline" size="icon" className="bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-l-none border-l-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
          <DropdownMenuItem onClick={() => handleExport('txt')}>
            Eksportuj jako TXT
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            Eksportuj jako CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            Eksportuj jako JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportNotesButton;