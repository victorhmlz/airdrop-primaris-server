import express from 'express';
import { checkQuest } from '../controllers/questController.js';

const router = express.Router();

router.post('/quest', checkQuest);
 
export default router;
