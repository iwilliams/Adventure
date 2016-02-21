import shortid from 'shortid';

let is_server;

if(self.document === undefined) {
    is_server = true;
} else {
    is_server = false;
}

export const IS_SERVER = IS_SERVER

export function randomId() {
    return shortid.generate()
}
