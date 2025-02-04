import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "../Components/ui/form";
import { Input } from "../Components/ui/input";

export function PatientInformationCard({ control }: { control: any }) {
  const patientInformationFields = [
    { label: "Name", type: "text", required: true, description: "Full name of the patient, (Last Name, First Name, MI)" },
    { label: "Date of Birth", type: "date", required: true, description: "The patient's date of birth." },
    { label: "Sex", type: "select", options: "Male, Female", required: true, description: "Male or Female." }
  ];

  return (
    <div className="patient-information-card">
      <h2>Patient Information</h2>
      <div className="patient-info-fields">
        {patientInformationFields.map((field, index) => (
          <div key={index} className="field">
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                {field.type === "text" && <Input placeholder={field.description} />}
                {field.type === "date" && <Input type="date" />}
                {field.type === "select" && (
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={field.description} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.split(", ").map((option, idx) => (
                        <SelectItem key={idx} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        ))}
      </div>
    </div>
  );
}
