// pages/course/storeScreen.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeList: '',
    cityList: [],
    isScreanShow: false,
    city: '',
    area: '',
    selectedStore: [],
    selectedTimeInterval: [],
    selectedLabel: [],
    // selectedShortCutLabel: [],
    isOver: false,
    imgUrl: getApp().globalData.imgUrl,
    screenWidth: getApp().globalData.systemInfo.screenWidth,
    navbarData: {
      title: '',
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
  onLoad: function (options) {
    if (getApp().globalData.storeScreen) {
      const storeList = getApp().globalData.storeScreen.storeList
      const cityList = getApp().globalData.storeScreen.cityList
      const city = getApp().globalData.storeScreen.city
     // const searchText = getApp().globalData.storeScreen.searchText
      const selectedStore = getApp().globalData.storeScreen.selectedStore
      const selectedTimeInterval = getApp().globalData.storeScreen.selectedTimeInterval
      const selectedLabel = getApp().globalData.storeScreen.selectedLabel
      // const selectedShortCutLabel = getApp().globalData.storeScreen.selectedShortCutLabel
      const isOver = getApp().globalData.storeScreen.isOver
      const active = getApp().globalData.storeScreen.active
      this.setData({
        storeList,
        cityList,
        city,
       // searchText,
        selectedStore,
        selectedTimeInterval,
        selectedLabel,
        // selectedShortCutLabel
        isOver,
        active
      })
      getApp().globalData.storeScreen = ''
    }
  },
  // 选择门店
  handleStoreTap: function(event) {
    const storeId = event.currentTarget.dataset.storeId
    const selectedStore = this.data.selectedStore
    if (selectedStore.indexOf(storeId) < 0) {
      selectedStore.push(storeId)
    } else {
      const index = selectedStore.indexOf(storeId)
      selectedStore.splice(index, 1)
    }
    this.setData({
      selectedStore
    })
  },
  // 选择城市
  handleCitySelectTap: function(event){
    console.log(event)
    const isScreanShow = true
    this.setData({
      isScreanShow
    })
  },
  // 点击遮罩隐藏
  handleShadeTap: function(event) {
    const isScreanShow = false
    this.setData({
      isScreanShow
    })
  },
  // 点击遮罩内容部分无效
  handleContentTap: function(event){
    return
  },
  // 点击城市
  handleCityTap: function(event){
    const city = event.currentTarget.dataset.city
    this.setData({
      city
    })
  },
  // 点击区域
  handleAreaTap: function(event){
    const area = event.currentTarget.dataset.area
    this.setData({
      area
    })
  },
  // 重置城市区域
  handleCityClearTap: function(event){
    const city = Object.keys(this.data.storeList)[0]
    const area = ''
    this.setData({
      city,
      area
    })
  },
  // 选定城市区域
  handleCityConfirmTap: function(event){
    const isScreanShow = false
    const storeList = this.data.storeList
    this.setData({
      isScreanShow,
      storeList
    })
  },
  // 重置
  handleResetTap: function(event) {
    const city = Object.keys(this.data.storeList)[0]
    const area = ''
    const selectedStore = []
    this.setData({
      city,
      area,
      selectedStore
    })
  },
  // 确认
  handleConfirmTap: function(event) {
    const city = this.data.city
    //const searchText = this.data.searchText
    const selectedStore = this.data.selectedStore
    const selectedTimeInterval = this.data.selectedTimeInterval
    const selectedLabel = this.data.selectedLabel
    // const selectedShortCutLabel = this.data.selectedShortCutLabel
    const isOver = this.data.isOver
    const active = this.data.active
    const courseConfig = {
      city,
    //  searchText,
      selectedStore,
      selectedTimeInterval,
      selectedLabel,
      // selectedShortCutLabel
      isOver,
      active
    }
    getApp().globalData.courseConfig = courseConfig
    wx.switchTab({
      url: '/pages/course/course',
      success: function(event) {
        const page = getCurrentPages().pop() //当前页面
        if (page == undefined || page == null) return
       // page.onLoad() //或者其它操作
      }
    })
  }
})