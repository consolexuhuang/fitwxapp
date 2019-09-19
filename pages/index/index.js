// pages/index/index.js
import CourseCom from "../../utils/courseCom.js";
const ui = require('../../utils/ui.js');
const app = getApp();
const api = app.api;
import Store from '../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateList: '',
    courseList: '',
    pageList: '',
    displayedStore: '',
    endLine: {},
    config: '',
    cityList: [],
    city: '',
    active: 0,
    complete: {},
    imgUrl: app.globalData.imgUrl,
    everyPageNum: 5, //每页显示店铺数量
    swiperHeight: {},
    navbarData: {
      title: '',
      showCapsule: 0,
      isShowBackHome: false,
      titleColor: "#8969FF",
      tab_topBackground: '#8969FF'
    },
    memberFollowState: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.shareMemberId) {
      wx.setStorageSync('shareMemberId', options.shareMemberId)
    }
    //删除进入状态
    wx.removeStorageSync('noFind');

    app.checkSessionFun().then(()=>{
      this.setData({
        userData: Store.getItem('userData') || ''
      })
      this.getDataInit();
      // if (Store.getItem('userData') && Store.getItem('userData').nick_name) {
      //   this.getDataInit();
      // };
    },()=>{
      // console.log('拒绝授权')
      this.getDataInit();
    })

    //this.checkSessionFun();
  },
  // 获取展示的店铺
  getDisplayedStore: function(event) {
    const courses = this.data.courseList.courses
    const displayedStore = {}
    const pageList = {}
    for (const date in courses) {
      const dateCourse = courses[date]
      displayedStore[date] = Object.keys(dateCourse).splice(0, this.data.everyPageNum) //初始加载五个店铺的数据
      pageList[date] = 1
      if (displayedStore[date].length >= Object.keys(dateCourse).length) {
        const endLine = this.data.endLine
        endLine[date] = '-拉伸完毕-'
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
      pageList,
    })
  },
  //loading
  loadingText() {
    if (this.data.loadText) {
      return
    }
    const loadText = '加载中'
    this.setData({
      loadText
    })
  },
  //加载数据
  getData() {
    //课程参数
    const courseParam = {
      latitude: app.globalData.location && app.globalData.location.latitude,
      longitude: app.globalData.location && app.globalData.location.longitude,
      city: this.data.city,
      isOver: 0
    }
    CourseCom.getConfig(this).then(() => {
        return CourseCom.getCourseList(courseParam, this)
      })
      .then(() => {
        const dateList = this.data.dateList
        const courseList = this.data.courseList
        const pageList = this.data.pageList
        const displayedStore = this.data.displayedStore
        const endLine = this.data.endLine
        const config = this.data.config
        const cityList = this.data.cityList
        const city = this.data.city
        const active = this.data.active
        const swiperHeight = this.data.swiperHeight
        console.log('index dateList')
        console.log(dateList)
        const courseData = {
          dateList,
          courseList,
          pageList,
          displayedStore,
          endLine,
          config,
          cityList,
          city,
          active,
          swiperHeight
        }
        //app.globalData.courseData = courseData
        //存储数据
        wx.setStorage({
          key: 'courseData',
          data: courseData,
        })
        wx.switchTab({
          url: '/pages/course/course'
        });
        // if (Store.getItem('userData')) {
        //   //跳转到课程页面     
        //   wx.switchTab({
        //     url: '/pages/course/course'
        //   });
        // } else {
        //   // getApp().wx_loginIn()
        // }
      })
  },
  //更新用户
  // bindgetuserinfo(e) {
  //   app.checkSessionFun().then(() => {
  //     this.setData({
  //       userData: Store.getItem('userData')
  //     })
  //     if (Store.getItem('userData') && Store.getItem('userData').nick_name) {
  //       this.getDataInit();
  //     };
  //   }, () => {
  //     console.log('拒绝授权')
  //   })    
  // },
  
  //加载数据
  getDataInit() {
    //加载数据
    if (app.globalData.location) {
      this.loadingText();
      this.getData();
    } else {
      //获取位置
      app.getLocation().then(() => {
        this.loadingText();
        this.getData();
      })
    }
  }

})