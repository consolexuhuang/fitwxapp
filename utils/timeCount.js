const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const getStopTime = (endTime, typeHour = 1) => {
  var timeObj = {}
  var nowTime = new Date()
  var hasTime = endTime - nowTime //剩下的毫秒数
  var hasSecond = parseInt(hasTime / 1000)           //剩下的秒数
  var hasDay = Math.floor(hasSecond / (60 * 60 * 24))//剩下的天数

  var hasHour = Math.floor((hasSecond - hasDay * 24 * 60 * 60) / 3600);//剩余小时
  var ComputHour = hasHour + hasDay * 24  //剩余总小时数
  var hasMinute = Math.floor((hasSecond - hasDay * 24 * 60 * 60 - hasHour * 60 * 60) / 60);//剩余分钟
  var hasSecond2 = Math.floor(hasSecond - hasDay * 24 * 3600 - hasHour * 3600 - hasMinute * 60);//剩余秒数
  if (nowTime >= endTime) {
    return false
  }
  return timeObj = {
    hasDay: formatNumber(hasDay),
    hasHour: typeHour == 2
      ? formatNumber(ComputHour)
      : formatNumber(hasHour),
    hasMinute: formatNumber(hasMinute),
    hasSecond2: formatNumber(hasSecond2)
  }
};
/**
 * typeHour 1 正常小时数 <= 24h ; 2 总小时数
 */
const timeCount = (_this, typeHour = 2) => {  //typeHour 1.使用正常小时数 2.使用总小时数
  return new Promise((resolve,reject) => {
    var timer = null
    timer = setInterval(() => {
        // console.log(timer)
      for (let i = 0; i < _this.data.countList.length; i++) {
        let objModel = _this.data.countList[i]
          if (new Date().getTime() > objModel.endTime) {
            _this.setData({
              ['countList[' + i + '].timeObj']: false
            })
            resolve()
            clearInterval(timer)
          } else {
            _this.setData({
              ['countList[' + i + '].timeObj']: getStopTime(objModel.endTime, typeHour)
            })
            // console.log(countList)
          }
        }
    }, 1000, _this)
    _this.setData({ timerIdList: [..._this.data.timerIdList, timer] }, () => {
      console.log(`${_this.route}-页面timerId开启`, _this.data.timerIdList, _this.data.countList)
    })
  })
}

export default { timeCount }