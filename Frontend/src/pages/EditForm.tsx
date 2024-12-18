import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, SubmitHandler, Control } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../Components/ui/form";
import { Input } from "../Components/ui/input";
import { Card, CardContent } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Trash2 } from 'lucide-react';
import config from './config';
import { useLocation, useNavigate } from 'react-router-dom';
import { boolean } from 'zod';

// Define types for each field and section
interface Field {
  label: string;
  type: string;
  options?: string;
  description?: string;
  required:boolean;
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
  formData: {
    title: string;
    description: string;
    schema: {
      sections: Section[];
    };
  };
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

  const EditForm: React.FC<DynamicFormProps> = ({ formData }) => {
    const parsedSchema =
      formData?.schema && typeof formData.schema === "string"
        ? (() => {
            try {
              return JSON.parse(formData.schema);
            } catch (error) {
              console.error("Error parsing schema:", error);
              return { sections: [] };
            }
          })()
        : formData?.schema || { sections: [] };
  
    console.log("Parsed Schema:", parsedSchema);
  
    const navigate = useNavigate();
    const [isModalOpen2, setModalOpen2] = useState(false);
  
    const location = useLocation();
    const oldForm = location.state?.formData;
  
    console.log("Old Form (Location State):", oldForm);
  
    const form = useForm<FormValues>({
      defaultValues: {
        formname: formData?.title || "",
        description: formData?.description || "",
        sections: parsedSchema?.sections || [],
      },
    });
  
    const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
      control: form.control,
      name: "sections", // name must match the form structure
    });
  
    console.log("Form State:", form.getValues());
    console.log("Sections:", sections);
  
    const handleModalClose2 = () => {
      setModalOpen2(false);
      navigate("/createForm");
    };
  
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
      console.log("Submitted Data:", data);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
    
        const formId = location.state?.formData?.id; // Adjust according to where you store the form ID
    
        if (!formId) {
          throw new Error("Form ID is missing.");
        }
    
        const sanitizedSections = data.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) => ({
            ...field,
            type: field.type || "text",
            options: typeof field.options === "string" 
              ? field.options.split(",").map((opt) => opt.trim()) 
              : [],
          })),
        }));
        
        const payload = {
          title: data.formname,
          description: data.description,
          schema: JSON.stringify({ sections: sanitizedSections }),
        };
    
        console.log("Payload to Send:", payload);
    
        const response = await fetch(`${config.BASE_URL}formbuilder/api/forms/${formId}/`, {
          method: "PATCH",
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
        form.reset({
          formname: "",
          description: "",
          sections: [{ sectionname: "", fields: [] }],
        });
        setModalOpen2(true);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error(errorMessage);
      }
    };

    useEffect(() => {
      if (
        formData &&
        (formData.title !== form.getValues().formname ||
          formData.description !== form.getValues().description ||
          JSON.stringify(parsedSchema.sections) !==
            JSON.stringify(form.getValues().sections))
      ) {
        form.reset({
          formname: formData.title || "",
          description: formData.description || "",
        });
      }
    }, [formData]);
  
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
                onClick={() => appendSection({ sectionname: "", fields: [] })}
              >
                Add Section
              </Button>
              <Button type="submit" className="bg-[#0723BF] hover:bg-blue-400 hover:text-black border-2 hover:border-black w-auto h-12">
                Update
              </Button>
            </div>
          </form>
        </Form>
        <Modal2 isOpen={isModalOpen2} onClose={handleModalClose2} title=" Update Successfully!" />
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
                  <FormField
                      control={control}
                      name={`sections.${sectionIndex}.fields.${fieldIndex}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Field description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                <FormField
                    control={control}
                    name={`sections.${sectionIndex}.fields.${fieldIndex}.required`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required</FormLabel>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="ml-4"
                          />
                        </FormControl>
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
     {["checkbox-group", "radio-group", "select"].includes(fields[fieldIndex].type || "") && (
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
        onClick={() => append({ label: "", type: "text", options: "" , required:false})}
      >
        Add Field
      </Button>
    </div>
  );
}
export default EditForm;