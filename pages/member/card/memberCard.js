// pages/member/card/memberCard.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index:0,
    cardList: '',//储值卡和次卡
    courseList:[], //训练营类表
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '我的卡包',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    jurisdictionState:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  onShow(){

    //检测登录
    app.checkSessionFun().then(() => {
      if (!app.passIsLogin()) {
        this.setData({ jurisdictionState: true })
      } else {
        this.getCardList()
        this.getCourseBagList()
      }
    }, () => {
      this.setData({ jurisdictionState: true })
    })

  },
  // 获取储存卡和次卡
  getCardList: function(event) {
    wx.showLoading({ title: '加载中...' })
    api.post('card/getCardList').then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      const cardList = res.msg || []
      // res.msg.card_title = res.msg.card_title.slice(0, res.msg.card_title.indexOf('('))
      this.setData({
        cardList,
      })
    })
  },
  //获取训练营
  getCourseBagList() {
    let data = {
      goodType:'COURSE'
    }
    // wx.showLoading({ title: '加载中...', })
    api.post('v2/good/getOrderList', data).then(res => {
      console.log('训练营列表', res)
      // wx.hideLoading()
      this.setData({ courseList: res.msg || []})
    })
  },
  // handleRechargeTap: function(event) {
  //   wx.navigateTo({
  //     url: '/pages/card/recharge'
  //   })
  // },
  handleTransactionRecordTap: function(event) {
    wx.navigateTo({
      url: '/pages/member/card/transactionRecord'
    })
  },
  handleCardRecordTap: function(event) {
    const cardId = event.currentTarget.dataset.cardId
    wx.navigateTo({
      url: '/pages/member/card/cardRecord?cardId=' + cardId
    })
  },
  jumpToRechange(){
    wx.navigateTo({
      url: '/pages/card/recharge',
    })
  },
  jumpToCourse(){
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  // 赠送
  giveToCard(e){
    let cardId = e.currentTarget.dataset.cardid
    wx.navigateTo({
      url: '/pages/subPackages_needLoad/editorCard/editorCard?cardId=' + cardId,
    })
  },
  // 切换tab
  clickItem(e) {
    // console.log(e)
    this.setData({
      index: e.currentTarget.dataset.index
    })
  },
  gotoDiscountDetail(e) {
    // console.log(e.currentTarget.dataset.orderid)
    let orderId = e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: `/pages/member/good/goodDetail?orderId=${orderId}`,
    })
  },
  invaildEnter(){
    wx.navigateTo({
      url: '/pages/member/card/invalidCard/invalidCard',
    })
  },
  onPullDownRefresh(){
    this.getCardList()
    this.getCourseBagList()
  },
})