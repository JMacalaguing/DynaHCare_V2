import React, { useState, useEffect } from "react";
import config from "../pages/config"; // Adjust the path if needed
import { Trash2 } from "lucide-react"; // Assuming you're using lucide-react for icons
import { useNavigate } from "react-router-dom"; // Import useNavigate for programmatic navigation

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const navigate = useNavigate(); // Get navigate function for programmatic navigation

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch(`${config.BASE_URL}formbuilder/api/templates/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch templates.");
        }

        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) fetchTemplates();
  }, [isOpen]);

  const handleSelectTemplate = (template: any) => {
    const parsedSchema = JSON.parse(template.schema); // Parse the schema from string to JSON
    const dataToPass = {
      title: template.title, // Title is the form name
      description: template.description,
      schema: parsedSchema, // Parsed schema
    };
    
    setSelectedTemplate(template);
    navigate("/dynamicform", { state: { template: dataToPass } });
  };

  // Handle delete template
  const handleDeleteTemplate = async (templateId: number) => {
    try {
      const response = await fetch(`${config.BASE_URL}formbuilder/api/templates/${templateId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete template.");
      }

      setTemplates((prevTemplates) =>
        prevTemplates.filter((template) => template.id !== templateId)
      );
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg relative w-11/12 max-w-6xl overflow-y-auto ml-20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-all"
        >
          <span className="sr-only">Close</span>
          &times;
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-6 text-blue-900 text-center">Select a Template</h2>

        {/* Template List */}
        {isLoading ? (
          <div className="text-center text-gray-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center text-gray-500">No templates available.</div>
        ) : (
          <div className="overflow-y-auto max-h-[600px]">
            <div className="grid grid-cols-4 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-5 px-6 border rounded-lg bg-gradient-to-t from-sky-400 to-emerald-300 shadow hover:shadow-lg cursor-pointer transition-all hover:scale-105 relative"
                  onClick={() => handleSelectTemplate(template)} // Select template on click
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the template selection
                      handleDeleteTemplate(template.id);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-all"
                  >
                    <Trash2 className="h-6 w-6" /> {/* Larger delete icon */}
                  </button>

                  <h3 className="text-xl font-semibold text-blue-800">{template.templatename}</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {template.description || "No description available."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateModal;
