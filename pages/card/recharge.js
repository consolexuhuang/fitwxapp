// pages/card/recharge.js
const api = getApp().api
import NumberAnimate from "../../utils/NumberAnimate";
const ui = require('../../utils/ui.js');
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
    marginTopBar: getApp().globalData.header_bar_height,
    isPlus:0,//是否已经是plus,0:否 1：是
    active:0,//选择的充值项
    amount:0,
    btnDisabled:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //loading
    ui.showLoadingMask();
   
    getApp().checkSessionFun().then(() => {      
      Promise.all([this.getUserCard(), this.getChargeInfo()])
      .then(()=>{
        //按钮可点
        this.setData({
          btnDisabled:false
        })
        //关闭loading
        ui.hideLoading();
      })     
      
    })
  },
  onPullDownRefresh() {
    //loading
    ui.showLoadingMask();
    //按钮不可点
    this.setData({
      btnDisabled: true
    });
    Promise.all([this.getUserCard(), this.getChargeInfo()])
      .then(() => {
        //按钮可点
        this.setData({
          btnDisabled: false
        });
        //关闭loading
        ui.hideLoading();
        wx.stopPullDownRefresh()
      })
  },
  dealNumberStep() {
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

        } else {
          _this.setData({
            stepMomey: this.data.userCard.balance
          });
        }
      }
    })
  },
  getUserCard: function(event){    
    return api.post('card/getUserCard').then(res => {
      const userCard = res.msg
      this.setData({
        isPlus: userCard.balance>0?true:false,
        userCard
      })
      this.dealNumberStep()
    })
  },
  getChargeInfo: function(event){
    return api.post('chargeOrder/getChargeInfo').then(res => {
      const chargeInfo = res.msg
      this.setData({
        amount: chargeInfo.list[0].amount,
        chargeInfo
      })
    })    
  },
  handleRechargeTap: function(event){
    //当前点击状态
    const active = event.currentTarget.dataset.index;
    const amount = event.currentTarget.dataset.amount;
    this.setData({
      active,
      amount
    }); 
  },
  buyHandle:function(){
    //设置按钮为不可点
    this.setData({
      btnDisabled:true
    });
    const data = {
      amount:this.data.amount,
      payMode:'wxlite'
    }
    console.log('data')
    console.log(data)
    api.post('chargeOrder/recharge', data).then(res => {
      return this.wxPay(res.msg)
    }).then(()=>{
      //设置按钮为不可点
      this.setData({
        btnDisabled: false
      });
      this.getUserCard()
      wx.navigateBack()
    },()=>{
      //设置按钮为不可点
      this.setData({
        btnDisabled: false
      });
      wx.showToast({
        title: '支付失败',
        icon: 'none',
        duration: 2000
      })
    })
  },
  wxPay: function(obj){
    return new Promise((resolve,reject)=>{
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.paySign,
        success(res) {
          resolve()
         
        },
        fail(res) {
          reject()
        }
      })
    });
    
  }
})