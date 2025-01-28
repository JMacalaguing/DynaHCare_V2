import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import config from './config';
import { ClipboardList } from "lucide-react";
import { Button } from '@/Components/ui/button';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface LogbookEntry {
  name: string;
  date: string;
  type_of_consultation: string;
}

const exportToPDF = (data: LogbookEntry[]) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Consultation LogBook', 10, 10);

  const headers = ['Patient Name', 'Date', 'Type Of Consultation'];
  let y = 20;
  doc.setFontSize(12);

  // Set header background color and bold text
  doc.setFillColor(200, 220, 255); // Set the background color (light blue)
  doc.rect(10, y - 6, 60, 8, 'F'); // Background for the first header
  doc.rect(70, y - 6, 60, 8, 'F'); // Background for the second header
  doc.rect(130, y - 6, 60, 8, 'F'); // Background for the third header

  doc.setFont('helvetica', 'bold'); // Make headers bold
  const leftMargin = 5; // Add a left margin to the text

  // Adjusted header positions
  headers.forEach((header, index) => {
    doc.text(header, 10 + index * 60 + leftMargin, y); // Adjusted header position
  });

  y += 10;
  doc.setFont('helvetica', 'normal'); // Reset font weight for the body

  data.forEach((entry, rowIndex) => {
    doc.text(entry.name, 10 + leftMargin, y + rowIndex * 10); // Adjusted position for body text
    doc.text(new Date(entry.date).toDateString(), 70 + leftMargin, y + rowIndex * 10); // Adjusted position for body text
    doc.text(entry.type_of_consultation, 130 + leftMargin, y + rowIndex * 10); // Adjusted position for body text
  });

  doc.save('Consultation_LogBook.pdf');
};

const exportToExcel = (data: LogbookEntry[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(entry => ({
      'Patient Name': entry.name,
      'Date': new Date(entry.date).toDateString(),
      'Type Of Consultation': entry.type_of_consultation,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultation LogBook');
  XLSX.writeFile(workbook, 'Consultation_LogBook.xlsx');
};

export default function ConsultationPage() {
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchLogbookData = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/api/logbook/`);
        const data: LogbookEntry[] = await response.json();
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
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-black" />
            <span className="text-xl font-semibold text-black">Consultation LogBook</span>
          </div>
  
          <div className="flex space-x-4">
            <button
              onClick={clearData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105"
            >
              Clear Data
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-t from-sky-400 to-emerald-300 text-white rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105"
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
  
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-96 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
  
            <h2 className="text-xl font-bold mb-4 text-black">Export Options</h2>
            <div className="flex justify-between items-center">
              <Button
                onClick={() => {
                  exportToPDF(logbookEntries);
                  setModalOpen(false);
                }}
                className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 ml-5"
              >
                <FaFilePdf className="mr-1" />
                Export to PDF
              </Button>
              <Button
                onClick={() => {
                  exportToExcel(logbookEntries);
                  setModalOpen(false);
                }}
                className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 mr-5"
              >
                <FaFileExcel className="mr-1" />
                Export to Excel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}
