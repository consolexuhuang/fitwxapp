// pages/subPackages_needLoad/compensateCoupon/compensateCoupon.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginTopBar: getApp().globalData.header_bar_height,
    couponData:'',
    jurisdictionState: false,
  },
  // 领取优惠券
  getCoupon(){
    let data = {
      redeem:'jishubuchang'
    }
    api.post('coupon/exchangeCoupon', data).then(res => {
      console.log('getCoupon',res)
      if (Object.keys(res.msg).length > 0 && res.msg.amount > 0){
         this.setData({
           couponData:res.msg
         })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.stopPullDownRefresh()
    if (!getApp().passIsLogin()) {
      this.setData({ jurisdictionState: true })
    } else {
      getApp().checkSessionFun().then(() => {
        this.getCoupon()
      }, () => {
        this.setData({ jurisdictionState: true })
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.getCoupon()
      this.setData({ jurisdictionState: false })
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  jumpToMemberCard(){
    wx.navigateTo({
      url: '/pages/member/coupon/memberCoupon',
    })
  },
})