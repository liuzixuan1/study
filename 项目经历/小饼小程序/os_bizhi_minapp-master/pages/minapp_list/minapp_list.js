// pages/minapp_list/minapp_list.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const wx_api = require('../../utils/wx_api.js');
const http = require('../../utils/http.js');
const storage = require('../../utils/storage.js');
app.log("got me");

Page({
  data: {
    data_list: [],
    loading: false,
    tip_message: http.loadingTip,
    is_no_data: false,
    tip_panel_data: {
      is_hidden: true
    }
  },
  onLoad: function (option) {
    var that = this;
    that.default_load();
  },
  /**
   * 默认搜索加载 第一页
   */
  default_load: function () {
    console.log('default_load');
    this.pagenum = 1;
    this.data.data_list = [];
    this.setData({
      is_no_data: false,
      tip_panel_data: {
        width: '100%',
        height: '100%',
        mes: "暂无相关记录",
        is_hidden: true
      }
    });
    this.load_over = false; //标记所有数据已加载完毕，默认:否
    this.load_data(true);
  },
  onReady: function (option) {
    app.log("onReady");
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.default_load();
    wx.stopPullDownRefresh();
  },
  
  load_data: function (is_default) {
    if (this.load_over) {
      app.log("is load_over");
      return;
    }
    if (this.data.loading) {
      app.log("is loading");
      return;
    }
    this.setData({
      tip_message: http.loadingTip,
      loading: true
    });
    if (!is_default) {
      this.pagenum++;
    }

    wx_api.showLoading();
    let com_fun = () => {
      wx_api.hideLoading();
    };
    var that = this;
    var queryData = {
      page: this.pagenum
    };
    console.log("queryData");
    console.log(queryData);

    util.getIndexApiResult('index/minapp', queryData, (res) => {
      console.log(res);
      com_fun();

      that.setData({
        loading: false
      });

      if (!res.result || !res.data) {
        var tip = (!res.result && res.message) ? res.message : wx_api.nodata_tip;
        wx_api.showModal_tip(tip, that);
        return;
      }

      var data = res.data;
      //data=[];//for 测试
      app.log(this.pagenum + "--res is  " + data.length);

      if (data.length) {
        console.log('更新数据');
        var v_data = {
          data_list: this.data.data_list.concat(data),
          tip_message: ""
        };
        console.log(v_data);
        //更新数据
        this.setData(v_data);
        return;
      }

      /**未获取到数据处理**/
      this.load_over = true; //标记所有数据已加载完毕

      if (is_default) {
        //显示“无结果”提示面板
        var tip_panel_data = that.data.tip_panel_data;
        tip_panel_data.is_hidden = false;
        that.setData({
          data_list: [],
          tip_panel_data: tip_panel_data,
          is_no_data: true,
          tip_message: ""
        });
        return;
      }

      var tip_mes = "数据已加载完毕";
      wx_api.showToast(tip_mes);
    });
  },
});