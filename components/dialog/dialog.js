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
    },
    maskIsClose:{//点击蒙版是否可以关掉弹层
      type:Boolean,
      value: true
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
      if (this.data.maskIsClose){
        this.setData({
          show: false
        })
      }
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