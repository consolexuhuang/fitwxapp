// pages/coach/signInCode/signInCode.js
import Store from '../../../utils/store.js'
import utils from '../../../utils/util.js'
const api = getApp().api
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
    siginUpMsg:''
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
        this.setData({ siginUpData: res.msg, siginUpMsg: res.msg.result || '签到失败'})
        this.checkSignIn()
      } else {
        wx.showToast({
          title: res.msg.result || '签到失败',
          icon:'none'
        })
      }
    })
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
    this.checkSignIn()
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})