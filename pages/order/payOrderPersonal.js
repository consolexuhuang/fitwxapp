// pages/order/order.js
const app = getApp();
const api = app.api;
const ui = require('../../utils/ui.js');
import Store from '../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodId: '',
    courseData: '',
    count: 1,
    couponId: '',
    firstCheck: true,
    timeCardId: '',
    isDetailShow: false,
    disclaimer: '',
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '确认订单', //导航栏 中间的标题
      isShowBackHome: true, //是否显示home
      tab_topBackground: '#896DFF',
      titleColor: '#fff'
    },
    marginTop: getApp().globalData.header_bar_height,
    isShowJurisdiction: false, //电话授权功能
    lineUpState: false,
    dialogConfig: {
      cancleBl: false,
      dialogTitle: '',
      dialogCont: '此课已满员，可预约其他的课程',
      dialogContColor: '#896FFF',
      dialogComfirmBtn: '返回首页',
      dialogCancleBtn: '',
      dialogImg: 'member/icon-top-blue.png'
    },
    orderLocation: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const goodId = options.goodId
    this.setData({
      goodId
    })
    wx.login({
      success: res_code => {
        this.setData({ code: res_code.code })
      }
    })
  },
  onShow() {
    ui.showLoadingMask();
    this.getGoodInfo().then()
  },
  getGoodInfo: function (event) {
    const goodId = this.data.goodId
    const data = {
      goodId
    }
    return new Promise((resolve, reject) => {
      api.post('v2/good/getGoodInfo', data).then(res => {
        if (res.code === 0) {
          const courseData = res.msg
          this.setData({
            courseData
          })
        }
        resolve();
      }).catch((err) => {
        console.log(err)
        reject()
      })
    })

  },

  // 显示详细
  handleDetailTap: function (event) {
    const isDetailShow = event.currentTarget.dataset.isDetailShow
    this.setData({
      isDetailShow
    })
  },

  handlePayModeTap: function (event) { // 支付模式切换
    ui.showLoadingMask();
    const timeCardId = event.currentTarget.dataset.timeCardId
    this.setData({
      timeCardId
    })
    this.checkOrder().then(() => {
      ui.hideLoading()
    })
  },
  handleCountTap: function (event) {
    this.setData({
      couponId: '',
    })
    const count = event.currentTarget.dataset.count
    if (count !== this.data.count) {
      ui.showLoadingMask();
      this.setData({
        count
      })
      this.checkOrder().then(() => {
        ui.hideLoading()
      })
    }
  },

  getMemberInfo() {
    let data = {
      memberId: Store.getItem('userData').id
    }

    return new Promise((resolve, reject) => {
      api.post('member/getMemberByMemberId', data).then(res => {
        this.setData({ memberInfo: res.msg });
        if (this.data.memberInfo.cellphone) {
          this.setData({ isShowJurisdiction: false })
        }
        else {

          this.setData({ isShowJurisdiction: true })
        }
        resolve()
      }).catch((err) => {
        console.log(err)
        reject()
      })
    })

  },
  // 充值
  handleRechargeTap: function (event) {
    const goodId = this.data.goodId
    // const rechargeSuccessRoute = '/pages/order/payOrder?goodId=' + goodId
    // getApp().globalData.rechargeSuccessRoute = rechargeSuccessRoute
    wx.navigateTo({
      url: `/pages/card/recharge`
    })
  },

  wxPay: function (obj) {
    let that = this
    wx.requestPayment({
      timeStamp: obj.timeStamp,
      nonceStr: obj.nonceStr,
      package: obj.package,
      signType: obj.signType,
      paySign: obj.paySign,
      success(res) {
        const orderNum = obj.orderNum
        wx.redirectTo({
          url: `/pages/order/paySuccess?orderId=${orderNum}`,
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

  //关闭免责声明
  agreeDisclaimer() {
    ui.showLoadingMask();
    api.post('v2/member/agreeDisclaimer').then(ret => {
      this.checkOrder().then(() => {
        ui.hideLoading();
      })
    })
  },
  //排队
  lineUp() {
    wx.showLoading({
      title: '排队中...',
    })
    if (!this.data.lineUpState) {
      this.checkOrder().then(() => {
        ui.hideLoading();
      })
    }
  },
  //返回首页
  goBackHome() {
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  // 获取当前订单经纬度
  getOrderLocation() {
    let that = this
    return new Promise(resolve => {
      wx.getLocation({
        type: 'gcj02',
        // isHighAccuracy: true,
        success(res) {
          // console.log('sssss', res)
          that.setData({ orderLocation: res })
          resolve()
        },
        fail(err) {
          //默认值
          let location = {
            latitude: '31.24916171',
            longitude: '121.487899486'
          }
          that.setData({ orderLocation: location })
          resolve()
        }
      })
    })
  }
})