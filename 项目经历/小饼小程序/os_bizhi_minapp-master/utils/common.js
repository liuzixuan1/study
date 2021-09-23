var obj = {
  /**
   * 判断对象或参数是否未定义
   * @param {*} obj 对象或参数
   */
  is_undefined: function (obj) {
    //判断类型是否是undefined，是则为未定义，否则已定义
    if (typeof (obj) == "undefined") {
      return true;
    }
    return false;
  },
  /**
   * 获取当前时间戳
   */
  getTime: function () {
    var date = new Date();
    var time = date.getTime() / 1000;//转换成秒
    time = parseInt(time);
    return time;
  },
  trim: function (str) {
    return str.replace(/(^\s+)|(\s+$)/g, "");
  },
  /**
   * 字符串转json
   */
  strtoJson: function (str) {
    return JSON.parse(str);  
  },
  /**
   * 从对象中获取指定属性名称的值
   * @param {*} obj 对象
   * @param {*} key 要获取的属性名称（也称之为键名）
   * @param {*} def_val 默认值
   */
  getObjItem: function (obj, key,def_val) {
    //判断def_val参数是否没有传值
    if (this.is_undefined(def_val)){
      //没有传值，则默认值为null
      def_val=null;
    }
    //如果对象是否不为空 并且 对象中存在要获取的属性，则返回属性值
    if (obj && obj.hasOwnProperty(key)) return obj[key];
    //否则，返回默认值
    return def_val;
  },
  getObjItemCount: function (obj,only_checkhasItem) {
    let count = 0;
    if (obj) {
      for (var key in obj) {
        if (only_checkhasItem) return true;
        count++;
      }
    }
    return count;
  },
  /**
   * 将秒转换为 mm:ss时间格式
   */
  formatTime: function (time) {
    if (typeof time !== 'number' || time < 0) {
      return time
    }

    // var hour = parseInt(time / 3600)
    // time = time % 3600
    var minute = parseInt(time / 60)
    time = time % 60
    var second = time

    return ([minute, second]).map(function (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }).join(':');
  },
  isMobile: function (val){
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    return myreg.test(val);
  },
  extend:function (o, n) {
    for (var p in n) {
      if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p)))
        o[p] = n[p];
    }
  }   
};

module.exports = obj;