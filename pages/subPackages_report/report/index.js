// pages/subPackages_report/report/index.js
const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    isDownLoad: false,
    isStartState: false,
    jurisdictionSmallState: false,
    isLoadOverState: true,
    userYearReport:''
  },
  //配置邀请二维码
  getCodeConfig() {
    return new Promise(resolve => {
      let data = {
        scene: store.getItem('userData').id,
        liteType: 'main',
        page: 'pages/report/index'
      }
      console.log(util.formatUrlParams(`${getApp().globalData.API_URI}getLiteQrcode`, data))
      // this.setData({
      //   invitedcodeUrl: util.formatUrlParams(`${getApp().globalData.API_URI}getLiteQrcode`, data)
      // })
      resolve()
    })
  },
  // 生成年度账单
  getYearReport(){
    api.post('v2/member/generateYearReport2019').then(res => {
      console.log('2019账单',res)
      this.setData({ userYearReport: res.msg})
    })
  },
  // getreport(){
  //   let data = {
  //     id: "1209343800225435648"
  //   }
  //   api.post('v2/member/getYearReport2019', data).then(res => {
  //     console.log('2019账单2', res)
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().checkSessionFun().then(() => {
      this.getYearReport()
      // this.getreport()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 点击授权
  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.setData({
        jurisdictionSmallState: false,
      })
      // this.getMemberFollowState()
    })
  },
  // 轮播改变
  bindchange(e) {
    //下滑
    if (this.data.current < e.detail.current) {
      this.setData({ isDownLoad: true })
    } else {
      this.setData({ isDownLoad: false })
    }
    console.log(this.data.current, e.detail.current, this.data.isDownLoad)
    this.setData({ current: e.detail.current })
  },
  // 查看报告
  startReport(){
    if (this.data.isLoadOverState && getApp().passIsLogin()){
      this.setData({ isStartState: true})
      this.setData({
        current: this.data.current + 1
      })
    } else {
      this.setData({
        jurisdictionSmallState: true
      })
    }
  },
})
