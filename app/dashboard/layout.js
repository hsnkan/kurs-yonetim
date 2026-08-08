import Navbar from "@/app/components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans relative overflow-x-hidden">
      {/* 🤸‍♂️ JİMNASTİK & PERFORMANS DİNAMİK ARKA PLAN ÇİZGİLERİ (SVG PATTERN) */}
      <div className="fixed inset-0 pointer-events-none opacity-15 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient
              id="gymGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Akıcı Akrobatik Hareket Çizgileri */}
          <path
            d="M-100,200 C300,50 600,400 1200,100"
            stroke="url(#gymGradient)"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M-50,400 C400,200 800,600 1500,200"
            stroke="url(#gymGradient)"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M100,-50 C500,500 900,100 1600,800"
            stroke="url(#gymGradient)"
            strokeWidth="8"
            fill="none"
          />

          {/* Denge Tahtası & Zemin Çizgileri */}
          <line
            x1="0"
            y1="90%"
            x2="100%"
            y2="90%"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="10 15"
          />
          <line
            x1="0"
            y1="92%"
            x2="100%"
            y2="92%"
            stroke="#3b82f6"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* SOL SIDEBAR */}
      <Navbar />

      {/* SAĞ İÇERİK ALANI */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 z-10 relative">
        {children}
      </main>
    </div>
  );
}
