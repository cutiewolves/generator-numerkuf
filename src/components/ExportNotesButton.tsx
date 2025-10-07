import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { FileDown, ChevronDown } from 'lucide-react';
import { Note } from '@/types';
import * as exportUtils from '@/lib/exportUtils';

interface ExportNotesButtonProps {
  notes: Note[];
  disabled: boolean;
}

const ExportNotesButton = ({ notes, disabled }: ExportNotesButtonProps) => {
  const handleExport = (handler: (notes: Note[]) => void) => {
    if (disabled) return;
    handler(notes);
  };

  const itemClassName = "focus:bg-gray-600 focus:text-white";

  return (
    <div className="flex items-center">
      <Button onClick={() => handleExport(exportUtils.handleTxt)} disabled={disabled} variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-r-none">
        <FileDown className="mr-2 h-4 w-4" />
        Eksportuj
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={disabled} variant="outline" size="icon" className="bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-l-none border-l-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white max-h-96 overflow-y-auto">
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handlePdf)}>PDF</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleDocx)}>DOCX (Word)</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleXlsx)}>XLSX (Excel)</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleHtml)}>HTML</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleMarkdown)}>Markdown</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleTxt)}>TXT</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleCsv)}>CSV</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleTsv)}>TSV</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleJson)}>JSON</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleJsonL)}>JSONL</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleXml)}>XML</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleYaml)}>YAML</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleSql)}>SQL (Insert)</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handlePhp)}>PHP</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handlePython)}>Python</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleRuby)}>Ruby</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleCopyToClipboardTxt)}>Kopiuj jako TXT</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleCopyToClipboardMd)}>Kopiuj jako Markdown</DropdownMenuItem>
          <DropdownMenuItem className={itemClassName} onClick={() => handleExport(exportUtils.handleCopyToClipboardJson)}>Kopiuj jako JSON</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportNotesButton;