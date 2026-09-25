import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { ToastHost } from "./components/ui";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import HeritageDetail from "./pages/HeritageDetail";
import MapPage from "./pages/MapPage";
import TimelinePage from "./pages/TimelinePage";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import Culture from "./pages/Culture";
import Literature from "./pages/Literature";
import Food from "./pages/Food";
import Archive from "./pages/Archive";
import Contribute from "./pages/Contribute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Collection from "./pages/Collection";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSubmissions from "./pages/admin/Submissions";
import AdminRecords from "./pages/admin/Records";
import AdminUsers from "./pages/admin/Users";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/heritage/:slug" element={<HeritageDetail />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:slug" element={<StoryDetail />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/literature" element={<Literature />} />
          <Route path="/food" element={<Food />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="records" element={<AdminRecords />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
      <ToastHost />
    </>
  );
}
