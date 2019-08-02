// pages/subPackages_gift/giftCard/giftCard.js
const api = getApp().api
const store = getApp().store;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: '礼品卡',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    imgUrl: getApp().globalData.imgUrl,
    jurisdictionState: false,
    giftCardInfo:'',
    cardId:'',
    enterUserAdmin: 3, //当前进入用户身份 1-自己，2-收卡人，3-其他人
  },
  // 获取会员卡详情
  getCardInfo(cardId) {
    let data = {
      cardId: cardId
    }
    api.post('card/getCardInfo', data).then(res => {
      console.log('卡信息', res)
      if (store.getItem('userData').id != res.msg.gift_member_id && store.getItem('userData').id != res.msg.member_id){
        this.setData({ enterUserAdmin : 3})
      } else if (store.getItem('userData').id == res.msg.gift_member_id){
        this.setData({ enterUserAdmin: 1 })
      } else if (store.getItem('userData').id == res.msg.member_id){
        this.setData({ enterUserAdmin: 2 })
      }
      this.setData({
        giftCardInfo: res.msg,
      })
    })
  },
  getGiftCard(){
    let data = {
      cardId: this.data.cardId
    }
    wx.showLoading({
      title: '领取中...',
    })
    api.post('card/receiveCardGift', data).then(res => {
      wx.hideLoading()
      console.log('收卡', res)
      if(res.code == 0 && res.msg === true){
        wx.showToast({
          title: '领取成功！',
        })
      } else {
        wx.showToast({
          title: res.msg || '领取失败！',
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.cardId) {
      this.setData({ cardId: options.cardId})
    }
    //检测登录
    getApp().checkSessionFun().then(() => {
      this.getCardInfo(options.cardId)
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  bindgetuserinfo() {
    getApp().checkSessionFun().then(() => {
      this.getCardInfo(this.data.cardId)
      this.setData({ jurisdictionState: false })
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  // 收卡
  clickGiftCard() {
    this.getGiftCard()
  },
  // 留给自己
  sendMyslfe() {
    wx.redirectTo({
      url: '/pages/member/card/memberCard',
    })
  },
  // 约课
  jumpToCourse(){
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: `亲爱的，七夕节快乐！送你一张健身卡，快来试试吧！`,
      path: 'pages/subPackages_gift/giftCard/giftCard',
      // imageUrl: this.data.picList[0],
      success: function (res) {
        console.log('分享成功', res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  }
})