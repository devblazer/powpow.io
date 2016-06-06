const _self = new WeakMap();

const createStars = function(xs,xe,ys,ye,zs,ze) {
    const self = _self.get(this);

    let count = (xe-xs)*(ye-ys)*(ze-zs)*self.rate;
    const rem = count-Math.floor(count);
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
        self.stars.push([x,y,z,r,g,b]);
    }
};

const updateStars = function(camera,lastCamera) {
    const self = _self.get(this);

    var xy = self.spread / 2;
    var z = self.depth;
    for (var st = self.stars.length - 1; st >= 0; st--) {
        var s = self.stars[st];
        if (s[0] < camera[0] - xy || s[0] > camera[0] + xy || s[1] < camera[1] - xy || s[1] > camera[1] + xy || s[2] > camera[2] || s[2] < camera[2] - z) {
            self.stars.splice(st, 1);
        }
    }

    if (camera[0]<lastCamera[0])
        createStars.call(this,
            camera[0]-(self.spread/2),lastCamera[0]-(self.spread/2),
            camera[1]-(self.spread/2),camera[1]+(self.spread/2),
            camera[2]-self.depth,camera[2]
        );
    if (camera[0]>lastCamera[0])
        createStars.call(
            this,
            lastCamera[0]+(self.spread/2),camera[0]+(self.spread/2),
            camera[1]-(self.spread/2),camera[1]+(self.spread/2),
            camera[2]-self.depth,camera[2]
        );
    if (camera[1]<lastCamera[1])
        createStars.call(
            this,
            camera[0]-(self.spread/2),camera[0]+(self.spread/2),
            camera[1]-(self.spread/2),lastCamera[1]-(self.spread/2),
            camera[2]-self.depth,camera[2]
        );
    if (camera[1]>lastCamera[1])
        createStars.call(
            this,
            camera[0]-(self.spread/2),camera[0]+(self.spread/2),
            lastCamera[1]+(self.spread/2),camera[1]+(self.spread/2),
            camera[2]-self.depth,camera[2]
        );
    if (camera[2]<lastCamera[2])
        createStars.call(
            this,
            camera[0]-(self.spread/2),camera[0]+(self.spread/2),
            camera[1]-(self.spread/2),camera[1]+(self.spread/2),
            camera[2]-self.depth,lastCamera[2]-self.depth
        );
    if (camera[2]>lastCamera[2])
        createStars.call(
            this,
            camera[0]-(self.spread/2),camera[0]+(self.spread/2),
            camera[1]-(self.spread/2),camera[1]+(self.spread/2),
            lastCamera[2],camera[2]
        );
};

export default class StarsRenderer {
    constructor(spread,depth,count){
        const self = {
            count,
            spread,
            depth,
            rate:count/(spread*spread*depth),
            stars:[]
        };

        _self.set(this,self);

        createStars.call(this,spread/-2,spread/2,spread/-2,spread/2,depth/-2,depth/2);
/*
        for (var n=0;n<count;n++) {
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
        }*/
    }

    update(camera,lastCamera){
        updateStars.call(this,camera,lastCamera);
    }

    getCount(){
        return _self.get(this).stars.length;
    }

    getForRender(){
        const self = _self.get(this);

        return self.stars.reduce((p,c)=>{
            return p.concat(c);
        });
    }
}