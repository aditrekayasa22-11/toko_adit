-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 19, 2026 at 07:52 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `toko_adit`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `CariPelanggan` (IN `p_id` INT)   BEGIN
    SELECT * FROM pelanggan WHERE id_pelanggan = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `HitungPelanggan` (OUT `p_jumlah` INT)   BEGIN
    SELECT COUNT(*) INTO p_jumlah FROM pelanggan;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `LaporanTransaksi` (IN `p_id_pelanggan` INT)   BEGIN
    SELECT 
        t.id_transaksi,
        p.nama_pelanggan,
        t.tanggal_transaksi,
        t.nama_produk,
        t.jumlah,
        t.total_harga
    FROM transaksi t
    JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan
    WHERE t.id_pelanggan = p_id_pelanggan;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `TambahPelanggan` (IN `p_nama` VARCHAR(100), IN `p_kota` VARCHAR(100))   BEGIN
    INSERT INTO pelanggan (nama_pelanggan, alamat, telepon) 
    VALUES (p_nama, p_kota, '081234567890');
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `TampilPelanggan` ()   BEGIN
    SELECT * FROM pelanggan;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('tokokita-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0', 'i:3;', 1795069081),
('tokokita-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0:timer', 'i:1795069081;', 1795069081);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `detail_pesanan`
--

