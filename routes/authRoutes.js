import express from 'express';
import { AuthController } from '../controllers/authController.js';

const router = express.Router();

// Register routes
router.get('/register', AuthController.getRegister);
router.post('/register', AuthController.postRegister);

// Login routes
router.get('/login', AuthController.getLogin);
router.post('/login', AuthController.postLogin);

// Logout route
router.get('/logout', AuthController.logout);

export default router;
