// pages/member/order/memberOrder.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0, //当前索引
    sport: '',
    goingList: [],
    payingList: [],
    completedList: [],
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '我的预约',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.status) this.setData({ active: parseInt(options.status) })
    this.getSport()
    this.getGoingList()
    this.getPayingList()
    this.getCompletedList()
  },
  // 运动数据
  getSport(event) {
    api.post('payOrder/sportTotalAndMonth').then(res => {
      const sport = res.msg
      this.setData({
        sport
      })
    })
  },
  getGoingList: function (event) {
    wx.showLoading({ title: '加载中...', })
    api.post('payOrder/goingList').then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      const goingList = res.msg
      this.setData({
        goingList
      })
    })
  },
  getPayingList: function (event) {
    api.post('payOrder/payingList').then(res => {
      const payingList = res.msg
      this.setData({
        payingList
      })
    })
  },
  getCompletedList: function (event) {
    api.post('v2/payOrder/completedList').then(res => {
      const completedList = res.msg
      this.setData({
        completedList
      })
    })
  },
  handleTabTap: function (event) {
    // const active = event.currentTarget.dataset.index
    console.log(event)
    this.setData({
      active: event.currentTarget.dataset.index
    })
  },
  handleCurrentChange: function (event) {
    const active = event.detail.currentItemId
    console.log(event)
    this.setData({
      active
    })
  },
  // 跳转本月更多
  handleMoreTap() {
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
  onPullDownRefresh() {
    this.getSport()
    this.getGoingList()
    this.getPayingList()
    this.getCompletedList()
  }
})