import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// ChartJS'i kaydediyoruz
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
function App() {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [amount, setAmount] = useState("");

  // Verileri Backend'den tazeleyen fonksiyon
  const fetchFields = () => {
    fetch("http://localhost:5001/api/fields")
      .then((res) => res.json())
      .then((data) => setFields(data))
      .catch((err) => console.error("Veri hatası:", err));
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    // DİKKAT: Buradaki 'amount: amount' kısmı çok önemli (typo yapma!)
    const response = await fetch("http://localhost:5001/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_id: selectedField,
        expense_type: expenseType,
        amount: amount, // 'mount' değil, 'amount'!
      }),
    });

    if (response.ok) {
      alert("Harcama işlendi!");
      setAmount("");
      setExpenseType("");
      setSelectedField("");
      fetchFields(); // Listeyi anında güncelle
    }
  };
  const handleDeleteField = async (id) => {
    // Kullanıcıya son bir kez soralım (MIS projelerinde kritik silme işlemleri onay gerektirir)
    if (
      window.confirm(
        "Bu tarlayı ve tüm masraflarını silmek istediğine emin misin knk?",
      )
    ) {
      const response = await fetch(`http://localhost:5001/api/fields/${id}`, {
        method: "DELETE", // Silme isteği gönderiyoruz
      });

      if (response.ok) {
        alert("Tarla başarıyla silindi!");
        fetchFields(); // Listeyi anında güncelle
      }
    }
  };

  return (
    <div className="container py-5 bg-light min-vh-100">
      <h2 className="fw-bold mb-5 text-primary text-center">
        🚜 Tarım Finans Yönetim Paneli
      </h2>
      {/* FİNANSAL ANALİZ GRAFİĞİ */}
      <div
        className="card shadow border-0 rounded-4 mb-5 mx-auto p-4"
        style={{ maxWidth: "900px" }}
      >
        <h5 className="fw-bold mb-4 text-secondary text-center">
          📈 Tarlalar Arası Harcama Kıyaslaması
        </h5>
        <Bar
          data={{
            // Grafiğin altındaki isimler (Tarlaların adları)
            labels: fields.map((f) => f.field_name),
            datasets: [
              {
                label: "Toplam Harcama (TL)",
                // Grafikteki çubukların yüksekliği (Toplam giderler)
                data: fields.map((f) => Number(f.total_expense || 0)),
                backgroundColor: "rgba(25, 135, 84, 0.7)", // Başarı rengi (Yeşil)
                borderColor: "rgba(25, 135, 84, 1)",
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
            },
          }}
        />
      </div>

      {/* GİDER FORMU */}
      <div
        className="card shadow-sm border-0 rounded-4 mb-5 mx-auto"
        style={{ maxWidth: "800px" }}
      >
        <div className="card-body p-4">
          <form onSubmit={handleAddExpense} className="row g-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                required
              >
                <option value="">Tarla Seçin...</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.field_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Gider Tipi"
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Tutar (TL)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100 fw-bold">
                KAYDET
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* TARLA KARTLARI */}
      <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
        {fields.map((tarla) => (
          <div className="col" key={tarla.id}>
            <div className="card h-100 shadow border-0 rounded-4 overflow-hidden bg-white">
              <div className="card-header bg-success text-white text-center py-3">
                <h5 className="mb-0 fw-bold">{tarla.field_name}</h5>
              </div>
              <div className="card-body p-4 d-flex flex-column">
                <p className="mb-2 text-muted small">
                  📍 KONUM: <b>{tarla.location}</b>
                </p>
                <p className="mb-3 text-muted small">
                  📏 ALAN: <b>{tarla.area_size} Dönüm</b>
                </p>

                <div className="mb-3 p-3 bg-light rounded-3 border-start border-4 border-danger text-center">
                  <p className="mb-1 text-muted small fw-bold text-uppercase">
                    Toplam Harcama
                  </p>
                  <h4 className="fw-bold text-danger mb-0">
                    {Number(tarla.total_expense || 0).toLocaleString("tr-TR")}{" "}
                    TL
                  </h4>
                </div>

                <div className="mb-4 p-3 bg-light rounded-3 border-start border-4 border-warning text-center">
                  <p className="mb-1 text-muted small fw-bold text-uppercase">
                    Dönüm Başı Maliyet
                  </p>
                  <h5 className="fw-bold text-dark mb-0">
                    {tarla.area_size > 0
                      ? (
                          Number(tarla.total_expense || 0) /
                          Number(tarla.area_size)
                        ).toFixed(2)
                      : "0.00"}{" "}
                    TL
                  </h5>
                </div>

                <div className="d-flex gap-2 mt-auto">
                  <button className="btn btn-success flex-grow-1 fw-bold">
                    Detaylar
                  </button>

                  {/* Silme Butonu - Çöp kutusu ikonu veya 'Sil' yazısı */}
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleDeleteField(tarla.id)}
                    title="Tarlayı Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
