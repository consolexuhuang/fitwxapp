// pages/login/wxLogin/wxLogin.js

/**
 *  该页面功能第一版不做
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  //微信登录
  wx_loginIn(){
    getApp().wx_loginIn().then(res => {
      wx.switchTab({
        url: '../../member/member',
      })
    })
  },
  jumpToPhoneLogin(){
    wx.navigateTo({
      url: '../phoneLogin/phoneLogin',
    })
  }
})