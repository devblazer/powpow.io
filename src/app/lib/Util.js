const weight = function(num, exp){
    var rev = exp < 0;
    exp = exp===undefined ? 1 : Math.abs(exp)+1;
    var res = Math.pow(num, exp);
    return rev ? 1 - res : res;
};
const RAD = Math.PI/180;

export default {
    randomWeighted(num, exp) {
        return Math.floor( (typeof exp=='undefined'?Math.random():weight(Math.random(), exp)) * num );
    },
    random(num) {
        return this.randomWeighted(num);
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
    }
};
