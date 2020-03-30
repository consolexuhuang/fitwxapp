// pages/member/good//goodDetail.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    orderId:'',
    orderData:'',
    navbarData: {
      title: '商品订单详情',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height
  },
  
  //商品数据
  getOrderInfo(){
    wx.showLoading({ title: '加载中...'})
    let data = {
      orderId: this.data.orderId
    }
    // console.log(data)
    api.post('v2/good/getOrderInfo', data).then(res => {
      wx.hideLoading()
      console.log('订单数据', res)
      if (res.code == 0) {
        this.setData({ 
          orderData : res.msg,
          ['orderData.store_ids__NAME']: res.msg.store_ids__NAME.replace(/,/g, '<br>')
        })
      }
      else wx.showToast({ title: res.msg || '订单获取失败',})
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId}, ()=> {
        this.getOrderInfo()
      })
    }
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