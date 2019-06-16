// pages/invite/invite.js
const api = getApp().api
import Store from '../../utils/store.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userData: '',
    shareMemberId: '',
    shareCoupon: '',
    invitedInfo: '',
    qrcode: '',
    inviteMember: '',
    inviteQrcode: '',
    imgUrl: getApp().globalData.imgUrl,
    navbarData: {
      title: 'Justin&Julie',
      showCapsule: 0,
      isShowBackHome: false,
      titleColor: "#000",
      tab_topBackground:'#fff'
    },
    marginTopBar: getApp().globalData.tab_height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const shareMemberId = options.shareMemberId || ''
    this.setData({
      shareMemberId
    })
    
  },
  onShow(){
    const userData = Store.getItem('userData') || ''
    this.setData({ 
      userData
    })
    this.getShareCouponInfo()
    this.getQrcode()
    this.getInvitedInfo()
    this.getInviteMemberInfo()
    this.getInviteQrcode()
  },
  onShareAppMessage: function () {
    const title = this.data.shareCoupon.linkTitle
    const shareMemberId = this.data.invitedInfo.share_member_id
    return {
      title: title,
      path: '/pages/invite/inviteShare?shareMemberId=' + shareMemberId,
      imageUrl: '',
      success:function(res){
        console.log(res)
      },
      fail:function(res){
        console.log(res)
      }
    }
  },
  // 获取页面的数据及分享的配置参数
  getShareCouponInfo: function() {
    api.post('v2/coupon/shareCouponInfo').then(res => {
      console.log(res)
      const shareCoupon = res.msg
      this.setData({
        shareCoupon
      })
      this.getShareBgImg(res.msg.banner)
    })
  },
  // 获取邀请信息
  getInvitedInfo: function() {
    api.post('v2/member/getInvitedInfo').then(res => {
      const invitedInfo = res.msg
      this.setData({
        invitedInfo
      })
    })
  },
  // 获取带本人信息的二维码
  getQrcode: function() {
    api.post('getQrcode').then(res => {
      const qrcode = res.msg
      this.setData({
        qrcode
      })
      this.getCodeImg(res.msg)
    })
  },
  // 获取分享人的信息
  getInviteMemberInfo: function() {
    const shareMemberId = this.data.shareMemberId
    const data = {
      id: shareMemberId
    }
    api.post('v2/member/inviteMemberInfo', data).then(res => {
      const inviteMember = res.msg
      console.log(inviteMember)
      this.setData({
        inviteMember
      })
    })
  },
  handleInviteBtnTap: function(event) {
    wx.navigateTo({
      url: '/pages/invite/invite'
    })
  },
  handleReturnCourseTap: function(event) {
    wx.switchTab({
      url: '/pages/course/course',
    })
  },
  // 获取带分享者信息的二维码
  getInviteQrcode: function() {
    const shareMemberId = this.data.shareMemberId
    const data = {
      memberId: shareMemberId
    }
    api.post('getQrcode', data).then(res => {
      const inviteQrcode = res.msg
      this.setData({
        inviteQrcode
      })
    })
  },
  previewImage: function(event) {
    const current = event.target.dataset.src
    wx.previewImage({
      current: current,
      urls: [current]
    })
  },
  // 长摁识别
  distinguishImg() {
    this.setData({
      showShareState: true
    }, () => {
      this.showCanvas(this.data.postConfig.shareBgImg, this.data.postConfig.codeImg)
    })

  },
  // 关闭分享
  onCloseShareImg() {
    this.setData({
      showShareState: false
    })
  },
  /**
   * canvas
   */
  // 下载背景图
  getShareBgImg(banner) {
    let that = this;
    wx.downloadFile({
      url: banner,
      success: res => {
        // console.log(res)
        if (res.statusCode === 200) {
          let shareBgImg = res.tempFilePath;
          // that.getCodeImg(shareBgImg)
          this.setData({ ['postConfig.shareBgImg']: shareBgImg })
        } else {
          wx.showToast({
            title: '下载失败！',
            success: () => {
              let shareBgImg = ''
              // that.getCodeImg(shareBgImg)
              this.setData({ ['postConfig.shareBgImg']: shareBgImg })
            }
          })
        }
      },
      fail: res => {
        console.log(res)
      }
    })
  },
  //下载二维码
  getCodeImg(qrcode, count = 1, timer = null) {
    let that = this;
    wx.downloadFile({
      url: qrcode,
      success: res => {
        if (res.statusCode === 200) {
          let codeImg = res.tempFilePath;
          console.log('getCodeImg', codeImg)
          // that.showCanvas(shareBgImg, codeImg)
          this.setData({ ['postConfig.codeImg']: codeImg })
        } else {
          wx.showToast({
            title: '下载失败！',
            success: () => {
              let codeImg = ''
              // that.showCanvas(shareBgImg, codeImg)
              this.setData({ ['postConfig.codeImg']: codeImg })

            }
          })
        }
      },
      complete: res => {
        console.log(res)
        if (res.errMsg == 'downloadFile:fail Error: read ECONNRESET') {
          if (count == 10) {
            clearTimeout(timer)
          } else {
            timer = setTimeout(() => {
              count++
              this.getCodeImg(qrcode, count, timer)
            }, 1000)
          }
        }
      }
    })
  },
  /**
   * 2.创建画布
   */
  showCanvas(shareBgImg, codeImg) {
    wx.showLoading({ title: '海报生成中...' })
    let that = this;
    const ctx = wx.createCanvasContext('myCanvas'); //创建画布
    wx.createSelectorQuery().select('#canvas-container').boundingClientRect(function (rect) {
      console.log(rect)
      var height = rect.height;
      var width = rect.width;
      ctx.setFillStyle("#fff")
      ctx.fillRect(0, 0, width, height)
      //素材展示 所有的比例按照 750宽和 670高算
      if (shareBgImg) {
        ctx.drawImage(shareBgImg, 0, 0, width, height)
      }
      if (codeImg) {
        ctx.drawImage(codeImg, width / 22.7, height / 1.27, width / 7, width / 7)
      }
      //text
      ctx.setFontSize(height / 28)
      ctx.setTextAlign('left')
      ctx.setFillStyle("#fff")
      ctx.fillText('点击并保存分享', width / 22.7 + width / 7 + width / 47, height / 1.27 + width / 7 / 2 + height / 28 / 2)
      // ctx.stroke()
    }).exec()
    setTimeout(() => {
      ctx.draw()
      wx.hideLoading()
    }, 100)
  },
  /**
   * 3.保存本地
   */
  savePostLocation() {
    var that = this;
    wx.showLoading({ title: '正在保存', mask: true, })
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        fileType: 'jpg',
        success: function (res) {
          wx.hideLoading();
          var tempFilePath = res.tempFilePath;
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success: function (res) {
              console.log(res)
              wx.showModal({
                title: '提示',
                content: '您的推广海报已存入手机相册，赶快分享给好友吧',
                showCancel: false,
              })
            },
            fail: function (err) {
              console.log(err)
              // 防止用户禁止了授权,这须手动调起权限了
              if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
                // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存相册',
                  showCancel: false,
                  success: modalSuccess => {
                    wx.openSetting({
                      success(settingdata) {
                        console.log("settingdata", settingdata)
                        if (settingdata.authSetting['scope.writePhotosAlbum']) {
                          wx.showModal({
                            title: '提示',
                            content: '获取权限成功,再次确认即可保存',
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
                      fail(failData) {
                        console.log("failData", failData)
                      },
                      complete(finishData) {
                        console.log("finishData", finishData)
                      }
                    })
                  }
                })
              }
            }
          })
        }
      })
    })
  },
})