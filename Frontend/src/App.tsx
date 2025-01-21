import { Route, Routes, useLocation } from "react-router-dom";
import ITRpage from "./pages/ITRpage";
import ConsultationPage from "./pages/ConsultationPage";
import Sidebar from "./Components/Sidebar";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/DashboardPage";
import Createform from "./pages/CreateformPage";
import FormPage from "./pages/FormPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import FormInputPage from "./Components/FormInputPage";
import UserPage from "./pages/UserPage";
import PatientList from "./pages/PatientList";
import DynamicForm from "./pages/DynamicForm";
import EditForm from "./pages/EditForm";
import General_search from "./pages/General-search";


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
              <Dashboard/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ITRpage"
          element={
            <ProtectedRoute>
              <ITRpage />
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
          path="/dynamicform"
          element={
            <ProtectedRoute>
              <DynamicForm template={location.state?.template} />
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
        <Route path="/editForm" element={<EditForm formData={location.state?.formData} />} />
        <Route path="/general-search" element={<General_search />} />
        
      </Routes>
    </div>
  );
}

export default App;
