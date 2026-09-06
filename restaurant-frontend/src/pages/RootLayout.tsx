import Sidebar from "@/components/layouts/Sidebar";
import { Outlet } from "react-router";

function RootLayout() {
  return (
    <div className="bg-[#111111] text-white">
      <Sidebar />

      <main className="min-h-screen pt-20 lg:ml-65 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
