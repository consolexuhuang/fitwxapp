// pages/subPackages_report/report/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    isDownLoad: false,
    isStartState: false,
    jurisdictionSmallState: false,
    isLoadOverState: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().checkSessionFun().then(() => {

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
  // 点击授权
  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.setData({
        jurisdictionSmallState: false,
      })
      // this.getMemberFollowState()
    })
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
  // 查看报告
  startReport(){
    if (this.data.isLoadOverState && getApp().passIsLogin()){
      this.setData({ isStartState: true})
      this.setData({
        current: this.data.current + 1
      })
    } else {
      this.setData({
        jurisdictionSmallState: true
      })
    }
  },
})
