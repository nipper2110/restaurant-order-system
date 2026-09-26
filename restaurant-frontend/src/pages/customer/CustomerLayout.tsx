import { Outlet, useNavigate, useParams } from "react-router";
import { ShoppingCart } from "lucide-react";

import GustoLogo from "@/assets/Gusto.png";
import { siteConfig } from "@/config/site";
import { CartProvider } from "./CartContext";
import { useCart } from "./cartContextStore";

function CartButton() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const navigate = useNavigate();
  const { count } = useCart();

  return (
    <button
      onClick={() => navigate(`/order/${qrToken}/cart`)}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 hover:text-white"
    >
      <ShoppingCart className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#fbbf24] px-1 text-[10px] font-semibold text-black">
          {count}
        </span>
      )}
    </button>
  );
}

function CustomerLayout() {
  return (
    <CartProvider>
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
          <CartButton />
        </header>

        <main className="mx-auto max-w-md pb-24">
          <Outlet />
        </main>
      </div>
    </CartProvider>
  );
}

export default CustomerLayout;
