/**
 * Much of this code is taken directly from the offical Flux libary:
 * https://github.com/facebook/flux/blob/master/src/stores/FluxReduceStore.js
 * https://github.com/facebook/flux/blob/master/src/stores/FluxStore.js
 *
 * I need to do customer emmiter stuff so I'm just taking the snippets I need
 */
import immutablediff            from 'immutablediff';
import immutablepatch           from 'immutablepatch';
import Immutable                from 'immutable';
import * as MessageConstants    from '../constants/MessageConstants';

export default class BaseStore {
    constructor(id, dispatcher, state) {
        this.__id           = id;
        this.__dispatcher   = dispatcher;
        this.__changed      = false;
        this._state         = state || this.getInitialState();
        this._dispatchToken = dispatcher.register(payload => {
            this.__invokeOnDispatch(payload);
        });
    }

    get id() { return this.__id }

    get state() { return this._state }

    /**
     * Reduce the state
     */
    reduce() {
        throw "You must impliment reduce()";
    }

    /**
     * Returns current state
     */
    getState() {
        return this._state;
    }

    /**
     * Patch State
     */
    patchState(patch) {
        this._state = immutablepatch(this.getState(), patch);
    }

    /**
    * Checks if two versions of state are the same. You do not need to override
    * this if your state is immutable.
    */
    areEqual(one, two) {
        return one === two;
    }

    /**
     * This will be called when a message is dispatched
     */
    __invokeOnDispatch(payload) {
        this.__changed  = false;
        let startState  = this._state;
        let endState    = this.reduce(startState, payload);

        if(!this.areEqual(startState, endState)) {
            this.__changed = true;
        }

        if(this.__changed) {
            let patch = immutablediff(startState, endState);
            this._state = endState;

            postMessage([
                    MessageConstants.PATCH_STORE,
                    this.id,
                    JSON.stringify(patch)
            ]);
        }
    }
}
