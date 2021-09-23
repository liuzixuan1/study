'use strict';

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

// const HOST_BASE = 'http://192.168.1.3:8113/';//for 本地
const HOST_BASE = 'http://xcxstudyapi.hbcwxkj.com/';//for 外网正式api
const API_HOST_URI = HOST_BASE + 'bizhi/';//for 外网正式api
const storage = require('storage.js');
/**
 * 默认数据请求加载提示
 */
const Loading_tip = "请稍候，正在加载中...";

console.log("In the APP,i only could be load once!");

function _do_upload(url, tempFilePath, fileName, data, callback) {
  !fileName && (fileName = 'file');

  url = API_HOST_URI + url;
  console.log("url : " + url);
  console.log(data);

  wx.uploadFile({
    url: url,
    filePath: tempFilePath,
    name: fileName,
    formData: data,
    header: _get_header(),
    success(res) {
      callback(null, res.data);
    },
    fail(e) {
      callback(e);
    }
  });
}

/**
 * 执行网络请求
 * @param {*} url 接口相对url
 * @param {*} data 请求数据
 * @param {*} callback 回调函数
 * @param {*} method 请求类型，默认为：POST
 */
function _do_request(url, data, callback, method) {
  //判断请求类型是否为空，是则设置默认值
  !method && (method = 'POST');
  //构造完整的请求url
  url = API_HOST_URI + url;
  //获取header对象
  let header = _get_header();
  //调用wx.request接口，wx.request
  wx.request({
    url: url,
    data: data,
    method: method,
    header: header,
    //成功回调
    success(res) {
      callback(null, res.data);
    },
    //失败回调
    fail(e) {
      callback(e);
    }
  });
}

/**
 * 获取网络请求header对象信息
 */
function _get_header() {
  //从本地缓存中获取用户会话session（用户token）
  let token = storage.trd_session();
  //判断token是否为空，是则设置默认值
  token = token ? token : '';
  //返回header对象信息
  return {
    //媒体格式类型：form表单数据
    'Content-Type': 'application/x-www-form-urlencoded',
    //用户token，服务端可从请求header中获取cwxkj-x-token的值
    "cwxkj-x-token": token,
    //应用版本号
    "cwxkj-x-app-version": 3
  };
}

module.exports = {
  host_base: HOST_BASE,
  uploadApi: _do_upload,
  fetchApi: _do_request,
  loadingTip: Loading_tip
};