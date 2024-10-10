import { ethers } from 'ethers';
import { decryptPrivateKey } from '../services/encryptingServices.js';
import { readFile } from 'fs/promises';
import Wallet from '../models/Wallet.js';

let primarisAbi;
try {
  primarisAbi = JSON.parse(
    await readFile(new URL('../abi/primarisAbi.json', import.meta.url))
  );
} catch (error) {
  console.error(`[ERROR] Error al leer el ABI del contrato: ${error.message}`);
  throw new Error('No se pudo leer el ABI del contrato');
}

const primarisTokenAddress = process.env.PRIMARIS_TOKEN_ADDRESS;
const infuraProjectId = process.env.INFURA_PROJECT_ID;

// Estimate gas
export const estimateGasForTransaction = async (req, res) => {
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
    try {
      const decryptedPrivateKey = decryptPrivateKey(userWallet.privateKey);
      console.log(`[INFO] Clave privada descifrada exitosamente para el usuario: ${telegramUserName}`);

      // Verificar que infuraProjectId y primarisTokenAddress estén configurados correctamente
      if (!infuraProjectId) {
        console.error(`[ERROR] El ID del proyecto Infura no está configurado.`);
        return res.status(500).json({ error: 'Configuración de Infura inválida' });
      }
      if (!primarisTokenAddress) {
        console.error(`[ERROR] La dirección del contrato PRIMARIS_TOKEN_ADDRESS no está configurada.`);
        return res.status(500).json({ error: 'La dirección del contrato no es válida' });
      }

      // Set up the provider and wallet
      const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${infuraProjectId}`);
      console.log(`[INFO] Proveedor configurado con Infura para Polygon Mainnet`);

      const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
      console.log(`[INFO] Wallet creado para el usuario con dirección: ${wallet.address}`);
      
      // Validar que el ABI no sea null o undefined
      if (!primarisAbi) {
        console.error(`[ERROR] El ABI del contrato es inválido.`);
        return res.status(500).json({ error: 'El ABI del contrato no es válido' });
      }

      // Connect the contract with the wallet (signer)
      const contract = new ethers.Contract(primarisTokenAddress, primarisAbi, wallet);
      console.log(`[INFO] Contrato conectado en la dirección: ${primarisTokenAddress}`);

      // Imprimir los métodos disponibles en el contrato (directamente accesibles en v6)
      console.log(`[INFO] Métodos disponibles en el contrato: ${Object.keys(contract).join(', ')}`);

      // Validar que el método transfer exista en el contrato (ahora se accede directamente)
      if (typeof contract.transfer !== 'function') {
        console.error(`[ERROR] El método 'transfer' no existe en el contrato con la dirección: ${primarisTokenAddress}`);
        return res.status(500).json({ error: 'Método transfer no disponible en el contrato' });
      }
      console.log(`[INFO] Método 'transfer' encontrado en el contrato`);

      // Estimar el gas para la transacción de 'transfer' usando ethers v6
      try {
        const estimatedGas = await contract.transfer.estimateGas( 
          recipientAddress,
          ethers.parseUnits(amount, 18)
        );
        console.log(`[INFO] Estimación de gas obtenida: ${estimatedGas.toString()}`);

        // Obtener el precio del gas
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

export const signAndSendTransaction = async (req, res) => {
    try {
        const { telegramUserName, recipientAddress, amount } = req.body;

        const walletData = await Wallet.findOne({ telegramUserName });

        if (!walletData) {
            return res.status(404).json({ error: 'Wallet no encontrada para este usuario' });
        }
        
        const decryptedPrivateKey = decryptPrivateKey(walletData.privateKey);
        const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${infuraProjectId}`);
        const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
        const contract = new ethers.Contract(primarisTokenAddress, primarisAbi, wallet);

        // Preparar y enviar la transacción
        const tx = await contract.transfer(recipientAddress, ethers.parseUnits(amount, 18));
        const feeData = await provider.getFeeData();
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        const maxFeePerGas = feeData.maxFeePerGas;
        const gasLimit = await contract.transfer.estimateGas( 
            recipientAddress,
            ethers.parseUnits(amount, 18)
          );

        const signedTx = await wallet.sendTransaction({
            ...tx,
            maxPriorityFeePerGas,
            maxFeePerGas,
            gasLimit
        });

        const receipt = await signedTx.wait();
        
        res.status(200).json({ message: 'Transacción enviada con éxito', txHash: receipt.transactionHash });
    } catch (error) {
        console.error('Error al firmar/enviar la transacción:', error);
        res.status(500).json({ error: 'Error al procesar la transacción' });
    }
};