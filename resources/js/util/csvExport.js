export const exportToCSV = (data, fileName) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data available for export.');
    return;
  }

  // Generate CSV header from keys of the first item
  const header = Object.keys(data[0]);

  // Create CSV rows
  const rows = data.map(row =>
    header.map(field => JSON.stringify(row[field] ?? '')).join(',')
  );

  // Combine header and rows
  const csvContent = [header.join(','), ...rows].join('\n');

  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', fileName || 'report.csv');
  link.click();
};
