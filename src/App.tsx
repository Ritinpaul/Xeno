import { Routes, Route, Navigate, useLocation } from "react-router";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Audience from "@/pages/Audience";
import Campaigns from "@/pages/Campaigns";
import Performance from "@/pages/Performance";
import Customer from "@/pages/Customer";
import Customers from "@/pages/Customers";
import Login from "@/pages/Login";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("bloom_auth") === "true";
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/audience" element={<Audience />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/customer/:id" element={<Customer />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
