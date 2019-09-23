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


module.exports = {
  formatTime: formatTime,
  formatTime2,
  formatTime3,
  getQueryString,
  getUrlParam
}