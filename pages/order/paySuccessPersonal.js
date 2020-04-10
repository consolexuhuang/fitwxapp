
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    orderData: '',
    goodData: '',
    coachList: '',
    navbarData: {
      title: '',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "",
    },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.goodId) {
      this.setData({
        goodId: options.goodId
      }, () => {
        this.getGoodInfo()
        this.checkOrder()
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

  getGoodInfo() {
    let data = {
      goodId: this.data.goodId
    }
    api.post('v2/good/getGoodInfo', data).then(res => {
      console.log('getGoodInfo', res)
      if (res.code == 0) {
        res.msg.store_ids__NAME = res.msg.store_ids__NAME.replace(/\,/g, "\n")
        this.setData({
          goodData: res.msg,
          coachList: res.msg.coach_course ? Object.values(res.msg.coach_course) : '',
        })
      }
    })
  },
  checkOrder() {
    let data = {
      goodId: this.data.goodId
    }
    api.post('v2/good/checkOrder', data).then(res => {
      console.log('checkOrder', res)
      if (res.code == 0) {
        this.setData({ orderData: res.msg })
      }
    })
  },
  //查看地图
  handleLocationTap: function (event) {
    console.log(event)
    const name = event.currentTarget.dataset.name
    const address = event.currentTarget.dataset.address
    const latitude = Number(event.currentTarget.dataset.latitude)
    const longitude = Number(event.currentTarget.dataset.longitude)
    wx.openLocation({
      name,
      address,
      latitude,
      longitude,
      scale: 18
    })
  },
  // 查看预约
  lookMyAppointment() {
    wx.switchTab({
      url: `/pages/member/order/memberOrder`,
    })
  },
  backHome() {
    wx.switchTab({
      url: `/pages/course/course`,
    })
  },
})