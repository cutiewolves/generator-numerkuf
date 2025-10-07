import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileDown, ChevronDown } from 'lucide-react';
import { Note } from '@/types';
import * as exportUtils from '@/lib/exportUtils';

interface ExportNotesButtonProps {
  notes: Note[];
  disabled: boolean;
}

const ExportNotesButton = ({ notes, disabled }: ExportNotesButtonProps) => {
  const handleExport = (handler: (notes: Note[]) => void | Promise<void>) => {
    if (disabled) return;
    handler(notes);
  };

  const itemClassName = "focus:bg-gray-600 focus:text-white";

  return (
    <div className="flex items-center">
      <Button onClick={() => handleExport(exportUtils.handlePdf)} disabled={disabled} variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-r-none">
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
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleDocx)}>DOCX (Word)</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleTxt)}>TXT</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportNotesButton;