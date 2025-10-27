import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2, FileDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as exportUtils from '@/lib/exportUtils';

interface NotepadPanelProps {
  notes: Note[];
  onNoteChange: (id: string, newNote: string) => void;
  onNoteDelete: (id: string) => void;
}

const NotepadPanel = ({ notes, onNoteChange, onNoteDelete }: NotepadPanelProps) => {
  const groupedNotes = notes.reduce((acc, note) => {
    (acc[note.number] = acc[note.number] || []).push(note);
    return acc;
  }, {} as Record<number, Note[]>);

  const sortedNumbers = Object.keys(groupedNotes)
    .map(Number)
    .sort((a, b) => {
      const latestTimestampA = Math.max(...groupedNotes[a].map(n => new Date(n.timestamp).getTime()));
      const latestTimestampB = Math.max(...groupedNotes[b].map(n => new Date(n.timestamp).getTime()));
      return latestTimestampB - latestTimestampA;
    });

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {notes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-center py-8">Brak notatek.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {sortedNumbers.map((number) => {
                const notesForNumber = groupedNotes[number];
                return (
                  <motion.div
                    key={number}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-2 bg-gray-700 p-3 rounded-md"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-600">
                      <h3 className="font-bold text-xl text-white">Numer: {number}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-600">
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                          <DropdownMenuItem className="focus:bg-gray-600 focus:text-white" onClick={() => exportUtils.handlePdf(notesForNumber)}>PDF</DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-gray-600 focus:text-white" onClick={() => exportUtils.handleDocx(notesForNumber)}>DOCX</DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-gray-600 focus:text-white" onClick={() => exportUtils.handleTxt(notesForNumber)}>TXT</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <ul className="space-y-4 pt-2">
                      {notesForNumber.map((note) => (
                        <li key={note.id} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs">
                              {new Date(note.timestamp).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-gray-600"
                              onClick={() => onNoteDelete(note.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Dodaj notatkę..."
                            value={note.note}
                            onChange={(e) => onNoteChange(note.id, e.target.value)}
                            className="bg-gray-600 border-gray-500 text-white resize-y"
                          />
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotepadPanel;