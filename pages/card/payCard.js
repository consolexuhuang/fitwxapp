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
    currentPayWayState: [{ type: 1, state: true, momeyCreditState: true, isOpening: true, payType:true}, 
                         { type: 2, state: false, momeyCreditState: true, isOpening: true, payType: false}], //当前支付方式状态  1:卡支付； 2:微信支付

    //myCardCredit: 10, //卡余额  this.data.orderData.card_amount 可以替换                                //checkCardCredict方法下的值
    //myCardIsOpening: true, //卡是否开通 this.data.order.has_card
  },
  //校验当前余额状态
  checkCardCredict(){
    //支付方式
    if (this.data.goodData.pay_flag == 1){
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
    console.log(this.data.currentPayWayState)
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
        console.log('生成订单', res)
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
      let data = {
        openid: Store.getItem('userData').wx_lite_openid,
        outTradeNo: this.data.takeOrderCallBack.orderId,
        transactionId:'',
        outRefundNo:'',
        totalFee: this.data.orderData.pay_amount * 100, //后台分进制
        type:'',
        clientIp: '',
        payMode:'wxlite',
      }
      api.post('payment/wxPay', data).then(res => {
        console.log('微信支付回调',res)
        wx.requestPayment({
          timeStamp: res.msg.timeStamp,
          nonceStr: res.msg.nonceStr,
          package: res.msg.package,
          signType: res.msg.signType,
          paySign: res.msg.paySign,
          success : (res) => {
            console.log(res)
            resolve()
          },
          fail : (res) => {
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
      this.checkOrder()
      
    })
  },
  getGoodInfo: function(event) {
    const goodId = this.data.goodId
    const data = {
      goodId
    }
    api.post('v2/good/getGoodInfo', data).then(res => {
      console.log('gooddata', res.msg)
      const goodData = res.msg
      this.setData({
        goodData
      })
      this.checkCardCredict()
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
        console.log(this.data.orderData)
        this.getGoodInfo()
        
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
            if (currentPayType[0].type == 1) {
              wx.showToast({ title: '支付成功', icon: 'none', mask: true })
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/member/card/memberCard',
                })
              }, 1000)
            }
            // 微信支付
            // console.log(currentPayType[0].type)
            if (currentPayType[0].type == 2) {
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
    console.log('当前选择的支付方式', currentIdx == 1 ? "卡支付" : (currentIdx == 2 ? "微信支付" : '未知'))
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