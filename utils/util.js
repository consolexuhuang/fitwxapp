const formatTime = dates => {
  const date = new Date(dates)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//转化 xx月 xx日
const formatTime2 = dates => {
  const date = new Date(dates)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return formatNumber(month) + '月' + formatNumber(day) + '日'
}
//转化 xx:xx
const formatTime3 = dates => {
  const date = new Date(dates)
  const hour = date.getHours()
  const minute = date.getMinutes()
  return formatNumber(hour) + ':' + formatNumber(minute)
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const getQueryString = (url, name) => {
  console.log("url = " + url)
  console.log("name = " + name)
  var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
  var r = url.substr(1).match(reg)
  if (r != null) {
    console.log("r = " + r)
    console.log("r[2] = " + r[2])
    return r[2]
  }
  return null;
}

//获取路径参数
const getUrlParam = (url, paraName) => {
  var arrObj = url.split("?");
  if (arrObj.length > 1) {
    var arrPara = arrObj[1].split("&");
    var arr;
    for (var i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split("=");
      if (arr != null && arr[0] == paraName) {
        return arr[1];
      }
    }
    return "";
  }
  else {
    return "";
  }
}
//判断活动是否在有效期时间内
const getActiveRestTime = date => {
  let currentTime = new Date().getTime()
  let endTime = new Date(date).getTime()
  if (endTime - currentTime > 0) return true
  else return false
}
// 对象排序 倒序
const sortList = (targetArr, key) => {
  return targetArr.sort((a, b) => {
    var val1 = a[key]
    var val2 = b[key]
    return val2 - val1
  })
}
// 格式化二维码地址
const formatUrlParams = (baseUrl, data) => {
  baseUrl += (baseUrl.indexOf('?') < 0 ? '?' : '&') + param(data)
  return baseUrl
}
const param = (data) => {
  let url = ''
  // 遍历data对象，取出需要的参数
  for (var k in data) {
    // 如果当前value为undefined ，则返回空字符串
    let value = data[k] !== undefined ? data[k] : ''
    // 得到参数，并且拼接参数，为下一步拼接到url后面做准备
    url += '&' + k + '=' + encodeURIComponent(value)
  }
  // 如果url存在，则去除首字符并返回，因为主函数已经包含了'&'，否则返回空串
  return url ? url.substring(1) : ''
}
module.exports = {
  formatTime: formatTime,
  formatTime2,
  formatTime3,
  getQueryString,
  getUrlParam,
  getActiveRestTime,
  sortList,
  formatUrlParams
}