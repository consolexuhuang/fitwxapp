// pages/course/courseScreen.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeLabelList: '',
    city: '',
    //searchText:'',
    selectedStore: [],
    selectedTimeInterval: [],
    selectedLabel: [],
    // selectedShortCutLabel: [],
    isOver: false,
    imgUrl: getApp().globalData.imgUrl,
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
    if (getApp().globalData.courseScreen) {
      const typeLabelList = getApp().globalData.courseScreen.typeLabelList
      const city = getApp().globalData.courseScreen.city
      //const searchText = getApp().globalData.courseScreen.searchText
      const selectedStore = getApp().globalData.courseScreen.selectedStore
      const selectedTimeInterval = getApp().globalData.courseScreen.selectedTimeInterval
      const selectedLabel = getApp().globalData.courseScreen.selectedLabel
      // const selectedShortCutLabel = getApp().globalData.courseScreen.selectedShortCutLabel
      const isOver = getApp().globalData.courseScreen.isOver
      const active = getApp().globalData.courseScreen.active
      this.setData({
        typeLabelList,
        city,
        //searchText,
        selectedStore,
        selectedTimeInterval,
        selectedLabel,
        // selectedShortCutLabel
        isOver,
        active
      })
      getApp().globalData.courseScreen = ''
    }
  },
  handleLabelTap: function(event) {
    const labelId = event.currentTarget.dataset.labelId
    const selectedLabel = this.data.selectedLabel
    if (selectedLabel.indexOf(labelId) < 0) {
      selectedLabel.push(labelId)
    } else {
      const index = selectedLabel.indexOf(labelId)
      selectedLabel.splice(index, 1)
    }
    this.setData({
      selectedLabel
    })
  },
  handleTimeIntervalTap: function(event) {
    const timeInterval = event.currentTarget.dataset.timeInterval
    let selectedTimeInterval = this.data.selectedTimeInterval
    if (timeInterval) {
      if (selectedTimeInterval.indexOf(timeInterval) < 0) {
        selectedTimeInterval.push(timeInterval)
      } else {
        const index = selectedTimeInterval.indexOf(timeInterval)
        selectedTimeInterval.splice(index, 1)
      }
    } else {
      selectedTimeInterval = []
    }
    this.setData({
      selectedTimeInterval
    })
  },
  handleResetTap: function(event) {
    const selectedTimeInterval = []
    const selectedLabel = []
    this.setData({
      selectedTimeInterval,
      selectedLabel
    })
  },
  handleConfirmTap: function(event) {
    const city = this.data.city
   // const searchText = this.data.searchText
    const selectedStore = this.data.selectedStore
    const selectedTimeInterval = this.data.selectedTimeInterval
    const selectedLabel = this.data.selectedLabel
    // const selectedShortCutLabel = this.data.selectedShortCutLabel
    const isOver = this.data.isOver
    const active = this.data.active
    const courseConfig = {
      city,
     // searchText,
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
      /* success: function(event) {
        var page = getCurrentPages().pop() //当前页面
        if (page == undefined || page == null) return
        //page.onLoad() //或者其它操作
      } */
    })
  }
})