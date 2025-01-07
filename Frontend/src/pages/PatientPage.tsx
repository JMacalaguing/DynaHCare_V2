import React, { useEffect, useState } from "react";
import { Button } from "../Components/ui/button";
import config from "./config";
import { useNavigate } from "react-router-dom";
import { LayoutDashboardIcon, CalendarDays } from "lucide-react";

interface Field {
  label: string;
  type: string;
  options: string[];
}

interface Section {
  sectionname: string;
  fields: Field[];
}

interface Form {
  id: number;
  title: string;
  schema: {
    sections: Section[];
  };
}

interface FormResponse {
  id: number;
  form: number;
  response_data: Record<string, Record<string, any>>;
  date: string;
  sender: string;
}

const vaccines = [
  "BCG",
  "Hepatitis B",
  "Pentavalent Vaccine (DPT-Hepa B-HIB)",
  "Oral Polio Vaccine (OPV)",
  "Pneumococcal Conjugate Vaccine (PCV)",
  "Inactivated Polio Vaccine (IPV)",
  "Measles, Mumps, Rubella (MMR)",
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Modal = ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4 text-blue-900">No Patients Found</h2>
        <p className="mb-4 text-blue-900">{message}</p>
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} className="bg-[#00205B] text-white px-4 py-2 rounded-lg">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const calculateQuarterlyTotals = (data: Record<string, number[]>) => {
  const totals = {
    firstQuarter: 0,
    secondQuarter: 0,
    thirdQuarter: 0,
    fourthQuarter: 0,
  };

  for (const vaccine in data) {
    const counts = data[vaccine];
    totals.firstQuarter += counts.slice(0, 3).reduce((sum, val) => sum + val, 0); // January to March
    totals.secondQuarter += counts.slice(3, 6).reduce((sum, val) => sum + val, 0); // April to June
    totals.thirdQuarter += counts.slice(6, 9).reduce((sum, val) => sum + val, 0); // July to September
    totals.fourthQuarter += counts.slice(9, 12).reduce((sum, val) => sum + val, 0); // October to December
  }

  return totals;
};

const calculateTotalAnnualSummary = (data: Record<string, number[]>) =>
  Object.values(data).reduce((total, vaccineData) => total + vaccineData.reduce((sum, count) => sum + count, 0), 0);

