// pages/subPackages_needLoad/tpExchange/tpExchange.js
const api = getApp().api;
const store = getApp().store;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:'',
    userData:'',
    submitCodeCont:''
  },
  // 获取当前用信息
  getMemberFollowState() {
    api.post('v2/member/memberInfo').then(res => {
      console.log('memberInfo')
      console.log(res)
      this.setData({
        userData: res.msg
      })
      //存储用户信息
      store.setItem('userData', res.msg);
    })
  },
  // 提交
  submitMethod(){
    if (this.data.submitCodeCont){
      let data = {
        exchangeCode: this.data.submitCodeCont
      }
      wx.showLoading({
        title: '提交中...',
      })
      api.post('admin/extend/submitExchangeCode', data).then(res => {
        wx.hideLoading()
        console.log('提交',res)
        if(res.code == 0 && res.msg){
          wx.showModal({
            title: '提交成功',
            content: '请留意公众号消息，我们将于48小时内通知您兑换结果。',
            showCancel: false
          })
          this.setData({ submitCodeCont: ''})
        } else {
          wx.showToast({
            title: res.msg || '提交失败！',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '兑换码不能为空！',
        icon: 'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().checkSessionFun().then(() => {
      wx.login({
        success: res_code => {
          this.setData({ 
            code: res_code.code,
            userData: store.getItem('userData')
          })
        }
      })
    })
  },
  onReady(){
    wx.stopPullDownRefresh()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  bindinput(e){
    console.log('表单',e.detail)
    this.setData({ submitCodeCont : e.detail.value})
  },
  // 授权电话
  // 兑换
  submitCode(e){
    if (getApp().passIsLogin()) {
      console.log('------', store.getItem('userData').cellphone)
      if (store.getItem('userData').cellphone) {
        this.submitMethod()
      } else {
        let ency = e.detail.encryptedData;
        let iv = e.detail.iv;
        let errMsg = e.detail.errMsg
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
            liteType: 'main'
          }
          api.post('v2/member/liteMobile', data).then(res => {
            console.log('后台电话解密授权', res)
            if(res.code === 0 && res.msg){
              wx.showToast({
                title: '授权成功！',
                icon:'none'
              })
              this.getMemberFollowState()
            }
            // this.submitMethod()
          })
        }
      }
    }
  }
})