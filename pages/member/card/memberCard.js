// pages/member/card/memberCard.js
const api = getApp().api
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
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  onShow(){
    this.getCardList()
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
        this.setData({
          cardList
        })
      }
    })
  },
  handleRechargeTap: function(event) {
    wx.navigateTo({
      url: '/pages/card/recharge'
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
      url: '/pages/card/recharge',
    })
  },
  onPullDownRefresh(){
    this.getCardList()
  },
})