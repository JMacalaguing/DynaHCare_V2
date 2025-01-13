import { Button } from "../Components/ui/button"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import { Edit3, Plus, NotebookPen, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import config from "./config";
import TemplateModal from "./TemplateModal";

interface Form {
  id: number;
  title: string;
  status: "In Progress" | "Under Review" | "Completed" | "Not Started"; 
  schema?: {
    sections?: any[];
  };
}

const statusOptions = ["In Progress", "Under Review", "Completed", "Not Started"];

const Createform = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);

  // Fetch forms on component mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/`);
        if (!response.ok) throw new Error("Failed to fetch forms.");
        const data = await response.json();
        setForms(data);
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, []);

  const deleteForm = async (formId: number) => {
    try {
      const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/${formId}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete form.");
      setForms((prevForms) => prevForms.filter((form) => form.id !== formId));
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };

  const updateFormStatus = async (formId: number, newStatus: "In Progress" | "Under Review" | "Completed" | "Not Started") => {
    try {
      const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/${formId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status.");
      
      // Make sure the status value is one of the expected types
      setForms((prevForms) =>
        prevForms.map((form) =>
          form.id === formId ? { ...form, status: newStatus } : form
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  const handleStatusChange = (formId: number, newStatus: string) => {
    // Cast the newStatus to the appropriate type for status
    if (["In Progress", "Under Review", "Completed", "Not Started"].includes(newStatus)) {
      updateFormStatus(formId, newStatus as "In Progress" | "Under Review" | "Completed" | "Not Started");
    }
  };


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleScratchClick = () => {
    closeModal();
    navigate("/form");
  };

  const handleTemplateClick = () => {
    closeModal();
    setTemplateModalOpen(true);
  };

  const handleEditForm = (form: Form) => {
    navigate("/editForm", { state: { formData: form } });
  };

  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="flex-col gap-5 w-full bg-gray-50 min-h-screen">
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <NotebookPen className="h-6 w-6 text-black" />
            <span className="text-xl font-semibold text-black">Individual Treatment Record Forms</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays color="black" fill="white" />
            <span className="font-medium text-black">{currentDate}</span>
          </div>
        </div>
      </header>

      {/* Forms List */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <p className="text-center text-lg text-gray-500">Loading...</p>
        ) : forms.length === 0 ? (
          <p className="text-center text-lg text-gray-500">No forms found. Please create a new form.</p>
        ) : (
          <ul className="space-y-4 max-h-[550px] overflow-y-auto">
            {forms.map((form) => (
              <li
                key={form.id}
                className="p-6 bg-gradient-to-t from-sky-400 to-emerald-300 border border-gray-200 rounded-lg hover:shadow-xl cursor-pointer transition-all"
                onClick={() => navigate(`/form/${form.id}`)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-[#040E46]">{form.title}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="p-2 text-blue-500 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent click
                        handleEditForm(form);
                      }}
                    >
                      <Edit3 className="h-5 w-5" />
                    </Button>
                    <div onClick={(e) => {e.stopPropagation();}}>
                    <select
                          value={form.status}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent parent click
                            handleStatusChange(form.id, e.target.value);
                          }}
                          className="px-3 py-1 border rounded-md text-blue-900"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {form.schema?.sections?.length || 0} Section
                  {form.schema?.sections?.length !== 1 ? "s" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Create Form Button */}
      <div className="flex justify-center items-center">
        <Button className="bg-[#040E46] text-white hover:bg-[#FF3434] shadow-lg" onClick={openModal}>
          <Plus className="mr-2" /> Create Form
        </Button>
      </div>

      {/* Modal Components */}
      {isModalOpen && (
        <Modal
          onClose={closeModal}
          onTemplate={handleTemplateClick}
          onScratch={handleScratchClick}
        />
      )}
      {isTemplateModalOpen && <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setTemplateModalOpen(false)} />}
    </div>
  );
};

// Modal Component
function Modal({
  onClose,
  onTemplate,
  onScratch,
}: {
  onClose: () => void;
  onTemplate: () => void;
  onScratch: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg relative w-3/4 max-w-md">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-blue-900 text-center">
          Choose your create form option
        </h2>
        <div className="flex gap-4 justify-center">
          <Button onClick={onTemplate} className="bg-green-500 hover:bg-green-700 text-white px-4 py-2">
            Template
          </Button>
          <Button onClick={onScratch} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2">
            Scratch
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Createform;
