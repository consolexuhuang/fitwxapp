// components/statement/statement.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show:{
      type:Boolean,
      value:false
    },
    btnText:{
      type: String,
      value: '关闭'
    },
    content:{
      type: String,
      value: '<p>11111111</p>'
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
    onClick(){
     this.triggerEvent('statementEvent',{type:'3'})
   }
  }
})
