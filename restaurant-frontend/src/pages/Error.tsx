import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import { RefreshCw, Home, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import GustoLogo from "@/assets/Gusto.png";

function Error() {
  const error = useRouteError();
  const navigate = useNavigate();

  let code = "Error";
  let title = "Something went wrong";
  let message =
    "An unexpected error occurred while preparing this page. Try again in a moment.";

  if (isRouteErrorResponse(error)) {
    code = String(error.status);
    if (error.status === 404) {
      title = "Page not found";
      message =
        "We couldn't find the page you were looking for. It may have been moved or removed from the menu.";
    } else {
      title = error.statusText || title;
      if (typeof error.data === "string" && error.data) {
        message = error.data;
      }
    }
  } else if (error instanceof globalThis.Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] px-4 py-16 text-white">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <img
            src={GustoLogo}
            alt="Gusto"
            className="h-10 w-10 rounded-full object-contain"
          />
          <span className="text-lg font-bold tracking-wide">GUSTO</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#fbbf24]/50 bg-[#1a1a1a] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4d3a00]">
            <UtensilsCrossed
              className="h-6 w-6 text-[#fbbf24]"
              strokeWidth={2}
            />
          </div>

          <p className="mt-6 text-5xl font-bold tracking-tight text-[#fbbf24] tabular-nums">
            {code}
          </p>

          <h1 className="mt-3 text-xl font-semibold text-white">{title}</h1>

          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {message}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
              onClick={() => navigate(0)}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4" />
              Back to dashboard
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          If this keeps happening, contact your system administrator.
        </p>
      </div>
    </div>
  );
}

export default Error;
