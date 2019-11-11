// pages/subPackages_needLoad/tpExchange/tpExchange.js
const api = getApp().api;
const store = getApp().store;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    submitCodeCont:''
  },
  // 提交
  submitMethod(){
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
        wx.showToast({
          title: '提交成功！',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: res.msg || '提交失败！',
          icon: 'none'
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
  // 兑换
  submitCode(){
    getApp().checkSessionFun().then(() => {
      if (getApp().passIsLogin()) {
        this.submitMethod()
      }
    })
  }
})