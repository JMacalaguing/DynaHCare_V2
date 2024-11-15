import { Route, Routes, useLocation } from "react-router-dom"
import DashboardPage from "./pages/DashboardPage"
import PatientPage from "./pages/PatientPage"
import ConsultationPage from "./pages/ConsultationPage"
import CreateformPage from "./pages/CreateformPage"
import Sidebar from "./Components/Sidebar"
import LoginPage from "./pages/LoginPage"

import DashboardExample from "./pages/DashboardPage"
import Createform from "./pages/CreateformPage"
import FormPage from "./pages/FormPage"


function App() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-100 overflow-hidden">

      {/* Conditionally render Sidebar except on LoginPage */}
      {location.pathname !== '/' && <Sidebar />}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboardPage" element={<DashboardExample />} />
          <Route path="/patientPage" element={<PatientPage />} />
          <Route path="/consultationPage" element={<ConsultationPage />} />
          <Route path="/createForm" element={<Createform />} />
          <Route path="/form" element={<FormPage />} />
        </Routes>
    </div>
  )

  
}

export default App
