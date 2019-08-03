// pages/good/goodDetail.js
const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    params: '',
    goodId: '',
    goodData: '',
    goodCoachs: [],
    shadeShow: false,
    navbarData: {
      title: '课程优惠包',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //分享
    wx.showShareMenu({
      withShareTicket: true
    })
    let goodId = options.goodId;
    this.setData({
      goodId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getGoodInfo()
  },

  /**
   * 自定义方法
   */
  getGoodInfo() {
    let form = {}
    let goodId = this.data.goodId
    form.goodId = goodId
    api.post('v2/good/getGoodInfo', form).then(ret => {
      this.setData({
        goodData: ret.msg
      })
    })
  },
  // 立即支付
  payGood() {
    wx.navigateTo({
      url: `/pages/trainingCamp/trainingCampOrder/trainingCampOrder?goodId=${this.data.goodId}`,
    })
  },
})