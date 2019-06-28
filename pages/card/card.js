// pages/card/card.js
const app = getApp();
const api = app.api;
const store = app.store;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardDefList: '',
    //滑动当前index
    swiperCurrentIndex: 0,
    //滑块数量
    swiperItemsTotal: 3,
    //是否显示特权弹层
    isShowPrivilege: false,
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '卡包',
      showCapsule: 0,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground:'#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    officialData: '', //获取当前场景值对象
    officialDataState: true, //关注通知显示
    showNoticeState: false, //关注弹窗显示
    memberFollowState: 1, //当前关注状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //检测登录
    app.checkSessionFun().then(() => {
    // sub_flag 1:关注 0:未关注
    if (store.getItem('userData') && store.getItem('userData').sub_flag === 0) {
      this.setData({ officialDataState: true })
    } else if (store.getItem('userData') && store.getItem('userData').sub_flag === 1) {
      this.setData({ officialDataState: false })
    }
    this.getCardDefList()
    })
  },
  onShow(){
    this.getMemberFollowState()
  },
  /**
   * write@xuhuang  start
   */
  // 获取当前用户关注状态
  getMemberFollowState() {
    api.post('v2/member/memberInfo').then(res => {
      console.log('getMemberFollowState', res)
      this.setData({ memberFollowState: res.msg.sub_flag })
    })
  },
  bindload(e) {
    console.log('official-account_success', e.detail)
    this.setData({ officialData: e.detail })
  },
  binderror(e) {
    console.log('official-account_fail', e.detail)
    this.setData({ officialData: e.detail })
  },
  //关闭通知
  closeguideLogin() {
    this.setData({ officialDataState: false })
  },
  //显示关注弹窗
  showNotice() {
    this.setData({ showNoticeState: true })
  },
  //关闭关注弹窗
  onclose() {
    this.setData({ showNoticeState: false })
  },
  //客服事件
  handleContact(e) {
    this.setData({ showNoticeState: false })
  },
  /**
   * write@xuhuang  end
   */
  getCardDefList: function(event) {
    wx.showLoading({ title: '加载中...'})
    api.post('card/getCardDefList').then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      const cardDefList = res.msg
      this.setData({
        cardDefList
      })
    })
  },
  handleRechargeTap: function(event) {
    wx.navigateTo({
      url: '/pages/card/recharge',
    })
  },
  //次卡类型列表页
  handleCardMoreTap: function(event) {
    const cardType = event.currentTarget.dataset.cardType
    wx.navigateTo({
      url: '/pages/card/cardList?cardType=' + cardType,
    })
  },
  handleCardTap: function(event) {
    const cardId = event.currentTarget.dataset.cardId
    wx.navigateTo({
      url: '/pages/card/payCard?cardId=' + cardId,
    })
  },
  //自动滑动改变函数
  swiperchange: function(event) {
    let currentIndex = event.detail.current
    this.setCurrentIndex(currentIndex)
  },
  //点击上一个
  swiperPre: function() {
    let currentIndex = this.data.swiperCurrentIndex;
    if (currentIndex <= 0) {
      this.setCurrentIndex(this.data.swiperItemsTotal - 1)
    } else {
      this.setCurrentIndex(currentIndex - 1)
    }
  },
  //点击下一个
  swiperNext: function() {
    let currentIndex = this.data.swiperCurrentIndex;
    if (currentIndex >= this.data.swiperItemsTotal - 1) {
      this.setCurrentIndex(0)
    } else {
      this.setCurrentIndex(currentIndex + 1)
    }
  },
  //设置当前滚动index
  setCurrentIndex: function(index) {
    this.setData({
      swiperCurrentIndex: index
    })
  },
  //显示特权弹层
  privilegeView: function() {
    this.setData({
      isShowPrivilege: true
    })
  },
  //关闭特权弹层
  closePrivilege: function() {
    this.setData({
      isShowPrivilege: false
    })
  },
  // 下拉刷新
  onPullDownRefresh(){
    this.getCardDefList()
  }
})