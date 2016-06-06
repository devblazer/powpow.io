const _self = new WeakMap();

const KEYBOARD_KEYS = {
    38: 'Up',
    37: 'Left',
    39: 'Right',
    40: 'Down',
    32: 'Space'
};
const ACTION = {
    up:'Accelerate',
    left:'Turn left',
    right:'Turn right'
};

const PRESS_DELAY = 250;

const bindKeys = function(){
    const self = _self.get(this);
    document.addEventListener('keyup',self.keyUpBinding,true);
    document.addEventListener('keydown',self.keyDownBinding,true);
};

const unbindKeys = function(){
    const self = _self.get(this);
    document.removeEventListener('keyup',self.keyUpBinding);
    document.removeEventListener('keydown',self.keyDownBinding);
};

const keyUp = function(keyCode){
    const self = _self.get(this);
    if (!self.keyMap[keyCode])
        return;
    const action = self.keyMap[keyCode];

    self.actionStates[action] = false;
    if ((new Date()).getTime()-PRESS_DELAY <= self.actionsPressed[action].lastDown)
        self.actionsPressed[action].pressed++;
};
const keyDown = function(keyCode){
    const self = _self.get(this);
    if (!self.keyMap[keyCode])
        return;
    const action = self.keyMap[keyCode];

    self.actionStates[action] = true;
    self.actionsPressed[action].lastDown = (new Date()).getTime();
};

export default class Controller {
    constructor(){
        const me = this;
        const self = {
            mode:0,
            keyMap:{
                38:'up',
                37:'left',
                39:'right'
            },
            actionStates:{
                up:false,
                left:false,
                right:false
            },
            actionsPressed:{
            },
            keyUpBinding:function(e){
                keyUp.call(me,e.keyCode);
            },
            keyDownBinding:function(e){
                keyDown.call(me,e.keyCode);
            }
        };

        _self.set(this,self);

        this.mode = 0;
        this.clearPressed();
    }

    get mode(){
        return _self.get(this).mode;
    }
    set mode(val){
        const self = _self.get(this);

        if (self.mode==0 && val!=0)
            unbindKeys.call(this);
        else if (val==0)
            bindKeys.call(this);

        self.mode = val;
    }

    clearPressed(){
        const self = _self.get(this);
        self.keyMap.forEach(action=>{
            self.actionsPressed[action] = {pressed:0,lastDown:0}
        });
    }

    isDown(action){
        return _self.get(this).actionStates[action];
    }
    isUp(action){
        return !_self.get(this).actionStates[action];
    }
    wasPressed(action){
        return _self.get(this).actionsPressed[action].pressed;
    }
}