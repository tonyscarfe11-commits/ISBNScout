// Data export utilities for books

export interface ExportableBook {
  isbn: string;
  title: string;
  author?: string;
  amazonPrice?: number;
  ebayPrice?: number;
  yourCost?: number;
  profit?: number;
  status: string;
  scannedAt: Date;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  includeHeaders?: boolean;
  profitableOnly?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Convert books data to CSV format
 */
export function convertToCSV(books: ExportableBook[], options: ExportOptions = { format: 'csv' }): string {
  const { includeHeaders = true } = options;

  const headers = [
    'ISBN',
    'Title',
    'Author',
    'Amazon Price (£)',
    'eBay Price (£)',
    'Your Cost (£)',
    'Estimated Profit (£)',
    'Status',
    'Scanned Date',
  ];

  const rows = books.map(book => [
    escapeCSVField(book.isbn),
    escapeCSVField(book.title),
    escapeCSVField(book.author || 'Unknown'),
    book.amazonPrice?.toFixed(2) || '-',
    book.ebayPrice?.toFixed(2) || '-',
    book.yourCost?.toFixed(2) || '-',
    book.profit?.toFixed(2) || '-',
    escapeCSVField(book.status),
    formatDate(book.scannedAt),
  ]);

  const csvLines = [];

  if (includeHeaders) {
    csvLines.push(headers.join(','));
  }

  rows.forEach(row => {
    csvLines.push(row.join(','));
  });

  return csvLines.join('\n');
}

/**
 * Convert books data to JSON format
 */
export function convertToJSON(books: ExportableBook[]): string {
  const exportData = books.map(book => ({
    isbn: book.isbn,
    title: book.title,
    author: book.author || 'Unknown',
    amazonPrice: book.amazonPrice,
    ebayPrice: book.ebayPrice,
    yourCost: book.yourCost,
    estimatedProfit: book.profit,
    status: book.status,
    scannedDate: formatDate(book.scannedAt),
  }));

  return JSON.stringify(exportData, null, 2);
}

/**
 * Filter books based on export options
 */
export function filterBooks(books: ExportableBook[], options: ExportOptions): ExportableBook[] {
  let filtered = [...books];

  // Filter by profitability
  if (options.profitableOnly) {
    filtered = filtered.filter(book => (book.profit || 0) > 0);
  }

  // Filter by date range
  if (options.dateFrom) {
    filtered = filtered.filter(book => {
      const scannedDate = new Date(book.scannedAt);
      return scannedDate >= options.dateFrom!;
    });
  }

  if (options.dateTo) {
    filtered = filtered.filter(book => {
      const scannedDate = new Date(book.scannedAt);
      return scannedDate <= options.dateTo!;
    });
  }

  return filtered;
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export books to file
 */
export function exportBooks(books: ExportableBook[], options: ExportOptions): void {
  // Filter books
  const filteredBooks = filterBooks(books, options);

  if (filteredBooks.length === 0) {
    throw new Error('No books to export with the selected filters');
  }

  // Generate content
  let content: string;
  let filename: string;
  let mimeType: string;

  if (options.format === 'json') {
    content = convertToJSON(filteredBooks);
    filename = `isbnscout-export-${formatDateForFilename(new Date())}.json`;
    mimeType = 'application/json';
  } else {
    content = convertToCSV(filteredBooks, options);
    filename = `isbnscout-export-${formatDateForFilename(new Date())}.csv`;
    mimeType = 'text/csv';
  }

  // Trigger download
  downloadFile(content, filename, mimeType);
}

/**
 * Calculate export statistics
 */
export function getExportStats(books: ExportableBook[]): {
  total: number;
  profitable: number;
  totalProfit: number;
  avgProfit: number;
} {
  const profitable = books.filter(b => (b.profit || 0) > 0);
  const totalProfit = books.reduce((sum, b) => sum + (b.profit || 0), 0);
  const avgProfit = books.length > 0 ? totalProfit / books.length : 0;

  return {
    total: books.length,
    profitable: profitable.length,
    totalProfit,
    avgProfit,
  };
}

// Helper functions

function escapeCSVField(field: string): string {
  if (!field) return '';

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatDateForFilename(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}
