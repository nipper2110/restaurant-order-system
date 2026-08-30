import { Outlet } from "react-router";

function RootLayout() {
  return (
    <>
      <div>RootLayout</div>
      <Outlet />
    </>
  );
}

export default RootLayout;
