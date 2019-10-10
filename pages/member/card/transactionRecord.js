// pages/member/card/transactionRecord.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab
    active: 0, //默认显示第一个
    chargePage: 1,
    chargeRecord: '',
    chargeList: [],
    isChargeLower: true,
    consumePage: 1,
    consumeRecord: '',
    consumeList: [],
    isConsumeLower: true,
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '交易记录',
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
  onLoad: function(options) {
    this.getCardChargeList()
    this.getCardConsumeList()
  },
  // 获取充值记录
  getCardChargeList: function(evnet) {
    const chargePage = this.data.chargePage
    const data = {
      page: chargePage
    }
    api.post('card/getCardChargeList', data).then(res => {
      if (res.msg.charge_list.length < 10) {
        const isChargeLower = false
        this.setData({
          isChargeLower
        })
      }
      if (chargePage === 1) {
        const chargeRecord = res.msg
        this.setData({
          chargeRecord
        })
        const chargeList = res.msg.charge_list
        this.setData({
          chargeList
        })
      } else {
        let chargeList = this.data.chargeList
        res.msg.charge_list.forEach(function(item) {
          chargeList.push(item)
        }, this)
        this.setData({
          chargeList
        })
      }
    })
  },
  // 获取消费记录
  getCardConsumeList: function(evnet) {
    const consumePage = this.data.consumePage
    const data = {
      page: consumePage
    }
    api.post('card/getCardConsumeList', data).then(res => {
      if (res.msg.order_list.length < 10) {
        const isConsumeLower = false
        this.setData({
          isConsumeLower
        })
      }
      if (consumePage === 1) {
        const consumeRecord = res.msg
        this.setData({
          consumeRecord
        })
        const consumeList = res.msg.order_list
        this.setData({
          consumeList
        })
      } else {
        let consumeList = this.data.consumeList
        res.msg.order_list.forEach(function(item) {
          consumeList.push(item)
        }, this)
        this.setData({
          consumeList
        })
      }
    })
  },
  // TAB切换
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
  // 充值列表上拉加载
  chargeLower: function(event) {
    const isChargeLower = this.data.isChargeLower
    if (isChargeLower) {
      let chargePage = this.data.chargePage
      chargePage = chargePage + 1
      this.setData({
        chargePage
      })
      this.getCardChargeList()
    }
  },
  // 消费列表上拉加载
  consumeLower: function(event) {
    const isConsumeLower = this.data.isConsumeLower
    if (isConsumeLower) {
      let consumePage = this.data.consumePage
      consumePage = consumePage + 1
      this.setData({
        consumePage
      })
      this.getCardConsumeList()
    }
  },
  jumpToRecharge(){
    wx.redirectTo({
      url: '/pages/card/recharge?isPlus=0',
    })
  }
})