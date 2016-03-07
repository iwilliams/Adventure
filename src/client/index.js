import patch                from 'immutablepatch';
import * as MessageTypes    from '../shared/constants/MessageConstants';
import StoreFactory         from '../shared/services/StoreFactory';
import * as GameConstants   from '../shared/constants/GameConstants';
import * as StoreConstants  from '../shared/constants/StoreConstants';
import Immutable            from 'immutable';
//import THREE                from 'three';
import THREE    from './TrackballControls.js';

window.THREE = THREE;

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

var tileSize = GameConstants.TILE_SIZE;

var controls;
function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 500;
    camera.position.y = 100;
    camera.position.x = 0;

    controls = new THREE.TrackballControls( camera );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];

    //controls.addEventListener( 'change', render );

    let roomSize = 10;
    for(let y = 0; y < roomSize; y++) {
        for(let x = 0; x < roomSize; x++) {
            for(let z = 0; z < roomSize; z++) {
                if(y < 1) {
                    // Draw Floor
                    let box = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
                    let material = new THREE.MeshBasicMaterial({
                        color: 0x333333
                    });
                    let mesh = new THREE.Mesh(box, material);
                    mesh.position.setY(y*tileSize);
                    mesh.position.setX((roomSize*tileSize/2) - (x*tileSize));
                    mesh.position.setZ(z*tileSize);
                    scene.add(mesh);
                } else if (y === roomSize-1) {
                    // Draw Cieling
                    let box = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
                    let material = new THREE.MeshBasicMaterial({
                        color: 0x330033
                    });
                    let mesh = new THREE.Mesh(box, material);
                    mesh.position.setY(y*tileSize);
                    mesh.position.setX((roomSize*tileSize/2) - (x*tileSize));
                    mesh.position.setZ(z*tileSize);
                    scene.add(mesh);
                } else if (x === 0 && (y > 3 || z !== roomSize/2-1 && z !== roomSize/2)) {
                    // Draw right wall
                    let box = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
                    let material = new THREE.MeshBasicMaterial({
                        color: 0x3300000
                    });
                    let mesh = new THREE.Mesh(box, material);
                    mesh.position.setY(y*tileSize);
                    mesh.position.setX((roomSize*tileSize/2) - (x*tileSize));
                    mesh.position.setZ(z*tileSize);
                    scene.add(mesh);
                } else if (z === 0 && (y > 3 || x !== roomSize/2-1 && x !== roomSize/2)) {
                    // Draw back wall
                    let box = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
                    let material = new THREE.MeshBasicMaterial({
                        color: 0x003300
                    });
                    let mesh = new THREE.Mesh(box, material);
                    mesh.position.setY(y*tileSize);
                    mesh.position.setX((roomSize*tileSize/2) - (x*tileSize));
                    mesh.position.setZ(z*tileSize);
                    scene.add(mesh);
                } else if (x === roomSize-1 && (y > 3 || z !== roomSize/2-1 && z !== roomSize/2)) {
                    // Draw left wall
                    let box = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
                    let material = new THREE.MeshBasicMaterial({
                        color: 0x333300
                    });
                    let mesh = new THREE.Mesh(box, material);
                    mesh.position.setY(y*tileSize);
                    mesh.position.setX((roomSize*tileSize/2) - (x*tileSize));
                    mesh.position.setZ(z*tileSize);
                    scene.add(mesh);
                }
            }
        }
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.onresize = e => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        controls.handleResize();
    }

    document.body.appendChild( renderer.domElement );
}

window.tiles = tiles;

function animate() {
    controls.update()
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

init();
animate();

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
//window.onkeydown = function(e) {
    //switch(e.keyCode) {
        //case 65:
        //case 72:
        //case 37:
            //window.changeDir('l');
            //break;
        //case 83:
        //case 74:
        //case 40:
            //window.changeDir('d');
            //break;
        //case 87:
        //case 75:
        //case 38:
            //window.changeDir('u');
            //break;
        //case 68:
        //case 76:
        //case 39:
            //window.changeDir('r');
            //break;
    //}
//}
//window.changeDir = function(button) {
    //let toMove;

    //switch(button) {
        //case 'l':
            //switch(dir) {
                //case 'e':
                    //toMove = 's';
                    //break;
                //case 's':
                    //toMove = 'w';
                    //break;
                //case 'w':
                    //toMove = 'n';
                    //break;
                //case 'n':
                    //toMove = 'e';
                    //break;
            //}
            //break;
        //case 'r':
            //switch(dir) {
                //case 'e':
                    //toMove = 'n';
                    //break;
                //case 's':
                    //toMove = 'e';
                    //break;
                //case 'w':
                    //toMove = 's';
                    //break;
                //case 'n':
                    //toMove = 'w';
                    //break;
            //}
            //break;
    //}

    //if(toMove) {
        //dir = toMove;
        //worker.postMessage([MessageTypes.PLAYER_INPUT, toMove]);
    //}
//}
