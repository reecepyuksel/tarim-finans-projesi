const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json()); // JSON paketlerini açmak için şart!

// 1. TARLALARI VE TOPLAM GİDERLERİ GETİR (READ)
app.get("/api/fields", async (req, res) => {
  try {
    // JOIN sorgusu ile her tarla için harcamaları topluyoruz
    const query = `
      SELECT f.*, COALESCE(SUM(e.amount), 0) as total_expense
      FROM fields f
      LEFT JOIN expenses e ON f.id = e.field_id
      GROUP BY f.id
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Veritabanı hatası knk!" });
  }
});

// 2. YENİ GİDER KAYDET (CREATE)
app.post("/api/expenses", async (req, res) => {
  try {
    // Destructuring: amount ismini doğru yazdığından emin ol!
    const { field_id, expense_type, amount } = req.body;

    const newExpense = await pool.query(
      "INSERT INTO expenses (field_id, expense_type, amount) VALUES ($1, $2, $3) RETURNING *",
      [field_id, expense_type, amount],
    );
    res.json(newExpense.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/fields/:id", async (req, res) => {
  try {
    const { id } = req.params; // Silinecek tarlanın ID'sini URL'den alıyoruz

    // Veritabanından tarlayı siliyoruz
    // Tabloyu kurarken 'ON DELETE CASCADE' dediğimiz için harcamalar da otomatik silinir
    await pool.query("DELETE FROM fields WHERE id = $1", [id]);

    res.json({ message: "Tarla ve bağlı tüm giderler silindi knk!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Silme işlemi sırasında hata çıktı!" });
  }
});

app.listen(5001, () => console.log("Sunucu 5001'de hazır!"));
