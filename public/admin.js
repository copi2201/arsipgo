const API = window.location.port === "3000" ? "/api" : "http://localhost:3000/api";
const $ = (id) => document.getElementById(id);
let token = localStorage.getItem("arsipgo_token") || "";
const statusLabels = {
  menunggu_konfirmasi: "Menunggu konfirmasi",
  dikonfirmasi: "Dikonfirmasi",
  diproses: "Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan"
};
const statusOptions = Object.keys(statusLabels);

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Permintaan gagal (${response.status})`);
  return data;
}

function showMessage(id, message, isError = false) {
  const el = $(id);
  el.textContent = message;
  el.style.color = isError ? "#b42318" : "";
}
function formatDate(value) {
  if (!value) return "Belum ditentukan";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("id-ID");
}
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
function clearStoredSession() {
  token = "";
  localStorage.removeItem("arsipgo_token");
  localStorage.removeItem("arsipgo_user");
}
function showDashboard() {
  $("loginPanel").hidden = true;
  $("dashboardPanel").hidden = false;
  $("logoutBtn").hidden = false;
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("loginMessage", "Memeriksa akun...");
  try {
    const result = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: $("email").value.trim(), password: $("password").value })
    });
    if (result.user?.role !== "admin") {
      token = "";
      throw new Error("Akun ini belum memiliki akses admin. Atur role admin di database lalu login kembali.");
    }
    token = result.token;
    localStorage.setItem("arsipgo_token", result.token);
    localStorage.setItem("arsipgo_user", JSON.stringify(result.user));
    showDashboard();
    await loadDashboard();
  } catch (error) {
    showMessage("loginMessage", error.message, true);
  }
});

async function checkExistingAdminSession() {
  const savedToken = localStorage.getItem("arsipgo_token");
  const savedUser = localStorage.getItem("arsipgo_user");
  if (!savedToken || !savedUser) return;

  try {
    const user = JSON.parse(savedUser);
    if (user.role !== "admin") return;
  } catch {
    return;
  }

  token = savedToken;
  showDashboard();       // langsung tampilkan dashboard
  await loadDashboard(); // kalau gagal, errornya tampil di tabel, sesi tidak dihapus
}

$("logoutBtn").addEventListener("click", () => {
  token = "";
  localStorage.removeItem("arsipgo_token");
  localStorage.removeItem("arsipgo_user");
  sessionStorage.removeItem("arsipgo_token");
  sessionStorage.removeItem("arsipgo_user");

  window.location.href = "/index.html";
});
$("refreshBtn").addEventListener("click", loadDashboard);
$("filterBtn").addEventListener("click", loadBookings);

async function loadDashboard() {
  try {
    const result = await api("/admin/summary");
    const labels = [
      ["total","Semua pesanan"],["menunggu_konfirmasi","Menunggu"],["dikonfirmasi","Dikonfirmasi"],
      ["diproses","Diproses"],["selesai","Selesai"],["dibatalkan","Dibatalkan"]
    ];
    $("summary").innerHTML = labels.map(([key,label]) =>
      `<div class="stat"><span>${label}</span><strong>${Number(result.summary[key] || 0)}</strong></div>`
    ).join("");
    await loadBookings();
  } catch (error) {
    showMessage("tableMessage", error.message, true);
  }
}

async function loadBookings() {
  showMessage("tableMessage", "Memuat pesanan...");
  const params = new URLSearchParams();
  if ($("statusFilter").value) params.set("status", $("statusFilter").value);
  if ($("searchInput").value.trim()) params.set("search", $("searchInput").value.trim());
  try {
    const result = await api(`/admin/bookings?${params.toString()}`);
    const bookings = result.bookings || [];
    if (!bookings.length) {
      $("bookingRows").innerHTML = '<tr><td colspan="6" class="empty">Belum ada pesanan yang cocok.</td></tr>';
    } else {
      $("bookingRows").innerHTML = bookings.map(b => `
        <tr>
          <td><strong>#${esc(b.id)}</strong><small>Dibuat: ${esc(new Date(b.created_at).toLocaleString("id-ID"))}</small></td>
          <td><strong>${esc(b.customer_name)}</strong><small>${esc(b.customer_email)}</small><small>${esc(b.whatsapp || "WhatsApp belum diisi")}</small></td>
          <td><strong>${esc(b.service_name)}</strong><small>Paket: ${esc(b.package_name)}</small><small>${esc(b.document_count ?? "-")} dokumen · ${esc(b.workers ?? "-")} tenaga · ${esc(b.duration_days ?? "-")} hari</small><small>${esc(b.description)}</small></td>
          <td>${esc(formatDate(b.start_date))}</td>
          <td><span class="status-pill">${esc(statusLabels[b.status] || b.status)}</span></td>
          <td><select class="status-select" data-booking-id="${esc(b.id)}" aria-label="Ubah status pesanan ${esc(b.id)}">
            ${statusOptions.map(s => `<option value="${s}" ${s === b.status ? "selected" : ""}>${statusLabels[s]}</option>`).join("")}
          </select></td>
        </tr>`).join("");
      document.querySelectorAll(".status-select").forEach(select => {
        select.addEventListener("change", async () => {
          const id = select.dataset.bookingId;
          const newStatus = select.value;
          select.disabled = true;
          try {
            await api(`/admin/bookings/${id}/status`, {
              method: "PATCH", body: JSON.stringify({ status: newStatus })
            });
            showMessage("tableMessage", `Status pesanan #${id} diperbarui menjadi "${statusLabels[newStatus]}".`);
            await loadDashboard();
          } catch (error) {
            showMessage("tableMessage", error.message, true);
            await loadBookings();
          } finally { select.disabled = false; }
        });
      });
    }
    showMessage("tableMessage", `${bookings.length} pesanan ditampilkan (maksimal 200).`);
  } catch (error) {
    showMessage("tableMessage", error.message, true);
  }
}

checkExistingAdminSession();