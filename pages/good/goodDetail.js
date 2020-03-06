// pages/good/goodDetail.js
const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    params: '',
    goodId: '',
    goodData: '',
    goodCoachs: [],
    shadeShow: false,
    navbarData: {
      title: '课程优惠包',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    
    paylock:false, //支付锁
    goodTypeId:0,
    orderData:'',
    currentPayWayState: [
         { type: 1, state: false, momeyCreditState: true, isOpening: true, payType: true },
         { type: 2, state: false, momeyCreditState: true, isOpening: true, payType: true }
    ], //当前支付方式状态  1:卡支付； 2:微信支付
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
    if (this.data.orderData.has_card){
      currentPayWayState[0].isOpening = true
    } else {
      currentPayWayState[0].isOpening = false
      currentPayWayState[1].state = true
    }
    //余额是否足够
    if (this.data.orderData.pay_amount && this.data.orderData.has_card) {
      if (this.data.orderData.pay_amount - 0 > this.data.orderData.card_amount || 0){
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
    this.setData({ currentPayWayState: currentPayWayState})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //分享
    wx.showShareMenu({
      withShareTicket: true
    })
    let goodId = options.goodId;
    this.setData({
      goodId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getGoodInfo()
  },

  /**
   * 自定义方法
   */
  getGoodInfo() {
    let form = {}
    let goodId = this.data.goodId
    form.goodId = goodId
    api.post('v2/good/getGoodInfo', form).then(ret => {
      this.setData({
        goodData: ret.msg
      })
      this.checkOrder(this.data.goodId)
    })
  },
  checkOrder: function (goodId) {
    wx.showLoading()
    const data = {
      goodId: goodId
    }
    api.post('v2/good/checkOrder', data).then(res => {
      const orderData = res.msg
      this.setData({
        orderData
      }, () => {
        wx.hideLoading()
        this.checkCardCredict()
        // console.log(this.data.currentPayWayState)
      })
    })
  },
  // 现在商品类型
  chooseGoodType(e){
    // console.log(e.currentTarget.dataset)
    let goodIdx = e.currentTarget.dataset.id
    if (this.data.goodTypeId != goodIdx){
      this.checkOrder(this.data.goodData.good_group_list[goodIdx].id)
    }
    this.setData({ 
      goodTypeId: goodIdx,
      goodId: this.data.goodData.good_group_list[goodIdx].id
    })
  },
  //充值
  jumpTocashMoney() {
    wx.navigateTo({
      url: `/pages/card/recharge`,
    })
  },
  // 创建订单
  createOrder() {
    this.setData({paylock: true})
    return new Promise((resolve, reject) => {
      let data = {
        goodId: this.data.goodData.good_group_list[this.data.goodTypeId].id,
        payMode: 'wxlite',
        count: 1,
      }
      wx.showLoading({ title: '加载中...', })
      api.post('v2/good/takeOrder', data).then(res => {
        // this.setData({ paylock: false })
        wx.hideLoading()
        console.log('生成订单', res)
        if (res.code === 0) {
          this.setData({
            takeOrderCallBack: res.msg
          }, () => { resolve(res.msg) })
        } else {
          reject(res)
          this.setData({ paylock: false })
        }
      })

    })
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
          this.setData({ paylock: false })
          reject()
        }
      })
    })
  },
  //支付
  handlePayBtnTap: function (event) {
    let _this = this
    if(!this.data.paylock){
      wx.showModal({
        title: '提示！',
        content: '是否确认支付？',
        success: res => {
          if(res.confirm){
            let currentPayType = _this.data.currentPayWayState.filter(val => {
              if (val.state) return val
            })
            _this.createOrder().then((orderData) => {
              console.log(orderData)
              if (orderData.payType == 'card') {
                wx.showToast({ title: '支付成功', icon: 'none', mask: true })
                setTimeout(() => {
                  wx.redirectTo({
                    url: '/pages/trainingCamp/trainingCampPaySuccess/trainingCampPaySuccess?goodId=' + _this.data.goodId,
                  })
                }, 1000)
              }
              // 微信支付
              // console.log(currentPayType[0].type)
              if (orderData.payType == 'wx') {
                _this.wxPayAction().then(res => {
                  wx.redirectTo({
                    url: '/pages/trainingCamp/trainingCampPaySuccess/trainingCampPaySuccess?goodId=' + _this.data.goodId,
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
})