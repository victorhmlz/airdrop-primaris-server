import express from 'express';
import { CreateWallet } from '../controllers/createWalletController.js';
import { CheckWallet } from '../controllers/checkWalletController.js';
import { GetKey } from '../controllers/getKeyController.js';

const router = express.Router();

router.post('/createWallet', CreateWallet);
router.post('/checkWallet', CheckWallet);
router.post('/getKey', GetKey);
 
export default router;