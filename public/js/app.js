let userName = "Ayu";
let documentCount = 10;

let selectedService = {
    icon: "📑",
    name: "Pemilahan Arsip",
    pricingType: "document",
    pricePerUnit: 5000,
    description: "Membantu memilah arsip berdasarkan jenis, kategori, tahun, atau kebutuhan pengguna."
};


const API_BASE = "http://localhost:3000";
let authToken = sessionStorage.getItem("arsipgo_token") || "";
let currentUser = JSON.parse(sessionStorage.getItem("arsipgo_user") || "null");
let apiServices = [];
let bookingDraft = { userType: "Mahasiswa", description: "", startDate: "", documentCount: 10 };
let lastBooking = null;

async function apiRequest(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Permintaan gagal (${response.status})`);
    return data;
}

function saveSession(data) {
    authToken = data.token;
    currentUser = data.user;
    userName = data.user.name;
    sessionStorage.setItem("arsipgo_token", authToken);
    sessionStorage.setItem("arsipgo_user", JSON.stringify(currentUser));
}

function clearSession() {
    authToken = "";
    currentUser = null;
    sessionStorage.removeItem("arsipgo_token");
    sessionStorage.removeItem("arsipgo_user");
}

function requireLogin() {
    if (!authToken || !currentUser) {
        alert("Silakan masuk ke akun ArsipGo terlebih dahulu.");
        login();
        return false;
    }
    return true;
}

async function loadApiServices() {
    try {
        const data = await apiRequest("/api/services");
        apiServices = data.services || [];
    } catch (error) {
        console.error("Gagal mengambil layanan dari API:", error);
    }
}

function getSelectedServiceId() {
    const found = apiServices.find(item => item.name === selectedService.name);
    return found ? Number(found.id) : null;
}

function formatRupiah(value) {
    return "Rp" + Number(value || 0).toLocaleString("id-ID");
}

let selectedPackage = {
    name: "Paket 1",
    workers: 1,
    days: 1,
    price: 150000
};


/* =========================
   HEADER
========================= */

function header(loggedIn = false) {

return `
<header>

<div class="logo">📁 ArsipGo</div>

<nav>
<a href="#" onclick="home()">Beranda</a>
<a href="#" onclick="services()">Layanan</a>
<a href="#" onclick="about()">Tentang Kami</a>
<a href="#" onclick="contact()">Kontak</a>
</nav>

<div>

${loggedIn

? `<button class="btn btn-primary" onclick="dashboard()">Dashboard</button>`

: `<button class="btn btn-outline" onclick="login()">Masuk</button>
   <button class="btn btn-primary" onclick="register()">Daftar</button>`
}

</div>

</header>
`;
}


/* =========================
   HOME
========================= */

function home() {

document.getElementById("app").innerHTML = `

${header()}

<section class="hero">

<div class="container hero-content">

<div>

<div class="badge">
📁 Jasa tenaga kearsipan fleksibel
</div>

<h1>
Solusi tenaga kearsipan saat arsip
<span>mulai overload.</span>
</h1>

<p>
ArsipGo menyediakan tenaga bantuan kearsipan
untuk membantu instansi, museum, perusahaan,
organisasi, dan mahasiswa ketika volume arsip
meningkat dan pekerjaan mulai menumpuk.
</p>

<div class="hero-buttons">

<button class="btn btn-primary"
onclick="login()">
Pesan Layanan →
</button>

<button class="btn btn-outline"
onclick="about()">
Pelajari Lebih Lanjut
</button>

</div>

</div>


<div class="hero-image">
📚
</div>

</div>

</section>


<section>

<div class="container">

<div class="section-title">

<h2>
Siapa yang bisa menggunakan ArsipGo?
</h2>

<p>
Bantuan kearsipan untuk berbagai kebutuhan.
</p>

</div>


<div class="cards">

${audienceCard("🎓","Mahasiswa","Arsip tugas, penelitian, organisasi")}

${audienceCard("🏛️","Instansi Pemerintah","Volume dokumen yang besar")}

${audienceCard("🏢","Perusahaan","Membantu mengatasi backlog")}

${audienceCard("🏛","Museum","Arsip dan dokumentasi koleksi")}

${audienceCard("🤝","Organisasi","Dokumen kegiatan dan program")}

</div>

</div>

</section>


<section style="background:white">

<div class="container">

<div class="section-title">

<h2>
Layanan ArsipGo
</h2>

<p>
Pilih layanan sesuai kebutuhan arsipmu.
</p>

</div>


<div class="cards">

${serviceCard("📑","Pemilahan Arsip",
"Memilah arsip berdasarkan jenis atau kategori.",
"Mulai Rp5.000/dokumen")}

${serviceCard("🗂️","Pengelompokan Arsip",
"Mengelompokkan arsip secara sistematis.",
"Mulai Rp5.000/dokumen")}

${serviceCard("📚","Penataan Arsip",
"Menata arsip agar mudah ditemukan kembali.",
"Mulai Rp5.000/dokumen")}

${serviceCard("💻","Pengelolaan Arsip Digital",
"Membantu mengelola dan menata arsip digital.",
"Mulai Rp50.000/hari")}

${serviceCard("📁","Penamaan File & Folder",
"Menyeragamkan nama file dan struktur folder.",
"Mulai Rp5.000/dokumen")}

${serviceCard("📦","Paket Lengkap",
"Layanan kearsipan menyeluruh dari pemilahan hingga penataan.",
"Mulai Rp200.000/paket")}

${serviceCard("🛠️","Layanan Custom",
"Kustomisasi layanan kearsipan sesuai kebutuhan spesifik Anda.",
"Harga menyesuaikan")}

</div>

</div>

</section>


<footer>

<div class="container">

<strong>📁 ArsipGo</strong>

<p style="margin-top:10px">
Solusi tenaga kearsipan saat arsip mulai overload.
</p>

</div>

</footer>
`;
}


function audienceCard(icon,title,text) {

return `

<div class="card" style="text-align:center">

<div class="icon" style="margin:auto auto 15px">
${icon}
</div>

<h3>${title}</h3>

<p>${text}</p>

</div>
`;
}


function serviceCard(icon,title,text,price) {

return `

<div class="card"
onclick="openService('${title}')"
style="cursor:pointer">

<div class="icon">
${icon}
</div>

<h3>${title}</h3>

<p>${text}</p>

<div class="price">
${price}
</div>

</div>
`;
}


/* =========================
   LOGIN
========================= */

function login() {

document.getElementById("app").innerHTML = `

${header()}

<div class="auth">

<div class="auth-box">

<div class="logo" style="text-align:center">
📁 ArsipGo
</div>

<h2>Masuk ke Akun</h2>

<p>
Kelola kebutuhan kearsipanmu bersama ArsipGo.
</p>


<div class="form-group">

<label>
Email
</label>

<input
id="loginEmail"
placeholder="contoh@email.com / 08xxxxxxxxxx"
>

</div>


<div class="form-group">

<label>
Password
</label>

<input
type="password"
id="loginPassword"
placeholder="Masukkan password"
>

</div>


<button
class="btn btn-primary"
onclick="doLogin()">

Masuk

</button>


<div class="switch">

Belum punya akun?

<a onclick="register()">
Daftar di sini
</a>

</div>

</div>

</div>
`;
}



async function doLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Masukkan email dan password.");
        return;
    }

    try {
        const data = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        // Simpan sesi login dari backend
        saveSession(data);

        // Periksa role akun dari respons backend
        const role = data.user?.role;

        if (role === "admin") {
            window.location.href = "http://localhost:3000/admin.html";
            return;
        }

        if (role === "user") {
            await loadApiServices();
            dashboard();
            return;
        }

        alert("Role akun tidak dikenali. Silakan periksa data akun.");
    } catch (error) {
        alert(error.message);
    }
}


/* =========================
   REGISTER
========================= */

function register() {

document.getElementById("app").innerHTML = `

${header()}

<div class="auth">

<div class="auth-box">

<div class="logo" style="text-align:center">
📁 ArsipGo
</div>

<h2>Buat Akun ArsipGo</h2>

<p>
Daftar untuk menggunakan layanan ArsipGo.
</p>


<div class="form-group">

<label>
Nama Lengkap
</label>

<input
id="registerName"
placeholder="Masukkan nama lengkap"
>

</div>


<div class="form-group">

<label>
Email
</label>

<input
id="registerEmail"
type="email"
placeholder="contoh@email.com"
>

</div>


<div class="form-group">

<label>
Nomor WhatsApp
</label>

<input
id="registerWhatsapp"
placeholder="08xxxxxxxxxx"
>

</div>


<div class="form-group">

<label>
Password
</label>

<input
type="password"
id="registerPassword"
placeholder="Minimal 8 karakter"
>

</div>


<button
class="btn btn-primary"
onclick="doRegister()">

Daftar

</button>


<div class="switch">

Sudah punya akun?

<a onclick="login()">
Masuk di sini
</a>

</div>

</div>

</div>
`;
}


async function doRegister() {
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const whatsapp = document.getElementById("registerWhatsapp").value.trim();
    const password = document.getElementById("registerPassword").value;
    if (!name || !email || !password) {
        alert("Nama, email, dan password wajib diisi.");
        return;
    }
    try {
        const data = await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, whatsapp, password })
        });
        saveSession(data);
        await loadApiServices();
        alert("Pendaftaran berhasil. Kamu sudah masuk ke ArsipGo.");
        dashboard();
    } catch (error) {
        alert(error.message);
    }
}


/* =========================
   DASHBOARD
========================= */

function dashboard() {

document.getElementById("app").innerHTML = `

${header(true)}

<div class="dashboard">


<aside class="sidebar">

<div class="sidebar-user">

<strong>
👤 ${userName}
</strong>

<small>
Pengguna
</small>

</div>


<a class="menu active">
⌂ Beranda
</a>

<a class="menu"
onclick="services()">
▣ Pesan Layanan
</a>

<a class="menu"
onclick="tracking()">
◷ Pesanan Saya
</a>

<a class="menu"
onclick="about()">
♡ Profil
</a>

<a class="menu"
onclick="logout()"
style="margin-top:30px">
↪ Keluar
</a>

</aside>


<main class="dashboard-main">


<div class="greeting">

<div>

<h1>
Halo, ${userName}! 👋
</h1>

<p>
Butuh bantuan kearsipan? Kami siap membantu.
</p>

</div>

<button
class="btn btn-primary"
onclick="services()">

Pesan Layanan

</button>

</div>


<div class="quick">


<div class="card"
onclick="services()">

<div class="icon">
📁
</div>

<h3>
Lihat Katalog Layanan
</h3>

<p>
Pilih jenis bantuan kearsipan.
</p>

</div>


<div class="card"
onclick="contact()">

<div class="icon">
💬
</div>

<h3>
Hubungi WhatsApp
</h3>

<p>
Konsultasikan kebutuhanmu.
</p>

</div>


<div class="card"
onclick="tracking()">

<div class="icon">
📋
</div>

<h3>
Cek Status Pesanan
</h3>

<p>
Lihat progres pekerjaan.
</p>

</div>

</div>


<div class="card">

<h3>
Pesanan Terbaru
</h3>

<div style="
padding:35px;
text-align:center;
color:#71817b;
">

Belum ada pesanan.

<br><br>

<button
class="btn btn-primary"
onclick="services()">

Mulai Pesan Layanan

</button>

</div>

</div>


</main>

</div>

`;
}


/* =========================
   SERVICES
========================= */

function services() {

document.getElementById("app").innerHTML = `

${header(true)}

<section class="page">

<div class="container">

<a
class="back"
onclick="dashboard()">

← Kembali ke Dashboard

</a>


<div class="section-title">

<h2>
Katalog Layanan
</h2>

<p>
Pilih layanan yang sesuai dengan kebutuhan arsipmu.
</p>

</div>


<div class="cards">

${serviceCard("📑","Pemilahan Arsip",
"Memilah arsip berdasarkan jenis atau kategori.",
"Mulai Rp5.000/dokumen")}

${serviceCard("🗂️","Pengelompokan Arsip",
"Mengelompokkan arsip secara sistematis.",
"Mulai Rp5.000/dokumen")}

${serviceCard("📚","Penataan Arsip",
"Menata arsip agar mudah ditemukan kembali.",
"Mulai Rp5.000/dokumen")}

${serviceCard("💻","Pengelolaan Arsip Digital",
"Membantu mengelola dan menata arsip digital.",
"Mulai Rp50.000/hari")}

${serviceCard("📁","Penamaan File & Folder",
"Menyeragamkan nama file dan struktur folder.",
"Mulai Rp5.000/dokumen")}

${serviceCard("📦","Paket Lengkap",
"Layanan kearsipan menyeluruh dari pemilahan hingga penataan.",
"Mulai Rp200.000/paket")}

${serviceCard("🛠️","Layanan Custom",
"Kustomisasi layanan kearsipan sesuai kebutuhan spesifik Anda.",
"Harga menyesuaikan")}

</div>

</div>

</section>
`;
}


/* =========================
   DETAIL SERVICE
========================= */

function openService(name) {

let icons = {
"Pemilahan Arsip":"📑",
"Pengelompokan Arsip":"🗂️",
"Penataan Arsip":"📚",
"Pengelolaan Arsip Digital":"💻",
"Penamaan File & Folder":"📁",
"Paket Lengkap":"📦",
"Layanan Custom":"🛠️"
};

let descriptions = {
"Pemilahan Arsip":"ArsipGo membantu memilah arsip berdasarkan jenis, kategori, tahun, atau kebutuhan pengguna.",
"Pengelompokan Arsip":"Membantu mengelompokkan dokumen dan arsip secara sistematis dan rapi.",
"Penataan Arsip":"Menata fisik maupun metadata arsip agar mudah ditemukan kembali saat dibutuhkan.",
"Pengelolaan Arsip Digital":"Membantu digitalisasi dan pengelolaan arsip berbasis sistem digital.",
"Penamaan File & Folder":"Menyeragamkan struktur nama file dan folder agar teratur dan efisien.",
"Paket Lengkap":"Solusi menyeluruh dari pemilahan, pengelompokan, hingga penataan arsip secara menyeluruh.",
"Layanan Custom":"Sesuaikan kebutuhan kearsipan Anda secara khusus mulai dari jumlah tenaga, durasi, hingga cakupan tugas."
};

let pricingTypes = {
"Pemilahan Arsip": "document",
"Pengelompokan Arsip": "document",
"Penataan Arsip": "document",
"Penamaan File & Folder": "document",
"Pengelolaan Arsip Digital": "day",
"Paket Lengkap": "package",
"Layanan Custom": "custom"
};

selectedService = {

name: name,
icon: icons[name] || "📁",
pricingType: pricingTypes[name] || "document",
pricePerUnit: pricingTypes[name] === "document" ? 5000 : (pricingTypes[name] === "package" ? 200000 : 50000),
description: descriptions[name] || "ArsipGo membantu menyelesaikan pekerjaan kearsipan sesuai volume dan kebutuhan pengguna."

};

document.getElementById("app").innerHTML = `

${header(true)}

<section class="page">

<div class="container">

<a
class="back"
onclick="services()">

← Kembali ke Layanan

</a>


<div class="detail">


<div>

<div class="detail-main">

<div style="font-size:45px">
${selectedService.icon}
</div>

<h1>
${selectedService.name}
</h1>

<p>
${selectedService.description}
</p>

<div class="price">
${name === 'Layanan Custom' ? 'Harga Menyesuaikan' : (name === 'Paket Lengkap' ? 'Mulai dari Rp200.000/paket' : (name === 'Pengelolaan Arsip Digital' ? 'Mulai dari Rp50.000/hari' : 'Mulai dari Rp5.000/dokumen'))}
</div>

</div>


<div class="card" style="margin-top:20px">

<h3>
Apa yang didapatkan?
</h3>

<br>

<p>✓ Tenaga yang memahami pekerjaan kearsipan</p>

<p>✓ Pekerjaan disesuaikan dengan volume arsip</p>

<p>✓ Durasi bantuan fleksibel</p>

<p>✓ Cocok untuk kebutuhan sementara maupun khusus</p>

</div>

</div>


<div class="card">

<h3>
Siap mulai?
</h3>

<p style="margin:15px 0">

Ceritakan kebutuhan arsipmu,
kemudian ArsipGo akan menyesuaikan
jumlah tenaga dan durasinya.

</p>

<button
class="btn btn-primary"
style="width:100%"
onclick="booking()">

Pesan Sekarang →

</button>

<br><br>

<button
class="btn btn-outline"
style="width:100%"
onclick="contact()">

Konsultasi

</button>

</div>


</div>

</div>

</section>
`;
}


/* =========================
   BOOKING
========================= */

function booking() {

if (!requireLogin()) return;
document.getElementById("app").innerHTML = `

${header(true)}

<section class="page">

<div class="container">

<div class="booking">


<div class="card">

<h2>
Form Pemesanan
</h2>

<br>


<div class="form-group">

<label>
Jenis Pengguna
</label>

<select id="bookingUserType">

<option>Mahasiswa</option>

<option>
Instansi Pemerintah
</option>

<option>
Perusahaan Swasta
</option>

<option>
Museum
</option>

<option>
Organisasi
</option>

</select>

</div>


<div class="form-group">

<label>
Deskripsi Kebutuhan
</label>

<textarea
id="bookingDescription"
rows="5"
placeholder="Contoh: Saya memiliki 10 dokumen yang perlu dipilah dan dikelompokkan..."
></textarea>

</div>


<div class="form-group">

<label>
Jumlah Volume Arsip (Dokumen)
</label>

<input
type="number"
id="inputDocCount"
value="${documentCount}"
min="1"
placeholder="Contoh: 10"
>

</div>


<div class="form-group">

<label>
Tanggal Mulai
</label>

<input type="date" id="bookingStartDate">

</div>


<button
class="btn btn-primary"
style="width:100%"
onclick="submitBookingForm()">

Lanjut Pilih Paket →

</button>

</div>


<div class="card">

<h3>
Layanan Dipilih
</h3>

<br>

<div style="
background:#edf7ef;
padding:20px;
border-radius:12px;
">

<div style="font-size:30px">
${selectedService.icon}
</div>

<strong>
${selectedService.name}
</strong>

<p style="margin-top:8px">
${selectedService.description}
</p>

</div>

</div>


</div>

</div>

</section>
`;
}

function submitBookingForm() {
    const val = parseInt(document.getElementById("inputDocCount").value, 10);
    const userType = document.getElementById("bookingUserType").value;
    const description = document.getElementById("bookingDescription").value.trim();
    const startDate = document.getElementById("bookingStartDate").value;
    if (!description) {
        alert("Deskripsi kebutuhan wajib diisi.");
        return;
    }
    if (!Number.isInteger(val) || val < 1) {
        alert("Jumlah dokumen minimal 1.");
        return;
    }
    documentCount = val;
    bookingDraft = { userType, description, startDate, documentCount: val };
    packages();
}


/* =========================
   PACKAGE
========================= */

function packages() {

document.getElementById("app").innerHTML = `

${header(true)}

<section class="page">

<div class="container">

<div class="booking">


<div class="card">

<h2>
Pilih Paket Tenaga
</h2>

<br>


<div
class="package ${selectedPackage.name === 'Paket 1' ? 'selected' : ''}"
onclick="choosePackage('Paket 1',150000,1,1)">

<strong>
Paket 1
</strong>

<h3>
Rp150.000
</h3>

<p>
1 tenaga × 1 hari
</p>

</div>


<div
class="package ${selectedPackage.name === 'Paket 2' ? 'selected' : ''}"
onclick="choosePackage('Paket 2',400000,2,3)">

<strong>
Paket 2 ⭐
</strong>

<h3>
Rp400.000
</h3>

<p>
2 tenaga × 3 hari
</p>

</div>


<div
class="package ${selectedPackage.name === 'Paket Custom' ? 'selected' : ''}"
onclick="choosePackage('Paket Custom',0,'Custom','Custom')">

<strong>
Paket Custom
</strong>

<h3>
Harga menyesuaikan
</h3>

<p>
Jumlah tenaga dan durasi disesuaikan.
</p>

</div>


<button
class="btn btn-primary"
style="width:100%"
onclick="payment()">

Lanjut Pembayaran →

</button>

</div>


<div class="card">

<h3>
Ringkasan Pesanan
</h3>

<br>

<p>
Layanan:
<strong>
${selectedService.name}
</strong>
</p>

<br>

${selectedService.pricingType === 'document' 
? `<p>Jumlah Dokumen: <strong>${documentCount} dokumen</strong> (Rp${(documentCount * 5000).toLocaleString("id-ID")})</p><p style="font-size:12px; color:#71817b;">(Rp5.000 / dokumen)</p><br>`
: ''
}

<p>
Paket Tenaga:
<strong>
${selectedPackage.name} ${selectedPackage.price ? '(Rp' + selectedPackage.price.toLocaleString("id-ID") + ')' : ''}
</strong>
</p>

<br>

<p>
Tenaga:
<strong>
${selectedPackage.workers}
</strong>
</p>

<br>

<p>
Durasi:
<strong>
${selectedPackage.days} ${selectedPackage.days === 'Custom' ? '' : 'hari'}
</strong>
</p>

<br>

<hr>

<br>

<h2 style="color:#086b58">
${calculateTotalPriceText()}
</h2>

</div>

</div>

</div>

</section>
`;
}


function choosePackage(name,price,workers,days) {

selectedPackage = {
name,
price,
workers,
days
};

packages();

}

function calculateTotalPriceText() {
    if(selectedService.pricingType === 'document') {
        let docTotal = documentCount * 5000;
        let packageTotal = selectedPackage.price || 0;
        let grandTotal = docTotal + packageTotal;
        return "Rp" + grandTotal.toLocaleString("id-ID");
    } else if(selectedService.name === 'Paket Lengkap') {
        let grandTotal = 200000 + (selectedPackage.price || 0);
        return "Rp" + grandTotal.toLocaleString("id-ID");
    } else if(selectedPackage.price) {
        return "Rp" + selectedPackage.price.toLocaleString("id-ID");
    } else {
        return "Custom";
    }
}


/* =========================
   PAYMENT
========================= */

function payment() {

let price = calculateTotalPriceText();
let docTotal = documentCount * 5000;

document.getElementById("app").innerHTML = `

${header(true)}

<section class="page">

<div class="container">

<div class="booking">


<div class="card">

<h2>
Pembayaran
</h2>

<br>


<div class="form-group">

<label>
Metode Pembayaran
</label>

<select>

<option>
Transfer Bank
</option>

<option>
E-Wallet
</option>

<option>
Virtual Account
</option>

</select>

</div>


<div class="form-group">

<label>
Nomor WhatsApp
</label>

<input
placeholder="08xxxxxxxxxx"
>

</div>


<button
class="btn btn-primary"
style="width:100%"
onclick="success()">

Bayar Sekarang (${price})

</button>

</div>


<div class="card">

<h3>
Ringkasan Pesanan
</h3>

<br>

<p>
Layanan:
<br>
<strong>
${selectedService.name}
</strong>
</p>

<br>

${selectedService.pricingType === 'document'
? `<p>Jumlah Dokumen:<br><strong>${documentCount} dokumen</strong> (Rp${docTotal.toLocaleString("id-ID")})</p><br>`
: ''
}

<p>
Paket Tenaga:
<br>
<strong>
${selectedPackage.name} ${selectedPackage.price ? '(Rp' + selectedPackage.price.toLocaleString("id-ID") + ')' : ''}
</strong>
</p>

<br>

<p>
Jumlah Tenaga:
<strong>
${selectedPackage.workers}
</strong>
</p>

<br>

<hr><br>

<p style="font-size:12px; color:#71817b;">Total Pembayaran:</p>
<h2 style="color:#086b58">
${price}
</h2>

</div>

</div>

</div>

</section>
`;
}


/* =========================
   SUCCESS
========================= */

async function success() {
    if (!requireLogin()) return;
    const serviceId = getSelectedServiceId();
    if (!serviceId) {
        await loadApiServices();
    }
    const resolvedServiceId = getSelectedServiceId();
    if (!resolvedServiceId) {
        alert("Layanan belum berhasil dimuat dari server. Coba muat ulang halaman.");
        return;
    }
    const payload = {
        service_id: resolvedServiceId,
        user_type: bookingDraft.userType || "Mahasiswa",
        description: bookingDraft.description || "Pemesanan layanan " + selectedService.name,
        document_count: selectedService.pricingType === "document" ? Number(bookingDraft.documentCount || documentCount) : null,
        start_date: bookingDraft.startDate || null,
        package_name: selectedPackage.name,
        workers: Number.isInteger(selectedPackage.workers) ? selectedPackage.workers : null,
        duration_days: Number.isInteger(selectedPackage.days) ? selectedPackage.days : null
    };
    try {
        const data = await apiRequest("/api/bookings", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        lastBooking = data.booking;
        document.getElementById("app").innerHTML = `
        ${header(true)}
        <section class="success">
            <div class="success-icon">✓</div>
            <h1>Pesanan Berhasil Dicatat! 🎉</h1>
            <p>Nomor pesanan: <strong>#${lastBooking.id}</strong></p>
            <p>Pesanan tersimpan di ArsipGo dengan status <strong>${lastBooking.status}</strong>.</p>
            <p>Catatan: pembayaran online belum terintegrasi. Admin perlu mengonfirmasi pesanan ini.</p>
            <button class="btn btn-primary" onclick="tracking()">Lihat Status Pesanan →</button>
        </section>`;
    } catch (error) {
        alert(error.message);
    }
}


/* =========================
   TRACKING
========================= */

async function tracking() {
    if (!requireLogin()) return;
    document.getElementById("app").innerHTML = `${header(true)}<section class="page"><div class="container"><p>Memuat pesanan...</p></div></section>`;
    try {
        const data = await apiRequest("/api/bookings/mine");
        const bookings = data.bookings || [];
        document.getElementById("app").innerHTML = `
        ${header(true)}
        <section class="page">
          <div class="container">
            <a class="back" onclick="dashboard()">← Kembali ke Dashboard</a>
            <div class="section-title"><h2>Pesanan Saya</h2><p>Status pesanan yang tersimpan di database ArsipGo.</p></div>
            ${bookings.length ? `<div class="cards">${bookings.map(b => `
              <div class="card">
                <h3>${b.service_name}</h3>
                <p>Nomor pesanan: <strong>#${b.id}</strong></p>
                <p>Paket: ${b.package_name}</p>
                <p>Status: <strong>${b.status}</strong></p>
                <p>${b.description}</p>
                <p style="font-size:12px;color:#71817b">Dibuat: ${new Date(b.created_at).toLocaleString("id-ID")}</p>
              </div>`).join("")}</div>` : `<div class="card"><p>Belum ada pesanan di akun ini.</p><br><button class="btn btn-primary" onclick="services()">Pesan Layanan</button></div>`}
          </div>
        </section>`;
    } catch (error) {
        alert(error.message);
        dashboard();
    }
}


function timeline(icon,title,text) {

return `

<div class="timeline-item">

<div class="dot">
${icon}
</div>

<div>

<h4>
${title}
</h4>

<p>
${text}
</p>

</div>

</div>
`;
}


function logout() {
    clearSession();
    userName = "Ayu";
    home();
}

/* =========================
   ABOUT
========================= */

function about() {

document.getElementById("app").innerHTML = `

${header(true)}

<section class="page">

<div class="container">

<div class="detail-main">

<div class="badge">
Tentang ArsipGo
</div>

<h1>
Tenaga tambahan khusus kearsipan.
</h1>

<p>
ArsipGo hadir ketika volume arsip meningkat
dan tenaga internal terbatas.

Pengguna dapat memesan bantuan berdasarkan
volume pekerjaan, jumlah tenaga, dan durasi
yang dibutuhkan.
</p>

</div>

<br><br>

<div class="cards">

<div class="card">

<div class="icon">
👥
</div>

<h3>
Profesional
</h3>

<p>
Tenaga yang memahami dasar pekerjaan kearsipan.
</p>

</div>


<div class="card">

<div class="icon">
⚙️
</div>

<h3>
Fleksibel
</h3>

<p>
Jumlah tenaga dan durasi dapat disesuaikan.
</p>

</div>


<div class="card">

<div class="icon">
❤️
</div>

<h3>
Terpercaya
</h3>

<p>
Fokus pada kualitas dan ketepatan waktu.
</p>

</div>

</div>

</div>

</section>
`;
}


/* =========================
   CONTACT
========================= */

function contact() {
    // Ganti nomor berikut dengan nomor WhatsApp admin, format internasional tanpa + atau spasi.
    const nomorWhatsApp = "62881036195969";

    if (nomorWhatsApp.includes("x")) {
        alert("Ganti nomorWhatsApp di fungsi contact() dengan nomor WhatsApp admin ArsipGo terlebih dahulu.");
        return;
    }

    const pesan = "Halo Admin ArsipGo, saya ingin berkonsultasi mengenai layanan kearsipan.";
    const urlWhatsApp = "https://wa.me/" + nomorWhatsApp + "?text=" + encodeURIComponent(pesan);

    window.open(urlWhatsApp, "_blank");
}


/* =========================
   START
========================= */

if (currentUser) userName = currentUser.name;
loadApiServices();
home();
