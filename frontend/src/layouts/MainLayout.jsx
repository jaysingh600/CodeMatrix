import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function MainLayout() {
  const location = useLocation();
  const isProblemRoute = location.pathname.match(/^\/problems\/[a-zA-Z0-9_-]+(\/.*)?$/);
  const isVisualizer = location.pathname.startsWith("/visualizer");
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isProblemRoute && !isVisualizer && <Footer />}
    </div>
  )
}
