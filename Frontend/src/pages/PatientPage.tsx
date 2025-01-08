import React, { useEffect, useState } from "react";
import { Button } from "../Components/ui/button";
import config from "./config";
import { useNavigate } from "react-router-dom";
import { LayoutDashboardIcon, CalendarDays,} from "lucide-react";

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
  "1st dose Pentavalent Vaccine (DPT-Hepa B-HIB)",
  "2nd dose Pentavalent Vaccine (DPT-Hepa B-HIB)",
  "3rd dose Pentavalent Vaccine (DPT-Hepa B-HIB)",
  "1st dose Oral Polio Vaccine (OPV)",
  "2nd dose Oral Polio Vaccine (OPV)",
  "3rd dose Oral Polio Vaccine (OPV)",
  "1st dose Pneumococcal Conjugate Vaccine (PCV)",
  "2nd dose Pneumococcal Conjugate Vaccine (PCV)",
  "3rd dose Pneumococcal Conjugate Vaccine (PCV)",
  "1st dose Inactivated Polio Vaccine (IPV)",
  "2nd dose Inactivated Polio Vaccine (IPV)",
  "1st dose Measles, Mumps, Rubella (MMR)",
  "2nd dose Measles, Mumps, Rubella (MMR)",
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
  const [monthlyFullyImmunizedCounts, setmonthlyFullyImmunizedCounts] = useState<number[]>(() => months.map(() => 0));

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
    Penta1: "1st dose Pentavalent Vaccine (DPT-Hepa B-HIB)",
    Penta2: "2nd dose Pentavalent Vaccine (DPT-Hepa B-HIB)",
    Penta3: "3rd dose Pentavalent Vaccine (DPT-Hepa B-HIB)",
    OPV1: "1st dose Oral Polio Vaccine (OPV)",
    OPV2: "2nd dose Oral Polio Vaccine (OPV)",
    OPV3: "3rd dose Oral Polio Vaccine (OPV)",
    PCV1: "1st dose Pneumococcal Conjugate Vaccine (PCV)",
    PCV2: "2nd dose Pneumococcal Conjugate Vaccine (PCV)",
    PCV3: "3rd dose Pneumococcal Conjugate Vaccine (PCV)",
    IPV1: "1st dose Inactivated Polio Vaccine (IPV)",
    IPV2: "2nd dose Inactivated Polio Vaccine (IPV)",
    MMR1: "1st dose Measles, Mumps, Rubella (MMR)",
    MMR2: "2nd dose Measles, Mumps, Rubella (MMR)",
  };

  const requiredVaccines = [
    "BCG",
    "Hepatitis B",
    "Penta1",
    "Penta2",
    "Penta3",
    "OPV1",
    "OPV2",
    "OPV3",
    "PCV1",
    "PCV2",
    "PCV3",
    "IPV1",
    "IPV2",
    "MMR1",
    "MMR2"
  ];
  const TARGET_PER_QUARTER = 171;
const quarterlyTotal = calculateQuarterlyTotals(vaccineData);
const calculatePercentileAverage = (quarterTotal: number) =>
  Math.round((quarterTotal / TARGET_PER_QUARTER) * 100);

