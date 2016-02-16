/**
 * Much of this code is taken directly from the offical Flux libary:
 * https://github.com/facebook/flux/blob/master/src/stores/FluxReduceStore.js
 * https://github.com/facebook/flux/blob/master/src/stores/FluxStore.js
 *
 * I need to do customer emmiter stuff so I'm just taking the snippets I need
 */

import gameDispatcher   from '../dispatcher/GameDispatcher';
import diff             from 'immutablediff';
import Immutable        from 'immutable';

export default class BaseStore {
    constructor(dispatcher) {
        this.__dispatcher   = dispatcher;
        this.__changed      = false;
        this._state         = this.getInitialState();
        this._dispatchToken = dispatcher.register(payload => {
            this.__invokeOnDispatch(payload);
        });
        postMessage([0, JSON.stringify(this._state)]);
    }

    getState() {
        return this._state;
    }

    /**
    * Checks if two versions of state are the same. You do not need to override
    * this if your state is immutable.
    */
    areEqual(one, two) {
        return one === two;
    }

    __invokeOnDispatch(payload) {
        this.__changed  = false;
        let startState  = this._state;
        let endState    = this.reduce(startState, payload);

        if(!this.areEqual(startState, endState)) {
            this.__changed = true;
        }

        if(this.__changed) {
            let patch = diff(startState, endState);
            postMessage([1, JSON.stringify(patch)]);
            this._state = endState;
        }
    }
}
