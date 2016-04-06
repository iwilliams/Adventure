import THREE                from 'three';

class ResourceService {
    constructor() {
        this._textures = {};
        this._models   = {};
        this._sounds   = {};
    }

    /*
     * Load assets, returns a promise
     */
    loadAssets(assets) {
        // Store loaded resources
        let resourcePromises = [];

        // Load models
        if(assets.models && assets.models.length > 0) {
            // instantiate a loader
            var modelLoader = new THREE.JSONLoader();

            // Load each model
            assets.models.forEach(model => {
                resourcePromises.push(new Promise((res, rej) => {
                    modelLoader.load(model.src, (geometry, materials) => {

                        if(geometry.animations){
                            for(var k in materials){
                                materials[k].skinning = true
                            }
                        }

                        //normals workaround
                        if(materials[0].normalScale){
                            materials[0].normalScale.x = 1
                            materials[0].normalScale.y = 1
                        }

                        var material = new THREE.MultiMaterial( materials );
                        var object = new THREE.Mesh( geometry, material );
                        if(model.scale) {
                            object.scale.set(...model.scale);
                        }
                        this._models[model.name] = object;
                        res();
                    });
                }));
            });
        }

        // Load Textures
        if(assets.textures && assets.textures.length > 0) {
            // instantiate a loader
            var textureLoader = new THREE.TextureLoader();

            // Load each texture
            assets.textures.forEach(texture => {
                resourcePromises.push(new Promise((res, rej) => {
                    textureLoader.load(texture.src, loadedTexture => {

                        if(texture.repeat) {
                            loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
                            loadedTexture.repeat.set(...texture.repeat);
                        }

                        this._textures[texture.name] = loadedTexture;
                        res();
                    });
                }));
            });
        }

        // Load all resources
        return Promise.all(resourcePromises);
    }

    getModel(name) {
        return this._models[name] ? this._models[name].clone() : undefined;
    }

    getTexture(name) {
        return this._textures[name];
    }
}

export default new ResourceService();
