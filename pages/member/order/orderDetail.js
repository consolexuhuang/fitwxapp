// pages/member/order/orderDetail.js
const app = getApp();
const api = app.api
const utils = require('../../../utils/util.js')
const store = getApp().store;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNum: '',
    orderData: '',
    content: '',
    isMoreContentShow: false,
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '订单详情',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    shareConfig: {
      toTop: 50, //px
      marginTopBar: getApp().globalData.tab_height * 2 + 20
    }, //悬浮分享组件配置
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    coachWxCodeState: false,
    courseShareData:'', //分享课程文案
    // officialData: '', //获取当前场景值对象
    memberFollowState: 1, //当前关注状态
    bottomStyle: 0,
    officialDataState:false,
    memberInfo:'',

    jurisdictionState: false, //授权显示
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //分享过来的参数
    if (options.shareMemberId) {
      wx.setStorageSync('shareMemberId', options.shareMemberId)
    }
    
    const orderNum = options.orderNum
    this.setData({
      orderNum
    })
    // this.getOrderDetail()
  },
  onShow(){
    //检测登录
    app.checkSessionFun().then(() => {
      this.getOrderDetail()
      this.getMemberFollowState()
      this.getOfficialDataState()
    },()=>{
      this.setData({ jurisdictionState: true })
    })
  },
  bindgetuserinfo(){
    app.checkSessionFun().then(() => {
      this.setData({ jurisdictionState: false })
      this.getOrderDetail()
      this.getMemberFollowState()
      this.getOfficialDataState()
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  /**
   * write@xuhuang  start
   */
  // 获取当前用户关注状态
  getMemberFollowState() {
    api.post('v2/member/memberInfo').then(res => {
      console.log('getMemberFollowState', res)
      this.setData({
        memberFollowState: res.msg.sub_flag,
        memberInfo: res.msg
      })
    })
  },
  getOfficialDataState(){
    // sub_flag 1:关注 0:未关注
    if (store.getItem('userData') && store.getItem('userData').sub_flag === 0) {
      this.setData({ officialDataState: true })
    } else if (store.getItem('userData') && store.getItem('userData').sub_flag === 1) {
      this.setData({ officialDataState: false })
    }
  },
  getCourseInfo(courseId){
    const data = {
      id: courseId,
      picType: 1
    }
    api.post('course/getCourse', data).then(res => {
      if (res.code === 0) {
        const courseShareData = res.msg.config.info
        this.setData({
          courseShareData,
        })
      }
    })
  },
  /**
   * write@xuhuang  end
   */
  // 显示教练二维码
  showCoachWxCode() {
    app.compareVersionPromise('2.7.0').then((res) => {
      if (res == 0) {
        this.setData({ coachWxCodeState: true })
      }
    }) 
  },
  onclose() {
    this.setData({ coachWxCodeState: false })
  },
  //订单详情初始化
  getOrderDetail() {
    wx.showLoading({
      title: '加载中...'
    })
    const orderNum = this.data.orderNum
    let data = {
      orderNum
    }
    api.post('payOrder/orderInfo', data).then(res => {
      wx.hideLoading()
      const orderData = res.msg
      this.setData({
        orderData
      })
      this.getCourseInfo(res.msg.course.id)
      this.getContent()
    })
  },
  //处理显示更多
  getContent() {
    const strCont = this.data.orderData.course.needingAttention
    if (strCont.length > 61) {
      const content = strCont.slice(0, 60) + '...'
      const isMoreContentShow = true
      this.setData({
        content,
        isMoreContentShow
      })
    } else {
      const content = strCont
      const isMoreContentShow = false
      this.setData({
        content,
        isMoreContentShow
      })
    }
  },
  showMore() {
    const content = this.data.orderData.course.needingAttention
    const isMoreContentShow = false
    this.setData({
      content,
      isMoreContentShow
    })
  },
  //取消订单
  cancelOrder() {
    //cancelFlag 1:不可取消 2：取消等待 3：未支付 4：可退款 5：不可退款
    if (this.data.orderData.cancelFlag === 3) {
      this.directCancel()
    } else if (this.data.orderData.cancelFlag === 4 || this.data.orderData.cancelFlag === 5) {
      wx.navigateTo({
        url: `/pages/member/order/cancelOrder?orderNum=${this.data.orderNum}`,
      })
    }
  },
  cancelWait(){
    wx.showModal({
      title: '提示',
      content: '是否取消等候？',
      success: res => {
        if(res.confirm){
           this.directCancel()
        }
      }
    })
  },
  // 直接取消预约
  directCancel() {
    let form = {}
    form.orderNum = this.data.orderNum;
    api.post('refundOrder/refund', form).then(ret => {
        //提示
        this.toast(ret.msg);
        // 跳转到订单详情
        this.getOrderDetail()     
    });
  },
  toast(title) {
    wx.showToast({
      title: title,
      duration: 3000
    });
  },
  //查看地图
  handleLocationTap: function (event) {
    console.log(event)
    const name = event.currentTarget.dataset.name
    const address = event.currentTarget.dataset.address
    const latitude = Number(event.currentTarget.dataset.latitude)
    const longitude = Number(event.currentTarget.dataset.longitude)
    wx.openLocation({
      name,
      address,
      latitude,
      longitude,
      scale: 18
    })
  },
  //跳转线webUrl
  handleRouteGuidanceTap() {
    wx.navigateTo({
      url: '/pages/store/routeGuidance?webUrl=' + this.data.orderData.store.mapPic
    })
  }, 
  // 跳转教练课程列表
  handleCoachTap: function (event) {
    // console.log(event)
    const coachId = event.currentTarget.dataset.coachid
    wx.navigateTo({
      url: '/pages/coach/coach?coachId=' + coachId
    })
  },
  //分享
  onShareAppMessage() {
    const storeId = this.data.storeId
    // console.log(utils.formatTime2(this.data.orderData.course.beginDate))
    return {
      title: this.data.courseShareData,
      path: '/pages/course/courseDetail?courseId=' + this.data.orderData.course.id + '&shareMemberId=' + wx.getStorageSync('shareMemberId'),
      // imageUrl: this.data.picList[0],
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },

})