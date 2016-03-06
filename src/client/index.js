import patch                from 'immutablepatch';
import * as MessageTypes    from '../shared/constants/MessageConstants';
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
//let tileSize = 1;

// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
let renderer = new PIXI.autoDetectRenderer(...[
    GameConstants.GAME_WIDTH * tileSize,
    GameConstants.GAME_HEIGHT * tileSize
]);

// Debug
window.renderer = renderer;

// The renderer will create a canvas element for you that you can then insert into the DOM.
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();
var graphics = new PIXI.Graphics();
stage.addChild(graphics);
animate();

function animate() {
    graphics.clear();

    // set a fill
    graphics.beginFill(0xCCCCCC);
    graphics.drawRect(0, 0, 1000, 1000);

    let floorStore = StoreFactory.getByType(StoreConstants.FLOOR_STORE)[0];
    // Draw Dot
    if(floorStore) {
        let floorState = floorStore.getState();
        graphics.beginFill(0xFF00FF);
        graphics.drawRect(...[
            tileSize*floorState.get('dotX'),
            tileSize*floorState.get('dotY'),
            tileSize,
            tileSize
        ]);
    }

    let playerStores = StoreFactory.getByType(StoreConstants.PLAYER_STORE);
    // If there is a player store lets draw it
    if(playerStores) {
        playerStores.forEach(playerStore => {
            let playerState = playerStore.getState();

            graphics.beginFill(0x0000FF);
            graphics.drawRect(...[
                playerState.get('xPos')*tileSize,
                playerState.get('yPos')*tileSize,
                tileSize,
                tileSize
            ]);

            graphics.beginFill(0x00FF00);
            switch(playerState.get('dir')) {
                case 's':
                    graphics.drawRect(...[
                        (playerState.get('xPos')+1)*tileSize,
                        playerState.get('yPos')*tileSize,
                        tileSize,
                        tileSize
                    ]);
                    break;
                case 'n':
                    graphics.drawRect(...[
                        (playerState.get('xPos')-1)*tileSize,
                        playerState.get('yPos')*tileSize,
                        tileSize,
                        tileSize
                    ]);
                    break;
                case 'e':
                    graphics.drawRect(...[
                        playerState.get('xPos')*tileSize,
                        (playerState.get('yPos')-1)*tileSize,
                        tileSize,
                        tileSize
                    ]);
                    break;
                case 'w':
                    graphics.drawRect(...[
                        playerState.get('xPos')*tileSize,
                        (playerState.get('yPos')+1)*tileSize,
                        tileSize,
                        tileSize
                    ]);
                    break;
            }

            graphics.beginFill(0x0000FF);
            let tail = playerState.get('tail');
            for(let i = 0; i < tail.size; i++) {
            graphics.drawRect(...[
                    tail.getIn([i, 0])*tileSize,
                    tail.getIn([i, 1])*tileSize,
                    tileSize,
                    tileSize
                ]);
            }
        });
    }

    renderer.render(stage);
    requestAnimationFrame( animate );
}




/**
 * Create Stores
 */
let gameStore;
let playerStore;
let floorStore;
window.StoreFactory = StoreFactory;

function createStore(payload) {
    let storeType   = payload[0];
    let storeId     = payload[1];
    let state       = Immutable.fromJS(JSON.parse(payload[2]));

    let newStore = StoreFactory.create(storeType, storeId, state);
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
        case 65:
        case 72:
        case 37:
            window.changeDir('w');
            break;
        case 83:
        case 74:
        case 40:
            window.changeDir('s');
            break;
        case 87:
        case 75:
        case 38:
            window.changeDir('n');
            break;
        case 68:
        case 76:
        case 39:
            window.changeDir('e');
            break;
    }
}
window.changeDir = function(dir) {
    worker.postMessage([MessageTypes.PLAYER_INPUT, dir]);
}
