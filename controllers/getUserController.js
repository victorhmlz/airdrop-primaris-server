import User from '../models/User.js';
import { checkQuest } from './questController.js';

export const getUserController = async (telegramUserName) => {
  try {
    console.log(`[getUserData] Buscando usuario: ${telegramUserName}`);

    await checkQuest(telegramUserName); 

    const user = await User.findOne({ telegramUserName });

    if (!user) {
      console.log(`[getUserData] Usuario no encontrado: ${telegramUserName}`);
      return { error: 'Usuario no encontrado' };
    }

    console.log(`[getUserData] Usuario encontrado: ${user.telegramUserName}`);

    return {
      telegramUserName: user.telegramUserName,
      telegramUserId: user.telegramUserId,
      ownedReferralTicket: user.ownedReferralTicket,
      heriticsConverted: user.heriticsConverted,
      followTelegram: user.followTelegram,
      joinTelegramGroup: user.joinTelegramGroup,
      joinDiscordChannel: user.joinDiscordChannel,
      airdropClaimed: user.airdropClaimed,
      questsCompleted: user.questsCompleted,
    };

  } catch (error) {
    console.error(`[getUserData] Error al obtener los datos del usuario: ${error.message}`);
    throw new Error('Error al obtener los datos del usuario');
  }
};

