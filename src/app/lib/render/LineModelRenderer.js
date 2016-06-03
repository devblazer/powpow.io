import Util from './../Util.js';

const _self = new WeakMap();
if (typeof Object.prototype.forEach == 'undefined')
    Object.prototype.forEach = function(callback) {
        for (var v in this)
            if (this.hasOwnProperty(v)){
                callback(this[v],v,this);
            }
    };

class LineModelRenderer {
    constructor(lineData) {
        const self = {
            lineData,
            currentAnims:[],
        };

        self.currentAnims['base'] = 0;
        _self.set(this,self);
        this.resetAnimation();
    }

    setColor(colorName,r,g,b){
        const self = _self.get(this);
        let color = self.lineData.themeColors.reduce((ret,col)=>{
            return col[0]==colorName ? col : ret;
        });
        color[1] = r;
        color[2] = g;
        color[3] = b;
    }

    resetAnimation(partName=null){
        let parts = _self.get(this).lineData.parts;
        if (partName)
            parts = [parts[partName]];

        parts.forEach(part=>{
            part.frame = 0;
            part.isPlaying = part.keyFrames[0].autoNext;
            part.current = 0;
        });
    }
    animate(partName, keyFrame=0, progress=0) {
        const self = _self.get(this);

        const part = self.lineData.parts[partName];
        part.isPlaying = true;
        part.visible = true;
        part.frame = keyFrame;
        part.current = part.keyFrames[keyFrame].duration * progress;
    }
    stopAnimation(partName) {
        _self.get(this).lineData.parts[partName].isPlaying = false;
    }

    show(partName) {
        _self.get(this).lineData.parts[partName].visible = true;
    }
    hide(partName) {
        _self.get(this).lineData.parts[partName].visible = false;
    }

    update(delta) {
        const self = _self.get(this);

        self.lineData.parts.forEach(part=>{
            if (part.visible && part.isPlaying) {
                let keyFrame = part.keyFrames[part.frame];
                part.current += delta;
                while (part.current > keyFrame.duration) {
                    if (keyFrame.autoNext) {
                        part.current -= keyFrame.duration;
                        part.frame++;
                        if (part.frame >= part.keyFrames.length)
                            part.frame = 0;
                        keyFrame = part.keyFrames[part.frame];
                    }
                    else
                        part.current = keyFrame.duration;
                }
            }
        });
    }

    getCurrentLineList(rotation=0, scale=1){
        const lines = [];
        const self = _self.get(this);

        self.lineData.parts.forEach(part=>{
            if (part.visible) {
                let keyFrame = part.keyFrames[part.frame];
                let prevFrame;
                if (part.keyFrames.length==1)
                    prevFrame = keyFrame;
                else
                    prevFrame = part.keyFrames[part.frame?part.frame-1:part.keyFrames.length-1];

                let progress = keyFrame.duration?((part.current?part.current:0)/keyFrame.duration):1;

                keyFrame.points.forEach((point, index)=> {
                    let prevPoint = prevFrame.points[index];
                    let newPoint = {};
                    for (let a=0; a<point.length; a++)
                         newPoint[a] = (point[a]*progress) + (prevPoint[a]*(1-progress));
                    let ret = Util.vector2FromRotation(
                        newPoint[1]*self.lineData.scale*scale,
                        newPoint[0]+self.lineData.rotate+rotation
                    );
                    newPoint[0] = ret[0];
                    newPoint[1] = ret[1];

                    for (let c=0; c<self.lineData.themeColors.length; c++)
                        for (let n=2; n<=4; n++){
                            newPoint[n] = (newPoint[n]*(1-newPoint[c+6])) + (self.lineData.themeColors[c][n-1]*newPoint[c+6]);
                        }
                    ret[3] = newPoint[2];
                    ret[4] = newPoint[3];
                    ret[5] = newPoint[4];
                    ret[2] = 0;
                    ret[6] = newPoint[5];

                    for (var r=0; r<ret.length; r++)
                        lines.push(ret[r]);
                });
            }
        });
        return lines;
    }
}

export default LineModelRenderer;