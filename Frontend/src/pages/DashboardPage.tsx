'use client'
import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import config from "./config";

interface ImmunizationRecord {
  name: string;
  vaccine: string;
  date: string;
}

const vaccines = [
  "BCG",
  "Hepa B w/n 24hrs",
  "Pentavalent Vaccine (DPT-Hepa B-HIB)",
  "Oral Polio Vaccine (OPV)",
  "Pneumococcal Conjugate Vaccine (PCV)",
  "Inactivated Polio Vaccine (IPV)",
  "Measles, Mumps, Rubella (MMR)",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ImmunizationDashboard() {
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);

  // Fetch data from the API
  const fetchImmunizationData = async () => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/formbuilder/api/responses/84`
      );
      const data = await response.json();

      // Extract and process the immunization data
      const processedData = data
        .filter((item: any) => item.form === 84)
        .map((item: any) => ({
          name: item.response_data["Child Immunization"].Name || "Unknown",
          vaccine: item.response_data["Child Immunization"]["type Immunization"] || "",
          date: item.response_data["Child Immunization"].Date || "",
        }))
        .filter((record: ImmunizationRecord) => record.vaccine && record.date); // Filter valid records

      setRecords(processedData);
    } catch (error) {
      console.error("Error fetching immunization data:", error);
    }
  };

  useEffect(() => {
    fetchImmunizationData();
  }, []);

  const filterRecordsByMonth = (month: string) => {
    return records.filter((record) => {
      const recordMonth = new Date(record.date).toLocaleString("en-us", { month: "long" });
      return recordMonth === month;
    });
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center p-8">
      <title>Child Immunization Dashboard</title>

      {/* Header */}
      <div className="w-full flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Child Immunization Dashboard</h1>
        <div className="flex items-center gap-2">
          <CalendarDays />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white p-6 shadow-md rounded">
        <h2 className="text-xl font-semibold mb-4">Immunization Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Month</th>
                {vaccines.map((vaccine) => (
                  <th key={vaccine} className="p-2 border">
                    {vaccine}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((month) => {
                const monthlyRecords = filterRecordsByMonth(month);
                return (
                  <tr key={month}>
                    <td className="p-2 border font-medium">{month}</td>
                    {vaccines.map((vaccine) => {
                      const count = monthlyRecords.filter((record) => record.vaccine === vaccine)
                        .length;
                      return (
                        <td key={vaccine} className="p-2 border text-center">
                          {count > 0 ? count : ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
