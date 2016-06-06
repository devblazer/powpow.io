const weight = function(num, exp){
    var rev = exp < 0;
    exp = exp===undefined ? 1 : Math.abs(exp)+1;
    var res = Math.pow(num, exp);
    return rev ? 1 - res : res;
};
const RAD = Math.PI/180;
const UID_CHARS = 'abcdefghijklmnopqrstuvwxyz01234567890'.split('');

export default {
    randomWeighted(num, exp) {
        return Math.floor( (typeof exp=='undefined'?Math.random():weight(Math.random(), exp)) * num );
    },
    random(num) {
        return this.randomWeighted(num);
    },
    uid(l=8){
        let s='';
        for (let n=0;n<l;n++)
            s+=UID_CHARS[Math.floor(Math.random()*UID_CHARS.length)];
        return s;
    },
    hasParam(obj) {
        for (var i in obj)
            if (obj.hasOwnProperty(i)) {
                return true;
            }
        return false;
    },
    isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    objDistance(obj1,obj2) {
        return Math.sqrt(Math.pow(obj2.x-obj1.x,2) + Math.pow(obj2.y-obj1.y,2));
    },
    deg2Rad(deg){
        return deg * RAD;
    },
    rad2Deg(rad){
        return rad / RAD;
    },
    vector2FromRotation(distance,rotation){
        rotation = this.deg2Rad(rotation);
        return [
            Math.sin(rotation) * distance,
            Math.cos(rotation) * distance
        ];
    },
    rotationFromVector2(x,y){
        const speed = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        if (!speed)
            return [0,0];
        let dir = this.rad2Deg(Math.acos(y/speed));
        if (x<0)
            dir *= -1;
        return [speed,dir];
    }
};
