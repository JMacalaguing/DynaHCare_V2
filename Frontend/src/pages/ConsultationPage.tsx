import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import config from './config';
import { ClipboardList } from "lucide-react";

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
  const [logbookEntries, setLogbookEntries] = useState<{ name: string; date: string, type_of_consultation:string }[]>([]);

  useEffect(() => {
    const fetchLogbookData = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/api/logbook/`);
        const data = await response.json();
        setLogbookEntries(data);
      } catch (error) {
        console.error('Error fetching logbook data:', error);
      }
    };

    fetchLogbookData();
  }, []);

  const clearData = async () => {
    try {
      const response = await fetch(`${config.BASE_URL}/api/logbook/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLogbookEntries([]);
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
    <div className="w-full bg-gradient-to-tr from-gray-100 via-blue-50 to-white flex flex-col">
      <header className="shadow-lg bg-white">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          {/* Left Side: Icon and Title */}
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-black" />
            <span className="text-xl font-semibold text-black">Consultation LogBook</span>
          </div>

          {/* Right Side: Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={clearData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105"
            >
              Clear Data
            </button>
            <button
              onClick={() => exportToCSV(logbookEntries)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105"
            >
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <Table className="shadow-md">
            <TableHeader className="bg-gradient-to-t from-sky-300 to-emerald-300">
              <TableRow>
                <TableHead className="text-gray-700 font-bold h-16 text-xl">Patient Name</TableHead>
                <TableHead className="text-gray-700 font-bold h-16 text-xl">Date</TableHead>
                <TableHead className="text-gray-700 font-bold h-16 text-xl">Type Of Consultation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  {logbookEntries.length > 0 ? (
    logbookEntries.map((entry, index) => (
      <TableRow key={index} className="hover:bg-gray-50 transition-all">
        <TableCell className="text-gray-900 h-14">{entry.name}</TableCell>
        <TableCell className="text-gray-900 h-14">{new Date(entry.date).toDateString()}</TableCell>
        <TableCell className="text-gray-900 h-14">{entry.type_of_consultation}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={3} className="text-center text-gray-500">
        No logbook entries available
      </TableCell>
    </TableRow>
  )}
</TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
