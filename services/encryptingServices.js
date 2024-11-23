import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const algorithm = 'aes-256-cbc';
const encryptionKey = process.env.ENCRYPTION_KEY;

export const encryptPrivateKey = (privateKey) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(privateKey, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptPrivateKey = (encryptedData) => {
    const [ivHex, encrypted] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};
