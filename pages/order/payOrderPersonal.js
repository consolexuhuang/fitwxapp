// pages/order/order.js
const app = getApp();
const api = app.api;
const ui = require('../../utils/ui.js');
import Store from '../../utils/store.js'

let goodId='';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodInfo: '',
    navbarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '确认订单', //导航栏 中间的标题
      isShowBackHome: true, //是否显示home
      tab_topBackground: '#896DFF',
      titleColor: '#fff'
    },
    marginTop: getApp().globalData.header_bar_height,
    orderLocation: '',
    isShowJurisdiction: false, //电话授权功能
    orderData: '',
    currentPayWayState: [
      { type: 1, state: false, momeyCreditState: true, isOpening: true, payType: true },
      { type: 2, state: false, momeyCreditState: true, isOpening: true, payType: true }
    ], //当前支付方式状态  1:卡支付； 2:微信支付
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    goodId = options.goodId;
    wx.login({
      success: res_code => {
        this.setData({ code: res_code.code })
      }
    })
  },
  onShow() {
    ui.showLoadingMask();
    Promise.all([this.getMemberInfo(), this.getGoodInfo()])
    .then(()=>{
      this.checkOrder()
    })
  },
  //获取会员信息
  getMemberInfo() {
    let data = {
      memberId: Store.getItem('userData').id
    }
    return new Promise((resolve, reject) => {
      api.post('member/getMemberByMemberId', data).then(res => {
        if (res.msg.cellphone) {
          this.setData({ isShowJurisdiction: false })
        }
        else {
          this.setData({ isShowJurisdiction: true })
        }
        resolve()
      }).catch((err) => {
        reject()
      })
    })
  }, 
  //获取商品信息
  getGoodInfo: function (event) {
    const data = {
      goodId
    }
    return new Promise((resolve, reject) => {
      api.post('v2/good/getGoodInfo', data).then(res => {
        if (res.code === 0) {
          const goodInfo = res.msg
          this.setData({
            goodInfo
          })
        }
        resolve();
      }).catch((err) => {
        console.log(err)
        reject()
      })
    })

  },
  checkOrder: function () {
    wx.showLoading()
    const data = {
      goodId
    }
    api.post('v2/good/checkOrder', data).then(res => {
      const orderData = res.msg
      this.setData({
        orderData
      })
      wx.hideLoading()
      this.checkCardCredict()
    })
  },
  //校验当前余额状态
  checkCardCredict() {
    // 切换支付前，状态初始化
    let currentPayWayState = [
      { type: 1, state: false, momeyCreditState: true, isOpening: true, payType: true },
      { type: 2, state: false, momeyCreditState: true, isOpening: true, payType: true }
    ]
    //支付方式
    if (this.data.orderData.pay_type == '0') { // no
      currentPayWayState[1].state = false;
      currentPayWayState[0].state = false
    } else if (this.data.orderData.pay_type == '5') { //wx
      currentPayWayState[0].state = false;
      currentPayWayState[1].state = true;
      currentPayWayState[0].payType = false
    } else if (this.data.orderData.pay_type == '3') { //只能PLUS支付，例如排队等候的状态
      currentPayWayState[0].state = true;
      currentPayWayState[1].state = false;
      currentPayWayState[1].payType = false
    } else if (this.data.orderData.pay_type == '1') { //< !--PLUS余额不足，默认微信支付-- >
      currentPayWayState[0].state = false;
      currentPayWayState[1].state = true;
    } else if (this.data.orderData.pay_type == '2') { //<!--PLUS余额充足,PLUS支付-->
      currentPayWayState[0].state = true;
      currentPayWayState[1].state = false;
      currentPayWayState[1].payType = false
    }
    //是否开通
    if (this.data.orderData.has_card) {
      currentPayWayState[0].isOpening = true
    } else {
      currentPayWayState[0].isOpening = false
      currentPayWayState[1].state = true
    }
    //余额是否足够
    if (this.data.orderData.pay_amount && this.data.orderData.has_card) {
      if (this.data.orderData.pay_amount - 0 > this.data.orderData.card_amount || 0) {
        currentPayWayState[1].state = true;
        currentPayWayState[0].state = false
        currentPayWayState[0].momeyCreditState = false
      } else {
        currentPayWayState[0].state = true;
        currentPayWayState[0].momeyCreditState = true
      }
    } else { //未开通
      currentPayWayState[1].state = true
      currentPayWayState[0].state = false
    }
    this.setData({ currentPayWayState: currentPayWayState })
  },
  //充值
  jumpTocashMoney() {
    wx.navigateTo({
      url: `/pages/card/recharge`,
    })
  },
  //支付
  handlePayBtnTap (e) {   
    if (this.data.isShowJurisdiction) {  //授权电话
      let ency = e.detail.encryptedData;
      let iv = e.detail.iv;
      let errMsg = e.detail.errMsg
      if (iv == null || ency == null) {
        this.setData({ isShowJurisdiction: false })//如果拒绝，继续打开订单人口
        wx.showToast({
          title: "手机号授权失败！",
          icon: 'none',
        })
      } else {
        let data = {
          code: this.data.code,
          encryptedData: ency,
          iv: iv,
        }
        wx.showLoading({
          title: '授权中...',
          icon: 'none'
        })
        api.post('v2/member/liteMobile', data).then(res => {
          wx.hideLoading()
          this.getMemberInfo()
          console.log('后台电话解密授权', res)
          if (res.code == 0) {
            wx.showToast({
              title: res.msg || '授权成功！',
            })
          }
        })
      }
     }else{
      wx.showModal({
        title: '提示！',
        content: '是否确认支付？',
        success: res => {
          if (res.confirm) {
            let currentPayType = this.data.currentPayWayState.filter(val => {
              if (val.state) return val
            })
            this.createOrder().then((orderData) => {
              console.log(orderData)
              if (orderData.payType == 'card') {
                wx.showToast({ title: '支付成功', icon: 'none', mask: true })
                setTimeout(() => {
                  wx.redirectTo({
                    url: '/pages/order/paySuccessPersonal?goodId=' +goodId,
                  })
                }, 1000)
              }
              // 微信支付
              // console.log(currentPayType[0].type)
              if (orderData.payType == 'wx') {
                this.wxPayAction().then(res => {
                  wx.redirectTo({
                    url: '/pages/order/paySuccessPersonal?goodId=' +goodId,
                  })
                })
              }
            }, (data) => {
              wx.showToast({ title: data.msg || '生成失败', icon: 'none' })
            })
          }
        }
      })
    
    }
  },
  // 微信支付
  wxPayAction() {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        timeStamp: this.data.takeOrderCallBack.timeStamp,
        nonceStr: this.data.takeOrderCallBack.nonceStr,
        package: this.data.takeOrderCallBack.package,
        signType: this.data.takeOrderCallBack.signType,
        paySign: this.data.takeOrderCallBack.paySign,
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
  },
  // 创建订单
  createOrder() {
    return new Promise((resolve, reject) => {
      let data = {
        goodId,
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
          }, () => { resolve(res.msg) })
        } else {
          reject(res)
        }
      })

    })
  },
  //返回首页
  goBackHome() {
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
})