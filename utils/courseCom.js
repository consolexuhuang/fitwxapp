const app = getApp();
const api = app.api;
const store = app.store;

// 获取配置信息
var getConfig = function(_this) {
  const data = {
    latitude: app.globalData.location && app.globalData.location.latitude || '31.24916171',
    longitude: app.globalData.location && app.globalData.location.longitude || '121.487899486',
  }
  return api.post('v2/course/getConfig', data).then(res => {
    const config = res.msg
    const cityList = config.storeList ? Object.keys(config.storeList) : ''
    const city = _this.data.city || cityList[0] || ''

    /* dateList */
    const dateList = config.dataList.list
    const active = _this.data.active || config.dataList.active
    //设置swiper
    let swiperHeight = {};
    for (let item of dateList) {
      swiperHeight[item.date] = 0
    }

    /* promotion */
    const promotion = config.promotion;
    let activityPopupStateImgSrc = '', activityPopupStateUrl = '', activityPopupStateState = false;

    if (Object.keys(promotion).length > 0) {
      activityPopupStateImgSrc = promotion.image ;
      activityPopupStateUrl = promotion.url;
      activityPopupStateState = (_this.data.nowGetTime - store.getItem('closeTime') || new Date().getTime()) > 86400000 ? true : false;
    }

    _this.setData({
      config,
      cityList,
      city,
      dateList,
      active,
      swiperHeight,
      'activityPopupState.imgSrc': activityPopupStateImgSrc,
      'activityPopupState.url': activityPopupStateUrl,
      'activityPopupState.state': activityPopupStateState
    }, function() {
      //获取日历列表高度
      if (_this.dateBoxHeight) {
        _this.dateBoxHeight();
      }
    })

  })
}


// 获取课程列表
var getCourseList = function(param, _this) {
  return api.post('v2/course/getCourseList2', param).then(res => {
    const courseList = res.msg
    //如果是搜索、选课程进来的去掉空店铺
    if (param.searchText || param.labelIds || param.timeIntervals) {
      let courses = courseList.courses;
      let coursesNew = {};
      for (let date in courses) { //循环日期
        coursesNew[date] = {};
        for (let storeCode in courses[date]) { //循环店铺
          if (courses[date][storeCode].length) {
            coursesNew[date][storeCode] = courses[date][storeCode];
          }
        }
      }
      //赋值
      courseList.courses = coursesNew;
    }
    //解决隐藏结束后没有数据也给出对象
    if (_this.data.isOver) {
      for (let date in courseList.courses) {
        if (JSON.stringify(courseList.courses[date]) == '{}') {
          delete courseList.courses[date];
        }
      }
    }

    //设置数据
    _this.setData({
      courseList
    })
    _this.getDisplayedStore()
  })
}


export default {
  getConfig,
  //getDateList,
  getCourseList
}