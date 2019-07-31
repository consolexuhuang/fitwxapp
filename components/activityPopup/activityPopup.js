// components/activityPopup/activityPopup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    activityPopupState:{
      type:Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    onclose(){
      this.setData({
        ['activityPopupState.state']: false
      })
    },
    giveGiftCard() {
      this.triggerEvent('giveGiftCardEvent', {}, {})
    },
  }
})
