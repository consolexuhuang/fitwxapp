// pages/member/order/monthRecord.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sportMonthList: [],
    navbarData: {
      title: '约课记录',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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