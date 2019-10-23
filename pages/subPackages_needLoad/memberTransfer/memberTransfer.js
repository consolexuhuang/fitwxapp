// pages/subPackages_needLoad/memberTransfer/memberTransfer.js
const api = getApp().api
const store = getApp().store;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // navbarData: {
    //   title: '',
    //   showCapsule: 0,
    //   isShowBackHome: false,
    //   titleColor: "#fff",
    //   tab_topBackground: 'rgba(0, 0, 0, 0)'
    // },
    jurisdictionState: false,
    memberInfo:'',
    channel:'', //会员涞源
    channelGiftConfig:''
  },
  //用户数据
  getMemberFollowState() {
    api.post('v2/member/memberInfo').then(res => {
      console.log('userData', res.msg)
      this.setData({
        memberInfo: res.msg
      })
      //存储用户信息
      wx.setStorageSync('userData', res.msg);
    })
  },
  //获取用户配置
  getMemberConfig(){
    let data = {
      channel: this.data.channel
    }
    api.post('v2/member/channelGiftConfig', data).then(res => {
      console.log('channelGiftConfig', res.msg)
      this.setData({ channelGiftConfig: res.msg})
    })
  },
  //转移会员
  memberTransfer(){
    let data = {
      channel: this.data.channel
    }
    wx.showLoading({ title: '绑定中...'})
    api.post('v2/member/receiveChannelGift',data).then(res => {
      console.log('receiveChannelGift', res.msg)
      wx.hideLoading()
      if(res.msg === true){
        wx.showToast({
          title:'绑定成功！',
          icon: 'none'
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/member/member',
          })
        },1000)
      } else {
        wx.showToast({
          title: res.msg || '绑定失败！',
          icon:'none'
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.stopPullDownRefresh()
    console.log(options.channel)
    if (options.channel){
      this.setData({
        channel: options.channel
      })
    }
    if (!getApp().passIsLogin()) {
      this.setData({ jurisdictionState: true })
    } else {
      //检测登录
      getApp().checkSessionFun().then(() => {
        this.getMemberFollowState()
        this.getMemberConfig()
      }, () => {
        this.setData({ jurisdictionState: true })
      })
    }
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.getMemberFollowState()
      this.getMemberConfig()
      this.setData({ jurisdictionState: false })
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  //确认绑定和授权
  getPhoneNumber(e){
    if (this.data.memberInfo && !this.data.memberInfo.cellphone){
      wx.login({
        success: res_code => {
          // this.setData({ code: res_code.code })
          let ency = e.detail.encryptedData;
          let iv = e.detail.iv;
          let errMsg = e.detail.errMsg
          console.log(e.detail)
          if (iv == null || ency == null) {
            wx.showToast({
              title: "授权失败,请重新授权！",
              icon: 'none',
            })
            return false
          } else {
            let data = {
              code: res_code.code,
              encryptedData: ency,
              iv: iv,
            }
            console.log(data)
            api.post('v2/member/liteMobile', data).then(res => {
              console.log('后台电话解密授权', res)
              this.memberTransfer()
            })
          }
        }
      })
    } else {
      this.memberTransfer()
    }
  }
})