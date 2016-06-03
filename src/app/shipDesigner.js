require('./main.css');
import Util from './lib/Util.js';
import React from 'react';
import ReactDom from 'react-dom';
import shipData from './lib/data/shipData.json';
import LineModelRenderer from './lib/render/LineModelRenderer';
import starVert from './lib/render/shaders/stars/vertex.glsl';
import starFrag from './lib/render/shaders/stars/fragment.glsl';
import lineVert from './lib/render/shaders/lines/vertex.glsl';
import lineFrag from './lib/render/shaders/lines/fragment.glsl';

if (['complete', 'loaded', 'interactive'].includes(document.readyState) && document.body) {
    run();
} else {
    window.addEventListener('DOMContentLoaded', run, false);
}
function run() {
    var ship = new LineModelRenderer(shipData.ship1);

    function get_shader(type, shaderImport) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, shaderImport);
        gl.compileShader(shader);
        return shader;
    }

    var gl, pMatrix, mvMatrix, vbuf,ibuf, shaders=[], canvas= document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    function initGl() {
        gl = canvas.getContext("experimental-webgl", { antialias: true });
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    function initShaders(shaderName, vertexShader, fragmentShader, attributes) {
        var _vertexShader = get_shader(gl.VERTEX_SHADER, vertexShader);
        var _fragmentShader = get_shader(gl.FRAGMENT_SHADER, fragmentShader);
        var shaderProgram = gl.createProgram();
        shaders[shaderName] = {shader:shaderProgram,attrs:attributes} ;
        gl.attachShader(shaderProgram, _vertexShader);
        gl.attachShader(shaderProgram, _fragmentShader);
        gl.linkProgram(shaderProgram);
        var total = 0;
        attributes.forEach(attr=>{
            total+=(attr.size*attr.count);
            shaderProgram[attr.name+'Attrib'] = gl.getAttribLocation(shaderProgram, attr.name);
            gl.enableVertexAttribArray(shaderProgram[attr.name+'Attrib']);
        });
        shaders[shaderName].total = total;
        shaderProgram.pMUniform = gl.getUniformLocation(shaderProgram, "u_pMatrix");
        shaderProgram.mvMUniform = gl.getUniformLocation(shaderProgram, "u_mvMatrix");
    }
    var camera = [0,0,15],mvMatrix,pMatrix;
    var lastCamera = camera.slice();
    function initScene() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        mvMatrix = makeTranslation(-camera[0], -camera[1], -camera[2]);
        pMatrix = makePerspective(Util.deg2Rad(60),canvas.clientWidth / canvas.clientHeight,1,10000)

        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    function makePerspective(fieldOfViewInRadians, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }
    function makeTranslation(tx, ty, tz) {
        return [
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            tx, ty, tz,  1
        ];
    }

    function initBuffer(glELEMENT_ARRAY_BUFFER, data) {
        var buf = gl.createBuffer();
        gl.bindBuffer(glELEMENT_ARRAY_BUFFER, buf);
        gl.bufferData(glELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buf;
    }

    function initBuffers(shaderName, vtx, idx) {
        var shader = shaders[shaderName];
        var shaderProgram = shader.shader;
        gl.useProgram(shaderProgram);
        gl.uniformMatrix4fv(shaderProgram.pMUniform, false, new Float32Array(pMatrix));
        gl.uniformMatrix4fv(shaderProgram.mvMUniform, false, new Float32Array(mvMatrix));
        vbuf = initBuffer(gl.ARRAY_BUFFER, vtx);
        if (idx)
            ibuf = initBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
        var cumulative = 0;
        shader.attrs.forEach(attr=>{
            gl.vertexAttribPointer(shaderProgram[attr.name+'Attrib'], attr.count, attr.type, false, shader.total, cumulative);
            cumulative+=(attr.size*attr.count);
        });
    }

    function unbindBuffers() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    var fps = 0;

    window.setInterval(function() {
        document.getElementById('fps').innerHTML = fps;
        fps = 0;
    },1000);

    var rotation = 0;

    var starsSpread = 60;
    var starsDepth = 30;
    var starsCount = 400;
    var starsRate = 400/(starsSpread*starsSpread*starsDepth);

    var stars = [];
    for (var n=0;n<starsCount;n++) {
        var z = (Math.random()*starsDepth)-(starsDepth/2);
        var x = (Math.random()*starsSpread)-(starsSpread/2);
        var y = (Math.random()*starsSpread)-(starsSpread/2);
        var b = Math.min(Math.random()*1.5,1);
        var g = Math.min(Math.random()+(b/4),1);
        if (g>b)
            var r = (Math.random()*(g-b))+b;
        else
            var r = Math.random()*g;
        stars.push([x,y,z,r,g,b]);
    }

    function updateStars() {
        var xy = starsSpread/2;
        var z = starsDepth;
        for (var st=stars.length-1;st>=0;st--) {
            var s = stars[st];
            if (s[0]<camera[0]-xy || s[0]>camera[0]+xy || s[1]<camera[1]-xy || s[1]>camera[1]+xy || s[2]>camera[2] || s[2]<camera[2]-z) {
                stars.splice(st, 1);
            }
        }

        function createStars(xs,xe,ys,ye,zs,ze) {
            var count = (xe-xs)*(ye-ys)*(ze-zs)*starsRate;
            var rem = count-Math.floor(count);
            count = Math.floor(count) + (Math.random()<=rem?1:0);

            for (var c=0;c<count;c++) {
                var x = (Math.random()*(xe-xs))+xs;
                var y = (Math.random()*(ye-ys))+ys;
                var z = (Math.random()*(ze-zs))+zs;
                var b = Math.min(Math.random()*1.5,1);
                var g = Math.min(Math.random()+(b/4),1);
                if (g>b)
                    var r = (Math.random()*(g-b))+b;
                else
                    var r = Math.random()*g;
                stars.push([x,y,z,r,g,b]);
            }
        }

        if (camera[0]<lastCamera[0])
            createStars(
                camera[0]-(starsSpread/2),lastCamera[0]-(starsSpread/2),
                camera[1]-(starsSpread/2),camera[1]+(starsSpread/2),
                camera[2]-starsDepth,camera[2]
            );
        if (camera[0]>lastCamera[0])
            createStars(
                lastCamera[0]+(starsSpread/2),camera[0]+(starsSpread/2),
                camera[1]-(starsSpread/2),camera[1]+(starsSpread/2),
                camera[2]-starsDepth,camera[2]
            );
        if (camera[1]<lastCamera[1])
            createStars(
                camera[0]-(starsSpread/2),camera[0]+(starsSpread/2),
                camera[1]-(starsSpread/2),lastCamera[1]-(starsSpread/2),
                camera[2]-starsDepth,camera[2]
            );
        if (camera[1]>lastCamera[1])
            createStars(
                camera[0]-(starsSpread/2),camera[0]+(starsSpread/2),
                lastCamera[1]+(starsSpread/2),camera[1]+(starsSpread/2),
                camera[2]-starsDepth,camera[2]
            );
        if (camera[2]<lastCamera[2])
            createStars(
                camera[0]-(starsSpread/2),camera[0]+(starsSpread/2),
                camera[1]-(starsSpread/2),camera[1]+(starsSpread/2),
                camera[2]-starsDepth,lastCamera[2]-starsDepth
            );
        if (camera[2]>lastCamera[2])
            createStars(
                camera[0]-(starsSpread/2),camera[0]+(starsSpread/2),
                camera[1]-(starsSpread/2),camera[1]+(starsSpread/2),
                lastCamera[2],camera[2]
            );
    }

    var lastTime = (new Date()).getTime();
    function render(){
        var newTime = (new Date()).getTime();
        var delta = newTime - lastTime;
        lastTime = newTime;
        fps++;
        lastCamera = camera.slice();
        camera[2]+=0.06;
        camera[1]+=0.03;
        camera[0]+=0.09;
        updateStars();
        initScene();
        var vtx,idxa,idx;

        ship.update(delta);
        var lines = ship.getCurrentLineList(rotation);

        vtx = new Float32Array(lines);
        idxa = [];
        for (var v=0;v<lines.length/7;v++)
            idxa.push(v);
        idx = new Uint16Array(idxa);

        initBuffers('lines',vtx,idx);
        gl.drawArrays(gl.LINES,0, idxa.length);
        unbindBuffers();

        vtx = stars.reduce((p,c)=>{
            return p.concat(c);
        });
        vtx = new Float32Array(vtx);
        idxa = [];
        for (var v=0;v<stars.length;v++)
            idxa.push(v);
        idx = new Uint16Array(idxa);

        initBuffers('stars',vtx, idx);
        gl.drawArrays(gl.POINTS,0, idxa.length);
        unbindBuffers();

        requestAnimationFrame(render);
    }

    initGl();

    initShaders('stars',starVert,starFrag,[
        {name:'a_position',size:4,count:3,type:gl.FLOAT},
        {name:'a_color',size:4,count:3,type:gl.FLOAT}
    ]);
    initShaders('lines',lineVert,lineFrag,[
        {name:'a_position',size:4,count:3,type:gl.FLOAT},
        {name:'a_color',size:4,count:4,type:gl.FLOAT}
    ]);

    render();
}

// startup code

