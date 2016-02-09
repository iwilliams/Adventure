import * as rng from '../server/rng'
window.rng = rng;

// Start serve
let worker = new Worker('./server/index.js');
window.worker = worker;

worker.onmessage = function(e) {
    let span = document.createElement('span');
    span.innerHTML = e.data;
    document.body.appendChild(span);
    window.scrollTo(0,document.body.scrollHeight);
}

window.investigate = function(target) {
    worker.postMessage({
        'action': 'investigate',
        'target': target
    });
}

window.attack = function(target) {
    worker.postMessage({
        'action': 'attack',
        'target': target
    });
}

window.restart = function() {
    worker.postMessage({
        'action': 'restart'
    });
}

window.move = function() {
    worker.postMessage({
        'action': 'move'
    });
}

window.stats = function() {
    worker.postMessage({
        'action': 'status'
    });
}
