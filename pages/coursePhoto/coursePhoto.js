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
    photoUrl: '', //单张图片地址
    imgWidthScale: '750', //屏幕盒子宽度rpx
    scale: '', //屏幕和canvas缩放比例
    imgHeightScale: '', //屏幕图片的高度
    windowWidth:''//屏幕宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //加载中
    ui.showLoadingMask();
    //获取屏幕的宽度
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    this.setData({
      windowWidth
    })
    //获取参数
    courseId = options.courseId;
    //检测登录
    app.checkSessionFun().then(() => {
      this.getCourseFiles();
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
    let photoUrl;
    api.post('v2/course/getCourseFiles', form).then(res => {
      let photoUrls = res.msg;
      photoUrl = photoUrls ? photoUrls[photoUrls.length - 1] : '';
      //设置图片url
      this.setData({
        photoUrl,
      })
      return this.getImgWH(photoUrl);          
    })
    .then(resImgInfo => {
      //设置图片
      let imgInfo = this.setPhotoWH(resImgInfo, this.data.imgWidthScale);
      this.setData({
       // photoUrl,
        imgHeight: imgInfo.height, //原图片的高度
        imgWidth: imgInfo.width, //原图片的宽度
        imgHeightScale: imgInfo.heightScale, //屏幕图片的高度
      },()=>{
        ui.hideLoading();
      })
    })  
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

  //下载图片
  downloadPhoto() {
    ui.showLoadingMask('下载中...');
    this.networkUrlToLocal(this.data.photoUrl)
    .then(tempFilePath=>{
      return this.savePhoto(tempFilePath)
    })
    .then(()=>{
      ui.hideLoading();
    })
    .catch(error=>{
      ui.hideLoading();
    })    
  },

  //保存图片到系统相册
  savePhoto(tempFilePath) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success(res) {
          ui.showToast('图片保存成功')
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
                    console.log("settingdata", settingdata)
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
        }
/*         fail(err) {
          ui.showToast('保存失败：' + err)
          reject();
        } */
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


})