// pages/openLocation/openLocation.js
import Store from '../../utils/store.js'
import utils from '../../utils/util.js'
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId:'',
    storeData:'',
    navbarData: {
      title: '查看位置',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height
  },
  getStore(){
    let data = {
      id: this.data.storeId || ""
    }
    wx.showLoading({ title: '加载中...'})
    api.post('store/getStore', data).then(res => {
      wx.hideLoading()
      console.log('getStore', res)
      if (res.code === 0) {
        const storeData = res.msg
        this.setData({
          storeData
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.stopPullDownRefresh()
    console.log('options_code2', options)
    this.setData({ storeId: options.storeId }, () => {
      this.getStore()
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //定位
  handleLocationTap: function (event) {
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
  //跳转线webUrl
  handleRouteGuidanceTap() {
    wx.navigateTo({
      url: '/pages/store/routeGuidance?webUrl=' + this.data.storeData.mapPic
    })
  },  
})