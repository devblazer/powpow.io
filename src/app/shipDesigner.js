require('./main.css');
import Util from './lib/Util.js';
import React from 'react';
import ReactDom from 'react-dom';
import StarsRenderer from './lib/render/StarsRenderer.js';
import WebGL from './lib/render/WebGL.js';

import Ship from './lib/game/Ship.js';
import Arena from './lib/game/Arena.js';
import Camera from './lib/game/Camera.js';
import Controller from './lib/game/Controller.js';

if (['complete', 'loaded', 'interactive'].includes(document.readyState) && document.body) {
    run();
} else {
    window.addEventListener('DOMContentLoaded', run, false);
}
function run() {
    const controller = new Controller();
    const camera = new Camera(0,0,15);
    const webGL = new WebGL(true);
    const stars = new StarsRenderer(60,30,400);
    const arena = new Arena(controller, camera, webGL, stars);
    const ship = new Ship('edge');

    camera.attachTo(ship);
    arena.addShip(ship);
    arena.possessShip(ship);

    var lastTime = (new Date()).getTime();

    function render(){
        var newTime = (new Date()).getTime();
        var delta = newTime - lastTime;
        lastTime = newTime;

        arena.step(delta/1000);
        arena.render();

        requestAnimationFrame(render);
    }

    render();
}

// startup code

