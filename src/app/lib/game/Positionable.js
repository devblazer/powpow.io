import Util from './../Util.js';

const trigger = function(action) {
    const self = _self.get(this);
    const me = this;
    self.subscriptions.forEach(callback=>{
        callback.call(me,action);
    });
};

const _self = new WeakMap();

export default class Positionable {
    constructor(x=0,y=0,face=0){
        const self = {
            x,
            y,
            lastX:x,
            lastY:y,
            xSpeed:0,
            ySpeed:0,
            direction:0,
            speed:0,
            face,
            subscriptions:[]
        };

        _self.set(this,self);
    }

    get face(){
        return _self.get(this).face;
    }
    set face(val){
        _self.get(this).face = val;
        trigger.call(this,'facing');
    }

    get x(){
        return _self.get(this).x;
    }
    set x(val){
        _self.get(this).x = val;
        trigger.call(this,'position');
    }

    get y(){
        return _self.get(this).y;
    }
    set y(val){
        _self.get(this).y = val;
        trigger.call(this,'position');
    }

    getPosition(){
        const self = _self.get(this);
        return [self.x,self.y];
    }
    setPosition(x,y,capture=false){
        const self = _self.get(this);
        if (capture) {
            self.lastX = self.x;
            self.lastY = self.y;
        }
        self.x = x;
        self.y = y;
        trigger.call(this,'position');
    }
    getLastPosition(){
        const self = _self.get(this);
        return [self.lastX,self.lastY];
    }

    get xSpeed(){
        return _self.get(this).xSpeed;
    }
    set xSpeed(val){
        const self = _self.get(this);
        self.xSpeed = val;
        const dir = Util.rotationFromVector2(self.xSpeed,self.ySpeed);
        self.speed = dir[0];
        self.direction = dir[1];
        trigger.call(this,'velocity');
    }

    get ySpeed(){
        return _self.get(this).ySpeed;
    }
    set ySpeed(val){
        const self = _self.get(this);
        self.ySpeed = val;
        const dir = Util.rotationFromVector2(self.xSpeed,self.ySpeed);
        self.speed = dir[0];
        self.direction = dir[1];
        trigger.call(this,'velocity');
    }

    getVector(){
        const self = _self.get(this);
        return [self.xSpeed,self.ySpead];
    }
    setVector(xSpeed,ySpeed){
        const self = _self.get(this);
        self.xSpeed = xSpeed;
        self.ySpeed = ySpeed;
        const dir = Util.rotationFromVector2(xSpeed,ySpeed);
        self.speed = dir[0];
        self.direction = dir[1];
        trigger.call(this,'velocity');
    }

    get direction(){
        return _self.get(this).direction;
    }
    set direction(val){
        const self = _self.get(this);
        self.direction = val;
        const dir = Util.vector2FromRotation(self.speed,self.direction);
        self.x = dir[0];
        self.y = dir[1];
        trigger.call(this,'velocity');
    }

    get speed(){
        return _self.get(this).speed;
    }
    set speed(val){
        const self = _self.get(this);
        self.speed = val;
        const dir = Util.vector2FromRotation(self.speed,self.direction);
        self.x = dir[0];
        self.y = dir[1];
        trigger.call(this,'velocity');
    }

    getVelocity(){
        const self = _self.get(this);
        return [self.speed,self.direction];
    }
    setVelocity(speed,direction){
        const self = _self.get(this);
        self.direction = direction;
        self.speed = speed;
        const dir = Util.vector2FromRotation(self.speed,self.direction);
        self.x = dir[0];
        self.y = dir[1];
        trigger.call(this,'velocity');
    }

    subscribe(callback){
        _self.get(this).subscriptions.push(callback);
    }
    unsubscribe(callback){
        const self = _self.get(this);
        self.subscriptions.splice(self.subscriptions.indexOf(callback),1);
    }

    update(delta){
        const self = _self.get(this);
        self.x += self.xSpeed*delta;
        self.y += self.ySpeed*delta;
        trigger.call(this,'position');
    }

    accelerate(speed,direction,topSpeed=null){
        const self = _self.get(this);

        const acceleration = Util.vector2FromRotation(speed,direction);
        let newVector = [acceleration[0]+self.xSpeed,acceleration[1]+self.ySpeed];
        const newSpeed = Math.sqrt(Math.pow(newVector[0],2)+Math.pow(newVector[1],2));
        if (topSpeed!==null && newSpeed>topSpeed) {
            newVector[0] /= (newSpeed / topSpeed);
            newVector[1] /= (newSpeed / topSpeed);
        }
        this.setVector(newVector[0],newVector[1]);
    }

    turnLeft(angle){
        _self.get(this).face -= angle;
    }
    turnRight(angle){
        _self.get(this).face += angle;
    }
}