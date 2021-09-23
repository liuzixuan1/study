'use strict';
const storage = require('storage.js');
const common = require("common.js");
//两个文件 之间不要出现相互引用，否则会报错
const http = require("http.js");
const DEFAULT_TIP = '数据获取失败，请检查您的网络连接';
/**
 * 首页页面路径
 */
const INDEX_PATH = 'pages/index/index';

var apiObj = {
  default_tip: DEFAULT_TIP,
  nodata_tip: "未获取到数据，请稍后再试！",
  /**
   * 返回当前 或 所有打开页面的栈
   * @param {*} get_all 是否返回所有
   */
  getCurrentPage: function (get_all) {
    //获取所有打开页面的栈（页面对象数组）
    let pages = getCurrentPages();
    //如果是返回所有打开页面的栈，则直接返回
    if (get_all) return pages;
    //返回当前页面
    return pages[pages.length - 1];
  },
  /**
   * 跳转到首页
   */
  go_index: function () {
    wx.switchTab({
      url: '/' + INDEX_PATH,
    });
  },
  /**
   * 授权获取用户信息回调 和 点击“取消登录”的事件（提供给页面调用）
   * @param {*} page_obj 页面对象
   * @param {*} e 事件参数
   */
  auth_login: function (page_obj, e) {
    console.log('-----auth_login-----');
    //隐藏“微信授权登录”弹框的函数变量
    let hidden_fun = () => {
      page_obj.setData({
        user_wxlogin_view_hidden: true
      });
    };
    //获取当前事件触发组件的自定义数据
    let dataset = e.currentTarget.dataset;
    //判断自定义数据中是否有close属性，是则表明是点击“取消登录”的事件
    if (common.getObjItem(dataset, 'close')) {
      //根据取消登录的类型进行相应的处理
      //如果页面路径等于首页路径（即当前为首页）或者 页面数据对象中user_wxlogin_view_closetype属性值为1，则隐藏登录弹框，否则跳转到首页
      if (page_obj.route == INDEX_PATH || common.getObjItem(page_obj.data, 'user_wxlogin_view_closetype') == 1) {
        //隐藏登录弹框
        hidden_fun();
      } else {
        //跳转到首页
        apiObj.go_index();
      }
      return;
    }
    //获取授权返回信息
    let detail = e.detail;
    //判断用户信息是否为空，是则表明用户拒绝了授权
    if (!detail.userInfo) {
      console.log('登录拒绝');
      return;
    }
    //隐藏登录弹框
    hidden_fun();
    //调用认证登录函数
    _do_auth_login(detail, page_obj.login_suc_fun);
  },
  /**
   * 微信登录
   * @param {*} cb_fun 回调函数
   * @param {*} is_must_login 是否必须登录，默认：false
   */
  login: function (cb_fun, is_must_login) {
    //获取当前页面对象
    let page_obj = apiObj.getCurrentPage();

    //调用 获取用户信息 方法
    _getUserInfo(cb_fun, () => {
      //如果不是必须登录
      if (!is_must_login) {
        //执行回调函数并返回
        return cb_fun();
      }
      //隐藏加载loading（一般接口请求之前都会显示loading，这里需要先隐藏）
      apiObj.hideLoading();
      //容错处理（如果当前页面数据对象中没有user_wxlogin_view_hidden属性定义，则显示提示框）
      if (common.getObjItem(page_obj.data, 'user_wxlogin_view_hidden') === null) {
        console.log('user_wxlogin_view_hidden is not exist');
        apiObj.showloginfailTip();
        return;
      }
      //更新页面数据：显示“微信授权登录”弹框
      page_obj.setData({
        user_wxlogin_view_hidden: false
      });
      //设置 微信授权登录成功 回调函数（以便登录成功后执行此回调函数）
      page_obj.login_suc_fun = cb_fun;
    });
  },
  /**
   * 获取用户当前坐标
   */
  get_location: function (sucFun, failFun, type) {
    !type && (type = 'gcj02');
    var getLocation_Fun = function () {
      // 用户已经同意的处理
      wx.getLocation({
        type: type,
        success: function (res) {
          console.log("坐标结果：");
          console.log(res);
          sucFun && sucFun(res);
        },
        fail: function (res) {
          failFun && failFun();
        }
      });
    };

    const userLocation_scope = 'scope.userLocation';
    //获取用户坐标
    apiObj.authorize_scope(userLocation_scope, () => {
      getLocation_Fun();
    }, () => {
      apiObj.openSetting("检测到您没有打开地理位置权限，是否去设置打开？", userLocation_scope, () => {
        getLocation_Fun();
      }, () => {
        failFun && failFun();
      });
    });
  },
  /**
   * 预览图片
   * @param {*} urls 图片url数组
   * @param {*} current_imgurl 当前要预览的图片url（非必传）
   */
  previewImage: function (urls, current_imgurl) {
    //如果current_imgurl参数为空，则默认为图片url数组的第一项
    !current_imgurl && (current_imgurl = urls[0]);
    //调用预览图片接口
    wx.previewImage({
      current: current_imgurl, // 当前显示图片的url
      urls: urls, // 需要预览的图片url列表
      fail: (err) => {
        console.error(err);
      }
    });
  },
  /**
   * 下载服务器端文件并保存到(手机)相册
   * @param {*} file_url 文件url
   * @param {*} suc_fun 保存成功回调函数
   */
  saveImageToPhotosAlbum: function (file_url, suc_fun) {
    wx.downloadFile({
      url: file_url,
      success: function (res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          //如果服务器返回的HTTP状态码为200，则表明文件下载成功，调用保存图片到(手机)相册函数
          apiObj.saveImageToPhotosAlbum_base(res.tempFilePath, suc_fun);
        } else {
          //文件下载失败，隐藏loading并提示
          apiObj.hideLoading();
          apiObj.showModal_tip("下载失败，请稍候再试");
          return;
        }
      }
    });
  },
  /**
   * 保存图片到(手机)相册
   * @param {*} file 本地文件路径
   * @param {*} suc_fun 保存成功回调函数
   */
  saveImageToPhotosAlbum_base: function (file, suc_fun) {
    //获取“保存到相册”的授权
    apiObj.authorize_scope('scope.writePhotosAlbum', () => {
      //用户同意，授权成功处理

      //保存图片到系统相册
      wx.saveImageToPhotosAlbum({
        filePath: file,
        //保存成功回调函数
        success: function (res) {
          suc_fun && suc_fun();
        },
        //保存失败回调函数
        fail: function (res) {
          apiObj.showModal_tip("下载失败，请同意授权后再试");
          return;
        }
      });
    }, (res) => {
      //用户拒绝，授权失败处理：隐藏loading并提示
      apiObj.hideLoading();
      apiObj.showModal_tip("快去设置-打开'保存到相册'授权后再试", null, null, false, '我知道了', "无法保存图片到相册");
    });
  },
  call: function (tel) {
    wx.makePhoneCall({
      phoneNumber: tel
    });
  },
  /**
   * 显示模式对话框
   */
  showModal_tip: function (mes, page_obj, cb_fun, showCancel, confirmText, title) {
    //关闭loading
    apiObj.hideLoading();

    if (page_obj) {
      page_obj.setData({
        loading: false
      });
    }!showCancel && (showCancel = false);
    !confirmText && (confirmText = '确定');
    !title && (title = '');
    !mes && (mes = DEFAULT_TIP);
    wx.showModal({
      title: title,
      content: mes,
      confirmText: confirmText,
      showCancel: showCancel,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          cb_fun && cb_fun(true);
        } else {
          cb_fun && cb_fun(false);
        }
      }
    });
  },
  showToast: function (title, icon, cb_fun, duration) {
    if (icon === true) {
      icon = 'success';
    } else {
      !icon && (icon = 'none');
    }!duration && (duration = 3000);
    wx.showToast({
      title: title,
      mask: true,
      icon: icon,
      duration: duration
    });
    if (cb_fun) {
      setTimeout(function () {
        cb_fun && cb_fun();
      }, duration);
    }
  },
  showLoading: function (title, page_obj) {
    !title && (title = '加载中');
    wx.showLoading({
      title: title,
      mask: true,
    });
  },
  hideLoading: function () {
    try {
      wx.hideLoading();
    } catch (e) {}
  },
  /**
   * 显示登录失败提示框
   */
  showloginfailTip: function () {
    apiObj.showModal_tip("登录失败或超时，请重新进入", null, apiObj.go_index);
  },
  setTitle: function (title) {
    wx.setNavigationBarTitle({
      title: title
    });
  },
  navigateBack: function (delta) {
    !delta && (delta = 1);
    wx.navigateBack({
      delta: delta
    });
  },
  /**
   * 打开授权设置
   */
  openSetting: function (tip, scope, cb_fun, err_fun) {
    console.log('_openSetting');
    apiObj.showModal_tip(tip, null, (isYes) => {
      if (isYes) {
        wx.openSetting({
          success: (res) => {
            console.log(res);
            if (res.authSetting[scope]) {
              cb_fun && cb_fun();
              return;
            }
            err_fun && err_fun();
          },
          fail: () => {
            console.log('openSetting fail');
            err_fun && err_fun();
          }
        });
        return;
      }
      err_fun && err_fun();
    }, true);
  },
  /**
   * 获取授权
   */
  authorize_scope: function (scope, cb_fun, err_fun) {
    wx.getSetting({
      success: (res) => {
        console.log('getSetting');
        if (!res.authSetting[scope]) {
          wx.authorize({
            scope: scope,
            success: () => {
              // 用户已经同意的处理
              cb_fun && cb_fun();
            },
            fail: () => {
              console.log('authorize fail');
              err_fun && err_fun();
            }
          });
        } else {
          cb_fun && cb_fun();
        }
      },
      fail: () => {
        console.log('getSetting fail');
        err_fun && err_fun();
      }
    });
  }
};

