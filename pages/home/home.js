// pages/home/home.js
const ui = require('../../utils/ui.js');
const util = require('../../utils/util.js')
const app = getApp();
const api = app.api;
const store = app.store;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: 'Justin&Julie',
      showCapsule: 0,
      isShowBackHome: false,
      titleColor: "#fff",
      tab_topBackground: '#896EFF'
    },
    marginTopBar: getApp().globalData.header_bar_height,
    config: '',
    goodListData: '',
    coachList: '',
    categoryList: '',
    jurisdictionSmallState: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //loading
    ui.showLoading();
    //获取config里banner
    this.getConfig();
    //获取限时优惠列表
    this.getGoodList();
    //获取教练列表
    this.getCoachList();
    //获取课程分类
    this.getCategoryList().then(() => {
      //关闭loading
      ui.hideLoading();
    });
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
  //下拉刷新
  onPullDownRefresh() {
    //loading
    ui.showLoading();
    //获取config里banner
    this.getConfig();
    //获取限时优惠列表
    this.getGoodList();
    //获取教练列表
    this.getCoachList();
    //获取课程分类
    this.getCategoryList().then(() => {
      //关闭loading
      ui.hideLoading();
      //停止下拉刷新
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 自定义函数
   */
  //初始化
  initFun() {

  },
  // 点击banner跳转
  handleBannerTap: function (event) {
    const path = event.currentTarget.dataset.path;
    //底部tabbar页面
    if ((path.indexOf('storeId=') == -1 && path.indexOf('pages/course/course') != -1) || path.indexOf('pages/member/order/memberOrder') != -1 || path.indexOf('pages/member/member') != -1 || path.indexOf('pages/home/home') != -1){
      wx.switchTab({
        url: path,
      })
    }
    //如果地址里面有‘storeId=’就筛选出当前页面里的门店  util
    if (path.indexOf('storeId=') != -1 && path.indexOf('pages/course/course') != -1) {
      //获取店铺id
      let storeId = util.getUrlParam(path, 'storeId').split(',');
      const selectedStore = []
      selectedStore.push(storeId)
      const courseConfig = {
        selectedStore
      }
      getApp().globalData.courseConfig = courseConfig
      wx.switchTab({
        url: '/pages/course/course',
      })
    };
    wx.navigateTo({
      url: path
    })
  },
  //限时优惠---更多
  handleGoodList() {
    wx.navigateTo({
      url: '/pages/good/good',
    })
  },
  //限时优惠---详情
  goodView(event) {
    if (getApp().passIsLogin()) {
      let item = event.currentTarget.dataset.item;
      let goodId = item.id;

      //自定义分析
      wx.reportAnalytics('home_goodlist_item', {
        goodid: goodId,
      });

      if (item.type === 'COUPON') {
        wx.navigateTo({
          url: `/pages/good/goodDetail?goodId=${goodId}`
        })
      }
      else if (item.type === 'COURSE') {
        wx.navigateTo({
          url: `/pages/trainingCamp/trainingCamp/trainingCamp?goodId=${goodId}`
        })
      }
      else if (item.type === 'CARD') {
        console.log('9999')
        wx.navigateTo({
          url: `/pages/card/payCard?goodId=${goodId}`
        })
      }
    } else {
      this.setData({
        jurisdictionSmallState: true
      })
    }

  },
  // 跳转教练课程列表
  handleCoachTap: function (event) {
    const coachId = event.currentTarget.dataset.coachId

    //自定义分析
    wx.reportAnalytics('home_coach_item', {
      coachid: coachId,
    });

    wx.navigateTo({
      url: `/pages/coach/coach?coachId=${coachId}`
    })
  },
  //跳转到课程列表页面
  gotoCourse() {
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  //点击课程类别
  handleTempTap: function (event) {
    const tempIds = event.currentTarget.dataset.temp;

    //自定义分析
    wx.reportAnalytics('home_course_item', {
      temp: tempIds,
    });

    const courseConfig = {
      tempIds
    }
    getApp().globalData.courseConfig = courseConfig;
    console.log('getApp().globalData.courseConfig66666')
    console.log(getApp().globalData.courseConfig)
    wx.switchTab({
      url: `/pages/course/course`,
    })
  },
  // 点击授权
  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.setData({
        jurisdictionSmallState: false,
      })
      this.getGoodList()
    })
  },
  //获取config里banner
  getConfig() {
    const data = {
      latitude: app.globalData.location && app.globalData.location.latitude || '31.24916171',
      longitude: app.globalData.location && app.globalData.location.longitude || '121.487899486',
    }
    return api.post('v2/course/getConfig', data).then(res => {
      const config = res.msg;
      this.setData({
        config,
      })
    })
  },
  //获取限时优惠列表
  getGoodList() {
    api.post('v2/good/getGoodList').then(ret => {
      this.setData({
        goodListData: ret.msg
      })
    })
  },
  //获取教练列表
  getCoachList() {
    api.post('coach/getCoachList').then(ret => {
      this.setData({
        coachList: ret.msg
      })
    })
  },
  //获取课程分类
  getCategoryList() {
    return api.post('v2/course/getCategoryList').then(ret => {
      this.setData({
        categoryList: ret.msg
      })
    })
  },
})