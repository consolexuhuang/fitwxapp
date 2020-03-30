// pages/member/order/monthOrder.js
const api = getApp().api
let orderPageCancel = 1, orderPageComplate = 1

//分页
function loadMoreOrder(_this, pageNum) {
  let data = {
    status: _this.data.active == 0 ? '3' : (_this.data.active == 1 ? '4' : '3'),
    year: _this.data.year, 
    month: _this.data.month, 
    page: pageNum,
    size: 10,
    needTotalCount: true
  }
  wx.showLoading({ title: '加载中...' })
  api.post('v2/payOrder/getMonthOrderListByPage', data).then(res => {
    wx, wx.hideLoading()
    console.log('订单分页数据', res, pageNum)
    if (_this.data.active == 0) {
      if (pageNum == 1) {
        _this.setData({ completedList: res.msg.result })
      } else {
        _this.setData({ completedList: [..._this.data.completedList, ...res.msg.result] })
      }
    }
    if (_this.data.active == 1) {
      if (pageNum == 1) {
        _this.setData({ cancelList: res.msg.result })
      } else {
        _this.setData({ cancelList: [..._this.data.cancelList, ...res.msg.result] })
      }
    }
  })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0, //当前索引
    completedList: '',
    cancelList: '',
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '订单',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height,
    orderComplateNum:0,
    orderCancleNum:0
  },
  
  //获取总数量
  getOrderNum(Active){
    let data = {
      status: Active == 0 ? '3' : (Active == 1 ? '4' : '3'),
      year: this.data.year,
      month: this.data.month,
      page: 1,
      size: 1,
      needTotalCount: true
    }
    api.post('v2/payOrder/getMonthOrderListByPage', data).then(res => {
      if (Active == 0) this.setData({ orderComplateNum: res.msg.totalResults })
      if (Active == 1) this.setData({ orderCancleNum: res.msg.totalResults })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    orderPageCancel = orderPageComplate = 1
    const year = options.year
    const month = options.month
    this.setData({
      year,
      month
    },()=>{
      this.getOrderNum(0)
      this.getOrderNum(1)
      loadMoreOrder(this, this.data.active == 0 ? orderPageComplate : (this.data.active == 1 ? orderPageCancel : orderPageComplate))
    })
  },
  bindscrolltolower() {
    console.log('触底')
    if (this.data.active == 0 && this.data.completedList.length != this.data.orderComplateNum) loadMoreOrder(this, ++orderPageComplate)
    if (this.data.active == 1 && this.data.cancelList.length != this.data.orderCancleNum ) loadMoreOrder(this, ++orderPageCancel)
  },

  handleTabTap: function(event) {
    const active = event.currentTarget.dataset.index
    this.setData({
      active
    },()=>{
      if (event.currentTarget.dataset.index == 0) {
        orderPageComplate = 1;
        loadMoreOrder(this, orderPageComplate)
      }
      if (event.currentTarget.dataset.index == 1) {
        orderPageCancel = 1;
        loadMoreOrder(this, orderPageCancel)
      }
    })
  },
  currentChange: function(event) {
    if (event.detail.source == 'touch') {
      this.setData({
        active: event.detail.current
      }, () => {
        if (this.data.active == 0 && !this.data.completedList) loadMoreOrder(this, orderPageComplate);
        if (this.data.active == 1 && !this.data.cancelList) loadMoreOrder(this, orderPageCancel);
      })
    }
  },
  handleOrderItemTap: function(event){
    const orderNum = event.currentTarget.dataset.orderNum
    wx.navigateTo({
      url: '/pages/member/order/orderDetail?orderNum=' + orderNum
    })
  }
})