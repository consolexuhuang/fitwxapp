// pages/card/cardList.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardType: '',
    cardList: [],
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '尊享次卡类型',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const cardType = options.cardType
    this.setData({
      cardType
    })
    //检测登录
    app.checkSessionFun().then(() => {
    this.getCardDefList()
    })

  },
  /**
   * 自定义方法
   */
  getCardDefList: function(event) {
    const cardType = this.data.cardType
    const data = {
      type: cardType
    }
    api.post('card/getCardDefList', data).then(res => {
        const cardDefList = res.msg
        const key = Object.keys(cardDefList)[0]
        const cardList = cardDefList[key].list
        this.setData({
          cardList
        })
    })
  },
  handleCardTap: function(event) {
    const cardId = event.currentTarget.dataset.cardId
    wx.navigateTo({
      url: '/pages/card/payCard?cardId=' + cardId,
    })
  }
})