import MainLoop             from '../shared/mainloop';
import StoreFactory         from '../shared/services/StoreFactory';
import gameDispatcher       from '../shared/dispatcher/GameDispatcher';

import * as GameConstants       from '../shared/constants/GameConstants';
import * as Stores              from '../shared/constants/StoreConstants';
import * as MessageConstants    from '../shared/constants/MessageConstants';

//let playerStore = StoreFactory.create(Stores.PLAYER_STORE);
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
                let floorState  = floorStore.getState();
                let rooms       = floorState.get('rooms');
                let currentRoom = floorState.get('currentRoom');
                let nextRoom    = currentRoom + payload[0];
                if(nextRoom < rooms && nextRoom >= 0) {
                    gameDispatcher.dispatch({
                        'action': 'move',
                        'data': payload[0]
                    });
                    break;
                }
        }
    }

    //let playerState = playerStore.getState();
    //let floorState  = floorStore.getState();

    //gameDispatcher.dispatch({
        //'action': 'move',
        //'data': frame
    //});

    //// Check if the player has collided
    //let collision   = false;
    //let playerDir   = playerState.get('dir');
    //let newPos      = [playerState.get('xPos'), playerState.get('yPos')];

    //if(newPos[0] < floorState.get('width')
            //&& newPos[0] >= 0
            //&& newPos[1] < floorState.get('height')
            //&& newPos[1] >= 0) {

        //for(let i = 0; i < playerState.get('tail').size; i++) {
            //let tailSegment = playerState.getIn(['tail', i]);

            //if(newPos[0] === tailSegment[0] && newPos[1] === tailSegment[1]) {
                //collision = true;
                //break;
            //}
        //}
    //} else {
        //collision = true;
    //}

    //// If there was a collision then die
    //if(collision) {
        //gameDispatcher.dispatch({
            //'action': 'restart'
        //});
    //}

    //// If we are colliding with the dot then eat it
    //if(playerState.get('xPos') === floorState.get('dotX') && playerState.get('yPos') === floorState.get('dotY')) {
        //gameDispatcher.dispatch({
            //'action': 'eat'
        //});
    //}
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
