import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import { jsPDF } from "jspdf";
import config from "./config";
import * as XLSX from "xlsx";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";

interface Form {
  id: number;
  title: string;
  schema: {
    sections: {
      sectionname: string;
      fields: {
        label: string;
        type: string;
        options: string[];
      }[];
    }[];
  };
}

interface FormResponse {
  id: number;
  form: number;
  response_data: Record<string, Record<string, any>>;
  date_submitted: string;
  sender: string;
}

export default function PatientList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  const { form, responses }: { form: Form; responses: FormResponse[] } = location.state || {
    form: null,
    responses: [],
  };

  useEffect(() => {
    if (!location.state) {
      console.error("No state found in location. Navigation might have failed.");
    }
  }, [location.state]);

  const clearResponses = async () => {
    try {
      const response = await fetch(`${config.BASE_URL}/formbuilder/api/responses/${form.id}/clear_responses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        // Optionally, you can refresh the page or update the responses state to clear the responses from the UI
        navigate(`/patientPage`); // Adjust as necessary to reload the form page
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error clearing responses:", error);
      alert("An error occurred while clearing the responses.");
    }
  };

  if (!form || !responses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">No form or responses data found.</p>
        <Button onClick={() => navigate("/")} className="ml-4 px-4 py-2 bg-blue-600 text-white">
          Go Back
        </Button>
      </div>
    );
  }

  // Get all unique field names (labels) from responses
  const allFields = new Set<string>();
  responses.forEach((response) => {
    Object.values(response.response_data).forEach((fields) => {
      Object.keys(fields).forEach((label) => allFields.add(label));
    });
  });

  // Include specific fields along with dynamic fields
  const includedFields = ["Date Submitted", "Submitted By"];
  const filteredFields = [...includedFields, ...allFields].filter(
    (field, index, self) => self.indexOf(field) === index // Ensure uniqueness
  );

  const exportToPDF = () => {
    const margin = 10;
    const rowHeight = 10;
  
    // Calculate dynamic width based on the number of fields
    const minColumnWidth = 40; // Minimum width for each column
    const customWidth = Math.max(
      210, // Default A4 width in mm
      filteredFields.length * minColumnWidth + margin * 2
    );
  
    // Calculate dynamic height
    const titleHeight = 20;
    const headerHeight = rowHeight;
    const rowsHeight = responses.length * rowHeight;
    const totalHeight = Math.max(
      297, // Default A4 height in mm
      titleHeight + headerHeight + rowsHeight + margin * 2
    );
  
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [customWidth, totalHeight],
    });
  
    let x = margin;
    let y = margin;
  
    // Title
    doc.setFontSize(12);
    doc.text(`Responses for: ${form.title}`, x, y);
    y += 10;
  
    // Render headers
    doc.setFontSize(10);
    filteredFields.forEach((header) => {
      const columnWidth = (customWidth - margin * 2) / filteredFields.length;
      doc.rect(x, y, columnWidth, rowHeight);
      const lines = doc.splitTextToSize(header, columnWidth - 2);
      doc.text(lines, x + 1, y + 6);
      x += columnWidth;
    });
  
    y += rowHeight;
  
    // Render rows
    responses.forEach((response) => {
      x = margin;
      filteredFields.forEach((field) => {
        const columnWidth = (customWidth - margin * 2) / filteredFields.length;
        let value = "";
  
        if (field === "Response ID") {
          value = response.id.toString();
        } else if (field === "Date Submitted") {
          value = new Date(response.date_submitted).toISOString().split("T")[0];
        } else if (field === "Submitted By") {
          value = response.sender || "N/A";
        } else {
          value = Object.values(response.response_data)
            .map((fields) => (fields[field] ? fields[field] : ""))
            .filter((v) => v !== "")
            .join(", ") || "N/A";
        }
  
        doc.rect(x, y, columnWidth, rowHeight);
        const lines = doc.splitTextToSize(value, columnWidth - 2);
        doc.text(lines, x + 1, y + 6);
        x += columnWidth;
      });
      y += rowHeight;
    });
  
    // Save the PDF
    doc.save(`${form.title}_responses.pdf`);
  };

  const exportToExcel = () => {
    const rows = responses.map((response) => {
      const row: Record<string, any> = {
        "Response ID": response.id,
        "Date Submitted": new Date(response.date_submitted).toISOString().split("T")[0],
        "Submitted By": response.sender || "N/A",
      };
      Object.entries(response.response_data).forEach(([section, fields]) => {
        Object.assign(row, fields);
      });
      return row;
    });
  
    const worksheet = XLSX.utils.json_to_sheet(rows);
  
    // Ensure worksheet['!ref'] is defined before using it
    const headerRange = worksheet['!ref'];
  
    if (headerRange) {
      const range = XLSX.utils.decode_range(headerRange);
  
      // Loop through header cells and apply styles
      for (let col = range.s.c; col <= range.e.c; col++) {
        const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
        if (headerCell) {
          headerCell.s = {
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 }, // Set bold, white color, and size 14
            fill: { fgColor: { rgb: "4CAF50" } }, // Green background for header
            alignment: { horizontal: "center", vertical: "center" },
          };
        }
      }
  
      // Set styles for data cells (rows)
      for (let rowIndex = range.s.r + 1; rowIndex <= range.e.r; rowIndex++) {
        for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })];
          if (cell) {
            cell.s = {
              font: { sz: 12 }, // Font size for data cells
              fill: { fgColor: { rgb: "F0F0F0" } }, // Light gray background for data cells
              alignment: { horizontal: "center", vertical: "center" },
            };
          }
        }
      }
    }
  
    // Apply column width dynamically based on content length
    const columnWidths = filteredFields.map((field) => {
      const maxLength = Math.max(
        ...rows.map((row) => (row[field] ? row[field].toString().length : 0)),
        field.length
      );
      return { wch: maxLength + 2 }; // Add padding to the width
    });
    worksheet['!cols'] = columnWidths;
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
  
    // Write the Excel file
    XLSX.writeFile(workbook, `${form.title}_responses.xlsx`);
  };
  
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 w-full">
          <header className="border-b border-gray-200 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-blue-900">Responses for: {form.title}</h1>
        <div>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-2"
          >
            Export
          </Button>
          <Button
            onClick={clearResponses}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-4 mb-2"
          >
            Clear Responses
          </Button>
        </div>
      </header>
              {/* Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 w-96 relative">
                    {/* Close Button */}
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

                    {/* Modal Content */}
                    <h2 className="text-xl font-bold mb-4 text-black">Export Options</h2>
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => {
                          exportToPDF();
                          setModalOpen(false);
                        }}
                        className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 ml-5"
                      >
                        <FaFilePdf className="mr-1" />
                        Export to PDF
                      </Button>
                      <Button
                        onClick={() => {
                          exportToExcel();
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

      {/* Scrollable Table */}
      <div className="overflow-auto max-h-[500px] max-w-[1430px] bg-white shadow-md rounded-lg">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-blue-700 text-white sticky top-0">
            <tr>
              {filteredFields.map((field) => (
                <th key={field} className="border px-2 py-1 text-xs text-left">
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
              {responses.map((response) => (
                <tr key={response.id} className="hover:bg-gray-100 text-black">
                  {filteredFields.map((field) => {
                    let value = "";

                    if (field === "Response ID") {
                      value = response.id.toString();
                    } else if (field === "Date Submitted") {
                      value = response.date_submitted ? new Date(response.date_submitted).toISOString().split("T")[0] : " ";
                    } else if (field === "Submitted By") {
                      value = response.sender || "N/A";
                    } else {
                      // Access the response_data object
                      const fieldValue = Object.values(response.response_data)
                        .map((fields) => fields[field])
                        .filter((v) => v !== undefined && v !== "");

                      if (fieldValue.length > 0) {
                        const valueItem = fieldValue[0];

                        // Handling Vaccine field (if it is an array of objects)
                        if (Array.isArray(valueItem)) {
                          value = valueItem
                            .map((vaccine: { name: string; date: string }) => `${vaccine.name} (${vaccine.date})`)
                            .join(", ");
                        } else if (typeof valueItem === "object" && valueItem !== null) {
                          // Handling Immunization fields (Name, Age, Sex)
                          if (valueItem.Name) {
                            value += `${valueItem.Name} `;
                          }
                          if (valueItem.Age) {
                            value += `(${valueItem.Age}) `;
                          }
                          if (valueItem.Sex) {
                            value += `Sex: ${valueItem.Sex}`;
                          }
                        } else {
                          // For other fields, use the direct value
                          value = valueItem || "N/A";
                        }
                      } else {
                        value = "N/A"; // Fallback if no value found
                      }
                    }

                    return (
                      <td key={field} className="border px-2 py-1 text-xs text-left">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