CREATE TABLE `detail_pesanan` (
  `id_detail` bigint(20) UNSIGNED NOT NULL,
  `id_pesanan` bigint(20) UNSIGNED NOT NULL,
  `id_produk` int(10) UNSIGNED DEFAULT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `harga` decimal(12,2) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detail_pesanan`
--

INSERT INTO `detail_pesanan` (`id_detail`, `id_pesanan`, `id_produk`, `nama_produk`, `harga`, `jumlah`, `subtotal`) VALUES
(1, 1, 1, 'Kemeja Flanel', 125000.00, 1, 125000.00),
(2, 1, 13, 'Topi Baseball', 35000.00, 1, 35000.00),
(3, 2, 9, 'Sepatu Formal', 350000.00, 1, 350000.00),
(4, 3, 2, 'Kaos Polos', 45000.00, 2, 90000.00),
(5, 3, 16, 'Sabuk Kulit', 60000.00, 1, 60000.00),
(9, 7, 1, 'Kemeja Flanel', 125000.00, 1, 125000.00),
(10, 7, 14, 'Dompet Kulit', 95000.00, 1, 95000.00),
(11, 7, 21, 'centong', 140000.00, 1, 140000.00),
(12, 8, 21, 'centong', 140000.00, 1, 140000.00),
(13, 9, 21, 'centong', 140000.00, 1, 140000.00),
(14, 10, 21, 'centong', 140000.00, 1, 140000.00),
(15, 11, 4, 'Jaket Bomber', 300000.00, 1, 300000.00),
(16, 12, 3, 'Kemeja Batik', 200000.00, 1, 200000.00),
(17, 13, 6, 'Celana Jeans', 180000.00, 1, 180000.00),
(18, 14, 3, 'Kemeja Batik', 200000.00, 1, 200000.00),
(19, 15, 8, 'Sepatu Sneakers', 450000.00, 1, 450000.00),
(20, 16, 2, 'Kaos Polos', 45000.00, 2, 90000.00),
(21, 17, 4, 'Jaket Bomber', 300000.00, 1, 300000.00),
(22, 18, 21, 'centong', 140000.00, 1, 140000.00),
(23, 19, 21, 'centong', 140000.00, 1, 140000.00),
(24, 20, 6, 'Celana Jeans', 180000.00, 1, 180000.00),
(25, 21, 21, 'centong', 140000.00, 1, 140000.00),
(26, 22, 1, 'Kemeja Flanel', 125000.00, 1, 125000.00),
(27, 23, 1, 'Kemeja Flanel', 125000.00, 1, 125000.00),
(28, 24, 2, 'Kaos Polos', 45000.00, 2, 90000.00);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_11_16_000001_create_pelanggan_table', 1),
(5, '2026_11_16_000002_create_transaksi_table', 1),
(6, '2026_11_16_000003_create_laporan_views', 1),
(7, '2026_11_16_000004_add_role_to_users_table', 1),
(8, '2026_11_16_000005_create_produk_table', 1),
(9, '2026_11_16_000006_create_pesanan_table', 1),
(10, '2026_11_16_040413_create_personal_access_tokens_table', 1),
(11, '2026_11_16_000007_align_produk_collation', 2),
(12, '2026_11_18_000001_add_kode_produk_to_produk_table', 3),
(13, '2026_11_18_000002_add_cashier_data_to_transaksi_table', 4),
(14, '2026_11_18_000003_add_discount_to_cashier_transactions', 5),
(15, '2026_11_19_000001_add_duitku_payment_fields_to_pesanan', 6);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pelanggan`
--

CREATE TABLE `pelanggan` (
  `id_pelanggan` int(11) NOT NULL,
  `nama_pelanggan` varchar(100) NOT NULL,
  `alamat` text NOT NULL,
  `telepon` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pelanggan`
--

INSERT INTO `pelanggan` (`id_pelanggan`, `nama_pelanggan`, `alamat`, `telepon`) VALUES
(1, 'Budi Santoso', 'Jl. Merdeka No. 10, Ponorogo', '081234567891'),
(2, 'Siti Aminah', 'Jl. A. Yani No. 15, Ponorogo', '081345678902'),
(3, 'Ahmad Fauzi', 'Jl. Sudirman No. 22, Madiun', '081567890123'),
(4, 'Dewi Lestari', 'Jl. Diponegoro No. 8, Ponorogo', '081890123456'),
(5, 'Eko Prasetyo', 'Jl. Gajah Mada No. 45, Magetan', '082123456789'),
(6, 'Rina Marlina', 'Jl. Pahlawan No. 12, Ponorogo', '085678901234'),
(7, 'Joko Widodo', 'Jl. Melati No. 5, Pacitan', '087890123456'),
(8, 'Siti Rahma', 'Jl. Mawar No. 7, Ponorogo', '089678901234'),
(9, 'Hendra Wijaya', 'Jl. Kenanga No. 30, Madiun', '081298765432'),
(10, 'Ani Yulianti', 'Jl. Cempaka No. 18, Ponorogo', '081387654321'),
(11, 'Rian Utama', 'Surabaya', '081234567890'),
(12, 'Pelanggan Umum', '-', '-');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pesanan`
--

CREATE TABLE `pesanan` (
  `id_pesanan` bigint(20) UNSIGNED NOT NULL,
  `kode_pesanan` varchar(30) NOT NULL,
  `id_pelanggan` int(11) NOT NULL,
  `tanggal_pesanan` date NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `ongkir` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_harga` decimal(12,2) NOT NULL,
  `status` enum('pending','diproses','dikirim','selesai','dibatalkan') NOT NULL DEFAULT 'pending',
  `status_pembayaran` varchar(20) NOT NULL DEFAULT 'menunggu',
  `duitku_reference` varchar(64) DEFAULT NULL,
  `duitku_payment_url` text DEFAULT NULL,
  `metode_pembayaran` varchar(30) NOT NULL DEFAULT 'transfer_bank',
  `alamat_pengiriman` text NOT NULL,
  `catatan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pesanan`
--

INSERT INTO `pesanan` (`id_pesanan`, `kode_pesanan`, `id_pelanggan`, `tanggal_pesanan`, `subtotal`, `ongkir`, `total_harga`, `status`, `status_pembayaran`, `duitku_reference`, `duitku_payment_url`, `metode_pembayaran`, `alamat_pengiriman`, `catatan`, `created_at`, `updated_at`) VALUES
(1, 'INV-DEMO-0001', 1, '2026-11-14', 160000.00, 20000.00, 180000.00, 'dikirim', 'menunggu', NULL, NULL, 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', 'Mohon dikemas rapi ya.', '2026-11-16 04:08:42', '2026-11-16 06:30:23'),
(2, 'INV-DEMO-0002', 4, '2026-11-15', 350000.00, 0.00, 350000.00, 'diproses', 'menunggu', NULL, NULL, 'cod', 'Jl. Diponegoro No. 8, Ponorogo', NULL, '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(3, 'INV-DEMO-0003', 2, '2026-11-16', 150000.00, 20000.00, 170000.00, 'dikirim', 'menunggu', NULL, NULL, 'qris', 'Jl. A. Yani No. 15, Ponorogo', 'Titip di pos keamanan.', '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(7, 'INV202611180001', 1, '2026-11-18', 360000.00, 0.00, 360000.00, 'pending', 'menunggu', NULL, NULL, 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-18 07:06:10', '2026-11-18 07:06:10'),
(8, 'INV202611190001', 1, '2026-11-19', 140000.00, 20000.00, 160000.00, 'pending', 'menunggu', NULL, NULL, 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 02:43:03', '2026-11-19 02:43:03'),
(9, 'INV202611190002', 1, '2026-11-19', 140000.00, 20000.00, 160000.00, 'dibatalkan', 'menunggu', NULL, NULL, 'qris', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 02:43:41', '2026-11-19 03:24:43'),
(10, 'INV202611190003', 1, '2026-11-19', 140000.00, 20000.00, 160000.00, 'dibatalkan', 'menunggu', NULL, NULL, 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 02:44:08', '2026-11-19 03:24:39'),
(11, 'INV202611190004', 1, '2026-11-19', 300000.00, 0.00, 300000.00, 'dibatalkan', 'menunggu', 'DS3820426MUILGYHJIQ07PAC', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426MUILGYHJIQ07PAC', 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 02:44:40', '2026-11-19 03:24:35'),
(12, 'INV202611190005', 1, '2026-11-19', 200000.00, 20000.00, 220000.00, 'dibatalkan', 'menunggu', NULL, NULL, 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 02:46:21', '2026-11-19 03:24:32'),
(13, 'INV202611190006', 1, '2026-11-19', 180000.00, 20000.00, 200000.00, 'dibatalkan', 'menunggu', 'DS3820426ET1JOM21JX00DWF', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426ET1JOM21JX00DWF', 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 03:21:12', '2026-11-19 03:24:28'),
(14, 'INV202611190007', 1, '2026-11-19', 200000.00, 20000.00, 220000.00, 'dibatalkan', 'menunggu', 'DS382042641Y7A8JVRY0IL1D', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS382042641Y7A8JVRY0IL1D', 'qris', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 03:21:27', '2026-11-19 03:24:24'),
(15, 'INV202611190008', 1, '2026-11-19', 450000.00, 0.00, 450000.00, 'diproses', 'dibayar', 'DS3820426FKB5ZP3LU0M5ZZH', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426FKB5ZP3LU0M5ZZH', 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 03:25:06', '2026-11-19 03:31:53'),
(16, 'INV202611190009', 1, '2026-11-19', 90000.00, 20000.00, 110000.00, 'dibatalkan', 'menunggu', NULL, NULL, 'qris', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 03:36:27', '2026-11-19 04:29:05'),
(17, 'INV202611190010', 1, '2026-11-19', 300000.00, 0.00, 300000.00, 'diproses', 'dibayar', 'DS3820426RC4MXGNHX5DKFU5', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426RC4MXGNHX5DKFU5', 'qris', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 03:37:07', '2026-11-19 03:38:40'),
(18, 'INV202611190011', 1, '2026-11-19', 140000.00, 20000.00, 160000.00, 'pending', 'menunggu', 'DS382042627Q4J1XU15I1HYQ', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS382042627Q4J1XU15I1HYQ', 'ewallet', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 03:42:35', '2026-11-19 03:42:37'),
(19, 'INV202611190012', 1, '2026-11-19', 140000.00, 20000.00, 160000.00, 'pending', 'menunggu', 'DS3820426DPL1YUCK7IAQIR8', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426DPL1YUCK7IAQIR8', 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 04:28:35', '2026-11-19 04:28:37'),
(20, 'INV202611190013', 1, '2026-11-19', 180000.00, 20000.00, 200000.00, 'pending', 'menunggu', 'DS3820426OV30SWTCZIDYCYC', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426OV30SWTCZIDYCYC', 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 05:25:58', '2026-11-19 05:25:59'),
(21, 'INV202611190014', 1, '2026-11-19', 140000.00, 20000.00, 160000.00, 'pending', 'menunggu', 'DS3820426TIMOG24RFZ2K05B', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426TIMOG24RFZ2K05B', 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 05:26:11', '2026-11-19 05:26:12'),
(22, 'INV202611190015', 1, '2026-11-19', 125000.00, 20000.00, 145000.00, 'diproses', 'dibayar', 'DS3820426V1VTIEZCZJN7JVB', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426V1VTIEZCZJN7JVB', 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 06:15:42', '2026-11-19 06:17:02'),
(23, 'INV202611190016', 1, '2026-11-19', 125000.00, 20000.00, 145000.00, 'pending', 'menunggu', 'DS3820426AAWD0TXZMMQWM3M', 'https://app-sandbox.duitku.com/redirect_checkout?reference=DS3820426AAWD0TXZMMQWM3M', 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 06:18:59', '2026-11-19 06:19:01'),
(24, 'INV202611190017', 1, '2026-11-19', 90000.00, 20000.00, 110000.00, 'pending', 'menunggu', NULL, NULL, 'transfer_bank', 'Jl. Merdeka No. 10, Ponorogo', NULL, '2026-11-19 06:21:11', '2026-11-19 06:21:11');

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id_produk` int(10) UNSIGNED NOT NULL,
  `kode_produk` varchar(64) DEFAULT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `harga` decimal(12,2) NOT NULL,
  `stok` int(11) NOT NULL DEFAULT 0,
  `deskripsi` text DEFAULT NULL,
  `gambar` varchar(100) NOT NULL DEFAULT 'atasan.svg',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produk`
--

INSERT INTO `produk` (`id_produk`, `kode_produk`, `nama_produk`, `kategori`, `harga`, `stok`, `deskripsi`, `gambar`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Kemeja Flanel', 'Atasan', 125000.00, 28, 'Kemeja flanel motif kotak-kotak dengan bahan katun lembut dan nyaman dipakai harian.', 'produk/nTw7FMbfmLV6B5xrTUHH8vyq39JsgFJeVz3WvyXw.jpg', '2026-11-16 04:08:42', '2026-11-19 06:18:59'),
(2, NULL, 'Kaos Polos', 'Atasan', 45000.00, 76, 'Kaos polos premium bahan cotton combed 30s, adem dan tidak mudah melar.', 'produk/DSPlzCD7QvNImHn6SABsM46IXaq0BEaZZPbdju9s.jpg', '2026-11-16 04:08:42', '2026-11-19 06:21:11'),
(3, NULL, 'Kemeja Batik', 'Atasan', 200000.00, 25, 'Kemeja batik tulis dengan motif klasik, cocok untuk acara formal maupun santai.', 'produk/KeLDraNgn7zBwz60WvruaiekKoMVS3XSOFT6Lm4q.jpg', '2026-11-16 04:08:42', '2026-11-19 03:24:32'),
(4, NULL, 'Jaket Bomber', 'Atasan', 300000.00, 15, 'Jaket bomber anti angin dengan lapisan dalam lembut, gaya kasual modern.', 'produk/3Agxc3KdFONyaJDwr4uxalz7digeiB4v4fw6lIsY.jpg', '2026-11-16 04:08:42', '2026-11-19 05:52:20'),
(5, NULL, 'Jaket Denim', 'Atasan', 280000.00, 13, 'Jaket denim klasik dengan potongan modern, tahan lama dan mudah dipadukan.', 'produk/1Gz9ysXqMTWuK6ZYZ3eTEUp2xG9oPUbtg02q2CgK.jpg', '2026-11-16 04:08:42', '2026-11-19 06:15:07'),
(6, NULL, 'Celana Jeans', 'Bawahan', 180000.00, 21, 'Celana jeans slim fit dengan bahan stretch, nyaman untuk aktivitas sehari-hari.', 'produk/3PSMGOIyO7NNgLEgPllOwCwJbFNFjBZXR6SpPoE9.jpg', '2026-11-16 04:08:42', '2026-11-19 06:14:47'),
(7, NULL, 'Celana Baggy jeans', 'Bawahan', 175000.00, 18, 'Celana chino bahan twill premium, potongan slim dan rapi untuk segala acara.', 'produk/IzcahXT01bUgLmDjgQqIkmM5aGyjucaUjQyKSm4D.png', '2026-11-16 04:08:42', '2026-11-19 05:38:44'),
(8, NULL, 'Sepatu Sneakers', 'Sepatu', 450000.00, 19, 'Sepatu sneakers bergaya sporty dengan sol empuk untuk kenyamanan maksimal.', 'produk/dpHgyBQtWJaePOTcpouJCqgFNZUhm2PwhQp7NPPh.jpg', '2026-11-16 04:08:42', '2026-11-19 03:25:06'),
(9, NULL, 'Sepatu Formal', 'Sepatu', 350000.00, 13, 'Sepatu formal kulit sintetis premium, elegan untuk acara resmi dan kantor.', 'sepatu.svg', '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(10, NULL, 'Sandal Casual', 'Sepatu', 70000.00, 40, 'Sandal casual ringan dengan alas anti slip, cocok untuk santai dan jalan-jalan.', 'sepatu.svg', '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(11, NULL, 'Tas Ransel', 'Tas', 220000.00, 17, 'Tas ransel kapasitas besar dengan kompartemen laptop dan bahan anti air.', 'produk/j3U3IWmrM8htNfSHJGLmAcGboXGsGPIj2pI9Kg4F.jpg', '2026-11-16 04:08:42', '2026-11-19 06:08:13'),
(12, NULL, 'Tas Selempang', 'Tas', 160000.00, 26, 'Tas selempang minimalis dengan tali adjustable, praktis untuk kegiatan harian.', 'produk/9oPk1Mb6FObcsNwggah2a31QABLTn19mbI8HLtTN.jpg', '2026-11-16 04:08:42', '2026-11-19 06:10:42'),
(13, NULL, 'Topi Baseball', 'Aksesoris', 35000.00, 49, 'Topi baseball unisex bahan katun, desain simpel dan mudah dipadukan.', 'produk/nSGI0J9Z9QIO2luIjMs4elLgIC2rXrXVtkrVfx2F.jpg', '2026-11-16 04:08:42', '2026-11-19 06:04:23'),
(14, NULL, 'Dompet Kulit', 'Aksesoris', 95000.00, 29, 'Dompet kulit asli dengan banyak slot kartu dan ruang uang, awet dan elegan.', 'produk/QPLHxG4dktk9oCXIKeEb66zKgWVcoLhITUl6PdFU.jpg', '2026-11-16 04:08:42', '2026-11-19 06:05:01'),
(15, NULL, 'Jam Tangan', 'Aksesoris', 550000.00, 9, 'Jam tangan analog dengan tali kulit, tampilan klasik untuk pria dan wanita.', 'produk/8QQMYSWXq4Md9qgqkCQ8oHmIyBq22IBuUgWDtmCb.jpg', '2026-11-16 04:08:42', '2026-11-19 06:05:41'),
(16, NULL, 'Sabuk Kulit', 'Aksesoris', 60000.00, 34, 'Sabuk kulit premium dengan buckle metalik, kuat dan tahan lama.', 'produk/dZyxGew4JvyVAtNsCiyu2W9nDnUM2L7gd3IZAv9G.jpg', '2026-11-16 04:08:42', '2026-11-19 06:06:16'),
(17, NULL, 'Kacamata Hitam', 'Aksesoris', 125000.00, 12, 'Kacamata hitam dengan lensa UV400, gaya modern dan melindungi mata.', 'produk/l1BDzCn0bSJONY14DYt4wWXLNzY4R3psjOD7PJi5.jpg', '2026-11-16 04:08:42', '2026-11-19 06:06:55'),
(18, NULL, 'Parfum', 'Perawatan', 250000.00, 16, 'Parfum unisex aroma tahan lama, kemasan elegan cocok untuk hadiah.', 'parfum.svg', '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(19, '8991389241585', 'buku', 'Atasan', 120000.00, 0, 'bagus banget', 'produk/WoKdFhn4Jbj4bDyrZKtEqxUk37Rb8RmIkHGIF6cz.jpg', '2026-11-18 03:47:14', '2026-11-19 02:09:03'),
(20, '8998866632287', 'AQUVIVA', 'Atasan', 5000.00, 0, 'segar', 'produk/rNRI4uQ18vzAsEBtEhhAFoOxS1A6qp3XfgQRSaG0.jpg', '2026-11-18 03:54:30', '2026-11-18 07:05:02'),
(21, '1234344', 'centong', 'Atasan', 140000.00, 7, 'bagsus', 'produk/2QrGxegmkXx4xDvxdWhlndoD9cqkKuQhCWFJFntj.jpg', '2026-11-18 07:04:13', '2026-11-19 05:26:11');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('8389JZpr8Dr1B6vIeKmvBKHarXdcc6QHIM7o4RuT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOVR2RVFET1ZYUlZDdE5KMENnRnFNUm8wRlNlcFZXdXJGNGxFSVpvbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1794803105),
('edEw36J8NwwRgHQcaHfzvHyvYD29ZNq5JVkDtChq', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9711', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVjFEMkdJMVR2TEl4dTB5S2dCZ2E5M0U2dlVscURUR2ljdVgyQzlzeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1794973123),
('kQWZW2iQwok7bRG2JeG1gsTqmfVq2mb8M6FEsoye', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.146.0 Chrome/150.0.7871.250 Electron/43.8.6 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVkNINHQ0NGVBeThhSktjb1AyNWljUUs2Z1dCNlByUDBuQnMweWMybyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1794973133),
('uyzBQxYYCnFvInpPXVnvihw9xIIvuRrKRECQnKd1', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.146.0 Chrome/150.0.7871.250 Electron/43.8.6 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWFdYMFN0NDZhZmQzSldRUHdNMFhDM2hydzRUelExWVhYTTdFbmw2WiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1795053573);

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `id_transaksi` int(11) NOT NULL,
  `id_pelanggan` int(11) NOT NULL,
  `kode_transaksi` varchar(32) DEFAULT NULL,
  `tanggal_transaksi` date NOT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `total_harga` decimal(12,2) NOT NULL,
  `diskon` decimal(12,2) DEFAULT NULL,
  `metode_pembayaran` varchar(20) DEFAULT NULL,
  `jumlah_bayar` decimal(12,2) DEFAULT NULL,
  `kembalian` decimal(12,2) DEFAULT NULL,
  `id_kasir` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`id_transaksi`, `id_pelanggan`, `kode_transaksi`, `tanggal_transaksi`, `nama_produk`, `jumlah`, `total_harga`, `diskon`, `metode_pembayaran`, `jumlah_bayar`, `kembalian`, `id_kasir`) VALUES
(1, 1, NULL, '2026-11-01', 'Kemeja Flanel', 2, 250000.00, NULL, NULL, NULL, NULL, NULL),
(2, 2, NULL, '2026-11-01', 'Celana Jeans', 1, 180000.00, NULL, NULL, NULL, NULL, NULL),
(3, 3, NULL, '2026-11-02', 'Sepatu Sneakers', 1, 450000.00, NULL, NULL, NULL, NULL, NULL),
(4, 4, NULL, '2026-11-03', 'Jaket Bomber', 1, 300000.00, NULL, NULL, NULL, NULL, NULL),
(5, 5, NULL, '2026-11-03', 'Kaos Polos', 3, 135000.00, NULL, NULL, NULL, NULL, NULL),
(6, 6, NULL, '2026-11-04', 'Tas Ransel', 1, 220000.00, NULL, NULL, NULL, NULL, NULL),
(7, 7, NULL, '2026-11-05', 'Topi Baseball', 2, 70000.00, NULL, NULL, NULL, NULL, NULL),
(8, 8, NULL, '2026-11-06', 'Dompet Kulit', 1, 95000.00, NULL, NULL, NULL, NULL, NULL),
(9, 9, NULL, '2026-11-06', 'Jam Tangan', 1, 550000.00, NULL, NULL, NULL, NULL, NULL),
(10, 10, NULL, '2026-11-07', 'Sabuk Kulit', 2, 120000.00, NULL, NULL, NULL, NULL, NULL),
(11, 1, NULL, '2026-11-08', 'Kaos Polos', 2, 90000.00, NULL, NULL, NULL, NULL, NULL),
(12, 2, NULL, '2026-11-09', 'Kemeja Batik', 1, 200000.00, NULL, NULL, NULL, NULL, NULL),
(13, 3, NULL, '2026-11-10', 'Celana Chino', 1, 175000.00, NULL, NULL, NULL, NULL, NULL),
(14, 4, NULL, '2026-11-10', 'Sepatu Formal', 1, 350000.00, NULL, NULL, NULL, NULL, NULL),
(15, 5, NULL, '2026-11-11', 'Jaket Denim', 1, 280000.00, NULL, NULL, NULL, NULL, NULL),
(16, 6, NULL, '2026-11-12', 'Sandal Casual', 2, 140000.00, NULL, NULL, NULL, NULL, NULL),
(17, 7, NULL, '2026-11-13', 'Tas Selempang', 1, 160000.00, NULL, NULL, NULL, NULL, NULL),
(18, 8, NULL, '2026-11-14', 'Kacamata Hitam', 1, 125000.00, NULL, NULL, NULL, NULL, NULL),
(19, 9, NULL, '2026-11-15', 'Parfum', 1, 250000.00, NULL, NULL, NULL, NULL, NULL),
(20, 10, NULL, '2026-11-15', 'Kaos Polos', 1, 45000.00, NULL, NULL, NULL, NULL, NULL),
(22, 10, NULL, '2026-11-16', 'Celana Chino', 1, 175000.00, NULL, NULL, NULL, NULL, NULL),
(23, 3, 'AD-261118125223-OPE8', '2026-11-18', 'Celana Jeans', 1, 180000.00, NULL, 'tunai', 200000.00, 20000.00, 13),
(24, 12, 'AD-261118125953-NYGL', '2026-11-18', 'buku', 2, 240000.00, 0.00, 'tunai', 500000.00, 85000.00, 13),
(25, 12, 'AD-261118125953-NYGL', '2026-11-18', 'Celana Chino', 1, 175000.00, 0.00, 'tunai', 500000.00, 85000.00, 13),
(26, 12, 'AD-261118130013-FSGI', '2026-11-18', 'Celana Jeans', 1, 180000.00, 0.00, 'tunai', 700000.00, 65000.00, 13),
(27, 12, 'AD-261118130013-FSGI', '2026-11-18', 'Celana Chino', 1, 175000.00, 0.00, 'tunai', 700000.00, 65000.00, 13),
(28, 12, 'AD-261118130013-FSGI', '2026-11-18', 'Jaket Denim', 1, 280000.00, 0.00, 'tunai', 700000.00, 65000.00, 13),
(29, 12, 'AD-261118135915-POIH', '2026-11-18', 'buku', 1, 120000.00, 0.00, 'qris', 300000.00, 0.00, 13),
(30, 12, 'AD-261118135915-POIH', '2026-11-18', 'Celana Jeans', 1, 180000.00, 0.00, 'qris', 300000.00, 0.00, 13),
(31, 12, 'AD-261118140502-DOKV', '2026-11-18', 'AQUVIVA', 12, 60000.00, 0.00, 'qris', 60000.00, 0.00, 13),
(32, 12, 'AD-261118140523-EWF2', '2026-11-18', 'buku', 2, 240000.00, 0.00, 'tunai', 123333333.00, 123093333.00, 13),
(33, 12, 'AD-261118140537-JKRY', '2026-11-18', 'Celana Baggy jeans', 1, 175000.00, 0.00, 'transfer', 175000.00, 0.00, 13),
(34, 3, 'AD-261119110252-HE3N', '2026-11-19', 'Celana Jeans', 1, 180000.00, 0.00, 'tunai', 200000.00, 20000.00, 13),
(35, 12, 'AD-261119113855-VMI7', '2026-11-19', 'Celana Jeans', 1, 180000.00, 0.00, 'tunai', 200000.00, 20000.00, 13),
(36, 12, 'AD-261119123310-ZGOB', '2026-11-19', 'Jaket Bomber', 1, 300000.00, 0.00, 'tunai', 320000.00, 20000.00, 13),
(37, 12, 'AD-261119123844-MBQU', '2026-11-19', 'Celana Baggy jeans', 1, 175000.00, 0.00, 'tunai', 200000.00, 25000.00, 13),
(38, 12, 'AD-261119125220-UHNE', '2026-11-19', 'Jaket Bomber', 1, 300000.00, 0.00, 'tunai', 3300000.00, 3000000.00, 13),
(39, 12, 'AD-261119131447-TIJ8', '2026-11-19', 'Celana Jeans', 1, 180000.00, 0.00, 'transfer', 180000.00, 0.00, 13),
(40, 12, 'AD-261119131507-F1EP', '2026-11-19', 'Jaket Denim', 1, 280000.00, 0.00, 'qris', 280000.00, 0.00, 13);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'pelanggan',
  `id_pelanggan` int(11) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `id_pelanggan`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin TokoKita', 'admin@tokokita.id', NULL, '$2y$12$r/DJjoI1mj9OQxhAAYheceADBB1vCuc9iehCqVGX9ZpUhud97j082', 'admin', NULL, NULL, '2026-11-16 04:08:40', '2026-11-16 04:08:40'),
(2, 'Budi Santoso', 'budi.santoso@tokokita.id', NULL, '$2y$12$jCa4cP1h1sfqnCqsd2gn6uNZgWPey7XGmNo/MdOv1aBvF68q4ryYq', 'pelanggan', 1, NULL, '2026-11-16 04:08:40', '2026-11-16 04:08:40'),
(3, 'Siti Aminah', 'siti.aminah@tokokita.id', NULL, '$2y$12$jN.j7E8U54tBLVUiGHhEO.dTdkj/uWIO6v31V60MRdAgGpopD6Kq6', 'pelanggan', 2, NULL, '2026-11-16 04:08:40', '2026-11-16 04:08:40'),
(4, 'Ahmad Fauzi', 'ahmad.fauzi@tokokita.id', NULL, '$2y$12$CwRSGlBvt/1nv3gfj5lO4.uDSaMI6f.ZnS9Vs3s1PDUv6utMjmFcK', 'pelanggan', 3, NULL, '2026-11-16 04:08:41', '2026-11-16 04:08:41'),
(5, 'Dewi Lestari', 'dewi.lestari@tokokita.id', NULL, '$2y$12$N4HjsmwR9ci3Cyqk7s30BuMpGixJzci5ZMh.HX33dkapTxlEcbhHq', 'pelanggan', 4, NULL, '2026-11-16 04:08:41', '2026-11-16 04:08:41'),
(6, 'Eko Prasetyo', 'eko.prasetyo@tokokita.id', NULL, '$2y$12$.EOyg8IIuN2rRvzElX.P0O5woNU5P.uH0eqcZsh3gRIZixoZXpA3y', 'pelanggan', 5, NULL, '2026-11-16 04:08:41', '2026-11-16 04:08:41'),
(7, 'Rina Marlina', 'rina.marlina@tokokita.id', NULL, '$2y$12$nPuQiUfUVvp08fHRegH0luJy/irpFhu.T1WTh22DdTpNklw68hDDa', 'pelanggan', 6, NULL, '2026-11-16 04:08:41', '2026-11-16 04:08:41'),
(8, 'Joko Widodo', 'joko.widodo@tokokita.id', NULL, '$2y$12$nCixBIm9Vc9VVHue.SN.LuTZyouysIbCuU/ujLps5CACUGTo/y2bq', 'pelanggan', 7, NULL, '2026-11-16 04:08:41', '2026-11-16 04:08:41'),
(9, 'Siti Rahma', 'siti.rahma@tokokita.id', NULL, '$2y$12$bomismeRhaSRm5s6EzMlUe0y2Woye1sREwUtzp4IZs5YhntEnzWzK', 'pelanggan', 8, NULL, '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(10, 'Hendra Wijaya', 'hendra.wijaya@tokokita.id', NULL, '$2y$12$zO5bq4iu6lyR6xN9y7Lvf.H.BZC4ihUMOttpcpSWaRopBeCTXnDl.', 'pelanggan', 9, NULL, '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(11, 'Ani Yulianti', 'ani.yulianti@tokokita.id', NULL, '$2y$12$0CyzKhz.neRkoxLJ08i4KemnFqjyEqzpVaSunMcWYCpSWCAY2H24W', 'pelanggan', 10, NULL, '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(12, 'Rian Utama', 'rian.utama@tokokita.id', NULL, '$2y$12$iyGSlZQ.kMtx1glTGUlRw.uweMtUN4kBX/JN3VRz/rcgP0x3i4/lK', 'pelanggan', 11, NULL, '2026-11-16 04:08:42', '2026-11-16 04:08:42'),
(13, 'Kasir TokoKita', 'kasir@tokokita.id', NULL, '$2y$12$HZ7pOpJ0crJqsppdNqHXIO776bdipRH8sNuq.d9NVXeMtIr9pRxm.', 'kasir', NULL, NULL, '2026-11-18 04:43:48', '2026-11-18 04:44:48');

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_laporan_transaksi`
-- (See below for the actual view)
--
CREATE TABLE `view_laporan_transaksi` (
`id_transaksi` int(11)
,`nama_pelanggan` varchar(100)
,`tanggal_transaksi` date
,`nama_produk` varchar(100)
,`jumlah` int(11)
,`total_harga` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_total_belanja`
-- (See below for the actual view)
--
CREATE TABLE `view_total_belanja` (
`id_pelanggan` int(11)
,`nama_pelanggan` varchar(100)
,`jumlah_transaksi` bigint(21)
,`total_keseluruhan_belanja` decimal(34,2)
);

-- --------------------------------------------------------

--
-- Structure for view `view_laporan_transaksi`
--
DROP TABLE IF EXISTS `view_laporan_transaksi`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_laporan_transaksi`  AS SELECT `t`.`id_transaksi` AS `id_transaksi`, `p`.`nama_pelanggan` AS `nama_pelanggan`, `t`.`tanggal_transaksi` AS `tanggal_transaksi`, `t`.`nama_produk` AS `nama_produk`, `t`.`jumlah` AS `jumlah`, `t`.`total_harga` AS `total_harga` FROM (`transaksi` `t` join `pelanggan` `p` on(`t`.`id_pelanggan` = `p`.`id_pelanggan`)) ;

-- --------------------------------------------------------

--
-- Structure for view `view_total_belanja`
--
DROP TABLE IF EXISTS `view_total_belanja`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_total_belanja`  AS SELECT `p`.`id_pelanggan` AS `id_pelanggan`, `p`.`nama_pelanggan` AS `nama_pelanggan`, count(`t`.`id_transaksi`) AS `jumlah_transaksi`, sum(`t`.`total_harga`) AS `total_keseluruhan_belanja` FROM (`pelanggan` `p` left join `transaksi` `t` on(`p`.`id_pelanggan` = `t`.`id_pelanggan`)) GROUP BY `p`.`id_pelanggan`, `p`.`nama_pelanggan` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `detail_pesanan_id_pesanan_foreign` (`id_pesanan`),
  ADD KEY `detail_pesanan_id_produk_foreign` (`id_produk`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`id_pelanggan`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id_pesanan`),
  ADD UNIQUE KEY `pesanan_kode_pesanan_unique` (`kode_pesanan`),
  ADD KEY `pesanan_id_pelanggan_foreign` (`id_pelanggan`),
  ADD KEY `pesanan_duitku_reference_index` (`duitku_reference`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id_produk`),
  ADD UNIQUE KEY `produk_nama_produk_unique` (`nama_produk`),
  ADD UNIQUE KEY `produk_kode_produk_unique` (`kode_produk`),
  ADD KEY `produk_kategori_index` (`kategori`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD KEY `id_pelanggan` (`id_pelanggan`),
  ADD KEY `transaksi_id_kasir_foreign` (`id_kasir`),
  ADD KEY `transaksi_kode_transaksi_index` (`kode_transaksi`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_id_pelanggan_foreign` (`id_pelanggan`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  MODIFY `id_detail` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `pelanggan`
--
ALTER TABLE `pelanggan`
  MODIFY `id_pelanggan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `pesanan`
--
ALTER TABLE `pesanan`
  MODIFY `id_pesanan` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id_produk` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD CONSTRAINT `detail_pesanan_id_pesanan_foreign` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE,
  ADD CONSTRAINT `detail_pesanan_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON DELETE SET NULL;

--
-- Constraints for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD CONSTRAINT `pesanan_id_pelanggan_foreign` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`) ON DELETE CASCADE;

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaksi_id_kasir_foreign` FOREIGN KEY (`id_kasir`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_id_pelanggan_foreign` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
