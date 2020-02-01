// pages/member/order/orderDetail.js
const app = getApp();
const api = app.api
const ui = require('../../../utils/ui.js');
const utils = require('../../../utils/util.js')
const store = getApp().store;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNum: '',
    orderStatus:'',
    orderData: '',
    content: '',
    isMoreContentShow: false,
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: '订单详情',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    coachWxCodeState: false,
    courseShareData:'', //分享课程文案
    // officialData: '', //获取当前场景值对象
    // memberFollowState: 1, //当前关注状态
    bottomStyle: 0,
    // officialDataState:false,
    // memberInfo:'',
    jurisdictionState: false, //授权显示
    hasPhoto:false,//是否有照片
    // courseData: '',//课程详情
    broadcastIsShow:false,//直播弹层是否显示
    saveQrcodeBtnDisabled: false,//直播按钮可点

    orderentersensekey: parseInt(app.globalData.scene)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    // parseInt(app.globalData.scene)
    // wx.reportAnalytics('orderdetail_enter_scene', {
    //   orderentersense: 1,
    //   orderentersense2: 'aaa',
    // });
    //分享过来的参数
    if (options.shareMemberId) {
      wx.setStorageSync('shareMemberId', options.shareMemberId)
    }
    const orderNum = options.orderNum
    
    const orderStatus = options.orderStatus
    this.setData({
      orderNum,
      orderStatus
    })
    console.log('orderStatus')
    console.log(orderStatus)
    // this.getOrderDetail()
  },
  onShow(){
    //检测登录
    if (!getApp().passIsLogin()) {
      this.setData({ jurisdictionState: true })
    } else {
      app.checkSessionFun().then(() => {
        this.getOrderDetail()
      },()=>{
        this.setData({ jurisdictionState: true })
      })
    }
  },
  bindgetuserinfo(){
    app.wx_AuthUserLogin().then(() => {
      this.setData({ jurisdictionState: false })
      this.getOrderDetail()
    }, () => {
      this.setData({ jurisdictionState: true })
    })
  },
  /**
   * write@xuhuang  start
   */
  getCourseInfo(courseId){
    const data = {
      id: courseId,
      picType: 1
    }
    api.post('course/getCourse', data).then(res => {
      if (res.code === 0) {
        const courseShareData = res.msg.config
        this.setData({
          courseShareData,
          // courseData: res.msg
        })
      }
    })
  },
  /**
   * write@xuhuang  end
   */
  // 显示教练二维码
  showCoachWxCode() {
    app.compareVersionPromise('2.7.0').then((res) => {
      if (res == 0) {
        this.setData({ coachWxCodeState: true })
      }
    }) 
  },
  onclose() {
    this.setData({ coachWxCodeState: false })
  },
  //订单详情初始化
  getOrderDetail() {
    wx.showLoading({
      title: '加载中...'
    })
    const orderNum = this.data.orderNum
    let data = {
      orderNum
    }
    api.post('payOrder/orderInfo', data).then(res => {
      wx.hideLoading()
      const orderData = res.msg
      this.setData({
        orderData
      })
      this.getCourseInfo(res.msg.course.id)
      this.getContent()
      this.getCourseFiles()
    })
  },
  //点击直播  进入直播间
  handleRoom(){
    wx.navigateToMiniProgram({
      appId: this.data.orderData.onlineAppid,
      path: this.data.orderData.onlinePath,
      success(res) {
        // 打开成功
        console.log('打开成功')
      }
    })
  },
  //点击直播  弹层显示二维码
  handleBroadcast(){
    this.setData({
      broadcastIsShow:true
    })
  },  
  //关闭直播弹层
  broadcastClose(){
    this.setData({
      broadcastIsShow: false
    })
  },
  //保存图片
  saveBroadcastQrcode(){
    //loading
    ui.showLoadingMask();
    //设置按钮为不可点
    this.setData({
      saveQrcodeBtnDisabled: true
    })
    this.remoteToLocal(this.data.orderData.onlineImg)
      .then((resLocalUrl) => {
        this.saveImageToPhotosAlbum(resLocalUrl.path, '二维码已保存到相册', '二维码保存失败');
      })
  },
  //保存图片到系统相册
  saveImageToPhotosAlbum(url, successTipText = '已保存到相册', failTipText = '保存失败') {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath: url,
        success: () => {
          ui.showToast(successTipText)
          resolve();
        },
        fail: (err) => {
          if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
            // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
            wx.showModal({
              title: '提示',
              content: '需要您授权保存相册',
              showCancel: false,
              success: modalSuccess => {
                wx.openSetting({
                  success: (settingdata) => {
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      wx.showModal({
                        title: '提示',
                        content: '获取权限成功,再次点击保存按钮即可保存',
                        showCancel: false,
                      })
                    } else {
                      wx.showModal({
                        title: '提示',
                        content: '获取权限失败，将无法保存到相册哦~',
                        showCancel: false,
                      })
                    }
                  },
                  fail: (failData) => {
                    console.log("failData", failData)
                  },
                  complete: (finishData) => {
                    console.log("finishData", finishData)
                  }
                })
              }
            })
          }
        },
        complete: () => {
          //ui.hideLoading();
          //设置按钮为可点
          this.setData({
            broadcastIsShow:false,
            saveQrcodeBtnDisabled: false,
          })
        }
        /* fail: (err) => {
          console.error(err)
          ui.showToast(failTipText)
          reject(failTipText)
        } */
      })
    })
  },
  //远程图片转本地图片
  remoteToLocal(url) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          console.error(err)
          reject('远程图片转本地图片错误！')
        }
      })
    })
  },
  //处理显示更多
  getContent() {
    const strCont = this.data.orderData.course.needingAttention
    if (strCont.length > 61) {
      const content = strCont.slice(0, 60) + '...'
      const isMoreContentShow = true
      this.setData({
        content,
        isMoreContentShow
      })
    } else {
      const content = strCont
      const isMoreContentShow = false
      this.setData({
        content,
        isMoreContentShow
      })
    }
  },
  showMore() {
    const content = this.data.orderData.course.needingAttention
    const isMoreContentShow = false
    this.setData({
      content,
      isMoreContentShow
    })
  },
  //取消订单
  cancelOrder() {
    //cancelFlag 1:不可取消 2：取消等待 3：未支付 4：可退款 5：不可退款
    if (this.data.orderData.cancelFlag === 3) {
      this.directCancel()
    } else if (this.data.orderData.cancelFlag === 4 || this.data.orderData.cancelFlag === 5) {
      wx.navigateTo({
        url: `/pages/member/order/cancelOrder?orderNum=${this.data.orderNum}`,
      })
    }
  },
  cancelWait(){
    wx.showModal({
      title: '提示',
      content: '是否取消等候？',
      success: res => {
        if(res.confirm){
           this.directCancel()
        }
      }
    })
  },
  // 直接取消预约
  directCancel() {
    let form = {}
    form.orderNum = this.data.orderNum;
    api.post('refundOrder/refund', form).then(ret => {
        //提示
        this.toast(ret.msg);
        // 跳转到订单详情
        this.getOrderDetail()     
    });
  },
  toast(title) {
    wx.showToast({
      title: title,
      duration: 3000
    });
  },
  //查看地图
  handleLocationTap: function (event) {
    console.log(event)
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
  //跳转线webUrl
  handleRouteGuidanceTap() {
    wx.navigateTo({
      url: '/pages/store/routeGuidance?webUrl=' + this.data.orderData.store.mapPic
    })
  }, 
  // 跳转教练课程列表
  handleCoachTap: function (event) {
    // console.log(event)
    const coachId = event.currentTarget.dataset.coachid
    wx.navigateTo({
      url: '/pages/coach/coach?coachId=' + coachId
    })
  },
  //分享
  onShareAppMessage() {
    const storeId = this.data.storeId
    return {
      title: this.data.courseShareData.title,
      imageUrl: this.data.courseShareData.img,
      path: '/pages/course/courseDetail?courseId=' + this.data.orderData.course.id + '&shareMemberId=' + wx.getStorageSync('userData').id,
      
    }
  },

  //获取课程图片
  getCourseFiles() {
    let form = {
      courseId: this.data.orderData.course.id
    }
      api.post('v2/course/getCourseFiles', form).then(res => {
        let photoUrls = res.msg;
        if (photoUrls.length>=1){
          this.setData({
            hasPhoto:true
          })
        }
        
      })
  },

  //跳转到照片页面
  //courseId=5d12c35be4b06bfda7ba080c&orderNum=1907100590334900&shareMemberId=1121655406372982784
  gotoCoursePhoto(){
    wx.navigateTo({
      url: `/pages/coursePhoto/coursePhoto?courseId=${this.data.orderData.course.id}&orderNum=${this.data.orderNum}&shareMemberId=${wx.getStorageSync('userData').id}`,
    })
  }

})