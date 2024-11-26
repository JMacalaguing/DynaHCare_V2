"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Plus } from 'lucide-react'

import { toast } from "../hooks/use-toast"
import { Button } from "../Components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Components/ui/form"
import { Input } from "../Components/ui/input"
import { Card, CardContent } from "../Components/ui/card"

const FormSchema = z.object({
  formname: z.string().min(2, {
    message: "Form name must be at least 2 characters.",
  }),
  sections: z.array(z.object({
    sectionname: z.string().min(2, {
      message: "Section name must be at least 2 characters."
    }),
    fields: z.array(z.object({
      label: z.string(),
      type: z.string(),
    })),
  }))
})

export default function FormBuilder() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      formname: "",
      sections: [{ sectionname: "", fields: [] }]
    },
  })

  const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "sections"
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <div className="w-full h-full flex flex-col gap-8 justify-center items-center text-black">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-4/5 space-y-6 flex flex-col border-2 border-gray-400 rounded-lg p-7">
          <FormField
            control={form.control}
            name="formname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Form Name</FormLabel>
                <FormControl>
                  <Input placeholder="Immunization . . ." className="w-full h-12 text-md" {...field} />
                </FormControl>
                <FormDescription className="text-md">
                  This is your Form Name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {sections.map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardContent className="p-7 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <FormField
                    control={form.control}
                    name={`sections.${sectionIndex}.sectionname`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xl">Section Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Section Name . . ." 
                            className="w-full h-12" 
                            {...field} 
                          />
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

                <FieldArray 
                  sectionIndex={sectionIndex} 
                  control={form.control} 
                />
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
    </div>
  )
}

function FieldArray({ sectionIndex, control }: { sectionIndex: number, control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.fields`
  });

  return (
    <div className="space-y-4 mt-4">
      {fields.map((field, fieldIndex) => (
        <div key={field.id} className="flex items-center space-x-4">
          <FormField
            control={control}
            name={`sections.${sectionIndex}.fields.${fieldIndex}.label`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="flex">
                    <div className="p-2 bg-[#040E46] text-white rounded-l-xl w-auto h-12">Label</div>
                    <Input 
                      placeholder="Label . . ." 
                      className="border-l-0 border-t border-r border-b rounded-r-xl rounded-l-none w-full h-12 text-md" 
                      {...field} 
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`sections.${sectionIndex}.fields.${fieldIndex}.type`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="flex">
                    <div className="p-2 bg-[#040E46] text-white rounded-l-xl w-auto h-12">Type</div>
                    <Input 
                      placeholder="Type . . ." 
                      className="border-l-0 border-t border-r border-b rounded-r-xl rounded-l-none w-full h-12 text-md" 
                      {...field} 
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => remove(fieldIndex)}
            className="p-2"
          >
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append({ label: "", type: "" })}
        className="mt-2 bg-[#040E46] text-white hover:bg-blue-400 hover:text-black w-full h-12 text-md border-2 hover:border-black"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Field
      </Button>
    </div>
  );
}

