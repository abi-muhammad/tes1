# 🏃‍♂️🏫 KEJARAN PAK WAHID! — 3D SMA Endless Runner

**KEJARAN PAK WAHID!** adalah game web 3D *endless runner* bergaya kartun *low-poly* yang terinspirasi dari mekanisme *Subway Surfers*, dengan latar suasana khas **SMA Indonesia**.

Kamu berperan sebagai seorang siswa SMA berseragam putih abu-abu yang ketahuan nongkrong di depan kelas **XI A1 & XI A2** saat jam pelajaran oleh guru disiplin legendaris, **Pak Wahid**! Lari secepat mungkin menyusuri lorong sekolah, lompati meja dan tumpukan buku, meluncur di bawah palang piket, kumpulkan uang jajan, dan jangan sampai tertangkap Pak Wahid!

---

## ✨ Fitur Utama

1. **Gameplay Endless Runner 3 Jalur yang Responsif**
   - Pindah jalur kiri, tengah, dan kanan dengan transisi halus.
   - Lompatan berbasis gravitasi dan aksi *fast-drop* (swipe bawah saat di udara untuk mendarat cepat lalu meluncur).
   - Aksi meluncur (*slide*) untuk melewati kolong spanduk/palang piket tinggi.
2. **Mekanisme Kejaran Dinamis Pak Wahid**
   - Pak Wahid mengejar dari belakang lengkap dengan penggaris kayu, peluit, dan balon dialog komedi khas guru SMA Indonesia.
   - Menabrak meja/tas membuat siswa tersandung sehingga jarak Pak Wahid semakin dekat.
   - Berlari bersih tanpa menabrak akan memulihkan jarak aman secara bertahap.
3. **Lorong Sekolah SMA Indonesia Prosedural (Object Pooling)**
   - Lantai keramik, pintu dan jendela kelas kayu, papan nama kelas gantung (**KELAS XI A1**, **KELAS XI A2**, **RUANG BK**, **PERPUSTAKAAN**, **KOPERASI SISWA**).
   - Poster pendidikan (*Budayakan 5S*, *Jaga Kebersihan*) dan *Papan Tata Tertib SMA*.
   - Siswa lain di pinggir kelas serta properti sekolah (meja, kursi, tas, buku, tempat sampah, lemari piala).
4. **Koin Uang Jajan & 3 Power-Up Khas Sekolah**
   - 🧲 **Magnet Jajan**: Menarik koin uang jajan dari semua jalur secara otomatis.
   - 👟 **Sepatu Basket**: Melompat lebih tinggi melewati rintangan.
   - 🧋 **Es Teh Turbo**: Lari cepat kebal rintangan dan mendorong Pak Wahid menjauh.
5. **Optimasi Penuh untuk Android & Chrome Mobile**
   - Mendukung orientasi **Portrait** maupun **Landscape** (FOV kamera menyesuaikan otomatis agar ketiga jalur tetap terlihat utuh).
   - Kontrol **Swipe Layar Sentuh** + **Tombol Virtual Ibu Jari** (Kiri, Kanan, Lompat, Luncur) + **Keyboard Desktop**.
   - Pengaturan Kualitas Grafis (**Rendah**, **Sedang**, **Tinggi**) dengan deteksi performa otomatis untuk HP Android ber-RAM terbatas.
   - Otomatis *Pause* saat tab browser diminimalkan atau berpindah aplikasi (*Page Visibility API*).
6. **Audio Prosedural Web Audio API & PWA Ready**
   - Efek suara langkah kaki, lompatan, meluncur, koin, tabrakan, **Bel Sekolah**, dan **Peluit/Suara Komedi Pak Wahid** dihasilkan secara prosedural menggunakan *Web Audio API* tanpa ketergantungan file MP3 eksternal.
   - Dilengkapi `manifest.webmanifest` dan Service Worker (`sw.js`) sehingga dapat dipasang ke layar utama Android.

