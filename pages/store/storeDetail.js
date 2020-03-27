// pages/store/storeDetail.js
const app = getApp();
const api = app.api;
const store = app.store;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: '店铺详情',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.header_bar_height,
    imgUrl: getApp().globalData.imgUrl,
    storeId: '',
    picList: [],
    storeData: '',
    storeFacilitiesList:[],
    isShowStatement: false,
    
    // officialData: '', //获取当前场景值对象
    memberFollowState: 1, //当前关注状态
    bottomStyle: 130,
    officialDataState: false,
    memberInfo: '',

    // jurisdictionState:false, //授权显示

    statementContent: `<p>1、参与Justin&Julie健身服务的用户，具有完全的民事行为能力，同意遵守Justin&Julie的相关管理规章制度，已接受Justin&Julie的相关服务协议，并已知晓有关的健身规则与警示，承诺遵守Justin&Julie的相关健身规则与警示规定。</p>
      <p>2、Justin&Julie员工及教练不提供任何形式的体检服务，Justin&Julie员工及教练对用户身体情况的任何询问、了解和建议都不构成本公司对用户身体状况是否符合任意健身课程和产品要求的承诺及保证。在确认本声明前，用户应自行到医疗机构进行体检，了解自身身体情况，以确保用户具备参与Justin&Julie健身产品的身体条件，且没有任何不宜运动的疾病、损伤和其他缺陷。因用户自身的任何疾病、损伤或其他缺陷导致用户在接受服务时发生任何损害的，Justin&Julie不承担任何法律责任。</p>
      <p>3、用户有任何身体方面的原因会影响或可能会影响使用Justin&Julie健身产品的，在使用Justin&Julie健身产品前应主动告知Justin&Julie，Justin&Julie有权拒绝向用户提供Justin&Julie健身服务。用户在接受Justin&Julie健身服务过程中感到任何不适的，应及时告知Justin&Julie的健身教练。否则，因此而发生的任何身体损害，Justin&Julie不承担法律责任。</p>
      <p>4、严禁14周岁以下儿童进入Justin&Julie健身场所，严禁孕妇及哺乳期女性、心肺功能疾病、脊椎病、皮肤病、关节损伤及一切传染病患者等不适合健身运动者使用Justin&Julie提供的健身产品，用户在签署相关服务协议及约课时应如实书面告知Justin&Julie该等情况，如有隐瞒，由此所发生的一切后果及对他人产生的后果，包括但不限于人身损害，Justin&Julie及教练组不负任何责任。如因此造成第三人损害的，则由用户承担赔偿责任。</p>
      <p>5、经教练评估存在运动风险且坚持上课的用户，需现场签订《责任免除和豁免协议》。</p>
      <p>6、用户知晓并承诺遵守声明中的约定、管理制度、用户手册以及任何形式（包括口头、文本等）告知的安全规范，如有违反相关规定的发生，造成任何后果Justin&Julie不承担法律责任，且Justin&Julie有权终止其使用资格，已交纳的费用不予退还。</p>
      <p>7、运动前后严禁饮用含酒精类饮品或其他不适宜运动前后服用、饮用的食品、药品、饮品等及任何国家法律法规禁止的兴奋类服用剂。</p>
      <p>8、为了用户的健身安全，用户训练时须穿着专业的运动服、运动鞋及运动装备。运动期间，不得参与违反国家法律法规的活动、不得穿着违反道德规范服饰进行运动。</p>
      <p>9、用户在参加健身锻炼时请勿携带珠宝饰品等贵重物品，以免丢失或造成意外。Justin&Julie免费提供的储物柜仅为方便用户，Justin&Julie本身不提供锁具、不承担保管物品的义务。物品遗失概不负责。</p>
      <p>10、因个人体质、基础形态、运动机能的不同，Justin&Julie不能保证所有用户都能取得某项理想的健身效果。</p>
      <p>11、Justin&Julie保留增加、改进或者取消非合适课程的权利。</p>
      <p>12、Justin&Julie及其所属公司拥有其全部课程、活动、培训等的图片、文字、影像等资料的永久使用权，并用于电子商务、户外广告、电视媒体样本画册印刷企业内部资料及订单选样等宣传载体，可将同等使用权赋予其他第三方机构用于商用宣传推广，且不再另行通知。</p>
      <p><b>附：法律适用、管辖与其他</b></p>
      <p>本协议履行过程中，因用户使用Justin&Julie服务产生的争议应由Justin&Julie与用户沟通并协商处理。协商不成时，双方均同意以Justin&Julie平台管理者住所地上海市浦东新区人民法院为管辖法院。</p>
      `
  },
  // 获取门店设施
  getStoreFacilitiesList(){
    let data = {
      storeId: this.data.storeId
    }
    api.post('store/getStoreFacilitiesList',data).then(res => {
      console.log('getStoreFacilitiesList',res)
      if(res.code === 0 && res.msg.length > 0){
        this.setData({ storeFacilitiesList : res.msg})
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //分享过来的参数
    if (options.shareMemberId) {
      wx.setStorageSync('shareMemberId', options.shareMemberId)
    }
    
    const storeId = options.storeId
    this.setData({
      storeId
    })

    //检测登录
    app.checkSessionFun().then(() => {
    //this.getMemberFollowState()
    this.getStorePicList()
    this.getStore()
    this.getStoreFacilitiesList()
    // this.getOfficialDataState()
    })
  },
  // bindgetuserinfo(){
  //   app.checkSessionFun().then(() => {
  //     this.setData({ jurisdictionState: false })
  //     this.getMemberFollowState()
  //     this.getStorePicList()
  //     this.getStore()
  //     this.getStoreFacilitiesList()
  //     // this.getOfficialDataState()
  //   }, () => {
  //     this.setData({ jurisdictionState: true })
  //   })
  // },
  onShow(){

  },
  /**
   * write@xuhuang  start
   */
  /* // 获取当前用户关注状态
  getMemberFollowState() {
    if (app.passIsLogin()) {
      api.post('v2/member/memberInfo').then(res => {
        console.log('getMemberFollowState', res)
        this.setData({ 
          memberFollowState: res.msg.sub_flag ,
          officialDataState: res.msg.sub_flag == 1 ? false : true,
          memberInfo: res.msg
        })
      })
    }
  }, */
  // getOfficialDataState() {
  //   // sub_flag 1:关注 0:未关注
  //   if (store.getItem('userData') && store.getItem('userData').sub_flag === 0) {
  //     this.setData({ officialDataState: true })
  //   } else if (store.getItem('userData') && store.getItem('userData').sub_flag === 1) {
  //     this.setData({ officialDataState: false })
  //   }
  // },
  // bindload(e) {
  //   console.log('official-account_success', e.detail)
  //   this.setData({ officialData: e.detail })
  // },
  // binderror(e) {
  //   console.log('official-account_fail', e.detail)
  //   this.setData({ officialData: e.detail })
  // },
  /**
   * write@xuhuang  end
   */
  getStorePicList: function(event) {
    const storeId = this.data.storeId
    const data = {
      storeId
    }
    api.post('store/getStorePicList', data).then(res => {
      console.log('getStorePicList', res)
      if (res.code === 0) {
        const picList = res.msg
        this.setData({
          picList
        })
      }
    })
  },
  getStore: function(event) {
    const storeId = this.data.storeId
    const latitude = getApp().globalData.location.latitude
    const longitude = getApp().globalData.location.longitude
    const data = {
      id: storeId,
      latitude,
      longitude
    }
    wx.showLoading({
      title: '加载中...',
    })
    api.post('store/getStore', data).then(res => {
      wx.hideLoading()
      console.log('getStore',res)
      if (res.code === 0) {
        const storeData = res.msg
        this.setData({
          storeData
        })
      }
    })
  },
  handleLocationTap: function(event) {
    const name = event.currentTarget.dataset.name
    const address = event.currentTarget.dataset.address
    const latitude = Number(event.currentTarget.dataset.latitude)
    const longitude = Number(event.currentTarget.dataset.longitude)
    wx.openLocation({
      name,
      address,
      latitude,
      longitude,
      scale: 18
    })
  },
  handleAppointBtnTap: function(event) {
    const storeId = this.data.storeId
    const selectedStore = []
    selectedStore.push(storeId)
    const courseConfig = {
      selectedStore
    }
    getApp().globalData.courseConfig = courseConfig
    //wx.setStorageSync('courseConfig', courseConfig);
    wx.switchTab({
      url: '/pages/course/course',
      /* success: function(event) {
        var page = getCurrentPages().pop() //当前页面
        if (page == undefined || page == null) return
        //page.onLoad() //或者其它操作
      } */
    })
  },
  //跳转线webUrl
  handleRouteGuidanceTap(){
    wx.navigateTo({
      url: '/pages/store/routeGuidance?webUrl=' + this.data.storeData.mapPic
    })
  },  
  onShareAppMessage(){
    const storeId = this.data.storeId
    return {
      title: `${this.data.storeData.storeName},点击查看门店位置
`,
      path: '/pages/store/storeDetail?storeId=' + storeId + '&shareMemberId=' + wx.getStorageSync('userData').id,
    }
  },
  //免责声明
  showStatement() {
    this.setData({
      isShowStatement: true
    })
  },
  //关闭免责声明
  statementClose() {
    this.setData({
      isShowStatement: false
    })
  }
})