//app.js
App({
  onLaunch: function () {
    console.log('onLaunch');
  },
  onShow: function () {
    console.log("App onShow");
  },
  onHide: function () {
    console.log("App onHide");
  },
  log: function (mes) {
    var time=new Date().getTime();
    console.log("["+time+"] --- ");
    console.log(mes);
  },
  globalData: {
    /**
     * 壁纸图片列表
     */
    image_list: null
  }
});