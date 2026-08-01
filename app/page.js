"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [ozet, setOzet] = useState({
    toplamOgrenci: 0,
    bugunGelenler: 0,
    bekleyenOdemeSayisi: 0,
    buAyGelir: 0,
    sonYoklamalar: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function dashboardVerileriniGetir() {
      try {
        // Öğrenci verileri
        const ogrenciRes = await fetch("/api/ogrenciler", {
          cache: "no-store",
        });
        const ogrenciText = await ogrenciRes.text();
        const ogrenciData = ogrenciText
          ? JSON.parse(ogrenciText)
          : { success: false, data: [] };

        // Muhasebe verileri
        const muhasebeRes = await fetch("/api/muhasebe", { cache: "no-store" });
        const muhasebeText = await muhasebeRes.text();
        const muhasebeData = muhasebeText
          ? JSON.parse(muhasebeText)
          : {
              success: false,
              data: { odemesiBekleyenler: [], buAyToplamGelir: 0 },
            };

        if (ogrenciData.success || muhasebeData.success) {
          setOzet({
            toplamOgrenci: ogrenciData.data?.length || 0,
            bugunGelenler: 0,
            bekleyenOdemeSayisi:
              muhasebeData.data?.odemesiBekleyenler?.length || 0,
            buAyGelir: muhasebeData.data?.buAyToplamGelir || 0,
            sonYoklamalar: [],
          });
        }
      } catch (error) {
        console.error("Dashboard verileri yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }

    dashboardVerileriniGetir();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-10">
      {/* ÜST BAŞLIK */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            🤸 Balans Cimnastik Yönetim Paneli
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Hoş geldiniz! Kurs genel durumu ve bugünün hareket özetleri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            ● Sistem Aktif
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* İSTATİSTİK KARTLARI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Toplam Öğrenci
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {loading ? "..." : ozet.toplamOgrenci}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Bu Ayki Gelir
          </p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            ₺ {loading ? "..." : ozet.buAyGelir}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Ödemesi Bekleyen
          </p>
          <p className="text-3xl font-bold text-amber-600 mt-2">
            {loading ? "..." : `${ozet.bekleyenOdemeSayisi} Kişi`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            NFC Yoklama İstasyonu
          </p>
          <p className="text-sm font-semibold text-indigo-600 mt-3">
            Hazır & Dinleniyor
          </p>
        </div>
      </div>

      {/* HIZLI ERİŞİM KISAYOLLARI */}
      <div className="max-w-7xl mx-auto mb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-4">🚀 Hızlı Menü</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/ogrenciler"
            className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition">
                Öğrenci Yönetimi
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Yeni kayıt ekleyin, NFC kart tanımlayın ve öğrenci listesini
                inceleyin.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 mt-4 inline-flex items-center gap-1">
              Modüle Git →
            </span>
          </Link>

          <Link
            href="/yoklama/nfc"
            className="group p-6 bg-slate-900 text-white rounded-2xl shadow-sm hover:shadow-lg transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="text-3xl mb-3">🎛️</div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                NFC Yoklama Ekranı
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Kapanmayan koyu mod ekranı açın, salona giren öğrencilerin
                kartını okutun.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 mt-4 inline-flex items-center gap-1">
              İstasyonu Başlat →
            </span>
          </Link>

          <Link
            href="/muhasebe"
            className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition">
                Muhasebe & WhatsApp
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Ödemesi gelen velileri görün, tek tıkla WhatsApp hatırlatması
                gönderin.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-4 inline-flex items-center gap-1">
              Muhasebeyi Aç →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
