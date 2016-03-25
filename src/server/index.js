import MainLoop             from 'mainloop.js';
import StoreFactory         from '../shared/services/StoreFactory';
import gameDispatcher       from '../shared/dispatcher/GameDispatcher';

import * as GameConstants       from '../shared/constants/GameConstants';
import * as Stores              from '../shared/constants/StoreConstants';
import * as MessageConstants    from '../shared/constants/MessageConstants';

let playerStore = StoreFactory.create(Stores.PLAYER_STORE);
let floorStore  = StoreFactory.create(Stores.FLOOR_STORE);

postMessage([
    MessageConstants.INITIALIZE
]);

let moveTick = 0,
    turnTick = 0;
function tick(deltaTime) {
    var playerState = playerStore.getState();
    var x           = playerState.get('x');
    var y           = playerState.get('y');
    var z           = playerState.get('z');
    var dir         = playerState.get('dir');
    var isMoving    = playerState.get('isMoving');
    var isTurning   = playerState.get('isTurning');
    var speed       = playerState.get('speed');
    var turnSpeed   = playerState.get('turnSpeed');

    // Proccess queued input
    while(messageQueue.length) {
        let [messageType, payload] = messageQueue.pop();
        // MessageType constants make this a bit more clear
        switch(messageType) {
            case MessageConstants.PLAYER_MOVE:

                var floorState  = floorStore.getState();
                var layout      = floorState.get('layout');

                // Don't know why this is cast as string
                payload = parseInt(payload);

                switch(dir) {
                    case 0:
                        z = z - payload;
                        break;
                    case 1:
                        x = x + payload;
                        break;
                    case 2:
                        z = z + payload;
                        break;
                    case 3:
                        x = x - payload;
                        break;
                }

                // Check collision
                if(layout[y] !== undefined &&
                        layout[y][z][x] !== undefined &&
                        layout[y][z][x].type === 0 &&
                        layout[y+1][z][x] !== undefined &&
                        layout[y+1][z][x].type !== 0 &&
                        layout[y][z][x].item === null) {
                    moveTick = 0;
                    gameDispatcher.dispatch({
                        'action': 'moveTo',
                        'data': [x, z]
                    });
                }
                break;
            case MessageConstants.PLAYER_TURN:
                dir = (dir + payload[0])%4;
                if(dir < 0) {
                   dir = 4 + dir;
                }
                gameDispatcher.dispatch({
                    'action': 'turnTo',
                    'data': dir
                });
                break;
            case MessageConstants.PLAYER_INVESTIGATE:
                var floorState  = floorStore.getState();
                var layout      = floorState.get('layout');

                switch(dir) {
                    case 0:
                        z = z - 1;
                        break;
                    case 1:
                        x = x + 1;
                        break;
                    case 2:
                        z = z + 1;
                        break;
                    case 3:
                        x = x - 1;
                        break;
                }

                if(layout[y] !== undefined &&
                        layout[y][z][x] !== undefined &&
                        layout[y][z][x].item !== null) {
                    console.log('investigate');
                }

                break;
        }
    }

    // Calculate movement
    if(isMoving) {
        moveTick += speed*deltaTime/1000;

        if(moveTick >= 1) {
            moveTick = 0;
            gameDispatcher.dispatch({
                'action': 'stopMoving'
            });
        }
    }

    // Calculate turning
    if(isTurning) {
        turnTick += turnSpeed*deltaTime/1000;

        if(turnTick >= Math.PI/2) {
            turnTick = 0;
            gameDispatcher.dispatch({
                'action': 'stopTurning'
            });
        }
    }
}
MainLoop.setSimulationTimestep(1000/GameConstants.SIMULATION_FPS);
MainLoop.setUpdate(tick).start();

let messageQueue = [];
onmessage = function(e) {
    let data         = e.data;
    let messageType  = data.shift();
    let payload      = data;

    messageQueue.push([messageType, payload]);
}
