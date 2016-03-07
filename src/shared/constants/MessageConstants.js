let constIterator = 0;

/**
 * System messages
 */
export const INITIALIZE         = constIterator++;

/**
 * Client messages
 */
export const CLIENT_CONNECT     = constIterator++;
export const CLIENT_DISCONNECT  = constIterator++;

/**
 * Store messages
 */
export const CREATE_STORE       = constIterator++;
export const PATCH_STORE        = constIterator++;

/**
 * Player messages
 */
export const PLAYER_INPUT        = constIterator++;
