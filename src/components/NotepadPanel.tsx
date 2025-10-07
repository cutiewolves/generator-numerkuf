import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';

interface Note {
  id: string;
  number: number;
  note: string;
  timestamp: string;
}

interface NotepadPanelProps {
  notes: Note[];
  onNoteChange: (id: string, newNote: string) => void;
}

const NotepadPanel = ({ notes, onNoteChange }: NotepadPanelProps) => {
  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {notes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-center py-8">Brak notatek.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {notes.map((note) => (
                <motion.li
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2 bg-gray-700 p-3 rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl text-white">{note.number}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(note.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <Textarea
                    placeholder="Dodaj notatkę..."
                    value={note.note}
                    onChange={(e) => onNoteChange(note.id, e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white resize-none"
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotepadPanel;