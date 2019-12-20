// pages/subPackages_report/report/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    isDownLoad: false,
    isStartState: false
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
  // 轮播改变
  bindchange(e) {
    //下滑
    if (this.data.current < e.detail.current) {
      this.setData({ isDownLoad: true })
    } else {
      this.setData({ isDownLoad: false })
    }
    console.log(this.data.current, e.detail.current, this.data.isDownLoad)
    this.setData({ current: e.detail.current })
  },
  startReport(){
    this.setData({ isStartState: true})
    this.setData({
      current: this.data.current + 1
    })
  }
})
