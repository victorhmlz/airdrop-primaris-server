import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const groupId = '-1002258394816';
const channelId = '-1002168681704';

export const isUserInTelegramGroup = async (telegramUserId) => {

  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getChatMember`, {
      params: {
        chat_id: groupId,
        user_id: telegramUserId,
      },
    });
    const { status } = response.data.result;
    return status === 'member' || status === 'administrator' || status === 'creator';
  } catch (error) {
    console.error('Error verificando usuario en Telegram:', error);
    return false;
  }
};

export const isUserInTelegramChannel = async (telegramUserId) => {

  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getChatMember`, {
      params: {
        chat_id: channelId,
        user_id: telegramUserId,
      },
    });
    const { status } = response.data.result;
    return status === 'member' || status === 'administrator' || status === 'creator';
  } catch (error) {
    console.error('Error verificando usuario en Telegram:', error);
    return false;
  }
};
