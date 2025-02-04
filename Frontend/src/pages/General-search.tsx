import React, { useEffect, useState } from "react";
import config from "./config";
import { CalendarDays, FileUser} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface FormResponse {
  id: number;
  form: number;
  response_data: Record<string, Record<string, any>>;
  date_submitted: string;
  sender: string;
}

interface Form {
  id: number;
  title: string;
}


export default function GeneralSearch() {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [groupedResponses, setGroupedResponses] = useState<Record<number, FormResponse[]>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [forms, setForms] = useState<Form[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const RESPONSES_API = `${config.BASE_URL}/formbuilder/api/responses/`;
  const FORMS_API = `${config.BASE_URL}/formbuilder/api/forms/`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(RESPONSES_API).then((res) => res.json()),
      fetch(FORMS_API).then((res) => res.json()),
    ])
      .then(([responseData, formData]: [FormResponse[], Form[]]) => {
        console.log("API Responses:", responseData, formData);
        setResponses(responseData);
        groupResponsesByForm(responseData);
        setForms(formData);
        setLoading(false);
      })
      .catch((error) => {
        setError(`Failed to fetch data: ${error.message || "Unknown error"}`);
        setLoading(false);
      });
  }, []);

  interface MergedData {
    DateofRegistration: string;
    DoB: string;
    FamilySerialNumber:string;
    nhts:string;
    Name: string;
    Weight:string;
    LengthHieght:string;
    Sex: string;
    Mother: string;
    address:string;
    refferral:string;
    done:string;
    ITstatus:string;
    DateAssessed:string;
    firstMo:string;
    SecMo:string;
    thrdMo:string;
    FthMo:string;
    DateSixMo:string;
    sthMo:string;
    sevenMo:string;
    eightMo:string;
    BCG:string
    in24hrs:string;
    more24hrs:string;
    penta1:string;
    penta2:string;
    penta3:string;
    opv1:string;
    opv2:string;
    mcv1:string;
    mcv2:string;
    Immunized:string;
    rota1:string;
    rota2:string;
    pcv1:string;
    pcv2:string;
    pcv3:string;
    vintaminA6mos:string;
    vitaminA12dose1:string;
    vitaminA12dose2:string;
    iron6mos:string;
    iron12mos:string;
    mnp6mos:string;
    mnp12mos:string;
    deworning6mos:string;
    remarks:string;
  }
  const groupResponsesByForm = (responses: FormResponse[]) => {
    const grouped: Record<number, FormResponse[]> = {};
    responses.forEach((response) => {
      const formId = response.form;
      if (!grouped[formId]) {
        grouped[formId] = [];
      }
      grouped[formId].push(response);
    });
    setGroupedResponses(grouped);
  };

  const filteredGroups = searchTerm === ""
    ? Object.entries(groupedResponses)
    : Object.entries(groupedResponses)
        .map(([formId, responses]) => {
          const filteredResponses = responses.filter((response) =>
            Object.values(response.response_data).some((formData) => {
              if (!formData || typeof formData !== "object") return false;
              return Object.entries(formData).some(([key, value]) =>
                /(name|patient)/i.test(key) && typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
              );
            })
          );
          return [formId, filteredResponses] as [string, FormResponse[]];
        })
        .filter(([_, responses]) => responses.length > 0);

  const currentDate = new Date().toLocaleDateString();

  const extractFields = (response: FormResponse) => {
    return Object.keys(response.response_data).flatMap((formName) =>
      Object.entries(response.response_data[formName] || {})
    );
  };

  const renderValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.map((item) => renderValue(item)).join(", ");
    } else if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
    } else {
      return value ? String(value) : "N/A";
    }
  };

  const getFormTitle = (formId: number) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.title : "Unknown Form";
  };

  const mergeData = (): MergedData[] => {
    const merged: Record<string, MergedData> = {};
  
    responses.forEach((response) => {
      console.log("Response Data:", response.response_data); // Debugging
  
      const normalizeDate = (date: string): string => {
        return date.replace(/\s+/g, "").replace(/-/g, "/").trim();
      };
      
      const Name = String(response.response_data?.["Patient Information"]?.["Name"] || "").trim().toLowerCase();
      const DoB = normalizeDate(String(response.response_data?.["Patient Information"]?.["Date of Birth"] || ""));
      const Sex = String(response.response_data?.["Patient Information"]?.["Sex"] || "").trim().toLowerCase();
  
      // Generate the key
      const key = `${Name}-${DoB}-${Sex}`;
      console.log("Generated Key:", key); // Debugging
  
      if (!merged[key]) {
        // Initialize the merged data if the key doesn't exist
        merged[key] = {
          DateofRegistration: String(response.response_data?.["Patient Information"]?.["Date of Registration"] || ""),
          DoB,
          FamilySerialNumber: String(response.response_data?.["Patient Information"]?.["Family Serial Number"] || ""),
          nhts: String(response.response_data?.["Patient Information"]?.["NHTS"] || ""),
          Name: Name, // Store the normalized name
          Weight: String(response.response_data?.["Patient Information"]?.["Weight"] || ""),
          LengthHieght: String(response.response_data?.["Patient Information"]?.["Length/ Height"] || ""),
          Sex: Sex, // Store the normalized sex
          Mother: String(response.response_data?.["Patient Information"]?.["Complete Name of Mother"] || ""),
          address: String(response.response_data?.["Patient Information"]?.["Complete Address"] || ""),
          refferral: String(response.response_data?.["Date Newborn Screening"]?.["Referral"] || ""),
          done: String(response.response_data?.["Date Newborn Screening"]?.["Done"] || ""),
          ITstatus: String(response.response_data?.["Child Protected at Birth (CPAB)"]?.["IT Status Date"] || ""),
          DateAssessed: String(response.response_data?.["Child Protected at Birth (CPAB)"]?.["Date Assessed"] || ""),
          firstMo: String(response.response_data?.["Child Was Exclusively Breastfed"]?.["1st Month"] || ""),
          SecMo: String(response.response_data?.["Child Was Exclusively Breastfed"]?.["2nd Month"] || ""),
          thrdMo: String(response.response_data?.["Child Was Exclusively Breastfed"]?.["3rd Month"] || ""),
          FthMo: String(response.response_data?.["Child Was Exclusively Breastfed"]?.["4th Month"] || ""),
          sthMo: String(response.response_data?.["Child Was Exclusively Breastfed"]?.["9th Month"] || ""),
          sevenMo: String(response.response_data?.["Child Was Exclusively Breastfed"]?.["7th Month"] || ""),
          eightMo: String(response.response_data?.["Child Was Exclusively Breastfed"]?.["8th Month"] || ""),
          BCG: String(response.response_data?.["Date of Immunization Recieved"]?.["BCG"] || ""),
          in24hrs: String(response.response_data?.["Date of Immunization Recieved"]?.["HEPA B1 (within in 24hrs)"] || ""),
          more24hrs: String(response.response_data?.["Date of Immunization Recieved"]?.["HEPA B1 (more than 24hrs)"] || ""),
          penta1: String(response.response_data?.["Date of Immunization Recieved"]?.["PENTAVALENT 1"] || ""),
          penta2: String(response.response_data?.["Date of Immunization Recieved"]?.["PENTAVALENT 2"] || ""),
          penta3: String(response.response_data?.["Date of Immunization Recieved"]?.["PENTAVALENT 3"] || ""),
          opv1: String(response.response_data?.["Date of Immunization Recieved"]?.["OPV 1"] || ""),
          opv2: String(response.response_data?.["Date of Immunization Recieved"]?.["OPV 2"] || ""),
          mcv1: String(response.response_data?.["Date of Immunization Recieved"]?.["MCV 1 (9 mos)"] || ""),
          mcv2: String(response.response_data?.["Date of Immunization Recieved"]?.["MCV 2 (12 mos)"] || ""),
          Immunized: String(response.response_data?.["Date of Immunization Recieved"]?.["Date of Fully Immunized Child (FIC)"] || ""),
          rota1: String(response.response_data?.["Date of Immunization Recieved"]?.["ROTA VIRUS VACCINE 1"] || ""),
          rota2: String(response.response_data?.["Date of Immunization Recieved"]?.["ROTA VIRUS VACCINE 2"] || ""),
          pcv1: String(response.response_data?.["Date of Immunization Recieved"]?.["PCV 1"] || ""),
          pcv2: String(response.response_data?.["Date of Immunization Recieved"]?.["PCV 2"] || ""),
          pcv3: String(response.response_data?.["Date of Immunization Recieved"]?.["PCV 3"] || ""),
          vintaminA6mos: String(response.response_data?.["Micronutrients Supplementation"]?.["Vintamin A (6-11 mos)"] || ""),
          vitaminA12dose1: String(response.response_data?.["Micronutrients Supplementation"]?.["Vintamin A (12-59 mos ) 1st Dose"] || ""),
          vitaminA12dose2: String(response.response_data?.["Micronutrients Supplementation"]?.["Vintamin A (12-59 mos ) 2nd Dose"] || ""),
          iron6mos: String(response.response_data?.["Micronutrients Supplementation"]?.["Iron (6-11 mos)"] || ""),
          iron12mos: String(response.response_data?.["Micronutrients Supplementation"]?.["Iron (12-59 mos)"] || ""),
          mnp6mos: String(response.response_data?.["Micronutrients Supplementation"]?.["MNP(6-11 mos)"] || ""),
          mnp12mos: String(response.response_data?.["Micronutrients Supplementation"]?.["MNP(12-53 mos)"] || ""),
          DateSixMo: String(response.response_data?.["Child Was Exclusively Breastfed"]?.["6th Month"] || ""),
          deworning6mos: String(response.response_data?.["Deworming"]?.["6 Month"] || ""),
          remarks: "N/A",
        };
      } else {
        // If the key exists, merge the data
        const existingData = merged[key];
  
        const mergeField = (field: keyof MergedData, newValue: string) => {
          if (!existingData[field] || existingData[field].trim() === "") { 
            existingData[field] = newValue;
          }
        };
  
        // Merge each field
        mergeField("DateofRegistration", String(response.response_data?.["Patient Information"]?.["Date of Registration"] || ""));
        mergeField("FamilySerialNumber", String(response.response_data?.["Patient Information"]?.["Family Serial Number"] || ""));
        mergeField("nhts", String(response.response_data?.["Patient Information"]?.["NHTS"] || ""));
        mergeField("Weight", String(response.response_data?.["Patient Information"]?.["Weight"] || ""));
        mergeField("LengthHieght", String(response.response_data?.["Patient Information"]?.["Length/ Height"] || ""));
        mergeField("Mother", String(response.response_data?.["Patient Information"]?.["Complete Name of Mother"] || ""));
        mergeField("address", String(response.response_data?.["Patient Information"]?.["Complete Address"] || ""));
        mergeField("refferral", String(response.response_data?.["Date Newborn Screening"]?.["Referral"] || ""));
        mergeField("done", String(response.response_data?.["Date Newborn Screening"]?.["Done"] || ""));
        mergeField("ITstatus", String(response.response_data?.["Child Protected at Birth (CPAB)"]?.["IT Status Date"] || ""));
        mergeField("DateAssessed", String(response.response_data?.["Child Protected at Birth (CPAB)"]?.["Date Assessed"] || ""));
        mergeField("firstMo", String(response.response_data?.["Child Was Exclusively Breastfed"]?.["1st Month"] || ""));
        mergeField("SecMo", String(response.response_data?.["Child Was Exclusively Breastfed"]?.["2nd Month"] || ""));
        mergeField("thrdMo", String(response.response_data?.["Child Was Exclusively Breastfed"]?.["3rd Month"] || ""));
        mergeField("FthMo", String(response.response_data?.["Child Was Exclusively Breastfed"]?.["4th Month"] || ""));
        mergeField("sthMo", String(response.response_data?.["Child Was Exclusively Breastfed"]?.["9th Month"] || ""));
        mergeField("sevenMo", String(response.response_data?.["Child Was Exclusively Breastfed"]?.["7th Month"] || ""));
        mergeField("eightMo", String(response.response_data?.["Child Was Exclusively Breastfed"]?.["8th Month"] || ""));
        mergeField("BCG", String(response.response_data?.["Date of Immunization Recieved"]?.["BCG"] || ""));
        mergeField("in24hrs", String(response.response_data?.["Date of Immunization Recieved"]?.["HEPA B1 (within in 24hrs)"] || ""));
        mergeField("more24hrs", String(response.response_data?.["Date of Immunization Recieved"]?.["HEPA B1 (more than 24hrs)"] || ""));
        mergeField("penta1", String(response.response_data?.["Date of Immunization Recieved"]?.["PENTAVALENT 1"] || ""));
        mergeField("penta2", String(response.response_data?.["Date of Immunization Recieved"]?.["PENTAVALENT 2"] || ""));
        mergeField("penta3", String(response.response_data?.["Date of Immunization Recieved"]?.["PENTAVALENT 3"] || ""));
        mergeField("opv1", String(response.response_data?.["Date of Immunization Recieved"]?.["OPV 1"] || ""));
        mergeField("opv2", String(response.response_data?.["Date of Immunization Recieved"]?.["OPV 2"] || ""));
        mergeField("mcv1", String(response.response_data?.["Date of Immunization Recieved"]?.["MCV 1 (9 mos)"] || ""));
        mergeField("mcv2", String(response.response_data?.["Date of Immunization Recieved"]?.["MCV 2 (12 mos)"] || ""));
        mergeField("Immunized", String(response.response_data?.["Date of Immunization Recieved"]?.["Date of Fully Immunized Child (FIC)"] || ""));
        mergeField("rota1", String(response.response_data?.["Date of Immunization Recieved"]?.["ROTA VIRUS VACCINE 1"] || ""));
        mergeField("rota2", String(response.response_data?.["Date of Immunization Recieved"]?.["ROTA VIRUS VACCINE 2"] || ""));
        mergeField("pcv1", String(response.response_data?.["Date of Immunization Recieved"]?.["PCV 1"] || ""));
        mergeField("pcv2", String(response.response_data?.["Date of Immunization Recieved"]?.["PCV 2"] || ""));
        mergeField("pcv3", String(response.response_data?.["Date of Immunization Recieved"]?.["PCV 3"] || ""));
        mergeField("vintaminA6mos", String(response.response_data?.["Micronutrients Supplementation"]?.["Vintamin A (6-11 mos)"] || ""));
        mergeField("vitaminA12dose1", String(response.response_data?.["Micronutrients Supplementation"]?.["Vintamin A (12-59 mos ) 1st Dose"] || ""));
        mergeField("vitaminA12dose2", String(response.response_data?.["Micronutrients Supplementation"]?.["Vintamin A (12-59 mos ) 2nd Dose"] || ""));
        mergeField("iron6mos", String(response.response_data?.["Micronutrients Supplementation"]?.["Iron (6-11 mos)"] || ""));
        mergeField("iron12mos", String(response.response_data?.["Micronutrients Supplementation"]?.["Iron (12-59 mos)"] || ""));
        mergeField("mnp6mos", String(response.response_data?.["Micronutrients Supplementation"]?.["MNP(6-11 mos)"] || ""));
        mergeField("mnp12mos", String(response.response_data?.["Micronutrients Supplementation"]?.["MNP(12-53 mos)"] || ""));
        mergeField("DateSixMo", String(response.response_data?.["Child Was Exclusively Breastfed"]?.["6th Month"] || ""));
        mergeField("deworning6mos", String(response.response_data?.["Deworming"]?.["6 Month"] || ""));
      }
    });
  
    return Object.values(merged);
  };
  


  const exportToPDF = () => {
    const mergedData = mergeData();

    // Define the main headers
    const tableColumn = [
        "Date of Registration", "Date of Birth", "Family Serial Number", "NHTS","Name of Child", 
        "Weight", "Length/Height", "Sex", "Complete Name of Mother", "Complete Address", { content: "DATE NEWBORN SCREENING", colSpan: 2 }, 
        { content: "CHILD PROTECTED AT BIRTH (CPAB)", colSpan: 2 }, { content: "CHILD WAS EXCLUSIVELY BREASTFED****", colSpan: 6 },
        { content: "COMPLEMENTARY FEEDING***", colSpan: 3 },{ content: "DATE IMMUNIZATION RECIEVED", colSpan: 10 },"date fully immunized child (FIC)***",
        { content: "ROTA VACCINE", colSpan: 2 },{ content: "PHEUNOMOCCAL CONJUGATE VACCINE(PCV)", colSpan: 3 },{ content: "MICRONUTRIENT SUPLEMENTARY", colSpan: 7 },{ content: "DEWORMING", colSpan: 1 }, 
        "REMARKS"
    ].map(header => typeof header === 'string' ? header.toUpperCase() : header);

    // Define the sub-headers for the nested columns
    const subHeaders = [
        "", "","", "", "", "", "", "", "", "","","", "IT Status", "Date Assessed", "1st mo", "2nd mo", "3rd mo", "4th mo", 
        "5th mo", "Date for 6th mo", "6th mo","7th mo","8th mo","BCG",{ content: "HEPA B1", colSpan: 2 },{ content: "PENTAVALENT", colSpan: 3 },{ content: "OPV", colSpan: 2},
        { content: "MCV", colSpan: 2 },"","1","2","1","2","3",{ content: "VITAMIN A", colSpan: 3},{ content: "IRON", colSpan: 2 },{ content: "MNP", colSpan: 2 },""].map(header => typeof header === 'string' ? header.toUpperCase() : header);

       // Define the sub-headers for the nested columns
       const thrdHeaders = [
        "", "", "", "", "", "", "", "", "","","REFFERAL","DONE", 
        "", "", "", "", "", "", 
        "", "", "","","","","w/in 24hrs","more than 24hrs","1","2","3","1","2","MCV1 (AMV)",
        "MCV2 (MMR)","","","","","","","6-11 mos",{ content: "12-59", colSpan: 2 },"6-11 mos","12-59 mos","6-11 mos","12-59 mos",
        "12-59 mos"
    ].map(header => typeof header === 'string' ? header.toUpperCase() : header);

    const fthdHeaders = [
      "", "", "", "", "","", "", "", "", "","","", 
      "", "", "", "", "", "", 
      "", "", "","","","","","","","","","","","",
      "","","","","","","","","dose 1","dose 2","","","",""
  ].map(header => typeof header === 'string' ? header.toUpperCase() : header);

  const tableRows = mergedData.map(item => [
    item.DateofRegistration || "",
    item.DoB || "",
    item.FamilySerialNumber || "",
    item.nhts ||"",
    item.Name || "",
    item.Weight || "",
    item.LengthHieght || "",
    item.Sex || "",
    item.Mother || "",
    item.address || "",
    item.refferral ||"",
    item.done ||"",
    item.ITstatus || "",
    item.DateAssessed || "",
    item.firstMo || "",
    item.SecMo || "",
    item.thrdMo || "",
    item.FthMo || "",
    item.DateSixMo || "",
    item.sthMo || "",
    item.sevenMo || "",
    item.eightMo || "",
    item.BCG || "",
    item.in24hrs || "",
    item.more24hrs || "",
    item.penta1 || "",
    item.penta2 || "",
    item.penta3 || "",
    item.opv1 || "",
    item.opv2 || "",
    item.mcv1 || "",
    item.mcv2 || "",
    item.Immunized || "",
    item.rota1 || "",
    item.rota2 || "",
    item.pcv1 || "",
    item.pcv2 || "",
    item.pcv3 || "",
    item.vintaminA6mos || "",
    item.vitaminA12dose1 || "",
    item.vitaminA12dose2 || "",
    item.iron6mos || "",
    item.iron12mos || "",
    item.mnp6mos || "",
    item.mnp12mos || "",
    item.deworning6mos || "",
    item.remarks || "",
]);

    const columnCount = tableColumn.length;
    const rowCount = tableRows.length;

    const columnWidth = 5; // Adjust column width to avoid overflow
    const rowHeight = 2; // Approx height per row

    // Adjust the width of the PDF to accommodate all columns dynamically
    const pdfWidth = Math.max(1500, columnCount * columnWidth); // Min A4 width (210mm)
    const pdfHeight = Math.max(1500, rowCount * rowHeight); // Min A4 height (297mm)

    // 📄 Create dynamic size PDF
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight], // Dynamic width & height
    });

    autoTable(doc, {
        head: [
            tableColumn, // First row: Main headers
            subHeaders, // Second row: Sub-headers
            thrdHeaders, // Third row
            fthdHeaders
        ],
        body: tableRows,
        styles: { 
            fontSize: 12, 
            lineWidth: 0.2, 
            lineColor: [0, 0, 0], 
            cellPadding: 2,
            halign: 'center',
            valign: 'middle',
            overflow: 'linebreak', // Break text content into multiple lines
        }, 
        theme: 'plain', // No background color
        headStyles: { 
            fontSize: 14, 
            fontStyle: 'bold',
            cellPadding: 2,  
            halign: 'center',
            valign: 'middle',
        },
        columnStyles: {
          0: { cellWidth: 40}, 1: { cellWidth: 25 },2: { cellWidth: 28 }, 3: { cellWidth: 25 },4: { cellWidth: 90 },5: { cellWidth: 10 },6: { cellWidth: 10},7: { cellWidth: 15},
          8: { cellWidth: 90 },9: { cellWidth: 90 },10: { cellWidth: 30 }, 11: { cellWidth: 30 },12: { cellWidth: 30 },13: { cellWidth: 30 },14: { cellWidth: 15 },15: { cellWidth: 15 },
          16: { cellWidth: 15 },17: { cellWidth: 15 },18: { cellWidth: 20 },19: { cellWidth: 30 },20:{cellWidth:15},21:{cellWidth: 15 },22:{cellWidth: 15 },
          23:{cellWidth:30},24:{cellWidth:30},25:{cellWidth:30},26:{cellWidth:30},27:{cellWidth:30},28:{cellWidth:30},29:{cellWidth:30},30:{cellWidth:30},31:{cellWidth:30},
          32:{cellWidth:30},33:{cellWidth:30},34:{cellWidth:30},35:{cellWidth:30},36:{cellWidth:30},37:{cellWidth:20},38:{cellWidth:30}
        },
        margin: { top: 20 },
        pageBreak: 'auto', 
        didDrawPage: (data) => {
            doc.text("Exported Data", data.settings.margin.left, 10);
        },
        didParseCell: function (data) {
            if (data.section === 'head' && data.column.index === 0) {  
                data.cell.styles.valign = 'top'; 
                data.cell.styles.cellPadding = 2;
            }
            if(data.section ==='head' && data.column.index === 4){
              data.cell.styles.valign = 'bottom';
            }
            if(data.section ==='head' && data.column.index === 5){
              data.cell.styles.valign = 'bottom';
            }              
            if (data.section === 'head' && data.column.index === 6){
                data.cell.styles.valign = 'bottom';
                data.cell.styles.cellPadding = 2;
            }
            if(data.section ==='head' && data.column.index === 8){
              data.cell.styles.valign = 'bottom';
            }
            if(data.section ==='head' && data.column.index === 9){
              data.cell.styles.valign = 'bottom';
            }
            if (data.section === 'head' && data.column.index === 4){
                data.cell.styles.cellPadding = 2;
            }
            if (data.section === 'head' && data.column.index === 7){
                data.cell.styles.valign = 'top';
                data.cell.styles.cellPadding = 2;
            }
            if (data.section === 'head' && data.row.index === 0) { 
                data.cell.styles.lineWidth = { top: 0.2, right: 0.2, bottom: 0, left: 0.2 }; 
            }
            if (data.section === 'head' && data.row.index === 1) { 
                data.cell.styles.lineWidth = { top: 0, right: 0.2, bottom: 0, left: 0.2 }; 
                if ( data.column.index === 10) { 
                    data.cell.styles.lineWidth = { top: 0.2, right: 0.2, bottom: 0, left: 0.2 }; 
                }
                if (data.column.index === 11 || data.column.index === 12 || data.column.index === 13 || data.column.index === 14
                  || data.column.index === 15 || data.column.index === 16
                ) { 
                  data.cell.styles.lineWidth = { top: 0.2, right: 0.2, bottom: 0, left: 0.2 }; 
                  }
                if(  data.column.index === 17 || data.column.index === 18 || data.column.index === 19) { 
                data.cell.styles.lineWidth = { top: 0.2, right: 0.2, bottom: 0, left: 0.2 }; 
                  }
                if(  data.column.index === 20 || data.column.index === 21 || data.column.index === 22|| data.column.index === 23 || data.column.index === 24 || 
                      data.column.index === 25 || data.column.index ===26 || data.column.index ===27 || data.column.index ===28 || data.column.index ===29 ||data.column.index ===30 ||  data.column.index ===31 || data.column.index ===32 || data.column.index ===33
                    ||data.column.index ===34 || data.column.index ===35 || data.column.index ===36 || data.column.index ===37 || data.column.index ===38 || data.column.index ===39
                    || data.column.index ===40 || data.column.index ===41 || data.column.index ===42 ||data.column.index ===43 || data.column.index ===44 ||data.column.index ===45 ||data.column.index ===46) { 
                    data.cell.styles.lineWidth = { top: 0.2, right: 0.2, bottom: 0, left: 0.2 }; 
                  }

            }
            if (data.section === 'head' && data.row.index === 2){
                data.cell.styles.lineWidth = { top: 0, right: 0.2, bottom: 0, left: 0.2 };
                if(data.column.index ===24||data.column.index ===25||data.column.index ===26||
                  data.column.index ===27 || data.column.index ===28 || data.column.index ===29 || data.column.index ===30 ||  data.column.index ===31 || data.column.index ===32 
                  || data.column.index ===39
                  || data.column.index ===40 || data.column.index ===41 || data.column.index ===42 ||data.column.index ===43 || data.column.index ===44 ||data.column.index ===45
               
                ){
                  data.cell.styles.lineWidth = { top: 0.2, right: 0.2, bottom: 0, left: 0.2 };
                }

            }
            if(data.section ==='head'&& data.row.index ===3){
              data.cell.styles.lineWidth = { top: 0, right: 0.2, bottom: 0.2, left: 0.2 };
              if( data.column.index ===40 || data.column.index ===41 
              ){
                data.cell.styles.lineWidth = { top: 0.2, right: 0.2, bottom: 0.2, left: 0.2 };
              }
            }
        }
    });

    doc.save("export.pdf");
};


  const exportToExcel = () => {
    const mergedData = mergeData();
    const worksheet = XLSX.utils.json_to_sheet(mergedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
    XLSX.writeFile(workbook, "export.xlsx");
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-sky-300 to-blue-50 w-full overflow-auto">
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileUser className="h-6 w-6 text-black" />
            <span className="text-xl font-semibold text-black">Patient General Record</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-gradient-to-t from-sky-400 to-emerald-300 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-2"
            >
              Export
            </Button>
            <CalendarDays color="black" fill="white" />
            <span className="font-medium text-black">{currentDate}</span>
          </div>
        </div>
      </header>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96 relative">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <h2 className="text-xl font-bold mb-4 text-black">Export Options</h2>
            <div className="flex justify-between items-center">
              <Button
                onClick={() => {
                  exportToPDF();
                  setModalOpen(false);
                }}
                className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 ml-5"
              >
                <FaFilePdf className="mr-1" />
                Export to PDF
              </Button>
              <Button
                onClick={() => {
                  exportToExcel();
                  setModalOpen(false);
                }}
                className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 mr-5"
              >
                <FaFileExcel className="mr-1" />
                Export to Excel
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {error && <div className="text-center text-red-600 mb-4"><p>{error}</p></div>}
        {loading && !error && <div className="text-center text-blue-600 mb-4"><p>Loading responses...</p></div>}

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Patient Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 text-gray-700 bg-white border border-emerald-300 rounded-full shadow-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {filteredGroups.length === 0 && searchTerm !== "" && (
          <div className="text-center text-red-600">
            <p>No results found for "{searchTerm}"</p>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredGroups.map(([formId, formGroup]) => {
            const formTitle = getFormTitle(parseInt(formId));
            const isNutritionProgramForm = formTitle === "Patient Personal Info for Nutrition Program";
            let dob: string | null = null;
            let sex: string | null = null;

            // Extract unique fields and capture DOB and Sex if they exist
            const fieldSet = new Set();
            const filteredResponses = formGroup.map((response) => {
              const fields = extractFields(response);
              return fields.filter(([field, value]) => {
                const stringValue = String(value); // Ensure value is a string

                if (field === "Date of Birth") {
                  dob = stringValue; // Capture DOB
                  if (isNutritionProgramForm) fieldSet.add(field); // Ensure it appears in the table
                  return isNutritionProgramForm; // Only keep if in the correct form
                }
                if (field === "Sex") {
                  sex = stringValue; // Capture Sex
                  if (isNutritionProgramForm) fieldSet.add(field); // Ensure it appears in the table
                  return isNutritionProgramForm; // Only keep if in the correct form
                }
                fieldSet.add(field);
                return true;
              });
            });

            return (
              <div key={formId} className="mb-6 bg-gradient-to-t from-sky-400 to-emerald-300 shadow-lg rounded-xl p-4 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-sky-900">{formTitle}</h3>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full border-collapse">
                    <thead className="bg-gradient-to-t from-sky-400 to-emerald-300 text-black sticky top-0 rounded-t-lg">
                      <tr>
                        {[...fieldSet].map((field) => (
                          <th key={field as string} className="border px-4 py-3 text-xs text-left">
                            {field === "Name of the Patient" ? "Name" : field as string}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResponses.map((fields, index) => (
                        <tr key={index} className="hover:bg-gray-100 text-black">
                          {fields.map(([field, value]) => (
                            <td key={field.toString()} className="border px-4 py-3 text-xs text-left">
                              {renderValue(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}