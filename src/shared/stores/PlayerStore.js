import BaseStore            from './BaseStore';
import Immutable            from 'immutable';
import gameDispatcher       from '../dispatcher/GameDispatcher';
import * as StoreConstants  from '../constants/StoreConstants';

const DIR_NORTH     = 0;
const DIR_EAST      = 1;
const DIR_SOUTH     = 2;
const DIR_WEST      = 3;

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
            'isMoving': false,
            'movingTo': null,
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
