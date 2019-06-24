// pages/member/order/memberOrder.js
import Store from '../../../utils/store.js' 
const api = getApp().api
let orderPageIng = 1, orderPageWait = 1, orderPageComplate = 1
//分页
function loadMoreOrder(_this, pageNum) {
  let data = {
    status: _this.data.active == 0 ? '2' : (_this.data.active == 1 ? '1' : _this.data.active == 2 ? '3' : '2'),
    date1: '', //开始时间
    date2: '', //结束时间
    page: pageNum,
    size: 10,
    needTotalCount: true
  }
  // wx.showLoading({ title: '加载中...' })
  api.post('v2/payOrder/getOrderListByPage', data).then(res => {
    // wx.hideLoading()
    console.log('订单分页数据', res, pageNum)
    if (_this.data.active == 0) {
      if (pageNum == 1) {
         _this.setData({ goingList: res.msg.result })
      } else {
        _this.setData({ goingList: [..._this.data.goingList, ...res.msg.result] },() => {
        })
      }
      // _this.getSwiperHeight(_this.data.goingList, 0)
    }
    if (_this.data.active == 1) {
      if (pageNum == 1) {
        _this.setData({ payingList: res.msg.result })
      } else {
        _this.setData({ payingList: [..._this.data.payingList, ...res.msg.result] }, () => {
        })
      }
      // _this.getSwiperHeight(_this.data.payingList, 1)
    }
    if (_this.data.active == 2) {
      if (pageNum == 1) {
        _this.setData({ completedList: res.msg.result })
      } else {
        _this.setData({ completedList: [..._this.data.completedList, ...res.msg.result] }, () => {
        })
      }
      // _this.getSwiperHeight(_this.data.completedList, 2)
    }
  })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0, //当前索引
    sport: '',
    goingList: '',
    payingList: '',
    completedList: '',
    userInfoData: "",
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '我的预约',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    // swiperHeight: [getApp().globalData.systemInfo.screenHeight - getApp().globalData.tab_height - 100, getApp().globalData.systemInfo.screenHeight - getApp().globalData.tab_height - 100, getApp().globalData.systemInfo.screenHeight - getApp().globalData.tab_height - 100],
    swiperHeight: getApp().globalData.systemInfo.screenHeight - getApp().globalData.tab_height - 100
  },
  // 初始化数据
  dataInit(){
    orderPageIng = orderPageWait = orderPageComplate = 1
    this.setData({ goingList: '', payingList: '', completedList: '' })
    this.getUserInfo()
    this.getSport()
    loadMoreOrder(this, this.data.active == 0 ? orderPageIng : (this.data.active == 1 ? orderPageWait : (this.data.active == 2 ? orderPageComplate : orderPageIng)))
  },
  // 获取用户所有订单
  getUserInfo() {
    api.post('v2/member/liteMyInfo').then(res => {
      console.log('userInfoData', res.msg)
      this.setData({ userInfoData: res.msg })
    })
  },
  // 运动数据
  getSport(event) {
    return new Promise(resolve => {
      api.post('payOrder/sportTotalAndMonth').then(res => {
        const sport = res.msg
        this.setData({
          sport
        }, () => {
          resolve()
        })
      })
    })
  },
  //计算轮播图高度
  getSwiperHeight(list, type){ //40底部拉升完成高度
    let loadHeight = 50
    let height = (list.length == 0 ? list.length + 1 : list.length) * 98 + loadHeight
      this.setData({
        ['swiperHeight[' + type +']']: height
      })
    console.log(this.data.swiperHeight)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.status) this.setData({ active: parseInt(options.status) })
  },
  onShow(){
    this.dataInit()
  },
  bindscrolltolower() {
    console.log('触底')
    if (this.data.active == 0 && this.data.goingList.length != this.data.userInfoData.order.going_count) loadMoreOrder(this, ++orderPageIng)
    if (this.data.active == 1 && this.data.payingList.length != this.data.userInfoData.order.unpay_count) loadMoreOrder(this, ++orderPageWait)
    if (this.data.active == 2 && this.data.completedList.length != this.data.userInfoData.order.complete_count) loadMoreOrder(this, ++orderPageComplate)
  },
  //付款
  goPay(e){
    let data = {
        openid: Store.getItem('userData').wx_lite_openid,
        outTradeNo: e.currentTarget.dataset.ordernum,
        transactionId: '',
        outRefundNo: '',
        totalFee: 0, //后台分进制
        type: 'PAY',
        clientIp: '',
        payMode: 'wxlite',
      }
      api.post('payment/wxPay', data).then(res => {
        console.log('微信支付回调', res)
        this.wxPay(res.msg)

      })
  },
  wxPay: function (obj) {
    wx.requestPayment({
      timeStamp: obj.timeStamp,
      nonceStr: obj.nonceStr,
      package: obj.package,
      signType: obj.signType,
      paySign: obj.paySign,
      success(res) {
        const orderNum = obj.orderNum
        wx.redirectTo({
          url: '/pages/order/paySuccess?orderId=' + orderNum
        })
      },
      fail(res) {
        wx.showToast({
          title: '支付失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  handleTabTap(event) {
    // const active = event.currentTarget.dataset.index
    console.log('点击下标', event.currentTarget.dataset.index)
    this.setData({
      active: event.currentTarget.dataset.index
    },()=>{
      if (event.currentTarget.dataset.index == 0) {
        orderPageIng = 1;
        loadMoreOrder(this, orderPageIng)
      }
    })
    if (event.currentTarget.dataset.index == 1) {
      orderPageWait = 1;
      loadMoreOrder(this, orderPageWait)
    }
    if (event.currentTarget.dataset.index == 2) {
      orderPageComplate = 1;
      loadMoreOrder(this, orderPageComplate)
    }
  },
  handleCurrentChange: function (event) {
    console.log(event)
    if (event.detail.source == 'touch') {
      this.setData({
        active: event.detail.currentItemId
      }, () => {
        if (this.data.active == 0 && !this.data.goingList) loadMoreOrder(this, orderPageIng);
        if (this.data.active == 1 && !this.data.payingList) loadMoreOrder(this, orderPageWait);
        if (this.data.active == 2 && !this.data.completedList) loadMoreOrder(this, orderPageComplate);
      })
    }
  },
  // 跳转本月更多
  handleMoreTap() {
    console.log('jump')
    wx.navigateTo({
      url: '/pages/member/order/monthRecord'
    })
  },
  handleOrderItemTap: function (event) {
    const orderNum = event.currentTarget.dataset.orderNum
    console.log(event)
    wx.navigateTo({
      url: '/pages/member/order/orderDetail?orderNum=' + orderNum
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
  onPullDownRefresh() {
    this.dataInit()
    wx.stopPullDownRefresh()
  }
})