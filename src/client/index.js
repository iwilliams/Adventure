import patch                from 'immutablepatch';
import * as MessageTypes    from '../shared/constants/MessageConstants';
import MainLoop             from '../shared/mainloop';
import StoreFactory         from '../shared/services/StoreFactory';
import * as GameConstants   from '../shared/constants/GameConstants';
import * as StoreConstants  from '../shared/constants/StoreConstants';
import Immutable            from 'immutable';

/**
 * Set up server
 */
let worker = new Worker('./server/index.js');
window.worker = worker;
worker.onmessage = function(e) {
    let data         = e.data;
    let messageType  = data.shift();
    let payload      = data;

    // MessageType constants make this a bit more clear
    switch(messageType) {
        case MessageTypes.CREATE_STORE:
            createStore(payload);
            break;
        case MessageTypes.PATCH_STORE:
            patchStore(payload);
            break;
    }
}





/**
 * Append canvas to body
 */
let tileSize = GameConstants.TILE_SIZE;
let canvas = document.createElement('canvas');
canvas.width = GameConstants.GAME_WIDTH * tileSize;
canvas.height = GameConstants.GAME_HEIGHT * tileSize;
let ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

/**
 * Set Up Render Game
 */
function render(frame) {
    ctx.fillStyle = "gray";

    // Draw all tiles
    for(let y = 0; y < GameConstants.GAME_WIDTH; y++) {
        for(let x = 0; x < GameConstants.GAME_HEIGHT; x++) {
            ctx.fillRect(...[
                tileSize*x,
                tileSize*y,
                tileSize,
                tileSize
            ]);
        }
    }

    // Draw Dot
    if(floorStore) {
        let floorState = floorStore.getState();
        ctx.fillStyle = "purple";
        ctx.fillRect(...[
            tileSize*floorState.get('dotX'),
            tileSize*floorState.get('dotY'),
            tileSize,
            tileSize
        ]);
    }

    // If there is a player store lets draw it
    if(playerStore) {
        let playerState = playerStore.getState();

        ctx.fillStyle = "lightblue";
        ctx.fillRect(...[
            playerState.get('xPos')*tileSize,
            playerState.get('yPos')*tileSize,
            tileSize,
            tileSize
        ]);

        let tail = playerState.get('tail');
        for(let i = 0; i < tail.size; i++) {
            ctx.fillRect(...[
                tail.getIn([i, 0])*tileSize,
                tail.getIn([i, 1])*tileSize,
                tileSize,
                tileSize
            ]);
        }
    }
}
MainLoop.setSimulationFPS(60);
MainLoop.setUpdate().setDraw(render).start();





/**
 * Create Stores
 */
let gameStore;
let playerStore;
let floorStore;

function createStore(payload) {
    let storeType   = payload[0];
    let storeId     = payload[1];
    let state       = Immutable.fromJS(JSON.parse(payload[2]));

    let newStore = StoreFactory.create(storeType, storeId, state);

    // Set the store class based on type
    switch(storeType) {
        case StoreConstants.GAME_STORE:
            gameStore = newStore;
            break;
        case StoreConstants.PLAYER_STORE:
            playerStore = newStore;
            window.playerStore = playerStore;
            break;
        case StoreConstants.FLOOR_STORE:
            floorStore = newStore;
            break;
    }
}




/**
 * Patch Stores
 */
function patchStore(payload) {
    let storeId = payload[0];
    let patch   = Immutable.fromJS(JSON.parse(payload[1]));

    let toPatch = StoreFactory.lookup(storeId);
    toPatch.patchState(patch);
}





/**
 * Change player dir
 */
window.onkeydown = function(e) {
    switch(e.keyCode) {
        case 72:
            window.changeDir('w');
            break;
        case 74:
            window.changeDir('s');
            break;
        case 75:
            window.changeDir('n');
            break;
        case 76:
            window.changeDir('e');
            break;
    }
}
window.changeDir = function(dir) {
    worker.postMessage([MessageTypes.PLAYER_INPUT, dir]);
}
