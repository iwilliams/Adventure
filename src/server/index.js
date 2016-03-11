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

function tick(frame) {
    // Proccess queued input
    while(messageQueue.length) {
        let [messageType, payload] = messageQueue.pop();

        // MessageType constants make this a bit more clear
        switch(messageType) {
            case MessageConstants.PLAYER_INPUT:
                gameDispatcher.dispatch({
                    'action': 'move',
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
