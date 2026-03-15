import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { AdminProjectController } from '../controllers/adminProjectController.js';
import { AdminSkillController } from '../controllers/adminSkillController.js';
import { AdminMessageController } from '../controllers/adminMessageController.js';
import { AdminSmtpController } from '../controllers/adminSmtpController.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// Admin Dashboard
router.get('/', AdminController.getDashboard);

// Admin Projects
router.get('/projects', AdminProjectController.getIndex);
router.get('/projects/create', AdminProjectController.getCreate);
router.post('/projects/create', upload.single('FileImage'), AdminProjectController.postCreate);
router.get('/projects/detail/:id', AdminProjectController.getDetail);
router.get('/projects/edit/:id', AdminProjectController.getEdit);
router.post('/projects/edit/:id', upload.single('FileImage'), AdminProjectController.postEdit);
router.post('/projects/delete/:id', AdminProjectController.delete);

// Admin Skills
router.get('/skills', AdminSkillController.getIndex);
router.get('/skills/create', AdminSkillController.getCreate);
router.post('/skills/create', AdminSkillController.postCreate);
router.get('/skills/edit/:id', AdminSkillController.getEdit);
router.post('/skills/edit/:id', AdminSkillController.postEdit);
router.post('/skills/delete/:id', AdminSkillController.delete);

// Admin Messages
router.get('/messages', AdminMessageController.getIndex);
router.post('/messages/delete/:id', AdminMessageController.delete);

// Admin SMTP Settings
router.get('/smtp', AdminSmtpController.getIndex);
router.get('/smtp/create', AdminSmtpController.getCreate);
router.post('/smtp/create', AdminSmtpController.postCreate);
router.get('/smtp/edit/:id', AdminSmtpController.getEdit);
router.post('/smtp/edit/:id', AdminSmtpController.postEdit);
router.post('/smtp/delete/:id', AdminSmtpController.delete);

export default router;
