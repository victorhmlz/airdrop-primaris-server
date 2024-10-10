import express from 'express';
import { signAndSendTransaction, estimateGasForTransaction } from '../controllers/signTransactionController.js';
import { signAndClaimReward, estimateGasForClaim } from '../controllers/airdropController.js';
import { sendTransaction, estimateGas } from '../controllers/sendingPolController.js';

const router = express.Router();

router.post('/sendPrimaris', signAndSendTransaction);
router.post('/gasPrimaris', estimateGasForTransaction);
router.post('/claim', signAndClaimReward);
router.post('/gasClaim', estimateGasForClaim);
router.post('/send', sendTransaction);
router.post('/gas', estimateGas);

export default router;
