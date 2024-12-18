import React, { useState } from 'react';
import { useForm, useFieldArray, SubmitHandler, Control } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../Components/ui/form";
import { Input } from "../Components/ui/input";
import { Card, CardContent } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Trash2 } from 'lucide-react';
import config from './config';
import { useNavigate } from 'react-router-dom';

// Define types for each field and section
interface Field {
  label: string;
  type: string;
  options?: string;
}

interface Section {
  sectionname: string;
  fields: Field[];
}

// Define the full form structure type
interface FormValues {
  formname: string;
  description: string;
  sections: Section[];
}

interface DynamicFormProps {
  template: {
    title: string;
    description: string;
    schema: {
      sections: Section[];
    };
  };
}

// Modal Component
function Modal({ isOpen, onClose, title, onSave }: { isOpen: boolean; onClose: () => void; title: string; onSave: () => void }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg text-center w-3/4 max-w-md">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <div className="flex-col justify-center gap-4">
            <p className="mb-2 text-lg">Do you want to save this as a template?</p>
            <Button onClick={onSave} className="bg-green-500 hover:bg-green-700 text-white mr-5">
              Yes
            </Button>
            <Button onClick={onClose} className="bg-red-500 hover:bg-red-700 text-white ml-5">
              No
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Modal Component
  function Modal2({ isOpen, onClose, title}: { isOpen: boolean; onClose: () => void; title: string;}) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg text-center w-3/4 max-w-md">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <div className="flex-col justify-center gap-4">
            <Button onClick={onClose} className="bg-green-500 hover:bg-green-700 text-white">
              Ok
            </Button>
          </div>
        </div>
      </div>
    );
  }

