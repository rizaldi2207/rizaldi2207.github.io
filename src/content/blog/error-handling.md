---
title: 'Error Handling Bukan Opsional — Ini Kunci Mencegah Leak di Aplikasimu'
description: 'Penanganan error yang asal-asalan bisa jadi pintu masuk terbesar untuk data leak. Pelajari cara menulis error handling yang aman, dari stack trace, logging sensitif, sampai unhandled promise.'
pubDate: '2026-04-28'
heroImage: '/assets/hero-error-handling.png'
tags: ['backend', 'security', 'nodejs', 'best-practices']
---

Coba ingat-ingat: kapan terakhir kali kamu nulis kode dan mikir, *"ah, kalau gagal ya langsung throw saja"*? Kalau sering, artikel ini untuk kamu.

Error handling itu bukan sekadar try-catch biar kode nggak merah. Ini tentang memastikan informasi sensitif tidak bocor ke tempat yang salah — baik ke pengguna akhir, ke log yang bisa dibaca publik, maupun ke response API yang kamu kirim keluar.

---

## Masalah Klasik: Stack Trace Keluar ke Client

Ini adalah kesalahan paling umum. Developer lupa mematikan mode debug di production, dan akhirnya stack trace lengkap — termasuk nama file, baris kode, bahkan struktur database — muncul di response API.

> **Perlu diingat:** Stack trace yang bocor ke client bukan cuma "informasi teknis yang tidak penting." Bagi attacker, itu peta jalan gratis ke arsitektur sistemmu.

Contohnya begini: kamu punya endpoint `/api/users/:id` dan query ke database gagal. Kalau kamu langsung lempar error mentah ke response, yang keluar bisa seperti ini:

```
// ❌ Response bocor
Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete]
    (/app/node_modules/pg/lib/connection.js:54:8)

// attacker sekarang tahu: kamu pakai PostgreSQL,
// running di localhost:5432, dan ada masalah koneksi
```

Harusnya? Response yang sampai ke client hanya boleh bilang bahwa ada masalah, tanpa detail teknis apapun. Error aslinya dicatat di server-side logging — bukan dikirim keluar.

**Jangan begini:**

```javascript
app.get('/user', async (req, res) => {
  try {
    const user = await db.find(req.id)
    res.json(user)
  } catch (err) {
    res.status(500).json(err) // ← langsung expose error object
  }
})
```

**Lakukan ini:**

```javascript
app.get('/user', async (req, res) => {
  try {
    const user = await db.find(req.id)
    res.json(user)
  } catch (err) {
    logger.error(err) // ← catat di server
    res.status(500).json({
      message: 'Internal server error' // ← pesan generik ke client
    })
  }
})
```

---

## Logging yang Tidak Sengaja Jadi Leak

Logging itu penting — kamu butuh jejak untuk debugging. Tapi banyak developer terlalu agresif dalam mencatat data, sampai-sampai log file jadi tempat menyimpan informasi sensitif yang harusnya tidak ada di sana.

Bayangkan kamu log seluruh request body untuk debugging. Kalau ada user yang submit form login, maka username dan password-nya masuk ke log. Kalau log itu bisa diakses — entah karena salah konfigurasi bucket S3, server log yang tidak diproteksi, atau log aggregator yang setupnya lemah — itu bocor.

> Aturan simpelnya: jangan pernah log data yang kamu tidak mau lihat di layar publik. Kalau ragu, sensor dulu sebelum tulis ke log.

```javascript
function sanitizeForLog(body) {
  const sensitive = ['password', 'token', 'secret', 'cvv']
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) =>
      sensitive.includes(k) ? [k, '[REDACTED]'] : [k, v]
    )
  )
}

// logger.info(req.body)                  ← berbahaya
logger.info(sanitizeForLog(req.body))     // ← aman
```

---

## Error Message yang Terlalu "Helpful"

Ini kasus yang sering luput: error message yang terlalu informatif justru membantu attacker. Misalnya saat login gagal, kamu menampilkan pesan yang berbeda untuk username tidak ditemukan vs password salah.

Attacker bisa pakai perbedaan ini untuk *user enumeration* — mereka cukup coba banyak email sampai dapat respons "password salah", yang artinya email itu valid. Dari situ, tinggal brute-force password.

| Berbahaya | Aman |
|---|---|
| `"Email tidak terdaftar"` | `"Email atau password yang kamu masukkan tidak valid"` |
| `"Password yang kamu masukkan salah"` | (sama seperti di atas) |

Kedua kondisi — email tidak ada dan password salah — harus mengembalikan pesan yang **identik**. Jangan beri petunjuk apapun tentang mana yang keliru.

---

## Unhandled Promise dan Race Condition

Di JavaScript/Node.js, *unhandled promise rejection* bisa menyebabkan aplikasi crash secara tiba-tiba, atau yang lebih berbahaya: menyebabkan state aplikasi jadi tidak konsisten. State yang tidak konsisten bisa membuka celah akses ke data yang harusnya tidak bisa diakses.

Selalu pasang global error handler untuk promise yang tidak tertangkap, dan pastikan setiap async operation punya fallback yang jelas.

```javascript
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise })
  // jangan expose reason ke luar!
})

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err)
  process.exit(1) // exit dengan bersih, jangan biarkan zombie process
})
```

---

## Checklist Sebelum Deploy

Sebelum push ke production, pastikan semua ini sudah terpenuhi:

- [ ] Stack trace tidak pernah muncul di response API production
- [ ] Semua field sensitif disensor sebelum masuk ke log
- [ ] Pesan error ke user bersifat generik, detail ada di server log
- [ ] Setiap async operation punya error handler eksplisit
- [ ] Mode debug dan verbose logging dimatikan di production
- [ ] Global unhandled rejection handler sudah dipasang
- [ ] Log files tidak bisa diakses secara publik

---

## Intinya

Error handling yang baik bukan tentang menyembunyikan bug — justru sebaliknya. Kamu mau error tercatat selengkap mungkin di tempat yang aman (server log), tapi sesedikit mungkin bocor ke luar. Bedakan antara informasi untuk kamu (developer) dan informasi untuk user.

> Semakin sedikit informasi sistem yang kamu ekspos ke luar, semakin sempit permukaan serangan yang bisa dieksploitasi. Error handling yang ketat bukan paranoia — itu professionalism.

Mulai dari yang simpel: review semua `catch` block di kodebasemu sekarang. Cek apa yang dikembalikan ke client dan apa yang masuk ke log. Dari situ, kamu sudah selangkah lebih aman dari kebocoran yang tidak perlu.