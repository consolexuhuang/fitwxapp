// pages/coach/signInCode/signInCode.js
import Store from '../../../utils/store.js'
import utils from '../../../utils/util.js'
const app = getApp();
const api = app.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    navbarData:{
      title:'会员签到',
      showCapsule:1,
      isShowBackHome:true,
      titleColor:"#fff"
    },
    signData:'' ,//签到信息
    siginUpData:'',//签到
    siginUpMsg:'',
    coachWxCodeState: false,
  },
  //签到信息
  checkSignIn(){
    api.post('v2/payOrder/checkRecent').then(res => {
      console.log('签到校验',res)
      if(res.msg){
        this.setData({ signData : res.msg})
      }
    })
  },
  //签到
  siginUp(data){
    wx.showLoading({ title: '加载中...' })
    api.post('sign/signUp', data).then(res => {
      wx.hideLoading()
      console.log('签到', res)
      if (res.msg.success) {
        this.setData({ siginUpData: res.msg, siginUpMsg : '签到成功'})
        this.checkSignIn()
      } else {
        this.setData({ siginUpMsg: (res.msg.result == '您已经签到过了' ? '已签到' : '签到失败') || '签到失败' })
        wx.showToast({
          title: res.msg.result || '签到失败',
          icon:'none'
        })
      }
    })
  },
  // 显示教练二维码
  showCoachWxCode() {
    app.compareVersionPromise('2.7.0').then((res)=>{
      if(res==0){
        this.setData({ coachWxCodeState: true })
      }
    })    
  },
  onclose() {
    this.setData({ coachWxCodeState: false })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.q){
      let q = decodeURIComponent(options.q)
      console.log('options_code2', options, utils.getQueryString(q, 'courseId'))
      let data = {
        courseId: utils.getQueryString(q, 'courseId')
      }
      this.siginUp(data)
    }

    //检测登录
    app.checkSessionFun().then(() => {
    this.checkSignIn()
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
})