---

## 🛠️ Persyaratan Instalasi

Pastikan perangkat Anda sudah terinstal:
- **Node.js** versi **18 LTS** atau **20 LTS** (atau yang lebih baru).
- **npm** (otomatis terinstal bersama Node.js).
- **Git** (untuk mengunggah kode ke GitHub).

Cek versi Node.js dan npm di terminal:
```bash
node -v
npm -v
```

---

## 💻 Cara Menjalankan Game Secara Lokal (Development)

1. Buka terminal dan masuk ke direktori proyek:
   ```bash
   cd kejaran-pak-wahid
   ```
2. Instal seluruh dependensi proyek:
   ```bash
   npm install
   ```
3. Jalankan server development Vite:
   ```bash
   npm run dev
   ```
4. Buka URL yang muncul di terminal (biasanya `http://localhost:5173`) menggunakan browser Chrome di PC atau HP Android (jika berada di jaringan Wi-Fi yang sama).

---

## 📦 Cara Membangun Versi Production (Build & Preview)

1. Jalankan perintah build:
   ```bash
   npm run build
   ```
   Seluruh file statis siap publikasi akan dihasilkan di dalam folder `dist/`.
2. Untuk menguji hasil build production secara lokal sebelum diunggah ke GitHub:
   ```bash
   npm run preview
   ```
   Buka `http://localhost:4173` di browser untuk memastikan seluruh fitur berjalan sempurna.

---

## 🚀 Panduan Lengkap Publikasi ke GitHub Pages

Proyek ini sudah dikonfigurasi menggunakan `base: './'` pada `vite.config.js` dan dilengkapi workflow otomatis `.github/workflows/deploy.yml` sehingga kompatibel 100% dengan subpath repository GitHub Pages (`https://username.github.io/nama-repo/`).

