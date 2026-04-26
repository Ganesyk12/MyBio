import { config } from 'dotenv';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import pageRoutes from './routes/pageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { initEmailCronJob } from './services/emailService.js';
import fs from 'fs';
config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// Mengaktifkan CORS untuk permintaan lintas domain
app.use(cors());
// Middleware untuk mengurai body permintaan dalam format JSON
app.use(express.json());
// Middleware untuk mengurai body permintaan dalam format URL-encoded
app.use(express.urlencoded({ extended: true }));
// Middleware untuk mengurai cookie
app.use(cookieParser());
// Serve file dari folder public dengan caching agresif (1 tahun)
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '365d',
    etag: true,
    immutable: true
}));

// Custom Upload Path
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'public/img/portfolio');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/img/portfolio', express.static(uploadDir, {
    maxAge: '365d',
    etag: true,
    immutable: true
}));

// --- Konfigurasi EJS ---
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Route Definition
app.use('/', authRoutes); // Auth routes (login/logout)
app.use('/', pageRoutes); // Public pages
app.use('/centralize', authMiddleware, adminRoutes); // Protected admin routes

// Initialize Email Forwarding Cron Job
initEmailCronJob();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express running Apps on http://localhost:${PORT}`);
});