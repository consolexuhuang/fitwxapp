// pages/card/recharge.js
const api = getApp().api
import NumberAnimate from "../../utils/NumberAnimate";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userCard: '',
    chargeInfo: '',
    rechargeSuccessRoute: '',
    imgUrl: getApp().globalData.imgUrl,
    stepMomey:'',
    navbarData: {
      title: '充值',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },
  dealNumberStep(){
    let _this = this
    let stepMomey = this.data.userCard.balance
    wx.getSystemInfo({
      success: res => {
        if (res.platform == "ios" || res.platform == "devtools") {
          let numberAnimate = new NumberAnimate({
            from: stepMomey,//开始时的数字
            speed: 800,// 总时间
            refreshTime: 45,//  刷新一次的时间
            decimals: 1,//小数点后的位数
            onUpdate: () => {//更新回调函数
              _this.setData({
                stepMomey: numberAnimate.tempValue
              });
            },
          });
          
        }else{
          _this.setData({
            stepMomey: this.data.userCard.balance
          });
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().checkSessionFun().then(() => {
      this.getUserCard()
      this.getChargeInfo()
    })
  },
  getUserCard: function(event){
    wx.showLoading({ title: '加载中...',})
    api.post('card/getUserCard').then(res => {
      wx.hideLoading()
      const userCard = res.msg
      this.setData({
        userCard
      })
      this.dealNumberStep()
    })
  },
  getChargeInfo: function(event){
    api.post('chargeOrder/getChargeInfo').then(res => {
      const chargeInfo = res.msg
      this.setData({
        chargeInfo
      })
    })    
  },
  handleRechargeTap: function(event){
    const amount = event.currentTarget.dataset.amount
    const payMode = 'wxlite'
    const data = {
      amount,
      payMode
    }
    api.post('chargeOrder/recharge', data).then(res => {
      this.wxPay(res.msg)
    })
  },
  wxPay: function(obj){
    const _this = this
    wx.requestPayment({
      timeStamp: obj.timeStamp,
      nonceStr: obj.nonceStr,
      package: obj.package,
      signType: obj.signType,
      paySign: obj.paySign,
      success(res) {
        _this.getUserCard()
        // const rechargeSuccessRoute = _this.data.rechargeSuccessRoute
        // wx.redirectTo({
        //   url: rechargeSuccessRoute
        // })
        wx.navigateBack()
      },
      fail(res) {
        wx.showToast({
          title: '支付失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})