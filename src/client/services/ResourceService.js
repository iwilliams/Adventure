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

                        let modelObject = {};

                        // If there are animations we need to make the correct mesh type
                        // http://yomotsu.net/blog/2015/10/31/three-r73-anim.html -- Only hope
                        if(geometry.animations) {
                            var object = new THREE.SkinnedMesh( geometry, material );
                            var mixer = new THREE.AnimationMixer( object );

                            let animation = mixer.clipAction( geometry.animations[0] );
                            animation.setEffectiveWeight(1);
                            animation.play();

                            modelObject.animationMixer = mixer;
                        } else {
                            var object = new THREE.Mesh( geometry, material );
                        }

                        // Do we need to scale the model?
                        if(model.scale) {
                            object.scale.set(...model.scale);
                        }

                        modelObject.model = object;

                        // Register the model for lokup later
                        this._models[model.name] = modelObject;
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
        return this._models[name] ? this._models[name].model.clone() : undefined;
    }

    getAnimationMixer(name) {
        return this._models[name] ? this._models[name].animationMixer : undefined;
    }

    getTexture(name) {
        return this._textures[name];
    }
}

export default new ResourceService();
