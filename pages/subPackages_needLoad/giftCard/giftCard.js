// pages/subPackages_gift/giftCard/giftCard.js
const api = getApp().api
const store = getApp().store;
// let count = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: '礼品卡',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    imgUrl: getApp().globalData.imgUrl,
    jurisdictionState: false,
    giftCardInfo:'',
    cardId:'',
    enterUserAdmin: 3, //当前进入用户身份 1-自己/赠送，2-收卡人，3-其他人

    // loveStarLocation: '',//爱心起始坐标
    // loveStarList:[],
  },
  // 获取会员卡详情
  getCardInfo(cardId) {
    let data = {
      cardId: cardId
    }
    api.post('card/getCardInfo', data).then(res => {
      console.log('卡信息2', res)
      wx.hideLoading()
      if (res.msg.gift_flag == 1){
        if (store.getItem('userData').id == res.msg.member_id){
          this.setData({ enterUserAdmin: 1 })
        } else if (!res.msg.gift_member_id && store.getItem('userData').id != res.msg.member_id){
          this.setData({ enterUserAdmin: 2 })
        }
      } else if (res.msg.gift_flag == 2){
        if (store.getItem('userData').id != res.msg.gift_member_id && store.getItem('userData').id != res.msg.member_id) {
          this.setData({ enterUserAdmin: 3 })
        } else if (store.getItem('userData').id == res.msg.gift_member_id) {
          this.setData({ enterUserAdmin: 1 })
        } else if (store.getItem('userData').id == res.msg.member_id) {
          this.setData({ enterUserAdmin: 2 })
        }
      }
      console.log('身份', this.data.enterUserAdmin)
      // res.msg.card_title = res.msg.card_title.slice(0,res.msg.card_title.indexOf('('))
      this.setData({
        giftCardInfo: res.msg,
      })
    })
  },
  getGiftCard(){
    let data = {
      cardId: this.data.cardId
    }
    wx.showLoading({
      title: '领取中...',
    })
    api.post('card/receiveCardGift', data).then(res => {
      console.log('收卡', res)
      if(res.code == 0 && res.msg === true){
        // wx.showToast({
        //   title: '领取成功！',
        // })
        this.getCardInfo(this.data.cardId)
      } else {
        wx.showToast({
          title: res.msg || '领取失败！',
          icon:'none'
        })
        this.getCardInfo(this.data.cardId)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.shareMemberId) {
      wx.setStorageSync('shareMemberId', options.shareMemberId)
    }

    if (options.cardId) {
      this.setData({ cardId: options.cardId})
    }

    if (!getApp().passIsLogin()) {
      this.setData({ jurisdictionState: true })
    }else{
      //检测登录
      getApp().checkSessionFun().then(() => {
        this.getCardInfo(options.cardId)
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
      this.getCardInfo(this.data.cardId)
      this.setData({ jurisdictionState: false })
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  // 收卡
  clickGiftCard() {
    this.getGiftCard()
  },
  // 留给自己
  sendMyslfe() {
    wx.redirectTo({
      url: '/pages/member/card/memberCard',
    })
  },
  // jumpToMycard(){
  //   wx.switchTab({
  //     url: '/pages/member/member',
  //   })
  // },
  // 约课
  jumpToCourse(){
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  // showLoveStar(e){
  //   clearTimeout()
  //   console.log(e)
  //   if (count <= 10) {
  //     let starObj = {
  //       id: count++,
  //       state: true,
  //       x: e.touches[0].clientX,
  //       y: e.touches[0].clientY
  //     }
  //     this.setData({
  //       loveStarList: [...this.data.loveStarList, starObj],
  //     })
  //     console.log(this.data.loveStarList)
  //   } else {
  //       setTimeout(() => {
  //         count = 0
  //         this.setData({
  //           loveStarList: [],
  //         })
  //       },1000)
  //     // let timer = setTimeout(() => {
  //     //   this.setData({
  //     //     ['loveStarList[' + count + '].state']: false
  //     //   })
  //     // }, 2000)
      
  //   }
  // },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    return {
      title: this.data.giftCardInfo.gift_memo,
      path: 'pages/subPackages_needLoad/giftCard/giftCard?cardId=' + this.data.cardId + '&shareMemberId=' + wx.getStorageSync('shareMemberId'),
      imageUrl: 'https://img.cdn.powerpower.net/5d77812ce4b08938d4b46c4e.jpg',
      success: function (res) {
        console.log('分享成功', res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  }
})