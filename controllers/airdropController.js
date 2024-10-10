// transactionController.js
import { ethers } from 'ethers';
import { decryptPrivateKey } from '../services/encryptingServices.js';
import { readFile } from 'fs/promises';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';

let airdropAbi;
try {
  airdropAbi = JSON.parse(
    await readFile(new URL('../abi/airdropAbi.json', import.meta.url))
  );
} catch (error) {
  console.error(`[ERROR] Error al leer el ABI del contrato: ${error.message}`);
  throw new Error('No se pudo leer el ABI del contrato');
}

const airdropAddress = process.env.AIRDROP_ADDRESS;
const infuraProjectId = process.env.INFURA_PROJECT_ID;

// Estimate gas
export const estimateGasForClaim = async (req, res) => {
  try {
    const { telegramUserName } = req.body;

    console.log(`[INFO] Iniciando estimación de gas para el usuario: ${telegramUserName}`);

    // Fethc user's quest data

    const userQuest = await User.findOne({ telegramUserName });
    if (!userQuest) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const telegramID = Number(userQuest.telegramUserId);
      const followTelegram = userQuest.followTelegram;
      const joinTelegramGroup = userQuest.joinTelegramGroup;
      const joinDiscordChannel = userQuest.joinDiscordChannel;
      const heriticsConverted = Number(userQuest.heriticsConverted);
      const questsCompleted = userQuest.questsCompleted;

    // Fetch the user's wallet from the database
    const userWallet = await Wallet.findOne({ telegramUserName });
    if (!userWallet) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    try {
      const decryptedPrivateKey = decryptPrivateKey(userWallet.privateKey);

      if (!infuraProjectId) {
        return res.status(500).json({ error: 'Configuración de Infura inválida' });
      }
      if (!airdropAddress) {
        return res.status(500).json({ error: 'La dirección del contrato no es válida' });
      }

      // Seting up the provider and wallet
      const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${infuraProjectId}`);
      const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
   
      
      if (!airdropAbi) {
        return res.status(500).json({ error: 'El ABI del contrato no es válido' });
      }

      // Connect the contract with the wallet (signer)
      const contract = new ethers.Contract(airdropAddress, airdropAbi, wallet);

      if (typeof contract.claimTokens !== 'function') {
        console.error(`[ERROR] El método 'claimTokens' no existe en el contrato con la dirección: ${airdropAddress}`);
        return res.status(500).json({ error: 'Método transfer no disponible en el contrato' });
      }

      try {
        const estimatedGas = await contract.claimTokens.estimateGas( 
            telegramID,
            followTelegram,
            joinTelegramGroup,
            joinDiscordChannel,
            heriticsConverted,
            questsCompleted,
        );
        console.log(`[INFO] Estimación de gas obtenida: ${estimatedGas.toString()}`);

        const feeData = await provider.getFeeData();
        console.log(`[INFO] Datos de la tarifa de gas obtenidos: ${JSON.stringify(feeData)}`);

        const gasPrice = feeData.gasPrice; // Valor por defecto si gasPrice es null
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
    } catch (decryptError) {
      console.error(`[ERROR] Error al descifrar la clave privada: ${decryptError.message}`);
      return res.status(500).json({ error: 'Error al descifrar la clave privada' });
    }
  } catch (error) {
    console.error(`[ERROR] Error general en la estimación de gas: ${error.message}`);
    res.status(500).json({ error: 'Error on gas estimation' });
  }
};

// Sign and send

export const signAndClaimReward = async (req, res) => {
    try {
        const { telegramUserName } = req.body;

            // Fethc user's quest data

        const userQuest = await User.findOne({ telegramUserName });

        if (!userQuest) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const telegramID = Number(userQuest.telegramUserId);
        const followTelegram = userQuest.followTelegram;
        const joinTelegramGroup = userQuest.joinTelegramGroup;
        const joinDiscordChannel = userQuest.joinDiscordChannel;
        const heriticsConverted = Number(userQuest.heriticsConverted);
        const questsCompleted = userQuest.questsCompleted;

        const walletData = await Wallet.findOne({ telegramUserName });

        if (!walletData) {
            return res.status(404).json({ error: 'Wallet no encontrada para este usuario' });
        }
        
        const decryptedPrivateKey = decryptPrivateKey(walletData.privateKey);
        const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${infuraProjectId}`);
        const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
        const contract = new ethers.Contract(airdropAddress, airdropAbi, wallet);

        const tx = await contract.claimTokens(
            telegramID,
            followTelegram,
            joinTelegramGroup,
            joinDiscordChannel,
            heriticsConverted,
            questsCompleted,
        );
        const feeData = await provider.getFeeData();
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        const maxFeePerGas = feeData.maxFeePerGas;
        const gasLimit = await contract.claimTokens.estimateGas( 
            telegramID,
            followTelegram,
            joinTelegramGroup,
            joinDiscordChannel,
            heriticsConverted,
            questsCompleted,
          );

        const signedTx = await wallet.sendTransaction({
            ...tx,
            maxPriorityFeePerGas,
            maxFeePerGas,
            gasLimit
        });

        const receipt = await signedTx.wait();
        
      res.status(200).json({ success: true, message: 'Transacción enviada con éxito', txHash: receipt.transactionHash });
    } catch (contractError) {
        // Verifica si hay un mensaje de error específico del contrato
        const errorMessage = contractError?.error?.message || contractError?.reason || contractError?.data?.message;

        if (errorMessage) {
            console.error('Error del contrato:', errorMessage);
            return res.status(400).json({ success: false, error: errorMessage });
        } else {
            console.error('Error desconocido del contrato:', contractError);
            return res.status(400).json({ success: false, error: 'Error al ejecutar la transacción en el contrato.' });
        }
    }
};