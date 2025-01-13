import React, { useEffect, useState } from "react";
import { Button } from "../Components/ui/button";
import config from "./config";
import { useNavigate } from "react-router-dom";
import { CalendarDays, FileUserIcon } from "lucide-react";

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

export default function Home() {
  const [forms, setForms] = useState<Form[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for the search term
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase())
  ); // Filter forms based on the search term

  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-t from-sky-300 to-blue-50 w-full overflow-auto">
      <title>Patient Healthcare Portal</title>
      <meta name="description" content="Patient Healthcare Portal" />

      <header className="border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileUserIcon className="h-6 w-6 text-black" />
            <span className="text-xl font-semibold text-black">Individual Treatment Record</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays color="black" fill="white" />
            <span className="font-medium text-black">{currentDate}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Record..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 text-gray-700 bg-white border border-emerald-300 rounded-full shadow-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 "
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="absolute top-1/2 right-4 h-5 w-5 text-gray-500 transform -translate-y-1/2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 17a6 6 0 100-12 6 6 0 000 12zM21 21l-4.35-4.35"
            />
          </svg>
        </div>

        {loading && <p>Loading...</p>}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-3">
            {filteredForms.map((form) => (
              <button
                key={form.id}
                onClick={() => fetchFormDetails(form)}
                className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-t from-sky-400 to-emerald-300 p-6 text-center text-lg font-semibold text-white transition-all transform hover:scale-105 hover:shadow-lg shadow-lg"
              >
                {form.title}
              </button>
            ))}
            {filteredForms.length === 0 && (
              <p className="text-center text-gray-500">No forms found.</p>
            )}
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
