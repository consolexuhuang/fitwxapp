// components/shareMain/shareMain.js
const app = getApp();
const api = app.api;
const util = require('../../utils/util.js');
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
  /**
   * 组件的初始数据
   */
  data: {
    width: 550, //canvas宽
    height: 786, //canvas高  2行地址高度828
    addlessByteLen: 0, //地址字节数
    sPicWidth: 560, //源图片宽度      后面确定好图片的尺寸后需要改sPicWidth、sPicHeight的值
    sPicHeight: 302, //源图片高度
    picHeight: 450, //绘制图片高度450
    borderRadius: 32, //矩形背景圆角
    picBorderRadius:60, //矩形背景圆角
    courseNameFontSizeScale: 15,//课程标题字体大小比例，课程名字体大小 width/courseNameFontSizeScale
    courseNameLineHeight:40,//一行标题的高度
    infoSpaceLeft:60,//3行信息距离左侧距离
    infoSpaceTop:30,//每行信息距离上一行距离
    iconScale: 18,//信息图标大小比例，大小 width/iconScale
    infoRowHeight:60,//每行信息高度
    headImgScale: 6.5,//头像大小比例，大小 width/headImgScal
    tipText:'分享课程，长按查看',
    qrCodeWidth:88,//二维码宽度
    addressWidth:0,//真实地址宽度
    addressRowMaxWidth: 550 - 60 * 3,//可装地址的行宽
    addressIsTwoRow:false,//地址是否是2行
  },
  /* 监听 */
  observers:{
    'cardData.address':function(val){
      

      //获取地址宽度，用来判断地址是一行还是2行，给canvas赋值对应的高度
      /* let address = val; */
      //测试
      let address = '后面的参数是实际的url，需要先encode一下你试一下这个接口，可以做跳转';
      if (address){
        console.log('observers')
        this.calAddressWidth(address);
      }
    }
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

    //计算地址的宽度
    calAddressWidth(address){
      let ctxAddress = wx.createCanvasContext('addressCanvas', this);
      //绘制文本
      ctxAddress.setFontSize(28);
      ctxAddress.fillText(address, 0, 0);
      //获取宽度
      let addressWidth = ctxAddress.measureText(address).width;
      console.log('calAddressWidth')
      console.log(addressWidth)
      console.log(this.data.addressRowMaxWidth)
      console.log(addressWidth > this.data.addressRowMaxWidth)
      if (addressWidth > this.data.addressRowMaxWidth){
        this.setData({
          addressWidth,
          height:828,
          addressIsTwoRow:true
        })
      }else{
        this.setData({
          addressWidth
        })
      }
      
    },

    //保存卡片
    saveCard() {
      //远程图片转本地图片（banner、头像、二维码）     后面只需要把第三个参数改为二维码就行了
      Promise.all([this.remoteToLocal(this.data.cardData.pic), this.remoteToLocal(`${api.API_URI}redirect?url=${encodeURI(this.data.cardData.memberHeadImg)}`), this.remoteToLocal(`${api.API_URI}redirect?url=${encodeURI(this.data.cardData.memberHeadImg)}`)])
        .then((resArrImg) => {
          //banner
          let pic = resArrImg[0];
          let memberHeadImg = resArrImg[1];
          let qrCode = resArrImg[2];
          //绘制canvas
          return this.drawCanvas(pic, memberHeadImg, qrCode)
        }).then(() => {
          //生成图片
          this.canvasToPic()
        })
        .catch((err) => {
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
      let courseNameWidth = canvasWidth - picBorderRadius*2;//课程标题宽度
      let courseNameLineHeight = this.data.courseNameLineHeight;
      let infoSpaceLeft = this.data.infoSpaceLeft;//3行信息距离左侧距离
      let infoSpaceTop = this.data.infoSpaceTop;//每行信息距离上一行距离
      let iconScale = this.data.iconScale;
      let infoRowHeight = this.data.infoRowHeight;
      let headImgScale = this.data.headImgScale;
      let qrCodeWidth = this.data.qrCodeWidth;
      let addressWidth = this.data.addressWidth;//真实地址宽度
      let addressRowMaxWidth = this.data.addressRowMaxWidth;//可装地址的行宽

      /* canvas draw */
      let ctx = wx.createCanvasContext('cardCanvas', this);  
      /* 绘制背景圆角白色矩形 */
      //绘制圆角--左上角
      ctx.arc(borderRadius, borderRadius, borderRadius, 0, 2 * Math.PI);      
      //关闭
      ctx.closePath()
      //绘制圆角--右上角
      ctx.arc( canvasWidth - borderRadius, borderRadius, borderRadius, 0, 2 * Math.PI);   
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
      //绘制图片
      ctx.clip();
      ctx.drawImage(pic, 0, 0, sPicWidth, sPicHeight, 0, 0, canvasWidth,picHeight);
      //渐变色
      let grd = ctx.createLinearGradient(canvasWidth / 2, 0, canvasWidth / 2, picHeight);
      grd.addColorStop(0, 'rgba(0,0,0,0)')
      grd.addColorStop(0.5, 'rgba(0,0,0,0)')
      grd.addColorStop(1,'rgba(0,0,0,1)')
      ctx.setFillStyle(grd) 
      ctx.fill();
      ctx.restore();
      //课程标题
      ctx.setFontSize(canvasWidth / courseNameFontSizeScale);
      ctx.setFillStyle('#fff');
      let courseName = this.data.cardData.courseName;
      /* //测试
      let courseName = 'barbie我们只能设置文本的最大宽度，这就产生一定的了问题'; */
      let row = this.textRow(ctx,courseName, courseNameWidth); 
      //1行
      if (row.length==1){
        ctx.fillText(row[0], picBorderRadius, picHeight - courseNameLineHeight);
      }
      //2行
      else{
        ctx.fillText(row[0], picBorderRadius, picHeight - courseNameLineHeight * 2 - 10);
        ctx.fillText(row[1], picBorderRadius, picHeight - courseNameLineHeight);
      }
      
      //时间
      let beginDate = this.data.cardData.beginDate;
      let beginTime = this.data.cardData.beginTime;
      let date = beginDate ? util.formatTime(beginDate).replace(/\//g,'-').split(' ')[0] : '';
      let time = beginTime ? util.formatTime3(beginTime).replace(/\//g, '-').split(' ')[0] : '';
      let dateTime = date + ' ' + time;
      //绘制图标
      ctx.drawImage('/images/icon/clock.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#999999');
      ctx.fillText(dateTime, infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop+25);

      //地址
      //绘制图标
      ctx.drawImage('/images/icon/address.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop + infoRowHeight, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#999999');  
      /* let address = this.data.cardData.address; */
      //测试
      let address = '后面的参数是实际的url，需要先encode一下你试一下这个接口，可以做跳转';
      let row_address = this.textRow(ctx, address, addressRowMaxWidth);
      //1行
      if (row_address.length==1){
        ctx.fillText(row_address[0], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 25);
      }
      //2行
      else{
        ctx.fillText(row_address[0], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 25);
        ctx.fillText(row_address[1], infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight + 55);
      }
      

      //教练
      //绘制图标
      ctx.drawImage('/images/icon/people.png', 0, 0, 56, 56, infoSpaceLeft, picHeight + infoSpaceTop + infoRowHeight*2, canvasWidth / iconScale, canvasWidth / iconScale);
      //绘制文本
      ctx.setFontSize(28);
      ctx.setFillStyle('#999999');
      ctx.fillText(this.data.cardData.coachName +'·教练', infoSpaceLeft + canvasWidth / iconScale + infoSpaceTop, picHeight + infoSpaceTop + infoRowHeight*2 + 25);

      /* 底部分享信息 */
      //会员头像
      ctx.save()
      ctx.beginPath()
      let headImgX = infoSpaceLeft+20;
      let headImgY = picHeight + infoSpaceTop * 3 + infoRowHeight * 3;
      let headImgWidth = canvasWidth / headImgScale;
      let headImgR = headImgWidth / 2;
      ctx.arc(headImgX, headImgY, headImgR, 0, 2*Math.PI);
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
      ctx.fillText(this.data.tipText, infoSpaceLeft + headImgWidth, headImgY+30);

      //二维码
      ctx.drawImage(qrCode, 0, 0, 132, 132, canvasWidth - qrCodeWidth-30, headImgY - headImgR, qrCodeWidth, qrCodeWidth)

      /* 返回 */
      return new Promise((resolve, reject) => {
        ctx.draw(false, setTimeout(() => {
          resolve()
        }, 1000))
      }).catch((err) => {
        console.log('绘制canvas错误！')
        reject(err)
      })
    },
   //计算文字宽度
    textRow(ctx,textString,stringWidth){
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

    //生成图片
    canvasToPic() {
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
          wx.redirectTo({
            url: `/pages/test/test?imgUrl=${tempFilePath}&width=${this.data.width}&height=${this.data.height}`,
          })
        },
        fail: (err) => {
          console.log('图片保存失败！')
          console.log(err)
        }
      }, this)
    },
    //远程图片转本地图片
    remoteToLocal(url) {
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: url,
          success: (res) => {
            console.log('res getimageinfo')
            console.log(res)
            resolve(res.path);
          },
          fail: (err) => {
            console.log('远程图片转本地图片错误！')
            reject(err)
          }
        })
      })
    },
    //头像微信http路径转为自己的路径
    transformUrl() {
      let url = encodeURI(this.data.cardData.memberHeadImg)
      api.get(`redirect?url=${url}`).then((res)=>{
        console.log('res url')
        console.log(res)
        this.remoteToLocal(res)
      })
    }
  }
})