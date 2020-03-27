// pages/member/card/invalidCard/invalidCard.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: '已失效次卡',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height,
    invalidCard:'',
  },
  // 获取失效次卡列表
  getInvalidCardList(){
    api.post('card/getInvalidTimeCardList').then(res => {
      console.log('失效次卡列表',res)
      this.setData({ invalidCard: res.msg || []})
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInvalidCardList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
 
  handleCardRecordTap: function (event) {
    const cardId = event.currentTarget.dataset.cardId
    wx.navigateTo({
      url: '/pages/member/card/cardRecord?cardId=' + cardId
    })
  },
})