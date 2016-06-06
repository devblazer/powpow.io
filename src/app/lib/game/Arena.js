import Ship from './Ship.js';
import starVert from './../render/shaders/stars/vertex.glsl';
import starFrag from './../render/shaders/stars/fragment.glsl';
import lineVert from './../render/shaders/lines/vertex.glsl';
import lineFrag from './../render/shaders/lines/fragment.glsl';

const _self = new WeakMap();

export default class Arena {
    constructor(controller,camera,webGL,stars){
        const self = {
            ships:[],
            controller,
            camera,
            webGL,
            stars,
            lastCamera:camera.getPosition().slice(),
            possessedShip:null
        };

        _self.set(this,self);

        self.webGL.createShader('stars',starVert,starFrag,[
            {name:'a_position',size:4,count:3,type:'FLOAT'},
            {name:'a_color',size:4,count:3,type:'FLOAT'}
        ]);
        self.webGL.createShader('lines',lineVert,lineFrag,[
            {name:'a_position',size:4,count:3,type:'FLOAT'},
            {name:'a_color',size:4,count:4,type:'FLOAT'}
        ]);
    }

    addShip(ship){
        if (!(ship instanceof Ship))
            throw new Error('ship must be an instance of Ship');

        const self = _self.get(this);

        self.ships.push(ship);
    }
    removeShip(ship){
        if (!(ship instanceof Ship))
            throw new Error('ship must be an instance of Ship');

        const self = _self.get(this);

        delete(self.ships[self.ships.indexOf(ship)]);
    }

    possessShip(ship) {
        if (!(ship instanceof Ship) || ship===null)
            throw new Error('ship must be an instance of Ship');

        _self.get(this).possessedShip = ship;
    }

    step(delta){
        const self = _self.get(this);

        if (self.possessedShip){
            if (self.controller.isDown('left') && self.controller.isUp('right'))
                self.possessedShip.turnLeft(delta);
            else if (self.controller.isDown('right'))
                self.possessedShip.turnRight(delta);
            if (self.controller.isDown('up'))
                self.possessedShip.accelerate(delta);
        }

        self.ships.forEach(function(ship){
            ship.update(delta);
        });
    }

    render(){
        const self = _self.get(this);

        self.webGL.renderStart(self.camera.getPosition());

        let vtx;

        let lines = [];
        self.ships.forEach(ship=>{
            ship.getForRender(lines);
        });

        vtx = new Float32Array(lines);
        self.webGL.render('lines','LINES',vtx,lines.length/7);

        self.stars.update(self.camera.getPosition(),self.lastCamera);
        vtx = new Float32Array(self.stars.getForRender());
        self.webGL.render('stars','POINTS',vtx,self.stars.getCount());

        self.lastCamera = self.camera.getPosition().slice();
    }
}