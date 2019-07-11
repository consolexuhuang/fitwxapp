const app = getApp();
const api = app.api;
const ui = require('../../utils/ui.js');
let courseId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarData: {
      title: '照片',
      showCapsule: 1,
      isShowBackHome: true,
      titleColor: "#000",
      tab_topBackground: '#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20,
    memberData:{},//会员信息
    photoUrl:'',//单张图片地址
    boxWidthScale: '686',//盒子宽度
    infoPadding: '23',//信息行的间距
    qrCodeWidthScale: '82',//二维码宽度
    qrCodeHeightScale: '82',//二维码高度
    shopNameFontSize:'32',//店铺名称字体大小
    advFontSize: '20',//广告语字体大小
    iconArrowFontsize:'14',//小箭头尺寸
    iconArrowMarginLeft: '10',//小箭头左间距
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    courseId = options.courseId;
    //检测登录
    app.checkSessionFun().then(() => {
    //获取课程图片
    this.getCourseFiles();
    //获取会员信息
    this.getMemberData()
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

  /**
   * 自定义函数--监听页面隐藏
   */
  //获取课程图片
  getCourseFiles() {
    let form = {
      courseId: courseId
    }
    api.post('v2/course/getCourseFiles', form).then(res => {
      let photoUrls = res.msg;
      this.setData({
        photoUrl: photoUrls ? photoUrls[photoUrls.length-1]:''
      })
    })
  },
  //获取分享二维码
  getMemberData() {
    let form = {}
    form.shareMemberId = wx.getStorageSync('shareMemberId');
    api.post('member/memberShow', form).then(ret => {
        this.setData({
          memberData: ret.msg
        })
    }) 
  },


})