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
        case MessageTypes.INITIALIZE:
            init();
            break;
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
window.tiles = tiles;

var tileSize = GameConstants.TILE_SIZE;

var controls;
function init() {

    scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x002211, 0.0020);

    camera = new THREE.PerspectiveCamera(...[
            75,
            window.innerWidth / window.innerHeight,
            1,
            10000
    ]);
    window.camera = camera;

    camera.position.z = 500;
    camera.position.y = 2*tileSize;
    camera.position.x = 0;

    let floorStore   = StoreFactory.getByType(StoreConstants.FLOOR_STORE)[0];
    let floorState   = floorStore.getState();
    let layout       = floorState.get('layout').toJS();

    var textureLoader = new THREE.TextureLoader();

    var texture1 = textureLoader.load("assets/floor_texture.png");
    var texture2 = textureLoader.load("assets/wall_texture.png");

    texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set(5,5);

    texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
    texture2.repeat.set(5,20);

    // LIGHTS
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 500, 0 );
    scene.add( hemiLight );

    // Draw floor layout
    for(let z = 0; z < layout.length; z++) {
        tiles[z] = []
        for(let x = 0; x < layout.length; x++) {
            switch(layout[z][x]) {
                case 1:
                    var box = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
                    var material = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        map: texture1
                    });
                    break;
                case 2:
                    var box = new THREE.BoxGeometry(tileSize, 4*tileSize, tileSize);
                    var material = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        map: texture2
                    });
                    break;
            }

            let mesh = new THREE.Mesh(box, material);
            mesh.position.setY(0);
            mesh.position.setX(x*tileSize);
            mesh.position.setZ(z*tileSize);
            tiles[z].push(mesh);
            scene.add(mesh);

            mesh.receiveShadow = true;
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

    let playerStore  = StoreFactory.getByType(StoreConstants.PLAYER_STORE)[0];
    let playerState  = playerStore.getState();
    let x            = playerState.get('x');
    let y            = playerState.get('y');

    camera.position.x = tiles[y][x].position.x;
    camera.position.z = tiles[y][x].position.z;
    camera.position.y = tileSize;

    let v = new THREE.Vector3(...[
        camera.position.x + tileSize,
        camera.position.y,
        camera.position.z
    ]);

    camera.lookAt(v);

    animate();
}

function animate() {
    requestAnimationFrame( animate );

    let floorStore   = StoreFactory.getByType(StoreConstants.FLOOR_STORE)[0];
    let floorState   = floorStore.getState();

    let playerStore  = StoreFactory.getByType(StoreConstants.PLAYER_STORE)[0];
    let playerState  = playerStore.getState();
    let x            = playerState.get('x');
    let y            = playerState.get('y');

    camera.position.x = tiles[y][x].position.x;
    //camera.position.z = tiles[y][x].position.z;
    //camera.position.y = 100;

    // Get rid of camera twist
    //camera.rotation.set(camera.rotation.x, 0, camera.rotation.z, camera.rotation.order);

    //let v = new THREE.Vector3(...[
        //camera.position.x + tileSize,
        //camera.position.y,
        //camera.position.z
    //]);

    //camera.lookAt(v);

    renderer.render( scene, camera );
}

var lastX, lastY;
window.onmousemove = function(e) {
    //if(lastX && lastY) {
        //let dX = (lastX - e.clientX)*.05;
        //let dY = (lastY - e.clientY)*.05;

        //let rotation = window.camera.rotation;
        //window.camera.rotation.set(rotation.x + dY, rotation.y + dX, rotation.z, 'YXZ');
    //}
    //lastX = e.clientX;
    //lastY = e.clientY;
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
        // Left
        //case 65:
        //case 72:
        //case 37:
            //worker.postMessage([MessageTypes.PLAYER_INPUT, -1]);
            //break;
        case 83:
        case 74:
        case 40:
            worker.postMessage([MessageTypes.PLAYER_INPUT, -1]);
            break;
        case 87:
        case 75:
        case 38:
            worker.postMessage([MessageTypes.PLAYER_INPUT, 1]);
            break;
        // Right
        //case 68:
        //case 76:
        //case 39:
            //worker.postMessage([MessageTypes.PLAYER_INPUT, 1]);
            //break;
    }
}
