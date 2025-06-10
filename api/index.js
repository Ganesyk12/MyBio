// api/index.js

import { config } from 'dotenv';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import pageRoutes from '../routes/pageRoutes.js';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import serverless from 'serverless-http';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(expressLayouts);
app.set('layout', 'layouts/main');
// Handle favicon (biar ga timeout)
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use((req, res) => {
  res.status(404).send("Not Found");
});
// Routing
app.use('/', pageRoutes);

// Export as serverless function
export default serverless(app);
