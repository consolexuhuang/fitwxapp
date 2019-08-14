// pages/course/course.js
import CourseCom from "../../utils/courseCom.js";
const ui = require('../../utils/ui.js');
const util = require('../../utils/util.js')
const app = getApp();
const api = app.api;
const store = app.store;

//计算
//第一个店铺的top小于这个值时，固定标题显示；
const topInit = (120 + 160 + 112) / 2;
let query; //选择元素
let scrollLock = 0; //滑动计算锁
let onLoaded = false; //是否走了onLoad声明周期
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateList: '',
    courseList: '',
    pageList: '',
    displayedStore: '',
    isLoading: false,
    endLine: {},
    scrollTop: '',
    currentScrollTop: 0,
    isSuspensionShow: false,
    config: '',
    cityList: [],
    city: '',
    active: 0,
    selectedStore: [],
    selectedTimeInterval: [],
    selectedLabel: [],
    isOver: false,
    searchText: '',
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: 'Justin&Julie',
      showCapsule: 0,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: app.globalData.tab_height * 2 + 20,
    showStoreName: false, //是否显示固定的店铺名称
    currentStoreInfo: {}, //当前显示的店铺信息
    IsshowNetStatus: true, //网络显示状态
    calendarHeight: '',
    swiperHeight: {},

    memberFollowState: 1, //当前关注状态
    officialDataState: false,
    memberInfo:'',
    searchIn:false,//是否是搜素进来的
    activityPopupState:{
      state: false,
      bottomText:'送出祝福',
      width:580, //rpx
      height:769,
      imgSrc:'',
      url:''
    },//活动弹窗
    nowGetTime:'',
    // checkPromotion_course:{}, //首页的活动促销
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function(options) {
    console.log('onload')
    //进入onLoad
    onLoaded = true;
    // this.getShareCouponInfo()
    //检测登录
    app.checkSessionFun().then(() => {
      //初始化
      this.initFun();
      //判断用户是否关注公众号
      // this.getMemberFollowState()
    })
  },
  onShow() {
    // console.log('onShow')
    this.setData({ nowGetTime: new Date().getTime()})
    //判断用户是否关注公众号
    app.checkSessionFun().then(() => {
      this.getMemberFollowState()
      this.checkPromotion()
    })
    // this.getOfficialDataState()
    console.log('getApp().globalData.courseConfig')
    console.log(getApp().globalData.courseConfig)
    //搜索进来的
    if (getApp().globalData.courseConfig) {
      console.log('searchIn')
      //初始化    
      this.initFun();
      //设置是否是搜索页进入
      this.setData({
        searchIn:true
      })
      return;
    }

    /* 设置刷新时间 */
    let startMilliseconds = wx.getStorageSync('startMilliseconds');
    let interval = 10 * 60 * 1000; //间隔设为10分钟
    let nowGetTime = new Date().getTime();
    //有开始时间
    if (startMilliseconds && (nowGetTime - startMilliseconds <= interval)) {
      return;
    }
    //无开始时间、超出10分钟
    else {
      wx.setStorageSync('startMilliseconds', nowGetTime)
    };

    /* 预防onload和onShow都执行 */
    if (onLoaded) {
      return;
    };
    //恢复设置
    onLoaded = false;
    //初始化    
    this.initFun();
    //判断用户是否关注公众号
    this.getMemberFollowState()

  },
  onHide() {
    getApp().globalData.courseConfig = '';
  },
  /**
   * write@xuhuang  start
   */
  // 获取当前用户关注状态
  getMemberFollowState() {
    api.post('v2/member/memberInfo').then(res => {
      this.setData({
        memberFollowState: res.msg.sub_flag,
        officialDataState: res.msg.sub_flag == 1 ? false : true,
        memberInfo: res.msg
      })
    })
  },
  checkPromotion() {
    let data = {
      location: 'course'
    }
    api.post('v2/member/checkPromotion', data).then(res => {
      console.log('checkPromotion', res)
      console.log(this.data.nowGetTime - store.getItem('closeTime') || new Date().getTime())
      if(Object.keys(res.msg).length > 0){
        this.setData({
          ['activityPopupState.imgSrc']: res.msg.image,
          ['activityPopupState.url']: res.msg.url,
          ['activityPopupState.state']: (this.data.nowGetTime - store.getItem('closeTime') || new Date().getTime()) > 86400000 ? true : false
        })
      } else {
        this.setData({
          ['activityPopupState.state']: false
        })
      }
    })
  },
  // getOfficialDataState() {
  //   // sub_flag 1:关注 0:未关注
  //   if (store.getItem('userData') && store.getItem('userData').sub_flag === 0) {
  //     this.setData({ officialDataState: true })
  //   } else if (store.getItem('userData') && store.getItem('userData').sub_flag === 1) {
  //     this.setData({ officialDataState: false })
  //   }
  // },
  /**
   * write@xuhuang  end
   */
  // 下拉刷新
  onPullDownRefresh: function() {
    //loading
    ui.showLoading();
    const selectedStore = []
    const selectedTimeInterval = []
    const selectedLabel = []
    const isOver = false
    const searchText = ''
    const active = 0
    const searchIn = false
    this.setData({
      selectedStore,
      selectedTimeInterval,
      selectedLabel,
      isOver,
      searchText,
      active,
      searchIn
    })
    //获取数据
    CourseCom.getDateList(this)
    this.getCourseList()
    CourseCom.getConfig(this)
    wx.stopPullDownRefresh()
  },
  // 滚动过程中的监听
  onPageScroll: function(event) {

    //创建节点选择器
    query = wx.createSelectorQuery();
    //选择店铺名称class 
    query.selectAll(`#swiperItem${this.data.active} .store-wrapper`).boundingClientRect();
    query.exec((res) => {
      app.worker.postMessage({
        res: res
      })
    })
    app.worker.onMessage((res) => {
      this.setData({
        showStoreName: res.showStoreName,
        currentStoreInfo: res.currentStoreInfo
      })
    });

    //滚动头部监听
    const dateList = this.data.dateList
    const active = this.data.active
    const currentScrollTop = event.scrollTop
    const headerHeight = this.data.headerHeight
    if (currentScrollTop > headerHeight) {
      const isSuspensionShow = true
      if (isSuspensionShow !== this.data.isSuspensionShow) {
        this.setData({
          isSuspensionShow
        })
      }
    } else {
      const isSuspensionShow = false
      if (isSuspensionShow !== this.data.isSuspensionShow) {
        this.setData({
          isSuspensionShow
        })
      }
    }
    this.data.currentScrollTop = currentScrollTop
  },
  // 滚动到底部上拉加载数据
  onReachBottom: function(event) {

    const dateList = this.data.dateList
    const active = this.data.active
    const date = dateList[active].date
    if (this.data.endLine[date]) {
      return;
    }
    let pageList = this.data.pageList
    let page = pageList[date]
    page = page + 1
    pageList[date] = page
    const displayedStore = this.data.displayedStore
    const courses = this.data.courseList.courses
    const dateCourse = courses[date]

    let displayedStoreLength = 0,
      dateCourseLength = 0;

    const length = (page - 1) * 7 + 5
    if (displayedStore instanceof Object) {
      displayedStoreLength = displayedStore[date] ? displayedStore[date].length : 0;
    }
    if (dateCourse instanceof Object) {
      dateCourseLength = Object.keys(dateCourse) ? Object.keys(dateCourse).length : 0;
      displayedStore[date] = Object.keys(dateCourse).splice(0, length)
    }


    //设置数据
    this.setData({
      pageList,
      displayedStore,
    })
    //判断是否到底
    let dateDisplayedStore = 0;
    if (this.data.displayedStore instanceof Object) {
      dateDisplayedStore = this.data.displayedStore[date] ? this.data.displayedStore[date].length : 0;
    }
    if (dateDisplayedStore >= dateCourseLength) {
      const endLine = this.data.endLine
      endLine[date] = '-拉伸完毕-'
      this.setData({
        endLine
      })
    }

    //设置当前数据的高度
    this.setCourseSwiperHeight();
  },
  //卸载
  onUnload: function() {
    //app.worker.terminate()
  },
  initFun() {
    //loading
    ui.showLoading();

    //app方法
    app.setWatcher(this);

    //断网 
    wx.onNetworkStatusChange(res => {
      this.setData({
        IsshowNetStatus: res.isConnected
      })
    })


    //暂时不改为缓存里的数据，因为其他页面用到的这块东西太多，后面有时间再改
    let courseConfig = getApp().globalData.courseConfig;
    if (courseConfig) {
      const city = courseConfig.city || ''
      const selectedStore = courseConfig.selectedStore || []
      const selectedTimeInterval = courseConfig.selectedTimeInterval || []
      const selectedLabel = courseConfig.selectedLabel || []
      const isOver = courseConfig.isOver || false
      const searchText = courseConfig.searchText || ''
      const active = courseConfig.active || 0
      this.setData({
        city,
        selectedStore,
        selectedTimeInterval,
        selectedLabel,
        isOver,
        searchText,
        active
      })
      getApp().globalData.courseConfig = '';
    }

    /* 缓存里拿数据 */
    //获取缓存数据    
    let courseData = wx.getStorageSync('courseData');
    //有缓存
    if (courseData && courseData.dateList && courseData.courseList && courseData.config && courseData.city) { //缓存的courseData里缺少数据
      //赋值缓存里数据
      this.setData({
        dateList: courseData.dateList || '',
        courseList: courseData.courseList || '',
        pageList: courseData.pageList || '',
        displayedStore: courseData.displayedStore || '',
        endLine: courseData.endLine || {},
        config: courseData.config || '',
        cityList: courseData.cityList || [],
        city: courseData.city || '',
        active: courseData.active || 0,
        swiperHeight: courseData.swiperHeight || {}
      }, function() {
        //设置当前数据的高度
        this.setCourseSwiperHeight();
        //获取日历列表高度
        this.dateBoxHeight();
        //关闭loading
        ui.hideLoading();
      })
    } else {
      //获取数据
      CourseCom.getDateList(this)
      this.getCourseList()
      CourseCom.getConfig(this)

    }

    //清除缓存
    wx.removeStorage({
      key: 'courseData',
      success: function(res) {},
    })
  },
  watch: {
    active: function(newValue, oldValue) {
      if (newValue !== oldValue) { // 把每次滚动的距离记录进切换之前的日期里，然后在切换之后的日期下滚动到当前日期下记录的位置
        const dateList = this.data.dateList
        const oldDate = dateList[oldValue].date
        const newDate = dateList[newValue].date
        const currentScrollTop = this.data.currentScrollTop
        const scrollTop = this.data.scrollTop
        scrollTop[oldDate] = currentScrollTop
        this.setData({
          scrollTop
        }, () => {
          wx.pageScrollTo({
            scrollTop: scrollTop[newDate],
            duration: 0
          })
        })
      }
    }
  },

  // 获取课程列表
  getCourseList: function(event) {
    const city = this.data.city
    const storeIds = this.data.selectedStore.join()
    const timeIntervals = this.data.selectedTimeInterval.join()
    const labelIds = this.data.selectedLabel.join();
    // const shortCutLabelId = this.data.selectedShortCutLabel.join()
    const isOver = this.data.isOver ? 1 : 0
    const searchText = this.data.searchText
    const latitude = getApp().globalData.location && getApp().globalData.location.latitude || '31.24916171'
    const longitude = getApp().globalData.location && getApp().globalData.location.longitude || '121.487899486'
    const data = {
      city,
      storeIds,
      labelIds,
      timeIntervals,
      isOver,
      searchText,
      latitude,
      longitude
    }
    CourseCom.getCourseList(data, this).then(() => {
      //设置当前数据的高度
      this.setCourseSwiperHeight();
    });
  },
  // 获取展示的店铺
  getDisplayedStore: function(event) {
    const courses = this.data.courseList.courses
    const displayedStore = {}
    const pageList = {}
    for (let date in courses) {
      const dateCourse = courses[date]
      let storeCodeArr = [];
      for (let storeCode in dateCourse) {
        storeCodeArr.push(storeCode)
      }
      displayedStore[date] = storeCodeArr.splice(0, 5) //初始加载五个店铺的数据
      pageList[date] = 1
      if (displayedStore[date].length >= Object.keys(dateCourse).length) {
        const endLine = this.data.endLine
        endLine[date] = '--拉伸完成--'
        this.setData({
          endLine
        })
      } else {
        const endLine = this.data.endLine
        endLine[date] = ''
        this.setData({
          endLine
        })
      }
    }
    this.setData({
      displayedStore,
      pageList
    }, function() {
      ui.hideLoading();
    })
  },

  //设置当前数据的高度
  setCourseSwiperHeight() {
    let courseList = this.data.courseList.courses;
    let displayedStore = this.data.displayedStore;
    let displayedStoreArr = Object.keys(displayedStore);
    let displayedCourseList = {};
    for (let date of displayedStoreArr) {
      displayedCourseList[date] = {};
      let courseListDate = courseList[date];
      for (let displayedStoreCode of displayedStore[date]) {
        displayedCourseList[date][displayedStoreCode] = [];
        for (let storeCode in courseListDate) {
          if (storeCode == displayedStoreCode) {
            displayedCourseList[date][displayedStoreCode] = courseListDate[storeCode]
          }
        }
      }
    }
    this.setSwiperHeight(displayedCourseList);
  },

  //设置swiper高度   swiperHeight
  setSwiperHeight: function(courseList) { //courseList为7天的日期对象
    let swiperHeight = this.data.swiperHeight;
    let courses = courseList;
    let titleHeight = 120 + 20,
      noneHeight = 100 + 1,
      itemHeight = 272 + 1,
      loadingHeight = 80,
      noneStoreHeight = 500; //20是门店底部间距，1是每个课程下面的线,
    for (let item in courses) {
      let storeArr = Object.keys(courses[item]);
      let titleNum = storeArr.length;
      let noneNum = 0;
      let itemNum = 0;
      for (let storeKey of storeArr) {
        let storeCourseNum = courses[item][storeKey].length;
        if (storeCourseNum > 0) {
          itemNum += storeCourseNum
        } else {
          noneNum += 1
        }
      }
      //算出一天swiper总高度
      let countHeight = titleHeight * titleNum + noneHeight * noneNum + itemHeight * itemNum + loadingHeight;
      //设置
      swiperHeight[item] = countHeight;
    }
    //吧swiperHeight数组里0换成没有店铺的高度
    for (let date in swiperHeight) {
      swiperHeight[date] = swiperHeight[date] ? swiperHeight[date] : noneStoreHeight;
    }
    this.setData({
      swiperHeight
    })
  },
  //scrollTop
  scrollTopFun: function(event) {
    try {
      const scrollTop = {}
      const dateList = this.data.dateList
      dateList.forEach((item) => {
        scrollTop[item.date] = 0
      })
      this.setData({
        scrollTop
      })
    } catch (error) {}
  },


  // 跳转店铺筛选页面
  handleStoreScreenTap: function(event) {
    const storeList = this.data.config.storeList
    const cityList = this.data.cityList
    const city = this.data.city
    //const searchText = this.data.searchText
    const selectedStore = this.data.selectedStore
    const selectedTimeInterval = this.data.selectedTimeInterval
    const selectedLabel = this.data.selectedLabel
    // const selectedShortCutLabel = this.data.selectedShortCutLabel
    const isOver = this.data.isOver
    const active = this.data.active
    const storeScreen = {
      storeList,
      cityList,
      city,
      //searchText,
      selectedStore,
      selectedTimeInterval,
      selectedLabel,
      // selectedShortCutLabel,
      isOver,
      active
    }
    getApp().globalData.storeScreen = storeScreen
    wx.navigateTo({
      url: '/pages/course/storeScreen'
    })
  },
  // 跳转课程筛选页面
  handleCourseScreenTap: function(event) {
    const typeLabelList = this.data.config.typeLabelList
    const city = this.data.city
    //const searchText = this.data.searchText
    const selectedStore = this.data.selectedStore
    const selectedTimeInterval = this.data.selectedTimeInterval
    const selectedLabel = this.data.selectedLabel
    // const selectedShortCutLabel = this.data.selectedShortCutLabel
    const isOver = this.data.isOver
    const active = this.data.active
    const courseScreen = {
      typeLabelList,
      city,
      //searchText,
      selectedStore,
      selectedTimeInterval,
      selectedLabel,
      // selectedShortCutLabel,
      isOver,
      active
    }
    getApp().globalData.courseScreen = courseScreen
    wx.navigateTo({
      url: '/pages/course/courseScreen'
    })
  },
  // 跳转课程搜索页面
  handleCourseSearchTap: function(event) {
    const searchKeyWords = this.data.config.searchKeyWords
    const city = this.data.city
    const selectedStore = this.data.selectedStore
    const selectedTimeInterval = this.data.selectedTimeInterval
    const selectedLabel = this.data.selectedLabel
    // const selectedShortCutLabel = this.data.selectedShortCutLabel
    const isOver = this.data.isOver
    const searchText = this.data.searchText
    const active = this.data.active
    const courseSearch = {
      searchKeyWords,
      city,
      // selectedStore,
      // selectedTimeInterval,
      // selectedLabel,
      // selectedShortCutLabel,
      isOver,
      searchText,
      active
    }
    getApp().globalData.courseSearch = courseSearch
    wx.navigateTo({
      url: '/pages/course/courseSearch'
    })
  },
  //清除搜索
  clearSearch: function() {
    this.setData({
      searchText: ''
    })
    CourseCom.getDateList(this)
    this.getCourseList()
    CourseCom.getConfig(this)
  },
  //隐藏已结束
  handleSwitchChange: function({
    detail
  }) {
    const isOver = detail
    this.setData({
      isOver
    })
    CourseCom.getDateList(this)
    this.getCourseList()
    CourseCom.getConfig(this)
  },


  // 点击切换日期
  handleDateTap: function(event) {
    //充值顶部
    this.scrollTopFun();
    const active = event.currentTarget.dataset.index;
    if (event.type == 'tap') {
      this.swiperChangeFn(active);
    }
  },


  // 切换列表
  handleCurrentChange: function(event) {
    //充值顶部
    this.scrollTopFun();
    const active = event.detail.current;
    if (event.detail && event.detail.source == 'touch') {
      this.swiperChangeFn(active);
    }
  },
  swiperChangeFn(index) {
    this.setData({
      active: index,
      showStoreName: false
    })
  },
  // 点击banner跳转
  handleBannerTap: function(event) {
    const path = event.currentTarget.dataset.path;
    //如果地址里面有‘storeId=’就筛选出当前页面里的门店  util
    if (path.indexOf('storeId=') != -1) {
      //获取店铺id
      let storeId = util.getUrlParam(path, 'storeId').split(',');
      this.setData({
        selectedStore: storeId
      })
      this.getCourseList();
    }
    wx.navigateTo({
      url: path
    })
  },

  // 点击店铺跳转
  handleStoreTap: function(event) {
    const storeId = event.currentTarget.dataset.storeId
    wx.navigateTo({
      url: '/pages/store/storeDetail?storeId=' + storeId
    })
  },
  // 跳转课程详情
  handleCourseTap: function(event) {
    const goodId = event.currentTarget.dataset.goodId;
    const courseId = event.currentTarget.dataset.courseId
    if (goodId) {
      wx.navigateTo({
        url: '/pages/trainingCamp/trainingCamp/trainingCamp?goodId=' + goodId
      })
    } else {
      wx.navigateTo({
        url: '/pages/course/courseDetail?courseId=' + courseId
      })
    }
  },
  // 课程预约
  handleAppointBtnTap: function(event) {
    const courseId = event.currentTarget.dataset.courseId
    wx.navigateTo({
      url: '/pages/order/payOrder?courseId=' + courseId
    })
  },

  // 跳转教练课程列表
  handleCoachTap: function(event) {
    const coachId = event.currentTarget.dataset.coachId
    const goodId = event.currentTarget.dataset.goodId
    if (goodId) {
      wx.navigateTo({
        url: '/pages/trainingCamp/trainingCamp/trainingCamp?goodId=' + goodId
      })
    } else {
      wx.navigateTo({
        url: `/pages/coach/coach?coachId=${coachId}&&active=${this.data.active}`
      })
    }
  },
  //获取日历列表高度
  dateBoxHeight: function() {
    const query = wx.createSelectorQuery();
    query.select('.date-wrapper').boundingClientRect()
    query.exec((res) => {
      if (res) {
        this.setData({
          calendarHeight: res[0] ? res[0].height : 0
        })
      };
    });
  },
  //活地图跳转
  giveGiftCard(){
    store.setItem('closeTime', new Date().getTime())
    this.setData({
      ['activityPopupState.state']: false,
    })
    wx.navigateTo({
      url: this.data.activityPopupState.url,
    })
  },

})