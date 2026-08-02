'use client';
import { useState, useEffect } from 'react';

export default function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [gruplar, setGruplar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliGrupFiltre, setSeciliGrupFiltre] = useState('TUMU');
  
  // Transfer ve Grup Yönetimi Modal Durumları
  const [transferOgrenci, setTransferOgrenci] = useState(null);
  const [yeniHedefGrup, setYeniHedefGrup] = useState('');
  const [grupYonetimAcik, setGrupYonetimAcik] = useState(false);
  const [yeniEklenecekGrupAd, setYeniEklenecekGrupAd] = useState('');

  const [seciliOgrenciDetay, setSeciliOgrenciDetay] = useState(null);
  const [detayLoading, setDetayLoading] = useState(false);

  const [yeniOgrenci, setYeniOgrenci] = useState({
    adSoyad: '',
    grup: '',
    veliAdSoyad: '',
    veliTelefon: '',
    veliYakinlik: 'Anne',
    ikinciVeliAdSoyad: '',
    ikinciVeliTelefon: '',
    ikinciVeliYakinlik: 'Baba',
    nfcUid: '',
    aylikUcret: 5000,
    odemeGunu: 1,
  });

  useEffect(() => {
    gruplariGetir();
  }, []);

  useEffect(() => {
    ogrencileriGetir();
  }, [seciliGrupFiltre]);

  const gruplariGetir = async () => {
    try {
      const res = await fetch('/api/gruplar', { cache: 'no-store' });
      const result = await res.json();
      if (result.success) {
        setGruplar(result.data || []);
        if (result.data.length > 0 && !yeniOgrenci.grup) {
          setYeniOgrenci((prev) => ({ ...prev, grup: result.data[0].ad }));
        }
      }
    } catch (err) {
      console.error('Gruplar çekilemedi:', err);
    }
  };

  const ogrencileriGetir = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ogrenciler?durum=AKTIF&grup=${seciliGrupFiltre}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success) setOgrenciler(result.data || []);
    } catch (error) {
      console.error('Öğrenciler yüklenemedi:', error);
      setOgrenciler([]);
    } font-sans finally {
      setLoading(false);
    }
  };

  // ➕ YENİ GRUP EKLEME
  const grupEkle = async (e) => {
    e.preventDefault();
    if (!yeniEklenecekGrupAd.trim()) return;

    try {
      const res = await fetch('/api/gruplar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad: yeniEklenecekGrupAd }),
      });
      const result = await res.json();
      if (result.success) {
        setYeniEklenecekGrupAd('');
        gruplariGetir();
        alert('Yeni grup başarıyla eklendi! 🎉');
      } else {
        alert(result.error || 'Grup eklenemedi.');
      }
    } catch (err) {
      alert('Grup ekleme hatası.');
    }
  };

  // 🗑️ GRUP SİLME
  const grupSil = async (id, ad) => {
    if (!confirm(`"${ad}" grubunu silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch('/api/gruplar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        gruplariGetir();
      }
    } catch (err) {
      alert('Grup silinirken hata oluştu.');
    }
  };

  // 🔄 KOLAY GRUP TRANSFER İŞLEMİ
  const transferiOnayla = async () => {
    if (!transferOgrenci || !yeniHedefGrup) return;

    try {
      const res = await fetch('/api/ogrenciler', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transferOgrenci._id, grup: yeniHedefGrup }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`${transferOgrenci.adSoyad} başarıyla "${yeniHedefGrup}" grubuna transfer edildi! 🎉`);
        setTransferOgrenci(null);
        if (seciliOgrenciDetay?.ogrenci._id === transferOgrenci._id) {
          setSeciliOgrenciDetay((prev) => ({
            ...prev,
            ogrenci: { ...prev.ogrenci, grup: yeniHedefGrup },
          }));
        }
        ogrencileriGetir();
      }
    } catch (err) {
      alert('Transfer işleminde hata oluştu.');
    }
  };

  const ogrenciDetayGetir = async (id) => {
    setDetayLoading(true);
    try {
      const res = await fetch(`/api/ogrenciler/detay?id=${id}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success) {
        setSeciliOgrenciDetay(result.data);
      }
    } catch (err) {
      alert('Öğrenci detayları alınamadı.');
    } finally {
      setDetayLoading(false);
    }
  };

  const kaliciSil = async (id, adSoyad) => {
    if (!confirm(`⚠️ UYARI: ${adSoyad} kalıcı olarak silinecektir! Emin misiniz?`)) return;
    try {
      const res = await fetch('/api/ogrenciler/sil', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`${adSoyad} silindi.`);
        if (seciliOgrenciDetay?.ogrenci._id === id) setSeciliOgrenciDetay(null);
        ogrencileriGetir();
      }
    } catch (err) {
      alert('Silme hatası');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ogrenciler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(yeniOgrenci),
      });

      const result = await res.json();
      if (result.success) {
        alert(`${yeniOgrenci.adSoyad} "${yeniOgrenci.grup}" kadrosuna kaydedildi! 🎉`);
        setYeniOgrenci({
          adSoyad: '',
          grup: gruplar.length > 0 ? gruplar[0].ad : '',
          veliAdSoyad: '',
          veliTelefon: '',
          veliYakinlik: 'Anne',
          ikinciVeliAdSoyad: '',
          ikinciVeliTelefon: '',
          ikinciVeliYakinlik: 'Baba',
          nfcUid: '',
          aylikUcret: 5000,
          odemeGunu: 1,
        });
        ogrencileriGetir();
      }
    } catch (err) {
      alert('Kayıt oluşturulurken hata oluştu.');
    }
  };

  const liste = ogrenciler || [];
  const filtrelenmisOgrenciler = liste.filter((o) =>
    o.adSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    o.veliAdSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    o.veliTelefon.includes(aramaMetni)
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">🎓 Öğrenci & Grup Yönetimi</h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            Grup isimlerini belirleyebilir ve öğrencileri seçtiğiniz gruplara kolayca transfer edebilirsiniz.
          </p>
        </div>

        {/* GRUP YÖNETİM BUTONU */}
        <button
          onClick={() => setGrupYonetimAcik(true)}
          className="bg-indigo-900 hover:bg-indigo-950 text-white font-black px-5 py-3 rounded-2xl text-xs transition shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <span>⚙️</span> Grup İsimlerini Yönet ({gruplar.length})
        </button>
      </div>

      {/* 🔍 ARAMA VE GRUP FİLTRELEME PANENİ */}
      <div className="bg-white p-5 rounded-3xl shadow-md border border-slate-300 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-700 uppercase mb-1">🔍 Öğrenci / Veli Ara</label>
          <input
            type="text"
            placeholder="İsim veya telefon numarası yazın..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="w-full border-2 border-slate-300 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 uppercase mb-1">🏷️ Gruba Göre Filtrele</label>
          <select
            value={seciliGrupFiltre}
            onChange={(e) => setSeciliGrupFiltre(e.target.value)}
            className="w-full border-2 border-slate-300 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 bg-white"
          >
            <option value="TUMU">Tüm Gruplar ({liste.length})</option>
            {gruplar.map((g) => (
              <option key={g._id} value={g.ad}>
                {g.ad}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ➕ YENİ ÖĞRENCİ KAYIT FORMU */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300 mb-8">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          ➕ Yeni Öğrenci & İlk Grup Kaydı
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-900 uppercase mb-1">Öğrenci Ad Soyad *</label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50"
              placeholder="Örn: Zeynep Asel KAN"
              value={yeniOgrenci.adSoyad}
              onChange={(e) => setYeniOgrenci({ ...yeniOgrenci, adSoyad: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase mb-1">Başlangıç Grubu *</label>
            <select
              className="w-full border-2 border-blue-600 p-3 rounded-xl text-sm font-black text-blue-900 bg-blue-50"
              value={yeniOgrenci.grup}
              onChange={(e) => setYeniOgrenci({ ...yeniOgrenci, grup: e.target.value })}
            >
              {gruplar.map((g) => (
                <option key={g._id} value={g.ad}>
                  {g.ad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">1. Veli Ad Soyad *</label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950"
              value={yeniOgrenci.veliAdSoyad}
              onChange={(e) => setYeniOgrenci({ ...yeniOgrenci, veliAdSoyad: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">1. Veli Telefon *</label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950"
              value={yeniOgrenci.veliTelefon}
              onChange={(e) => setYeniOgrenci({ ...yeniOgrenci, veliTelefon: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase mb-1">Aylık Ücret (₺)</label>
            <input
              type="number"
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950"
              value={yeniOgrenci.aylikUcret}
              onChange={(e) => setYeniOgrenci({ ...yeniOgrenci, aylikUcret: Number(e.target.value) })}
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-8 rounded-xl text-sm transition shadow-md"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* 📋 ÖĞRENCİ LİSTESİ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3 flex justify-between items-center">
          <span>📋 Kayıtlı Öğrenci Listesi</span>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold">
            Gösterilen: {filtrelenmisOgrenciler.length} / {liste.length}
          </span>
        </h2>

        {loading ? (
          <p className="text-slate-700 font-bold">Yükleniyor...</p>
        ) : filtrelenmisOgrenciler.length === 0 ? (
          <p className="text-slate-700 font-bold py-4">Arama kriterinize uygun öğrenci bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider">
                  <th className="p-4">Öğrenci Adı</th>
                  <th className="p-4">Mevcut Grubu</th>
                  <th className="p-4">1. Veli İletişim</th>
                  <th className="p-4">Ücret</th>
                  <th className="p-4 text-right">Grup Transfer & Sil</th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisOgrenciler.map((o) => (
                  <tr key={o._id} className="border-b border-slate-200 hover:bg-blue-50/50 text-slate-950 transition">
                    <td className="p-4">
                      <button
                        onClick={() => ogrenciDetayGetir(o._id)}
                        className="font-black text-base text-blue-700 hover:text-blue-900 hover:underline text-left"
                      >
                        👤 {o.adSoyad}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-100 text-indigo-900 font-black text-xs px-3 py-1.5 rounded-xl border border-indigo-200">
                        🏆 {o.grup || 'Belirtilmedi'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{o.veliAdSoyad}</div>
                      <div className="text-xs font-bold text-slate-700 font-mono">{o.veliTelefon}</div>
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-base">₺ {o.aylikUcret}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 🔄 KOLAY TRANSFER BUTONU */}
                        <button
                          onClick={() => {
                            setTransferOgrenci(o);
                            setYeniHedefGrup(o.grup || (gruplar[0]?.ad || ''));
                          }}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold py-1.5 px-3 rounded-lg text-xs transition"
                        >
                          🔄 Transfer Et
                        </button>
                        <button
                          onClick={() => kaliciSil(o._id, o.adSoyad)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ⚙️ ÖZEL GRUP YÖNETİM MODALI */}
      {grupYonetimAcik && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-indigo-950 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-emerald-400">⚙️ Kurs Grup İsimleri Yönetimi</h2>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">İstediğiniz grup isimlerini ekleyip çıkarın.</p>
              </div>
              <button
                onClick={() => setGrupYonetimAcik(false)}
                className="bg-indigo-900 hover:bg-indigo-800 text-white w-9 h-9 rounded-full font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* YENİ GRUP EKLEME FORMU */}
              <form onSubmit={grupEkle} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Örn: Hafta Sonu 10:00 Grubu..."
                  value={yeniEklenecekGrupAd}
                  onChange={(e) => setYeniEklenecekGrupAd(e.target.value)}
                  className="flex-1 border-2 border-slate-300 p-3 rounded-xl text-sm font-bold text-slate-950 outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-xl text-xs transition"
                >
                  ➕ Ekle
                </button>
              </form>

              {/* MEVCUT GRUPLAR LİSTESİ */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <span className="text-xs font-black text-slate-500 uppercase block mb-1">Mevcut Gruplar</span>
                {gruplar.map((g) => (
                  <div key={g._id} className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 text-sm">🏆 {g.ad}</span>
                    <button
                      onClick={() => grupSil(g._id, g.ad)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 text-right">
              <button
                onClick={() => setGrupYonetimAcik(false)}
                className="bg-slate-900 text-white font-black px-6 py-2.5 rounded-xl text-xs"
              >
                Tamam / Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 KOLAY GRUP TRANSFER MODALI */}
      {transferOgrenci && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-amber-500 text-slate-950 p-6">
              <span className="bg-slate-950 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                Grup Transfer İşlemi
              </span>
              <h2 className="text-xl font-black mt-2">{transferOgrenci.adSoyad}</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">Mevcut Grubu</span>
                <span className="text-sm font-black text-slate-900">🏆 {transferOgrenci.grup || 'Belirtilmedi'}</span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-2">
                  🎯 Transfer Edilecek Yeni Grup
                </label>
                <select
                  value={yeniHedefGrup}
                  onChange={(e) => setYeniHedefGrup(e.target.value)}
                  className="w-full border-2 border-amber-500 p-3 rounded-xl text-sm font-black text-slate-900 bg-amber-50 outline-none"
                >
                  {gruplar.map((g) => (
                    <option key={g._id} value={g.ad}>
                      {g.ad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setTransferOgrenci(null)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition"
              >
                İptal
              </button>
              <button
                onClick={transferiOnayla}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-md"
              >
                🔄 Transferi Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}