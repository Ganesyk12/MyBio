import express from 'express';
import { BaseController, DataProcessing } from '../controllers/baseController.js';


const router = express.Router();
// Page Route
router.get('/', BaseController.getHome);
router.get('/about', BaseController.getAboutPage);
router.get('/contact', BaseController.getContactPage);
router.get('/resume', BaseController.getResumePage);
router.get('/project', BaseController.getProjectPage);
router.get('/services', BaseController.getServicePage);
router.get('/projectDetail/:id', DataProcessing.getProjectDetail);

// Data Processing
router.post('/submitEmail', DataProcessing.submitEmail);

export default router;