const firstQuarterAverage = calculatePercentileAverage(quarterlyTotal.firstQuarter);
const secondQuarterAverage = calculatePercentileAverage(quarterlyTotal.secondQuarter);
const thirdQuarterAverage = calculatePercentileAverage(quarterlyTotal.thirdQuarter);
const fourthQuarterAverage = calculatePercentileAverage(quarterlyTotal.fourthQuarter);
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
  
        const monthlyFullyImmunizedCounts = months.map(() => 0); // Initialize monthly FIC counts
  
        filteredResponses.forEach((response) => {
          const immunizationData = response.response_data.Immunization;
          if (immunizationData) {
            const vaccineArray = immunizationData["Vaccine"];
  
            if (Array.isArray(vaccineArray)) {
              const vaccineNames = vaccineArray.map((vaccineObj) => vaccineObj.name);
  
              // Check if the response contains all the required vaccines
              const isFullyImmunized = requiredVaccines.every((requiredVaccine) =>
                vaccineNames.includes(requiredVaccine)
              );
  
              // Update monthly counts for fully immunized
              if (isFullyImmunized) {
                const date = vaccineArray[0]?.date; // Use the first vaccine date for simplicity
                if (date) {
                  const monthIndex = new Date(date).getMonth();
                  if (monthIndex >= 0 && monthIndex <= 11) {
                    monthlyFullyImmunizedCounts[monthIndex] += 1;
                  }
                }
              }
  
              // Update transformed data for monthly counts
              vaccineArray.forEach((vaccineObj) => {
                const vaccineName = vaccineObj.name;
                const date = vaccineObj.date;
  
                if (vaccineName && date) {
                  const monthIndex = new Date(date).getMonth(); // Get month index
                  if (monthIndex >= 0 && monthIndex <= 11) { // Validate monthIndex
                    const mappedVaccine = Object.keys(vaccineMapping).find((key) =>
                      vaccineName.includes(key)
                    );
  
                    if (mappedVaccine && transformedData[vaccineMapping[mappedVaccine]]) {
                      transformedData[vaccineMapping[mappedVaccine]][monthIndex] += 1;
                    }
                  }
                }
              });
            }
          }
        });
  
        console.log("Transformed Data:", transformedData);
        setVaccineData(transformedData);
        setmonthlyFullyImmunizedCounts(monthlyFullyImmunizedCounts); // Update state with monthly counts
        console.log("Fully Immunized Count by Month:", monthlyFullyImmunizedCounts);
      }
    } catch (error) {
      console.error("Error fetching response data:", error);
    } finally {
      setLoading(false);
    }
  }
  


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
                <tr className="bg-gradient-to-t from-sky-400 to-emerald-300 text-white">
                  <th
                    className="border border-emerald-300 px-4 py-2 text-left font-medium bg-gradient-to-t from-sky-400 to-emerald-300"
                    rowSpan={2}
                  >
                    Name of Vaccine
                  </th>
                  <th colSpan={3} className="border border-emerald-300 px-4 py-2 text-center font-medium">
                    1st Quarter
                  </th>
                  <th colSpan={3} className="border-l-4 border-emerald-300 px-4 py-2 text-center font-medium">
                    2nd Quarter
                  </th>
                  <th colSpan={3} className="border-l-4 border-emerald-300 px-4 py-2 text-center font-medium">
                    3rd Quarter
                  </th>
                  <th colSpan={3} className="border-l-4 border-emerald-300 px-4 py-2 text-center font-medium">
                    4th Quarter
                  </th>
                  <th
                    className="border border-emerald-300 px-4 py-2 text-center font-medium bg-gradient-to-t from-sky-400 to-emerald-300"
                    rowSpan={2}
                  >
                    Annual Summary Cumulative
                  </th>
                </tr>
                <tr className="bg-gradient-to-t from-sky-400 to-emerald-300 text-white">
                  {months.map((month, index) => (
                    <th
                      key={month}
                      className={`border border-emerald-300 px-4 py-2 text-center font-medium ${
                        index % 3 === 0 && index !== 0 ? 'border-l-4 border-emerald-300' : ''
                      }`}
                    >
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
                    <td className="border border-emerald-300 px-4 py-2 font-semibold text-sm text-blue-900">
                      {vaccine}
                    </td>
                    {vaccineData[vaccine].map((count, index) => (
                      <td
                        key={index}
                        className={`border border-emerald-300 px-4 py-2 text-center text-blue-700 text-2xl ${
                          index === 0
                          ? 'border-l-4 border-emerald-300' // First month column
                          : index % 3 === 0
                          ? 'border-l-4 border-emerald-300' // After each quarter
                          : ''
                      } ${
                        index === vaccineData[vaccine].length - 1
                          ? 'border-r-4 border-emerald-300' // Last column
                          : ''
                        }`}
                      >
                        {count === 0 ? '' : count}
                      </td>
                    ))}
                    <td className="border border-white px-4 py-2 text-center font-bold text-blue-800 bg-sky-200">
                      {calculateAnnualTotal(vaccineData[vaccine])=== 0?'':calculateAnnualTotal(vaccineData[vaccine])}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-t from-sky-400 to-emerald-300">
                  <td className="border border-emerald-300 px-4 py-2 font-semibold text-sm text-blue-900">
                    Fully Immunized Count (FIC)
                  </td>
                  {monthlyFullyImmunizedCounts.map((count, index) => (
                    <td
                      key={index}
                      className={`border border-emerald-300 px-4 py-2 text-center text-blue-700 text-2xl ${
                        index % 3 === 0 && index !== 0 ? 'border-l-4 border-emerald-300' : ''
                      }`}
                    >
                      {count === 0 ? '' : count}
                    </td>
                  ))}
                  <td className="border border-emerald-300 px-4 py-2 text-center font-bold text-blue-800 bg-gradient-to-t from-sky-400 to-emerald-300">
                    {monthlyFullyImmunizedCounts.reduce((sum, count) => sum + count, 0) > 0
                      ? monthlyFullyImmunizedCounts.reduce((sum, count) => sum + count, 0)
                      : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
          <div className="grid gap-6 md:grid-cols-4 text-center">
          <div className="mt-8 text-center flex items-center justify-center">
            <div className="rounded-full h-60 w-60 p-5 bg-gradient-to-t from-sky-400 to-emerald-300 flex items-center justify-center flex-col drop-shadow-lg">
              <p className="text-base font-semibold text-blue-900 text-center">
                1st Quater Percentile Average(%)
              </p>
              <h2 className="text-7xl font-bold text-blue-900">
                {firstQuarterAverage}% 
              </h2>
            </div>
        </div>
        <div className="mt-8 text-center flex items-center justify-center">
            <div className="rounded-full h-60 w-60 p-5 bg-gradient-to-t from-sky-400 to-emerald-300 flex items-center justify-center flex-col drop-shadow-lg">
              <p className="text-base font-semibold text-blue-900 text-center">
                2nd Quater Percentile Average(%)
              </p>
              <h2 className="text-7xl font-bold text-blue-900">
                {secondQuarterAverage}% 
              </h2>
            </div>
        </div>
        <div className="mt-8 text-center flex items-center justify-center">
            <div className="rounded-full h-60 w-60 p-5 bg-gradient-to-t from-sky-400 to-emerald-300 flex items-center justify-center flex-col drop-shadow-lg">
              <p className="text-base font-semibold text-blue-900 text-center">
                3rd Quater Percentile Average(%)
              </p>
              <h2 className="text-7xl font-bold text-blue-900">
                {thirdQuarterAverage}% 
              </h2>
            </div>
        </div>
        <div className="mt-8 text-center flex items-center justify-center">
            <div className="rounded-full h-60 w-60 p-5 bg-gradient-to-t from-sky-400 to-emerald-300 flex items-center justify-center flex-col drop-shadow-lg">
              <p className="text-base font-semibold text-blue-900 text-center">
                4th Quater Percentile Average(%)
              </p>
              <h2 className="text-7xl font-bold text-blue-900">
                {fourthQuarterAverage}% 
              </h2>
            </div>
        </div>
          
          </div>
          <div className="text-center flex items-center justify-center mb-6">
            <div className="rounded-full h-96 w-96 p-5 bg-gradient-to-t from-sky-400 to-emerald-300 flex items-center justify-center flex-col drop-shadow-lg">
              <p className="text-xl font-semibold text-blue-900 text-center">
                Total Number of Annual Summary Cumulative:
              </p>
              <h2 className="text-7xl font-bold text-blue-900">
                {totalAnnualSummary} 
              </h2>
            </div>
        </div>
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
