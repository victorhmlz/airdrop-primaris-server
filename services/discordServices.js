// discordService.js
import axios from 'axios';

const DISCORD_BOT_TOKEN = 'MTI4NjgzODU0MjA2ODA4ODk0Mw.G1no-U.1hbJWjhkdY9TcRpdjSsF12ELUv_KQ896JaoU-Y';
const DISCORD_API_URL = 'https://discord.com/api';
const guildId = '1263634147138867302';

export const isUserInDiscordChannel = async (userDiscordId) => {
  try {
    const response = await axios.get(
      `${DISCORD_API_URL}/guilds/${guildId}/members/${userDiscordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );
    // Si el usuario está en el canal, el API de Discord devuelve un objeto con los datos del miembro
    if (response.data) {
      return true; // El usuario está en el canal
    }
    return false; // El usuario no está en el canal
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // El usuario no está en el canal (404 Not Found)
    }
    console.error('Error verificando usuario en Discord:', error);
    throw new Error('Error verificando usuario en Discord');
  }
};
