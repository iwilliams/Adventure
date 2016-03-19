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
export const TILE_SIZE      = 10;

/**
 * Cardinal directions
 */
export const DIR_NORTH     = 0;
export const DIR_EAST      = 1;
export const DIR_SOUTH     = 2;
export const DIR_WEST      = 3;
