// pages/member/order/monthRecord.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sportMonthList: [],
    navbarData: {
      title: '训练记录',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height,
    userInfoData:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfoData = JSON.parse(options.userInfoData) || {};    
    this.setData({
      userInfoData
    })
    this.getSportMonthList()
  },
  getSportMonthList: function(event){
    api.post('payOrder/sportMonthList').then(res => {
      const sportMonthList = res.msg
      this.setData({
        sportMonthList
      })
    })
  },
  // 跳转本月订单详情 
  handleMonthTap: function(event){
    const year = event.currentTarget.dataset.year
    const month = event.currentTarget.dataset.month
    wx.navigateTo({
      url: '/pages/member/order/monthOrder?year=' + year + '&month=' + month
    })
  }
})