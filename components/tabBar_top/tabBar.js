// components/tabBar_top/tabBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},

    },
    isShowBackHome:{
      type:Boolean,
      value: false
      
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height: '',
    //默认值  默认显示左上角
    navbarData: {
      showCapsule: 1
    }
  },
  attached: function () {
    // console.log(getApp().globalData)
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: getApp().globalData.share,
      // share: false
    })
    // 定义导航栏的高度   方便对齐
    this.setData({
      height: getApp().globalData.tab_height
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 返回上一页面
    _navback() {
      console.log('share', this.data.share)
      if (this.data.share){
        wx.switchTab({
          url: '/pages/course/course',
        })
      }else{
        wx.navigateBack()
      }
    },
    //返回到首页
    _backhome() {
      wx.switchTab({
        url: '/pages/course/course',
      })
    }
  }
})
