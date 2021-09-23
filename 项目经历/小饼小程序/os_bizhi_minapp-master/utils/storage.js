const common = require("common.js");

/**
 * 用户会话session
 */
const KEY_trd_session = 'trd_session';
/**
 * 用户信息
 */
const KEY_user_info = 'user_info';
/**
 * app版本
 */
const APPVERSION = 1;

/**
 * 设置或获取缓存
 * @param {*} name 缓存名称(key)
 * @param {*} info 缓存信息(value)
 * @param {*} is_set 是否是设置缓存，默认不传此参数，则为false
 */
function setorget_cache(name, info, is_set) {
  //如果是设置缓存 或 缓存信息不为空，都是设置缓存操作
  if (is_set || info) {
    //调用wx.setStorageSync同步设置缓存接口，设置缓存
    return wx.setStorageSync(name, info);
  }
  //调用wx.getStorageSync同步获取缓存接口，获取缓存并返回
  return wx.getStorageSync(name);
}

var obj = {
  /**
   * tabBar 右上角的红点
   */
  tabbarreddot: function (info, is_set) {
    return setorget_cache('tabbarreddot', info, is_set);
  },
  /**
   * '开启提醒'提示今天是否已显示
   */
  open_notice_isshowed: function (info, is_set) {
    return setorget_cache('open_notice_isshowed', info, is_set);
  },
  /**
   * 图片解锁信息
   * @param {*} info 解锁信息
   * @param {*} is_set 是否是设置缓存 
   */
  image_unlock_info: function (info, is_set) {
    return setorget_cache('image_unlock_info', info, is_set);
  },
  getsysinfo: function () {
    return wx.getSystemInfoSync();
  },
  trd_session: function (info, is_set) {
    return setorget_cache(KEY_trd_session, info, is_set);
  },
  user_info: function (info, is_set) {
    return setorget_cache(KEY_user_info, info, is_set);
  },
  appVersion: function () {
    return APPVERSION;
  }
}

module.exports = obj;