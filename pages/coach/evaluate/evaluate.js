// pages/coach/evaluate/evaluate.js
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '',
      showCapsule: 1,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    evaluateShow:false, //评价完成弹窗
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    evaluateData:'', //课程教练评价信息，
    remark:'', //评价内容
    textAreaIsStop:false, //是否禁用
    coachStarList:[
      { id: 1, chooseState: true, idCont:'不好' },
      { id: 2, chooseState: true, idCont: '一般' },
      { id: 3, chooseState: true, idCont: '良好' },
      { id: 4, chooseState: true, idCont: '优秀' },
      { id: 5, chooseState: true, idCont: '完美' },
    ],
    coachCurrentStar:5,
    comprehensiveStarList: [
      { id: 1, chooseState: true, idCont: '不好' },
      { id: 2, chooseState: true, idCont: '一般' },
      { id: 3, chooseState: true, idCont: '良好' },
      { id: 4, chooseState: true, idCont: '优秀' },
      { id: 5, chooseState: true, idCont: '完美' },
    ],
    comprehensivehCurrentStar:5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (true) {
      // this.setData({ orderNum: options.orderNum})
      let data = {
        orderNum: options.orderNum || '',
      }
      wx.showLoading({ title: '加载中...'})
      api.post('v2/payOrder/getSignStar', data).then(res => {
        wx.hideLoading()
        console.log('获取签到和评价信息', res)
        this.setData({ evaluateData : res.msg})
      })
    }
    this.setData({
      coachCurrentStar:5,
      comprehensivehCurrentStar: 5
    })
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 获取评价内容
  bindinput(e){
    this.setData({
      remark: e.detail.value
    })
    // console.log(e.detail.value)
  },
  // 点击教练小星星
  clickStar(e){
    let currentIdx = e.currentTarget.dataset.id
    let currentState = e.currentTarget.dataset.state
    // console.log(`${currentIdx}星${this.data.coachStarList[currentIdx-1].idCont}评价`, currentState)
    this.setData({
      coachCurrentStar: currentIdx
    })
    for (let i = 0; i < currentIdx; i++){
      if (!currentState){
        this.setData({
          ['coachStarList[' + i + '].chooseState']: true
        })
      }
    }
    for (let i = currentIdx; i < this.data.coachStarList.length; i++) {
      if (currentState) {
        this.setData({
          ['coachStarList[' + i + '].chooseState']: false
        })
      }
    }
  },
  //点击综合小星星
  clickStar_comprehensive(e){
    let currentIdx = e.currentTarget.dataset.id
    let currentState = e.currentTarget.dataset.state
    // console.log(currentIdx, currentState)
    this.setData({
      comprehensivehCurrentStar: currentIdx
    })
    for (let i = 0; i < currentIdx; i++) {
      if (!currentState) {
        this.setData({
          ['comprehensiveStarList[' + i + '].chooseState']: true
        })
      }
    }
    for (let i = currentIdx; i < this.data.comprehensiveStarList.length; i++) {
      if (currentState) {
        this.setData({
          ['comprehensiveStarList[' + i + '].chooseState']: false
        })
      }
    }
  },
  //提交评价
  submit(){
    wx.showModal({
      title: '提示！',
      content: '是否提交评价？',
      success : res => {
        if(res.confirm){
          let data = {
            orderNum: this.data.orderNum || '',
            coachStar: this.data.coachCurrentStar,
            courseStar: this.data.comprehensivehCurrentStar,
            remark: this.data.remark
          }
          api.post('v2/payOrder/signStar', data).then(res => {
            console.log('提交课程和教练评价', res)
            if(res.code == 0) {
              this.setData({ evaluateShow: true, textAreaIsStop : true})
            }
            else wx.showToast({ title: res.msg || '请勿重复评分', icon: 'none'})
          })
        }
      }
    })
    console.log(`教练: ${this.data.coachCurrentStar}星 ${this.data.coachStarList[this.data.coachCurrentStar - 1].idCont}评价,`, 
      `综合: ${this.data.comprehensivehCurrentStar}星 ${this.data.comprehensiveStarList[this.data.comprehensivehCurrentStar - 1].idCont}评价`)
  },
  onclose(){
    this.setData({ evaluateShow: false })
  },
  //返回课程
  jumpToCourse(){
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  //复制微信号
  pasteWx_code(){
    wx.setClipboardData({
      data: 'JJfitness',
      success: res => {
        wx.getClipboardData({
          success: res => {
            wx.showToast({
              title:'复制成功！',
              icon: 'none'
            })
          }
        })
      }
    })
  }
})