export default function Home() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vaccineData, setVaccineData] = useState(() =>
    vaccines.reduce((acc, vaccine) => {
      acc[vaccine] = months.map(() => 0); 
      return acc;
    }, {} as Record<string, number[]>)
  );

  const navigate = useNavigate();

  const FORMS_API = `${config.BASE_URL}/formbuilder/api/forms/`;
  const RESPONSES_API = `${config.BASE_URL}/formbuilder/api/responses/`;

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const response = await fetch(FORMS_API);
        const data: Form[] = await response.json();
        setForms(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching forms:", error);
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const fetchFormDetails = async (form: Form) => {
    try {
      setLoading(true);
      const response = await fetch(RESPONSES_API);
      const data: FormResponse[] = await response.json();

      const filteredResponses = data.filter((response) => response.form === form.id);

      if (filteredResponses.length === 0) {
        setIsModalOpen(true);
      } else {
        navigate("/patients", {
          state: {
            form,
            responses: filteredResponses,
          },
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching form details:", error);
      setLoading(false);
    }
  };

  const vaccineMapping: Record<string, string> = {
    BCG:"BCG",
    Hepa: "Hepatitis B",
    Penta: "Pentavalent Vaccine (DPT-Hepa B-HIB)",
    OPV: "Oral Polio Vaccine (OPV)",
    PCV: "Pneumococcal Conjugate Vaccine (PCV)",
    IPV: "Inactivated Polio Vaccine (IPV)",
    MMR: "Measles, Mumps, Rubella (MMR)",
  };
  
  const fetchVaccineData = async () => {
    try {
      setLoading(true);
      const response = await fetch(RESPONSES_API);
      const data: FormResponse[] = await response.json();
      const filteredResponses = data.filter((response) => response.form === 84);
  
      if (filteredResponses.length === 0) {
        setIsModalOpen(true);
      } else {
        const transformedData = vaccines.reduce((acc, vaccine) => {
          acc[vaccine] = months.map(() => 0);
          return acc;
        }, {} as Record<string, number[]>);
  
        filteredResponses.forEach((response) => {
          const immunizationData = response.response_data.Immunization;
          if (immunizationData) {
            const vaccineName = immunizationData["Name of Vaccine"];
            const date = immunizationData.Date;
  
            if (vaccineName && date) {
              const monthIndex = new Date(date).getMonth();
  
              // Match keyword to full vaccine description
              const mappedVaccine = Object.keys(vaccineMapping).find((key) =>
                vaccineName.includes(key)
              );
  
              if (mappedVaccine && transformedData[vaccineMapping[mappedVaccine]]) {
                transformedData[vaccineMapping[mappedVaccine]][monthIndex] += 1;
              }
            }
          }
        });
  
        console.log("Transformed Data:", transformedData);
        setVaccineData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching response data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccineData();
  }, []);

  const currentDate = new Date().toLocaleDateString();
  const calculateAnnualTotal = (data: number[]) =>
    data.reduce((total, count) => total + count, 0);

  const quarterlyTotals = calculateQuarterlyTotals(vaccineData);
  const totalAnnualSummary = calculateTotalAnnualSummary(vaccineData);

  return (
    <div className="min-h-screen bg-gradient-to-t from-sky-300 to-blue-50 w-full overflow-auto">
      <title>Patient Healthcare Portal</title>
      <meta name="description" content="Patient Healthcare Portal" />

      <header className="border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutDashboardIcon className="h-6 w-6 text-black" />
            <span className="text-xl font-semibold text-black">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays color="black" fill="white" />
            <span className="font-medium text-black">{currentDate}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 overflow-x-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900  text-center">NATIONAL IMMUNIZATION PROGRAM</h2>
          <h6 className="text-sm text-center text-gray-500 mb-4">Area: Barangay Lumbia, Cagayan De Oro City 9000</h6>
          {/* Quarterly Totals Display */}
          <div className="grid gap-6 md:grid-cols-4 mb-4 text-center">
            <div className="bg-gradient-to-t from-sky-400 to-emerald-300 h-20 p-2 text-lg font-semibold drop-shadow-lg rounded">
              1st Quarter<br /><h2 className="text-blue-900 text-2xl font-bold ">{quarterlyTotals.firstQuarter}</h2>
            </div>
            <div className="bg-gradient-to-t from-sky-400 to-emerald-300 h-20 p-2 text-lg font-semibold drop-shadow-lg rounded">
              2nd Quarter<br /><h2 className="text-blue-900 text-2xl font-bold ">{quarterlyTotals.secondQuarter}</h2>
            </div>
            <div className="bg-gradient-to-t from-sky-400 to-emerald-300 h-20 p-2 text-lg font-semibold drop-shadow-lg rounded">
              3rd Quarter<br /><h2 className="text-blue-900 text-2xl font-bold ">{quarterlyTotals.thirdQuarter}</h2>
            </div>
            <div className="bg-gradient-to-t from-sky-400 to-emerald-300 h-20 p-2 text-lg font-semibold drop-shadow-lg rounded">
              4th Quarter<br /><h2 className="text-blue-900 text-2xl font-bold ">{quarterlyTotals.fourthQuarter}</h2>
            </div>
          </div>
          <div className="overflow-auto shadow-lg rounded-lg">
            <table className="min-w-full border-collapse bg-white text-sm">
              <thead>
                <tr className=" bg-gradient-to-t from-sky-400 to-emerald-300 text-white">
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium  bg-gradient-to-t from-sky-400 to-emerald-300" rowSpan={2}>
                    Name of Vaccine
                  </th>
                  <th colSpan={3} className="border border-gray-200 px-4 py-2 text-center font-medium">
                    1st Quarter
                  </th>
                  <th colSpan={3} className="border border-gray-200 px-4 py-2 text-center font-medium">
                    2nd Quarter
                  </th>
                  <th colSpan={3} className="border border-gray-200 px-4 py-2 text-center font-medium">
                    3rd Quarter
                  </th>
                  <th colSpan={3} className="border border-gray-200 px-4 py-2 text-center font-medium">
                    4th Quarter
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-center font-medium  bg-gradient-to-t from-sky-400 to-emerald-300" rowSpan={2}>
                    Annual Summary Cumulative
                  </th>
                </tr>
                <tr className="bg-gradient-to-t from-sky-400 to-emerald-300 text-white">
                  {months.map((month) => (
                    <th key={month} className="border border-gray-200 px-4 py-2 text-center font-medium">
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vaccines.map((vaccine, idx) => (
                  <tr
                    key={vaccine}
                    className={idx % 2 === 0 ? "bg-blue-100" : "bg-white hover:bg-blue-50"}
                  >
                    <td className="border border-emerald-300 px-4 py-2 font-semibold text-blue-900">{vaccine}</td>
                    {vaccineData[vaccine].map((count, index) => (
                      <td key={index} className="border border-emerald-300 px-4 py-2 text-center text-blue-700">
                        {count}
                      </td>
                    ))}
                    <td className="border border-white px-4 py-2 text-center font-bold text-blue-800  bg-sky-200">
                      {calculateAnnualTotal(vaccineData[vaccine])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center flex items-center justify-center">
            <div className="rounded-full h-96 w-96 p-5 bg-gradient-to-t from-sky-400 to-emerald-300 flex items-center justify-center flex-col drop-shadow-lg">
              <p className="text-xl font-semibold text-blue-900 text-center">
                Total Number of Annual Summary Cumulative:
              </p>
              <h2 className="text-7xl font-bold text-blue-900">
                {totalAnnualSummary} 
              </h2>
            </div>
          </div>
        </div>
        <div className="border-t-8 mb-8"></div>
        
        <div className="border-t-8 mb-8"></div>
        {loading && <p>Loading...</p>}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-3">
            {forms.map((form) => (
              <button
                key={form.id}
                onClick={() => fetchFormDetails(form)}
                className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-t from-sky-400 to-emerald-300 p-6 text-center text-lg font-semibold text-white transition-all transform hover:scale-105 hover:shadow-lg shadow-lg"
              >
                {form.title}
              </button>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message="No data found for the selected form. Please try another form."
      />
    </div>
  );
}
