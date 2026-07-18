# Audit SEO — AppSecMonarch

> **Konteks & batasan.** Audit ini dibuat untuk situs blog statis AppSecMonarch
> (Astro, GitHub Pages, konten Bahasa Indonesia seputar *application security*).
> Tidak ada SEO tool (Ahrefs/Semrush) atau analytics yang terhubung saat audit,
> jadi angka volume pencarian, keyword difficulty, dan posisi ranking **tidak
> ditarik dari data aktual** — bagian keyword & kompetitor berbasis penalaran
> dan ditandai jelas. Bagian **teknis & on-page di-grounding langsung ke kode
> sumber** — itu faktual. Untuk data presisi, hubungkan Ahrefs/Semrush via MCP.
>
> Tanggal audit: 2026-07-18.

---

## Status Implementasi (diperbarui 2026-07-18)

Seluruh temuan **teknis & on-page** dari audit ini sudah **dikerjakan dan
diverifikasi di output build** (`dist/`). Yang tersisa hanya **item konten** yang
butuh penulisan/keputusan, bukan kode.

**✅ Sudah beres:**

| Item | Bukti di `dist/` |
| :-- | :-- |
| `site:` → `https://appsecmonarch.com` | Canonical & OG semua di domain benar; nol `example.com` di meta |
| Sitemap | `sitemap-index.xml` + `sitemap-0.xml` (39 URL) |
| robots.txt | Merujuk `https://appsecmonarch.com/sitemap-index.xml` |
| OG image | Default `/assets/securecode.png`; artikel pakai `heroImage`-nya; nol `blog-placeholder` |
| Meta description kepanjangan | 4 artikel diringkas ke 144–158c |
| Judul `sast-dast` (88c) | → 48c (`SAST vs DAST: Dua Pilar Keamanan Aplikasi Modern`) |
| Suffix brand di `<title>` artikel | `… — Appsecmonarch` |
| `og:type` + `article:published_time` | Artikel `article`, homepage `website`; + `og:site_name`/`og:locale` |
| JSON-LD | Artikel: `Organization`+`BlogPosting`+`BreadcrumbList`; homepage: `Organization`+`WebSite` |
| RSS feed | `/rss.xml` (6 item, `id-ID`) + autodiscovery di `<head>` |

Deploy: **Netlify** di `appsecmonarch.com` (bukan GitHub Pages). Domain & DNS
dikonfigurasi di Netlify — tidak ada file CNAME di repo.

**⬜ Belum (item konten — di luar cakupan kode):**

- Pillar page "OWASP Top 10 (ID)" + cluster (XSS, IDOR, password hashing)
- Landing page layanan konsultasi (intent komersial)
- Perdalam `ai-cyber` (323 kata) & `error-handling` (407) ke 800+ kata
- Ganti hero image artikel yang masih bergaya terminal (temuan terpisah dari audit UI)

> Bagian di bawah ini adalah **audit awal** — dipertahankan sebagai catatan
> temuan. Status terkini ada di tabel atas.

---

## Ringkasan Eksekutif

Fondasi on-page situs ini **kuat** — setiap halaman punya title & description
unik, satu H1 yang mengandung keyword, struktur heading rapi, `lang="id"` benar,
mobile-responsive, dan HTTPS otomatis dari GitHub Pages. Kontennya relevan dan
berbahasa Indonesia, ceruk yang kompetisinya jauh lebih rendah dari padanan
Inggrisnya.

Tapi ada **tiga cacat kritis yang membatalkan sebagian besar kekuatan itu**, dan
ketiganya berakar di satu tempat: `astro.config.mjs` masih memakai
`site: 'https://example.com'`. Akibatnya **setiap canonical URL dan setiap URL
Open Graph di seluruh situs menunjuk ke example.com** — mesin pencari diberi tahu
bahwa konten asli Anda ada di domain orang lain. Ditambah: **tidak ada sitemap,
tidak ada robots.txt, dan gambar OG selalu 404**.

**Penilaian keseluruhan: fondasi kuat, tapi ada isu kritis** yang harus dibereskan
sebelum hal lain berarti. Kabar baiknya, ketiganya *quick win* — bisa selesai
dalam satu sore.

**3 prioritas berdampak terbesar:**

1. Ganti `site:` ke domain asli → memperbaiki canonical + OG di 39 halaman sekaligus.
2. Pasang sitemap.xml + robots.txt → biar Google bisa menemukan & meng-crawl semuanya.
3. Perbaiki gambar OG per-halaman (sekarang selalu menunjuk file yang tidak ada).

