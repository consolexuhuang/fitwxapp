// pages/member/card/memberCard.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardList: '',
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
      }
    }, () => {
      this.setData({ jurisdictionState: true })
    })

  },
  getCardList: function(event) {
    wx.showLoading({ title: '加载中...' })
    api.post('card/getCardList').then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      if (res.msg.length == 0) {
        wx.showToast({
          title: '您还没有购买的卡哦～',
          icon: 'none'
        })
      } else {
        const cardList = res.msg
        // res.msg.card_title = res.msg.card_title.slice(0, res.msg.card_title.indexOf('('))
        this.setData({
          cardList,
        })
      }
    })
  },
  handleRechargeTap: function(event) {
    wx.navigateTo({
      url: '/pages/card/recharge?isPlus=1'
    })
  },
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
      url: '/pages/card/recharge?isPlus=0',
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
  onPullDownRefresh(){
    this.getCardList()
  },
})