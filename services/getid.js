import axios from 'axios';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAF34vwEAAAAA%2BYlFpon29C5EMMfOU13f%2BcGinIo%3D3qqOphYlOoih02Vj99r513coWh1h1aPW4RVLvZyJ2qjvZPnBzc'; // Coloca aquí tu Bearer Token
const TWITTER_API_URL = 'https://api.twitter.com/2';

const getUserIdByUsername = async (username) => {
  try {
    const response = await axios.get(
      `${TWITTER_API_URL}/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );
    const { data } = response.data;
    console.log(`El ID numérico de la cuenta @${username} es:`, data.id);
    return data.id; // Devuelve el ID numérico de la cuenta de Twitter
  } catch (error) {
    console.error('Error obteniendo el ID del usuario de Twitter:', error);
    return null;
  }
};

// Llamada a la función para obtener el ID de tu cuenta
const obtenerMiIdDeTwitter = async () => {
  const username = 'metaversalwar'; // Coloca aquí tu nombre de usuario sin el @
  const userId = await getUserIdByUsername(username);
  console.log('ID de Twitter obtenido:', userId);
};

obtenerMiIdDeTwitter();
