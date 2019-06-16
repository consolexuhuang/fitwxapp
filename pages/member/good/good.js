// pages/member/good/good.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    courseList:[],
    navbarData: {
      title: '课程优惠包',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },
  //课程包列表
  getCourseBagList(){
    wx.showLoading({ title: '加载中...', })
    api.post('v2/good/getOrderList').then(res => {
      console.log('课程包列表', res)
      wx.hideLoading()
      wx.stopPullDownRefresh()
      if(res.msg && res.msg.length > 0){
        this.setData({ courseList : res.msg})
      } else wx.showToast({ title: '暂无课程数据' , icon:"none"})
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCourseBagList()
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getCourseBagList()
  },

  
  /**
   * 自定义方法
   */
  gotoDiscountDetail(e){
    // console.log(e.currentTarget.dataset.orderid)
    let orderId = e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: `/pages/member/good/goodDetail?orderId=${orderId}`,
    })
  }
})