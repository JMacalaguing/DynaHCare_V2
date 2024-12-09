import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";

// Define types for props
interface Form {
  id: number;
  title: string;
}

interface LocationState {
  form: Form;
  patients: {
    name: string;
    date: string;
    sender: string;
  }[];
}

export default function PatientList() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState; // Explicitly cast the location state
  const { form, patients } = state || { form: null, patients: [] };

  if (!form) {
    return <p>No form selected.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black">{form.title}</h1>
          <Button
            onClick={() => navigate("/PatientPage")}
            className="bg-[#00205B] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#001B4D]"
          >
            Back to Forms
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-700 font-medium border-b">
                  Patient Name
                </th>
                <th className="text-left px-6 py-3 text-gray-700 font-medium border-b">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-gray-700 font-medium border-b">
                  Sent By
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-gray-800 border-b">
                    {patient.name}
                  </td>
                  <td className="px-6 py-4 text-gray-800 border-b">
                    {patient.date}
                  </td>
                  <td className="px-6 py-4 text-gray-800 border-b">
                    {patient.sender}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