### 1. Cara Membuat Repository GitHub
1. Masuk ke akun GitHub Anda di [https://github.com](https://github.com).
2. Klik tombol **+** di pojok kanan atas lalu pilih **New repository**.
3. Isi **Repository name**, misalnya: `kejaran-pak-wahid`.
4. Pilih visibilitas **Public** (agar GitHub Pages gratis dapat digunakan).
5. **Jangan** centang *Add a README file* atau *.gitignore* (karena sudah tersedia di proyek ini).
6. Klik **Create repository**.

### 2. Cara Mengunggah Source Code ke GitHub
Jalankan perintah berikut satu per satu di terminal dari dalam folder proyek `kejaran-pak-wahid`:

```bash
git init
git add .
git commit -m "Initial commit: Game 3D Kejaran Pak Wahid siap deploy"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/kejaran-pak-wahid.git
git push -u origin main
```
*(Ganti `USERNAME_ANDA` dan `kejaran-pak-wahid` sesuai username dan nama repository GitHub Anda).*

### 3. Cara Mengaktifkan GitHub Pages
Agar workflow `.github/workflows/deploy.yml` dapat menerbitkan game secara otomatis:
1. Buka halaman repository Anda di GitHub.
2. Klik tab **Settings** (di bagian atas repository).
3. Pada menu sebelah kiri, klik **Pages** (di bagian *Code and automation*).
4. Pada bagian **Build and deployment** → **Source**, ubah pilihan dari *Deploy from a branch* menjadi **GitHub Actions**.
5. Setelah dipilih, GitHub Pages siap menerima hasil build dari workflow GitHub Actions.

### 4. Cara Memantau Proses Deployment
1. Klik tab **Actions** di bagian atas repository GitHub Anda.
2. Anda akan melihat workflow bernama **"Deploy Kejaran Pak Wahid to GitHub Pages"** sedang berjalan (ikon kuning berputar) atau sudah selesai (ikon centang hijau ✅).
3. Jika workflow pertama kali berjalan sebelum Anda mengubah pengaturan *Source* menjadi **GitHub Actions**, Anda bisa menekan tombol **Re-run all jobs** atau menjalankan workflow manual lewat tombol **Run workflow** di tab **Actions**.

### 5. Cara Menemukan URL Game yang Sudah Dipublikasikan
Setelah workflow di tab **Actions** berwarna hijau (selesai):
1. Lihat bagian bawah diagram job **build** di tab **Actions**, atau kembali ke **Settings → Pages**.
2. URL game Anda akan tampil di bagian atas, dengan format:
   ```text
   https://USERNAME_ANDA.github.io/kejaran-pak-wahid/
   ```
3. Buka URL tersebut di **Google Chrome Android** atau PC untuk langsung bermain!

### 6. Cara Memperbarui Game Setelah Perubahan Kode
Setiap kali Anda mengubah kode di komputer lokal, cukup jalankan 3 perintah berikut untuk memperbarui game online secara otomatis:

```bash
git add .
git commit -m "Update fitur gameplay"
git push
```
GitHub Actions akan otomatis menjalankan `npm ci` dan `npm run build`, lalu memperbarui halaman GitHub Pages dalam waktu ±1 menit.

---

## 🔧 Troubleshooting (Mengatasi Masalah Umum)

### 1. Halaman 404 saat membuka URL GitHub Pages
- **Penyebab:** Pengaturan sumber GitHub Pages belum diubah ke **GitHub Actions**, atau proses workflow di tab **Actions** belum selesai.
- **Solusi:** Buka **Settings → Pages → Build and deployment → Source**, pastikan terpilih **GitHub Actions**. Lalu buka tab **Actions** dan pastikan workflow terakhir berstatus centang hijau (✅).

### 2. Aset Gagal Dimuat (Layar Kosong di Subpath Repository)
- **Penyebab:** Mengunggah file mentah tanpa build atau menggunakan path absolut `/assets/...` tanpa konfigurasi `base`.
- **Solusi:** Proyek ini sudah menggunakan `base: './'` di `vite.config.js` dan seluruh aset dipanggil dengan path relatif (`./manifest.webmanifest`, `./icons/icon-192.svg`, `./sw.js`). Pastikan Anda membiarkan GitHub Actions men-deploy folder hasil build `dist/`, bukan menampilkan `index.html` mentah dari branch source.

### 3. Tampilan Lama Masih Muncul Setelah Update
- **Penyebab:** Cache browser di HP Android.
- **Solusi:** Service worker pada proyek ini sudah menggunakan strategi *Network-First*. Cukup muat ulang halaman (*refresh*) satu kali di Chrome Android untuk mendapatkan versi terbaru.

---

## 📂 Struktur Proyek

```text
kejaran-pak-wahid/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow otomatis GitHub Pages Actions
├── public/
│   ├── icons/
│   │   ├── icon-192.svg        # Ikon aplikasi 192x192
│   │   └── icon-512.svg        # Ikon aplikasi 512x512
│   ├── manifest.webmanifest    # Konfigurasi PWA Android
│   └── sw.js                   # Service Worker (Network-first + Offline fallback)
├── src/
│   ├── game/
│   │   ├── audio.js            # Synthesizer efek suara Web Audio API
│   │   ├── corridor.js         # Generator lorong kelas XI A1 & XI A2 prosedural
│   │   ├── obstacles.js        # Manajer rintangan & Object Pooling
│   │   ├── player.js           # Karakter Siswa SMA 3D & fisika lompat/luncur
│   │   ├── powerups.js         # Koin uang jajan & Power-up (Magnet, Sepatu, Es Teh)
│   │   ├── teacher.js          # Karakter Pak Wahid 3D & logika jarak pengejaran
│   │   └── ui.js               # Kontrol Swipe Android, Tombol Virtual, Keyboard & HUD
│   ├── main.js                 # Entry point utama & loop Three.js
│   └── style.css               # Layout responsif Portrait/Landscape & safe-area-inset
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```
