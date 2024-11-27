import { Button } from "../Components/ui/button"
import { useNavigate, Route } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Createform = () => {
  const route = useNavigate();
  return (
    <div className=" flex-col gap-5 w-full">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <svg
              className="h-6 w-6"
              fill="black"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-xl font-semibold text-[#040E46]">Form</span>
          </div>
          <div className="text-sm text-[#040E46]">July 22, 2024</div>
        </div>
      </header>
    
    <div className="flex justify-center items-center h-full">
      <Button className="bg-[#040E46] hover:bg-[#FF3434]" onClick={() => {route('/form');}}><Plus />Create Form</Button>
    </div>
    </div>
  )
}

export default Createform
