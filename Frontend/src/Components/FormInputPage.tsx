import { useState, useEffect } from "react";
import config from "@/pages/config";
import { useParams, useNavigate } from "react-router-dom";

// Define types for the form values
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

  // Fetch the form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/${formId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch form details.");
        }
        const data = await response.json();
        let parsedSchema = typeof data.schema === "string" ? JSON.parse(data.schema.replace(/'/g, '"')) : data.schema;
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
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-5xl font-bold text-[#040E46] mb-4">{formData.title}</h2>

      {formData.schema && typeof formData.schema !== "string" && formData.schema.sections ? (
        formData.schema.sections.map((section: Section, sectionIndex: number) => {
          const sectionId = section.id || `section-${sectionIndex}`;
          return (
            <div key={sectionId} className="mb-6">
              <h3 className="text-3xl font-semibold text-[#040E46]">{section.sectionname}</h3>
              {section.fields.map((field: Field, fieldIndex: number) => {
                const fieldId = field.id || `${sectionId}-field-${fieldIndex}`;
                return (
                  <div key={fieldId} className="mb-4">
                    <label className="block text-xl text-gray-700">{field.label}</label>
                    {field.type === "text" || field.type === "number" || field.type === "email" ? (
                      <input
                        type={field.type}
                        className="w-full p-2 border border-gray-300 rounded"
                        value={formValues[section.sectionname]?.[field.label.trim()] || ""}  // Trim here
                        onChange={(e) => handleInputChange(section.sectionname, field.label.trim(), e.target.value)}  // Trim here
                      />
                    ) : field.type === "checkbox-group" ? (
                      <div className="text-[#040E46]">
                        {Array.isArray(field.options)
                          ? field.options.map((option: string, index: number) => (
                              <div key={index} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`${fieldId}-option-${index}`}
                                  value={option}
                                  checked={formValues[section.sectionname]?.[field.label.trim()]?.includes(option) || false}  // Trim here
                                  onChange={(e) =>
                                    handleCheckboxChange(section.sectionname, field.label.trim(), option, e.target.checked)  // Trim here
                                  }
                                />
                                <label htmlFor={`${fieldId}-option-${index}`} className="ml-2">
                                  {option}
                                </label>
                              </div>
                            ))
                          : null}
                      </div>
                    ) : field.type === "radio-group" ? (
                      <div className="text-[#040E46]">
                        {Array.isArray(field.options)
                          ? field.options.map((option: string, index: number) => (
                              <div key={index} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`${fieldId}-option-${index}`}
                                  name={fieldId}
                                  value={option}
                                  checked={formValues[section.sectionname]?.[field.label.trim()] === option}  // Trim here
                                  onChange={() => handleInputChange(section.sectionname, field.label.trim(), option)}  // Trim here
                                />
                                <label htmlFor={`${fieldId}-option-${index}`} className="ml-2">
                                  {option}
                                </label>
                              </div>
                            ))
                          : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })
      ) : (
        <div>No schema available.</div>
      )}

      <button
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 pointer-events-auto"
        onClick={handleSubmit}
      >
        Submit
      </button>

          {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg text-blue-900">
            <p>Are you sure you want to submit the form?</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleConfirmSubmit(true)}
                className="bg-green-500 text-white px-4 py-2 rounded mx-2"
              >
                Yes
              </button>
              <button
                onClick={() => handleConfirmSubmit(false)}
                className="bg-red-500 text-white px-4 py-2 rounded mx-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
            {isSubmitModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg text-blue-900">
            <p>Form submitted successfully!</p>
            <div className="flex justify-center mt-5">
              <button onClick={closeModal} className="bg-blue-500 text-white px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormInputPage;
