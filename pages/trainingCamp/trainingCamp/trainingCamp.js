// pages/trainingCamp/trainingCamp/trainingCamp.js
import CountDown from '../../../utils/timeCount.js'
import Store from '../../../utils/store.js'
const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: getApp().globalData.imgUrl,
    goodId:'',

    countList:[], //定时器列表 [{endTime : 2121212221,timeObj:{}}]
    timerIdList:[], //定时器编号列表 [34,44]

    trainingCampData:'', //训练营数据
    coachList:[],
    navbarData: {
      title: '训练营',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    coachShow:false, //教练弹窗
    showLookMore:false, //课程简介more
    showLookCarefulMore: false, //注意more
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    goodCoachsList:'',

  },
  
  // 清楚所有定时器
  clearTimeCount(){
    this.data.timerIdList.forEach(val => {
      clearInterval(val)
    })
  },
  // 获取训练营详情
  getTrainingDetail(){
    let data = {
      goodId: this.data.goodId
    }
    api.post('v2/good/getGoodInfo', data).then(res => {
      // let startTime = new Date(res.msg.sale_begin_time).getTime()
      let obj = {
        endTime: new Date(res.msg.sale_begin_time.replace(/-/g, '/')).getTime()
      }
      this.setData({ 
        trainingCampData : res.msg ,
        coachList: res.msg.coach_course ? Object.values(res.msg.coach_course) : '',
        countList: [obj],
      })
      console.log(res, obj, new Date(res.msg.sale_begin_time), this.data.coachList)
      CountDown.timeCount(this, 2)
      Store.setItem(res.msg.id, res.msg)
    })
  },
  getGoodCoach(){
    let data = {
      goodId: this.data.goodId
    }
    api.post('v2/good/getGoodCoachs',data).then(res => {
      console.log('getGoodCoachs',res)
      this.setData({ goodCoachsList : res.msg})
    })
  },
  //获取元素高度
  getDomHeight(selectDom, baseHeight){
    return new Promise( resolve => {
      wx.createSelectorQuery().select(selectDom).boundingClientRect((rect) => {
        let clientHeight = rect.height || 0;
        let clientWidth = rect.width || 0;
        let ratio = 750 / clientWidth;
        let height = clientHeight * ratio;
        console.log(height);
        if (height > baseHeight) {
          resolve()
        }
      }).exec()  
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.goodId){ 
      this.setData({
        goodId: options.goodId
      }, ()=> {
        this.getTrainingDetail()
        this.getGoodCoach()
      })
    }
    this.getDomHeight('#trainingCampDom', 150).then(res => {
      this.setData({ showLookMore: true })
    })
    this.getDomHeight('#trainingCampCarefulDom', 120).then(res => {
      this.setData({ showLookCarefulMore: true })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({ timerIdList : []})
    CountDown.timeCount(this, 2).then(() => {
      this.getTrainingDetail()
    })
  },
  onUnload(){
    this.clearTimeCount()
  },
  onHide(){
    this.clearTimeCount()
  },
  showCoachInfo(){
    this.setData({ coachShow: true })
  },
  onclose(){
    this.setData({ coachShow : false})
  },
  jumpTrainingOrder(){
    wx.navigateTo({
      url: `../trainingCampOrder/trainingCampOrder?goodId=${this.data.goodId}`,
    })
  },
  showInfoMore(){
    this.setData({ showLookMore: false })
  },
  showCarefulMore(){
    this.setData({ showLookCarefulMore: false })
  }
})