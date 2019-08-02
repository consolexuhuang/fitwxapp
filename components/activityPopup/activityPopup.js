// components/activityPopup/activityPopup.js
const store = getApp().store;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    activityPopupState:{
      type:Object,
      value:{}
    },
    nowGetTime: {
      type: null,
      value: 0
    }
  },
  
  /**
   * 组件的初始数据
   */
  data: {
  },
  observers: {
    'nowGetTime': function () {
      console.log(this.data.nowGetTime - store.getItem('closeTime') || new Date().getTime())
      if ((this.data.nowGetTime - store.getItem('closeTime') || new Date().getTime()) > 10000) {
        console.log('activityPopupState', this.data)
        this.setData({
          ['activityPopupState.state']: true,
        })
      } else {
        // console.log('asas')
        console.log('activityPopupState', this.data)
        this.setData({
          ['activityPopupState.state']: false,
        })
      }
    }
  },
  lifetimes: {
    attached() {
      // console.log('activityPopupState', this.data.activityPopupState)
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _onclose(){
      // console.log(new Date().getTime() 86400000)
      console.log('activityPopupState', this.data)
      store.setItem('closeTime', new Date().getTime())
      this.setData({
        ['activityPopupState.state']: false,
      })
    },
    giveGiftCard() {
      this.triggerEvent('giveGiftCardEvent', {}, {})
    },
  }
})
