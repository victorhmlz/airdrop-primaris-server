import axios from 'axios';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAF34vwEAAAAA4ZZ27uVRyCml6KcBXfI5Sgm7SPw%3DHKao2KMQMcmPUHokRaNVACoRi9K8w0yt6b60oknC4GgLZAMgtZ'; // Reemplaza con tu Bearer Token válido
const TWITTER_API_URL = 'https://api.twitter.com/2';
const TARGET_USER_ID = '1814070219536760832'; // El ID de la cuenta que quieres verificar si es seguida.

// Función para obtener el ID del usuario a partir del nombre de usuario.
export const getUserIdByUsername = async (username) => {
  try {
    const response = await axios.get(`${TWITTER_API_URL}/users/by/username/${username}`, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });

    // Verifica si el usuario existe.
    if (response.data && response.data.data && response.data.data.id) {
      return response.data.data.id;
    } else {
      throw new Error('No se pudo encontrar el usuario.');
    }
  } catch (error) {
    console.error('Error obteniendo ID del usuario de Twitter:', error);
    throw new Error('No se pudo obtener el ID del usuario de Twitter');
  }
};

// Función para verificar si el usuario sigue a otro.
export const isUserFollowingOnTwitter = async (username) => {
  const userId = await getUserIdByUsername(username);
  let nextToken = null;
  const maxResults = 1000; // Máximo permitido por la API

  try {
    while (true) {
      // Construir la URL con el token de paginación si existe
      const url = new URL(`${TWITTER_API_URL}/users/${userId}/following`);
      const params = { max_results: maxResults };
      if (nextToken) {
        params.pagination_token = nextToken;
      }
      url.search = new URLSearchParams(params).toString();

      // Hacer la solicitud
      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`, // Autenticación con Bearer Token
        },
      });

      const followedUsers = response.data.data;

      // Verifica si el TARGET_USER_ID está en la lista de seguidos.
      const isFollowing = followedUsers.some(user => user.id === TARGET_USER_ID);
      if (isFollowing) {
        return true; // El usuario sigue a la cuenta objetivo
      }

      // Verifica si hay más páginas
      nextToken = response.data.meta?.next_token;
      if (!nextToken) {
        break; // No hay más páginas
      }
    }

    return false; // Si recorrió todas las páginas y no encontró al usuario
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // El usuario no sigue a la cuenta objetivo (404 Not Found)
    }
    console.error('Error verificando si el usuario sigue la cuenta en Twitter:', error);
    throw new Error('Error verificando si el usuario sigue la cuenta en Twitter');
  }
};



