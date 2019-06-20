// pages/coach/coach.js
const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateList: '',
    courseList: '',
    coachId: '',
    coachData: '',
    active: 0,
    isDescriptionShow: true,
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '教练详情',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    swiperHeight: getApp().globalData.systemInfo.screenHeight - (getApp().globalData.tab_height * 2 + 20) - 75
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const coachId = options.coachId;
    //从课程页面过来的
    let active = options.active;
    if (active){
      this.setData({
        active
      })
    };
    this.setData({
      coachId
    })
    this.getCoach()
    this.getDateList()
  },
  // 教练详情
  getCoach: function(event) {
    const coachId = this.data.coachId
    const data = {
      id: coachId
    }
    api.post('coach/getCoach', data).then(res => {
      const coachData = res.msg.coach
      this.setData({
        coachData
      })
    })
  },
  // 获取日期列表
  getDateList: function(event) {
    api.post('course/getDateList').then(res => {
      const dateList = res.msg.list
      const active = res.msg.active;
      //从课程页面过来
      if (this.data.active){
        this.setData({
          dateList
        })
      }
      //其他页面过来
      else{
        this.setData({
          dateList,
          active
        })
      };      
      this.getCourseList()
    })
  },
  // 获取课程列表
  getCourseList: function(event) {
    const coachId = this.data.coachId
    const latitude = getApp().globalData.location.latitude
    const longitude = getApp().globalData.location.longitude
    const data = {
      coachId,
      latitude,
      longitude
    }
    api.post('v2/course/getCourseList2', data).then(res => {
      const courseList = res.msg
      this.setData({
        courseList
      })
    })
  },
  // 点击切换日期
  handleDateTap: function(event) {
    const active = event.currentTarget.dataset.index
    this.setData({
      active
    })
  },
  // 切换列表
  handleCurrentChange: function(event) {
    const active = event.detail.current
    this.setData({
      active
    })
  },
  // // 点击位置展示地图
  // handleLocationTap: function(event) {
  //   const name = event.currentTarget.dataset.name
  //   const address = event.currentTarget.dataset.address
  //   const latitude = Number(event.currentTarget.dataset.latitude)
  //   const longitude = Number(event.currentTarget.dataset.longitude)
  //   wx.openLocation({
  //     name,
  //     address,
  //     latitude,
  //     longitude,
  //     scale: 18
  //   })
  // },
  // 点击店铺跳转
  handleStoreTap: function(event) {
    const storeId = event.currentTarget.dataset.storeId
    wx.navigateTo({
      url: '/pages/store/storeDetail?storeId=' + storeId
    })
  },
  // 跳转课程详情
  handleCourseTap: function(event) {
    const courseId = event.currentTarget.dataset.courseId
    wx.navigateTo({
      url: '/pages/course/courseDetail?courseId=' + courseId
    })
  },
  // 课程预约
  handleAppointBtnTap: function(event) {
    const courseId = event.currentTarget.dataset.courseId
    wx.navigateTo({
      url: '/pages/order/payOrder?courseId=' + courseId
    })
  },
  handleScroll: function(event){
    const scrollTop = event.detail.scrollTop
    if (scrollTop > 0) {
      const isDescriptionShow = false
      this.setData({
        isDescriptionShow
      })
    } else this.setData({ isDescriptionShow : true})
  },

  //分享
  onShareAppMessage() {
    const storeId = this.data.storeId
    return {
      title: `Justin&Julie教练- ${this.data.coachData.coachName}`,
      path: '/pages/coach/coach?coachId=' + this.data.coachId,
      imageUrl: this.data.coachData.headUrl,
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
})