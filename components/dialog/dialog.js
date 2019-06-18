// components/dialog/dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    dialogConfig: {
      type: Object,
      value: {}
    },
    imgUrl: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  lifetimes: {
    attached() {
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _clickMeban() {
      this.setData({
        show: false
      })
    },
    _cancleEvent() {
      this.setData({
        show: false
      })
    },
    cancleEvent() {
      this.triggerEvent('cancleEventComp', {}, {})
    },
    comfirmEvent() {
      this.triggerEvent('comfirmEventComp', {}, {})
    }
  }
})