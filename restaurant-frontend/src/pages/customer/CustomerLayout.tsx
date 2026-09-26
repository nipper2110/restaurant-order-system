import { Outlet } from "react-router";
import GustoLogo from "@/assets/Gusto.png";
import { siteConfig } from "@/config/site";

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#111111]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <img
            src={GustoLogo}
            alt={siteConfig.name}
            className="h-8 w-8 rounded-full object-contain"
          />
          <span className="text-base font-bold tracking-wide">
            {siteConfig.name}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md pb-24">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
