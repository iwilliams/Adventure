import patch                from 'immutablepatch';
import * as MessageTypes    from '../shared/constants/MessageConstants';
import StoreFactory         from '../shared/services/StoreFactory';
import * as GameConstants   from '../shared/constants/GameConstants';
import * as StoreConstants  from '../shared/constants/StoreConstants';
import Immutable            from 'immutable';
import THREE                from 'three';

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


var scene, camera, renderer, mouseX, mouseY;
var tiles = [];

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var tileSize = GameConstants.TILE_SIZE;
init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 500;

    // Setup tiles
    for(let i = 0; i < GameConstants.GAME_WIDTH; i++) {
        tiles[i] = [];
        for(let j = 0; j < GameConstants.GAME_HEIGHT; j++) {

            let geometry = new THREE.BoxGeometry(tileSize, tileSize, tileSize);

            let material = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                wireframe: true
            });

            let mesh = new THREE.Mesh( geometry, material );
            mesh.position.setX((i*tileSize) - window.innerWidth/4);
            mesh.position.setZ((-j*tileSize) + window.innerHeight/4);
            scene.add( mesh );

            tiles[i].push(mesh);
        }
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.addEventListener( 'mousemove', (event) => {
        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );
    }, false );

    document.body.appendChild( renderer.domElement );

}

window.tiles = tiles;

var dir;

function animate() {

    requestAnimationFrame( animate );

    // Reset Tile colors
    tiles.forEach(row => {
        row.forEach(tile => {
            tile.material.color.setHex(0xcccccc);
            tile.material.wireframe = true;
        });
    })

    let floorStore = StoreFactory.getByType(StoreConstants.FLOOR_STORE)[0];
    // Draw Dot
    if(floorStore) {
        let floorState = floorStore.getState();
        let dotX = floorState.get('dotX');
        let dotY = floorState.get('dotY');
        tiles[dotX][dotY].material.color.setHex(0xff00ff);
        tiles[dotX][dotY].material.wireframe = false;
    }

    var x, y, size;

    let playerStores = StoreFactory.getByType(StoreConstants.PLAYER_STORE);
    // If there is a player store lets draw it
    if(playerStores) {
        playerStores.forEach(playerStore => {
            let playerState = playerStore.getState();

            x = playerState.get('xPos');
            y = playerState.get('yPos');
            dir = playerState.get('dir');

            if(x < GameConstants.GAME_WIDTH &&
                    y < GameConstants.GAME_HEIGHT &&
                    x > -1 &&
                    y > -1) {
                tiles[x][y].material.color.setHex(0x0000ff);
                tiles[x][y].material.wireframe = false;
            }

            // Draw Tail
            let tail = playerState.get('tail');
            size = tail.size;
            for(let i = 0; i < tail.size; i++) {
                let tailX = tail.getIn([i, 0]);
                let tailY = tail.getIn([i, 1]);
                tiles[tailX][tailY].material.color.setHex(0x0000ff);
                tiles[tailX][tailY].material.wireframe = false;
            }
        });
    }

    //camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    //camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
    if(x < GameConstants.GAME_WIDTH &&
            y < GameConstants.GAME_HEIGHT &&
            x > -1 &&
            y > -1) {
        camera.position.x = tiles[x][y].position.x;
        camera.position.z = tiles[x][y].position.z;

        let offset = 4*tileSize;

        camera.position.y = tiles[x][y].position.y + 2*offset;

        let cameraPos = new THREE.Vector3( 0, 0, 0 );
        cameraPos.copy(tiles[x][y].position);

        switch(dir) {
            case 'n':
                camera.position.z -= 5*offset;
                cameraPos.copy(tiles[x][0].position);
                break;
            case 'e':
                camera.position.x -= 5*offset;
                cameraPos.copy(tiles[39][y].position);
                break;
            case 's':
                camera.position.z += 5*offset;
                cameraPos.copy(tiles[x][39].position);
                break;
            case 'w':
                camera.position.x += 5*offset;
                cameraPos.copy(tiles[0][y].position);
                break;
        }

        cameraPos.y += 2*offset;


        camera.lookAt(cameraPos);
    }

    renderer.render( scene, camera );
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
            window.changeDir('l');
            break;
        case 83:
        case 74:
        case 40:
            window.changeDir('d');
            break;
        case 87:
        case 75:
        case 38:
            window.changeDir('u');
            break;
        case 68:
        case 76:
        case 39:
            window.changeDir('r');
            break;
    }
}
window.changeDir = function(button) {
    let toMove;

    switch(button) {
        case 'l':
            switch(dir) {
                case 'e':
                    toMove = 's';
                    break;
                case 's':
                    toMove = 'w';
                    break;
                case 'w':
                    toMove = 'n';
                    break;
                case 'n':
                    toMove = 'e';
                    break;
            }
            break;
        case 'r':
            switch(dir) {
                case 'e':
                    toMove = 'n';
                    break;
                case 's':
                    toMove = 'e';
                    break;
                case 'w':
                    toMove = 's';
                    break;
                case 'n':
                    toMove = 'w';
                    break;
            }
            break;
    }

    dir = toMove;
    worker.postMessage([MessageTypes.PLAYER_INPUT, toMove]);
}
