// pages/card/payCard.js
const api = getApp().api
import Store from '../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: '确认购卡信息',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    cardId: '',
    goodId: '',
    goodData: '',
    orderData: '',
    takeOrderCallBack:'',//创建订单回调结果
    imgUrl: getApp().globalData.imgUrl,
    currentPayWayState: [{ type: 1, state: false, momeyCreditState: true, isOpening: true, payType:true}, 
                         { type: 2, state: false, momeyCreditState: true, isOpening: true, payType: true}], //当前支付方式状态  1:卡支付； 2:微信支付

    //myCardCredit: 10, //卡余额  this.data.orderData.card_amount 可以替换                                //checkCardCredict方法下的值
    //myCardIsOpening: true, //卡是否开通 this.data.order.has_card
  },
  //校验当前余额状态
  checkCardCredict(){
    //支付方式
    if (this.data.orderData.pay_type == '0') { // no
      this.setData({
        ['currentPayWayState[1].state']: false,
        ['currentPayWayState[0].state']: false,
      })
    } else if (this.data.orderData.pay_type == '5') { //wx
      this.setData({
        ['currentPayWayState[0].state']: false,
        ['currentPayWayState[1].state']: true,
        ['currentPayWayState[0].payType']: false,
      })
    } else if (this.data.orderData.pay_type == '3') { //只能PLUS支付，例如排队等候的状态
      this.setData({
        ['currentPayWayState[0].state']: true,
        ['currentPayWayState[1].state']: false,
        ['currentPayWayState[1].payType']: false,
      })
    } else if (this.data.orderData.pay_type == '1') { //< !--PLUS余额不足，默认微信支付-- >
      this.setData({
        ['currentPayWayState[0].state']: false,
        ['currentPayWayState[1].state']: true,
      })
    } else if (this.data.orderData.pay_type == '2') { //<!--PLUS余额充足,PLUS支付-->
      this.setData({
        ['currentPayWayState[0].state']: true,
        ['currentPayWayState[1].state']: false,
        ['currentPayWayState[1].payType']: false,
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
    if (this.data.orderData.pay_amount && this.data.orderData.has_card){
      this.data.orderData.pay_amount - 0 > this.data.orderData.card_amount || 0
      ? this.setData({
          ['currentPayWayState[1].state'] : true,
          ['currentPayWayState[0].state']: false,
          ['currentPayWayState[0].momeyCreditState'] : false,
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
    console.log(this.data.orderData)
  },
  // 创建订单
  createOrder(){
    return new Promise((resolve,reject) => {
      let data = {
        goodId: this.data.goodId,
        payMode: 'wxlite',
        count: 1,
      }
      wx.showLoading({ title: '加载中...',})
      api.post('v2/good/takeOrder', data).then(res => {
        wx.hideLoading()
        if(res.code === 0){
          this.setData({
            takeOrderCallBack: res.msg
          }, () => { resolve() })
        } else {
          reject()
        }
      })

    })
  },
  // 微信支付
  wxPayAction(){
    return new Promise((resolve,reject) => {
      wx.requestPayment({
        timeStamp: this.data.takeOrderCallBack.timeStamp,
        nonceStr: this.data.takeOrderCallBack.nonceStr,
        package: this.data.takeOrderCallBack.package,
        signType: this.data.takeOrderCallBack.signType,
        paySign: this.data.takeOrderCallBack.paySign,
        success: (res) => {
          resolve()
        },
        fail: (res) => {
          reject()
        }
      })
      // let data = {
      //   openid: Store.getItem('userData').wx_lite_openid,
      //   outTradeNo: this.data.takeOrderCallBack.orderId,
      //   transactionId:'',
      //   outRefundNo:'',
      //   totalFee: this.data.orderData.pay_amount * 100, //后台分进制
      //   type:'',
      //   clientIp: '',
      //   payMode:'wxlite',
      // }
      // api.post('payment/wxPay', data).then(res => {
        

      // })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    if (options.cardId){
      this.setData({
        cardId: options.cardId
      })
    }
    if (options.goodId){
      this.setData({
        goodId: options.goodId
      })
    }
  },
  onShow(){
    this.data.cardId ? this.getCardGoodId() : ''
    this.data.goodId ? this.getGoodInfo() : ''
  },
  getCardGoodId: function(event) {
    const cardId = this.data.cardId
    const data = {
      cardDefId: cardId
    }
    api.post('card/getCardGoodId', data).then(res => {
      const goodId = res.msg
      this.setData({
        goodId
      })
      this.getGoodInfo()
    })
  },
  getGoodInfo: function() {
    const goodId = this.data.goodId
    const data = {
      goodId
    }
    api.post('v2/good/getGoodInfo', data).then(res => {
      const goodData = res.msg
      this.setData({
        goodData
      })
      this.checkOrder()
    })
  },
  checkOrder: function(event) {
    const goodId = this.data.goodId
    const data = {
      goodId
    }
    api.post('v2/good/checkOrder', data).then(res => {
      const orderData = res.msg
      this.setData({
        orderData
      }, ()=>{
        // this.getGoodInfo()
        this.checkCardCredict()
      })
    })
  },
  //支付
  handlePayBtnTap: function(event) {
    wx.showModal({
      title: '提示！',
      content: '是否确认购卡？',
      success : res => {
        if(res.confirm){
          let _this = this
          let currentPayType = _this.data.currentPayWayState.filter(val => {
            if (val.state) return val
          })
          _this.createOrder().then(() => {
            if (this.data.orderData.pay_type == '3' || this.data.orderData.pay_type == '2') {
              wx.showToast({ title: '支付成功', icon: 'none', mask: true })
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/member/card/memberCard',
                })
              }, 1000)
            }
            // 微信支付
            if (this.data.orderData.pay_type == '1' || this.data.orderData.pay_type == '5') {
              _this.wxPayAction().then(res => {
                wx.navigateBack()
              })
            }
          }, () => {
            wx.showToast({ title: res.msg || '生成失败', icon: 'none' })
          })
        }
      }
    })
    
  },
  //现在支付方式
  choosePaywayEvent(e){
    let currentIdx = e.currentTarget.dataset.ind + 1
    for (let i = 0; i < this.data.currentPayWayState.length; i ++ ){
      this.setData({
        ['currentPayWayState[' + i + '].state'] : false
      })
      if (currentIdx == this.data.currentPayWayState[i].type){
        this.setData({
          ['currentPayWayState[' + i + '].state']: true
        })
      }
    }
  },
  //充值
  jumpTocashMoney(){
    // getApp().globalData.rechargeSuccessRoute = `/pages/card/payCard?cardId=${this.data.cardId}`
    wx.navigateTo({
      url: './recharge',
    })
  },
})