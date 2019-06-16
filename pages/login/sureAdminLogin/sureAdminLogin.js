// pages/login/sureAdminLogin/sureAdminLogin.js
import Store from '../../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    linkPublicData : '',
    navbarData: {
      title: '',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    Store.getItem('userIsLinkPublic')
      ? this.setData({ linkPublicData: Store.getItem('userIsLinkPublic')})
      : ''
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //确认该账号登陆
  userAdminLogin(){
    getApp().wx_loginIn().then(res => {
      wx.switchTab({
        url: '../../member/member',
      })
      Store.clear('userIsLinkPublic')
    })
  },
})