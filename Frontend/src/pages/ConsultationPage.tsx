import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import config from './config';

// Function to export logbook data to CSV
const exportToCSV = (data: { name: string; date: string }[]) => {
  const csvRows = [
    ['Patient Name', 'Date'], // Column headers
    ...data.map(entry => [entry.name, new Date(entry.date).toDateString()]), // Data rows
  ];

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'logbook_entries.csv');
  link.click();
};

export default function ConsultationPage() {
  // State to store logbook data
  const [logbookEntries, setLogbookEntries] = useState<{ name: string; date: string }[]>([]);

  // Fetch logbook data from the server on component mount
  useEffect(() => {
    const fetchLogbookData = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/api/logbook/`); // Replace with your API endpoint
        const data = await response.json();
        setLogbookEntries(data); // Assuming the API response is an array of logbook entries
      } catch (error) {
        console.error('Error fetching logbook data:', error);
      }
    };

    fetchLogbookData();
  }, []); // Empty dependency array to fetch data once on mount

  // Function to clear data from both state and database
  const clearData = async () => {
    try {
      const response = await fetch(`${config.BASE_URL}/api/logbook/`, {
        method: 'DELETE', // Use DELETE method to remove data
      });

      if (response.ok) {
        setLogbookEntries([]); // Clear the state
        alert('Data cleared successfully');
      } else {
        alert('Error clearing data');
      }
    } catch (error) {
      console.error('Error clearing logbook data:', error);
      alert('Error clearing data');
    }
  };

  return (
    <div className="flex-col gap-5 w-full bg-gray-50 min-h-screen">
      <header className="border-b border-[#E5E7EB] bg-white shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-semibold text-[#040E46]">Consultation LogBook</span>
          </div>
          {/* Add Clear Data and Export Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={clearData}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Clear Data
            </button>
            <button
              onClick={() => exportToCSV(logbookEntries)}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Export
            </button>
          </div>
        </div>
      </header>
    
      <div className="w-full text-black">
        {/* Table to display logbook data */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-black">Patient Name</TableHead>
              <TableHead className="w-[100px] text-black">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logbookEntries.length > 0 ? (
              logbookEntries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="font-medium">{new Date(entry.date).toDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">No logbook entries available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
