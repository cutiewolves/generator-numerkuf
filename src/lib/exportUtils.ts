import { Note } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as XLSX from 'xlsx';
import * as yaml from 'js-yaml';
import { showError, showSuccess } from '@/utils/toast';

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

const getNotesAsString = (notes: Note[], format: 'txt' | 'md' = 'txt'): string => {
  return notes
    .map(note => {
      const date = getFormattedDate(note.timestamp);
      if (format === 'md') {
        return `### Numer: ${note.number}\n**Data:** ${date}\n\n**Notatka:**\n${note.note || 'Brak notatki.'}\n\n---\n`;
      }
      return `Numer: ${note.number}\nData: ${date}\nNotatka: ${note.note || 'Brak notatki.'}\n\n---\n`;
    })
    .join('');
};

// Format Handlers
export const handleTxt = (notes: Note[]) => downloadFile(getNotesAsString(notes, 'txt'), 'notatki.txt', 'text/plain;charset=utf-8');
export const handleCsv = (notes: Note[]) => {
  const header = 'Numer,Data,Notatka\n';
  const rows = notes.map(n => `${n.number},${getFormattedDate(n.timestamp)},"${(n.note || '').replace(/"/g, '""')}"`).join('\n');
  downloadFile(header + rows, 'notatki.csv', 'text/csv;charset=utf-8');
};
export const handleTsv = (notes: Note[]) => {
    const header = 'Numer\tData\tNotatka\n';
    const rows = notes.map(n => `${n.number}\t${getFormattedDate(n.timestamp)}\t${(n.note || '').replace(/\t/g, ' ')}`).join('\n');
    downloadFile(header + rows, 'notatki.tsv', 'text/tab-separated-values;charset=utf-8');
};
export const handleJson = (notes: Note[]) => downloadFile(JSON.stringify(notes, null, 2), 'notatki.json', 'application/json;charset=utf-8');
export const handleJsonL = (notes: Note[]) => {
    const content = notes.map(note => JSON.stringify(note)).join('\n');
    downloadFile(content, 'notatki.jsonl', 'application/x-jsonlines;charset=utf-8');
};
export const handleXml = (notes: Note[]) => {
  const content = `<notes>\n${notes.map(n => `  <note>\n    <number>${n.number}</number>\n    <timestamp>${n.timestamp}</timestamp>\n    <text>${n.note || ''}</text>\n  </note>`).join('\n')}\n</notes>`;
  downloadFile(content, 'notatki.xml', 'application/xml;charset=utf-8');
};
export const handleYaml = (notes: Note[]) => downloadFile(yaml.dump(notes), 'notatki.yaml', 'application/x-yaml;charset=utf-8');
export const handleMarkdown = (notes: Note[]) => downloadFile(getNotesAsString(notes, 'md'), 'notatki.md', 'text/markdown;charset=utf-8');
export const handleHtml = (notes: Note[]) => {
    const content = `
      <html>
        <head><title>Notatki</title><style>body{font-family:sans-serif;padding:2em;} .note{border-bottom:1px solid #ccc;padding-bottom:1em;margin-bottom:1em;}</style></head>
        <body><h1>Notatki</h1>${notes.map(n => `<div class="note"><h2>Numer: ${n.number}</h2><p><strong>Data:</strong> ${getFormattedDate(n.timestamp)}</p><p>${(n.note || '').replace(/\n/g, '<br>')}</p></div>`).join('')}</body>
      </html>`;
    downloadFile(content, 'notatki.html', 'text/html;charset=utf-8');
};
export const handleSql = (notes: Note[]) => {
    const content = notes.map(n => `INSERT INTO notes (number, timestamp, note) VALUES (${n.number}, '${n.timestamp}', '${(n.note || '').replace(/'/g, "''")}');`).join('\n');
    downloadFile(content, 'notatki.sql', 'application/sql;charset=utf-8');
};
export const handlePhp = (notes: Note[]) => {
    const content = `<?php\n\n$notes = [\n${notes.map(n => `    ['number' => ${n.number}, 'timestamp' => '${n.timestamp}', 'note' => '${(n.note || '').replace(/'/g, "\\'")}']`).join(',\n')}\n];`;
    downloadFile(content, 'notatki.php', 'application/x-httpd-php;charset=utf-8');
};
export const handlePython = (notes: Note[]) => {
    const content = `notes = [\n${notes.map(n => `    {"number": ${n.number}, "timestamp": "${n.timestamp}", "note": "${(n.note || '').replace(/"/g, '\\"')}"}`).join(',\n')}\n]`;
    downloadFile(content, 'notatki.py', 'text/x-python;charset=utf-8');
};
export const handleRuby = (notes: Note[]) => {
    const content = `notes = [\n${notes.map(n => `  {number: ${n.number}, timestamp: "${n.timestamp}", note: "${(n.note || '').replace(/"/g, '\\"')}"}`).join(',\n')}\n]`;
    downloadFile(content, 'notatki.rb', 'application/x-ruby;charset=utf-8');
};

// Complex Handlers
export const handlePdf = (notes: Note[]) => {
  const doc = new jsPDF();
  doc.text("Notatki", 14, 16);
  autoTable(doc, {
    head: [['Numer', 'Data', 'Notatka']],
    body: notes.map(n => [n.number, getFormattedDate(n.timestamp), n.note || '']),
    startY: 20,
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

export const handleXlsx = (notes: Note[]) => {
  const worksheet = XLSX.utils.json_to_sheet(notes.map(n => ({
    Numer: n.number,
    Data: getFormattedDate(n.timestamp),
    Notatka: n.note || '',
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Notatki');
  XLSX.writeFile(workbook, 'notatki.xlsx');
};

// Clipboard Handlers
const copyToClipboard = (content: string, formatName: string) => {
    navigator.clipboard.writeText(content).then(() => {
        showSuccess(`Notatki skopiowane do schowka jako ${formatName}.`);
    }).catch(() => {
        showError('Nie udało się skopiować do schowka.');
    });
};

export const handleCopyToClipboardTxt = (notes: Note[]) => copyToClipboard(getNotesAsString(notes, 'txt'), 'TXT');
export const handleCopyToClipboardMd = (notes: Note[]) => copyToClipboard(getNotesAsString(notes, 'md'), 'Markdown');
export const handleCopyToClipboardJson = (notes: Note[]) => copyToClipboard(JSON.stringify(notes, null, 2), 'JSON');