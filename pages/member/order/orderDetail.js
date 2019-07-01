// pages/member/order/orderDetail.js
const app = getApp();
const api = app.api
const utils = require('../../../utils/util.js')
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
    // officialData: '', //获取当前场景值对象
    memberFollowState: 1, //当前关注状态
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
    })
  },
  /**
   * write@xuhuang  start
   */
  // 获取当前用户关注状态
  getMemberFollowState() {
    api.post('v2/member/memberInfo').then(res => {
      console.log('getMemberFollowState', res)
      this.setData({ memberFollowState: res.msg.sub_flag })
    })
  },
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
      console.log("订单详情", res.msg)
      wx.hideLoading()
      const orderData = res.msg
      this.setData({
        orderData
      })
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
    console.log(utils.formatTime2(this.data.orderData.course.beginDate))
    return {
      title: `【 ${this.data.orderData.course.courseName} 】${utils.formatTime2(this.data.orderData.course.beginDate)}星期${this.data.orderData.course.beginDay}${utils.formatTime3(this.data.orderData.course.beginTime)}，快和我一起来运动
`,
      path: '/pages/member/order/orderDetail?orderNum=' + this.data.orderNum + '&shareMemberId=' + wx.getStorageSync('shareMemberId'),
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