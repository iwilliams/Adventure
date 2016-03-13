import MainLoop             from '../shared/mainloop';
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

let moveTick = 0;
function tick(frame) {
    var playerState = playerStore.getState();
    var x           = playerState.get('x');
    var y           = playerState.get('y');
    var dir         = playerState.get('dir');

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
                        y = y - payload;
                        break;
                    case 1:
                        x = x + payload;
                        break;
                    case 2:
                        y = y + payload;
                        break;
                    case 3:
                        x = x - payload;
                        break;
                }

                // Check collision
                if(layout[y] !== undefined &&
                        layout[y][x] !== undefined &&
                        layout[y][x] === 1) {
                    moveTick = 0;
                    gameDispatcher.dispatch({
                        'action': 'move',
                        'data': [x, y]
                    });
                }
                break;
            case MessageConstants.PLAYER_TURN:
                gameDispatcher.dispatch({
                    'action': 'turn',
                    'data': payload[0]
                });
                break;
        }
    }

    //let playerState = playerStore.getState();
    //let floorState  = floorStore.getState();
}
MainLoop.setSimulationFPS(GameConstants.SIMULATION_FPS);
MainLoop.setUpdate(tick).start();

let messageQueue = [];
onmessage = function(e) {
    let data         = e.data;
    let messageType  = data.shift();
    let payload      = data;

    messageQueue.push([messageType, payload]);
}
