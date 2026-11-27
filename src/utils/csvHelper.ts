/**
 * CSV Import & Export Helper Utilities
 */

/**
 * Parses CSV text taking quotes and delimiters into account
 */
export function parseCsvContent(csvText: string): string[][] {
  const cleanText = csvText.replace(/^\uFEFF/, ''); // Remove BOM if present
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentToken = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote inside quoted field
        currentToken += '"';
        i++; // skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      currentRow.push(currentToken.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0 || currentRow.length > 0) {
    currentRow.push(currentToken.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * Downloads a template CSV file with headers and a sample row
 */
export function downloadCsvTemplate(filename: string, headers: string[], sampleRows: (string | number)[][]) {
  let csvContent = '\uFEFF'; // UTF-8 BOM
  csvContent += headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';

  sampleRows.forEach((row) => {
    const rowStr = row
      .map((cell) => {
        const str = cell === null || cell === undefined ? '' : String(cell);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',');
    csvContent += rowStr + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
