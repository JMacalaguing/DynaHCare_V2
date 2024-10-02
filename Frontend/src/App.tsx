import { Route, Routes } from "react-router-dom"
import DashboardPage from "./pages/DashboardPage"
import PatientPage from "./pages/PatientPage"
import ConsultationPage from "./pages/ConsultationPage"
import CreateformPage from "./pages/CreateformPage"
import Sidebar from "./Components/Sidebar"


function App() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-100 overflow-hidden">

      {/* BG */}
      <div className=" fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 opacity-80"/>
        <div className="absolute inset-0 backdrop-blur-sm"/>
      </div>

      <Sidebar/>
      <Routes>
        <Route path="/" element={<DashboardPage />}></Route>
        <Route path="/patientPage" element={<PatientPage />}></Route>
        <Route path="/consultationPage" element={<ConsultationPage />}></Route>
        <Route path="/createForm" element={<CreateformPage />}></Route>
      </Routes>
    </div>
  )

  
}

export default App
