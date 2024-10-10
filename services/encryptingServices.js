import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Definir una clave de cifrado simétrica y un IV
const algorithm = 'aes-256-cbc';
const encryptionKey = process.env.ENCRYPTION_KEY; // Debe ser de 32 bytes

// Función para encriptar la private key
export const encryptPrivateKey = (privateKey) => {
    const iv = crypto.randomBytes(16); // Vector de inicialización de 16 bytes
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(privateKey, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

// Función para desencriptar la private key
export const decryptPrivateKey = (encryptedData) => {
    const [ivHex, encrypted] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};
