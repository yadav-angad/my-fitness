import React from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Expense } from './global';

const ExportCSV = ({ data, fileName } : { data: any, fileName: string }) => {
  const downloadCSV = () => {
    // Convert the data array into a CSV string
    console.log('ExportCSV - data : ', data);
    const csvString = [
      ["Header1", "Header2", "Header3"], // Specify your headers here
      ...data?.map(({ dateKey, expensesOnDate }: { dateKey: string, expensesOnDate: Expense[] }) =>  expensesOnDate?.map((expense: Expense) => [expense?.expenseName, expense?.amount, expense?.expenseType])) // Map your data fields accordingly
    ]
    .map(row => row?.join(","))
    .join("\n");

    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv' });

    // Generate a download link and initiate the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return <FileDownloadIcon onClick={downloadCSV} style={{ cursor: 'pointer' }} />;
};

export default ExportCSV;