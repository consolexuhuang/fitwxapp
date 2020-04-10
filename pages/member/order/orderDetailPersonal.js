const app = getApp();
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    orderId: '',
    orderData: '',
    navbarData: {
      title: '商品订单详情',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height,
    coachWxCodeState: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId }, () => {
        this.getOrderInfo()
      })
    }
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
  // 跳转教练课程列表
  handleCoachTap: function (event) {
    // console.log(event)
    const coachId = event.currentTarget.dataset.coachid
    wx.navigateTo({
      url: '/pages/coach/coach?coachId=' + coachId
    })
  },
  // 显示教练二维码
  showCoachWxCode() {
    app.compareVersionPromise('2.7.0').then((res) => {
      if (res == 0) {
        this.setData({ coachWxCodeState: true })
      }
    })
  },
  onclose() {
    this.setData({ coachWxCodeState: false })
  },
  //商品数据
  getOrderInfo() {
    wx.showLoading({ title: '加载中...' })
    let data = {
      orderId: this.data.orderId
    }
    // console.log(data)
    api.post('v2/good/getOrderInfo', data).then(res => {
      wx.hideLoading()
      if (res.code == 0) {
        this.setData({
          orderData: res.msg,
        })
      }
      else wx.showToast({ title: res.msg || '订单获取失败', })
    })
  },
  //分享
  onShareAppMessage() {
    return {
      title: this.data.orderData.good_title,
      imageUrl: this.data.orderData.banner_img,
      path: '/pages/course/courseDetailPersonal?courseId=' + this.data.orderData.good_id + '&shareMemberId=' + wx.getStorageSync('userData').id,

    }
  },
})