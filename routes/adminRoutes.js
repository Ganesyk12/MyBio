import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { AdminProjectController } from '../controllers/adminProjectController.js';
import { AdminSkillController } from '../controllers/adminSkillController.js';
import { AdminMessageController } from '../controllers/adminMessageController.js';

const router = express.Router();

// Admin Dashboard
router.get('/', AdminController.getDashboard);

// Admin Projects
router.get('/projects', AdminProjectController.getIndex);
router.get('/projects/create', AdminProjectController.getCreate);
router.post('/projects/create', AdminProjectController.postCreate);
router.get('/projects/edit/:id', AdminProjectController.getEdit);
router.post('/projects/edit/:id', AdminProjectController.postEdit);
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

export default router;
