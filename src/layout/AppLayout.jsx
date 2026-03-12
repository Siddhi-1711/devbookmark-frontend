import Navbar from "../components/Navbar";

export default function AppLayout({ children, maxWidth = "max-w-6xl" }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className={`${maxWidth} mx-auto px-4 pt-20`}>
        {children}
      </div>
    </div>
  );
}