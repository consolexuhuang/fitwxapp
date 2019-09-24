// pages/member/order/memberOrder.js
import Store from '../../../utils/store.js' 
const app = getApp();
const ui = require('../../../utils/ui.js');
const api = getApp().api
let orderPageIng = 1, orderPageWait = 1, orderPageComplate = 1

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoaded:false,//是否加载完成
    active: 0, //当前索引
    sport: '',
    goingList: [],
    payingList: [],
    completedList: [],
    userInfoData: "",
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '训练',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    swiperHeight: getApp().globalData.systemInfo.screenHeight - getApp().globalData.tab_height - 100,
    showAuthModel: false,
    jurisdictionSmallState: false,
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function () {
    //loading
    ui.showLoading();
  },

  onShow() {
    //loading
    ui.showLoading();
    //获取当前应该显示tab    
    getApp().checkSessionFun().then(() => {
      //检测登录
      this.setData({
        showAuthModel: !app.passIsLogin()
      })
      //初始化数据
      this.dataInit();
    })
  },

  onReachBottom() {
    if (this.data.active == 0 && this.data.goingList.length != this.data.userInfoData.order.going_count) this.loadMoreOrder(++orderPageIng)
    if (this.data.active == 1 && this.data.payingList.length != this.data.userInfoData.order.unpay_count) this.loadMoreOrder(++orderPageWait)
    if (this.data.active == 2 && this.data.completedList.length != this.data.userInfoData.order.complete_count) this.loadMoreOrder(++orderPageComplate)
  },

  onPullDownRefresh() {
    //loading
    ui.showLoading();
    this.setData({
      isLoaded:false
    })
    this.dataInit().then(()=>{
      wx.stopPullDownRefresh();
    })
  },

  //提示授权
  showJurisdictionSmallPopup() {
    this.setData({
      jurisdictionSmallState: true
    })
  },
  // 点击授权
  bindgetuserinfo() {
    app.wx_AuthUserLogin().then(() => {
      this.setData({
        jurisdictionSmallState: false,
        showAuthModel: !app.passIsLogin()
      })
      //初始化数据
      this.dataInit();
    })
  },

  // 初始化数据
  dataInit(){
    orderPageIng = orderPageWait = orderPageComplate = 1;
    this.setData({ goingList: '', payingList: '', completedList: '' })
    return Promise.all([this.getUserInfo(), this.getSport(), this.loadMoreOrder(1)]).then(()=>{  
      //hideLoading
      this.setData({
        isLoaded:true
      })
      ui.hideLoading();
    }).catch(err=>{
      console.err('err:'+err)
    });
  },
  // 获取用户训练记录
  getUserInfo() {
    return new Promise((resolve,reject)=>{
      api.post('v2/member/liteMyInfo').then(res => {
        this.setData({ userInfoData: res.msg });
        resolve();
      })
    }) 
  },
  // 运动数据
  getSport(event) {
    return new Promise(resolve => {
      api.post('payOrder/sportTotalAndMonth').then(res => {
        const sport = res.msg
        this.setData({
          sport
        });
        resolve();
      })
    })
  },
  //付款
  goPay(e){
    let orderId = e.currentTarget.dataset.orderid;
    let param = {
      orderId
    }
    api.post('payOrder/payForOrder', param).then(res => {
      this.wxPay(res.msg);
    });
  },
  wxPay: function (obj) {
    wx.requestPayment({
      timeStamp: obj.timeStamp,
      nonceStr: obj.nonceStr,
      package: obj.package,
      signType: obj.signType,
      paySign: obj.paySign,
      success(res) {
        const orderNum = obj.orderNum
        wx.redirectTo({
          url: '/pages/order/paySuccess?orderId=' + orderNum
        })
      },
      fail(res) {
        wx.showToast({
          title: '支付失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  handleTabTap(event) {
    //loading
    ui.showLoading();
    this.setData({
      isLoaded:false
    })
    let index = event.currentTarget.dataset.index;
    this.setData({
      active: index
    })
    let page = 1;
    this.loadMoreOrder(page).then(()=>{
      //hideLoading
      ui.hideLoading()
      this.setData({
        isLoaded: true
      })
    });
  },

  // 跳转本月更多
  handleMoreTap() {
    console.log('jump')
    wx.navigateTo({
      url: '/pages/member/order/monthRecord'
    })
  },
  handleOrderItemTap: function (event) {
    const orderNum = event.currentTarget.dataset.orderNum
    console.log(event)
    wx.navigateTo({
      url: '/pages/member/order/orderDetail?orderNum=' + orderNum
    })
  },
  // 跳转教练课程列表
  handleCoachTap: function (event) {
    // console.log(event)
    const coachId = event.currentTarget.dataset.coachid
    wx.navigateTo({
      url: '/pages/coach/coach?coachId=' + coachId
    })
  },

  //分页
  loadMoreOrder(pageNum) {
    let data = {
      status: this.data.active == 0 ? '2' : (this.data.active == 1 ? '1' : this.data.active == 2 ? '3' : '2'),
      date1: '', //开始时间
      date2: '', //结束时间
      page: pageNum,
      size: 10,
      needTotalCount: true
    }
  return new Promise((resolve,reject)=>{
    api.post('v2/payOrder/getOrderListByPage', data).then(res => {
      // wx.hideLoading()
      if (this.data.active == 0) {
        if (pageNum == 1) {
          this.setData({ goingList: res.msg.result })
        } else {
          this.setData({ goingList: [...this.data.goingList, ...res.msg.result] })
        }
      }
      if (this.data.active == 1) {
        if (pageNum == 1) {
          this.setData({ payingList: res.msg.result })
        } else {
          this.setData({ payingList: [...this.data.payingList, ...res.msg.result] })
        }
      }
      if (this.data.active == 2) {
        if (pageNum == 1) {
          this.setData({ completedList: res.msg.result })
        } else {
          this.setData({ completedList: [...this.data.completedList, ...res.msg.result] })
        }
      }
      resolve();
    })
  })
  
  }

})