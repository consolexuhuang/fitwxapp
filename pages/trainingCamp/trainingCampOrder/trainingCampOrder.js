// pages/trainingCamp/trainingCampOrder/trainingCampOrder.js
const api = getApp().api
import Store from '../../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    goodId:'',
    orderData:'',
    goodData:'',
    coachList:'',
    currentPayWayState: [{ type: 1, state: true, momeyCreditState: true, isOpening: true, payType: true },
    { type: 2, state: false, momeyCreditState: true, isOpening: true, payType: true }],
    navbarData: {
      title: '确认订单',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#fff",
      tab_topBackground: '#896DFF'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20

  },
  //校验当前余额状态
  checkCardCredict() {
    //支付方式
    if (this.data.goodData.pay_flag == 1) {
      this.setData({
        ['currentPayWayState[1].payType']: true,
        ['currentPayWayState[0].payType']: false,
      })
    } else if (this.data.goodData.pay_flag == 2) {
      this.setData({
        ['currentPayWayState[0].payType']: true,
        ['currentPayWayState[1].payType']: false,
      })
    } else if (this.data.goodData.pay_flag == 3) {
      this.setData({
        ['currentPayWayState[0].payType']: true,
        ['currentPayWayState[1].payType']: true,
      })
    }
    //是否开通
    this.data.orderData.has_card
      ? this.setData({
        ['currentPayWayState[0].isOpening']: true,
      })
      : this.setData({
        ['currentPayWayState[0].isOpening']: false,
        ['currentPayWayState[1].state']: true,
      })
    //余额是否足够
    if (this.data.orderData.pay_amount && this.data.orderData.has_card) {
      this.data.orderData.pay_amount - 0 > this.data.orderData.card_amount || 0
        ? this.setData({
          ['currentPayWayState[1].state']: true,
          ['currentPayWayState[0].state']: false,
          ['currentPayWayState[0].momeyCreditState']: false,
        })
        : this.setData({
          ['currentPayWayState[0].state']: true,
          ['currentPayWayState[0].momeyCreditState']: true,
        })
    } else { //未开通
      this.setData({
        ['currentPayWayState[1].state']: true,
        ['currentPayWayState[0].state']: false,
      })
    }
    console.log(this.data.currentPayWayState)
  },
  getGoodInfo(){
    let data = {
      goodId : this.data.goodId
    }
    api.post('v2/good/getGoodInfo', data).then(res => {
      console.log('getGoodInfo',res)
      if (res.code == 0) 
        this.setData({ 
          goodData : res.msg,
          coachList: res.msg.coach_course ? Object.values(res.msg.coach_course) : '',
        })
    })
  },
  checkOrder() {
    let data = {
      goodId: this.data.goodId
    }
    api.post('v2/good/checkOrder', data).then(res => {
      console.log('checkOrder', res)
      if (res.code == 0) {
        this.setData({ orderData: res.msg }, () => {
          this.checkCardCredict()
        })
      }
    })
  },
  // 创建订单
  createOrder() {
    return new Promise((resolve, reject) => {
      let data = {
        goodId: this.data.goodId,
        payMode: 'wxlite',
        count: 1,
      }
      wx.showLoading({ title: '加载中...', })
      api.post('v2/good/takeOrder', data).then(res => {
        wx.hideLoading()
        console.log('生成订单', res)
        if (res.code === 0) {
          this.setData({
            takeOrderCallBack: res.msg
          }, () => { resolve() })
        } else {
          reject(res)
        }
      })

    })
  },
  // 微信支付
  wxPayAction() {
    return new Promise((resolve, reject) => {
      let data = {
        openid: Store.getItem('userData').wx_lite_openid,
        outTradeNo: this.data.takeOrderCallBack.orderId,
        transactionId: '',
        outRefundNo: '',
        totalFee: this.data.orderData.pay_amount * 100, //后台分进制
        type: '',
        clientIp: '',
        payMode: 'wxlite',
      }
      api.post('payment/wxPay', data).then(res => {
        console.log('微信支付回调', res)
        wx.requestPayment({
          timeStamp: res.msg.timeStamp,
          nonceStr: res.msg.nonceStr,
          package: res.msg.package,
          signType: res.msg.signType,
          paySign: res.msg.paySign,
          success: (res) => {
            console.log(res)
            resolve()
          },
          fail: (res) => {
            console.log(res)
            reject()
          }
        })

      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.goodId){
      this.setData({ goodId: options.goodId})
    }
    this.getGoodInfo()
    this.checkOrder()
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
  //支付
  handlePayBtnTap: function (event) {
    let _this = this
    let currentPayType = _this.data.currentPayWayState.filter(val => {
      if (val.state) return val
    })
    _this.createOrder().then(() => {
      if (currentPayType[0].type == 1) {
        wx.showToast({ title: '支付成功', icon: 'none', mask: true })
        setTimeout(() => {
          wx.redirectTo({
            url: '../trainingCampPaySuccess/trainingCampPaySuccess?goodId=' + _this.data.goodId,
          })
        }, 1000)
      }
      // 微信支付
      // console.log(currentPayType[0].type)
      if (currentPayType[0].type == 2) {
        _this.wxPayAction().then(res => {
          wx.redirectTo({
            url: '../trainingCampPaySuccess/trainingCampPaySuccess?goodId=' + _this.data.goodId,
          })
        })
      }
    }, (data) => {
      wx.showToast({ title: data.msg || '生成失败', icon: 'none' })
    })

  },
  //现在支付方式
  choosePaywayEvent(e) {
    let currentIdx = e.currentTarget.dataset.ind + 1
    console.log('当前选择的支付方式', currentIdx == 1 ? "卡支付" : (currentIdx == 2 ? "微信支付" : '未知'))
    for (let i = 0; i < this.data.currentPayWayState.length; i++) {
      this.setData({
        ['currentPayWayState[' + i + '].state']: false
      })
      if (currentIdx == this.data.currentPayWayState[i].type) {
        this.setData({
          ['currentPayWayState[' + i + '].state']: true
        })
      }
    }
  },
  //充值
  jumpTocashMoney() {
    wx.navigateTo({
      url: '/pages/card/recharge',
    })
  },
  //开通
  jumpToCardOpening() {
    wx.switchTab({
      url: '/pages/card/card',
    })
  }
})