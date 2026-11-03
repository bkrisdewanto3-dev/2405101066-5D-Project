# 2405101066-5D-Project

# KegiatanKampus: Website Pendaftaran Kegiatan Kampus

## Identitas Mahasiswa

| Keterangan    | Isi                         |
|---------------|-----------------------------|
| Nama Lengkap  | Brian Krisdewanto           |
| NIM           | 2405101066                  |
| Kelas         | 5D                          |
| Program Studi | Teknik Informatika          |

## Informasi Mata Kuliah

| Keterangan     | Isi                          |
|----------------|------------------------------|
| Mata Kuliah    | pemrograman web dasar        |
| Dosen Pengampu | Muhammad Salimy Ahsan        |
| Tahun Akademik |  2026/2027 Ganjil            |

## Deskripsi Pengerjaan UTS

Proyek ini dibuat sebagai tugas Ujian Tengah Semester (UTS).

**Masalah:** pendaftaran kegiatan mahasiswa di kampus masih dilakukan secara manual, sehingga informasi kegiatan tersebar, data pendaftar sulit direkap, kuota tidak terpantau, dan pendaftaran ganda sering terjadi.

**Solusi:** website yang memusatkan informasi kegiatan dan memungkinkan mahasiswa mendaftar secara online. Panitia dapat mengelola kegiatan dan peserta, sedangkan admin mengawasi seluruh sistem.

**Pengguna:** Admin, Panitia, dan Mahasiswa.

**Database (rancangan):** tiga tabel utama, yaitu `Pengguna`, `Kegiatan`, dan `Pendaftaran`. Pada versi UTS ini, data disimpan di `localStorage` browser dengan struktur yang sama seperti tabel tersebut. Hasil analisis kebutuhan lengkap ada pada file Excel `Analisa-Project`.

**Teknologi:** HTML, CSS, dan JavaScript (tanpa framework dan tanpa server).

## Ringkasan Fitur

**Pengunjung**
- Melihat daftar kegiatan, pencarian, dan filter berdasarkan kategori atau tanggal
- Melihat detail kegiatan (jadwal, lokasi, kuota, sisa kuota)
- Registrasi akun mahasiswa dan login

**Mahasiswa**
- Mendaftar kegiatan dengan validasi kuota, batas waktu, dan pendaftaran ganda
- Melihat riwayat dan status pendaftaran
- Membatalkan pendaftaran sebelum batas waktu
- Mengganti kata sandi

**Panitia**
- Menambah kegiatan dan membuka atau menutup pendaftaran
- Melihat daftar peserta dan mencatat kehadiran
- Mengunduh daftar peserta dalam format CSV

**Admin**
- Dashboard statistik (jumlah pengguna, kegiatan, pendaftaran, tingkat kehadiran)
- Mengelola seluruh kegiatan
- Mengatur peran dan menonaktifkan akun pengguna

## Struktur Folder

```
web-kegiatan-kampus/
├── index.html        # Kerangka halaman utama
├── style.css         # Tampilan website
├── app.js            # Logika aplikasi (routing, login, pendaftaran, dll.)
├── README.md         # Dokumentasi proyek
└── screenshots/      # Screenshot hasil implementasi
```

## Petunjuk Menjalankan Aplikasi

1. Unduh atau clone repository ini.
2. Pastikan `index.html`, `style.css`, dan `app.js` berada dalam satu folder.
3. Buka `index.html` dengan browser (Chrome, Edge, atau Firefox). Tidak perlu instalasi tambahan.
4. Masuk dengan salah satu akun contoh berikut:

| Peran     | Email                  | Kata sandi |
|-----------|------------------------|------------|
| Mahasiswa | mahasiswa@kampus.ac.id | mhs123     |
| Panitia   | panitia@kampus.ac.id   | panitia123 |
| Admin     | admin@kampus.ac.id     | admin123   |

**Catatan:**
- Data tersimpan di browser yang digunakan. Untuk mengembalikan data awal, hapus data situs (site data) melalui pengaturan browser.
- Koneksi internet hanya dibutuhkan untuk memuat font Google Fonts. Tanpa internet, website tetap berjalan dengan font bawaan.

## Screenshot Hasil Implementasi

Screenshot disimpan di folder [`screenshots/`](screenshots/). Daftar yang disarankan:

| Halaman                      | Nama file                  |
|------------------------------|----------------------------|
| Beranda dan daftar kegiatan  | `01-beranda.png`           |
| Detail kegiatan              | `02-detail-kegiatan.png`   |
| Login dan registrasi         | `03-login.png`             |
| Riwayat pendaftaran          | `04-riwayat.png`           |
| Kelola kegiatan (panitia)    | `05-kelola-kegiatan.png`   |
| Daftar peserta dan kehadiran | `06-peserta.png`           |
| Dashboard admin              | `07-dashboard-admin.png`   |
