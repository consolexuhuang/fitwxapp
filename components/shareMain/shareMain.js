// components/shareMain/shareMain.js
const app = getApp();
const api = app.api;
const util = require('../../utils/util.js');
const ui = require('../../utils/ui.js');
let firstObservers = true;//是否第一次监听
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
    'isShow':function(val){
      if(val){
        ui.hideLoading();
      }
    },
    'cardData': function (val) {
      console.log('000')
      //生成图片        第二个memberHeadImg要改为二维码
      if (val.pic && val.memberHeadImg && val.memberHeadImg && firstObservers) {
        console.log('66666666666666666')
        this.generateCardPic();
        firstObservers=false;
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
    qrCodeWidth: 88, //二维码宽度
    addressWidth: 0, //真实地址宽度
    addressRowMaxWidth: 550 - 60 * 3, //可装地址的行宽
    addressIsTwoRow: false, //地址是否是2行
    generateFilePath:'',//canvas生成的图片
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
    init() {
    },

    //关闭弹层
    clickClose() {
      this.triggerEvent('closecard')
    },

    //保存卡片
    saveCard() {
      //loading
      ui.showLoadingMask();
      let generateFilePath = this.data.generateFilePath;
      
      if (generateFilePath){
        console.log('generateFilePath001')
        console.log(generateFilePath)
        this.saveImageToPhotosAlbum(generateFilePath)
        /* .then(()=>{
          ui.hideLoading()
        }); */
      }else{
        this.generateCardPic()
          .then((resTempFilePath)=>{
            generateFilePath = resTempFilePath;
          console.log('generateFilePath002')
          console.log(generateFilePath)
          return this.saveImageToPhotosAlbum(generateFilePath);
        })
        /* .then(() => {
          ui.hideLoading()
        }); */
      }
    },

    //生成卡片图片
    generateCardPic() {
      /* //测试
      this.setData({
        'cardData.address':'远程图片转本地图片后面只需要把第三个参数改为二维码就行了',
         'cardData.courseName':'barbie我们只能设置文本的最大宽度，这就产生一定的了问题'
      }) */
      //远程图片转本地图片（banner、头像、二维码）     后面只需要把第三个参数改为二维码就行了
    return Promise.all([this.remoteToLocal(this.data.cardData.pic), this.remoteToLocal(`${api.API_URI}redirect?url=${encodeURI(this.data.cardData.memberHeadImg)}`), this.remoteToLocal(`${api.API_URI}redirect?url=${encodeURI(this.data.cardData.memberHeadImg)}`), this.calAddressWidth(this.data.cardData.address)])
        .then((resArrImg) => {
          //banner
          let pic = resArrImg[0];
          let memberHeadImg = resArrImg[1];
          let qrCode = resArrImg[2];
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
      let addressWidth = this.data.addressWidth; //真实地址宽度
      let addressRowMaxWidth = this.data.addressRowMaxWidth; //可装地址的行宽
      let addressIsTwoRow = this.data.addressIsTwoRow;
      let addRowHeight = addressIsTwoRow ? infoSpaceTop : 0;

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
      //从banner里拿过来的图片690*330截取的x,y
      let imgSX = 143;
      let imgSY = 0;
      ctx.drawImage(pic, imgSX, imgSY, sPicWidth, sPicHeight, 0, 0, canvasWidth, picHeight);
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
      let beginTime = this.data.cardData.beginTime;
      let date = beginDate ? util.formatTime(beginDate).replace(/\//g, '-').split(' ')[0] : '';
      let time = beginTime ? util.formatTime3(beginTime).replace(/\//g, '-').split(' ')[0] : '';
      let dateTime = date + ' ' + time;
      //绘制图标
      ctx.drawImage('/images/icon/clock.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#999999');
      ctx.fillText(dateTime, infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + 25);

      //地址
      //绘制图标
      ctx.drawImage('/images/icon/address.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop + infoRowHeight, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#999999');
      let address = this.data.cardData.address;
      let row_address = this.textRow(ctx, address, addressRowMaxWidth);
      //1行
      if (row_address.length == 1) {
        ctx.fillText(row_address[0], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 25);
      }
      //2行
      else {
        ctx.fillText(row_address[0], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 25);
        ctx.fillText(row_address[1], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 60);
      }


      console.log('addRowHeight')
      console.log(addRowHeight)

      //教练
      //绘制图标
      ctx.drawImage('/images/icon/people.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop + infoRowHeight * 2 + addRowHeight, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#999999');
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
      ctx.setFillStyle('#333333');
      ctx.fillText(this.data.cardData.memberNickName, infoSpaceLeft + headImgWidth, headImgY);
      //提示语
      ctx.setFontSize(22);
      ctx.setFillStyle('#333333');
      ctx.fillText(this.data.tipText, infoSpaceLeft + headImgWidth, headImgY + 30);

      //二维码
      ctx.drawImage(qrCode, 0, 0, 132, 132, canvasWidth - qrCodeWidth - 30, headImgY - headImgR, qrCodeWidth, qrCodeWidth)

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
    calAddressWidth(address) {
      return new Promise((resolve, reject) => {
        let ctxAddress = wx.createCanvasContext('addressCanvas', this);
        //绘制文本
        ctxAddress.setFontSize(28);
        ctxAddress.fillText(address, 0, 0);
        //获取宽度
        let addressWidth = ctxAddress.measureText(address).width;
        if (addressWidth > this.data.addressRowMaxWidth) {
          this.setData({
            addressWidth,
            height: 828,
            addressIsTwoRow: true
          })
        } else {
          this.setData({
            addressWidth
          })
        }
        console.log('calAddressWidth')
        console.log(this.data)
        resolve();
      })

    },

    //生成图片
    canvasToPic() {
      return new Promise((resolve,reject)=>{
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
            resolve(res.path);
          },
          fail: (err) => {
            console.error(err)
            reject('远程图片转本地图片错误！')
          }
        })
      })
    },
   //保存图片到系统相册
    saveImageToPhotosAlbum(url){
      console.log('保存图片到系统相册')
      console.log(url)
     return new Promise((resolve,reject)=>{
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