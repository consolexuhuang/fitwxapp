// pages/subPackages_report/newUseReport/newUseReport.js
const store = getApp().store;
const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userYearReport:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let prevPageData = getCurrentPages()[pages.length - 2]; //上一个页面（父页面）
    this.setData({
      userYearReport: store.getItem('userYearReport')
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
  openNewYear(){
    wx.switchTab({
      url: '/pages/course/course',
    })
  }
})