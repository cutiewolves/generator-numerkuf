import { Note } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
  VerticalAlign,
} from 'docx';

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

const getFilename = (notes: Note[], extension: string): string => {
  if (notes.length > 0 && notes.every(n => n.number === notes[0].number)) {
    return `notatki_nr_${notes[0].number}.${extension}`;
  }
  return `notatki.${extension}`;
}

// Format Handlers
export const handleTxt = (notes: Note[]) => downloadFile(getNotesAsString(notes), getFilename(notes, 'txt'), 'text/plain;charset=utf-8');

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
  doc.save(getFilename(notes, 'pdf'));
};

export const handleDocx = async (notes: Note[]) => {
  const createHeaderCell = (text: string) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
      alignment: AlignmentType.CENTER,
    })],
    shading: {
      fill: "3B82F6", // Tailwind blue-500
      type: ShadingType.SOLID,
    },
    verticalAlign: VerticalAlign.CENTER,
  });

  const header = new TableRow({
    children: [
      createHeaderCell("Numer"),
      createHeaderCell("Data"),
      createHeaderCell("Notatka"),
    ],
  });

  const dataRows = notes.map(note => {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: String(note.number), alignment: AlignmentType.CENTER })],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph(getFormattedDate(note.timestamp))],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: (note.note || '').split('\n').map(line => new Paragraph(line)),
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    });
  });

  const table = new Table({
    rows: [header, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    columnWidths: [1500, 2500, 5500],
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: "Notatki", bold: true, size: 32 })],
        }),
        new Paragraph(" "), // Spacer
        table,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadFile(blob, getFilename(notes, 'docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
};