// pages/subPackages_gift/giftCard/giftCard.js
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //检测登录
    app.checkSessionFun().then(() => {
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
    app.checkSessionFun().then(() => {
      this.setData({ jurisdictionState: false })
    }, () => {
      this.setData({ jurisdictionState: true })
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