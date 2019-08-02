// pages/subPackages_needLoad/editorCard/editorCard.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: '留下祝福',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    imgUrl: getApp().globalData.imgUrl,
    cardId:'',
    sendMessage:'',  //封面列表
    giftCardInfo:'', //卡信息
    optional_imgList:'',
    currentIndex:0, //当前封面类型
    placeholderText:''
  },
  // 获取会员卡详情
  getCardInfo(cardId){
    let data = {
      cardId: cardId
    }
    api.post('card/getCardInfo',data).then(res => {
      console.log('卡信息', res, res.msg.optional_img.split(','))
      this.setData({
        giftCardInfo: res.msg,
        optional_imgList: res.msg.optional_img.split(',')
      })
    })
  },
  //更新赠送信息
  upDataGiveInfo(){
    let data = {
      cardId: this.data.cardId,
      giftImg: this.data.optional_imgList[this.data.currentIndex],
      giftMemo: this.data.sendMessage || '',
    }
    api.post('card/updateCardGiftInfo', data).then(res => {
      console.log('更新赠送信息', res)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.cardId) {
      this.setData({ 
        cardId: options.cardId,
        placeholderText: '用心写下对她想说的话吧！(50字以内)'
      })
      this.getCardInfo(options.cardId)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //选择封面
  chooseCard(e){
    // console.log(e)
    this.setData({ 
      currentIndex: e.currentTarget.dataset.index ,
      placeholderText: e.currentTarget.dataset.index == 0
                          ? "用心写下对她想说的话吧！(50字以内)"
        : (e.currentTarget.dataset.index == 1 ? "一声姐妹大过天，闺蜜也有真感情！(50字以内)" : (e.currentTarget.dataset.index == 2 ? "想对单身的TA说些什么呢？(50字以内)" : "七夕祝福语，(50字以内)"))
    })
  },
  bindinput(e){
    console.log(e.detail)
    this.setData({ sendMessage: e.detail.value})
  },
  // 留给自己
  sendMyslfe(){
    wx.redirectTo({
      url: '/pages/member/card/memberCard',
    })
  },
  //banner
  // bindchangeBanner(e) {
  //   console.log(e.detail.current)
  //   this.setData({
  //     current_banner: e.detail.current
  //   })
  // },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    this.upDataGiveInfo()
    return {
      title: this.data.sendMessage || `七夕节快乐！送你一张健身卡，快来试试吧！`,
      path: 'pages/subPackages_gift/giftCard/giftCard?cardId=' + this.data.cardId,
      imageUrl: this.data.optional_imgList[this.data.currentIndex],
    }
    // wx.showModal({
    //   title: '温馨提示',
    //   content: '请确认赠送朋友身份，七夕卡赠出并被领取后不可退回。',
    //   success: res => {
    //     if (res.confirm) {
          
    //     }
    //   }
    // })
  }
})