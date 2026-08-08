"use client";
import { useEffect, useState } from "react";
import StatCard from "@/app/components/StatCard";

export default function RaporlarPage() {
  const [ogrenciOzet, setOgrenciOzet] = useState(null);
  const [finansOzet, setFinansOzet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verileriGetir() {
      try {
        const [ogrenciRes, muhasebeRes] = await Promise.all([
          fetch("/api/ogrenciler"),
          fetch("/api/muhasebe"),
        ]);
        const ogrenciData = await ogrenciRes.json();
        const muhasebeData = await muhasebeRes.json();

        if (ogrenciData.success) setOgrenciOzet(ogrenciData.istatistik);
        if (muhasebeData.success) setFinansOzet(muhasebeData.finansalRapor);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    }
    verileriGetir();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-400"></div>
        <p className="mt-4 text-white font-black text-sm">
          Raporlar Yükleniyor...
        </p>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* 🌟 KONTRASTI DÜZELTİLMİŞ BEMBEYAZ YÜKSEK OKUNABİLİR BAŞLIK */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-black text-white tracking-wide flex items-center gap-3">
          📊 Genel Özet & Raporlar
        </h1>
        <p className="text-sm font-bold text-slate-300 mt-1">
          Balans Cimnastik Akademi canlı performans ve mali istatistikleri
        </p>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          baslik="Aktif Öğrenci Sayısı"
          deger={ogrenciOzet?.toplamAktif || 0}
        />
        <StatCard
          baslik="Bu Ay Yeni Kayıt"
          deger={ogrenciOzet?.buAyYeni || 0}
          degisim={
            (ogrenciOzet?.buAyYeni || 0) - (ogrenciOzet?.gecenAyYeni || 0)
          }
        />
        <StatCard
          baslik="Bu Ay Ayrılan Öğrenci"
          deger={ogrenciOzet?.buAyAyrilan || 0}
          degisim={
            (ogrenciOzet?.buAyAyrilan || 0) - (ogrenciOzet?.gecenAyAyrilan || 0)
          }
        />
        <StatCard
          baslik="Bu Ayki Toplam Gelir"
          deger={`${finansOzet?.buAyGelir || 0} ₺`}
          degisim={finansOzet?.fark}
          degisimMetni="₺ geçen aya göre"
        />
      </div>

      {/* GELİR KARŞILAŞTIRMA KARTI */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-2xl text-slate-900">
        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
          Aylık Gelir Karşılaştırması
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="bg-white p-5 rounded-xl border-2 border-slate-200 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-600">
              Geçen Ay Geliri
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {finansOzet?.gecenAyGelir || 0} ₺
            </p>
          </div>

          <div className="hidden md:flex justify-center text-slate-800">
            <svg
              className="w-10 h-10 stroke-[3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          <div className="bg-white p-5 rounded-xl border-2 border-amber-400 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-amber-700">
              Bu Ay Geliri
            </p>
            <p className="text-3xl font-black text-amber-600 mt-1">
              {finansOzet?.buAyGelir || 0} ₺
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
