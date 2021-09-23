const http = require("http.js");
const wx_api = require("wx_api.js");
const storage = require('storage.js');
const common = require("common.js");

/**
 * 用户需要登录的服务器返回状态码
 */
const NEEDLOGINCODE = -100;

var obj={
  default_img: http.host_base + '/default_img.jpg',
  /**
   * 下载图片
   * @param {*} image_url 图片url
   * @param {*} data 下载图片请求数据
   */
  download_image: function (image_url,data){
    //如果请求数据为空，则设置默认值
    !data && (data=[]);
    wx_api.showLoading('处理中');
    //构造请求数据
    data.image_url = image_url;
    //请求接口：因壁纸图片存储在七牛云上，绑定的域名不在小程序downloadFile合法域名中，所以需要通过服务端下载图片，然后以接口域名返回图片url
    obj.getIndexApiResult('index/download_image', data, (res) => {
      console.log(res);
      //下载失败判断并提示
      if (!res.result) {
        wx.hideLoading();
        wx_api.showModal_tip("下载失败，请稍候再试");
        return;
      }
      //调用下载服务器端文件并保存到(手机)相册的函数
      wx_api.saveImageToPhotosAlbum(res.message, () => {
        wx.hideLoading();
        wx_api.showToast('已保存到手机相册');
      });
    });
  },
  getApiResult: function (url, querydata, cb_fun, errcb_fun, method) {
    !querydata && (querydata = {});
    http.fetchApi(url, querydata, (err, res) => {
      if (err) {
        _error_handle(err, errcb_fun);
        return;
      }
      console.log(res);
      cb_fun && cb_fun(res);
    }, method);
  },
  getIndexApiResult: function (action, querydata, cb_fun, errcb_fun, method) {
    let url = action;
    !querydata && (querydata = {});
    http.fetchApi(url, querydata, (err, res) => {
      if (err) {
        _error_handle(err, errcb_fun);
        return;
      }
      console.log(res);
      cb_fun && cb_fun(res);
    }, method);
  },
  /**
   * 获取需登录验证的接口请求返回值
   * @param {*} url 接口url
   * @param {*} querydata 请求参数数据
   * @param {*} cb_fun 请求成功回调
   * @param {*} errcb_fun 请求失败回调
   * @param {*} is_must_login 是否是必须要登录
   */
  getMyApiResult: function (url, querydata, cb_fun, errcb_fun, is_must_login) {
    //判断请求失败回调是否为空，是则设置默认值
    if (!errcb_fun) {
      errcb_fun = (err) => {
        wx_api.showModal_tip('');
      };
    }
    //执行“须登录验证”的api请求
    _authApiRequest(url, querydata, cb_fun, errcb_fun, is_must_login);
  },
  getMyApiUploadResult: function (action, tempFilePath, fileName, querydata, cb_fun, errcb_fun) {
    console.log("getMyApiUploadResult");
    let url = action;
    if (!errcb_fun) {
      errcb_fun = (err) => {
        wx_api.showModal_tip('');
      };
    }
    _authApiUpload(url, tempFilePath, fileName, querydata, cb_fun, errcb_fun);
  },
  /**
   * 获得剩下窗口高度
   * @param uiHeight:已知(要减去)的组件高度(单位：rpx)
   * @param sysinfo: 设备信息，可为空
   * @return 剩下窗口高度(单位：px)
   */
  getPartWinHeight: function (uiHeight, sysinfo) {
    !sysinfo && (sysinfo = storage.getsysinfo());
    return (sysinfo.windowHeight - (sysinfo.windowWidth / 750) * uiHeight);
  }
};


/**
 * http错误是否已弹框提示（避免同一个界面多次弹出）
 */
let is_http_error_tiped = false;
/**
 * http错误处理
 */
function _error_handle(err, errcb_fun) {
  console.log(err);
  if (errcb_fun) {
    errcb_fun(err);
  } else {
    if (is_http_error_tiped) {
      return;
    }
    is_http_error_tiped = true;
    wx_api.showModal_tip(wx_api.default_tip, null, () => {
      is_http_error_tiped = false;
    });
  }
}

