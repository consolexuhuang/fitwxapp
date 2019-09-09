// components/shareMain/shareMain.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData:{
      type:Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    width: '550',//canvas宽
    height:'828',//canvas高
  },
  lifetimes: {
    ready: function () {
      // 在组件实例进入页面节点树时执行
      this.init();
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  ready: function () {
    // 在组件实例进入页面节点树时执行
    this.init();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init(){
      //获取地址宽度
      let query = wx.createSelectorQuery().in(this)
      query.select('#address-text').boundingClientRect()
      query.exec(function (res) {
        console.log('res000')
        console.log(res)
      })
    },
    //保存卡片
    saveCard() {
      
    }
  }
})