// components/shareTag/shareTag.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shareButton:{//是否是原生显示的分享按钮
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
    ready: function () {
      // 在组件实例进入页面节点树时执行
      console.log('this.data.shareButton')
      console.log(this.data.shareButton)
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  ready: function () {
    // 在组件实例进入页面节点树时执行

  },

  /**
   * 组件的方法列表
   */
  methods: {
    shareHandle(){
      console.log('99999999999999999999999999')
      this.triggerEvent('sharehandle')
    }
  }
})
