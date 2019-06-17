// pages/member/order/memberOrder.js
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
  wx.showLoading({ title: '加载中...'})
  api.post('v2/payOrder/getOrderListByPage',data).then(res => {
    wx,wx.hideLoading()
    console.log('订单分页数据', res, pageNum)
    if (_this.data.active == 0) {
      if (res.msg.result.length == 0 && pageNum != 1){

      } else {
        _this.setData({ goingList: [..._this.data.goingList, ...res.msg.result]})
      }
    }
    if (_this.data.active == 1) {
      if (res.msg.result.length == 0 && pageNum != 1) {
      } else {
        _this.setData({ payingList: [..._this.data.payingList, ...res.msg.result] })
      }
    }
    if (_this.data.active == 2){
      if (res.msg.result.length == 0 && pageNum != 1) {
      } else {
        _this.setData({ completedList: [..._this.data.completedList, ...res.msg.result] })
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
    sport: '',
    goingList: '',
    payingList: '',
    completedList: '',
    userInfoData:"",
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '我的预约',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,

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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    orderPageIng = orderPageWait = orderPageComplate = 1
    if (options.status) this.setData({ active: parseInt(options.status) })
    this.getUserInfo()
    this.getSport()
    loadMoreOrder(this, this.data.active == 0 ? orderPageIng : (this.data.active == 1 ? orderPageWait : (this.data.active == 2 ? orderPageComplate : orderPageIng)))
  },
  bindscrolltolower(){
    console.log('触底')
    if (this.data.active == 0 && this.data.goingList.length != this.data.userInfoData.order.going_count) loadMoreOrder(this, ++orderPageIng)
    if (this.data.active == 1 && this.data.payingList.length != this.data.userInfoData.order.unpay_count) loadMoreOrder(this, ++orderPageWait)
    if (this.data.active == 2 && this.data.completedList.length != this.data.userInfoData.order.complete_count) loadMoreOrder(this, ++orderPageComplate)
  },
  handleTabTap(event) {
    // const active = event.currentTarget.dataset.index
    console.log('点击下标',event.currentTarget.dataset.index)
    this.setData({
      active: event.currentTarget.dataset.index
    })
    if (event.currentTarget.dataset.index == 0){
      orderPageIng = 1;
      this.setData({ goingList: []})
      loadMoreOrder(this, orderPageIng)
    }
    if (event.currentTarget.dataset.index == 1) {
      orderPageWait = 1;
      this.setData({ payingList: [] })
      loadMoreOrder(this, orderPageWait)
    }
    if (event.currentTarget.dataset.index == 2) {
      orderPageComplate = 1;
      this.setData({ completedList: [] })
      loadMoreOrder(this, orderPageComplate)
    }
  },
  handleCurrentChange: function(event) {
    console.log(event)
    if (event.detail.source == 'touch'){
      this.setData({
        active: event.detail.currentItemId
      },()=>{
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
  handleOrderItemTap: function(event){
    const orderNum = event.currentTarget.dataset.orderNum
    console.log(event)
    wx.navigateTo({
      url: '/pages/member/order/orderDetail?orderNum=' + orderNum
    })
  },
  onPullDownRefresh(){
    orderPageIng = orderPageWait = orderPageComplate = 1
    this.setData({ goingList: '', payingList: '', completedList:''})
    this.getUserInfo()
    this.getSport()
    loadMoreOrder(this, this.data.active == 0 ? orderPageIng : (this.data.active == 1 ? orderPageWait : (this.data.active == 2 ? orderPageComplate : orderPageIng)))
    wx.stopPullDownRefresh()
  }
})