// pages/coach/coach.js
const app = getApp();
const api = app.api;
const ui = require('../../utils/ui.js');
const store = app.store;

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
    swiperHeight: getApp().globalData.systemInfo.screenHeight - (getApp().globalData.tab_height * 2 + 20) - 75,
    // officialData: '', //获取当前场景值对象
    memberFollowState: 1, //当前关注状态
    bottomStyle: 0,
    officialDataState: false,
    pageShowNoticeState: false,
    memberInfo:'',

    jurisdictionSmallState: false, //授权显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    //分享过来的参数
    if (options.shareMemberId){
      wx.setStorageSync('shareMemberId', options.shareMemberId)
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
    this.getMemberFollowState()
    this.getCoach()
    this.getDateList()
    // this.getOfficialDataState()
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  bindgetuserinfo(){
    //检测登录
    app.checkSessionFun().then(() => {
      this.setData({ jurisdictionSmallState: false })
      this.getMemberFollowState()
    })
  },
  /**
   * write@xuhuang  start
   */
  // 获取当前用户关注状态
  getMemberFollowState() {
    if (app.passIsLogin()) {
      api.post('v2/member/memberInfo').then(res => {
        console.log('getMemberFollowState', res)
        this.setData({
          memberFollowState: res.msg.sub_flag,
          officialDataState: res.msg.sub_flag == 1 ? false : true,
          memberInfo: res.msg
        })
      })
    }
  },
  // getOfficialDataState() {
  //   // sub_flag 1:关注 0:未关注
  //   if (store.getItem('userData') && store.getItem('userData').sub_flag === 0) {
  //     this.setData({ officialDataState: true })
  //   } else if (store.getItem('userData') && store.getItem('userData').sub_flag === 1) {
  //     this.setData({ officialDataState: false })
  //   }
  // },
  // bindload(e) {
  //   console.log('official-account_success', e.detail)
  //   this.setData({ officialData: e.detail })
  // },
  // binderror(e) {
  //   console.log('official-account_fail', e.detail)
  //   this.setData({ officialData: e.detail })
  // },
  /**
   * write@xuhuang  end
   */
  // 教练详情
  getCoach: function(event) {
    let coachId = this.data.coachId
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
    // console.log('aa', this.data.coachData.headUrl.indexOf('?'))
    if (this.data.coachData && this.data.coachData.headUrl && this.data.coachData.headUrl.indexOf('?') !== -1){
      const idx = this.data.coachData.headUrl.indexOf('?')
      coachHeadUrl = this.data.coachData.headUrl.substring(0, idx)
    } else {
      coachHeadUrl = this.data.coachData.headUrl
    }
    console.log('coachHeadUrl', coachHeadUrl)
    return {
      title: `Justin&Julie教练- ${this.data.coachData.coachName}`,
      path: '/pages/coach/coach?coachId=' + this.data.coachId + '&shareMemberId=' + wx.getStorageSync('shareMemberId'),
      imageUrl: coachHeadUrl,
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },
})