---

## Tabel Isu On-Page & Teknis

Diurutkan dari paling parah. Semua ini **terverifikasi di kode**, bukan asumsi.

| Area | Isu | Severity | Perbaikan |
| :-- | :-- | :-- | :-- |
| `astro.config.mjs:9` | `site: 'https://example.com'` — canonical & OG URL semua salah domain | 🔴 **Critical** | Ganti ke `https://rizaldi2207.github.io` (atau domain kustom) |
| `src/components/BaseHead.astro:14` | OG image default `/blog-placeholder-1.jpg` — **file tidak ada** (public/ cuma punya `assets/` + `favicon.svg`) | 🔴 **Critical** | Sediakan gambar OG default + teruskan `heroImage` per artikel |
| `src/layouts/Layout.astro:32` | `BaseHead` dipanggil tanpa `image` → semua share sosial pakai gambar 404 | 🔴 **Critical** | Tambah prop `image` di Layout, teruskan dari tiap halaman |
| Build output | Tak ada `sitemap.xml` — Google tak dapat peta situs | 🟠 **High** | Pasang `@astrojs/sitemap` |
| `public/` | Tak ada `robots.txt` — tak ada rujukan sitemap untuk crawler | 🟠 **High** | Tambah `public/robots.txt` + baris `Sitemap:` |
| Semua artikel | Tak ada structured data (JSON-LD `Article`/`BlogPosting`, `Organization`, `BreadcrumbList`) | 🟠 **High** | Tambah JSON-LD `BlogPosting` di halaman detail |
| Situs | Tak ada RSS feed — kanal discovery standar blog hilang | 🟡 **Medium** | Pasang `@astrojs/rss` di `/rss.xml` |
| 4 dari 6 artikel | Meta description > 160 char → terpotong di SERP (`injection` 225, `sast-dast` 192, `error-handling` 191, `ai-cyber` 162) | 🟡 **Medium** | Ringkas ke 150–160 char |
| `sast-dast.md` | Title 88 char → terpotong di SERP (ideal 50–60) | 🟡 **Medium** | Persingkat judul |
| `ai-cyber` (323 kata), `error-handling` (407) | Konten tipis untuk query informasional | 🟡 **Medium** | Perdalam ke 800+ kata |
| Halaman detail | `<title>` artikel tanpa suffix brand "— Appsecmonarch" (halaman statis punya) | 🟢 **Low** | Tambah suffix agar konsisten |
| `src/components/BaseHead.astro:35` | `og:type` selalu `website`, seharusnya `article` untuk post | 🟢 **Low** | Kondisikan `og:type` + `article:published_time` |

**Yang sudah benar (jangan diutak-atik):** title unik per halaman ✓, satu H1
ber-keyword per halaman ✓, hierarki H2/H3 logis (injection 20 heading, sast-dast
15) ✓, `lang="id"` ✓, mobile responsive ✓, `alt=""` pada thumbnail dekoratif ✓
(ini **benar** — judulnya sudah teks di sebelahnya), URL bersih & readable
(`/blog/injection`) ✓.

---

## Tabel Peluang Keyword

> ⚠️ Berbasis penalaran lanskap keyword appsec berbahasa Indonesia — bukan data
> volume aktual. Difficulty rendah karena ceruk ID kurang tergarap dibanding
> pasar Inggris.

