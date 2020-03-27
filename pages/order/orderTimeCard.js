// pages/order/orderTimeCard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeCardList: [],
    count: 1,
    couponId: '',
    firstCheck: true,
    timeCardId: '',
    courseId: '',
    imgUrl: getApp().globalData.imgUrl,
    orderCardList:[
      {
        time: 2121212212,
        count: 3,
        type:1,
        useTag:true,
      },
      {
        time: 2121212212,
        count: 3,
        type: 2,
        useTag: false,
      },
    ],
    navbarData: {
      title: '',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      const orderTimeCard = wx.getStorageSync('orderTimeCard')
      if (orderTimeCard) {
        console.log(JSON.parse(orderTimeCard))
        const timeCardList = JSON.parse(orderTimeCard).timeCardList
        const count = JSON.parse(orderTimeCard).count
        const couponId = JSON.parse(orderTimeCard).couponId
        const firstCheck = JSON.parse(orderTimeCard).firstCheck
        const courseId = JSON.parse(orderTimeCard).courseId
        const timeCardId = JSON.parse(orderTimeCard).timeCardId
        this.setData({
          timeCardList,
          count,
          couponId,
          firstCheck,
          timeCardId,
          courseId
        })
      }
      wx.removeStorageSync('orderTimeCard')
    } catch (e) {
      // Do something when catch error
    }
  },
  handleTimeCardTap: function(event){
    console.log(event)
    const timeCardId = event.currentTarget.dataset.timeCardId
    this.setData({
      timeCardId
    })
    const count = this.data.count
    const couponId = this.data.couponId
    const firstCheck = this.data.firstCheck
    const courseId = this.data.courseId
    const orderConfig = JSON.stringify({
      count,
      couponId,
      firstCheck,
      timeCardId
    })
    try {
      wx.setStorageSync('orderConfig', orderConfig)
    } catch (e) { }
    wx.navigateBack()
    // wx.redirectTo({
    //   url: '/pages/order/payOrder?courseId=' + courseId
    // })
  }
})