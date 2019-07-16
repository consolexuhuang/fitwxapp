const app = getApp();
const api = app.api;
const ui = require('../../utils/ui.js');
let courseId, orderNum, shareMemberId;

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
    //memberData: {}, //会员信息
    storeName: '', //店铺名
    photoUrl: '', //单张图片地址
    qrCodeUrl: '', //二维码地址
    boxWidth: '', //canvas宽
    boxHeight: '', //canvas高
    boxWidthScale: '686', //屏幕盒子宽度rpx
    boxHeightScale: '', //屏幕盒子高度度rpx
    /* boxWidthPx: '', //盒子宽度px
    boxHeightPx: '', //盒子高度px */
    pxToRpxScale: '', //rpx和px比例
    scale: '', //屏幕和canvas缩放比例
    imgHeight: '', //原图片的高度
    imgWidth: '', //原图片的宽度
    imgHeightScale: '', //屏幕图片的高度
    rowHeightScale: '90', //信息行的高度
    rowPaddingScale: '23', //信息行的间距
    qrCodeWidth: '', //原二维码宽度
    qrCodeHeight: '', //原二维码高度
    qrCodeWidthScale: '82', //二维码宽度
    qrCodeHeightScale: '82', //二维码高度
    qrCodeScaleX: '', //二维码x
    qrCodeScaleY: '', //二维码Y
    shopNameScaleX: '', //店铺x
    shopNameScaleY: '', //店铺Y
    shopNameFontSize: '32', //店铺名称字体大小
    advText: '扫码和我一起变瘦变美',
    advFontSize: '20', //广告语字体大小
    advScaleX: '', //广告语x
    advScaleY: '', //广告语Y
    iconArrowFontsize: '14', //小箭头尺寸
    iconArrowMarginLeft: '10', //小箭头左间距
    iconArrowScaleX: '', //小箭头x
    iconArrowScaleY: '', //小箭头Y
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //加载中
    ui.showLoadingMask();
    //获取参数
    courseId = options.courseId;
    orderNum = options.orderNum;
    shareMemberId = options.shareMemberId;

    //检测登录
    app.checkSessionFun().then(() => {
      let pxToRpxScale, photoBoxX, photoBoxY;
      Promise.all([this.getCourseFiles(), this.getMemberData(), this.getOrderInfo(), this.getPxToRpxScale()])
        .then(() => {
          pxToRpxScale = this.data.pxToRpxScale;
          //获取photoBox位置信息
          return this.queryElementInfo('photoBox');
        })
        .then(rect => {
          photoBoxX = rect.left;
          photoBoxY = rect.top;
          //获取shopeName位置信息
          this.queryElementInfo('shopeName').then(rectShopeName => {
            let shopNameScaleX = (rectShopeName.left - photoBoxX) * pxToRpxScale;
            let shopNameScaleY = (rectShopeName.top - photoBoxY) * pxToRpxScale;
            this.setData({
              shopNameScaleX,
              shopNameScaleY,
            })
            console.log('rectShopeName rect')
            console.log(rectShopeName)
            console.log('shoppname')
            console.log(this.data)
          });
          //获取adv位置信息
          this.queryElementInfo('adv').then(rectAdv => {
            let advScaleX = (rectAdv.left - photoBoxX) * pxToRpxScale;
            let advScaleY = (rectAdv.top - photoBoxY) * pxToRpxScale;
            this.setData({
              advScaleX,
              advScaleY,
            })
          });
          //获取二维码位置信息
          this.queryElementInfo('qrcode').then(rectQrcode => {
            let qrCodeScaleX = (rectQrcode.left - photoBoxX) * pxToRpxScale;
            let qrCodeScaleY = (rectQrcode.top - photoBoxY) * pxToRpxScale;
            this.setData({
              qrCodeScaleX,
              qrCodeScaleY,
            })
          });
          //获取小箭头位置信息
          this.queryElementInfo('arrow').then(rectIconArrow => {
            let iconArrowScaleX = (rectIconArrow.left - photoBoxX) * pxToRpxScale;
            let iconArrowScaleY = (rectIconArrow.top - photoBoxY) * pxToRpxScale;
            this.setData({
              iconArrowScaleX,
              iconArrowScaleY,
            })
            ui.hideLoading()
          });
        })
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 自定义函数--监听页面隐藏
   */
  //获取课程图片
  getCourseFiles() {
    let form = {
      courseId: courseId
    }
    let photoUrl, imgInfo;
    return api.post('v2/course/getCourseFiles', form).then(res => {
      let photoUrls = res.msg;
      photoUrl = photoUrls ? photoUrls[photoUrls.length - 1] : '';
      //获取图片的宽高
      return Promise.all([this.getImgWH(photoUrl), this.networkUrlToLocal(photoUrl)]);
    }).then(resArr => {
      let resImgInfo = resArr[0];
      photoUrl = resArr[1];
      //设置图片
      let imgInfo = this.setPhotoWH(resImgInfo, this.data.boxWidthScale);
      this.setData({
        photoUrl,
        scale: imgInfo.scale,
        imgHeight: imgInfo.height, //原图片的高度
        imgWidth: imgInfo.width, //原图片的宽度
        imgHeightScale: imgInfo.heightScale, //屏幕图片的高度
        boxHeightScale: Number(imgInfo.heightScale) + Number(this.data.rowHeightScale)
      }, () => {
        return;
      })
    })
  },
  // 把网络图片改成临时路径
  networkUrlToLocal(netWorkUrl) {
    return new Promise((resolve, reject) => {
      if (!netWorkUrl) {
        resolve('');
      };
      wx.downloadFile({
        url: netWorkUrl, //网络路径
        success: (res3) => {
          resolve(res3.tempFilePath)
        },
        fail: () => {
          reject()
        }
      })
    })

  },
  //获取分享二维码
  getMemberData() {
    let form = {}
    form.shareMemberId = shareMemberId;
    let qrCodeUrl;
    //return new Promise((resolve, reject) => {
     return api.post('member/memberShow', form).then(ret => {
        qrCodeUrl = ret.msg.qrCode;
        //获取图片的宽高
       return Promise.all([this.getImgWH(qrCodeUrl), this.networkUrlToLocal(qrCodeUrl)]);
     }).then(resArr => {
        let resImgInfo = resArr[0];
       qrCodeUrl = resArr[1];
        //设置图片
        this.setData({
          qrCodeUrl,
          qrCodeWidth: resImgInfo.width, //原二维码宽度
          qrCodeHeight: resImgInfo.height, //原二维码高度
        }, () => {
          return;
          //resolve();
        })
      })
   // })
  },
  //获取订单信息
  getOrderInfo() {
    let form = {}
    form.orderNum = orderNum
   // return new Promise((resolve, reject) => {
      api.post('payOrder/orderInfo', form).then(ret => {
        this.setData({
          storeName: ret.msg.store.storeName
        }, () => {
          //resolve();
          return;
        })

      })
   // })
  },

  //获取图片的宽高
  getImgWH(imgsrc) {
    return new Promise((resolve, reject) => {
      //获取图片信息
      wx.getImageInfo({
        src: imgsrc,
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject()
        }
      })
    })
  },
  //设置图片
  setPhotoWH(res, widthScale) { //widthScale屏幕上显示的宽度
    let width = res.width;
    let height = res.height;
    let heightScale, scale;
    //计算宽高
    scale = width / widthScale;
    heightScale = height / scale;
    return {
      width,
      height,
      scale,
      heightScale,
    }
  },
  //获取元素的信息
  queryElementInfo(elemId) {
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery().select('#' + elemId).boundingClientRect((rect) => {
        resolve(rect);
      }).exec(() => {

      })
    })
  },

  //获取到px转化为rpx比例
  getPxToRpxScale() {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success: (res) => {
          let pxToRpxScale = 750 / res.windowWidth;
          this.setData({
            pxToRpxScale
          })
          resolve();
        }
      })
    })
  },

  //画图片
  canva() {
    let boxHeight = (Number(this.data.boxHeightScale) + Number(this.data.rowPaddingScale)) * this.data.scale;
    //计算盒子的宽高
    this.setData({
      boxWidth: this.data.imgWidth, //canvas宽
      boxHeight: boxHeight, //canvas高
    })
    let canva = wx.createCanvasContext('photoCanva');
    //画图片
    canva.drawImage(this.data.photoUrl, 0, 0, this.data.imgWidth, this.data.imgHeight, 0, 0, this.data.imgWidth, this.data.imgHeight);

    console.log('widht:' + this.data.imgWidth)
    console.log('height:' + this.data.imgHeight)

    //店铺名称
    let shopeNameX = this.data.shopNameScaleX * this.data.scale;
    let shopeNameY = this.data.shopNameScaleY * this.data.scale + 30;
    let shopNameFontSize = this.data.shopNameFontSize * this.data.scale;
    canva.setFontSize(shopNameFontSize);
    canva.setFillStyle('#464646');
    canva.fillText(this.data.storeName, shopeNameX, shopeNameY); //this.data.storeName

    console.log('shopeNameY')
    console.log(this.data)
    console.log(shopeNameY)

    //广告语
    let advX = this.data.advScaleX * this.data.scale;
    let advY = this.data.advScaleY * this.data.scale;
    let advFontSize = this.data.advFontSize * this.data.scale;
    canva.setFontSize(advFontSize);
    canva.setFillStyle('#5a5a5a');
    canva.fillText(this.data.advText, advX, advY); //this.data.advText

    //箭头
    let iconArrowWidth = 25;
    let iconArrowHeight = 25;
    let iconArrowX = this.data.iconArrowScaleX * this.data.scale + 15;
    let iconArrowY = this.data.iconArrowScaleY * this.data.scale - 30;
    canva.moveTo(iconArrowX, iconArrowY)
    canva.lineTo(iconArrowX, iconArrowY + iconArrowHeight)
    canva.lineTo(iconArrowX + iconArrowHeight / 2, iconArrowY + iconArrowHeight / 2)
    canva.setFillStyle('#464646')
    canva.fill()

    //二维码
    let qrCodeWidth = this.data.qrCodeWidthScale * this.data.scale;
    let qrCodeHeight = this.data.qrCodeHeightScale * this.data.scale;
    let qrcodeX = this.data.qrCodeScaleX * this.data.scale;
    let qrcodeY = this.data.qrCodeScaleY * this.data.scale - 20;
    canva.drawImage(this.data.qrCodeUrl, 0, 0, this.data.qrCodeWidth, this.data.qrCodeHeight, qrcodeX, qrcodeY, qrCodeWidth, qrCodeHeight);

    canva.draw(true, () => {
      this.canvasToTempFilePath().then(res => {
        //resolve(res)
      })
    });

  },

  //canvas保存文件路径
  canvasToTempFilePath() {
    //导出图片
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: this.data.boxWidth,
        height: this.data.boxHeight,
        destWidth: this.data.boxWidth,
        destHeight: this.data.boxHeight,
        canvasId: 'photoCanva',
        fileType: 'jpg',
        quality: 1,
        success: (res) => {
          resolve(res);
          //保存图片到本地
          this.savePhoto(res.tempFilePath)

          //测试
          /* wx.navigateTo({
            url: `/pages/test/test?imgUrl=${res.tempFilePath}&width=${this.data.boxWidthScale}&height=${this.data.boxHeightScale}`,
          }) */
        },
        fail: (err) => {
          ui.showToast('canvas保存文件路径出错')
          reject();
        },
        complete: () => {

        }
      })
    })

  },


  //保存图片到系统相册
  savePhoto(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success(res) {
        ui.showToast('图片保存成功')
        ui.hideLoading();
      },
      fail(err){
        ui.showToast('保存失败：'+err)
        ui.hideLoading();
      }
    })
  },

  //下载图片
  downloadPhoto() {
    ui.showLoadingMask('下载中...');
    //画图片
    this.canva()
  },

})