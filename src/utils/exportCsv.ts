/**
 * Utility to export data array to CSV spreadsheet file
 * UTF-8 BOM is added so Excel correctly parses special characters and headers.
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  // Add UTF-8 BOM
  let csvContent = '\uFEFF';

  // Format header line
  csvContent += headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';

  // Format row lines
  rows.forEach((row) => {
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
