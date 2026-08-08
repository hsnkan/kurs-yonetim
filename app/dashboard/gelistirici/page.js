"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function GelistiriciPage() {
  const GIZLI_PIN = "2026"; // Geliştirici Giriş PIN Kodu

  const [pin, setPin] = useState("");
  const [yetkili, setYetkili] = useState(false);
  const [pinHata, setPinHata] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState(null); // { tip: 'basari'|'hata', metin: '' }

  const pinKontrolEt = (e) => {
    e.preventDefault();
    if (pin.trim() === GIZLI_PIN) {
      setYetkili(true);
      setPinHata(false);
    } else {
      setPinHata(true);
      setPin("");
    }
  };

  const bildirimGoster = (tip, metin) => {
    setMesaj({ tip, metin });
    setTimeout(() => {
      setMesaj(null);
    }, 4000);
  };

  // SILME İŞLEMLERİ
  const veriSil = async (islem, onayMetni) => {
    if (!confirm(onayMetni)) return;

    setYukleniyor(true);
    try {
      const res = await fetch(`/api/gelistirici?islem=${islem}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        bildirimGoster("basari", `✅ ${data.message}`);
      } else {
        bildirimGoster("hata", `✕ ${data.error}`);
      }
    } catch (err) {
      bildirimGoster("hata", "✕ İşlem gerçekleştirilirken hata oluştu!");
    } finally {
      setYukleniyor(false);
    }
  };

  // EXCEL TOPLU YÜKLEME
  const excelTopluYukle = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setYukleniyor(true);
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setYukleniyor(false);
          return bildirimGoster(
            "hata",
            "✕ Excel dosyası boş veya formatı geçersiz!",
          );
        }

        const yuklenecekler = data.map((item) => ({
          adSoyad: item["Öğrenci Adı Soyadı"] || item["adSoyad"] || "",
          grup: item["Grup"] || item["grup"] || "Minikler Cimnastik",
          kanGrubu: item["Kan Grubu"] || "0 Rh+",
          lisansliMi: String(item["Lisanslı mı"]).toLowerCase() === "evet",
          aylikUcret: Number(item["Aylık Ücret"]) || 2000,
          odemeGunu: Number(item["Ödeme Günü"]) || 1,
          nfcKartId: item["NFC Kart ID"]
            ? String(item["NFC Kart ID"])
            : undefined,
          veliListesi: [
            {
              adSoyad: item["Veli Adı"] || "Veli",
              yakinlikDerecesi: item["Yakınlık"] || "Anne",
              telefon: String(item["Veli Telefon"] || "05000000000"),
            },
          ],
        }));

        const res = await fetch("/api/gelistirici", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ yuklenecekler }),
        });

        const resData = await res.json();
        if (resData.success) {
          bildirimGoster("basari", `🚀 ${resData.message}`);
        } else {
          bildirimGoster("hata", `✕ ${resData.error}`);
        }
      } catch (err) {
        bildirimGoster("hata", "✕ Excel okunurken hata oluştu!");
      } finally {
        setYukleniyor(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 🔒 PIN GİRİŞİ YAPILMADIYSA KİLİT EKRANI
  if (!yetkili) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border-2 border-purple-500/40 rounded-3xl shadow-2xl text-white space-y-6 text-center">
        <div className="w-16 h-16 bg-purple-950 border-2 border-purple-500 rounded-2xl mx-auto flex items-center justify-center text-purple-400 text-2xl shadow-lg">
          🔑
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Geliştirici Paneli</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Bu alana sadece sistem geliştiricisi erişebilir. Lütfen PIN girin.
          </p>
        </div>

        <form onSubmit={pinKontrolEt} className="space-y-4">
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN Kodu..."
            className="w-full p-4 border-2 border-slate-700 focus:border-purple-500 rounded-2xl text-center text-2xl font-black text-white bg-slate-950 outline-none tracking-widest"
            autoFocus
          />

          {pinHata && (
            <p className="text-rose-400 text-xs font-bold animate-pulse">
              ⚠️ Hatalı PIN Girdiniz!
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            Panele Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  // 🔓 YETKİLİ GELİŞTİRİCİ PANELİ
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 text-slate-900 pb-12">
      {/* ÜST BAŞLIK */}
      <div className="bg-[#0F172A] text-white p-6 rounded-3xl shadow-2xl border border-purple-500/30 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-wide text-purple-400 flex items-center gap-2">
            <span>⚙️</span> Geliştirici & Sistem Yöneticisi Paneli
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Toplu veri silme, yoklama sıfırlama ve özel Excel yükleme alanı.
          </p>
        </div>
        <span className="bg-purple-950 text-purple-300 border border-purple-700 px-3 py-1.5 rounded-xl font-mono text-xs font-black">
          ROOT / DEV
        </span>
      </div>

      {/* BİLDİRİM KUTUSU */}
      {mesaj && (
        <div
          className={`p-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all ${
            mesaj.tip === "basari" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {mesaj.metin}
        </div>
      )}

      {/* 📊 GELİŞTİRİCİ ÖZEL TOPLU EXCEL YÜKLEME */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <span>📊</span> Geliştirici Özel Toplu Öğrenci Yükleme (.xlsx)
        </h2>
        <p className="text-xs font-bold text-slate-500">
          Hazırladığınız Excel dosyasını seçerek doğrudan veritabanına toplu
          aktarım yapabilirsiniz.
        </p>

        <div className="border-2 border-dashed border-purple-300 p-6 rounded-2xl text-center bg-purple-50/40">
          <label className="cursor-pointer bg-purple-700 hover:bg-purple-800 text-white font-black px-6 py-3.5 rounded-xl text-xs inline-block shadow-md transition-all">
            <span>📁 Excel Dosyasını Yükle ve Aktar</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              disabled={yukleniyor}
              onChange={excelTopluYukle}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 🚨 TEHLİKELİ VERİ TEMİZLEME BÖLGESİ (DANGER ZONE) */}
      <div className="bg-white p-6 rounded-3xl border-2 border-rose-200 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-rose-700 flex items-center gap-2 border-b border-rose-100 pb-3">
          <span>🚨</span> Veri Temizleme & Sıfırlama Alanı (Geri Alınamaz)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* BUGÜNÜN YOKLAMASINI SİL */}
          <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-200 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-amber-900 text-sm">
                📅 Bugünün Yoklamasını Sıfırla
              </h3>
              <p className="text-[11px] font-bold text-amber-700 mt-1">
                Sadece bugün alınmış NFC yoklama kayıtlarını siler. Öğrenci
                listesine dokunmaz.
              </p>
            </div>
            <button
              disabled={yukleniyor}
              onClick={() =>
                veriSil(
                  "bugun_yoklama",
                  "Bugüne ait tüm yoklama kayıtlarını silmek istediğinize emin misiniz?",
                )
              }
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase shadow-md"
            >
              Bugünü Temizle
            </button>
          </div>

          {/* TÜM YOKLAMALARI SİL */}
          <div className="p-5 bg-rose-50 rounded-2xl border-2 border-rose-200 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-rose-900 text-sm">
                📜 Tüm Yoklama Geçmişini Sil
              </h3>
              <p className="text-[11px] font-bold text-rose-700 mt-1">
                Sistemdeki geçmiş tüm günlerin NFC yoklama kayıtlarını kalıcı
                olarak temizler.
              </p>
            </div>
            <button
              disabled={yukleniyor}
              onClick={() =>
                veriSil(
                  "tum_yoklama",
                  "Sistemdeki TÜM yoklama kayıtlarını silmek istediğinize emin misiniz?",
                )
              }
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl text-xs uppercase shadow-md"
            >
              Tüm Yoklamaları Sil
            </button>
          </div>

          {/* TÜM ÖĞRENCİLERİ SİL */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl border-2 border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-rose-400 text-sm">
                ⚠️ Tüm Öğrencileri Sil
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                Veritabanında kayıtlı olan TÜM öğrencileri kalıcı olarak siler.
              </p>
            </div>
            <button
              disabled={yukleniyor}
              onClick={() =>
                veriSil(
                  "tum_ogrenciler",
                  "⚠️ DIKKAT: Veritabanındaki TÜM öğrencileri kalıcı olarak silmek istediğinize emin misiniz?",
                )
              }
              className="w-full bg-rose-800 hover:bg-rose-900 text-white font-black py-2.5 rounded-xl text-xs uppercase shadow-md border border-rose-600"
            >
              Tüm Öğrencileri Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
