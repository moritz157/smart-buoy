var utils = {
    colors: ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#66bb6a", "#9ccc65", "#d4e157", "#ffee58", "#ffca28", "#ffa726", "#ff7043"],
    getRandomColor: function(){
        return this.colors[this.getRandomInt(0, this.colors.length-1)]
    },

    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;

    },

    hexToRgba: function(hex, opacity) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `
            rgba(`+parseInt(result[1], 16)+`,
            `+parseInt(result[2], 16)+`,
            `+parseInt(result[3], 16)+`,
            `+opacity+`)` : null;
    }
}