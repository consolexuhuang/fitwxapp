// pages/order/paySuccess.js
const api = getApp().api
const utils = require('../../utils/util.js')
import Store from '../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    orderDetailData:'', //订单详情
    orderId:'',
    checkPromotion:'',
    nvabarData:{
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '', //导航栏 中间的标题
      isShowBackHome:true, //是否显示home
      titleColor: '#fff',
      tab_topBackground:''
    },
    paySuccessShow: false,
    coachWxCodeState: false
    // 此页面 页面内容距最顶部的距离
    // contMargin_height: getApp().globalData.tab_height * 2 + 20,
  },
  
  // 订单详情
  getOrderDetail(){
    wx.showLoading({ title: '加载中...'})
    let data = {
      orderNum: this.data.orderId.toString()
    }
    api.post('payOrder/orderInfo', data).then(res => {
      wx.hideLoading()
      console.log('订单详情', res)
      // res.msg.course.beginDate = utils.formatTime2(res.msg.course.beginDate)
      // res.msg.course.beginTime = utils.formatTime3(res.msg.course.beginTime * 1000)
      // res.msg.course.endTime = utils.formatTime3(res.msg.course.endTime * 1000)
      this.setData({
        orderDetailData: res.msg
      })
    })
  },
  checkPromotion(){
    let data = {
      location: 'paySuccess'
    }
    api.post('v2/member/checkPromotion', data).then(res => {
      console.log('checkPromotion',res)
      if (Object.keys(res.msg).length > 0) {
        this.setData({ 
          checkPromotion: res.msg, 
          paySuccessShow : true
        })
      }
      else this.setData({ paySuccessShow : false})
    })
  },
  getMemberInfo(orderId){
    let data = {
      memberId: Store.getItem('userData').id
    }
    api.post('member/getMemberByMemberId', data).then(res => {
      console.log('getMemberInfo', res)
      this.setData({memberInfo : res.msg},()=>{
        // if (!this.data.memberInfo.cellphone) {
        //   wx.navigateTo({
        //     url: `/pages/login/phoneLogin/phoneLogin?orderNum=${orderId}`,
        //   })
        // }
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.checkPromotion()
    if (options.orderId) 
      this.setData({ orderId: options.orderId },()=>{
        this.getOrderDetail()
        this.getMemberInfo(options.orderId)
      })
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
  //邀请好友
  // jumpInvite(){
  //   wx.navigateTo({
  //     url: `/pages/invite/invite`,
  //   })
  // },
  onclose(){
    this.setData({ paySuccessShow: false, coachWxCodeState: false})
  },
  // 显示教练二维码
  showCoachWxCode(){
    console.log('cc')
    this.setData({coachWxCodeState : true})
  },
  //预览图
  showPrevICoachWxImg(e) {
    //需要http列表图片
    console.log(e)
    current: e.currentTarget.dataset.imgsrc
    wx.previewImage({
      urls: [e.currentTarget.dataset.imgsrc],
    })
  },
  jumpToCourseBag(){
    wx.navigateTo({
      url: '/pages/good' + this.data.checkPromotion.url,
    })
  }, 
  jumpToRechange(){
    wx.navigateTo({
      url: '/pages/card/recharge',
    })
  },
  //分享
  onShareAppMessage() {
    console.log(this.data.orderDetailData.course.beginDate)
    return {
      title: `【 ${this.data.orderDetailData.course.courseName} 】${this.data.orderDetailData.course.beginDate}星期${this.data.orderDetailData.course.beginDay}${this.data.orderDetailData.course.beginTime}，快和我一起来运动
`,
      path: '/pages/member/order/orderDetail?orderNum=' + this.data.orderId,
      // imageUrl: this.data.picList[0],
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
})