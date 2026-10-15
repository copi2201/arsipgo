const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res, next) => {
    const client = await pool.connect();
    try {
        const serviceId = Number(req.body.service_id);
        const description = String(req.body.description || "").trim();
        const userType = String(req.body.user_type || "Mahasiswa").trim();
        const documentCount = req.body.document_count == null
            ? null
            : Number(req.body.document_count);
        const startDate = req.body.start_date || null;
        const packageName = String(req.body.package_name || "Belum dipilih").trim();
        const workers = req.body.workers == null ? null : Number(req.body.workers);
        const durationDays = req.body.duration_days == null ? null : Number(req.body.duration_days);

        if (!Number.isInteger(serviceId) || serviceId < 1) {
            return res.status(400).json({ message: "service_id wajib berupa ID layanan yang valid." });
        }
        if (!description) {
            return res.status(400).json({ message: "Deskripsi kebutuhan wajib diisi." });
        }
        if (documentCount !== null && (!Number.isInteger(documentCount) || documentCount < 1)) {
            return res.status(400).json({ message: "Jumlah dokumen harus bilangan bulat minimal 1." });
        }
        if (workers !== null && (!Number.isInteger(workers) || workers < 1)) {
            return res.status(400).json({ message: "Jumlah tenaga harus minimal 1." });
        }
        if (durationDays !== null && (!Number.isInteger(durationDays) || durationDays < 1)) {
            return res.status(400).json({ message: "Durasi harus minimal 1 hari." });
        }

        const serviceResult = await pool.query(
            "SELECT id FROM services WHERE id = $1 AND active = TRUE",
            [serviceId]
        );
        if (serviceResult.rowCount === 0) {
            return res.status(404).json({ message: "Layanan tidak ditemukan." });
        }

        await client.query("BEGIN");
        const result = await client.query(
            `INSERT INTO bookings
             (user_id, service_id, user_type, description, document_count, start_date,
              package_name, workers, duration_days, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'menunggu_konfirmasi')
             RETURNING id, service_id, user_type, description, document_count, start_date,
                       package_name, workers, duration_days, status, created_at`,
            [
                req.user.id, serviceId, userType, description, documentCount,
                startDate, packageName, workers, durationDays
            ]
        );
        await client.query("COMMIT");
        res.status(201).json({
            message: "Pesanan berhasil dicatat. Status masih menunggu konfirmasi admin.",
            booking: result.rows[0]
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        if (error.code === "23503") {
            return res.status(400).json({ message: "Data layanan atau pengguna tidak valid." });
        }
        next(error);
    } finally {
        client.release();
    }
});

router.get("/mine", requireAuth, async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT b.id, b.user_type, b.description, b.document_count, b.start_date,
                    b.package_name, b.workers, b.duration_days, b.status, b.created_at,
                    s.name AS service_name
             FROM bookings b
             JOIN services s ON s.id = b.service_id
             WHERE b.user_id = $1
             ORDER BY b.created_at DESC`,
            [req.user.id]
        );
        res.json({ bookings: result.rows });
    } catch (error) {
        next(error);
    }
});

router.get("/:id", requireAuth, async (req, res, next) => {
    try {
        const bookingId = Number(req.params.id);
        if (!Number.isInteger(bookingId) || bookingId < 1) {
            return res.status(400).json({ message: "ID pesanan tidak valid." });
        }

        const result = await pool.query(
            `SELECT b.id, b.user_type, b.description, b.document_count, b.start_date,
                    b.package_name, b.workers, b.duration_days, b.status, b.created_at,
                    s.name AS service_name
             FROM bookings b
             JOIN services s ON s.id = b.service_id
             WHERE b.id = $1 AND b.user_id = $2`,
            [bookingId, req.user.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Pesanan tidak ditemukan." });
        }
        res.json({ booking: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
