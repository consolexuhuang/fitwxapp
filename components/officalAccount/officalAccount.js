// components/officalAccount/officalAccount.js
const store = getApp().store;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    officialData:{
      type:null,
      value:{}
    },
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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showNoticeState: false, //关注弹窗显示
    officialData: '', //获取当前场景值对象
    guideImgUrl:''  //指引图片
  },
  lifetimes: {
    attached() {
      console.log('officalAccount',this.data)
      // // sub_flag 1:关注 0:未关注
      // if (store.getItem('userData') && store.getItem('userData').sub_flag === 0) {
      //   this.setData({ officialDataState: true })
      // } else if (store.getItem('userData') && store.getItem('userData').sub_flag === 1) {
      //   this.setData({ officialDataState: false })
      // }
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
          guideImgUrl: res.msg.imgurl1
        })
      })
      this.setData({ showNoticeState: true })
    },
    //关闭关注弹窗
    _onclose() {
      this.setData({ showNoticeState: false })
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
