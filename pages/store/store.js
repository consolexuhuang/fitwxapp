// pages/store/store.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    cityList: '',
    storeTypeList: [],
    isScreanShow: 0,
    city: '',
    area: '',
    storeType: '',
    topStoreIds: [],
    storeList: [],
    screenWidth: getApp().globalData.systemInfo.screenWidth,
    navbarData: {
      title: '门店',
      showCapsule: 0,
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

    //检测登录
    app.checkSessionFun().then(() => {
    this.getCityList()
    })
  },
  watch:{
    city: function(){
      const area = ''
      const storeType = ''
      const topStoreIds = []
      this.setData({
        area,
        storeType
      })
    }
  },
  getCityList: function() {
    api.post('store/getCityList').then(res => {
      if (res.code === 0) {
        const cityList = res.msg
        const city = Object.keys(cityList)[0]
        this.setData({
          cityList,
          city
        })
        this.getStoreList()
        this.getTypeList()
      }
    })
  },
  getTypeList: function(){
    const city = this.data.city
    const data = {
      city
    }
    api.post('store/getStoreTypeList', data).then(res => {
      if (res.code === 0) {
        const storeTypeList = res.msg
        this.setData({
          storeTypeList
        })
      }
    })
  },
  getStoreList: function getStoreList() {
    const city = this.data.city
    const area = this.data.area
    const storeType = this.data.storeType
    const topStoreIds = this.data.topStoreIds.join()
    const latitude = getApp().globalData.location && getApp().globalData.location.latitude || '31.24916171'
    const longitude = getApp().globalData.location && getApp().globalData.location.longitude || '121.487899486'
    const data = {
      city,
      area,
      storeType,
      topStoreIds,
      latitude,
      longitude
    }
    wx.showLoading({ title: '加载中...', })
    api.post('store/getStoreList', data).then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      if (res.code === 0) {
        const storeList = res.msg
        this.setData({
          storeList
        })
      }
    })
  },
  handleTopTap: function(event) {
    console.log(event)
    const isTop = event.currentTarget.dataset.isTop
    const storeId = event.currentTarget.dataset.storeId
    const topStoreIds = this.data.topStoreIds
    if (isTop) {
      let topStoreIndex = topStoreIds.indexOf(storeId)
      topStoreIds.splice(topStoreIndex, 1)
    } else {
      topStoreIds.push(storeId)
    }
    this.setData({
      topStoreIds
    })
    this.getStoreList()
  },
  handleSelectTap: function(event){
    const isScreanShow = event.currentTarget.dataset.isScreanShow
    this.setData({
      isScreanShow
    })
  },
  handleCityTap: function(event){
    const city = event.currentTarget.dataset.city
    this.setData({
      city
    })
  },
  handleAreaTap: function(event){
    const area = event.currentTarget.dataset.area
    this.setData({
      area
    })
  },
  handleStoreTypeTap: function(event){
    const storeType = event.currentTarget.dataset.storeType
    this.setData({
      storeType
    })
  },
  handleClearTap: function(event){
    const city = Object.keys(this.data.cityList)[0]
    const area = ''
    const storeType = ''
    this.setData({
      city,
      area,
      storeType
    })
  },
  handleConfirmTap: function(event){
    const isScreanShow = 0
    const topStoreIds = []
    this.setData({
      isScreanShow,
      topStoreIds
    })
    this.getStoreList()
  },
  handleStoreTap: function(event) {
    const storeId = event.currentTarget.dataset.storeId
    wx.navigateTo({
      url: '/pages/store/storeDetail?storeId=' + storeId
    })
  },
  handleShadeTap: function(event) {
    const isScreanShow = 0
    this.setData({
      isScreanShow
    })
  },
  handleContentTap: function(event){
    return
  },
  bindscrolltoupper(){
    this.getCityList()
  },
  // bindscrolltoupper(){
  //   this.getCityList()
  // },
  onPullDownRefresh(){
    this.getCityList()
  },
})