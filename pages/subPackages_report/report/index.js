// pages/subPackages_report/report/index.js
const util = require('../../../utils/util.js')
import reportJson from '../../../utils/reportJson.js'
import NumberAnimate from "../../../utils/NumberAnimate";
const store = getApp().store;
const api = getApp().api;
// console.log(reportJson.existenceRule)
/**
 * 一直loadIng原因
 * 1：没有 COURSE_LIST 或者 COURSE_LIST数据异常，
 * 2: 获取2019年度账单失败（getYearReport2019）
 * 3: 生成账单失败 （generateYearReport）
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    isDownLoad: false,
    isStartState: false,
    jurisdictionSmallState: false,
    userYearReport:'',

    shareReportImg:'',//导出分享图

    pageList:[], //页码
    //报告规则
    existenceRule: reportJson.existenceTestRule, //正式：existenceRule，测试：existenceTestRule
    newCourseList: [],

    invitedcodeUrl:'', //邀请二维码
  },
  //累计存在值key的tagCount
  getExistenceKey(value) {
    for (let i in this.data.existenceRule) {
      for (let j = 0; j < this.data.existenceRule[i].list.length; j++) {
        if (value.temp_id == this.data.existenceRule[i].list[j]) {
          this.data.existenceRule[i].tagCourseList.push(value)
          this.data.existenceRule[i].tagCount += value.order_count
        }
      }
    }
  },

  //用户下单标签课程总和最多，所对应的标签下该用户所有下单课程的排序
  getLastTagCourseSortList(courseCountData) {
    return new Promise(resolve => {
        for (let j = 0; j < courseCountData.length; j++) {
          this.getExistenceKey(courseCountData[j])
        }
        // console.log(this.data.existenceRule, util.sortList(this.data.existenceRule, 'tagCount'))
        //获取最高次数标签对象
        let heighestTagCourse = util.sortList(this.data.existenceRule, 'tagCount')[0]
        //获取最高标签最高课程
        let firstCourse = util.sortList(heighestTagCourse.tagCourseList, 'order_count')[0]

        console.log(firstCourse, heighestTagCourse)
        this.setData({ 
          newCourseList: heighestTagCourse,
        })
        this.setPageNumConfig()
        resolve()
    })
  },
  remoteToLocal(url) {
    console.log('远程图片转本地图片')
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success: (res) => {
          console.log('res 远程图片转本地图片成功')
          console.log(res)
          resolve(res);
        },
        fail: (err) => {
          console.error(err)
          reject('远程图片转本地图片错误！')
        }
      })
    })
  },
  //配置邀请二维码
  getCodeConfig() {
    let data = {
      scene: store.getItem('userData').id,
      liteType: 'main',
      page: 'pages/subPackages_report/report/index'
      // page: 'pages/index/index'
    }
    console.log(util.formatUrlParams(`${api.API_URI}getLiteQrcode`, data))
    let distURL = util.formatUrlParams(`${api.API_URI}getLiteQrcode`, data)
    this.remoteToLocal(distURL).then(res => {
      // console.log(res.path)
      res.path ?
      this.setData({
          invitedcodeUrl: res.path
      })
      // srore.setItem('invitedcodeUrl' res.path)
      : ''
    })
  },
  // 生产年度账单
  generateYearReport(){
    api.post('v2/member/generateYearReport2019').then(res => {
      console.log('生成2019账单', res)
      this.setData({ userYearReport: res.msg })
      res.msg ? store.setItem('userYearReport', res.msg) : ''
      store.getItem('canvasReportObj') ? this.sharePosteCanvas(store.getItem('canvasReportObj')) : this.getBgImg() //下载素材
      // if (res.msg.id) this.getYearReport(res.msg.id)
      if (res.msg.total_count > 0){
        if (res.msg.id) this.getYearReport(res.msg.id)
      } else {
        wx.redirectTo({
          url: '/pages/subPackages_report/newUseReport/newUseReport',
        })
      }
    })
  },
  // 获取年度账单
  getYearReport(reportId){
    let data = {
      id: reportId
    }
    api.post('v2/member/getYearReport2019', data).then(res => {
      console.log('获取2019年度账单', res)
      if (res.msg.COURSE_LIST && res.msg.COURSE_LIST.length > 0) {
         this.getLastTagCourseSortList(res.msg.COURSE_LIST).then(() => {
           this.setData({
             isStartState: true
           })
         })
      }
    })
  },
  //配置页码
  setPageNumConfig(){
    let pageNum = 12
    let pageList = [];
    for (let i = 0; i < pageNum; i++) {
      pageList[i] = i
    }
    //序列4
    if (this.data.userYearReport.total_invite < 1) {
      for (let j = 4; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
    //序列5
    if (this.data.userYearReport.total_coupon_count == 0) {
      for (let j = 5; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
    //序列6
    if (!this.data.userYearReport.love_co_member) {
      for (let j = 6; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
    //序列8
    if (!this.data.userYearReport.first_evening_course_name) {
      for (let j = 8; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
    //序列9
    if (!this.data.userYearReport.first_morning_course_name) {
      for (let j = 9; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
   
    this.setData({ pageList: pageList})
    console.log('页码数：', pageNum, pageList)
  },
  // 设置数字跳变
  setNumStep(stepName, stepNum, decimals = 0){
    let a = stepName
    let _this = this
    let numberAnimate = new NumberAnimate({
      from: stepNum,//开始时的数字
      speed: 800,// 总时间
      refreshTime: 45,//  刷新一次的时间
      decimals: 2,//小数点后的位数
      onUpdate: () => {//更新回调函数
        console.log(stepNum)
        _this.setData({
          a: numberAnimate.tempValue
        });
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    console.log('options----index', options)
    if (options.scene) {
      //小程序码参数
      console.log('scene-index', options.scene)
      store.setItem('shareMemberId', options.scene)
    } else if (options.shareMemberId) {
      //分享链接参数
      console.log('shareMemberId-index', options.shareMemberId)
      store.setItem('shareMemberId', options.shareMemberId)
    }

    // wx.onUserCaptureScreen(function (res) {
    //   wx.showToast({
    //     title: '用户截屏了',
    //   })
    //   console.log('用户截屏了')
    // })
    getApp().checkSessionFun().then(() => {
      this.getCodeConfig()
      this.generateYearReport()
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.stopPullDownRefresh()
  },
  // 点击授权
  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.setData({
        jurisdictionSmallState: false,
      })
    })
  },
  // 轮播改变
  bindchange(e) {
    let _this = this
    //下滑
    if (this.data.current < e.detail.current) {
      this.setData({ isDownLoad: true })
    } else {
      this.setData({ isDownLoad: false })
    }
    // console.log(e,this.data.current, e.detail.current)
    this.setData({
      current: e.detail.current,
    })

    console.log(e.detail.current, this.data.pageList[this.data.pageList.length - 1])
    if (e.detail.current == this.data.pageList[this.data.pageList.length - 1]) {
      let numberAnimate = new NumberAnimate({
        from: this.data.userYearReport.total_rank,//开始时的数字
        speed: 800,// 总时间
        refreshTime: 45,//  刷新一次的时间
        decimals: 2,//小数点后的位数
        onUpdate: () => {//更新回调函数
          _this.setData({
            ['userYearReport.total_rank']: numberAnimate.tempValue
          });
        },
      });
    }
  },
  // 查看报告
  startReport(){
    if (this.data.isStartState && getApp().passIsLogin()){
      // this.setData({ isStartState: true})
      this.setData({
        current: this.data.current + 1
      })
      // if (this.data.userYearReport.total_count > 0){
      //     this.setData({
      //       current: this.data.current + 1
      //     })
      // } else {
      //   wx.redirectTo({
      //     url: '/pages/subPackages_report/newUseReport/newUseReport',
      //   })
      // }
    } else {
      this.setData({
        jurisdictionSmallState: true
      })
    }
  },
  backHome(){
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  onShareAppMessage() {
    return {
      title: "",
      imageUrl: this.data.shareReportImg || '',
      path: `/pages/subPackages_report/report/index?shareMemberId=${wx.getStorageSync('userData').id}`,
    }
  },
  // ================canvas
  //下载背景图片
  getBgImg: function () {
    var that = this;
    console.log('背景图片下载中......')
    wx.downloadFile({
      url: 'https://img.cdn.powerpower.net/5e0574e4e4b0ce7e90868015.png', //图片路径
      success: function (res) {
        // wx.hideLoading();
        if (res.statusCode === 200) {
          console.log('背景图片下载完毕----')
          var BgImg = res.tempFilePath; //下载成功返回结果
          that.getSourceMaterial1(BgImg); //继续下载二维码图片
        } else {
          var BgImg = "";
          that.getSourceMaterial1(BgImg);
        }
      }
    })
  },
  // 下载素材1
  getSourceMaterial1: function (BgImg) {
    console.log('下载素材1......')
    var that = this;
    wx.downloadFile({
      url: 'https://img.cdn.powerpower.net/5e0574e5e4b0ce7e90868016.png', //二维码路径
      success: function (res) {
        console.log('下载素材1下载完毕------')
        if (res.statusCode === 200) {
          var SourceMaterial1 = res.tempFilePath;
          that.getSourceMaterial2(BgImg, SourceMaterial1)
        } else {
          var SourceMaterial1 = "";
          that.getSourceMaterial2(BgImg, SourceMaterial1)
        }
      }
    })
  },
  //素材2
  getSourceMaterial2(BgImg, SourceMaterial1) {
    var that = this;
    console.log('素材2......')
    wx.downloadFile({
      url: 'https://img.cdn.powerpower.net/5e0574ebe4b0ce7e90868017.png', 
      success: function (res) {
        console.log('素材2下载完毕-----')
        if (res.statusCode === 200) {
          var SourceMaterial2 = res.tempFilePath;
          let obj = {
            BgImg: BgImg,
            SourceMaterial1: SourceMaterial1,
            SourceMaterial2: SourceMaterial2
          }
          that.setData({ canvasObj: obj })
          // 只有下载成功后再存缓存
          store.setItem('canvasReportObj', obj)
          that.sharePosteCanvas(obj)
        } else {
          that.setData({ canvasObj: {} })
          // that.sharePosteCanvas(obj)
        }
      },
    })

  },
  /**
   * 开始用canvas绘制分享海报
   * @param BgImg 下载的背景图片路径
   * @param SourceMaterial1 SourceMaterial2   下载的素材1，2
   * @以width： 500rpx height： 400rpx   比例计算
   */
  sharePosteCanvas: function (canvasObj) {
    var that = this;
    // wx.showLoading({ title: '生成中...', mask: true, })
    const ctx = wx.createCanvasContext('myCanvas'); //创建画布
    wx.createSelectorQuery().select('#canvas-container').boundingClientRect(function (rect) {
      // console.log(rect, canvasObj)
      var height = rect.height;
      var width = rect.width;
      var right = rect.right;

      if (canvasObj.BgImg) {
        ctx.drawImage(canvasObj.BgImg, 0, 0, rect.width, rect.height);
      }
      if (canvasObj.SourceMaterial1) {
        ctx.drawImage(canvasObj.SourceMaterial1, (rect.width - rect.width / 2) / 2, 0, rect.width / 2, rect.height * 0.32);
      }
      if (canvasObj.SourceMaterial2) {
        ctx.drawImage(canvasObj.SourceMaterial2, (rect.width - rect.width / 1.11) / 2, rect.height * 0.64, rect.width / 1.11, rect.height * 0.28);
      }
      // //绘制文本
      ctx.setFontSize(height / 9);
      ctx.setFillStyle('#F4C11C');
      var activeoOneLengthHalf = ctx.measureText(`我击败了`).width / 2
      var activeoTwoLengthHalf = ctx.measureText(`全上海${parseInt(that.data.userYearReport.total_rank) || 0} % 的小伙伴`).width / 2

      ctx.fillText(`我击败了`, rect.width / 2 - activeoOneLengthHalf, (rect.height * 0.32) + (rect.height / 7));
      ctx.fillText(`全上海${parseInt(that.data.userYearReport.total_rank) || 0}%的小伙伴`, rect.width / 2 - activeoTwoLengthHalf, rect.height * 0.32 + height / 7 + height / 9 + 6);

      setTimeout(function () {
        ctx.draw(false, function(){
          wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            fileType: 'jpg',
            success: function (res) {
              console.log('导出shareReportImg----', res.tempFilePath)
              // that.setData({ a: res.tempFilePath })
              that.getUploadToken(res.tempFilePath)
            }
          })
        })
      }, 100)
    }).exec()
  },
  //获取七牛上传令牌
  getUploadToken(tempFilePath) {
    let form = {}
    api.post('coach/getUploadToken', form).then(res => {
      console.log('getUploadToken',res)
      this.uploadQiniu(tempFilePath, res.msg.uploadToken).then(resolve => {
        console.log('图片上传七牛成功----', resolve)
        let imgInfo = JSON.parse(resolve.data);
        let qiniuImgName = imgInfo.key;
        this.saveUploadFiles(qiniuImgName || '')
      }, reject => {})
    })
  },
  //上传七牛返回key
  uploadQiniu(tempFilePath, token) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: 'https://up-z0.qiniup.com',
        filePath: tempFilePath,
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          key: store.getItem('userData').id + Math.floor(Math.random() * 100000000) + (new Date().getTime()) + '.' + tempFilePath.split('.')[tempFilePath.split('.').length - 1], //标识图片的唯一
          token: token,
        },
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.log('图片上传七牛失败')
          // ui.showToast('图片上传失败')
          reject()
        }
      })
    }).catch(err => {
      // ui.showToast('上传到七牛错误！')
      reject()
    })

  },
  //保存上传的文件
  saveUploadFiles(tempFilePath) {
      let form = {
        files: tempFilePath,
        serviceId: 'YEAR_REPORT_2019',
        dataId: this.data.userYearReport.id
      };
       api.post('v2/member/saveUploadFiles', form).then(res => {
         console.log('saveUploadFiles', res.msg)
         this.setData({ shareReportImg: res.msg[0] || '' })
         wx.showShareMenu()
      })
  },
  //获取上传的文件
  // getUploadFiles(tempFilePath) {
  //   let form = {
  //     files: tempFilePath,
  //   };
  //   api.post('v2/course/getCourseFiles', form).then(res => {
  //     let photoUrls = res.msg;
  //     let photoUrl = photoUrls ? photoUrls[photoUrls.length - 1] : '';
  //     console.log('获取上传七牛地址：----', photoUrl)
  //     this.setData({ shareReportImg: photoUrl })
  //     wx.showShareMenu()
  //   },rej => {
  //     this.setData({ shareReportImg: '' })
  //   })
  // },
})
