// pages/subPackages_needLoad/compensateCoupon/compensateCoupon.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    stateText:'去查收'
  },
  // 领取优惠券
  getCoupon(){
    let data = {
      redeem:'abc123'
    }
    api.post('coupon/exchangeCoupon', data).then(res => {
      console.log('getCoupon',res)
      if (Object.keys(res.msg).length > 0 && res.msg.amount > 0){
         this.setData({
           stateText: '去查收'
         })
      } else {
        this.setData({
          stateText: '领取失败'
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCoupon()
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})