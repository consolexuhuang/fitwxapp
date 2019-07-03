// components/officalAccount/officalAccount.js
const store = getApp().store;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    officialDataState:{
      type:Boolean,
      value:false
    },
    memberFollowState:{
      type: null,
      value: 1
    },
    bottomStyle:{
      type:null,
      value:0
    },
    pageShowNoticeState:{
      type:Boolean,
      value:false
    },
    forcedEjection:{
      type:Boolean,
      value:false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showNoticeState: false, //关注弹窗显示
    guideImgUrl:''  //指引图片
  },
  observers:{
    'pageShowNoticeState': function(){
      if (this.data.pageShowNoticeState){
        getApp().api.post('v2/coupon/shareCouponInfo').then(res => {
          console.log('shareCouponInfo', res)
          this.setData({
            guideImgUrl: res.msg.imgurl2,
          })
        })
      }
    },
    'forcedEjection':function(){
      if (this.data.forcedEjection) {
        this.setData({
          showNoticeState: true
        })
      }
    }
  },
  lifetimes: {
    attached() {
      console.log('officalAccount',this.data)
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //显示关注弹窗
    _showNotice() {
      getApp().api.post('v2/coupon/shareCouponInfo').then(res => {
        // console.log(res)
        this.setData({
          guideImgUrl: this.data.pageShowNoticeState ? res.msg.imgurl2 : res.msg.imgurl1
        })
      })
      this.setData({ showNoticeState: true })
    },
    //关闭关注弹窗
    _onclose() {
      this.setData({ showNoticeState: false})
    },
    //关闭通知
    _closeguideLogin() {
      this.setData({ officialDataState: false })
    },
    //客服事件
    _handleContact(e) {
      this.setData({ showNoticeState: false })
    }, 
  }
})
