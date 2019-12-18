// pages/order/orderCoupon.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList: [],
    count: 1,
    couponId: '',
    firstCheck: true,
    timeCardId: '',
    courseId: '',
    couponRuleShow: false, //规则弹窗wx29946485f206d315wx29946485f206d315
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    tipText: '666'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    /* 
    couponUsable枚举值：
    1：全部可用
    2：立减至可用
    3：不可用
    4：非立减可用
 */
    let tipText = 'uuu';
    switch (options.couponUsable) {
      case '1':
        tipText = '当前课程支持使用所有类型代金券';
        console.log(11)
        break;
      case '2':
        tipText = `当前课程为促销类型[${options.priceLabel}]，无法使用"立减券"`;
        console.log(12)
        break;
      case '3':
        tipText = '当前课程不支持使用代金券';
        console.log(13)
        break;
      case '4':
        tipText = '当前课程无法使用"立减券"';
        console.log(14)
        break;
      default:
        tipText = '888';
        break;
    }
    this.setData({
      tipText
    })
    try {
      const orderCoupon = wx.getStorageSync('orderCoupon')
      if (orderCoupon) {
        const couponList = JSON.parse(orderCoupon).couponList
        const count = JSON.parse(orderCoupon).count
        const couponId = JSON.parse(orderCoupon).couponId
        const firstCheck = JSON.parse(orderCoupon).firstCheck
        const courseId = JSON.parse(orderCoupon).courseId
        const timeCardId = JSON.parse(orderCoupon).timeCardId
        this.setData({
          couponList,
          count,
          couponId,
          firstCheck,
          timeCardId,
          courseId
        })
      }
      wx.removeStorageSync('orderCoupon')
    } catch (e) {
      // Do something when catch error
    }
    wx.getStorage({
      key: 'orderCoupon',
      success(res) {
        const couponList = JSON.parse(res.data).couponList
        const count = JSON.parse(res.data).count
        const couponId = JSON.parse(res.data).couponId
        const firstCheck = JSON.parse(res.data).firstCheck
        const courseId = JSON.parse(res.data).courseId
        const timeCardId = JSON.parse(res.data).timeCardId
        this.setData({
          couponList,
          count,
          couponId,
          firstCheck,
          timeCardId,
          courseId
        })
      }
    })


  },
  handleCouponTap: function(event) {
    const couponId = event.currentTarget.dataset.couponId
    this.setData({
      couponId
    })
    const count = this.data.count
    const firstCheck = this.data.firstCheck
    const timeCardId = this.data.timeCardId
    const courseId = this.data.courseId
    const orderConfig = JSON.stringify({
      count,
      couponId,
      firstCheck,
      timeCardId
    })
    try {
      wx.setStorageSync('orderConfig', orderConfig)
    } catch (e) {}
    // wx.redirectTo({
    //   url: '/pages/order/payOrder?courseId=' + courseId
    // })
    wx.navigateBack()
  },
  //弹窗显示
  showCouponRule() {
    this.setData({
      couponRuleShow: true
    })
  },
  //关闭弹窗
  onclose() {
    this.setData({
      couponRuleShow: false
    })
  }
})