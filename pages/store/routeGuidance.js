const app = getApp();
const api = app.api
const store = getApp().store;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    webUrl:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      webUrl: options.webUrl
    })
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '线路指引',
      path: `/pages/store/routeGuidance?webUrl=${this.data.webUrl}`,
      // imageUrl: this.data.picList[0],
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  }
})