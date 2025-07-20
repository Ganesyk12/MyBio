import { config } from 'dotenv';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import pageRoutes from './routes/pageRoutes.js';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
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
// Serve file dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// --- Konfigurasi EJS ---
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.use(express.static('public'));

// Route Definition
app.use('/', pageRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express running Apps on http://localhost:${PORT}`);
});