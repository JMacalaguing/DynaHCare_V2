import { Button } from "../Components/ui/button"; 
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react"; // Import Trash icon
import { useState, useEffect } from "react";

const Createform = () => {
  const route = useNavigate();
  const [forms, setForms] = useState<any[]>([]); // State to hold the list of forms
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state

  // Fetch the list of forms from the backend
  useEffect(() => {
    async function fetchForms() {
      try {
        const response = await fetch("http://localhost:8000/formbuilder/api/forms/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch forms.");
        }

        const data = await response.json();
        setForms(data); // Set the forms data
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching data
      }
    }

    fetchForms();
  }, []);

  // Function to delete a form
  const deleteForm = async (formId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/formbuilder/api/forms/${formId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete form.");
      }

      // Remove the deleted form from the state
      setForms((prevForms) => prevForms.filter((form) => form.id !== formId));
    } catch (error) {
      console.error("Failed to delete form:", error);
    }
  };

  return (
    <div className="flex-col gap-5 w-full">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-[#040E46]">Forms</span>
          </div>
        </div>
      </header>

      {/* Forms List */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div>Loading...</div> // Show loading message while fetching data
        ) : forms.length === 0 ? (
          <div>No forms found. Please create a new form.</div> // Show if no forms are found
        ) : (
          <ul className="space-y-4 max-h-[400px] overflow-y-auto">
            {forms.map((form: any) => {
              const sectionCount = form.schema?.sections?.length || 0;
              return (
                <li
                  key={form.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => route(`/form/${form.id}`)} // On click, navigate to form input page
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-lg text-[#040E46]">{form.title}</span>
                    <Button
                    type="button"
                    variant="ghost"
                    className="p-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering form click
                      deleteForm(form.id); // Call delete function
                    }}>
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {sectionCount} Section{sectionCount !== 1 ? "s" : ""}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create Form Button */}
      <div className="flex justify-center items-center">
        <Button className="bg-[#040E46] hover:bg-[#FF3434]" onClick={() => { route("/form"); }}>
          <Plus /> Create Form
        </Button>
      </div>
    </div>
  );
};

export default Createform;
