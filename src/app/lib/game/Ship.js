import shipData from './../data/shipData.json';
import Positionable from './Positionable.js';
import LineModelRenderer from './../render/LineModelRenderer.js';

const _self = new WeakMap();

export default class Ship extends Positionable {
    constructor(type,x=0,y=0,face=0){
        const self = {
            typeIndex:type,
            type:shipData[type],
            lineModelRenderer:new LineModelRenderer(shipData[type]),
            isAccelerating:false
        };

        super(x,y,face);

        _self.set(this,self);
    }

    update(delta){
        super.update(delta);

        _self.get(this).lineModelRenderer.update(delta*1000);
    }

    getForRender(lines=[]){
        const self = _self.get(this);

        self.lineModelRenderer[self.isAccelerating?'show':'hide']('thruster');
        self.isAccelerating = false;
        const position = super.getPosition();

        return _self.get(this).lineModelRenderer.getCurrentLineList(lines,position[0],position[1],this.face);
    }

    accelerate(delta){
        const self = _self.get(this);

        self.isAccelerating = true;
        super.accelerate(self.type.stats.acceleration*delta,this.face,self.type.stats.topSpeed);
    }

    turnLeft(delta){
        super.turnLeft(delta * _self.get(this).type.stats.turnSpeed);
    }
    turnRight(delta){
        super.turnRight(delta * _self.get(this).type.stats.turnSpeed);
    }
}