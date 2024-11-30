import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, Control } from "react-hook-form";
import { z } from "zod";
import { Trash2, Plus } from "lucide-react";
import { Button } from "../Components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Components/ui/form";
import { Input } from "../Components/ui/input";
import { Card, CardContent } from "../Components/ui/card";
import { useNavigate } from "react-router-dom";

// Modal Component
function Modal({ isOpen, onClose, title, message }: { isOpen: boolean; onClose: () => void; title: string; message: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg text-center w-3/4 max-w-md">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-700 text-white">
          Close
        </Button>
      </div>
    </div>
  );
}

// Zod schema for validation
const FormSchema = z.object({
  formname: z.string().min(2, {
    message: "Form name must be at least 2 characters.",
  }),
  sections: z.array(
    z.object({
      sectionname: z.string().min(2, {
        message: "Section name must be at least 2 characters.",
      }),
      fields: z.array(
        z.object({
          label: z.string().min(1, { message: "Label is required." }),
          type: z.string().min(1, { message: "Type is required." }),
          options: z.string().optional(), // For fields like checkbox-group, radio-group, select
        })
      ),
    })
  ),
});

// TypeScript types inferred from Zod schema
type FormValues = z.infer<typeof FormSchema>;

export default function FormBuilder({ formId }: { formId?: number }) {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      formname: "",
      sections: [{ sectionname: "", fields: [] }],
    },
  });

  const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!formId) return;

    async function fetchFormData(formId: number) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await fetch(`http://localhost:8000/formbuilder/api/forms/${formId}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch form data.");
        }

        const data: FormValues = await response.json();
        form.reset(data);
      } catch (error) {
        console.error("Failed to fetch form data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFormData(formId);
  }, [formId, form]);

  const onSubmit = async (data: FormValues) => {
    console.log("Form data before sanitization:", data);

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
          options: field.options ? field.options.split(",").map((opt) => opt.trim()) : [], // Split and trim options
        })),
      }));

      const payload = {
        title: data.formname,
        schema: JSON.stringify({ sections: sanitizedSections }),
      };

      const response = await fetch("http://localhost:8000/formbuilder/api/forms/", {
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

      form.reset({
        formname: "",
        sections: [{ sectionname: "", fields: [] }],
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error(errorMessage);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false); // Close the modal
    navigate('/createForm'); // Navigate to /createForm page
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 justify-center items-center text-black">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-4/5 space-y-6 flex flex-col border-2 border-gray-400 rounded-lg p-7 overflow-auto max-h-[80vh]"
        >
          <FormField
            control={form.control}
            name="formname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Form Name</FormLabel>
                <FormControl>
                  <Input placeholder="Title . . ." className="w-full h-12 text-md" {...field} />
                </FormControl>
                <FormDescription className="text-md">This is your Form Name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {sections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardContent className="p-7 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <FormField
                    control={form.control}
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
            <Button
              type="submit"
              className="bg-[#0723BF] hover:bg-blue-400 hover:text-black border-2 hover:border-black w-auto h-12"
            >
              Save Form
            </Button>
          </div>
        </form>
      </Form>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Form Created Successfully!"
        message="Your form has been created and saved."
      />
    </div>
  );
}

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
  };
