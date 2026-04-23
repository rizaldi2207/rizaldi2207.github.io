---
title: 'SAST dan DAST: Dua Pilar Keamanan Aplikasi yang Wajib Dipahami Developer dan IT Security'
description: 'Pahami perbedaan, cara kerja, dan kapan menggunakan SAST (Static Application Security Testing) dan DAST (Dynamic Application Security Testing) dalam siklus pengembangan perangkat lunak modern.'
pubDate: '2026-04-23'
heroImage: '/assets/sast-dast-hero.svg'
tags: ['security', 'appsec', 'sast', 'dast', 'devsecops', 'developer', 'it-security']
---

Keamanan aplikasi bukan lagi tanggung jawab tim security semata. Di era DevSecOps, setiap developer dituntut untuk ikut menjaga keamanan kode yang mereka tulis. Dua pendekatan pengujian keamanan yang paling umum digunakan adalah **SAST** dan **DAST**. Keduanya punya peran berbeda, dan idealnya digunakan bersama-sama.

## Apa itu SAST?

**SAST (Static Application Security Testing)** adalah metode pengujian keamanan yang menganalisis *source code*, bytecode, atau binary aplikasi **tanpa menjalankan aplikasinya**. SAST bekerja dari dalam ke luar (*inside-out*).

Bayangkan seperti ini: kamu minta seseorang membaca naskah drama sebelum dipentaskan, mencari dialog yang janggal atau logika cerita yang bermasalah — tanpa perlu melihat pertunjukannya secara langsung.

### Cara Kerja SAST

Tool SAST akan melakukan parsing terhadap kode sumber dan membangun representasi internal (seperti Abstract Syntax Tree / AST), kemudian menerapkan sekumpulan aturan (*rules*) atau pola (*patterns*) untuk mendeteksi potensi kerentanan.

Contoh yang bisa dideteksi SAST:

- **SQL Injection** — string input pengguna langsung digabungkan ke query SQL tanpa sanitasi
- **Hardcoded credentials** — API key, password, atau token yang tertanam langsung di kode
- **Insecure deserialization** — penggunaan fungsi deserialisasi yang tidak aman
- **Path traversal** — konstruksi path file yang bisa dimanipulasi
- **Penggunaan fungsi deprecated atau berbahaya** — seperti `strcpy()` di C/C++ atau `eval()` di JavaScript

### Kapan SAST Digunakan?

SAST paling efektif dijalankan **lebih awal dalam siklus pengembangan** (shift-left):

- Saat developer melakukan *commit* atau *pull request* (via CI/CD pipeline)
- Sebagai plugin di IDE (real-time feedback)
- Pada saat code review otomatis

### Tools SAST yang Populer

| Tool | Bahasa/Platform | Keterangan |
|---|---|---|
| **SonarQube** | Multi-bahasa | Open source, banyak digunakan enterprise |
| **Semgrep** | Multi-bahasa | Rule-based, fleksibel, developer-friendly |
| **Checkmarx** | Multi-bahasa | Enterprise, fitur lengkap |
| **Bandit** | Python | Khusus Python, ringan |
| **ESLint + Security Plugin** | JavaScript/TS | Terintegrasi dengan workflow JS |
| **FindBugs / SpotBugs** | Java | Klasik untuk ekosistem Java |

### Kelebihan dan Kekurangan SAST

**✅ Kelebihan:**
- Bisa dijalankan sejak awal pengembangan
- Hasil cepat, bisa diintegrasikan di IDE atau CI/CD
- Bisa menunjuk langsung ke baris kode yang bermasalah
- Tidak butuh aplikasi berjalan / environment deployment

**❌ Kekurangan:**
- Tinggi *false positive* — banyak temuan yang bukan kerentanan nyata
- Tidak bisa mendeteksi kerentanan yang muncul saat *runtime*
- Terbatas pada kode yang bisa dianalisis (sulit untuk library pihak ketiga)
- Tidak memahami konteks eksekusi aplikasi secara penuh

---

## Apa itu DAST?

**DAST (Dynamic Application Security Testing)** adalah metode pengujian keamanan yang **menguji aplikasi saat sedang berjalan** (*running*). DAST berinteraksi dengan aplikasi dari luar seperti yang dilakukan attacker sungguhan — tanpa akses ke kode sumber. DAST bekerja dari luar ke dalam (*outside-in*).

Analoginya: kamu menguji sebuah mobil dengan benar-benar mengendarainya, mencoba berbagai kondisi jalan, bukan sekadar membaca spesifikasinya di atas kertas.

### Cara Kerja DAST

Tool DAST mengirimkan request HTTP/HTTPS ke aplikasi yang sedang berjalan, kemudian menganalisis respons untuk mendeteksi perilaku yang mencurigakan atau indikasi kerentanan.

Proses umumnya:
1. **Crawling** — tool menjelajahi semua endpoint dan halaman aplikasi
2. **Fuzzing & Attack Simulation** — mengirimkan payload berbahaya ke setiap input (form, parameter URL, header, dsb.)
3. **Analisis Respons** — mendeteksi pola respons yang mengindikasikan kerentanan (error message, delay, redirect aneh, dll.)

Contoh yang bisa dideteksi DAST:

- **XSS (Cross-Site Scripting)** — script berbahaya yang ter-render di browser
- **SQL Injection** — error database yang muncul di respons
- **Authentication bypass** — akses ke resource tanpa autentikasi valid
- **Open redirect** — manipulasi URL redirect ke domain eksternal
- **Security misconfiguration** — header HTTP yang hilang (CSP, HSTS, X-Frame-Options)
- **Exposed sensitive endpoints** — path admin, debug endpoint, dsb.

