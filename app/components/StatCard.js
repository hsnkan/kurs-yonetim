"use client";

export default function StatCard({
  baslik,
  deger,
  degisim,
  degisimMetni = "geçen aya göre",
}) {
  const pozitif = degisim >= 0;

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
          {baslik}
        </p>
        <div className="text-3xl font-black text-slate-900">{deger}</div>
      </div>

      {degisim !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span
            className={`inline-flex items-center font-black px-3 py-1 rounded-full ${
              pozitif
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : "bg-rose-100 text-rose-900 border border-rose-300"
            }`}
          >
            {pozitif ? `+${degisim}` : degisim}
          </span>
          <span className="text-slate-700 font-bold">{degisimMetni}</span>
        </div>
      )}
    </div>
  );
}