| Keyword | Est. Difficulty | Opportunity | Ranking Saat Ini | Intent | Format Rekomendasi |
| :-- | :-- | :-- | :-- | :-- | :-- |
| apa itu sql injection | Mudah | **Tinggi** | Belum diketahui | Informasional | Sudah punya — optimalkan `injection` |
| cara mencegah sql injection | Mudah | **Tinggi** | Belum | Informasional | Perdalam artikel injection |
| contoh secure coding | Mudah | **Tinggi** | Belum | Informasional | Pillar baru |
| perbedaan sast dan dast | Mudah | **Tinggi** | Belum | Informasional | Sudah punya — kuatkan `sast-dast` |
| owasp top 10 bahasa indonesia | Mudah | **Tinggi** | Belum | Informasional | Pillar page baru |
| keamanan aplikasi web | Sedang | **Tinggi** | Belum | Informasional | Pillar "Application Security" |
| error handling yang aman | Mudah | **Tinggi** | Belum | Informasional | Sudah punya — perdalam |
| apa itu devsecops | Sedang | Sedang | Belum | Informasional | Artikel baru |
| cara menyimpan password dengan aman | Mudah | **Tinggi** | Belum | Informasional | Artikel baru (hash/salt) |
| idor adalah | Mudah | Sedang | Belum | Informasional | Artikel baru |
| xss adalah / cara mencegah xss | Mudah | **Tinggi** | Belum | Informasional | Artikel baru |
| human firewall adalah | Mudah | Sedang | Belum | Informasional | Sudah punya — perdalam |
| security awareness karyawan | Sedang | Sedang | Belum | Informasional/Komersial | Artikel + CTA konsultasi |
| apa itu siem | Sedang | Sedang | Belum | Informasional | Sudah punya `siem` |
| jasa konsultan keamanan aplikasi | Sedang | **Tinggi** | Belum | **Komersial** | Landing page konsultasi |
| audit keamanan aplikasi | Sedang | **Tinggi** | Belum | **Komersial** | Landing page layanan |
| penetration testing indonesia | Sulit | Sedang | Belum | Komersial | Landing page |
| belajar cyber security pemula | Sulit | Sedang | Belum | Informasional | Guide/pillar |
| command injection contoh | Mudah | Sedang | Belum | Informasional | Bagian dari injection |
| parameterized query adalah | Mudah | Sedang | Belum | Informasional | Bagian dari injection |

**Pola strategis:** kekuatan Anda ada di keyword **informasional "apa itu / cara /
contoh"** — dan itu selaras sempurna dengan positioning brand ("tenang,
menjelaskan dari nol"). Sementara keyword **komersial** ("jasa/audit/konsultan
keamanan aplikasi") adalah tambang yang belum digali sama sekali — padahal
positioning "Konsultasi" baru ditambahkan di header/CTA. Ada halaman `/contact`,
tapi belum ada halaman layanan yang bisa me-ranking untuk intent komersial itu.

---

## Rekomendasi Content Gap

1. **Pillar page "OWASP Top 10 (Bahasa Indonesia)"** — Peluang tinggi, effort
   substansial (multi-hari). Sedikit sekali sumber ID yang membahas OWASP Top 10
   lengkap. Jadikan pillar, tautkan ke artikel injection/error-handling/xss
   sebagai cluster pendukung. *Kenapa penting:* menangkap keyword bervolume +
   membangun otoritas topikal.

2. **Landing page layanan konsultasi** — Peluang tinggi (intent komersial), effort
   setengah hari. Ada CTA "Konsultasi" tapi tak ada halaman yang me-ranking
   untuknya. *Kenapa penting:* satu-satunya konten funnel-bawah; mengubah traffic
   edukasi jadi lead.

3. **Artikel XSS & IDOR** — Peluang tinggi, effort moderat masing-masing. Dua
   kerentanan OWASP paling dicari yang **belum** ditulis. *Kenapa penting:*
   melengkapi cluster injection, keyword mudah.

4. **"Cara menyimpan password: hash, salt, work factor"** — Peluang tinggi,
   moderat. Query abadi (evergreen), kompetisi ID rendah. *Desain handoff bahkan
   sudah menyebut topik ini* sebagai post mockup.

5. **Perdalam 2 artikel tipis** — `ai-cyber` (323 kata) & `error-handling` (407
   kata), effort moderat. Di bawah ambang nyaman untuk ranking query
   informasional. *Kenapa penting:* memperbaiki aset yang sudah ada lebih murah
   dari membuat baru.

6. **Freshness** — semua `pubDate` di 2026; belum ada masalah basi. Manfaatkan
   field `updatedDate` yang sudah ada di schema saat merevisi, dan tampilkan
   "Diperbarui" (halaman detail sudah mendukungnya).

---

## Checklist Teknis SEO

