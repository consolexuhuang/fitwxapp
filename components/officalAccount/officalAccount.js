// // components/officalAccount/officalAccount.js
// Component({
//   /**
//    * 组件的属性列表
//    */
//   properties: {
//     officialData:{
//       // value:''
//     },
//     officialDataState:{
//       type:Boolean,
//       value:false
//     },
//     memberFollowState:{
//       value: 1
//     }
//   },

//   /**
//    * 组件的初始数据
//    */
//   data: {
//     showNoticeState: false, //关注弹窗显示
//   },
//   lifetimes: {
//     attached() {
//       console.log('officalAccount',this.data)
//     }
//   },
//   /**
//    * 组件的方法列表
//    */
//   methods: {
//     //显示关注弹窗
//     _showNotice() {
//       this.setData({ showNoticeState: true })
//     },
//     //关闭关注弹窗
//     _onclose() {
//       this.setData({ showNoticeState: false })
//     },
//     //关闭通知
//     _closeguideLogin() {
//       this.setData({ officialDataState: false })
//     },
//     //客服事件
//     _handleContact(e) {
//       this.setData({ showNoticeState: false })
//     }, 
//   }
// })
