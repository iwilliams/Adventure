import BaseStore        from './BaseStore';
import Immutable        from 'immutable';
import gameDispatcher   from '../dispatcher/GameDispatcher';

export default class PlayerStore extends BaseStore {
    getInitialState() {
        return Immutable.fromJS({
            'xPos': 0,
            'yPos': 0,
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action} = payload;

        switch(action) {
            case 'move':
                state = state.updateIn(['xPos'], value => ++value);
                break;
        }

        return state;
    }
}