| Cek | Status | Detail |
| :-- | :-- | :-- |
| HTTPS | ✅ Pass | Otomatis dari Netlify |
| Mobile-friendly | ✅ Pass | Responsif, terverifikasi di 390px |
| Canonical tags | ✅ **Fixed** | Semula resolve ke `example.com`; kini `appsecmonarch.com` |
| XML sitemap | ✅ **Fixed** | `@astrojs/sitemap` — 39 URL |
| robots.txt | ✅ **Fixed** | Ada; merujuk sitemap |
| OG/Twitter image | ✅ **Fixed** | Default `securecode.png`; artikel pakai `heroImage` |
| Structured data (JSON-LD) | ✅ **Fixed** | Organization/WebSite/BlogPosting/BreadcrumbList |
| RSS feed | ✅ **Fixed** | `/rss.xml` + autodiscovery |
| Title tags | ✅ Pass | Unik per halaman; `sast-dast` kepanjangan sudah diringkas |
| Meta descriptions | ✅ **Fixed** | 4 yang kepanjangan diringkas ke 144–158c |
| H1 | ✅ Pass | Tepat satu per halaman, ber-keyword |
| Struktur heading | ✅ Pass | Hierarki logis |
| `lang` attribute | ✅ Pass | `lang="id"` |
| URL structure | ✅ Pass | Bersih, readable, ber-keyword |
| Image alt text | ✅ Pass | Hero ber-alt; thumbnail dekoratif `alt=""` (benar) |
| Broken links | ✅ Pass | Nav internal utuh (dicek saat audit UI) |
| Core Web Vitals | ✅ Pass (est.) | Statis, font self-hosted, CSS ringan — LCP/CLS baik |

---

## Perbandingan Kompetitor

> ⚠️ Tak bisa menarik data backlink/ranking asli tanpa SEO tool. Ini penilaian
> kualitatif kompetitor ceruk yang mungkin.

Kompetitor tipikal untuk konten appsec ID: blog vendor keamanan lokal, **OWASP
Chapter Indonesia**, dan konten CTF/security komunitas ID. Sebagian besar konten
appsec ID berkualitas justru **berbahasa Inggris atau technical-berat** — celah
Anda ("tenang, tanpa jargon, Bahasa Indonesia") justru diferensiator nyata.

| Dimensi | Situs Anda | Kompetitor tipikal ID |
| :-- | :-- | :-- |
| Kedalaman konten | 6 artikel, 320–940 kata | Bervariasi; sering technical-berat |
| Frekuensi terbit | Rendah (6 total) | Bervariasi |
| Sinyal teknis | Kuat tapi 3 isu kritis | Sering lebih buruk (WordPress lambat) |
| Nada/aksesibilitas | **Keunggulan** — ramah pemula | Sering menggurui/jargon |
| Structured data | Belum ada | Jarang di blog ID |

*Untuk perbandingan head-to-head sungguhan (keyword overlap, referring domains),
diperlukan Ahrefs/Semrush terhubung + nama domain kompetitor spesifik.*

---

## Rencana Aksi Berprioritas

### ⚡ Quick Wins (kerjakan minggu ini — semuanya < 2 jam)

1. ✅ **Ganti `site:` di `astro.config.mjs`** ke domain asli
   (`https://appsecmonarch.com`). → Memperbaiki canonical + OG di 39 halaman.
2. ✅ **Pasang `@astrojs/sitemap`** + `public/robots.txt` dengan baris `Sitemap:`.
3. ✅ **Perbaiki OG image** — default `/assets/securecode.png` + `heroImage` per
   artikel via prop `image` di Layout→BaseHead.
4. ✅ **Ringkas 4 meta description** (>160c → 144–158c) + **judul sast-dast**
   (88c → 48c).
5. ✅ **Suffix brand** di `<title>` artikel + `og:type: article`
   (+ `article:published_time`, `og:site_name`, `og:locale`).

### 🏗️ Strategic Investments (rencanakan kuartal ini)

1. ✅ **JSON-LD** di halaman detail (`BlogPosting` + `BreadcrumbList`) & homepage
   (`Organization` + `WebSite`). Memungkinkan rich result.
4. ✅ **RSS feed** (`@astrojs/rss`) di `/rss.xml` + autodiscovery.

**⬜ Belum (konten, bukan kode):**

2. **Pillar "OWASP Top 10 (ID)"** + cluster (XSS, IDOR, password hashing). Impact:
   **Tinggi**. Effort: multi-hari.
3. **Landing page layanan konsultasi** untuk menangkap intent komersial. Impact:
   **Tinggi**. Effort: setengah hari.
5. **Perdalam artikel tipis** (`ai-cyber`, `error-handling`) ke 800+ kata. Impact:
   **Sedang**. Effort: moderat per artikel.

---

**Benang merah:** placeholder `example.com` itu satu baris, tapi meracuni
canonical dan OG di seluruh situs. Perbaiki itu lebih dulu — sisanya baru
bermakna.
