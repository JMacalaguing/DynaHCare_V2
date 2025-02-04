import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(({ children, ...props }, ref) => (
  <SelectPrimitive.Root {...props}>
    <SelectPrimitive.Trigger
      ref={ref}
      className="flex items-center justify-between border border-gray-300 p-2 rounded"
    >
      <SelectPrimitive.Value placeholder="Select an option" />
      <ChevronDown className="w-4 h-4" />
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="bg-white shadow-md rounded">
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
));

Select.displayName = "Select"; // Important for debugging React.forwardRef components

export { Select };
