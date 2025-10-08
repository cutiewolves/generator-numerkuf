import { Note } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const downloadFile = (content: BlobPart, filename: string, mimeType: string) => {
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

const getFormattedDate = (timestamp: string) => new Date(timestamp).toLocaleString('pl-PL');

const getNotesAsString = (notes: Note[]): string => {
  return notes
    .map(note => {
      const date = getFormattedDate(note.timestamp);
      return `Numer: ${note.number}\nData: ${date}\nNotatka: ${note.note || 'Brak notatki.'}\n\n---\n`;
    })
    .join('');
};

// Format Handlers
export const handleTxt = (notes: Note[]) => downloadFile(getNotesAsString(notes), 'notatki.txt', 'text/plain;charset=utf-8');

export const handlePdf = (notes: Note[]) => {
  const doc = new jsPDF();
  doc.text("Notatki", 14, 16);
  autoTable(doc, {
    head: [['Numer', 'Data', 'Notatka']],
    body: notes.map(n => [n.number, getFormattedDate(n.timestamp), n.note || '']),
    startY: 20,
    columnStyles: {
      0: { cellWidth: 20 }, // Numer column
      1: { cellWidth: 40 }, // Data column
      2: { cellWidth: 'auto' }, // Notatka column
    },
  });
  doc.save('notatki.pdf');
};

export const handleDocx = async (notes: Note[]) => {
  const doc = new Document({
    sections: [{
      children: notes.flatMap(note => [
        new Paragraph({
          children: [new TextRun({ text: `Numer: ${note.number}`, bold: true, size: 28 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: `Data: ${getFormattedDate(note.timestamp)}`, size: 20, italics: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: note.note || '', break: 1 })],
        }),
        new Paragraph({ text: "---" }),
      ]),
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadFile(blob, 'notatki.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
};