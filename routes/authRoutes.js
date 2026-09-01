import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { redirectIfAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Login Routes
router.get('/login', redirectIfAuthenticated, AuthController.getLogin);
router.post('/login', AuthController.login);

// Logout Route
router.get('/logout', AuthController.logout);

// Forgot Password Routes
router.get('/forgot-password', redirectIfAuthenticated, AuthController.getForgotPassword);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Register Routes (Hidden)
router.get('/register', redirectIfAuthenticated, AuthController.getRegister);
router.post('/register', AuthController.register);

export default router;
