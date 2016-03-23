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

            // instantiate a loader
            var loader = new THREE.JSONLoader();

            // load a resource
            loader.load(
                // resource URL
                'assets/models/pot.json',
                // Function when resource is loaded
                function ( geometry, materials ) {
                    var material = new THREE.MultiMaterial( materials );
                    var object = new THREE.Mesh( geometry, material );
                    object.position.y = -tileSize - (tileSize/2);
                    object.position.x = 2*tileSize;
                    object.position.z = tileSize;
                    object.scale.set(2, 2, 2);
                    crate = object;
                    init();
                }
            );

            break;
        case MessageTypes.CREATE_STORE:
            createStore(payload);
            break;
        case MessageTypes.PATCH_STORE:
            patchStore(payload);
            break;
    }
}

var scene, camera, renderer, mouseX, mouseY, crate;

var tiles = [];
window.tiles = tiles;

var tileSize = GameConstants.TILE_SIZE;
var playerStore;

var controls;
function init() {

    scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x000A00, .06);

    camera = new THREE.PerspectiveCamera(...[
            60,
            window.innerWidth / window.innerHeight,
            1,
            10000
    ]);
    window.camera = camera;

    let floorStore   = StoreFactory.getByType(StoreConstants.FLOOR_STORE)[0];
    let floorState   = floorStore.getState();
    let layout       = floorState.get('layout').toJS();

    var textureLoader = new THREE.TextureLoader();

    var texture1 = textureLoader.load("assets/floor_texture.png");
    var texture2 = textureLoader.load("assets/wall_texture.png");

    texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set(5, 5);

    texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
    texture2.repeat.set(5, 5);

    var light = new THREE.AmbientLight( 0x777777 ); // soft white light
    scene.add( light );


    // Draw floor layout
    for(let y = 0; y < layout.length; y++) {
        for(let z = 0; z < layout[y].length; z++) {
            for(let x = 0; x < layout[y][z].length; x++) {

                let tile = layout[y][z][x];

                switch(tile.type) {
                    case 1:
                        var box = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
                        var material = new THREE.MeshLambertMaterial({
                            color: 0xffffff,
                            map: texture1
                        });
                        break;
                    case 2:
                        var box = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
                        var material = new THREE.MeshLambertMaterial({
                            color: 0xffffff,
                            map: texture2
                        });
                        break;
                }

                if(tile.type !== 0) {
                    let mesh = new THREE.Mesh(box, material);
                    mesh.position.setX(x*tileSize);
                    mesh.position.setY(-y*tileSize);
                    mesh.position.setZ(z*tileSize);
                    scene.add(mesh);

                    mesh.receiveShadow = true;
                }

                if(tile.item === 0) {
                    let newCrate = crate.clone()
                    newCrate.position.y = -tileSize - (tileSize/2);
                    newCrate.position.x = x*tileSize;
                    newCrate.position.z = z*tileSize;

                    scene.add(newCrate);
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
    }

    document.body.appendChild( renderer.domElement );

    playerStore  = StoreFactory.getByType(StoreConstants.PLAYER_STORE)[0];
    window.playerStore = playerStore;

    let playerState  = playerStore.getState();
    let x            = playerState.get('x');
    let y            = playerState.get('y');
    let z            = playerState.get('z');

    camera.position.x = x*tileSize;
    camera.position.y = -y*tileSize*1.5;
    camera.position.z = z*tileSize;


    let v = new THREE.Vector3(...[
        camera.position.x + tileSize,
        camera.position.y,
        camera.position.z
    ]);

    camera.lookAt(v);

    requestAnimationFrame(animate);
}

// Define animation variables
let lastTime    = null,
    deltaTime   = null,
    moveTick    = 0,
    turnTick    = 0;

// Animation frame
function animate(currentTime) {
    if(!lastTime) {
        deltaTime   = 1;
        lastTime    = currentTime;
    } else {
        deltaTime   = currentTime - lastTime;
        lastTime    = currentTime;
    }

    requestAnimationFrame(animate);

    // This needs to be re-thought
    let floorStore   = StoreFactory.getByType(StoreConstants.FLOOR_STORE)[0];
    let floorState   = floorStore.getState();

    let playerState  = playerStore.getState();
    let {
            x,
            y,
            z,
            isMoving,
            isTurning,
            movingTo,
            turningTo,
            speed,
            turnSpeed,
            dir
        } = playerState.toObject();

    // Animate movement
    if(isMoving) {
        moveTick += (speed*deltaTime/1000);
        moveTick = moveTick >= 1 ? 1 : moveTick

        let moveOffset = moveTick*tileSize;

        if((movingTo.get(0) < x && dir === 1) ||
           (movingTo.get(0) > x && dir === 3) ||
           (movingTo.get(1) > z && dir === 0) ||
           (movingTo.get(1) < z && dir === 2)) {
            moveOffset *= -1;
        }

        switch (dir) {
            case 0:
                camera.position.x = x*tileSize;
                camera.position.z = z*tileSize - moveOffset;
                break;
            case 1:
                camera.position.x = x*tileSize + moveOffset;
                camera.position.z = z*tileSize;
                break;
            case 2:
                camera.position.x = x*tileSize;
                camera.position.z = z*tileSize + moveOffset;
                break;
            case 3:
                camera.position.x = x*tileSize - moveOffset;
                camera.position.z = z*tileSize;
                break;
        }
    } else {
        moveTick = 0;
        camera.position.x = x*tileSize;
        camera.position.y = -y*tileSize;
        camera.position.z = z*tileSize;
    }

    // Animate turning
    if(isTurning) {
        turnTick += (turnSpeed*deltaTime/1000);
        turnTick = turnTick >= Math.PI/2 ? Math.PI/2 : turnTick

        //let turnOffset = (-dir*Math.PI/2) + turnTick;
        let turnOffset = (-dir*Math.PI/2);

        if(dir == 0 && turningTo == 1) turnOffset -= turnTick;
        else if(dir == 1 && turningTo == 2) turnOffset -= turnTick;
        else if(dir == 2 && turningTo == 3) turnOffset -= turnTick;
        else if(dir == 3 && turningTo == 0) turnOffset -= turnTick;
        else turnOffset += turnTick;

        window.camera.rotation.set(0, turnOffset, 0, 'XYZ');
    } else {
        turnTick = 0;
        window.camera.rotation.set(0, -dir*Math.PI/2, 0, 'XYZ');
    }

    renderer.render(scene, camera);
}

/**
 * Create Stores
 */
let gameStore;
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

document.getElementById('control-up').onclick = function() {
    if(!playerStore.state.get('isMoving') && !playerStore.state.get('isTurning')) {
        moveTick = 0;
        worker.postMessage([MessageTypes.PLAYER_MOVE, 1]);
    }
};

document.getElementById('control-down').onclick = function() {
    if(!playerStore.state.get('isMoving') && !playerStore.state.get('isTurning')) {
        moveTick = 0;
        worker.postMessage([MessageTypes.PLAYER_MOVE, -1]);
    }
};

document.getElementById('control-left').onclick = function() {
    if(!playerStore.state.get('isMoving') && !playerStore.state.get('isTurning'))
        worker.postMessage([MessageTypes.PLAYER_TURN, -1]);
};

document.getElementById('control-right').onclick = function() {
    if(!playerStore.state.get('isMoving') && !playerStore.state.get('isTurning'))
        worker.postMessage([MessageTypes.PLAYER_TURN, 1]);
};

/**
 * Change player dir
 */
window.onkeydown = function(e) {
    if(!playerStore.state.get('isMoving') && !playerStore.state.get('isTurning')) {
        switch(e.keyCode) {
            // Left
            case 65:
            case 72:
            case 37:
                //window.camera.rotation.set(0, rotation.y + Math.PI/2, 0, 'XYZ');
                worker.postMessage([MessageTypes.PLAYER_TURN, -1]);
                break;
            // Back
            case 83:
            case 74:
            case 40:
                moveTick = 0;
                worker.postMessage([MessageTypes.PLAYER_MOVE, -1]);
                break;
            // Up
            case 87:
            case 75:
            case 38:
                moveTick = 0;
                worker.postMessage([MessageTypes.PLAYER_MOVE, 1]);
                break;
            // Right
            case 68:
            case 76:
            case 39:
                //window.camera.rotation.set(0, rotation.y - Math.PI/2, 0, 'XYZ');
                worker.postMessage([MessageTypes.PLAYER_TURN, 1]);
                break;
            // Space
            case 32:
                worker.postMessage([MessageTypes.PLAYER_INVESTIGATE]);
                break;
        }
    }
}