// ----------------(以下)内部方法----------------

/**
 * 认证登录处理
 * @param {*} res 用户信息
 * @param {*} cb_fun 登录成功回调函数
 */
function _do_auth_login(res, cb_fun) {
  //调用接口获取登录凭证（code）函数
  _wx_login((code_res) => {
    //构造微信登录请求数据
    var querydata = {
      auth_code: code_res.code,
      auth_iv: res.iv,
      auth_encryptedData: res.encryptedData
    };
    console.log(querydata);

    //向服务器发送 登录 请求
    http.fetchApi('login/auth_login', querydata, (err, res) => {
      if (err) {
        console.log(err);
        apiObj.showloginfailTip();
        return;
      }
      console.log(res);
      if (res.result != 1) {
        apiObj.showModal_tip(res.message);
        return;
      }

      //将服务器返回的 trd_session 写入缓存
      storage.trd_session(res.message);

      //将用户信息 写入缓存
      storage.user_info(res.data);
      //执行登录成功回调函数
      cb_fun && cb_fun();
    }, 'POST');
  });
}

/**
 * 调用接口获取登录凭证（code）
 * @param {*} cb_fun 获取登录凭证成功回调函数
 */
function _wx_login(cb_fun) {
  try {
    //调用登录接口
    wx.login({
      fail: () => {
        //显示登录失败提示框
        apiObj.showloginfailTip();
      },
      success: function (res) {
        console.log('login');
        console.log(res);
        if (!res.code) {
          //显示登录失败提示框
          apiObj.showloginfailTip();
          return;
        }
        cb_fun && cb_fun(res);
      }
    });
  } catch (e) {
    //显示登录失败提示框
    apiObj.showloginfailTip();
  }
}

/**
 * 获取用户信息
 * @param {*} cb_fun 获取成功回调函数
 * @param {*} fail_cb 获取失败回调函数
 */
function _getUserInfo(cb_fun, fail_cb) {
  //调用获取用户信息wx.getUserInfo接口
  wx.getUserInfo({
    //返回登录态信息，返回的数据会包含encryptedData, iv等敏感信息
    withCredentials: true,
    //获取成功回调：只有在已获得“用户信息授权”的情况下，才能成功获取用户信息
    success: function (res) {
      console.log('_getUserInfo suc');
      //调用认证登录函数
      _do_auth_login(res, cb_fun);
    },
    //获取失败回调：未获得“用户信息授权”的情况下
    fail: () => {
      console.log('_getUserInfo fail');
      //执行获取失败回调函数
      fail_cb && fail_cb();
    }
  });
}

module.exports = apiObj;