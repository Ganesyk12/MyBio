import express from 'express';
import { PageController } from '../controllers/pageController.js';
import { ProjectController } from '../controllers/projectController.js';
import { EmailController } from '../controllers/emailController.js';

const router = express.Router();

// Page Routes
router.get('/', PageController.getHome);
router.get('/about', PageController.getAboutPage);
router.get('/contact', PageController.getContactPage);
router.get('/resume', PageController.getResumePage);
router.get('/services', PageController.getServicePage);

// Project Routes
router.get('/portfolio', ProjectController.getProjectPage);
router.get('/portfolio/:id', ProjectController.getProjectDetail);

// Data Processing
router.post('/submitEmail', EmailController.submitEmail);

export default router;