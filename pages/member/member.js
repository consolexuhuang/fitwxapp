// pages/member/member.js
const app = getApp();
const api = app.api
import Store from '../../utils/store.js'
const ui = require('../../utils/ui.js');
const store = getApp().store;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    userData: '', //用户信息
    liteMyInfo: {}, // 用户首页数据
    wx_userInfo: '', // 微信账户信息
    orderCount: 0,
    navbarData: {
      title: '我的',
      showCapsule: 0,
      isShowBackHome: false,
      titleColor: "#333",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    memberFollowState: 1, //当前关注状态
    officialDataState: false,
    // memberInfo: '',
    jurisdictionSmallState: false,
    showAuthModel: false,
    isPlus: 0, //是否是Plus会员，0：否，1：是
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //loading
    ui.showLoading();

  },
  onShow() {
    app.checkSessionFun().then(() => {
      this.setData({
        showAuthModel: !app.passIsLogin()
      })
      let liteMyInfo = wx.getStorageSync('liteMyInfo');
      if (liteMyInfo !== '') {
        this.setData({
          liteMyInfo
        })
      }
      Promise.all([this.getUserInfo(), this.getOrderCount()])
        .then(() => {
          //关闭loading
          ui.hideLoading();
        })
      //检测登录
      this.setData({
        userData: Store.getItem('userData') || '',
        wx_userInfo: Store.getItem('wx_userInfo') || '',
      })
    })

  },

  onPullDownRefresh() {
    //loading
    ui.showLoading();
    this.getUserInfo().then(() => {
      //关闭loading
      ui.hideLoading();
      wx.stopPullDownRefresh()
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
    //loading
    ui.showLoading();
    app.wx_AuthUserLogin().then(() => {
      this.setData({
        jurisdictionSmallState: false,
        userData: Store.getItem('userData') || '',
        wx_userInfo: Store.getItem('wx_userInfo') || '',
        showAuthModel: !app.passIsLogin()
      })
      Promise.all([this.getUserInfo(), this.getOrderCount()])
        .then(() => {
          //关闭loading
          ui.hideLoading();
        })
    })
  },
  getUserInfo() {
    if (app.passIsLogin()) {
      return api.post('v2/member/liteMyInfo').then(res => {
        let resData = res.msg;
        let card_balance = res.msg.card_balance || 0;
        let isPlus = card_balance ? 1 : 0;
        let liteMyInfo = {
          isPlus,
          card_balance: resData.card_balance,
          card_no: resData.card_no,
          coupon_count: resData.coupon_count,
        }
        this.setData({
          liteMyInfo
        });
        //缓存数据
        wx.setStorageSync('liteMyInfo', liteMyInfo)
      })
    }
  },
  //课程包
  getOrderCount: function (event) {
    return new Promise((resolve, reject) => {
      if (app.passIsLogin()) {
        api.post('v2/good/getOrderCount').then(res => {
          wx.stopPullDownRefresh()
          const orderCount = Number(res.msg)
          this.setData({
            orderCount
          })
          resolve()
        })
      } else {
        wx.stopPullDownRefresh()
        resolve()
      }
    })

  },

  handleRechargeTap: function (event) {
    let isPlus = event.currentTarget.dataset.isPlus;
    wx.navigateTo({
      url: `/pages/card/recharge`
    })
  },

  // 跳转卡包页面
  handleMemberCardTap: function (event) {
    wx.navigateTo({
      url: '/pages/member/card/memberCard'
    })
  },
  // 跳转优惠券页面
  handleMemberCouponTap: function (event) {
    wx.navigateTo({
      url: '/pages/member/coupon/memberCoupon'
    })
  },
  // 跳转商品列表
  handleGoodTap: function (event) {
    wx.navigateTo({
      url: '/pages/member/good/good'
    })
  },
  //跳转排名
  handleGroupTap() {
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
  handleInviteTap: function (event) {
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

  //限时优惠
  handleGoodList() {
    wx.navigateTo({
      url: '/pages/good/good',
    })
  },

  //更新用户信息
  upDateUserinfo(e) {
    wx.getUserInfo({
      lang: 'zh_CN',
      success: res => {
        console.log('用户授权信息', res.userInfo)
        if ((res.userInfo.nickName != Store.getItem('userData').nick_name) || (res.userInfo.avatarUrl != Store.getItem('userData').head_img)) {
          Store.setItem('wx_userInfo', res.userInfo)
          this.setData({
            wx_userInfo: res.userInfo || ''
          })
          getApp().wx_modifyUserInfo();
        } else {
          console.log('无需更新用户信息')
          this.setData({
            wx_userInfo: res.userInfo || ''
          })
        }
      }
    })
  },
})