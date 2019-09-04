// pages/subPackages_needLoad/refundCardServer/refundCardServer.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: 'J&J永远等您回来！',
      showCapsule: 0,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    imgUrl: getApp().globalData.imgUrl,
    jurisdictionState: false,

    currentCardNum:'',
    currentRemark:'',
    getRefundConfig:'', //退卡信息
    joinReasonData:'1', //当前选择加入原因
    cardRefundReasonData:[],//当前选择退卡原因
    value_1: 5,
    value_2: 5,
    value_3: 5,
    value_4: 5,
  },
  // 获取退款数据
  getRefundData(){
    wx.showLoading({ title: '加载中...'})
    api.post('card/getRefundConfig').then(res => {
      wx.hideLoading()
      console.log('退款配置', res)
      this.setData({ 
        getRefundConfig : res.msg,
        currentCardNum: res.msg.card_no || ''
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!getApp().passIsLogin()) {
      this.setData({ jurisdictionState: true })
    } else {
      getApp().checkSessionFun().then(() => {
        this.getRefundData()
      }, () => {
        this.setData({ jurisdictionState: true })
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.stopPullDownRefresh()
  },
  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.getRefundData()
      this.setData({ jurisdictionState: false })
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  // 加入原因
  joinReason(e){
    console.log(e.currentTarget.dataset.index)
    this.setData({
      joinReasonData: e.currentTarget.dataset.index
    })
  },
  // 退卡原因
  cardRefundReason(e) {
    // console.log(e.currentTarget.dataset.index)
    if (this.data.cardRefundReasonData.indexOf(e.currentTarget.dataset.index) === -1){
      this.setData({
        cardRefundReasonData: [...this.data.cardRefundReasonData, e.currentTarget.dataset.index]
      })
    } else {
      this.data.cardRefundReasonData.splice(this.data.cardRefundReasonData.indexOf(e.currentTarget.dataset.index) ,1)
      this.setData({
        cardRefundReasonData: this.data.cardRefundReasonData
      })
    }
    console.log(this.data.cardRefundReasonData)
  },
  onChange_1(event) {
    this.setData({
      value_1: event.detail
    });
    console.log(this.data.value_1)
  },
  onChange_2(event) {
    this.setData({
      value_2: event.detail
    });
  },
  onChange_3(event) {
    this.setData({
      value_3: event.detail
    });
  },
  onChange_4(event) {
    this.setData({
      value_4: event.detail
    });
  },
  bindinputCard(e){
    this.setData({
      currentCardNum: e.detail.value
    })
  },
  bindinputRemark(e){
    this.setData({
      currentRemark: e.detail.value
    })
  },
  jumpMemberCard(){
    getApp().globalData.share = false
    wx.navigateTo({
      url: "/pages/member/card/memberCard",
    })
  },
  refundApply(){
    if (!this.data.currentCardNum){
      wx.showToast({
        title: '请填写正确的卡号！',
        icon:'none'
      })
      return
    } else if (!this.data.cardRefundReasonData.sort().join()){
      wx.showToast({
        title: '您退卡的主要原因是？',
        icon: 'none'
      })
      return
    } else {
      let data = {
        card_no: this.data.currentCardNum,
        join_reason: this.data.joinReasonData,
        left_reason: this.data.cardRefundReasonData.sort().join(),
        course_star: this.data.value_1,
        coach_star: this.data.value_2,
        place_star: this.data.value_3,
        service_star: this.data.value_4,
        remark: this.data.currentRemark
      }
      console.log('提交数据', data)
      wx.showLoading({ title: '提交中...',})
      api.post('card/refundApply', data).then(res => {
        wx.hideLoading()
        console.log('提交回调', res)
        if(res.msg == true){
          wx.showToast({
            title: '提交成功!',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/card/card',
            })
          },1000)
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    }

  }
})