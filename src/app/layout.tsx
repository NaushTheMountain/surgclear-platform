import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Shield, Stethoscope, Smartphone, Terminal, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "SurgClear | South African Surgical Pre-Admission & Financial Clearance",
  description:
    "B2B2C Pre-Authorisation, Tariff Shortfall & Patient Pass PWA for South African Hospitals and Specialists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-emerald-950">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="flex items-center">
                Surg<span className="text-emerald-600">Clear</span>
                <span className="ml-2 text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full tracking-wider">
                  ZA API
                </span>
              </span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/portal/specialist"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Specialist Trigger</span>
              </Link>

              <Link
                href="/pass/ep-88492-za"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Patient Pass PWA</span>
              </Link>

              <Link
                href="/developer/inspector"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>B2B Inspector</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>POPIA & HL7 FHIR R4 Compliant • All currency computed in integer ZAR cents</span>
            </div>
            <div>
              Switching Adapters: <span className="font-semibold text-slate-700">MediSwitch</span> •{" "}
              <span className="font-semibold text-slate-700">Healthbridge</span> •{" "}
              <span className="font-semibold text-slate-700">SpesNet</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
