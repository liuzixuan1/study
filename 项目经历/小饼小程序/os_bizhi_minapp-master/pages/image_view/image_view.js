// pages/image_view/image_view.js

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

//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const wx_api = require('../../utils/wx_api.js');
const common = require('../../utils/common.js');
const storage = require('../../utils/storage.js');

/**
 * 激励视频广告对象
 */
var videoAd;

Page({
  /**
   * 关闭激励视频广告回调函数
   */
  ad_cb_fun: null,
  /**
   * 页面的初始数据
   */
  data: {
    /**
     * 用户微信授权登录弹框是否隐藏：是
     */
    user_wxlogin_view_hidden: true,
    /**
     * 用户微信授权登录弹框“取消登录”按钮是否隐藏：否
     */
    user_wxlogin_close_hidden: false,
    /**
     * 用户微信授权登录弹框“取消登录”关闭类型：隐藏登录弹框
     */
    user_wxlogin_view_closetype: 1,

    /**
     * 状态栏高度
     */
    statusBarHeight: 0,
    /**
     * 当前图片滑动展示项的索引
     */
    current: 0,
    /**
     * 当前壁纸信息
     */
    image_info: {},
    /**
     * 当前壁纸列表索引
     */
    list_index: 0,
    /**
     * 当前壁纸列表项数量
     */
    list_count: 1,
    /**
     * 当前壁纸解锁信息
     */
    unlock_info: {
      download: false, //下载功能是否已解锁，默认：false
      view: false //浏览功能是否已解锁，默认：false
    },
    /**
     * 壁纸标签颜色样式数组
     */
    colors: ['c_blue', 'c_orange', 'c_red', 'c_violet', 'c_green', 'c_yellow', 'c_pink']
  },
  /**
   * 授权获取用户信息回调 和 点击“取消登录”的事件
   */
  ev_getUserInfo: function (e) {
    wx_api.auth_login(this, e);
  },
  /**
   * 点击左上角“返回”事件
   * @param {*} e 
   */
  ev_back: function (e) {
    //如果是可返回（即从首页列表进入），则直接调用返回接口，返回上一页面
    if (this.is_back) {
      wx.navigateBack({});
      return;
    }
    //如果不可返回（即从分享卡片直接进入），则跳转到首页
    this.to_index();
  },
  /**
   * 点击左上角“返回”事件
   * @param {*} e 
   */
  ev_swiper_change: function (e) {
    //更新页面数据：当前浏览的是一组壁纸的第几张壁纸图片
    this.setData({
      current: e.detail.current //获取当前图片滑动展示项的索引
    });
  },
  /**
   * 跳转到首页
   */
  to_index: function () {
    //因首页是 tabBar 页面，则只能调用wx.switchTab接口实现跳转
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  /**
   * 开启新壁纸提醒
   */
  ev_open_notice: function () {
    let that = this;
    //局部常量：订阅消息id，可在小程序公众平台“订阅消息”中申请通过后查看获取
    const tmpid = '6p0WNW8WwaqwujZHBX-zk9FEChaPkFE85GIEZ4mGrDA';
    //调用wx.requestSubscribeMessage接口调起客户端小程序订阅消息界面
    wx.requestSubscribeMessage({
      //需要订阅的消息模板的id的集合，一次调用最多可订阅3条消息
      tmplIds: [tmpid],
      //成功回调函数
      success(res) {
        //res是一个键值对集合（key：订阅消息id，value：授权结果、是否同意）
        //根据tmpid获取对应的值是否等于accept，是则表明：已允许
        if (res[tmpid] == 'accept') {
          wx_api.showToast("已开启", true);

          //显示加载loading
          wx_api.showLoading();
          //请求接口：记录用户开启提醒的壁纸
          util.getMyApiResult('index/open_notice', {
            id: that.data.image_info.id //当前壁纸id
          }, (res) => {
            //隐藏加载loading
            wx_api.hideLoading();
          }, null);
        }
      },
      fail(res) {
        console.log(res);
      }
    });
  },
  /**
   * 查看“上一组”壁纸
   */
  ev_last: function () {
    //获取当前页面数据
    let data = this.data;
    //如果壁纸列表数量<=1 或者 是当前已经是第一个，则提示
    if (data.list_count <= 1 || !data.list_index) {
      wx_api.showToast("没有啦，滑动页面发现更多");
      return;
    }
    //当前壁纸列表索引-1
    data.list_index--;
    //设置当前浏览的壁纸信息
    this.set_info(this.image_list[data.list_index], data.list_index);
  },
  /**
   * 查看“下一组”壁纸
   */
  ev_next: function () {
    //获取当前页面数据
    let data = this.data;
    //如果壁纸列表数量<=1 或者 是当前已经是最后一个，则提示
    if (data.list_count <= 1 || (data.list_index + 1) >= data.list_count) {
      wx_api.showToast("没有啦，滑动页面发现更多");
      return;
    }
    //当前壁纸列表索引+1
    data.list_index++;
    //设置当前浏览的壁纸信息
    this.set_info(this.image_list[data.list_index], data.list_index);
  },
  /**
   * 查看分享海报事件
   */
  ev_poster: function () {
    //调用图片浏览函数，预览分享海报
    wx_api.previewImage([this.data.image_info.share_poster]);
  },
  /**
   * 下载壁纸
   */
  ev_download: function () {
    //获取当前页面数据
    let data = this.data;
    //当前壁纸解锁信息
    let unlock_info = data.unlock_info;
    //获取当前浏览壁纸图片要下载的原图
    let image_url = data.image_info.images[data.current].org;
    //判断壁纸下载功能是否已解锁，是则直接下载
    if (unlock_info.download) {
      //调用图片下载函数
      util.download_image(image_url);
      return;
    }

    /* 壁纸下载功能未解锁，则执行以下代码 */

    /**
     * 定义并赋值关闭激励视频广告回调函数
     * @param {*} is_over 是否已看完广告
     */
    this.ad_cb_fun = function (is_over) {
      if (is_over) {
        //看完广告，则执行壁纸下载功能解锁操作

        //将壁纸下载功能解锁信息设置为true：已解锁
        unlock_info.download = true;
        //更新页面数据
        this.setData({
          unlock_info: unlock_info
        });
        //保存解锁信息
        this.unlock_info(unlock_info);
        //调用图片下载函数
        util.download_image(image_url);
        return;
      }
      //没有看完广告，则显示提示弹框
      wx_api.showModal_tip("看完视频即可下载这组高清壁纸哦");
    };
    //显示激励视频广告
    this.openVideoAd();
  },
  /**
   * 解锁壁纸
   */
  ev_unlock: function () {
    /**
     * 定义并赋值关闭激励视频广告回调函数
     * @param {*} is_over 是否已看完广告
     */
    this.ad_cb_fun = function (is_over) {
      if (is_over) {
        //看完广告，则执行壁纸解锁操作

        //获取当前壁纸解锁信息
        let unlock_info = this.data.unlock_info;
        //将壁纸浏览解锁信息设置为true：已解锁
        unlock_info.view = true;
        //更新页面数据
        this.setData({
          unlock_info: unlock_info
        });
        //保存解锁信息
        this.unlock_info(unlock_info);
        return;
      }
      //没有看完广告，则显示提示弹框
      wx_api.showModal_tip("看完视频即可永久解锁这组壁纸哦");
    };
    //显示激励视频广告
    this.openVideoAd();
  },
  /**
   * 打开激励视频广告
   */
  openVideoAd: function () {
    //判断激励视频广告对象是否不为空，是则执行下面代码
    if (videoAd) {
      //调用激励视频广告显示函数
      videoAd.show().catch(err => {
        //失败重试
        videoAd.load().then(() => videoAd.show());
      });
    }
  },
  /**
   * 初始化激励视频广告
   */
  init_ad: function () {
    //定义变量：存放当前页面对象
    let that = this;
    //判断当前小程序库版本是否允许激励视频广告，是则执行下面的代码
    if (wx.createRewardedVideoAd) {
      //创建激励视频广告，并将广告对象保存到全局变量中
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-b4d9d700347565e7' //广告id，可在小程序公众平台“流量主→广告位管理”中查看获取
      });
      //捕捉错误（一般在网络不稳定 或 未拉取到广告时，会触发此事件）
      videoAd.onError(err => {
        //给与用户提示
        wx_api.showToast("广告未获取到，请重新尝试");
      });
      //监听广告关闭（用户关闭激励视频广告，无论是否看完，都会触发此事件）
      videoAd.onClose((status) => {
        //定义变量：广告是否已看完
        let is_view_over;
        if (status && status.isEnded || status === undefined) {
          //播放完毕
          is_view_over = true; //已看完
        } else {
          //播放中途退出
          is_view_over = false; //未看完
        }
        //执行关闭激励视频广告回调函数
        that.ad_cb_fun && that.ad_cb_fun(is_view_over);
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载、获取页面参数
   */
  onLoad: function (options) {
    //定义局部变量
    let image_list = null, //存放当前图片列表
      is_back, //存放当前是否可返回上一页
      list_index = 0, //存放当前正浏览的图片列表索引
      image_info = null, //存放当前的壁纸信息
      list_count = 1; //存放当前图片列表项数量，默认为：1
    //获取页面参数：壁纸id
    let image_id = common.getObjItem(options, 'id');
    //获取页面参数：来源，如果从分享小程序卡片进入，则from值为：share；小程序内进入，此值为空
    let from_type = common.getObjItem(options, 'from');
    //如果来源为空，则表明是从小程序内进入
    if (!from_type) {
      //当前可返回上一页
      is_back = true;
      //获取存储在全局数据中的首页已加载壁纸列表
      image_list = app.globalData.image_list;
      //如果列表不为空
      if (image_list) {
        //获取列表项数量
        list_count = image_list.length;
        //遍历列表，查找当前壁纸的信息和列表索引
        for (let i = 0; i < list_count; i++) {
          //如果页面参数壁纸id等于列表中项的id，则找到当前壁纸的信息
          if (image_id == image_list[i].id) {
            //当前壁纸的列表索引
            list_index = i;
            //当前壁纸信息
            image_info = image_list[i];
            break;
          }
        }
      }
    }

    //将当前图片列表存放到页面对象中
    this.image_list = image_list;
    //获取状态栏高度
    let statusBarHeight = this.get_statusBarHeight();
    //更新页面数据：当前图片列表项数量 和 状态栏高度
    this.setData({
      list_count: list_count,
      statusBarHeight: statusBarHeight
    });

    //如果没有获取到壁纸信息（一般是从分享卡片进入），则请求接口获取壁纸信息
    if (!image_info) {
      //当前不可返回上一页
      is_back = false;
      //显示加载loading
      wx_api.showLoading();
      //根据页面参数壁纸id，请求接口获取壁纸信息
      util.getIndexApiResult('index/image_info', {
        id: image_id
      }, (res) => {
        //隐藏加载loading
        wx_api.hideLoading();
        //如果未获取到数据，则显示提示框
        if (!res.data) {
          wx_api.showModal_tip(wx_api.nodata_tip, this, () => {
            //用户点击确认回调函数，跳转到首页
            this.to_index();
          });
          return;
        }
        //从接口返回值从获取壁纸信息
        image_info = res.data;
        //设置当前浏览的壁纸信息
        this.set_info(image_info, list_index);
      });
    } else {
      //设置当前浏览的壁纸信息
      this.set_info(image_info, list_index);
    }
    //将当前是否可返回上一页存放到页面对象中
    this.is_back = is_back;
    //调用广告初始化函数
    this.init_ad();
  },
  /**
   * 设置当前浏览的壁纸信息
   * @param {*} image_info 壁纸信息
   * @param {*} list_index 壁纸列表索引
   */
  set_info: function (image_info, list_index) {
    //更新页面数据
    this.setData({
      list_index: list_index, //壁纸列表索引
      current: 0, //浏览一组壁纸，默认从第一张图片开始，所以设置为0
      image_info: image_info, //要浏览的壁纸信息
    });

    //获取此壁纸是否已解锁
    let unlock_info = this.unlock_info();
    //定义壁纸解锁信息属性名称数组
    let temp = ['download', 'view'];
    //定义存放属性名称变量
    let temp_val;
    //遍历壁纸解锁信息属性名称数组
    for (let i = 0; i < temp.length; i++) {
      //获取属性名称
      temp_val = temp[i];
      //从解锁信息中，获取属性对应的值，默认为false（未解锁），并将获取到的值赋值到解锁信息中
      unlock_info[temp_val] = common.getObjItem(unlock_info, temp_val, false);
    }
    //更新壁纸解锁信息
    this.setData({
      unlock_info: unlock_info
    });
  },
  /**
   * 获取或设置壁纸解锁信息
   * @param {*} info 要设置的解锁信息
   */
  unlock_info: function (info) {
    //从缓存中获取用户已解锁的集合信息（key：壁纸id，value：壁纸解锁信息）
    let dict = storage.image_unlock_info();
    //判断集合是否为空，是则设置默认值，方便下面进行判断处理
    !dict && (dict = {});
    //获取当前浏览的壁纸id
    let item_id = this.data.image_info.id;
    //从已解锁的集合中获取当前壁纸的解锁信息
    let data = common.getObjItem(dict, item_id, {});
    //如果info参数为空，表明是获取解锁信息，则直接返回
    if (!info) return data;

    //设置当前壁纸的解锁信息
    dict[item_id] = info;
    //将已解锁的集合重新保存到缓存中
    storage.image_unlock_info(dict);
  },
  /**
   * 获取状态栏高度
   */
  get_statusBarHeight: function () {
    //获取系统信息
    var res = wx.getSystemInfoSync();
    //获取状态栏高度
    let statusBarHeight = res.statusBarHeight;
    //判断状态栏高度是否是数字，如果不是则，设置默认高度（主要兼容开发模拟器上获取不到的情况）
    if (isNaN(statusBarHeight)) {
      statusBarHeight = 20;
    }
    //将高度乘以2倍（这只是本项目实际测试可取的高度，并不是通用和推荐的方式）
    statusBarHeight = statusBarHeight * 2;
    return statusBarHeight;
  },
  /**
   * 用户点击分享触发分享事件
   */
  onShareAppMessage: function () {
    //获取当前浏览的壁纸信息
    let item = this.data.image_info;
    //定义分享页面路径：壁纸详情页路径+参数（from：标记是分享，id：当前壁纸id）
    let path = "/pages/image_view/image_view?from=share&id=" + item.id;
    //获取当前浏览壁纸的图片缩略图
    let imageUrl = item.images[this.data.current].thumb;

    //返回自定义分享数据对象
    return {
      path: path, //分享页面路径，即用户点击分享卡片，会进入的页面路径
      imageUrl: imageUrl, //分享卡片的封面图
      title: item.share_title, //分享卡片的标题
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    };
  }
})