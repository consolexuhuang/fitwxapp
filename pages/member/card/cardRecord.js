// pages/member/card/cardRecord.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //tab
    active: 0, // 默认显示第一个
    cardId: '',
    cardBuyRecord: '',
    cardRecordPage: 1,
    cardRecordList: [],
    isCardRecordLower: true, // 是否可以上拉加载更多
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '购卡记录',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const cardId = options.cardId
    this.setData({
      cardId
    })
    this.getCardBuyRecord()
    this.getCardRecordList()
  },
  // 获取购卡记录
  getCardBuyRecord: function(evnet) {
    const cardId = this.data.cardId
    const data = {
      cardId
    }
    api.post('card/getCardBuyRecord', data).then(res => {
      const cardBuyRecord = res.msg
      this.setData({
        cardBuyRecord
      })
    })
  },
  // 获取消卡记录
  getCardRecordList: function(event){
    const cardId = this.data.cardId
    const cardRecordPage = this.data.cardRecordPage
    const data = {
      cardId,
      page: cardRecordPage
    }
    api.post('card/getCardRecordList', data).then(res => {
      const cardRecordPage = this.data.cardRecordPage
      if (res.msg.length < 10) {
        const isCardRecordLower = false
        this.setData({
          isCardRecordLower
        })
      }
      if (cardRecordPage === 1) {
        const cardRecordList = res.msg
        this.setData({
          cardRecordList
        })
      } else {
        let cardRecordList = this.data.cardRecordList
        res.msg.forEach(function(item) {
          cardRecordList.push(item)
        }, this)
        this.setData({
          cardRecordList
        })
      }

    })
  },
  //TAB切换
  handleTabTap: function(event) {
    const active = event.currentTarget.dataset.active
    this.setData({
      active
    })
  },
  currentChange: function(event) {
    const active = event.detail.current
    this.setData({
      active
    })
  },
  cardRecordLower: function(event){
    const isCardRecordLower = this.data.isCardRecordLower
    if (isCardRecordLower) {
      let cardRecordPage = this.data.cardRecordPage
      cardRecordPage = cardRecordPage + 1
      this.setData({
        cardRecordPage
      })
      this.getCardRecordList()
    }
  }
})