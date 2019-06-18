const app = getApp();
const api = app.api;

// 获取配置信息
var getConfig = function (_this) {
  const data = {
    latitude: app.globalData.location && app.globalData.location.latitude || '31.24916171',
    longitude: app.globalData.location && app.globalData.location.longitude || '121.487899486',
  }
  return api.post('v2/course/getConfig', data).then(res => {
      const config = res.msg
      const cityList = config.storeList ? Object.keys(config.storeList) : ''
      const city = _this.data.city || cityList[0] || ''
      _this.setData({
        config,
        cityList,
        city
      })
        
  })
}

// 获取日期列表
var getDateList = function (_this) {
  return api.post('course/getDateList').then(res => {
    const dateList = res.msg.list
    const active = res.msg.active
    //设置swiper
    let swiperHeight={};
    for (let item of dateList){
      swiperHeight[item.date]=0
    }
    _this.setData({
      dateList,
      active,
      swiperHeight
    },function(){
      //获取日历列表高度
      if (_this.dateBoxHeight){
        _this.dateBoxHeight();
      }      
    })
  })
}

// 获取课程列表
var getCourseList = function (param,_this) {  
  return api.post('v2/course/getCourseList2', param).then(res => {
    const courseList = res.msg
    //如果是搜索、选课程进来的去掉空店铺
    if (param.searchText || param.labelIds || param.timeIntervals){
      let courses = courseList.courses;
      let coursesNew={};
      for (let date in courses){//循环日期
        coursesNew[date] = {};
        for (let storeCode in courses[date]){//循环店铺
          if (courses[date][storeCode].length){
            coursesNew[date][storeCode] = courses[date][storeCode];
          }
        }
      }
      //赋值
      courseList.courses = coursesNew;

    }
   //设置数据
    _this.setData({
      courseList
    })
    _this.getDisplayedStore()
  })
}


export default{
  getConfig,
  getDateList,
  getCourseList
}