import BaseStore            from './BaseStore';
import Immutable            from 'immutable';
import gameDispatcher       from '../dispatcher/GameDispatcher';
import * as StoreConstants  from '../constants/StoreConstants';

import { DIR_NORTH, DIR_EAST, DIR_SOUTH, DIR_WEST } from '../constants/GameConstants';

export default class PlayerStore extends BaseStore {

    constructor() {
        super(...arguments);
        this.type = StoreConstants.PLAYER_STORE;
    }

    getInitialState() {
        return Immutable.fromJS({
            'x': 1,
            'y': 1,
            'z': 1,
            'speed': 3,
            'turnSpeed': 7,
            'isMoving': false,
            'isTurning': false,
            'movingTo': null,
            'turningTo': null,
            'dir': DIR_EAST
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action, data} = payload;

        switch(action) {
            case 'moveTo':
                state = state.withMutations(s => {
                    s = s.set('isMoving', true);
                    s = s.set('movingTo', [data[0], data[1]]);
                });
                break;
            case 'stopMoving':
                state = state.withMutations(s => {
                    let movingTo = s.get('movingTo');
                    s = s.set('x', movingTo[0]);
                    s = s.set('y', movingTo[1]);
                    s = s.set('isMoving', false);
                    s = s.set('movingTo', null);
                });
                break;
            case 'turnTo':
                state = state.withMutations(s => {
                    s = s.set('isTurning', true);
                    s = s.set('turningTo', data);
                });
                break;
            case 'stopTurning':
                state = state.withMutations(s => {
                    s = s.set('isTurning', false);
                    s = s.set('dir', s.get('turningTo'));
                });
                break;
            case 'turn':
                state = state.updateIn(['dir'], dir => {
                    dir = (dir + data)%4;
                    if(dir < 0) {
                       dir = 4 + dir;
                    }
                    return dir;
                })
                break;
        }

        return state;
    }
}
