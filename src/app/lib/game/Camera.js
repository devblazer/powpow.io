import Positionable from './Positionable.js';

const _self = new WeakMap();

export default class Camera {
    constructor(x=0,y=0,z=0){
        const camera = this;
        const self = {
            attachedTo:null,
            attachHandler:function(action){
                if (action=='position') {
                    camera.x = this.x;
                    camera.y = this.y;
                }
            }
        };
        this.x = x;
        this.y = y;
        this.z = z;

        _self.set(this,self);
    }

    attachTo(positionable){
        if (!(positionable instanceof Positionable))
            throw new Error('Camera can only attach to instance of Positionable');

        const self = _self.get(this);

        if (self.attachedTo)
            this.detach();
        self.attachedTo = positionable;

        positionable.subscribe(self.attachHandler);
    }

    detach(){
        const self = _self.get(this);
        self.attachedTo.unsubscribe(self.attachHandler);
    }

    getPosition(){
        return [this.x,this.y,this.z];
    }
}