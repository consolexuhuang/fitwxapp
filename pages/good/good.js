// pages/good/good.js
const app = getApp();
const api = app.api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodListData: [],
    navbarData: {
      title: '限时优惠',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height,
    jurisdictionSmallState: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  

    //检测登录
    app.checkSessionFun().then(() => {
    this.getGoodList()
    })
  },

  /**
   * 自定义函数
   */
  getGoodList() {
    api.post('v2/good/getGoodList').then(ret => {
      this.setData({
        goodListData: ret.msg
      })

    })
  },
  // 点击授权
  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.setData({
        jurisdictionSmallState: false,
      })
      this.getGoodList()
    })
  },
  goodView(event) {
    if (getApp().passIsLogin()) {
      let item = event.currentTarget.dataset.item;
      let goodId = item.id
      // let cardId = item._PK_
      if (item.type === 'COUPON') {
        wx.navigateTo({
          url: `/pages/good/goodDetail?goodId=${goodId}`
        })
      }
      else if (item.type === 'COURSE') {
        wx.navigateTo({
          url: `/pages/trainingCamp/trainingCamp/trainingCamp?goodId=${goodId}`
        })
      }
      else if (item.type === 'CARD') {
        console.log('9999')
        wx.navigateTo({
          url: `/pages/card/payCard?goodId=${goodId}`
        })
      }
    } else {
      this.setData({
        jurisdictionSmallState: true
      })
    }
    
  },
})