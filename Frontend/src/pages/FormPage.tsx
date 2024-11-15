"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
    message: "Username must be at least 2 characters.",
  }),
  sectionname: z.string().min(8, {
    message: "Password must be at least 8 characters."
  })
})

const FormPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      formname: "",
      sectionname: ""
    },
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6 flex flex-col justify-center">
          <FormField
            control={form.control}
            name="formname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Form Name</FormLabel>
                <FormControl>
                  <Input placeholder="Immunization" {...field} />
                </FormControl>
                <FormDescription>
                  This is your Form Name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Card>
            <CardContent className="p-5 flex flex-col justify-center">
              <FormField
                control={form.control}
                name="sectionname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <FormControl>
                      <Input placeholder="section name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your Section Name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-around">
                <FormField
                  control={form.control}
                  name="sectionname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="p-2 bg-[#040E46] text-white rounded-xl">Label</div>
                          <Input placeholder="section name" className="border-l-0 border-t border-r border-b rounded-r-xl rounded-l-none" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sectionname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="p-2 bg-[#040E46] text-white rounded-xl">Type</div>
                          <Input placeholder="section name" className="border-l-0 border-t border-r border-b rounded-r-xl rounded-l-none" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button className="bg-[#040E46]" type="submit">Add Field</Button>
            </CardContent>
          </Card>
        </form>
      </Form>
      <div className="w-full flex justify-center gap-[40vw]">
        <Button className="bg-[#040E46]">
             Add Section    
        </Button>
        <Button className="bg-[#040E46]">
             Save Form    
        </Button>
      </div>
    </div>
  )
}

export default FormPage