import { Route, Routes, useLocation } from "react-router-dom"
import PatientPage from "./pages/PatientPage"
import PatientName from "./pages/PatientName"
import ConsultationPage from "./pages/ConsultationPage"
import Sidebar from "./Components/Sidebar"
import LoginPage from "./pages/LoginPage"


import DashboardExample from "./pages/DashboardPage"
import Createform from "./pages/CreateformPage"
import FormPage from "./pages/FormPage"
import MaternalCare from "./pages/MaternalCare"
import Tuberculosis from "./pages/Tuberculosis"

import PrivateRoute from "./pages/PrivateRoute"


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
          <Route path="/child-care" element={<PatientName />} />
          <Route path="/maternal-care" element={<MaternalCare />} />
          <Route path="/Tuberculosis-program" element={<Tuberculosis />} />

        </Routes>
    </div>
  )

  
}

export default App
