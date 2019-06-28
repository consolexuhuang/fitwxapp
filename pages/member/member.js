// pages/member/member.js
const app = getApp();
const api = app.api
import Store from '../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userCard: '',
    imgUrl: getApp().globalData.imgUrl,
    userData:'', //用户信息
    userInfoData:'',// 用户首页数据
    wx_userInfo:'',// 微信账户信息
    orderCount: 0,
    navbarData: {
      title: '我的',
      showCapsule: 0,
      isShowBackHome: false,
      titleColor: "#fff",
      tab_topBackground: '#8a73ff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({ 
      userData: Store.getItem('userData') || '' ,
      wx_userInfo: Store.getItem('wx_userInfo') || ''
    })
    // this.getGoingList()
    // this.getOrderCount()
  },
  onShow(){

    //检测登录
    app.checkSessionFun().then(() => {
    this.getUserInfo()
    this.getOrderCount()
    this.getGoingList()
    })

  },
  getUserInfo(){
    wx.showLoading({ title: '加载中...'})
    api.post('v2/member/liteMyInfo').then(res => {
      wx.hideLoading()
      console.log('userInfoData',res.msg)
      this.setData({ userInfoData: res.msg })
    })
  },
  //课程包
  getOrderCount: function (event) {
    // wx.showLoading({ title: '加载中...', })
    api.post('v2/good/getOrderCount').then(res => {
      // console.log('orderCount', res)
      // wx.hideLoading()
      wx.stopPullDownRefresh()
      const orderCount = Number(res.msg)
      this.setData({
        orderCount
      })
    })
  },
  //进行中
  getGoingList: function(event){
    api.post('payOrder/goingList').then(res => {
      console.log('goingList', res)
      const goingLength = res.msg.length
      let goingList = []
      if (goingLength > 0) goingList = res.msg.slice(0,1)
      this.setData({
        goingLength,
        goingList
      })
    })
  },
  handleRechargeTap: function(event) {
    wx.navigateTo({
      url: '/pages/card/recharge'
    })
  },
  // 跳转订单页面
  handleMemberOrderTap: function(event){
    wx.navigateTo({
      url: '/pages/member/order/memberOrder'
    })
  },
  // 跳转订单详情
  handleOrderItemTap: function(event){
    const orderNum = event.currentTarget.dataset.orderNum
    wx.navigateTo({
      url: '/pages/member/order/orderDetail?orderNum=' + orderNum
    })
  },
  // 跳转卡包页面
  handleMemberCardTap: function(event) {
    wx.navigateTo({
      url: '/pages/member/card/memberCard'
    })
  },
  // 跳转优惠券页面
  handleMemberCouponTap: function(event) {
    wx.navigateTo({
      url: '/pages/member/coupon/memberCoupon'
    })
  },
  // 跳转商品列表
  handleGoodTap: function(event) {
    wx.navigateTo({
      url: '/pages/member/good/good'
    })
  },
  // 跳转邀请页面
  handleInviteTap: function(event) {
    wx.navigateToMiniProgram({
      appId: getApp().globalData.JumpAppId.appid,
      path: 'pages/inviteShare/inviteShare',
      extraData: {
        foo: '我是拉新数据'
      },
      envVersion: getApp().globalData.JumpAppId.envVersion,
      success(res) {
        // 打开成功
        console.log(res)
      }
    })
  },
  // 立即预约
  jumpTocourseList(){
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  jumpToOrderStatus(e){
    let active = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: `/pages/member/order/memberOrder?status=${active}`,
    })
  },
  onPullDownRefresh(){
    getApp().wx_loginIn().then(() => {
      this.getGoingList()
      this.getUserInfo()
      wx.stopPullDownRefresh()
    })
  },
  //登陆
  bindgetuserinfo(e){
    wx.getUserInfo({
      success: res => {
        console.log('用户授权信息', res.userInfo)
        Store.setItem('wx_userInfo', res.userInfo)
        this.setData({ wx_userInfo: res.userInfo || '' })
        getApp().wx_modifyUserInfo();
      }
    })
  },
  //切换账号
  // switchAdmin(){
  //   wx.reLaunch({
  //     url: '../login/sureAdminLogin/sureAdminLogin',
  //   })
  // },
  //退出
  // loginOut(){
  //   wx.showModal({
  //     title: '提示！',
  //     content: '是否退出登陆？',
  //     success : res => {
  //       if(res.confirm){
  //         if (Store.getItem('userData')){
  //           let data = {
  //             link_name: Store.getItem('userData').nick_name,
  //             link_head_img: Store.getItem('userData').head_img,
  //           }
  //           Store.setItem('userIsLinkPublic', data)
  //           Store.clear('userData')
  //         }
  //         this.setData({
  //           userCard: '',
  //           sport: '',
  //           goingList: [],
  //           userData:''
  //         })
  //       }
  //     }
  //   })
  // }
})