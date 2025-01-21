import React, { useEffect, useState } from "react";
import config from "./config";
import { CalendarDays, FileUserIcon } from "lucide-react";

interface FormResponse {
  id: number;
  form: number;
  response_data: Record<string, Record<string, any>>;
  date_submitted: string;
  sender: string;
}

interface Form {
  id: number;
  title: string;
}

export default function GeneralSearch() {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [groupedResponses, setGroupedResponses] = useState<Record<number, FormResponse[]>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [forms, setForms] = useState<Form[]>([]);

  const RESPONSES_API = `${config.BASE_URL}/formbuilder/api/responses/`;
  const FORMS_API = `${config.BASE_URL}/formbuilder/api/forms/`;

  // Fetch responses and forms
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(RESPONSES_API).then((res) => res.json()),
      fetch(FORMS_API).then((res) => res.json()),
    ])
      .then(([responseData, formData]: [FormResponse[], Form[]]) => {
        setResponses(responseData);
        groupResponsesByForm(responseData);
        setForms(formData);
        setLoading(false);
      })
      .catch((error) => {
        setError(`Failed to fetch data: ${error.message || "Unknown error"}`);
        setLoading(false);
      });
  }, []);

  const groupResponsesByForm = (responses: FormResponse[]) => {
    const grouped: Record<number, FormResponse[]> = {};
    responses.forEach((response) => {
      const formId = response.form;
      if (!grouped[formId]) {
        grouped[formId] = [];
      }
      grouped[formId].push(response);
    });
    setGroupedResponses(grouped);
  };

  const filteredGroups = searchTerm === ""
    ? Object.entries(groupedResponses)
    : Object.entries(groupedResponses)
        .map(([formId, responses]) => {
          const filteredResponses = responses.filter((response) =>
            Object.values(response.response_data).some((formData) => {
              if (!formData || typeof formData !== "object") return false;
              return Object.entries(formData).some(([key, value]) =>
                /(name|patient)/i.test(key) && typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
              );
            })
          );
          return [formId, filteredResponses] as [string, FormResponse[]];
        })
        .filter(([_, responses]) => responses.length > 0);

  const currentDate = new Date().toLocaleDateString();

  const extractFields = (response: FormResponse) => {
    return Object.keys(response.response_data).flatMap((formName) =>
      Object.entries(response.response_data[formName] || {})
    );
  };

  const renderValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.map((item) => renderValue(item)).join(", ");
    } else if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
    } else {
      return value ? String(value) : "N/A";
    }
  };

  const getFormTitle = (formId: number) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.title : "Unknown Form";
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-sky-300 to-blue-50 w-full overflow-auto">
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileUserIcon className="h-6 w-6 text-black" />
            <span className="text-xl font-semibold text-black">Patient General Record</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays color="black" fill="white" />
            <span className="font-medium text-black">{currentDate}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && <div className="text-center text-red-600 mb-4"><p>{error}</p></div>}
        {loading && !error && <div className="text-center text-blue-600 mb-4"><p>Loading responses...</p></div>}

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Patient Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 text-gray-700 bg-white border border-emerald-300 rounded-full shadow-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {filteredGroups.length === 0 && searchTerm !== "" && (
          <div className="text-center text-red-600">
            <p>No results found for "{searchTerm}"</p>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredGroups.map(([formId, formGroup]) => {
            const formTitle = getFormTitle(parseInt(formId));
            return (
              <div key={formId} className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-sky-900">{formTitle}</h3>
                <table className="table-auto w-full border-collapse">
                  <thead className="bg-blue-700 text-white sticky top-0">
                    <tr>
                      {[...new Set(
                        formGroup.flatMap((response) =>
                          extractFields(response).map(([field]) => field)
                        )
                      )].map((field) => (
                        <th key={field} className="border px-4 py-2 text-xs text-left">{field === "Name of the Patient" ? "Name" : field}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formGroup.map((response) => {
                      const fields = extractFields(response);
                      return (
                        <tr key={response.id} className="hover:bg-gray-100 text-black">
                          {fields.map(([field, value]) => (
                            <td key={field} className="border px-4 py-2 text-xs text-left">{renderValue(value)}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
