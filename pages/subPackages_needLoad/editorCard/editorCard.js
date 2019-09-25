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
    tipsState: false, //提示
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
        textValue:res.msg.gift_memo || '',
        optional_imgList: res.msg.optional_img.split(',')
      })
    })
  },
  //更新赠送信息
  upDataGiveInfo(){
    let data = {
      cardId: this.data.cardId,
      giftImg: this.data.optional_imgList[this.data.currentIndex],
      giftMemo: this.data.sendMessage || this.data.giftCardInfo.gift_memo
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
  sendFriend(){
    this.setData({ tipsState: true })
  },
  
  closeNone(){
    this.setData({ tipsState: false, textValue: this.data.sendMessage})
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    this.upDataGiveInfo()
    this.setData({ tipsState: false, textValue: this.data.sendMessage })
    return {
      title: this.data.sendMessage || this.data.giftCardInfo.gift_memo,
      path: 'pages/subPackages_needLoad/giftCard/giftCard?cardId=' + this.data.cardId + '&shareMemberId=' + wx.getStorageSync('shareMemberId'),
      imageUrl: 'https://img.cdn.powerpower.net/5d77812ce4b08938d4b46c4e.jpg',
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