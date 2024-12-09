import { Route, Routes, useLocation } from "react-router-dom";
import PatientPage from "./pages/PatientPage";
import ConsultationPage from "./pages/ConsultationPage";
import Sidebar from "./Components/Sidebar";
import LoginPage from "./pages/LoginPage";
import DashboardExample from "./pages/DashboardPage";
import Createform from "./pages/CreateformPage";
import FormPage from "./pages/FormPage";
import MaternalCare from "./pages/MaternalCare";
import Tuberculosis from "./pages/Tuberculosis";
import ProtectedRoute from "./pages/ProtectedRoute";
import FormInputPage from "./Components/FormInputPage";
import UserPage from "./pages/UserPage";
import PatientList from "./pages/patientlist";



function App() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-100 overflow-hidden">
      {/* Conditionally render Sidebar except on LoginPage */}
      {location.pathname !== "/" && <Sidebar />}

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboardPage"
          element={
            <ProtectedRoute>
              <DashboardExample />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patientPage"
          element={
            <ProtectedRoute>
              <PatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultationPage"
          element={
            <ProtectedRoute>
              <ConsultationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createForm"
          element={
            <ProtectedRoute>
              <Createform />
            </ProtectedRoute>
          }
        />
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <FormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maternal-care"
          element={
            <ProtectedRoute>
              <MaternalCare />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Tuberculosis-program"
          element={
            <ProtectedRoute>
              <Tuberculosis />
            </ProtectedRoute>
          }
        />
     
    
         <Route path="/form/:formId" element={<FormInputPage />} />
         <Route
          path="/UserPage"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
         <Route path="/patients" element={<PatientList />} />
      </Routes>
    </div>
  );
}

export default App;
