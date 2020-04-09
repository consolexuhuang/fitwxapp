// pages/coach/coach.js
const app = getApp();
const api = app.api;
const ui = require('../../utils/ui.js');
const store = app.store;
let coachId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateList: '',
    courseList: '',
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
    marginTopBar: getApp().globalData.header_bar_height,
    swiperHeight: getApp().globalData.systemInfo.screenHeight - (getApp().globalData.tab_height * 2 + 20) - 75,
    // officialData: '', //获取当前场景值对象
    // memberFollowState: 1, //当前关注状态
    // bottomStyle: 0,
    // officialDataState: false,
    // pageShowNoticeState: false,
    memberInfo:'',

    jurisdictionSmallState: false, //授权显示
    tabIndex:0,//默认显示第一个tab
    personalList:'',//私教列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //分享过来的参数
    if (options.shareMemberId){
      wx.setStorageSync('shareMemberId', options.shareMemberId)
    }
    coachId = options.coachId ? options.coachId : '';
    //从课程页面过来的
    let active = options.active;
    if (active){
      this.setData({
        active
      })
    };
    //识别二维码过来的
    if (options.scene) {
      //把编译后的二维码参数转成需要的参数
      this.getSeneBycode(options.scene).then((res) => {
        let resData = JSON.parse(res.msg);
        coachId = resData.coachId;
        //设置数据
        wx.setStorageSync('shareMemberId', resData.shareMemberId);
        //初始化数据
        this.init();        
      }).catch((err) => {
        console.error('二维码参数转换错误：' + err);
      })
    }
    else {
      this.init();
    };      
  },
  //初始化数据
  init() {
    //检测登录 
    app.checkSessionFun().then(() => {
      this.getCoach()
      this.getDateList()
    }, () => {
      this.setData({ jurisdictionState: true })
    })

  },
  bindgetuserinfo(){
    //检测登录
    app.checkSessionFun().then(() => {
      this.setData({ jurisdictionSmallState: false })
    })
  },
  // 表单阻止冒泡
  noop() {
    console.log('noop')
  },
  // 教练详情
  getCoach: function(event) {
    let data = {
      id: coachId
    }
    api.post('coach/getCoach', data).then(res => {
      let coachData = res.msg.coach
      this.setData({
        coachData
      })
    })
  },
  // 获取日期列表
  getDateList: function(event) {
    api.post('course/getDateList').then(res => {
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
      this.getCourseList();
      this.getPersonalList();
    })
  },
  // 获取课程列表
  getCourseList: function(event) {
    let latitude = getApp().globalData.location.latitude
    let longitude = getApp().globalData.location.longitude
    let data = {
      coachId,
      latitude,
      longitude
    }
    //loading
    ui.showLoadingMask();
    api.post('v2/course/getCourseList2', data).then(res => {
      
      let courseList = res.msg
      this.setData({
        courseList
      },function(){
        ui.hideLoading();
      })
    })
  },
  // 获取私教列表
  getPersonalList: function (event) {
    let latitude = getApp().globalData.location.latitude
    let longitude = getApp().globalData.location.longitude
    let data = {
      coachId,
      latitude,
      longitude
    }
    //loading
    ui.showLoadingMask();
    api.post('v2/good/getPersonalList', data).then(res => {
      console.log('personal list')
      console.log(res)

      let personalList = res.msg
      this.setData({
        personalList
      }, function () {
        ui.hideLoading();
      })
    })
  },
  //切换tab
  handleSwithTab(e){
    let tabIndex = Number(e.currentTarget.dataset.index);
   this.setData({
     tabIndex
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

  // 点击店铺跳转
  handleStoreTap: function(event) {
    const storeId = event.currentTarget.dataset.storeId
    wx.navigateTo({
      url: '/pages/store/storeDetail?storeId=' + storeId
    })
  },
  // 跳转课程详情
  handleCourseTap: function(event) {
    if (app.passIsLogin()) {
      const courseId = event.currentTarget.dataset.courseId
      wx.navigateTo({
        url: '/pages/course/courseDetail?courseId=' + courseId
      })
    } else {
      this.setData({ jurisdictionSmallState: true })
    }
  },
  // 课程预约
  handleAppointBtnTap: function(event) {
    if (event.detail.formId !== 'the formId is a mock one') {
      store.setItem('formId', [...(store.getItem('formId') || ''), event.detail.formId])
    }
    if (app.passIsLogin()) {
      const courseId = event.currentTarget.dataset.courseId
      wx.navigateTo({
        url: '/pages/order/payOrder?courseId=' + courseId
      })
    } else {
      this.setData({ jurisdictionSmallState: true })
    }
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
    let coachHeadUrl = ''
    if (this.data.coachData && this.data.coachData.headUrl && this.data.coachData.headUrl.indexOf('?') !== -1){
      const idx = this.data.coachData.headUrl.indexOf('?')
      coachHeadUrl = this.data.coachData.headUrl.substring(0, idx)
    } else {
      coachHeadUrl = this.data.coachData.headUrl
    }
    return {
      title: `Justin&Julie教练- ${this.data.coachData.coachName}`,
      path: '/pages/coach/coach?coachId=' + coachId + '&shareMemberId=' + wx.getStorageSync('userData').id,
      imageUrl: coachHeadUrl,
    }
  },
  //获取小程序场景码获取实际的参数信息
  getSeneBycode(code) {
    let params = {
      code: code
    }
    return api.post('getSeneBycode', params);
  },
  // 跳转私教课程详情
  handlePCourseTap: function (event) {
    if (app.passIsLogin()) {
      const courseId = event.currentTarget.dataset.courseId
      wx.navigateTo({
        url: '/pages/course/courseDetailPersonal?courseId=' + courseId
      })
    } else {
      this.setData({ jurisdictionSmallState: true })
    }
  },
})