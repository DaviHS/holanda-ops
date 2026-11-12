const safe = (value: string) =>
  /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

const cell = (value: string) => `"${safe(value).replace(/"/g, '""')}"`;

export function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(cell).join(';'));
  return `﻿${lines.join('\r\n')}`;
}

export function downloadCsv(filename: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/csv;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function toReadableText(headers: string[], rows: string[][]): string {
  return rows
    .map((row) => {
      const [title, ...rest] = row;
      const lines = rest
        .map((value, index) => ({ label: headers[index + 1], value }))
        .filter((item) => item.value.trim() !== '')
        .map((item) => `${item.label}: ${item.value}`);
      return [title, ...lines].join('\n');
    })
    .join('\n\n');
}