const DynamicForm: React.FC<DynamicFormProps> = ({ template }) => {
  const parsedSchema = typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema;
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState<string>("");
  const [showTemplateNameInput, setShowTemplateNameInput] = useState(false);
  const [isModalOpen2, setModalOpen2] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      formname: template.title || '',
      description: template.description || '',
      sections: parsedSchema?.sections || [],
    },
  });

  const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: 'sections', // name must match the form structure
  });

  const handleModalClose = () => {
    setModalOpen(false); // Close the modal
    navigate('/createForm'); // Navigate to /createForm page
    form.reset({
      formname: "",
      description: "",  // Reset description
      sections: [{ sectionname: "", fields: [] }],
    });
  };

  const EnterName = () => {
    setShowTemplateNameInput(true);  
    setModalOpen(false);  

  };
  const handleModalClose2 =() =>{
    setModalOpen2(false);
    navigate("/createForm")
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log('Form Data:', data);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }
  
      const sanitizedSections = data.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => ({
          ...field,
          type: field.type || "text", // Ensure a valid type
          options: field.options && typeof field.options === 'string' 
            ? field.options.split(",").map((opt) => opt.trim()) 
            : [], // Split and trim options only if options is a string
        })),
      }));
  
      const payload = {
        title: data.formname,
        description: data.description,  // Send the description with the form
        schema: JSON.stringify({ sections: sanitizedSections }),
      };
  
      const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to save the form. Error:", errorData);
        throw new Error("Failed to save the form. Please try again.");
      }
  
      const result = await response.json();
      console.log("Form successfully saved:", result);
  
      setModalOpen(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error(errorMessage);
    }
  };
  

      const handleSaveTemplate = async () => {
        // Debug: Log when the function is called
        console.log("handleSaveTemplate called");
        // Debug: Log the template name value
        console.log("Template name:", templateName);
      
        if (!templateName) {
          alert("Please enter a template name.");
          return;
        }
      
        try {
          const formData = form.getValues();  // Get all current form data
      
          // Debug: Log the form data before sending it to the server
          console.log("Form data:", formData);
    
          const sanitizedSections = formData.sections.map((section) => ({
            ...section,
            fields: section.fields.map((field) => ({
              ...field,
              type: field.type || "text", // Ensure a valid type
              options: field.options && typeof field.options === 'string' 
                ? field.options.split(",").map((opt) => opt.trim()) 
                : [], // Split and trim options only if options is a string
            })),
          }));
      
          const templateData = {
            templatename: templateName,
            title:formData.formname,  // Use the template name from the user input
            description: formData.description,
            schema: JSON.stringify({ sections: sanitizedSections }),
          };
      
          // Debug: Log the template data before sending it to the server
          console.log("Template data:", templateData);
      
          const response = await fetch(`${config.BASE_URL}formbuilder/api/templates/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(templateData), 
          });
      
          if (response.ok) {
            const result = await response.json();
            console.log("Template saved successfully:", result);
            setShowTemplateNameInput(false); 
            setModalOpen2(true); 
            form.reset({
            formname: "",
            description: "",  // Reset description
            sections: [{ sectionname: "", fields: [] }],
          });
          } else {
            // Debug: Log the response status if it's not OK
            console.error("Failed to save template. Status:", response.status);
            console.error("Response body:", await response.text());
          }
        } catch (error) {
          // Debug: Log any errors that occur
          console.error("Error saving template:", error);
        }
      };
      
      const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTemplateName(e.target.value);
      };
    
  return (
    <div className="w-full h-full flex flex-col gap-8 justify-center items-center text-black">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-[90%] max-w-[1200px] space-y-6 flex flex-col border-solid border-2 border-sky-500 rounded-lg p-10 overflow-auto max-h-[90vh] shadow-2xl"
        >
          <FormField
            name="formname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Form Name</FormLabel>
                <FormDescription className="text-md">This is your Form Name.</FormDescription>
                <FormControl>
                  <Input placeholder="Title . . ." className="w-full h-12 text-md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Form Description</FormLabel>
                <FormDescription className="text-md">Describe the purpose of this form.</FormDescription>
                <FormControl>
                  <Input placeholder="Write a description for your form..." className="w-full h-12 text-md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {sections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardContent className="p-7 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <FormField
                    name={`sections.${sectionIndex}.sectionname`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xl">Section Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Section Name . . ." className="w-full h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="p-2"
                    onClick={() => removeSection(sectionIndex)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
                <FieldArray sectionIndex={sectionIndex} control={form.control} />
              </CardContent>
            </Card>
          ))}

          <div className="w-full flex justify-center gap-x-[30vw]">
            <Button
              type="button"
              className="bg-transparent text-black border-2 border-[#040E46] hover:bg-blue-300 hover:text-black w-auto h-12"
              onClick={() => appendSection({ sectionname: '', fields: [] })}
            >
              Add Section
            </Button>
            <Button type="submit" className="bg-[#0723BF] hover:bg-blue-400 hover:text-black border-2 hover:border-black w-auto h-12">
              Save Form
            </Button>
          </div>
        </form>
      </Form>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Form Created Successfully!"
        onSave={EnterName}
      />
          <Modal2
              isOpen={isModalOpen2}
              onClose={handleModalClose2}
              title="Template Save Successfully!"
             
            />
              {showTemplateNameInput && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-gradient-to-t from-sky-300 to-blue-50 p-6 rounded shadow-lg text-center w-3/4 max-w-md">
                <input
                  type="text"
                  placeholder="Enter template name"
                  value={templateName}
                  onChange={handleNameChange}
                  className="w-full p-2 border border-gray-400"
                />
                <div className="mt-5 ">
                <Button className="bg-blue-900" onClick={handleSaveTemplate}>Save</Button>
                </div>
              </div>
              </div>
              
            )}
    </div>
  );
};

interface FieldArrayProps {
  sectionIndex: number;
  control: Control<FormValues>;
}

function FieldArray({ sectionIndex, control }: FieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.fields`,
  });

  const fieldTypes = ["text", "number", "date", "email", "checkbox-group", "radio-group", "select"];

  return (
    <div className="space-y-4 mt-4">
      {fields.map((field, fieldIndex) => (
        <div key={field.id} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <FormField
              control={control}
              name={`sections.${sectionIndex}.fields.${fieldIndex}.label`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Field Label" {...field} className="w-full h-12 text-md" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`sections.${sectionIndex}.fields.${fieldIndex}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <select {...field} className="w-full h-12 text-md">
                      <option value="" disabled>
                        Select a type
                      </option>
                      {fieldTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              className="p-2"
              onClick={() => remove(fieldIndex)}
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </Button>
          </div>

          {["checkbox-group", "radio-group", "select"].includes(fields[fieldIndex].type) && (
            <FormField
              control={control}
              name={`sections.${sectionIndex}.fields.${fieldIndex}.options`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Options (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Option1, Option2, Option3"
                      {...field}
                      className="w-full h-10 text-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      ))}

      <Button
        type="button"
        className="bg-transparent text-black border-2 border-[#040E46] hover:bg-blue-300 hover:text-black w-auto h-12"
        onClick={() => append({ label: "", type: "text", options: "" })}
      >
        Add Field
      </Button>
    </div>
  );
}

export default DynamicForm;
