import { Routes, Route } from "react-router";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Audience from "@/pages/Audience";
import Campaigns from "@/pages/Campaigns";
import Performance from "@/pages/Performance";
import Customer from "@/pages/Customer";
import Customers from "@/pages/Customers";

export default function App() {
  return (
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
  );
}
