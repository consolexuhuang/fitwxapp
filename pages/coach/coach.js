// pages/coach/coach.js
const app = getApp();
const api = app.api;
const ui = require('../../utils/ui.js');
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
    console.log('tokennnnnnnnn')
    console.log(wx.getStorageSync('userData').token)
    console.log('options.shareMemberId onload')
    console.log(options.shareMemberId)
    //loading
    ui.showLoadingMask();

    //分享过来的参数
    if (options.shareMemberId){
      wx.setStorageSync('shareMemberId', options.shareMemberId)
      console.log('2222 options.shareMemberId onload')
      console.log(wx.getStorageSync('shareMemberId'))
    }
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

    //检测登录
    app.checkSessionFun().then(() => {
    this.getCoach()
    this.getDateList()
    })
  },
  onShow:function(){
    
  },
  // 教练详情
  getCoach: function(event) {
    let coachId = this.data.coachId
    let data = {
      id: coachId
    }
    console.log('token coach/getCoach')
    console.log(wx.getStorageSync('userData').token)
    api.post('coach/getCoach', data).then(res => {
      console.log('api coach/getCoach')
      console.log(res)

      let coachData = res.msg.coach
      this.setData({
        coachData
      })
    })
  },
  // 获取日期列表
  getDateList: function(event) {
    console.log('token course/getDateList')
    console.log(wx.getStorageSync('userData').token)
    api.post('course/getDateList').then(res => {
      console.log('api course/getDateList')
      console.log(res)
      let dateList = res.msg.list
      let active = res.msg.active;
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
    let coachId = this.data.coachId
    let latitude = getApp().globalData.location.latitude
    let longitude = getApp().globalData.location.longitude
    let data = {
      coachId,
      latitude,
      longitude
    }

    console.log('api after0000 data')
    console.log(data)
    console.log('token v2/course/getCourseList2')
    console.log(wx.getStorageSync('userData').token)
    api.post('v2/course/getCourseList2', data).then(res => {
      console.log('api after11111 data')
      console.log(data)
      console.log('api v2/course/getCourseList2')
      console.log(res)
      let courseList = res.msg
      this.setData({
        courseList
      },function(){
        ui.hideLoading();
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
      path: '/pages/coach/coach?coachId=' + this.data.coachId + '&shareMemberId=' + wx.getStorageSync('shareMemberId'),
      imageUrl: this.data.coachData.headUrl,
      success: function (res) {
        console.log('onShareAppMessage success')
        console.log(this.path)
      },
      fail: function (res) {
      }
    }
  },
})