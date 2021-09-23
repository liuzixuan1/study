/**
源码仅供学习，如需商业用途 或 软件定制开发，请通过以下方式联系：
1.湖北诚万兴网络科技官网：https://www.hbcwxkj.com/
2.个人微信：zxcsmilelife

更多学习课程：
★热门课程★微信小程序直播开发学习入门：https://edu.51cto.com/sd/00df0
★热门课程★小程序开发入门之实战案例解析：高清壁纸推荐	https://edu.51cto.com/sd/d4983
★热门课程★Redis高并发秒杀和分布式锁开发实战解析：https://edu.51cto.com/sd/e3e5b

CSDN学院讲师主页：https://edu.csdn.net/lecturer/4813
51CTO学院讲师主页：https://edu.51cto.com/lecturer/14799040.html
*/

//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const wx_api = require('../../utils/wx_api.js');
const http = require('../../utils/http.js');

Page({
  data: {
    /**
     * “添加小程序”的动画提示是否隐藏，默认：false，显示
     */
    isWebChatTipsHidden: false,
    /**
     * 分类导航栏是否是“吸顶”效果
     */
    cat_is_fixed: false,
    /**
     * 轮播banner：是否显示面板指示点
     */
    indicatorDots: true,
    /**
     * 轮播banner：是否自动切换播放
     */
    autoplay: true,
    /**
     * 轮播banner：自动切换时间间隔（单位：毫秒）
     */
    interval: 5000,
    /**
     * 轮播banner：滑动动画时长（单位：毫秒）
     */
    duration: 1000,

    /**
     * 轮播banner列表
     */
    banner_list: [],
    /**
     * 壁纸分类列表
     */
    cate_list:[],
    /**
     * 当前选中壁纸分类id，默认：-1
     */
    curr_cate_id:-1,
    /**
     * 壁纸图片列表
     */
    list: [],
    /**
     * 列表是否数据（请求）加载中
     */
    loading: false,
    /**
     * 列表加载提示
     */
    tip_message: ''
  },
  /**
   * 页面滚动触发事件
   * @param {*} e 
   */
  onPageScroll: function (e) {
    //获取分类导航栏是否是“吸顶”效果
    let cat_is_fixed = this.data.cat_is_fixed;
    //如果页面滑动高度大于等于135（分类导航栏默认距离顶部的高度，此高度值是在开发模拟器下获取测算的偷懒做法）
    if (e.scrollTop >= 135) {
      //显示“吸顶”效果
      !cat_is_fixed && this.setData({
        cat_is_fixed: true
      });
    } else {
      //取消“吸顶”效果，还原分类导航栏默认显示
      cat_is_fixed && this.setData({
        cat_is_fixed: false
      });
    }
  },
  /**
   * 轮播图点击事件
   */
  ev_banner: function (e) {
    //获取当前点击组件的自定义数据：列表索引
    let index = e.currentTarget.dataset.index;
    //获取当前点击的banner信息
    let item = this.data.banner_list[index];
    //如果banner类型为：仅展示，则跳出此函数
    if (!item.type){
      return;
    }
    //如果appid信息不为空，则表示为：跳转外部小程序
    if (item.appid){
      //打开指定的小程序
      wx.navigateToMiniProgram({
        appId: item.appid,
        path: item.url,
        fail(res) {
          // 打开失败
          wx_api.showToast("小程序打开失败，请检查是否已配置");
        }
      });
    } else if (item.url){
      //如果url（小程序页面路径）不为空，则表示为：小程序内部跳转
      //跳转到小程序内指定页面
      wx.navigateTo({
        url: item.url
      });
    }
  },
  /**
   * 分类（点击）搜索事件
   * @param {*} e event
   */
  ev_cat_search: function (e) {
    //获取当前点击分类菜单的自定义数据：分类id
    let cate_id = e.currentTarget.dataset.id;
    //更新页面数据：当前选中壁纸分类id
    this.setData({
      curr_cate_id: cate_id
    });
    //请求数据接口，加载壁纸列表
    this.default_load();
  },
  /**
   * 页面加载事件
   */
  onLoad: function (option) {
    app.log("onLoad");
    //获取分类和banner图
    var that = this;
    util.getIndexApiResult('index/banner_cats', null, (res) => {
      let data = res.data;
      //获取壁纸图片分类
      let image_cat = data.image_cat;
      //更新页面数据
      that.setData({
        cate_list: image_cat,
        banner_list: data.banner
      });
    });

    //开启定时器：8秒后隐藏“添加小程序”的动画提示
    setTimeout(()=>{
      //更新页面数据
      this.setData({
        isWebChatTipsHidden: true
      });
    },8000);
    //调用默认数据加载函数
    this.default_load();
  },
  /**
   * 默认数据加载(获取第一页数据)
   */
  default_load: function () {
    //存放当前数据列表页码，便于分页使用（从0开始，每次获取数据之前页码加1）
    this.data_page = 0;
    //重置全局数据图片列表，在壁纸图片详情页需用
    app.globalData.image_list = [];
    //标记所有数据是否已加载完毕：否
    this.load_over = false;
    //将数据列表清空
    this.data.list = [];
    //更新页面数据
    this.setData({
      loading: false,//列表是否数据（请求）加载中：否
      list: this.data.list
    });
    //调用加载数据函数，参数：是否是默认加载传true
    this.load_data(true);
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //触发列表分页，调用加载数据函数
    this.load_data();
  },
  /**
   * 更新数据列表
   */
  update_list: function (data) {
    //构造页面数据更新对象
    var v_data = {
      list: this.data.list.concat(data),//当前数据列表追加接口返回的列表数据
      tip_message: '',//加载提示清空
      loading: false //列表加载状态还原，隐藏加载提示
    };
    //更新页面数据
    this.setData(v_data);
  },
  /**
   * 加载数据
   * @param {*} is_default 是否是默认加载（获取第一页数据）
   */
  load_data: function (is_default) {
    //判断列表是否已加载完毕，是，则跳出函数
    if (this.load_over) {
      app.log("is load_over");
      return;
    }
    //判断列表是否数据（请求）加载中，是，则跳出函数，避免重复请求
    if (this.data.loading) {
      app.log("is loading");
      return;
    }
    //更新页面数据：显示加载中提示，并设置正在加载中
    this.setData({
      tip_message: http.loadingTip,
      loading: true
    });
    //分页页码加1
    this.data_page++;

    //定义变量：存放当前页面对象；避免this关键字，因在不同的对象作用域中，导致无法准确获取到当前页面对象
    var that = this;
    //构造请求参数对象
    var query_data={ page: that.data_page, cat_id: that.data.curr_cate_id, is_home:1 };
    //请求壁纸图片列表接口，获取列表数据
    util.getIndexApiResult('index/imagelist', query_data , (res) => {
      //如果返回结果失败或数据为空，则显示提示弹框，并跳出此函数
      if (!res.result || !res.data) {
        wx_api.showModal_tip(wx_api.nodata_tip, that);
        return;
      }

      //获取图片列表数据
      var img_data = res.data;
      //判断图片列表长度是否大于0，是则表明已获取到数据
      if (img_data.length>0) {
        //将全局数据图片列表追加返回的图片列表数据，并重新赋值
        app.globalData.image_list = app.globalData.image_list.concat(img_data);
        //调用更新列表函数：更新列表数据
        this.update_list(img_data);
        return;
      }

      /**未获取到数据处理**/
      this.load_over = true;//标记所有数据已加载完毕
      //根据是否是默认加载，判断要显示的列表加载提示
      var tip_mes;
      if (is_default) {
        tip_mes = "暂未查询到相关壁纸";
      }
      else {
        tip_mes = "数据已加载完毕";
      }
      //更新页面数据：显示列表加载提示
      this.setData({
        tip_message: tip_mes
      });
      //开启定时器：3秒后隐藏加载提示
      setTimeout(function () {
        //更新页面数据
        that.setData({
          tip_message: "", //加载提示清空
          loading: false //列表加载状态还原，隐藏加载提示
        });
      }, 3000);
    });
  }
});
