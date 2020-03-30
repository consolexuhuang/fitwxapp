// pages/member/order/cancelOrder.js
const api = getApp().api;
const utils = require('../../../utils/util.js')
/* //测试用的
*/
import Store from '../../../utils/store.js' 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    dialogConfig: {
      cancleBl: false,
      dialogTitle: '',
      dialogCont: '此订单取消不支持退款',
      dialogContColor:'#896FFF',
      dialogComfirmBtn: '我知道了',
      dialogCancleBtn: '',
      dialogImg: 'member/icon-top-blue.png'
    },
    orderNum: '',
    orderData: '',
    warningShadeStatus: true,
    navbarData: {
      title: '取消订单',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#fff",
      tab_topBackground: '#826AFE'
    },
    marginTopBar: getApp().globalData.header_bar_height
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /* //测试用的
    Store.setItem('userData', { token: '272381799446478cbfc537108dad3af8' }) */
    const orderNum = options.orderNum
    this.setData({
      orderNum
    });    
    this.getOrderInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获取屏幕的宽度
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    //shape
    const ctx = wx.createCanvasContext('shape-bg');
    //矩形
    ctx.rect(0, 0, windowWidth, 25);
    ctx.setFillStyle('#826AFE')
    ctx.fill()
    //弧线
    ctx.beginPath()
    ctx.moveTo(0, 25)
    ctx.bezierCurveTo(50, 100, windowWidth - 50, 100, windowWidth, 25);
    ctx.setFillStyle('#826AFE')
    ctx.fill()
    ctx.draw();
  },

  /* 自定义函数 */
  // 订单详情
  getOrderInfo() {
    let form = {}
    form.orderNum = this.data.orderNum
    api.post('payOrder/orderInfo', form).then(ret => {
        this.setData({
          orderData: ret.msg
        })
    })
  },
  //取消订单
  refund() {
    let form = {}
    form.orderNum = this.data.orderNum
    api.post('refundOrder/refund', form).then(ret => {
        this.toast(ret.msg)
        // 跳转到订单详情
        setTimeout(() => {
          // wx.redirectTo({
          //   url: `/pages/member/order/orderDetail?orderNum=${this.data.orderNum}`,
          // })
          wx.navigateBack()
        }, 1000)      
    })
  },
  warningShadeChange() {
    // console.log(this.data.warningShadeStatus)
    this.setData({ warningShadeStatus : false})
  },
  toast(title) {
    wx.showToast({
      title: title,
      icon:'none',
      duration: 3000
    });
  }

})