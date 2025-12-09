// server.js
require('dotenv').config(); // Membaca kredensial dari .env

const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer'); 
const app = express();
const port = 3000;

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Konfigurasi Multer (menyimpan file sementara di memori)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Aktifkan CORS (Agar Front-end bisa mengakses Back-end)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Rute POST untuk Unggahan
// upload.single('image') mencari file di field bernama 'image'
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah." });
  }

  try {
    // Ubah file buffer menjadi format Data URI (Base64)
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Unggah ke Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto", 
        folder: "my_link_uploader" 
    });

    // Kirim URL publik dari Cloudinary ke Front-end
    res.status(200).json({
      message: "Gambar berhasil diubah menjadi tautan!",
      url: result.secure_url, 
    });

  } catch (error) {
    console.error("Kesalahan unggahan:", error);
    res.status(500).json({ 
        message: "Gagal memproses unggahan.", 
        error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});