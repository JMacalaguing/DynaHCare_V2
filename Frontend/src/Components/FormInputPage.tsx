import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Define types for form data
interface Field {
  id: string;
  label: string;
  type: string;
  options?: string | string[];
}

interface Section {
  id: string;
  sectionname: string;
  fields: Field[];
}

interface FormData {
  id: number;
  title: string;
  schema: string | { sections: Section[] };
}

interface FormValues {
  [sectionId: string]: {
    [fieldId: string]: string | string[];
  };
}

const FormInputPage = () => {
  const { formId } = useParams(); // Get formId from URL
  const [formData, setFormData] = useState<FormData | null>(null); // State to hold form data
  const [formValues, setFormValues] = useState<FormValues>({}); // State to hold user input data
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const navigate = useNavigate();

  // Fetch form data based on `formId`
  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await fetch(`http://localhost:8000/formbuilder/api/forms/${formId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch form details.");
        }
        const data = await response.json();

        let parsedSchema;
        if (typeof data.schema === "string") {
          // If schema is a string, parse it
          try {
            const correctedSchema = data.schema.replace(/'/g, '"'); // Replace single quotes with double quotes
            parsedSchema = JSON.parse(correctedSchema);
          } catch (error) {
            console.error("Failed to parse schema:", data.schema, error);
            throw new Error("Invalid schema format.");
          }
        } else {
          // If schema is already an object, use it directly
          parsedSchema = data.schema;
        }

        setFormData({ ...data, schema: parsedSchema });
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    }

    fetchForm();
  }, [formId]);

  // Initialize `formValues` when `formData` is loaded
  useEffect(() => {
    if (formData && typeof formData.schema === "object" && "sections" in formData.schema) {
      const initialValues: FormValues = {};

      formData.schema.sections.forEach((section) => {
        initialValues[section.id] = {};
        section.fields.forEach((field) => {
          // Initialize the field value based on type
          initialValues[section.id][field.id] = field.type === "checkbox-group" ? [] : "";
        });
      });

      setFormValues(initialValues);
    }
  }, [formData]);

  // Handle input change
  const handleInputChange = (sectionId: string, fieldId: string, value: string | string[]) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [sectionId]: {
        ...prevValues[sectionId],
        [fieldId]: value,
      },
    }));
  };

  // Helper function to parse options
  const parseOptions = (options: string | string[] | undefined): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    return options.split(",").map((opt) => opt.trim());
  };

  const handleSubmit = async () => {
    try {
      // Structure the data to include response_data as expected by the backend
      const dataToSend = {
        response_data: formValues, // Wrap formValues inside `response_data`
      };
  
      const response = await fetch(`http://localhost:8000/formbuilder/api/forms/${formId}/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend), // Send the structured data
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit form.");
      }
  
      const responseData = await response.json();
      console.log("Form submitted successfully:", responseData);
  
      // Show the success modal
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/createForm"); // Redirect after closing the modal
  };

  if (!formData) {
    return <div>Loading form...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-5xl font-bold text-[#040E46] mb-4">{formData.title}</h2>

      {formData.schema && typeof formData.schema === "object" && "sections" in formData.schema ? (
        formData.schema.sections.map((section: Section, sectionIndex) => {
          const sectionId = section.id || `section-${sectionIndex}`;
          return (
            <div key={sectionId} className="mb-6">
              <h3 className="text-3xl font-semibold text-[#040E46]">{section.sectionname}</h3>
              {section.fields.map((field: Field, fieldIndex) => {
                const fieldId = field.id || `${sectionId}-field-${fieldIndex}`;
                return (
                  <div key={fieldId} className="mb-4">
                    <label className="block text-xl text-gray-700">{field.label}</label>

                    {/* Render input based on field type */}
                    {field.type === "text" || field.type === "number" || field.type === "email" || field.type === "date" ? (
                      <input
                        type={field.type}
                        className="w-full p-2 border border-gray-300 rounded"
                        value={formValues[sectionId]?.[fieldId] || ""}
                        onChange={(e) => handleInputChange(sectionId, fieldId, e.target.value)}
                      />
                    ) : field.type === "checkbox-group" ? (
                      <div className="text-[#040E46]">
                        {parseOptions(field.options).map((option, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${fieldId}-option-${index}`}
                              value={option}
                              checked={formValues[sectionId]?.[fieldId]?.includes(option) || false}
                              onChange={(e) => {
                                const currentValue = Array.isArray(formValues[sectionId]?.[fieldId])
                                  ? formValues[sectionId]?.[fieldId]
                                  : [];
                                const updatedValue = e.target.checked
                                  ? [...currentValue, option]
                                  : currentValue.filter((v) => v !== option);
                                handleInputChange(sectionId, fieldId, updatedValue);
                              }}
                            />
                            <label htmlFor={`${fieldId}-option-${index}`} className="ml-2">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : field.type === "radio-group" ? (
                      <div className="text-[#040E46]">
                        {parseOptions(field.options).map((option, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="radio"
                              id={`${fieldId}-option-${index}`}
                              name={fieldId}
                              value={option}
                              checked={formValues[sectionId]?.[fieldId] === option}
                              onChange={(e) => handleInputChange(sectionId, fieldId, e.target.value)}
                            />
                            <label htmlFor={`${fieldId}-option-${index}`} className="ml-2">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : field.type === "select" ? (
                      <select
                        className="w-full p-2 border border-gray-300 rounded text-[#040E46]"
                        value={formValues[sectionId]?.[fieldId] || ""}
                        onChange={(e) => handleInputChange(sectionId, fieldId, e.target.value)}
                      >
                        <option value="" disabled>Select an option</option>
                        {parseOptions(field.options).map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>Unsupported field type: {field.type}</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
      ) : (
        <div>No sections found in this form.</div>
      )}

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>

      {/* Success Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-green-500">Form Submitted Successfully!</h3>
            <div className="flex justify-center mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormInputPage;
