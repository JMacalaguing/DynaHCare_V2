import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import { jsPDF } from "jspdf";
import config from "./config";

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
  date: string;
  sender: string;
}

export default function PatientList() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const includedFields = ["Response ID", "Date Submitted", "Submitted By"];
  const filteredFields = [...includedFields, ...allFields].filter(
    (field, index, self) => self.indexOf(field) === index // Ensure uniqueness
  );

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    const margin = 10;
    const pageWidth = doc.internal.pageSize.width - margin * 2;
    const pageHeight = doc.internal.pageSize.height - margin * 2;
  
    const fieldsPerPage = 5; // Number of fields to display per table
    const allFieldArray = filteredFields;
  
    // Title
    doc.setFontSize(12);
    doc.text(`Responses for: ${form.title}`, margin, margin);
  
    let currentPage = 0;
  
    // Function to render a table for a specific set of fields
    const renderTable = (startIndex: number, endIndex: number, pageNumber: number) => {
      const headers = allFieldArray.slice(startIndex, endIndex);
      const columnWidths = headers.map(() => 50); // Set a fixed column width for simplicity
  
      let x = margin;
      let y = margin + 10;
  
      // Page header
      if (pageNumber > 0) {
        doc.addPage();
        doc.text(`Responses for: ${form.title} - Page ${pageNumber + 1}`, margin, margin);
        y = margin + 10;
      }
  
      // Render headers
      doc.setFontSize(10);
      headers.forEach((header, index) => {
        doc.rect(x, y, columnWidths[index], 10);
        const lines = doc.splitTextToSize(header, columnWidths[index] - 2);
        doc.text(lines, x + 1, y + 6);
        x += columnWidths[index];
      });
  
      // Render rows
      y += 10;
  
      responses.forEach((response) => {
        x = margin;
        const rowHeight = 10;
  
        headers.forEach((field, index) => {
          let value = "";
          if (field === "Response ID") {
            value = response.id.toString();
          } else if (field === "Date Submitted") {
            // Format the date to 'YYYY-MM-DD'
            value = new Date(response.date).toISOString().split('T')[0];
          } else if (field === "Submitted By") {
            value = response.sender || "N/A";
          } else {
            // Remove empty/undefined values from response_data
            value = Object.values(response.response_data)
              .map((fields) => (fields[field] ? fields[field] : ""))
              .filter((v) => v !== "") // Filter out empty strings
              .join(", ") || "N/A";
          }
  
          doc.rect(x, y, columnWidths[index], rowHeight);
          const lines = doc.splitTextToSize(value, columnWidths[index] - 2);
          doc.text(lines, x + 1, y + 6);
          x += columnWidths[index];
        });
  
        y += rowHeight;
  
        // Check if we need a new page
        if (y + rowHeight > pageHeight) {
          doc.addPage();
          y = margin + 10;
          x = margin;
  
          // Re-render the table headers on the new page
          headers.forEach((header, index) => {
            doc.rect(x, y, columnWidths[index], 10);
            const lines = doc.splitTextToSize(header, columnWidths[index] - 2);
            doc.text(lines, x + 1, y + 6);
            x += columnWidths[index];
          });
          y += 10;
        }
      });
    };
  
    // Render tables in chunks of fields
    for (let i = 0; i < allFieldArray.length; i += fieldsPerPage) {
      renderTable(i, i + fieldsPerPage, currentPage);
      currentPage++;
    }
  
    doc.save(`${form.title}_responses.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 w-full">
      <header className="border-b border-gray-200 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-blue-900">Responses for: {form.title}</h1>
        <div>
          <Button
            onClick={exportToPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Export to PDF
          </Button>
          <Button
            onClick={clearResponses}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-4"
          >
            Clear Responses
          </Button>
        </div>
      </header>

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
                    value = response.date ? new Date(response.date).toISOString().split("T")[0] : " ";
                  } else if (field === "Submitted By") {
                    value = response.sender;
                  } else {
                    value =
                      Object.values(response.response_data)
                        .map((fields) => fields[field])
                        .filter((v) => v !== undefined && v !== "")
                        .join(", ") || "    ";
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
