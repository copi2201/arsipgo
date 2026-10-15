CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    whatsapp VARCHAR(30),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    pricing_type VARCHAR(30) NOT NULL CHECK (pricing_type IN ('document', 'day', 'package', 'custom')),
    price_per_unit INTEGER,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id),
    user_type VARCHAR(80) NOT NULL DEFAULT 'Mahasiswa',
    description TEXT NOT NULL,
    document_count INTEGER CHECK (document_count IS NULL OR document_count > 0),
    start_date DATE,
    package_name VARCHAR(100) NOT NULL DEFAULT 'Belum dipilih',
    workers INTEGER CHECK (workers IS NULL OR workers > 0),
    duration_days INTEGER CHECK (duration_days IS NULL OR duration_days > 0),
    status VARCHAR(40) NOT NULL DEFAULT 'menunggu_konfirmasi'
        CHECK (status IN ('menunggu_konfirmasi', 'dikonfirmasi', 'diproses', 'selesai', 'dibatalkan')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_created
    ON bookings (user_id, created_at DESC);

INSERT INTO services (name, description, pricing_type, price_per_unit)
VALUES
    ('Pemilahan Arsip', 'Memilah arsip berdasarkan jenis, kategori, tahun, atau kebutuhan pengguna.', 'document', 5000),
    ('Pengelompokan Arsip', 'Mengelompokkan arsip secara sistematis.', 'document', 5000),
    ('Penataan Arsip', 'Menata arsip agar mudah ditemukan kembali.', 'document', 5000),
    ('Pengelolaan Arsip Digital', 'Membantu mengelola dan menata arsip digital.', 'day', 50000),
    ('Penamaan File & Folder', 'Menyeragamkan nama file dan struktur folder.', 'document', 5000),
    ('Paket Lengkap', 'Layanan kearsipan menyeluruh dari pemilahan hingga penataan.', 'package', 200000),
    ('Layanan Custom', 'Kustomisasi layanan kearsipan sesuai kebutuhan spesifik pengguna.', 'custom', NULL)
ON CONFLICT (name) DO NOTHING;
