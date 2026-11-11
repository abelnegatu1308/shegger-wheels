export function csvValue(value: string | number | null | undefined): string {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]): void {
  if (typeof window === 'undefined') return;
  const content = rows.map((row) => row.map(csvValue).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
