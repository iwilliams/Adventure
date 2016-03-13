import BaseStore            from './BaseStore';
//import {generateFloor}  from '../dungeon';
import * as rng             from '../utils/Rng';
import Immutable            from 'immutable';
import * as GameConstants   from '../constants/GameConstants';
import * as StoreConstants  from '../constants/StoreConstants';

export default class FloorStore extends BaseStore {

    constructor() {
        super(...arguments);
        this.type = StoreConstants.FLOOR_STORE;
    }

    getInitialState() {
        return Immutable.Map({
            layout: [
                [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
                [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
                [2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2],
                [2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2],
                [2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2],
                [2, 1, 1, 2, 2, 2, 1, 2, 1, 1, 1, 1, 2],
                [2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2],
                [2, 1, 1, 2, 1, 2, 2, 2, 2, 2, 1, 1, 2],
                [2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2],
                [2, 1, 1, 2, 2, 2, 2, 2, 1, 2, 1, 1, 2],
                [2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2],
                [2, 1, 1, 1, 1, 2, 1, 2, 2, 2, 1, 1, 2],
                [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
                [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
                [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            ]
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action, data} = payload;

        switch(action) {
            case 'move':
                state = state.updateIn(['currentRoom'], value => value += data);
                break;
        }

        return state;
    }
}
