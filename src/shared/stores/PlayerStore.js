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
            'dir': DIR_EAST
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action, data} = payload;

        switch(action) {
            case 'move':
                switch(state.get('dir')) {
                    case DIR_NORTH:
                        state = state.updateIn(['y'], y => y - data);
                        break;
                    case DIR_EAST:
                        state = state.updateIn(['x'], x => x + data);
                        break;
                    case DIR_SOUTH:
                        state = state.updateIn(['y'], y => y + data);
                        break;
                    case DIR_WEST:
                        state = state.updateIn(['x'], x => x - data);
                        break;
                }
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
