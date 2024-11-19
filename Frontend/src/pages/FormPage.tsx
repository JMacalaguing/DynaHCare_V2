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
  }),
  label: z.string(),
  type: z.string(),
})

const FormPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      formname: "",
      sectionname: "",
      label: "",
      type: ""
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
          <Card>
            <CardContent className="p-7 flex flex-col justify-center">
              <FormField
                control={form.control}
                name="sectionname"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-3">
                    <FormLabel className="text-xl">Section Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Section Name . . ." className="w-full h-12" {...field} />
                    </FormControl>
                    <FormDescription className="text-md">
                      This is your Section Name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-around my-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="p-2 bg-[#040E46] text-white rounded-xl w-auto h-12">Label</div>
                          <Input placeholder="Label . . ." className="border-l-0 border-t border-r border-b rounded-r-xl rounded-l-none w-auto h-12 text-md" {...field} />
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="p-2 bg-[#040E46] text-white rounded-xl w-auto h-12">Type</div>
                          <Input placeholder="Type . . ." className="border-l-0 border-t border-r border-b rounded-r-xl rounded-l-none w-auto h-12 text-md" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button className="bg-[#040E46] w-auto h-12 text-md border-2 hover:bg-blue-400 hover:text-black hover:border-black" type="submit">Add Field</Button>
            </CardContent>
          </Card>
      <div className="w-full flex justify-center gap-x-[30vw]">
        <Button className="bg-transparent text-black border-2 border-[#040E46] hover:bg-yellow-300 hover:text-black w-auto h-12">
             Add Section    
        </Button>
        <Button className="bg-[#0723BF] hover:bg-blue-400 hover:text-black border-2 hover:border-black w-auto h-12">
             Save Form    
        </Button>
      </div>
      </form>
      </Form>
    </div>
  )
}

export default FormPage