// pages/subPackages_needLoad/compensateCoupon/compensateCoupon.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    couponData:'',
  },
  // 领取优惠券
  getCoupon(){
    let data = {
      redeem:'11qq'
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
    this.getCoupon()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  jumpToMemberCard(){
    wx.navigateTo({
      url: '/pages/member/coupon/memberCoupon',
    })
  },
})