// pages/order/paySuccess.js
const app = getApp();
const api = app.api
const utils = require('../../utils/util.js')
import Store from '../../utils/store.js'
const store = app.store;
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
    coachWxCodeState: false,
    memberInfo:'', //用户数据
    courseShareData:'', //课程分享文案
    // 此页面 页面内容距最顶部的距离
    // contMargin_height: getApp().globalData.tab_height * 2 + 20,
    // officialData: '', //获取当前场景值对象
    // memberFollowState: 1, //当前关注状态
    // bottomStyle: 100,
    // officialDataState: false,

    // forcedEjection:false, //是否强制弹出
    // pageShowNoticeState:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options-paySusess', options)
    //分享过来的参数
    if (options.shareMemberId) {
      wx.setStorageSync('shareMemberId', options.shareMemberId)
    }
    if (options.orderId)
      this.setData({
        orderId: options.orderId
      }, () => {
        
        //检测登录
        app.checkSessionFun().then(() => {
          //this.checkPromotion()
          this.getOrderDetail()
          this.getMemberInfo(options.orderId)
          // this.getOfficialDataState()
          //this.getMemberFollowData()
        })

      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  // 订单详情
  getOrderDetail(){
    wx.showLoading({ title: '加载中...'})
    let data = {
      orderNum: this.data.orderId.toString(),
      checkPromotion:true
    }
    api.post('payOrder/orderInfo', data).then(res => {
      wx.hideLoading()
      let promotion = res.msg.promotion;
      let checkPromotion = '', paySuccessShow = false;
      if (Object.keys(promotion).length > 0) {
        checkPromotion = promotion;
        paySuccessShow = true
      }

      this.setData({
        orderDetailData: res.msg,
        checkPromotion: promotion,
        paySuccessShow: paySuccessShow
      })
      this.getCourseInfo(res.msg.course.id)
    })
  },
  /* getMemberFollowData() {
    api.post('v2/member/memberInfo').then(res => {
      this.setData({
        memberInfo: res.msg,
      })
      //存储用户信息
      wx.setStorageSync('userData', res.msg);
    })
  }, */
/*   checkPromotion(){
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
  }, */
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
  getCourseInfo(courseId) {
    const data = {
      id: courseId,
      picType: 1
    }
    api.post('course/getCourse', data).then(res => {
      if (res.code === 0) {
        const courseShareData = res.msg.config
        this.setData({
          courseShareData,
        })
      }
    })
  },
  onclose(){
    this.setData({ paySuccessShow: false, coachWxCodeState: false})
  },
  // 显示教练二维码
  showCoachWxCode(){
    app.compareVersionPromise('2.7.0').then((res) => {
      if (res == 0) {
        this.setData({ coachWxCodeState: true })
      }
    })
  },
  //查看地图
  handleLocationTap: function (event) {
    console.log(event)
    const name = event.currentTarget.dataset.name
    const address = event.currentTarget.dataset.address
    const latitude = Number(event.currentTarget.dataset.latitude)
    const longitude = Number(event.currentTarget.dataset.longitude)
    wx.openLocation({
      name,
      address,
      latitude,
      longitude,
      scale: 18
    })
  },
  // //预览图
  // showPrevICoachWxImg(e) {
  //   //需要http列表图片
  //   console.log(e)
  //   current: e.currentTarget.dataset.imgsrc
  //   wx.previewImage({
  //     urls: [e.currentTarget.dataset.imgsrc],
  //   })
  // },
  jumpToCourseBag(){
    wx.navigateTo({
      url: this.data.checkPromotion.url,
    })
  }, 
  jumpToRechange(){
    wx.navigateTo({
      url: '/pages/card/recharge',
    })
  },
  // 查看预约
  lookMyAppointment(){
    wx.switchTab({
      url: `/pages/member/order/memberOrder`,
    })
  },
  backHome(){
    wx.switchTab({
      url: `/pages/course/course`,
    })
  },
  //复制微信号
  pasteWx_code() {
    wx.setClipboardData({
      data: this.data.orderDetailData.coach.wxId || 'JJfitness',
      success: res => {
        wx.vibrateShort()
        wx.getClipboardData({
          success: res => {
            wx.showToast({
              title: `${this.data.orderDetailData.coach.coachName}教练微信号已复制成功`,
              icon: 'none'
            })
          }
        })
      }
    })
  },
  //分享
  onShareAppMessage() {
    return {
      title: this.data.courseShareData.title,
      path: '/pages/course/courseDetail?courseId=' + this.data.orderDetailData.course.id + '&shareMemberId=' + wx.getStorageSync('userData').id,
      imageUrl: this.data.courseShareData.img,
    }
  },
})