/**
 * 执行“须登录验证”的api请求
 * @param {*} url 接口相对url
 * @param {*} querydata 请求参数
 * @param {*} cb_fun 成功回调函数
 * @param {*} errcb_fun 失败回调函数
 * @param {*} is_must_login 是否是必须登录，默认：true
 */
function _authApiRequest(url, querydata, cb_fun, errcb_fun, is_must_login) {
  //判断参数is_must_login是否未传值，是则设置默认值
  if (common.is_undefined(is_must_login)) {
    is_must_login = true;//默认
  }
  //获取当前页面对象
  let page_obj = wx_api.getCurrentPage();
  //存放已尝试登录次数，默认为：0
  var tryCount = 0;
  //如果请求参数为空，则设置默认值
  !querydata && (querydata = {});
  /**
   * 接口请求函数变量
   */
  var tempFun = () => {
    //调用网络请求函数
    http.fetchApi(url, querydata, (err, res) => {
      //判断请求是否出错
      if (err) {
        //调用http错误处理函数，给与用户提示
        _error_handle(err, errcb_fun);
        return;
      }
      //判断接口返回值是否等于用户需要登录的服务器返回状态码（-100）
      if (res.result == NEEDLOGINCODE) {
        //用户会话session（登录状态）可能已过期，需要清空session缓存
        storage.trd_session(null, true);
        //判断是否已尝试登录过
        if (!tryCount) {
          //没有登录过，则强制登录，只执行一次
          wx_api.login(tempFun, is_must_login);
          //已尝试登录次数+1
          tryCount++;
        } else {
          //如果是已尝试登录过 且 是必须登录，则显示登录失败弹框
          is_must_login && wx_api.showloginfailTip();
        }
        return;
      }
      //判断页面数据user_wxlogin_view_hidden是否等于false：即“微信授权登录”弹框是否处于显示状态
      if (common.getObjItem(page_obj.data, 'user_wxlogin_view_hidden') === false) {
        //隐藏“微信授权登录”弹框
        page_obj.setData({
          user_wxlogin_view_hidden: true
        });
      }
      //执行接口请求成功回调函数
      cb_fun && cb_fun(res);
    }, 'POST');
  };

  //接口请求之前判断：如果是必须登录 且 本地session缓存为空 且 页面数据对象中存在user_wxlogin_view_hidden属性，则显示登录弹框
  if (is_must_login && !storage.trd_session() && common.getObjItem(page_obj.data, 'user_wxlogin_view_hidden') !== null) {
    //显示“微信授权登录”弹框
    page_obj.setData({
      user_wxlogin_view_hidden: false
    });
    //设置 微信授权登录成功 回调函数为：接口请求函数
    page_obj.login_suc_fun = tempFun;
    //隐藏loading
    wx_api.hideLoading();
    return;
  }
  //执行接口请求函数
  tempFun();
}

/**
 * 执行“必须登录验证”的api文件上传
 */
function _authApiUpload(url, tempFilePath, fileName, querydata, cb_fun, errcb_fun) {
  wx_api.checkSession(() => {
    console.log("_authApiUpload");
    var tryCount = 0;
    !querydata && (querydata = {});
    var tempFun = () => {
      var temp_querydata = querydata;

      http.uploadApi(url, tempFilePath, fileName, temp_querydata, (err, res) => {
        if (err) {
          console.log(err);
          errcb_fun && errcb_fun(err);
          return;
        }
        console.log(res);
        if (res.result == NEEDLOGINCODE) {
          console.log("tryCount :" + tryCount);
          if (!tryCount) {
            //强制登录
            wx_api.login(tempFun);
            tryCount++;
          } else {
            wx_api.showloginfailTip();
          }
          return;
        }
        cb_fun && cb_fun(res);
      });
    };
    tempFun();
  });
}

module.exports = obj;