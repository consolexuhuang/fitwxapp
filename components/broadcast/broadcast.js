// components/broadcast/broadcast.js
const app = getApp();
const api = app.api;
import Store from '../../utils/store.js';
const util = require('../../utils/util.js');
const ui = require('../../utils/ui.js');
let firstObservers = true; //是否第一次监听
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData: {
      type: Object
    },
    isShow: {
      type: Boolean,
      value: false
    }
  },
  /* 监听 */
  observers: {
    'isShow': function (val) {
      if (val) {
        ui.hideLoading();
      }
    },
    'cardData': function (val) {
      //生成图片
      if (val.coachHeadImg && val.qrCode && firstObservers) {
        this.generateCardPic();
        firstObservers = false;
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    width: 650, //canvas宽
    height: 895, //canvas高  2行地址高度828    
    borderRadius: 16, //矩形背景圆角
    sCoachHeadImgWidth: '', //源二维码宽度
    coachHeadImgWidth: 140, //头像宽度
    tipText1: '保存图片',
    tipText2: '到相册',
    tipText3: '打开抖音',
    tipText4: '立即看到',
    tipText5: '或',
    tipText6: '下载“一直播”app，搜索“JJFitness”进入直播间',
    sQrCodeWidth: '', //源二维码宽度
    qrCodeWidth: 230, //二维码宽度
    generateFilePath: '', //canvas生成的图片
    saveQrcodeBtnDisabled: false,//直播按钮可点
  },
  lifetimes: {
    ready: function () {
      // 在组件实例进入页面节点树时执行
      this.init();
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  ready: function () {
    // 在组件实例进入页面节点树时执行
    this.init();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init() { },

    //关闭弹层
    clickClose() {
      this.triggerEvent('closecard')
    },


    //保存卡片
    saveCard() {
      //保存卡片信息完整
      this.cardInfoRight();
    },
    //保存卡片信息完整
    cardInfoRight() {
      if (this.data.cardData.coachHeadImg && this.data.cardData.qrCode) {
        //设置按钮为不可点
        this.setData({
          saveQrcodeBtnDisabled: true
        })
        //loading
        ui.showLoadingMask();
        let generateFilePath = this.data.generateFilePath;
        if (generateFilePath) {
          this.saveImageToPhotosAlbum(generateFilePath)
        } else {
          this.generateCardPic()
            .then((resTempFilePath) => {
              generateFilePath = resTempFilePath;
              return this.saveImageToPhotosAlbum(generateFilePath);
            })
        }
      }
      else {
        ui.showToast('图片素材下载异常，稍后重新尝试！')
      }
    },

    //生成卡片图片
    generateCardPic() {
      //远程图片转本地图片（头像、二维码）
      return Promise.all([this.remoteToLocal(this.data.cardData.coachHeadImg), this.remoteToLocal(this.data.cardData.qrCode)])
        .then((resArrImg) => {
          //图片
          let coachHeadImg = resArrImg[0].path;
          let qrCode = resArrImg[1].path;
          //设置源二维码图片的宽度
          this.setData({
            sCoachHeadImgWidth: resArrImg[0].width,
            sQrCodeWidth: resArrImg[1].width
          })
          //绘制canvas
          return this.drawCanvas(coachHeadImg, qrCode)
        }).then(() => {
          //生成图片
          return this.canvasToPic()
        })
        .catch((err) => {
          ui.showToast('生成卡片出错');
          console.log(err)
        })
    },

    //绘制canvas
    drawCanvas(coachHeadImg, qrCode) {
      let canvasWidth = this.data.width;
      let canvasHeight = this.data.height;
      let sCoachHeadImgWidth = this.data.sCoachHeadImgWidth;//源头像的宽度
      let coachHeadImgWidth = this.data.coachHeadImgWidth;//头像的宽度
      let borderRadius = this.data.borderRadius;     
      let courseNameFontSizeScale = this.data.courseNameFontSizeScale;
      let courseNameLineHeight = this.data.courseNameLineHeight;
      let iconScale = this.data.iconScale;
      let infoRowHeight = this.data.infoRowHeight;
      let qrCodeWidth = this.data.qrCodeWidth;
      let sQrCodeWidth = this.data.sQrCodeWidth;
      let tipText1 = this.data.tipText1;
      let tipText2 = this.data.tipText2;
      let tipText3 = this.data.tipText3;
      let tipText4 = this.data.tipText4;
      let tipText5 = this.data.tipText5;
      let tipText6 = this.data.tipText6;

      /* canvas draw */
      let ctx = wx.createCanvasContext('cardCanvas', this);
      /* 绘制背景圆角白色矩形 */
      //绘制圆角--左上角
      ctx.arc(borderRadius, borderRadius + coachHeadImgWidth/2, borderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //绘制圆角--右上角
      ctx.arc(canvasWidth - borderRadius, borderRadius + coachHeadImgWidth / 2, borderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //绘制圆角--左下角
      ctx.arc(borderRadius, canvasHeight - borderRadius, borderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //绘制圆角--右下角
      ctx.arc(canvasWidth - borderRadius, canvasHeight - borderRadius, borderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //上边框
      ctx.moveTo(borderRadius, coachHeadImgWidth / 2)
      ctx.lineTo(canvasWidth - borderRadius, coachHeadImgWidth / 2)
      ctx.lineTo(canvasWidth, borderRadius + coachHeadImgWidth / 2)
      //右边框
      ctx.lineTo(canvasWidth, canvasHeight - borderRadius);
      ctx.lineTo(canvasWidth - borderRadius, canvasHeight);
      // 下边框
      ctx.lineTo(borderRadius, canvasHeight)
      ctx.lineTo(0, canvasHeight - borderRadius)
      // 左边框
      ctx.lineTo(0, borderRadius + coachHeadImgWidth / 2)
      ctx.lineTo(borderRadius, coachHeadImgWidth / 2)
      //关闭
      ctx.closePath()
      ctx.setFillStyle('#fff');
      ctx.fill();

      /* 教练信息 */
      //教练头像
      ctx.save()
      ctx.beginPath()
      let headImgX = (canvasWidth - coachHeadImgWidth)/2;
      ctx.arc(canvasWidth / 2, coachHeadImgWidth / 2, coachHeadImgWidth/2, 0, 2 * Math.PI);
      ctx.clip()
      ctx.drawImage(coachHeadImg, 0, 0, sCoachHeadImgWidth, sCoachHeadImgWidth, headImgX, 0, coachHeadImgWidth, coachHeadImgWidth);
      ctx.restore();
      //教练昵称
      ctx.setFontSize(36);
      ctx.setFillStyle('#141414');
      const coachNameWidth = ctx.measureText(this.data.cardData.coachName).width;//教练昵称宽度
      const coachNameX = (canvasWidth - coachNameWidth) / 2;
      const coachNameY = coachHeadImgWidth +42;
      ctx.fillText(this.data.cardData.coachName, coachNameX, coachNameY);

      /* 背景修饰图片 */
      //左边图片
      ctx.drawImage('/images/broadcast/bg_left.png', 0, 0, 318, 136, 0, 475, 209, 68);
      //右边图片
      ctx.drawImage('/images/broadcast/bg_right.png', 0, 0, 206, 284, canvasWidth-103, 150, 103, 142);

      /* 课程信息 */
      //课程名称
      ctx.setFontSize(28);
      ctx.setFillStyle('#141414');
      const courseNameWidth = ctx.measureText(this.data.cardData.courseName).width;//课程名称宽度
      const courseNameX = (canvasWidth - courseNameWidth) / 2;
      const courseNameY = coachNameY + 65;
      ctx.fillText(this.data.cardData.courseName, courseNameX, courseNameY);
      //课程时间
      ctx.setFontSize(28);
      ctx.setFillStyle('#141414');
      const courseDateTxt = util.formatTime2(this.data.cardData.beginDate) + ' 星期' + this.data.cardData.beginDay + '  ' + util.formatTime3(this.data.cardData.beginTime) +'-' + util.formatTime3(this.data.cardData.endTime);
      const courseDateTxtWith = ctx.measureText(courseDateTxt).width;
      const courseDateTxtX = (canvasWidth - courseDateTxtWith) / 2;
      const courseDateTxtY = courseNameY + 50;
      ctx.fillText(courseDateTxt, courseDateTxtX, courseDateTxtY);
      //二维码
      const qrcodeX = (canvasWidth - qrCodeWidth) / 2;
      const qrcodeY = courseDateTxtY+30;
      ctx.drawImage(qrCode, 0, 0, sQrCodeWidth, sQrCodeWidth, qrcodeX, qrcodeY, qrCodeWidth, qrCodeWidth);

      /* 使用信息 */
      //灰色背景
      const userInfoY = qrcodeY + qrCodeWidth + 20;
      ctx.setFillStyle('#F8F8F8')
      ctx.fillRect(0, userInfoY, canvasWidth, 120);
      //左边图片
      ctx.drawImage('/images/broadcast/down-pic.png', 0, 0, 240, 240, 40, userInfoY, 120, 120);
      //左边文字
      ctx.setFontSize(22);
      ctx.setFillStyle('#666666');
      ctx.fillText(tipText1, 167, userInfoY + 55);
      ctx.fillText(tipText2, 167, userInfoY+85);
      //中间箭头图片
      ctx.drawImage('/images/broadcast/arrow.png', 0, 0, 88, 90, (canvasWidth - 44)/2, userInfoY+38, 44, 45);
      //右边边图片
      ctx.drawImage('/images/broadcast/mobile.png', 0, 0, 240, 240, 380, userInfoY, 120, 120);
      //左边文字
      ctx.fillText(tipText3, 516, userInfoY + 55);
      ctx.fillText(tipText4, 516, userInfoY + 85);
      //'或'
      ctx.fillText(tipText5, (canvasWidth-20)/2, userInfoY +150);
      //下边文字
      ctx.fillText(tipText6,75, userInfoY + 180);

      //底部修饰图片
      ctx.drawImage('/images/broadcast/bg_bottom.png',0,0, 1300, 212,0,canvasHeight-106,650,106);

      /* 返回 */
      return new Promise((resolve, reject) => {
        ctx.draw(false, setTimeout(() => {
          resolve()
        }, 1000))
      }).catch((err) => {
        console.log('绘制canvas错误！')
        reject('绘制canvas错误！')
      })
    },


    //生成图片
    canvasToPic() {
      return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: this.data.width,
          height: this.data.height,
          destWidth: this.data.width,
          destHeight: this.data.height,
          canvasId: 'cardCanvas',
          fileType: 'png',
          quality: 1,
          success: (res) => {
            let tempFilePath = res.tempFilePath;
            this.setData({
              generateFilePath: tempFilePath
            })
            resolve(tempFilePath);
            /* //测试
            wx.redirectTo({
              url: `/pages/test/test?imgUrl=${tempFilePath}&width=${this.data.width}&height=${this.data.height}`,
            }) */
          },
          fail: (err) => {
            resolve('图片保存失败！')
            console.log('图片保存失败！')
            console.log(err)
          }
        }, this)
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
    //保存图片到系统相册
    saveImageToPhotosAlbum(url) {
      return new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: url,
          success: () => {
            ui.showToast('卡片已保存到相册')
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
              saveQrcodeBtnDisabled: false,
            })
          }
          /* fail: (err) => {
            console.error(err)
            ui.showToast('卡片保存失败')
            reject('卡片保存失败')
          } */
        })
      })
    }
  }
})