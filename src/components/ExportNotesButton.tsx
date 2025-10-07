import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
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

  return (
    <div className="flex items-center">
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={disabled} variant="outline" size="icon" className="bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-r-none border-r-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Dokumenty</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handlePdf)}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleDocx)}>DOCX (Word)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleHtml)}>HTML</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleMarkdown)}>Markdown</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleTxt)}>TXT</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Arkusze</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleXlsx)}>XLSX (Excel)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleCsv)}>CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleTsv)}>TSV</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Dane</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleJson)}>JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleJsonL)}>JSONL</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleXml)}>XML</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleYaml)}>YAML</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleSql)}>SQL (Insert)</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Kod</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handlePhp)}>PHP</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handlePython)}>Python</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleRuby)}>Ruby</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator className="bg-gray-700" />
           <DropdownMenuSub>
            <DropdownMenuSubTrigger>Kopiuj do schowka</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleCopyToClipboardTxt)}>jako TXT</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleCopyToClipboardMd)}>jako Markdown</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(exportUtils.handleCopyToClipboardJson)}>jako JSON</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button onClick={() => handleExport(exportUtils.handleTxt)} disabled={disabled} variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-l-none">
        <FileDown className="mr-2 h-4 w-4" />
        Eksportuj
      </Button>
    </div>
  );
};

export default ExportNotesButton;