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


    if (user.telegramUserId && user.telegramUserId != 0) {
      console.log(`[checkQuest] Verificando en Telegram channel con ID: ${user.telegramUserId}`);
      const telegramChannelCheck = await isUserInTelegramChannel(user.telegramUserId);
      console.log(`[checkQuest] Resultado de Telegram Channel Check: ${telegramChannelCheck}`);

      console.log(`[checkQuest] Verificando en Telegram group con ID: ${user.telegramUserId}`);
      const telegramGroupCheck = await isUserInTelegramGroup(user.telegramUserId);
      console.log(`[checkQuest] Resultado de Telegram Group Check: ${telegramGroupCheck}`);

      user.followTelegram = telegramChannelCheck;
      user.joinTelegramGroup = telegramGroupCheck;
    }

    if (user.discordId && user.discordId != 0) {
      console.log(`[checkQuest] Verificando en Discord con ID: ${user.discordId}`);
      const discordCheck = await isUserInDiscordChannel(user.discordId);
      console.log(`[checkQuest] Resultado de Discord Check: ${discordCheck}`);

      user.joinDiscordChannel = discordCheck;
    }

    console.log(`[checkQuest] Actualizando el estado del usuario en base a las verificaciones`);

    const referredByUser = await User.findOne({ ownedReferralTicket: user.referralTicket });

    // UPDATING HERETICSCONVERTEDPOINTS OF REFERRAL

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

    // UPDATING QUEST COMPLETE STATE

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
      followTelegram: user.followTelegram,
      joinTelegramGroup: user.joinTelegramGroup,
      joinDiscordChannel: user.joinDiscordChannel,
      heriticsConverted: user.heriticsConverted,
      questsCompleted: user.questsCompleted
    };
  } catch (err) {
    console.error('[checkQuest] Error al verificar quest:', err);
    return { error: 'Error al verificar quest' };
  }
};
