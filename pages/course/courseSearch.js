// pages/course/courseSearch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchKeyWords: [],
    historySearch: [],
    city: '',
    selectedStore: [],
    selectedTimeInterval: [],
    selectedLabel: [],
    // selectedShortCutLabel: [],
    isOver: false,
    searchText: '',
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '搜索',
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
    let courseSearch = getApp().globalData.courseSearch
    if (getApp().globalData.courseSearch) {
      const searchKeyWords = getApp().globalData.courseSearch.searchKeyWords
      const city = getApp().globalData.courseSearch.city
      // const selectedStore = getApp().globalData.courseSearch.selectedStore
      // const selectedTimeInterval = getApp().globalData.courseSearch.selectedTimeInterval
      // const selectedLabel = getApp().globalData.courseSearch.selectedLabel
      // const selectedShortCutLabel = getApp().globalData.courseSearch.selectedShortCutLabel
      const isOver = getApp().globalData.courseSearch.isOver
      const searchText = getApp().globalData.courseSearch.searchText
      const active = getApp().globalData.courseSearch.active
      this.setData({
        searchKeyWords,
        city,
        // selectedStore,
        // selectedTimeInterval,
        // selectedLabel,
        // selectedShortCutLabel,
        isOver,
        searchText,
        active
      })
      if (getApp().globalData.historySearch) {
        const historySearch = getApp().globalData.historySearch
        this.setData({
          historySearch
        })
      }
      getApp().globalData.courseSearch = ''
    }
  },
  // 获取搜索框的内容
  handleSearchTextChange: function(event){
    const searchText = event.detail.value
    this.setData({
      searchText
    })
  },
  // 点击热门搜索
  handleSearchKeyWordsTap: function(event) {
    const city = this.data.city
    // const selectedStore = this.data.selectedStore
    // const selectedTimeInterval = this.data.selectedTimeInterval
    // const selectedLabel = this.data.selectedLabel
    // const selectedShortCutLabel = this.data.selectedShortCutLabel
    const isOver = this.data.isOver
    const searchText = event.currentTarget.dataset.searchText
    const active = this.data.active

    const courseConfig = {
      city,
      // selectedStore,
      // selectedTimeInterval,
      // selectedLabel,
      // selectedShortCutLabel,
      isOver,
      searchText,
      active
    }
    // getApp().globalData.courseConfig = courseConfig
    this.handleCourseSearch(courseConfig)
  },
  // 点击搜索按钮
  handleSearchBtnTap: function(event){
    const city = this.data.city
    // const selectedStore = this.data.selectedStore
    // const selectedTimeInterval = this.data.selectedTimeInterval
    // const selectedLabel = this.data.selectedLabel
    // const selectedShortCutLabel = this.data.selectedShortCutLabel
    const isOver = this.data.isOver
    const searchText = this.data.searchTexts
    const active = this.data.active
    const courseConfig = {
      city,
      // selectedStore,
      // selectedTimeInterval,
      // selectedLabel,
      // selectedShortCutLabel,
      isOver,
      searchText,
      active
    }
    this.handleCourseSearch(courseConfig)
  },
  // 点击取消按钮
  handleCancelTap: function(event){
    const city = this.data.city
    // const selectedStore = this.data.selectedStore
    // const selectedTimeInterval = this.data.selectedTimeInterval
    // const selectedLabel = this.data.selectedLabel
    // const selectedShortCutLabel = this.data.selectedShortCutLabel
    const isOver = this.data.isOver
    const active = this.data.active
    const searchText = ''
    const courseConfig = {
      city,
      // selectedStore,
      // selectedTimeInterval,
      // selectedLabel,
      // selectedShortCutLabel,
      isOver,
      searchText,
      active
    }
    // getApp().globalData.courseConfig = courseConfig
    this.handleCourseSearch(courseConfig)
  },
  // 搜索功能
  handleCourseSearch: function(courseConfig){
    getApp().globalData.courseConfig = courseConfig
    let historySearch = this.data.historySearch
    if (courseConfig.searchText) {
      historySearch = [courseConfig.searchText].concat(historySearch)
      if (historySearch.length > 10) {
        historySearch = historySearch.slice(0, 10)
      }
      getApp().globalData.historySearch = historySearch
    }
    wx.switchTab({
      url: '/pages/course/course',
      success: function(event) {
        const page = getCurrentPages().pop() //当前页面
        if (page == undefined || page == null) return
        //page.onLoad() //或者其它操作
      }
    })
  },
  handleClearTap: function(event){
    wx.showModal({
      title: '提示！',
      content: '是否删除所有历史记录？',
      success : res => {
        if (res.confirm){
          const historySearch = []
          this.setData({
            historySearch
          })
          getApp().globalData.historySearch = historySearch
        }
      }
    })
  }
})