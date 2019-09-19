 // pages/member/member.js
const app = getApp();
const api = app.api
import Store from '../../utils/store.js'
const store = getApp().store;
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
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    memberFollowState: 1, //当前关注状态
    officialDataState:false,
    memberInfo:'',

    jurisdictionSmallState: false,
    showAuthModel: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  },
  onShow(){
    app.checkSessionFun().then(() => {
      //this.getMemberFollowState()
      this.getUserInfo()
      this.getOrderCount()
      this.getGoingList()
      //检测登录
      this.setData({
        userData: Store.getItem('userData') || '',
        wx_userInfo: Store.getItem('wx_userInfo') || '',
        showAuthModel: !app.passIsLogin()
      })
    // this.getOfficialDataState()
    })

  },
  /**
   * write@xuhuang  start
   */
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
        userData: Store.getItem('userData') || '',
        wx_userInfo: Store.getItem('wx_userInfo') || '',
        showAuthModel: !app.passIsLogin()
      })
      this.getMemberFollowState()
      this.getUserInfo()
      this.getOrderCount()
      this.getGoingList()
    })
  },
  // 获取当前用户关注状态
  getMemberFollowState() {
    if (app.passIsLogin()) {
      api.post('v2/member/memberInfo').then(res => {
        console.log('getMemberFollowState', res)
        this.setData({
          memberFollowState: res.msg.sub_flag,
          officialDataState: res.msg.sub_flag == 1 ? false : true,
          memberInfo: res.msg
        })
        //存储用户信息
        wx.setStorageSync('userData', res.msg);
      })
    }
  },
  /**
   * write@xuhuang  end
   */
  getUserInfo(){
    if (app.passIsLogin()) {
      wx.showLoading({ title: '加载中...'})
      api.post('v2/member/liteMyInfo').then(res => {
        wx.hideLoading()
        console.log('userInfoData',res.msg)
        this.setData({ userInfoData: res.msg })
      })
    }
  },
  //课程包
  getOrderCount: function (event) {
    if (app.passIsLogin()) {
      api.post('v2/good/getOrderCount').then(res => {
        // console.log('orderCount', res)
        wx.stopPullDownRefresh()
        const orderCount = Number(res.msg)
        this.setData({
          orderCount
        })
      })
    } else {
      wx.stopPullDownRefresh()
    }
  },
  //进行中
  getGoingList: function(event){
    if (app.passIsLogin()) {
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
    }
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
  //跳转排名
  handleGroupTap(){
    wx.navigateToMiniProgram({
      appId: getApp().globalData.JumpAppId.appid,
      path: 'pages/shareRanking/shareRanking',
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
  //限时优惠
  handleGoodList(){
    wx.navigateTo({
      url: '/pages/good/good',
    })
  },
  jumpToOrderStatus(e){
    let active = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: `/pages/member/order/memberOrder?status=${active}`,
    })
  },
  onPullDownRefresh(){
      this.getGoingList()
      this.getUserInfo()
      wx.stopPullDownRefresh()
  },
  //更新用户信息
  upDateUserinfo(e){
    wx.getUserInfo({
      lang: 'zh_CN',
      success: res => {
        console.log('用户授权信息', res.userInfo)
        if ((res.userInfo.nickName != Store.getItem('userData').nick_name) || (res.userInfo.avatarUrl != Store.getItem('userData').head_img)) {
          Store.setItem('wx_userInfo', res.userInfo)
          this.setData({ wx_userInfo: res.userInfo || '' })
          getApp().wx_modifyUserInfo();
        } else {
          console.log('无需更新用户信息')
          this.setData({ wx_userInfo: res.userInfo || '' })
        }
      }
    })
  },
})