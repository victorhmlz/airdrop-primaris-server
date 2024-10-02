import User from '../models/User.js';
import { isUserInTelegramGroup, isUserInTelegramChannel } from '../services/telegramServices.js';
import { isUserInDiscordChannel } from '../services/discordServices.js';

export const checkQuest = async (telegramUserName) => {
  try {
    console.log(`[checkQuest] Iniciando verificación de quest para: ${telegramUserName}`);
    
    const user = await User.findOne({ telegramUserName });
    
    if (!user) {
      console.log(`[checkQuest] Usuario no encontrado: ${telegramUserName}`);
      return { error: 'Usuario no encontrado' };
    }

    console.log(`[checkQuest] Usuario encontrado: ${user.telegramUserName}`);

    if (!user.telegramUserId || user.telegramUserId == 0) {
      console.log(`[checkQuest] El telegramUserId no es válido (${user.telegramUserId}). Esperando a que el usuario valide su cuenta.`);
      return {
        questsCompleted: false,
        message: 'Falta validar la cuenta de Telegram',
        followTelegram: false,
        joinTelegramGroup: false,
        joinDiscordChannel: false,
        heriticsConverted: user.heriticsConverted
      };
    }

    console.log(`[checkQuest] Verificando en Telegram channel con ID: ${user.telegramUserId}`);
    const telegramChannelCheck = await isUserInTelegramChannel(user.telegramUserId);
    console.log(`[checkQuest] Resultado de Telegram Channel Check: ${telegramChannelCheck}`);

    console.log(`[checkQuest] Verificando en Telegram group con ID: ${user.telegramUserId}`);
    const telegramGroupCheck = await isUserInTelegramGroup(user.telegramUserId);
    console.log(`[checkQuest] Resultado de Telegram Group Check: ${telegramGroupCheck}`);

    console.log(`[checkQuest] Verificando en Discord con ID: ${user.discordId}`);
    const discordCheck = await isUserInDiscordChannel(user.discordId);
    console.log(`[checkQuest] Resultado de Discord Check: ${discordCheck}`);

    console.log(`[checkQuest] Actualizando el estado del usuario en base a las verificaciones`);

    user.followTelegram = telegramChannelCheck;
    user.joinTelegramGroup = telegramGroupCheck;
    user.joinDiscordChannel = discordCheck;

    const referredByUser = await User.findOne({ ownedReferralTicket: user.referralTicket });

    if (user.followTelegram &&
        user.joinTelegramGroup &&
        user.joinDiscordChannel &&
        !user.referredPoint &&
        referredByUser.heriticsConverted < 10) {

      referredByUser.heriticsConverted += 1;
      user.referredPoint = true;
      
      await referredByUser.save();
      await user.save();
    }

    if (user.followTelegram &&
        user.joinTelegramGroup &&
        user.joinDiscordChannel &&
        user.heriticsConverted >= 2) {
      user.questsCompleted = true;
    }

    console.log(user.questsCompleted ? `[checkQuest] Quest completada!!` : `[checkQuest] Continúa con la quest!!`);
  
    await user.save();
    console.log(`[checkQuest] Estado del usuario guardado correctamente`);

    return {
      followTelegram: telegramChannelCheck,
      joinTelegramGroup: telegramGroupCheck,
      joinDiscordChannel: discordCheck,
      heriticsConverted: user.heriticsConverted,
      questsCompleted: user.questsCompleted
    };
  } catch (err) {
    console.error('[checkQuest] Error al verificar quest:', err);
    return { error: 'Error al verificar quest' };
  }
};
