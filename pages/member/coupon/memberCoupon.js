// pages/member/coupon/memberCoupon.js
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    couponList: [],
    isDialogShow: false,
    redeem: '',
    dialogConfig: {
      cancleBl: true,
      dialogTitle: '',
      dialogCont: '',
      dialogComfirmBtn: '确定',
      dialogCancleBtn: '取消',
      dialogImg: ''
    },
    couponRuleShow: false, //规则弹窗
    navbarData: {
      title: '我的礼券',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    shareCoupon:'',//邀请数据
    invitedInfo:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      dialogConfig: { ...this.data.dialogConfig,
        dialogTitle: '优惠不过期，约课更开心 ',
        dialogCont: '是否订阅用卡提醒“优惠券到期提醒” 优惠券到期前1天通过短信消息提醒？',
        dialogContColor: '',
        dialogComfirmBtn: '我同意',
        dialogCancleBtn: '我不同意',
        dialogImg: 'card/dialogImg_success.png'
      },
      // isDialogShow: true
    })
      //检测登录
      app.checkSessionFun().then(() => {
        if (!app.passIsLogin()) {
          this.setData({ jurisdictionState: true })
        }else{
          this.getUserCoupons()
          this.agreeNotifyShow()
          this.getShareCouponInfo()
          this.getInvitedInfo()
        }
      },()=>{
        this.setData({ jurisdictionState: true })
      })
  },
  // 点击授权
  bindgetuserinfo() {
    app.wx_AuthUserLogin().then(() => {
      this.setData({ jurisdictionState: false })
      this.getUserCoupons()
      this.agreeNotifyShow()
      this.getShareCouponInfo()
      this.getInvitedInfo()
      // this.getOfficialDataState()
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  getUserCoupons: function(event) {
    const page = 1
    const size = 50
    const data = {
      page,
      size
    }
    // wx.showLoading({ title: '加载中...', })
    api.post('coupon/getUserCoupons', data).then(res => {
      // wx.hideLoading()
      wx.stopPullDownRefresh()
      const couponList = res.msg.result
      this.setData({
        couponList
      })
    })
  },
  agreeNotifyShow: function(event) {
    api.post('v2/member/agreeNotifyShow').then(res => {
      const isDialogShow = res.msg
      this.setData({
        isDialogShow
      })
    })
  },
  agreeNotify: function(isAgree){
    const data = {
      isAgree
    }
    api.post('v2/member/agreeNotify', data).then(res => {
      this.agreeNotifyShow()
    })
  },
  inputContent: function (event) {
    const redeem = event.detail.value
    this.setData({
      redeem
    })
  },
  handleExchangeCouponTap: function(event){
    const redeem = this.data.redeem
    const data = {
      redeem
    }
    api.post('coupon/exchangeCoupon', data).then(res => {
      if (res.code === 0 && Object.keys(res.msg).length > 0) {
        console.log('兑换成功：' + res.msg.count + '张，合计' + res.msg.amount + '元')
        wx.showToast({
          title: '兑换成功：' + res.msg.count + '张，合计' + res.msg.amount + '元',
          icon: 'none',
          duration: 2000
        })
        const redeem = ''
        this.setData({
          redeem
        })
        this.getUserCoupons()
      } else {
        wx.showToast({
          title: Object.keys(res.msg).length > 0 ? res.msg : '兑换失败！',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // 获取页面的数据及分享的配置参数
  getShareCouponInfo: function () {
    api.post('v2/coupon/shareCouponInfo').then(res => {
      const shareCoupon = res.msg
      this.setData({
        shareCoupon
      })
    })
  },
  // 获取邀请信息
  getInvitedInfo: function () {
    api.post('v2/member/getInvitedInfo').then(res => {
      const invitedInfo = res.msg
      this.setData({
        invitedInfo
      })
    })
  },
  handleCouponItemTap: function(event){
    wx.switchTab({
      url: '/pages/course/course'
    })
  },
  // 组件取消事件
  cancleEventComp() {
    console.log('取消')
    this.agreeNotify(false)
  },
  //组件确认事件
  comfirmEventComp() {
    console.log('确定')
    this.agreeNotify(true)
  },
  //弹窗显示
  showCouponRule() {
    this.setData({ couponRuleShow: true })
  },
  //关闭弹窗
  onclose() {
    this.setData({ couponRuleShow: false })
  },
  onPullDownRefresh(){
    this.getUserCoupons()
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
})