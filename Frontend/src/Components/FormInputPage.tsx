import { useState, useEffect } from "react";
import config from "@/pages/config";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "./ui/card";

// Define types for the form values
interface Field {
  id: string;
  label: string;
  type: string;
  options?: string | string[];
  description?: string;
  required: boolean;
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
  [sectionName: string]: {
    [fieldLabel: string]: string | string[];
  };
}

const FormInputPage = () => {
  const { formId } = useParams();
  const [formData, setFormData] = useState<FormData | null>(null); // Form schema data
  const [formValues, setFormValues] = useState<FormValues>({}); // User input data
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false); // State for success modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/${formId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch form details.");
        }
        
        const data = await response.json();
  
        let parsedSchema;
        if (typeof data.schema === "string") {
          try {
            parsedSchema = JSON.parse(data.schema); // Try parsing directly
          } catch (innerError) {
            console.error("Error parsing schema, attempting fix:", innerError);
            
            // Attempt to fix JSON formatting issues before parsing
            let fixedSchema = data.schema
              .replace(/\r?\n|\r/g, '') // Remove newlines
              .replace(/\t/g, '') // Remove tabs
              .replace(/,\s*]/g, ']') // Fix trailing commas in arrays
              .replace(/,\s*}/g, '}'); // Fix trailing commas in objects
  
            parsedSchema = JSON.parse(fixedSchema);
          }
        } else {
          parsedSchema = data.schema;
        }
  
        setFormData({ ...data, schema: parsedSchema });
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    fetchForm();
  }, [formId]);

  useEffect(() => {
    if (formData?.schema && typeof formData.schema !== "string" && formData.schema.sections) {
      const initialValues: FormValues = {};

      formData.schema.sections.forEach((section: Section) => {
        initialValues[section.sectionname] = {}; // Initialize an object for each section
        section.fields.forEach((field: Field) => {
          initialValues[section.sectionname][field.label.trim()] = field.type === "checkbox-group" ? [] : ""; // Trim the label
        });
      });

      setFormValues(initialValues);
    }
  }, [formData]);

  const handleInputChange = (sectionName: string, fieldLabel: string, value: string | string[]) => {
    const trimmedLabel = fieldLabel.trim(); // Trim spaces from the field label

    setFormValues((prevValues) => ({
      ...prevValues,
      [sectionName]: {
        ...prevValues[sectionName],
        [trimmedLabel]: value, // Use the trimmed label as the key
      },
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (sectionName: string, fieldLabel: string, option: string, isChecked: boolean) => {
    setFormValues((prevValues) => {
      const currentFieldValue = prevValues[sectionName]?.[fieldLabel] || [];
      const updatedValue = Array.isArray(currentFieldValue)
        ? isChecked
          ? [...currentFieldValue, option]
          : currentFieldValue.filter((val: string) => val !== option)
        : isChecked
        ? [option]
        : [];

      return {
        ...prevValues,
        [sectionName]: {
          ...prevValues[sectionName],
          [fieldLabel]: updatedValue,
        },
      };
    });
  };

  const validateForm = (): boolean => {
    if (!formData || typeof formData.schema === "string" || !formData.schema.sections) return false;
  
    for (const section of formData.schema.sections) {
      for (const field of section.fields) {
        const fieldValue = formValues[section.sectionname]?.[field.label.trim()];
  
        if (field.required) {
          // Check for empty values
          if (
            field.type === "checkbox-group" && Array.isArray(fieldValue) && fieldValue.length === 0
          ) {
            console.error(`Field "${field.label}" in section "${section.sectionname}" is required.`);
            return false;
          }
  
          if (!fieldValue || fieldValue === "") {
            console.error(`Field "${field.label}" in section "${section.sectionname}" is required.`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const transformFormValues = (formValues: FormValues, formData: FormData) => {
    const transformedData: any = { response_data: {} };
  
    if (formData.schema && typeof formData.schema !== "string" && formData.schema.sections) {
      formData.schema.sections.forEach((section: Section) => {
        const sectionName = section.sectionname;
        transformedData.response_data[sectionName] = {};
  
        section.fields.forEach((field: Field) => {
          const fieldLabel = field.label.trim(); // Trim the field label here
          const fieldValue = formValues[sectionName]?.[fieldLabel];
  
          // Log to check if field values are being captured
          console.log(`Field: ${fieldLabel}, Value: ${fieldValue}`);
  
          if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
            transformedData.response_data[sectionName][fieldLabel] = fieldValue;
          }
        });
      });
    }
  
    // Add sender information (assuming you have access to the logged-in user)
    transformedData.sender = 'Admin';  // Replace with actual user ID if needed
  
    return transformedData;
  };
  
  

  const handleConfirmSubmit = async (confirmed: boolean) => {
    setIsConfirmationModalOpen(false);

    if (confirmed) {
      try {
        // Log form values before transformation
        console.log("Form values before transform:", JSON.stringify(formValues, null, 2));

        const dataToSend = transformFormValues(formValues, formData!); // Transform data to match the required format
        console.log("Data to send:", JSON.stringify(dataToSend, null, 2)); // Log transformed data

        const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/${formId}/submit/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
          throw new Error("Failed to submit form.");
        }

        const responseData = await response.json();
        console.log("Form submitted successfully to server:", responseData);
        setIsSubmitModalOpen(true);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  // Open confirmation modal when ready to submit
  const handleSubmit = () => {
    console.log("Submit button clicked");
  

    if (!validateForm()) {
      alert("Please fill in all required fields before submitting.");
      return;
    }
    setIsConfirmationModalOpen(true);
  };

  // Close success modal and navigate to a different page
  const closeModal = () => {
    setIsSubmitModalOpen(false);
    navigate("/createForm");
  };

  // Render loading or the form if data exists
  if (!formData) {
    return <div>Loading form...</div>;
  }

  return (
    <div className="mt-5 mb-3 ml-20 mr-20 container w-full max-w-[1300px] px-9 py-11 bg-gray-50 rounded-lg border-solid border-2 border-sky-500 overflow-auto max-h-[90vh] shadow-2xl ">
  <div className="flex flex-col ">
    <h2 className="text-4xl font-semibold text-black mb-6 items-center ml-6">{formData.title}</h2>
  </div>
  {formData.schema && typeof formData.schema !== "string" && formData.schema.sections ? (
    formData.schema.sections.map((section: Section, sectionIndex: number) => {
      const sectionId = section.id || `section-${sectionIndex}`;
      return (
        <Card key={sectionId} className="mb-8 p-6">
          <h3 className="text-2xl font-semibold text-black mb-4">{section.sectionname}</h3>
          {section.fields.map((field: Field, fieldIndex: number) => {
            const fieldId = field.id || `${sectionId}-field-${fieldIndex}`;
            return (
              <div key={fieldId} className="mb-4">
                <label
                  htmlFor={fieldId}
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {field.description && (
                    <p className="text-gray-500 mb-2 text-sm">{field.description}</p>
                  )}
                </label>

                {field.type === "text" || field.type === "number" || field.type === "email" ? (
                  <input
                    type={field.type}
                    id={fieldId}
                    required={field.required} // Set 'required' dynamically
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={formValues[section.sectionname]?.[field.label.trim()] || ""}
                    onChange={(e) =>
                      handleInputChange(section.sectionname, field.label.trim(), e.target.value)
                    }
                  />
                ) : field.type === "date" ? (
                  <input
                    type="date"
                    id={fieldId}
                    required={field.required}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={formValues[section.sectionname]?.[field.label.trim()] || ""}
                    onChange={(e) =>
                      handleInputChange(section.sectionname, field.label.trim(), e.target.value)
                    }
                  />
                ): field.type === "checkbox-group" ? (
                  <div className="space-y-2 text-gray-800">
                    {Array.isArray(field.options)
                      ? field.options.map((option: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${fieldId}-option-${index}`}
                              className="w-5 h-5 text-blue-500 focus:ring-blue-400 focus:outline-none"
                              value={option}
                              checked={
                                formValues[section.sectionname]?.[field.label.trim()]?.includes(option) ||
                                false
                              }
                              onChange={(e) =>
                                handleCheckboxChange(
                                  section.sectionname,
                                  field.label.trim(),
                                  option,
                                  e.target.checked
                                )
                              }
                            />
                            <label
                              htmlFor={`${fieldId}-option-${index}`}
                              className="ml-3 text-gray-700"
                            >
                              {option}
                            </label>
                          </div>
                        ))
                      : null}
                  </div>
                ) : field.type === "radio-group" ? (
                  <div className="space-y-2 text-gray-800">
                    {Array.isArray(field.options)
                      ? field.options.map((option: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="radio"
                              id={`${fieldId}-option-${index}`}
                              name={fieldId}
                              className="w-5 h-5 text-blue-500 focus:ring-blue-400 focus:outline-none"
                              value={option}
                              required={field.required} // Add 'required' for radio groups
                              checked={
                                formValues[section.sectionname]?.[field.label.trim()] === option
                              }
                              onChange={() =>
                                handleInputChange(section.sectionname, field.label.trim(), option)
                              }
                            />
                            <label
                              htmlFor={`${fieldId}-option-${index}`}
                              className="ml-3 text-gray-700"
                            >
                              {option}
                            </label>
                          </div>
                        ))
                      : null}
                  </div>
                ) : field.type === "select" ? (
                  <select
                    id={fieldId}
                    required={field.required}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={formValues[section.sectionname]?.[field.label.trim()] || ""}
                    onChange={(e) =>
                      handleInputChange(section.sectionname, field.label.trim(), e.target.value)
                    }
                  >
                    <option value="">Select an option</option>
                    {Array.isArray(field.options) &&
                      field.options.map((option: string, index: number) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                ) : null}
              </div>
            );
          })}
        </Card>

          );
        })
      ) : (
        <div className="text-gray-600 italic">No schema available.</div>
      )}
  
      <button
        className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400"
        onClick={handleSubmit}
      >
        Submit
      </button>
  
      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <div
          className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <p className="text-lg font-medium text-gray-800">Are you sure you want to submit the form?</p>
            <div className="flex justify-center mt-4 gap-3">
              <button
                onClick={() => handleConfirmSubmit(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Yes
              </button>
              <button
                onClick={() => handleConfirmSubmit(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Success Modal */}
      {isSubmitModalOpen && (
        <div
          className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <p className="text-lg font-medium text-gray-800">Form submitted successfully!</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormInputPage;
