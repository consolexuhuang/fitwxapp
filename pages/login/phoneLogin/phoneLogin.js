// pages/login/phoneLogin/phoneLogin.js
const api = getApp().api
import Store from '../../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    phoneNum:'',
    code:'',
    orderId:'',
    timeIsCount:false,//是否禁止
    isLinkPhone:false, //是否绑定成功
    navbarData: {
      title: '',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },
  // 启动验证码倒计时
  codeTimeStart(time){
    let timer
    this.setData({ timeIsCount : true })
    timer = setInterval(() => {
      this.setData({ currentCodeTime: `${--time}s`})
      if (time <= 0){
        this.setData({
          timeIsCount: false,
          currentCodeTime:''
        })
        clearInterval(timer)
      }
    },1000)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    if (options.orderNum) this.setData({ orderId: options.orderNum})
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  getPhoneNum_ios(e){
    let phoneNum = e.detail.value
    this.setData({
      phoneNum: phoneNum
    })
  },
  // 获取电话
  // getPhoneNum(e){
  //   let phoneNum = e.detail.value
  //   this.setData({
  //     phoneNum: phoneNum
  //   })
  // },
  getCodeNum_ios(e){
    let codeNum = e.detail.value
    this.setData({
      code: codeNum
    })
  },
  //获取code
  // getCodeNum(e){
  //   let codeNum = e.detail.value
  //   this.setData({
  //     code: codeNum
  //   })
  // },
  // 发送code
  sendCodeNum(){
    console.log(this.data.phoneNum)
    if (!this.data.timeIsCount){
      let data = {
        phone: this.data.phoneNum,
        memberId: Store.getItem('userData').id
      }
      api.post('sendMessage', data).then(res => {
        console.log('发送code回调', res, data)
        if (res.code == 0 && res.msg == 'SUCCESS'){
          wx.showToast({title: '发送成功！',icon:'none'})
          this.codeTimeStart(60)
        } else {
          wx.showToast({ title: '发送失败！', icon: 'none' })
        }
      })
    }
  },  
  //login
  phoneLogin(){
    if (!this.data.isLinkPhone){
      if (!this.data.code){
        wx.showToast({ title: '验证码不能为空！', icon: 'none' })
      } else {
          let data = {
            phone: this.data.phoneNum,
            code: this.data.code
          }
          api.post('verificationCode', data).then(res => {
            console.log('绑定电话回调', res, data)
            if (!res.msg){
              wx.showToast({ title: '绑定失败！', icon: 'none' })
            } else {
              wx.showToast({ title: '绑定成功！', icon: 'none' })
              this.setData({ isLinkPhone : true})
              setTimeout(()=>{
                wx.navigateBack()
              },1000)
            }
          }) 
      }
    }
  }
})