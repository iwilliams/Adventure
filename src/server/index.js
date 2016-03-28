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

function getNextTile(x, y, z, dir, delta, tiles) {
    switch(dir) {
        case 0:
            z = z - delta;
            break;
        case 1:
            x = x + delta;
            break;
        case 2:
            z = z + delta;
            break;
        case 3:
            x = x - delta;
            break;
    }

    if(tiles[y] !== undefined && tiles[y][z] !== undefined && tiles[y][z][x] !== undefined)
        return tiles[y][z][x];
    else return false;
}

let moveTick = 0,
    turnTick = 0;
function tick(deltaTime) {
    var { x, y, z, dir, isMoving, isTurning, speed, turnSpeed } = playerStore.getState().toObject();

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

                var nextTile = getNextTile(x, y, z, dir, payload, layout);
                if(nextTile && nextTile.type === 0 && nextTile.item === null) {
                    let underTile = getNextTile(x, y+1, z, dir, payload, layout);
                    if(underTile && underTile.type !== 0) {
                        moveTick = 0;
                        gameDispatcher.dispatch({
                            'action': 'moveTo',
                            'data': [nextTile.x, nextTile.z]
                        });
                    }
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

                var nextTile = getNextTile(x, y, z, dir, 1, layout);

                if(nextTile && nextTile.item !== null) {
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