### Kapan DAST Digunakan?

DAST membutuhkan aplikasi yang sudah **di-deploy ke suatu environment**, sehingga paling tepat dijalankan:

- Di environment **staging / QA** sebelum release ke production
- Sebagai bagian dari pipeline CI/CD pada tahap *integration testing*
- Secara terjadwal (*scheduled scan*) terhadap aplikasi production
- Sebelum audit keamanan atau penetration testing formal

### Tools DAST yang Populer

| Tool | Tipe | Keterangan |
|---|---|---|
| **OWASP ZAP** | Open Source | Standar industri, aktif dikembangkan komunitas |
| **Burp Suite** | Freemium / Commercial | Favorit pentester, fitur sangat lengkap |
| **Nikto** | Open Source | Scanner server/web klasik, cepat |
| **Acunetix** | Commercial | Akurasi tinggi, cocok untuk enterprise |
| **Nuclei** | Open Source | Template-based, cepat, community-driven |
| **w3af** | Open Source | Framework attack & audit berbasis Python |

### Kelebihan dan Kekurangan DAST

**✅ Kelebihan:**
- Menguji aplikasi seperti attacker nyata — minim false positive
- Tidak butuh akses ke source code
- Bisa menemukan kerentanan yang hanya muncul saat runtime
- Efektif untuk mendeteksi misconfiguration di layer HTTP/server

**❌ Kekurangan:**
- Baru bisa dijalankan setelah aplikasi di-deploy
- Lebih lambat dibanding SAST
- Bisa melewatkan kerentanan di kode yang tidak ter-*cover* oleh crawler
- Berpotensi mengganggu environment jika tidak dikonfigurasi dengan hati-hati

---

## SAST vs DAST: Perbandingan Ringkas

| Aspek | SAST | DAST |
|---|---|---|
| **Waktu analisis** | Compile-time / pre-deployment | Runtime |
| **Akses kode** | Perlu source code | Tidak perlu source code |
| **Perspektif** | Inside-out (dari dalam kode) | Outside-in (dari luar seperti attacker) |
| **Fase SDLC** | Awal (development, CI) | Akhir (staging, pre-prod) |
| **False positive** | Relatif tinggi | Relatif rendah |
| **Kecepatan** | Cepat | Lebih lambat |
| **Kerentanan runtime** | ❌ Tidak bisa | ✅ Bisa |
| **Integrasi IDE** | ✅ Mendukung | ❌ Tidak relevan |

---

## Mengapa Keduanya Harus Digunakan Bersama?

SAST dan DAST bukan kompetitor, melainkan **komplementer**. Masing-masing menutup celah yang tidak bisa dijangkau oleh yang lain.

```
[Developer menulis kode]
        ↓
    [SAST Scan]  ← Tangkap bug di source code sejak awal
        ↓
[Build & Deploy ke Staging]
        ↓
    [DAST Scan]  ← Uji aplikasi berjalan seperti attacker
        ↓
[Release ke Production]
        ↓
[DAST Scheduled Scan]  ← Monitoring berkala
```

Pendekatan ini adalah inti dari **DevSecOps**: keamanan diintegrasikan di setiap tahap pipeline, bukan hanya dilakukan di akhir sebagai *afterthought*.

---

## Tips Praktis untuk Developer

1. **Aktifkan plugin SAST di IDE** (misalnya Semgrep atau SonarLint) agar feedback keamanan datang real-time saat menulis kode.
2. **Tambahkan SAST ke pipeline CI/CD** — gagalkan build jika ada temuan dengan severity *high* atau *critical*.
3. **Jangan abaikan semua false positive** — review temuan SAST dengan konteks, bukan dismiss semua.
4. **Gunakan OWASP ZAP dalam pipeline staging** — bisa dikonfigurasi dalam mode *baseline scan* yang cepat dan tidak merusak.
5. **Pisahkan environment DAST dari production** — DAST bisa menghasilkan data sampah atau men-trigger alert monitoring jika dijalankan di production.

## Tips Praktis untuk IT Security

1. **Buat baseline aturan SAST yang disepakati bersama developer** — hindari konfigurasi default yang terlalu berisik.
2. **Integrasikan DAST ke dalam proses release gate** — tidak boleh release jika ada temuan *high/critical* yang belum di-remediate.
3. **Jadwalkan DAST scan berkala di production** dengan scope terbatas (misalnya endpoint publik saja).
4. **Kombinasikan dengan SCA (Software Composition Analysis)** untuk menutup celah dari dependency pihak ketiga yang rentan.
5. **Dokumentasikan semua temuan dan tindak lanjutnya** — ini penting untuk audit dan compliance (ISO 27001, PCI-DSS, dsb.).

---

## Kesimpulan

SAST dan DAST adalah dua senjata utama dalam arsenal keamanan aplikasi modern. SAST membantu developer menemukan masalah keamanan *sedini mungkin* langsung di level kode, sementara DAST memvalidasi keamanan aplikasi dari sudut pandang attacker di dunia nyata.

Bukan soal memilih salah satu — **gunakan keduanya**. Dengan mengintegrasikan SAST dan DAST ke dalam pipeline pengembangan, tim engineering dan security bisa berkolaborasi lebih efektif, mengurangi biaya perbaikan bug keamanan, dan membangun produk yang lebih aman sejak hari pertama.

> *"Security is not a product, but a process."* — Bruce Schneier