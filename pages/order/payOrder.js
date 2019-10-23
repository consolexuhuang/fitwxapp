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
    courseId: '',
    courseData: '',
    waitCount: 0,
    count: 1,
    couponId: '',
    firstCheck: true,
    timeCardId: '',
    orderData: '',
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
    marginTop: getApp().globalData.tab_height * 2 + 20,
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
    isPlus:0,//是否是充值用户
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    const courseId = options.courseId
    this.setData({
      courseId
    }) 
    wx.login({
      success: res_code => {
        this.setData({ code: res_code.code })
      }
    })
  },
  onShow() {
    ui.showLoadingMask();
    try {
      const orderConfig = wx.getStorageSync('orderConfig')
      if (orderConfig) {
        const count = JSON.parse(orderConfig).count
        const couponId = JSON.parse(orderConfig).couponId
        const firstCheck = JSON.parse(orderConfig).firstCheck
        const timeCardId = JSON.parse(orderConfig).timeCardId
        this.setData({
          count,
          couponId,
          firstCheck,
          timeCardId
        })
      }
      wx.removeStorageSync('orderConfig')
    } catch (e) {
      // Do something when catch error
    }
    //获取会员手机号（如果有手机号则支付不需要授权，否则需要授权手机号）
    // let userData = wx.getStorageSync('userData');
    // let memberMobile = userData ? userData.cellphone : '';
    // if (memberMobile) {
    //   this.setData({ isShowJurisdiction: false })
    // }
    // else {
    //   this.setData({ isShowJurisdiction: true })
    // }
    this.getCourse().then(() => {
      Promise.all([this.getMemberInfo(), this.getWaitCount(), this.checkOrder()]).then(() => {
        console.log('isPlus000')
        console.log(this.data.isPlus)
        ui.hideLoading()
      })
    })
    // Promise.all([this.getMemberInfo(), this.getCourse(), this.getWaitCount(), this.checkOrder()]).then(()=>{
    //   ui.hideLoading()
    // })
  },
  getCourse: function (event) {
    const courseId = this.data.courseId
    const data = {
      id: courseId,
      picType: 1
    }
      return new Promise((resolve,reject)=>{
        api.post('course/getCourse', data).then(res => {
          if (res.code === 0) {
            const courseData = res.msg
            this.setData({
              courseData
            })
          }
          resolve();
        }).catch((err)=>{
          console.log(err)
          reject()
        })
      }) 
    
  },
  getWaitCount: function (event) {
    const courseId = this.data.courseId
    const data = {
      courseId
    }
    return new Promise((resolve,reject)=>{
      api.post('payOrder/waitCount', data).then(res => {
        if (res.code === 0) {
          const waitCount = res.msg
          this.setData({
            waitCount
          })
        }
        resolve();
      }).catch((err) => {
        console.log(err)
        reject()
      })
    }) 
  },
  checkOrder: function (event) { // 第一次check的时候，不用提交timeCardId，用来判断是否有次卡，如果有自动选中
    const courseId = this.data.courseId
    const firstCheck = this.data.firstCheck
    const timeCardId = this.data.timeCardId
    const count = this.data.count
    const couponId = this.data.couponId || ''
    const data = {
      courseId,
      firstCheck
    }
    if (firstCheck) {
      data.count = 1
    } else if (timeCardId) {
      data.count = 1
      data.timeCardId = timeCardId
    } else {
      data.count = count
      data.couponId = couponId
    }
    return new Promise((resolve, reject)=>{
      api.post('v2/payOrder/checkOrder', data).then(res => {
        this.setData({ lineUpState: true })
        if (res.code === 0) {
          const orderData = res.msg
          const firstCheck = false
          const timeCardId = res.msg.time_card_id
          const disclaimer = res.msg.disclaimer
          const card_amount = res.msg.card_amount || 0;
          const isPlus = res.msg.card_amount? 1 : 0;
          this.setData({
            orderData,
            firstCheck,
            timeCardId,
            disclaimer,
            isPlus
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
  // 选择次卡
  handleTimeCardTap: function (evnet) {
    const timeCardList = this.data.orderData.time_card_list
    const count = this.data.count
    const couponId = this.data.couponId
    const firstCheck = this.data.firstCheck
    const timeCardId = this.data.timeCardId
    const courseId = this.data.courseId
    const orderTimeCard = JSON.stringify({
      timeCardList,
      count,
      couponId,
      firstCheck,
      timeCardId,
      courseId
    })
    try {
      wx.setStorageSync('orderTimeCard', orderTimeCard)
    } catch (e) { }
    wx.navigateTo({
      url: '/pages/order/orderTimeCard'
    })
  },
  handlePayModeTap: function (event) { // 支付模式切换
    ui.showLoadingMask();
    const timeCardId = event.currentTarget.dataset.timeCardId
    this.setData({
      timeCardId
    })
    this.checkOrder().then(()=>{
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
  // 选择优惠券
  handleCouponTap: function (event) {
    const couponList = this.data.orderData.coupon_list
    const count = this.data.count
    const couponId = this.data.couponId
    const firstCheck = this.data.firstCheck
    const timeCardId = this.data.timeCardId
    const courseId = this.data.courseId
    const orderCoupon = JSON.stringify({
      couponList,
      count,
      couponId,
      firstCheck,
      timeCardId,
      courseId
    })
    try {
      wx.setStorageSync('orderCoupon', orderCoupon)
    } catch (e) { }
    wx.navigateTo({
      url: '/pages/order/orderCoupon'
    })
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
    const courseId = this.data.courseId
    // const rechargeSuccessRoute = '/pages/order/payOrder?courseId=' + courseId
    // getApp().globalData.rechargeSuccessRoute = rechargeSuccessRoute
    wx.navigateTo({
      url: `/pages/card/recharge?isPlus=${this.data.isPlus}`
    })
  },

  wxPay: function (obj) {
    wx.requestPayment({
      timeStamp: obj.timeStamp,
      nonceStr: obj.nonceStr,
      package: obj.package,
      signType: obj.signType,
      paySign: obj.paySign,
      success(res) {
        const orderNum = obj.orderNum
        wx.redirectTo({
          url: '/pages/order/paySuccess?orderId=' + orderNum
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
  // submitFormId(e){
  //   console.log('formID-------', e.detail)
  // },
  getPhoneNumber(e) {//这个事件同样需要拿到
    console.log('formID-------', e.detail)
    let that = this
    const courseId = this.data.courseId
    const timeCardId = this.data.timeCardId
    const count = this.data.count
    const couponId = this.data.couponId || ''
    const payMode = 'wxlite'
    const data = {
      courseId,
      payMode
    }
    if (timeCardId) {
      data.count = 1
      data.timeCardId = timeCardId
    } else {
      data.count = count
      data.couponId = couponId
    }
    wx.showLoading({ title: '预约中...', })
    api.post('payOrder/takeOrder', data).then(res => {
      wx.hideLoading()
      console.log(res)
      if (res.code === 0) {
        const orderData = res.msg
        if (orderData.payType === 'wx') {
          if (this.data.isShowJurisdiction) {
            let ency = e.detail.encryptedData;
            let iv = e.detail.iv;
            let errMsg = e.detail.errMsg
            console.log(e.detail, getApp().globalData)
            if (iv == null || ency == null) {
              wx.showToast({
                title: "授权失败,请重新授权！",
                icon: 'none',
              })
              return false
            } else {
              let data = {
                code: this.data.code,
                encryptedData: ency,
                iv: iv,
              }
              api.post('v2/member/liteMobile', data).then(res => {
                this.getMemberInfo()
                console.log('后台电话解密授权', res)
              })
            }
          }
          this.wxPay(orderData)
        } else {
          const orderId = orderData.orderNum
          wx.redirectTo({
            url: '/pages/order/paySuccess?orderId=' + orderId,
            success: () => {
              if (this.data.isShowJurisdiction) {
                let ency = e.detail.encryptedData;
                let iv = e.detail.iv;
                let errMsg = e.detail.errMsg
                console.log(e.detail, getApp().globalData)
                if (iv == null || ency == null) {
                  wx.showToast({
                    title: "授权失败,请重新授权！",
                    icon: 'none',
                  })
                  return false
                } else {
                  let data = {
                    code: this.data.code,
                    encryptedData: ency,
                    iv: iv,
                  }
                  api.post('v2/member/liteMobile', data).then(res => {
                    this.getMemberInfo()
                    console.log('后台电话解密授权', res)
                  })
                }
              }
            }
          })
        }
        
      } else {
        wx.showToast({
          title: res.msg || '预约失败！',
          icon: 'none'
        })
      }
    })



    // //把获取手机号需要的参数取到，然后存到头部data里面
    // that.setData({
    //   ency: ency,
    //   iv: iv,
    //   errMsg: errMsg
    // })

    // that.zhuce();//调用手机号授权事件
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
    if (!this.data.lineUpState){
      this.checkOrder().then(() => {
        ui.hideLoading();
      })
    }
  },
  //返回首页
  goBackHome(){
    wx.switchTab({
      url: '/pages/course/course',
    })
  }
})