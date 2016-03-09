/**
 * Decide wether we are a client or server
 */
let is_server;

if(self.document === undefined) {
    is_server = true;
} else {
    is_server = false;
}
export const IS_SERVER = is_server;

/**
 * Misc game configurations
 */
export const SIMULATION_FPS = 30;
export const GAME_WIDTH     = 40;
export const GAME_HEIGHT    = 40;
export const TILE_SIZE      = 256;
