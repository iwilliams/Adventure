import BaseStore        from './BaseStore';
import Immutable        from 'immutable';
import gameDispatcher   from '../dispatcher/GameDispatcher';

class PlayerStore extends BaseStore {

    getInitialState() {
        return Immutable.Map({
            'name': '',
            'hp': 400,
            'mp': 50
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action} = payload;

        switch(action) {
        }

        return state;
    }
}

export default new PlayerStore(gameDispatcher);
