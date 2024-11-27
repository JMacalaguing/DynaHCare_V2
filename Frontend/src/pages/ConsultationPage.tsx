import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table"

const invoices = [
  
  {
    invoice: "Kent cedrick",
    paymentStatus: "Paid",
    totalAmount: "November 10, 2024",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "James",
    paymentStatus: "Pending",
    totalAmount: "November 10, 2024",
    paymentMethod: "PayPal",
  },
  {
    invoice: "Sarah",
    paymentStatus: "Unpaid",
    totalAmount: "November 10, 2024",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "Dave",
    paymentStatus: "Paid",
    totalAmount: "November 10, 2024",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "JOydelyn",
    paymentStatus: "Paid",
    totalAmount: "November 10, 2024",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "November 10, 2024",
    paymentMethod: "Bank Transfer",
  },

]

export default function ConsultationPage() {
  return (
    <div className="flex flex-col w-full">
      <header className="border-b text-black px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="h-6 w-6"
              fill="black"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-xl font-semibold text-black">Patient</span>
          </div>
          <div className="text-sm text-black-600">July 22, 2024</div>
        </div>
      </header>
    
      <div className="w-full text-black"> {/* Flexbox to center content */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-black"> Patient Name</TableHead>
              <TableHead className="w-[100px] text-black">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell className="font-medium">{invoice.totalAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

}
