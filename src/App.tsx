import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Login from "@/pages/Login";
import ProviderDetail from "@/pages/ProviderDetail";
import Booking from "@/pages/Booking";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Messages from "@/pages/Messages";
import DashboardIndex from "@/pages/dashboard/Index";
import DashboardCalendar from "@/pages/dashboard/Calendar";
import DashboardPets from "@/pages/dashboard/Pets";
import DashboardPostUpdate from "@/pages/dashboard/PostUpdate";
import DashboardIncome from "@/pages/dashboard/Income";
import DashboardSettings from "@/pages/dashboard/Settings";
import AdminReview from "@/pages/admin/Review";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/provider/:id" element={<ProviderDetail />} />
        <Route path="/booking/:providerId" element={<Booking />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/dashboard" element={<DashboardIndex />} />
        <Route path="/dashboard/calendar" element={<DashboardCalendar />} />
        <Route path="/dashboard/pets" element={<DashboardPets />} />
        <Route path="/dashboard/post-update" element={<DashboardPostUpdate />} />
        <Route path="/dashboard/income" element={<DashboardIncome />} />
        <Route path="/dashboard/settings" element={<DashboardSettings />} />
        <Route path="/admin" element={<AdminReview />} />
        <Route path="/admin/review" element={<AdminReview />} />
      </Routes>
    </Router>
  );
}
