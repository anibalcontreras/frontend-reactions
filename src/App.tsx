import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ApplicantLogin from "./pages/ApplicantLogin";
import SupplierLogin from "./pages/SupplierLogin";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import NewOrder from "./pages/NewOrder";
import OrderDetails from "./pages/OrderDetails";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/applicant-login" element={<ApplicantLogin />} />
        <Route path="/supplier-login" element={<SupplierLogin />} />

        {/* Rutas protegidas */}
        <Route
          path="/applicant-dashboard"
          element={
            <ProtectedRoute
              component={ApplicantDashboard}
              userTypes={["applicant"]}
            />
          }
        />
        <Route
          path="/new-service"
          element={
            <ProtectedRoute component={NewOrder} userTypes={["applicant"]} />
          }
        />

        <Route
          path="/supplier-dashboard"
          element={
            <ProtectedRoute
              component={SupplierDashboard}
              userTypes={["supplier"]}
            />
          }
        />

        {/* Ruta accesible tanto por applicant como supplier */}
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute
              component={OrderDetails}
              userTypes={["applicant", "supplier"]}
            />
          }
        />

        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
