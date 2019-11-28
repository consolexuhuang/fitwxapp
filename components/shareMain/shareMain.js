// components/shareMain/shareMain.js
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
    'isShow': function(val) {
      if (val) {
        ui.hideLoading();
      }
    },
    'cardData': function(val) {
      console.log('000')
      //生成图片        第二个memberHeadImg要改为二维码
      if (val.pic && val.memberHeadImg && val.qrCode && firstObservers) {
        console.log('66666666666666666')
        this.generateCardPic();
        firstObservers = false;
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    width: 550, //canvas宽
    height: 786, //canvas高  2行地址高度828
    addlessByteLen: 0, //地址字节数
    sPicWidth: 690, //源图片宽度      后面确定好图片的尺寸后需要改sPicWidth、sPicHeight的值
    sPicHeight: 330, //源图片高度
    picHeight: 450, //绘制图片高度450
    borderRadius: 32, //矩形背景圆角
    picBorderRadius: 60, //矩形背景圆角
    courseNameFontSizeScale: 15, //课程标题字体大小比例，课程名字体大小 width/courseNameFontSizeScale
    courseNameLineHeight: 40, //一行标题的高度
    infoSpaceLeft: 60, //3行信息距离左侧距离
    infoSpaceTop: 30, //每行信息距离上一行距离
    iconScale: 18, //信息图标大小比例，大小 width/iconScale
    infoRowHeight: 60, //每行信息高度
    headImgScale: 6.5, //头像大小比例，大小 width/headImgScal
    tipText: '分享课程，长按查看',
    sQrCodeWidth: '', //源二维码宽度
    qrCodeWidth: 88, //二维码宽度
    storeNameWidth: 0, //真实地址宽度
    storeNameRowMaxWidth: 550 - 60 * 3, //可装地址的行宽
    storeNameIsTwoRow: false, //地址是否是2行
    generateFilePath: '', //canvas生成的图片
  },
  lifetimes: {
    ready: function() {
      // 在组件实例进入页面节点树时执行
      this.init();
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  ready: function() {
    // 在组件实例进入页面节点树时执行
    this.init();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init() {},

    //关闭弹层
    clickClose() {
      this.triggerEvent('closecard')
    },

    //保存卡片授权头像信息
    bindgetuserinfo(ev){

      //同意授权
      if (ev.detail.userInfo) {
        this.agreeGetUserInfo(ev)
      }
      //拒绝,再次弹层
      else{
        wx.getUserInfo({
          success: (res) => {
            this.agreeGetUserInfo(res)
          },
          fail: () => {
            console.log('拒绝授权')
          }
        })
      }
      
    },
    //同意授权
    agreeGetUserInfo(res){
      let userInfo = res.detail.userInfo;
      let memberHeadImg = userInfo.avatarUrl;
        //设置头像
        this.setData({
          'cardData.memberHeadImg': userInfo.avatarUrl,
          'cardData.memberNickName': userInfo.nickName
        });
        //保存卡片信息完整
        this.cardInfoRight();
        //缓存数据
        Store.setItem('wx_userInfo', userInfo)
      
    },

    //保存卡片
    saveCard() {   
      //保存卡片信息完整
      this.cardInfoRight();
    },
    //保存卡片信息完整
    cardInfoRight(){
      if (this.data.cardData.memberHeadImg && this.data.cardData.qrCode && this.data.cardData.pic) {
        console.log('card0009')
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
      /* //测试
      this.setData({
        'cardData.storeName':'远程图片转本地图片后面只需要把第三个参数改为二维码就行了',
         'cardData.courseName':'barbie我们只能设置文本的最大宽度，这就产生一定的了问题'
      }) */
      //远程图片转本地图片（banner、头像、二维码）     后面只需要把第三个参数改为二维码就行了
      return Promise.all([this.remoteToLocal(this.data.cardData.pic), this.remoteToLocal(`${api.API_URI}redirect?url=${encodeURI(this.data.cardData.memberHeadImg)}`), this.remoteToLocal(this.data.cardData.qrCode), this.calStoreNameWidth(this.data.cardData.storeName)])
        .then((resArrImg) => {
          //banner
          let pic = resArrImg[0].path;
          let memberHeadImg = resArrImg[1].path;
          let qrCode = resArrImg[2].path;
          //设置源二维码图片的宽度
          this.setData({
            sQrCodeWidth: resArrImg[2].width
          })
          //绘制canvas
          return this.drawCanvas(pic, memberHeadImg, qrCode)
        }).then(() => {
          //生成图片
          return this.canvasToPic()
        })
        .catch((err) => {
          ui.showToast(err);
          console.log(err)
        })
    },

    //绘制canvas
    drawCanvas(pic, memberHeadImg, qrCode) {
      console.log('setData000')
      console.log(this.data)
      let canvasWidth = this.data.width;
      let canvasHeight = this.data.height;
      let borderRadius = this.data.borderRadius;
      let sPicWidth = this.data.sPicWidth; //源图片宽度
      let sPicHeight = this.data.sPicHeight; //源图片高度
      let picHeight = this.data.picHeight;
      let picBorderRadius = this.data.picBorderRadius;
      let courseNameFontSizeScale = this.data.courseNameFontSizeScale;
      let courseNameWidth = canvasWidth - picBorderRadius * 2; //课程标题宽度
      let courseNameLineHeight = this.data.courseNameLineHeight;
      let infoSpaceLeft = this.data.infoSpaceLeft; //3行信息距离左侧距离
      let infoSpaceTop = this.data.infoSpaceTop; //每行信息距离上一行距离
      let iconScale = this.data.iconScale;
      let infoRowHeight = this.data.infoRowHeight;
      let headImgScale = this.data.headImgScale;
      let qrCodeWidth = this.data.qrCodeWidth;
      let storeNameWidth = this.data.storeNameWidth; //真实地址宽度
      let storeNameRowMaxWidth = this.data.storeNameRowMaxWidth; //可装地址的行宽
      let storeNameIsTwoRow = this.data.storeNameIsTwoRow;
      let addRowHeight = storeNameIsTwoRow ? infoSpaceTop : 0;
      let sQrCodeWidth = this.data.sQrCodeWidth;

      /* canvas draw */
      let ctx = wx.createCanvasContext('cardCanvas', this);
      /* 绘制背景圆角白色矩形 */
      //绘制圆角--左上角
      ctx.arc(borderRadius, borderRadius, borderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //绘制圆角--右上角
      ctx.arc(canvasWidth - borderRadius, borderRadius, borderRadius, 0, 2 * Math.PI);
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
      ctx.moveTo(borderRadius, 0)
      ctx.lineTo(canvasWidth - borderRadius, 0)
      ctx.lineTo(canvasWidth, borderRadius)
      //右边框
      ctx.lineTo(canvasWidth, canvasHeight - borderRadius);
      ctx.lineTo(canvasWidth - borderRadius, canvasHeight);
      // 下边框
      ctx.lineTo(borderRadius, canvasHeight)
      ctx.lineTo(0, canvasHeight - borderRadius)
      // 左边框
      ctx.lineTo(0, borderRadius)
      ctx.lineTo(borderRadius, 0)
      //关闭
      ctx.closePath()
      ctx.setFillStyle('#fff');
      ctx.fill();

      /* 绘制顶部渐变圆角图片 */
      ctx.save();
      ctx.beginPath();
      //裁切圆角图片用的圆角矩形
      //绘制圆角--左上角
      ctx.arc(borderRadius, borderRadius, borderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //绘制圆角--右上角
      ctx.arc(canvasWidth - borderRadius, borderRadius, borderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //绘制圆角--左下角
      ctx.arc(picBorderRadius, picHeight - picBorderRadius, picBorderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //绘制圆角--右下角
      ctx.arc(canvasWidth - picBorderRadius, picHeight - picBorderRadius, picBorderRadius, 0, 2 * Math.PI);
      //关闭
      ctx.closePath()
      //上边框
      ctx.moveTo(borderRadius, 0)
      ctx.lineTo(canvasWidth - borderRadius, 0)
      ctx.lineTo(canvasWidth, borderRadius)
      //右边框
      ctx.lineTo(canvasWidth, picHeight - picBorderRadius);
      ctx.lineTo(canvasWidth - picBorderRadius, picHeight);
      // 下边框
      ctx.lineTo(picBorderRadius, picHeight)
      ctx.lineTo(0, picHeight - picBorderRadius)
      // 左边框
      ctx.lineTo(0, borderRadius)
      ctx.lineTo(borderRadius, 0)
      //关闭
      ctx.closePath();
      ctx.setFillStyle('#fff');
      ctx.fill();
      //绘制图片
      ctx.clip();
      //banner图片高度不够
      let dh = picHeight / sPicHeight;
      ctx.drawImage(pic, (sPicWidth - canvasWidth / dh) / 2, 0, canvasWidth / dh, sPicHeight, 0, 0, canvasWidth, picHeight);
      //渐变色
      let grd = ctx.createLinearGradient(canvasWidth / 2, 0, canvasWidth / 2, picHeight);
      grd.addColorStop(0, 'rgba(0,0,0,0)')
      grd.addColorStop(0.5, 'rgba(0,0,0,0)')
      grd.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.setFillStyle(grd)
      ctx.fill();
      ctx.restore();
      //课程标题
      ctx.setFontSize(canvasWidth / courseNameFontSizeScale);
      ctx.setFillStyle('#fff');
      let courseName = this.data.cardData.courseName;
      let row = this.textRow(ctx, courseName, courseNameWidth);
      //1行
      if (row.length == 1) {
        ctx.fillText(row[0], picBorderRadius, picHeight - courseNameLineHeight);
      }
      //2行
      else {
        ctx.fillText(row[0], picBorderRadius, picHeight - courseNameLineHeight * 2 - 10);
        ctx.fillText(row[1], picBorderRadius, picHeight - courseNameLineHeight);
      }

      //时间
      let beginDate = this.data.cardData.beginDate;
      let beginDay = this.data.cardData.beginDay;
      let beginTime = this.data.cardData.beginTime;
      let endTime = this.data.cardData.endTime;
      let date = beginDate ? util.formatTime(beginDate).replace(/\//g, '-').split(' ')[0] : '';
      let beginTimeFormat = beginTime ? util.formatTime3(beginTime).replace(/\//g, '-').split(' ')[0] : '';
      let endTimeFormat = endTime ? util.formatTime3(endTime).replace(/\//g, '-').split(' ')[0] : '';
      let dateTime = date + ' 周' + beginDay + ' ' + beginTimeFormat + '-' + endTimeFormat;
      //绘制图标
      ctx.drawImage('/images/icon/clock.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#333333');
      ctx.fillText(dateTime, infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + 25);

      //地址
      //绘制图标
      ctx.drawImage('/images/icon/address.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop + infoRowHeight, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#333333');
      let storeName = this.data.cardData.storeName;
      let row_storeName = this.textRow(ctx, storeName, storeNameRowMaxWidth);
      //1行
      if (row_storeName.length == 1) {
        ctx.fillText(row_storeName[0], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 25);
      }
      //2行
      else {
        ctx.fillText(row_storeName[0], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 25);
        ctx.fillText(row_storeName[1], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 60);
      }


      console.log('addRowHeight')
      console.log(addRowHeight)

      //教练
      //绘制图标
      ctx.drawImage('/images/icon/people.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop + infoRowHeight * 2 + addRowHeight, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#333333');
      ctx.fillText(this.data.cardData.coachName + '·教练', infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight * 2 + 25 + addRowHeight);

      /* 底部分享信息 */
      //会员头像
      ctx.save()
      ctx.beginPath()
      let headImgX = infoSpaceLeft + 20;
      let headImgY = picHeight + infoSpaceTop * 3 + infoRowHeight * 3 + addRowHeight;
      let headImgWidth = canvasWidth / headImgScale;
      let headImgR = headImgWidth / 2;
      ctx.arc(headImgX, headImgY, headImgR, 0, 2 * Math.PI);
      ctx.clip()
      ctx.drawImage(memberHeadImg, 0, 0, 132, 132, headImgX - headImgR, headImgY - headImgR, headImgWidth, headImgWidth)
      ctx.restore();
      //会员昵称
      ctx.setFontSize(32);
      ctx.setFillStyle('#999999');
      ctx.fillText(this.data.cardData.memberNickName, infoSpaceLeft + headImgWidth, headImgY);
      //提示语
      ctx.setFontSize(22);
      ctx.setFillStyle('#999999');
      ctx.fillText(this.data.tipText, infoSpaceLeft + headImgWidth, headImgY + 30);

      //二维码   图片尺寸缩放
      let dwQrcode = qrCodeWidth / sQrCodeWidth;
      ctx.drawImage(qrCode, 0, 0, sQrCodeWidth, qrCodeWidth / dwQrcode, canvasWidth - qrCodeWidth - 30, headImgY - headImgR, qrCodeWidth, qrCodeWidth)

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

    //给文字分组
    textRow(ctx, textString, stringWidth) {
      /* //测试
      let textString = 'barbie我们只能设置文本的最大宽度，这就产生一定的了问题'; */
      let chr = textString ? textString.split("") : [];
      let temp = "";
      let row = [];
      for (let a = 0; a < chr.length; a++) {
        if (ctx.measureText(temp).width < stringWidth) {
          temp += chr[a]
        } else {
          a--;
          row.push(temp);
          temp = "";
        }
      }
      row.push(temp);
      return row;
    },
    //计算地址的宽度
    calStoreNameWidth(storeName) {
      return new Promise((resolve, reject) => {
        let ctxStoreName = wx.createCanvasContext('storeNameCanvas', this);
        //绘制文本
        ctxStoreName.setFontSize(28);
        ctxStoreName.fillText(storeName, 0, 0);
        //获取宽度
        let storeNameWidth = ctxStoreName.measureText(storeName).width;
        if (storeNameWidth > this.data.storeNameRowMaxWidth) {
          this.setData({
            storeNameWidth,
            height: 828,
            storeNameIsTwoRow: true
          })
        } else {
          this.setData({
            storeNameWidth
          })
        }
        console.log('calStoreNameWidth')
        console.log(this.data)
        resolve();
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
            console.log('canvasToTempFilePath')
            console.log(res)
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
      console.log('远程图片转本地图片')
      console.log(url)
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: url,
          success: (res) => {
            console.log('res getimageinfo')
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
    //保存图片到系统相册
    saveImageToPhotosAlbum(url) {
      console.log('保存图片到系统相册')
      console.log(url)
      return new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: url,
          success: () => {
            ui.showToast('卡片已保存到相册')
            resolve();
          },
          fail: (err) => {
            console.error(err)
            ui.showToast('卡片保存失败')
            reject('卡片保存失败')
          }
        })
      })
    }
  }
})