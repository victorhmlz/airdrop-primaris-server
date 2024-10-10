import { ethers } from 'ethers';
import { decryptPrivateKey } from '../services/encryptingServices.js';
import Wallet from '../models/Wallet.js';

const infuraProjectId = process.env.INFURA_PROJECT_ID;

// Estimate gas for sending MATIC
export const estimateGas = async (req, res) => {
    try {
        const { telegramUserName, recipientAddress, amount } = req.body;

        console.log(`[INFO] Iniciando estimación de gas para el usuario: ${telegramUserName}`);

        // Fetch the user's wallet from the database
        const userWallet = await Wallet.findOne({ telegramUserName });
        if (!userWallet) {
            console.error(`[ERROR] Usuario no encontrado: ${telegramUserName}`);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        console.log(`[INFO] Usuario encontrado en la base de datos: ${telegramUserName}`);

        // Decrypt the private key
        const decryptedPrivateKey = decryptPrivateKey(userWallet.privateKey);
        console.log(`[INFO] Clave privada descifrada exitosamente para el usuario: ${telegramUserName}`);

        if (!infuraProjectId) {
            console.error(`[ERROR] El ID del proyecto Infura no está configurado.`);
            return res.status(500).json({ error: 'Configuración de Infura inválida' });
        }

        // Set up the provider and wallet
        const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${infuraProjectId}`);
        console.log(`[INFO] Proveedor configurado con Infura para Polygon Mainnet`);

        const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
        console.log(`[INFO] Wallet creado para el usuario con dirección: ${wallet.address}`);

        // Estimar el gas para la transacción de envío de MATIC
        const tx = {
            to: recipientAddress,
            value: ethers.parseUnits(amount, "ether") // Cantidad en MATIC
        };

        try {
            const estimatedGas = await wallet.estimateGas(tx);
            console.log(`[INFO] Estimación de gas obtenida: ${estimatedGas.toString()}`);

            // Obtener el precio del gas
            const feeData = await provider.getFeeData();
            console.log(`[INFO] Datos de la tarifa de gas obtenidos: ${JSON.stringify(feeData)}`);

            const gasPrice = feeData.gasPrice || ethers.parseUnits("30", "gwei"); // Valor por defecto si gasPrice es null
            console.log(`[INFO] Precio del gas utilizado: ${gasPrice.toString()}`);

            // Calcular el costo total en MATIC
            const totalGasCostInMatic = estimatedGas * gasPrice;
            const totalGasCostFormatted = ethers.formatEther(totalGasCostInMatic);
            console.log(`[INFO] Costo total estimado en MATIC: ${totalGasCostFormatted}`);

            res.status(200).json({ 
                estimatedGas: estimatedGas.toString(), 
                totalGasCostInMatic: totalGasCostFormatted
            });
        } catch (gasEstimationError) {
            console.error(`[ERROR] Error al estimar el gas: ${gasEstimationError.message}`);
            return res.status(500).json({ error: 'Error al estimar el gas para la transacción' });
        }
    } catch (error) {
        console.error(`[ERROR] Error general en la estimación de gas: ${error.message}`);
        res.status(500).json({ error: 'Error on gas estimation' });
    }
};

// Sign and send MATIC transaction
export const sendTransaction = async (req, res) => {
    try {
        const { telegramUserName, recipientAddress, amount } = req.body;

        const walletData = await Wallet.findOne({ telegramUserName });

        if (!walletData) {
            return res.status(404).json({ error: 'Wallet no encontrada para este usuario' });
        }

        const decryptedPrivateKey = decryptPrivateKey(walletData.privateKey);
        const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${infuraProjectId}`);
        const wallet = new ethers.Wallet(decryptedPrivateKey, provider);

        // Preparar y enviar la transacción de MATIC
        const tx = {
            to: recipientAddress,
            value: ethers.parseUnits(amount, "ether"), // Cantidad en MATIC
            gasLimit: 21000 // Gas limit estándar para transacciones simples
        };

        try {
            const signedTx = await wallet.sendTransaction(tx);
            console.log(`[INFO] Transacción enviada: ${signedTx.hash}`);

            const receipt = await signedTx.wait();
            console.log(`[INFO] Transacción confirmada con hash: ${receipt.transactionHash}`);
            
            res.status(200).json({ message: 'Transacción enviada con éxito', txHash: receipt.transactionHash });
        } catch (sendError) {
            console.error(`[ERROR] Error al enviar la transacción: ${sendError.message}`);
            res.status(500).json({ error: 'Error al procesar la transacción' });
        }
    } catch (error) {
        console.error('Error al firmar/enviar la transacción:', error);
        res.status(500).json({ error: 'Error al procesar la transacción' });
    }
};
