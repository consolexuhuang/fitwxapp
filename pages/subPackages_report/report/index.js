// pages/subPackages_report/report/index.js
const util = require('../../../utils/util.js')
const api = getApp().api;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    index:0,
    isDownLoad: false,
    isStartState: false,
    jurisdictionSmallState: false,
    userYearReport:'',

    pageList:[], //页码
    //正式计算规则
    // existenceRule: [
    //   {
    //     keyWord: '单车类',
    //     describe: '“从此， \n爱上用骑行丈量世界。”',
    //     tagCount: 0,
    //     tagCourseList: [],
    //     list: ['5b7fe442e4b020e7940475ca', '5d26f712e4b05d87ac1aa85a', '74f9df65760111e893ed525400f93313', '5b29d624e4b0e404afb48891']
    //   },
    //   {
    //     keyWord: '舞蹈类',
    //     describe: '“从此，\n爱上用舞蹈表达灵魂。”',
    //     tagCount: 0,
    //     tagCourseList: [],
    //     list: ['5c132958e4b082a790d59f9d', 'b3ec4d2b487111e8919c525400f93313', '5be5a33ce4b0f3160ef67708', '5bf797abe4b03b5eabbc9713', '5bf79b7ee4b03b5eabbc9747', '5c7cd0d5e4b022178cb43d0c', '5d1334b6e4b0a7e68e64b912', '5bee53ace4b0ce06978a587e', '5b9a2b13e4b00802651c3a69', '5daff827e4b0f0f3c44fbdef', '5dc27d30e4b09d620bbd2185', '5de76e0be4b07e6283de904d', '9488f4f9602311e8919c525400f93313', '5bc861a9e4b033bad91e1d71', '371e2ee7487711e8919c525400f93313','5c12256be4b082a790d59c07']
    //   },
    //   {
    //     keyWord: '燃脂类',
    //     describe: '“爱上挑战的你，\n是如此与众不同。”',
    //     tagCount: 0,
    //     tagCourseList: [],
    //     list: ['0fff05c6867711e893ed525400f93313', '5b8902e9e4b04852bc3688de', '57bc076a487411e8919c525400f93313', '5bf79a4fe4b03b5eabbc972b', '5bc84dd9e4b033bad91e1d26', '328ebb4c483d11e8919c525400f93313', '5bc8676ce4b033bad91e1d79', '5c6e82dee4b07af5637e2e58', 'ba62ec03487311e8919c525400f93313', '5b7fbe37e4b020e79404758b', '5d415903e4b0a4a324f1aa3e', '5d833b92e4b0305cf270620a', 'a55e8b70487211e8919c525400f93313', '5b8fb80fe4b0482cdfdb80e6', 'c18e7ae1487411e8919c525400f93313', '5c132a28e4b082a790d59fa3', '5bc85cbce4b033bad91e1d65', '5ed8a687602011e8919c525400f93313', '5bb70cf6e4b076339e0031ef', '5bc840a6e4b033bad91e1d16','5c419d96e4b0a753d81a4b85'],
    //   },
    //   {
    //     keyWord: '塑型类',
    //     describe: '“从此，\n迷恋上肌肉酸痛带来的多巴胺。”',
    //     tagCount: 0,
    //     tagCourseList: [],
    //     list: ['1c749123551311e8919c525400f93313', '5c417d17e4b0a753d81a4b28', '5c417dd8e4b0a753d81a4b2e', 'aa36b66b483a11e8919c525400f93313', '5c36d8fee4b0cfce49a48d5d', '5c417fcce4b0a753d81a4b3a', 'f09b527d80c711e893ed525400f93313', '5d5bd9c2e4b0188648633124', '5c417e68e4b0a753d81a4b34', '5d258fb3e4b0417ec2e5f816', '5d410931e4b0a4a324f1a010', '5bc84188e4b033bad91e1d1c', '5bc85eeee4b033bad91e1d6e', '5bf79a4fe4b03b5eabbc972c', '8df7f353476d11e8919c525400f93313', '5d6f6456e4b099e347cf8ab2', 'fe8dc56d483711e8919c525400f93313', '5d416ac6e4b03e99b041beeb', '5b7fbbdee4b020e794047586', '5b890206e4b04852bc3688dc', '5cbdaaf7e4b029d0e9d9c526'],
    //   },
    //   {
    //     keyWord: '拳击类',
    //     describe: '“从此，\n爱上了用拳头表达情绪。”',
    //     tagCount: 0,
    //     tagCourseList: [],
    //     list: ['5c36eb2ce4b0cfce49a48d80', '5d01db11e4b0c1f4403e286f', '5d133424e4b0a7e68e64b90f', ],
    //   },
    //   {
    //     keyWord: '瑜伽类',
    //     describe: '“生命是如此柔软，\n而又充满力量。”',
    //     tagCount: 0,
    //     tagCourseList: [],
    //     list: ['5be3ebf6e4b0c1c7cde97b9b', '5d157c1be4b06b4295b8f64c', '5d355efae4b07e9ef837d7b2', 'c0e03308551311e8919c525400f93313', '5d4bd391e4b047832f52ef75', '5d5e3822e4b043a8776cb88a', '88a4b888551311e8919c525400f93313', '5d2580e6e4b0417ec2e5f509', '5d258a99e4b0417ec2e5f6cc', '5bed3105e4b0620ead482414','5df9fc2ee4b0e7bf07bc2a00'],
    //   },
    //   {
    //     keyWord: '拉伸类',
    //     describe: '“从此，\n爱上身心平衡的快乐。”',
    //     tagCount: 0,
    //     tagCourseList: [],
    //     list: ['36e1be4f4f7711e8919c525400f93313', '3d5d878c487111e8919c525400f93313', '5bc85a2ce4b033bad91e1d5c', '5d258e34e4b0417ec2e5f805',],
    //   },
    //   //...
    // ],
    //测试计算规则
    existenceRule: [
      {
        keyWord: '单车类',
        describe: '“从此， \n爱上用骑行丈量世界。”',
        tagCount: 0,
        tagCourseList: [],
        list: ['5b29d624e4b0e404afb48891', '74f9df65760111e893ed525400f93313',]
      },
      {
        keyWord: '舞蹈类',
        describe: '“从此，\n爱上用舞蹈表达灵魂。”',
        tagCount: 0,
        tagCourseList: [],
        list: ['371e2ee7487711e8919c525400f93313', '5b890206e4b04852bc3688dc', '5b9a2b13e4b00802651c3a69', '5bc861a9e4b033bad91e1d71', '5be5a33ce4b0f3160ef67708', '5bee53ace4b0ce06978a587e', '5bf797abe4b03b5eabbc9713', '5bf79b7ee4b03b5eabbc9747', '5c12256be4b082a790d59c07', '5c132958e4b082a790d59f9d', '5c7cd0d5e4b022178cb43d0c', '9488f4f9602311e8919c525400f93313', 'b3ec4d2b487111e8919c525400f93313',]
      },
      {
        keyWord: '燃脂类',
        describe: '“爱上挑战的你，\n是如此与众不同。”',
        tagCount: 0,
        tagCourseList: [],
        list: ['0fff05c6867711e893ed525400f93313', '328ebb4c483d11e8919c525400f93313', '57bc076a487411e8919c525400f93313', '5b7fbe37e4b020e79404758b', '5b7fe442e4b020e7940475ca', '5b8902e9e4b04852bc3688de', '5b8fb80fe4b0482cdfdb80e6', '5b921676e4b0482cdfdb8d5f', '5b9d0dd18d6af9448d220229', '5bb70cf6e4b076339e0031ef', '5bc840a6e4b033bad91e1d16', '5bc84dd9e4b033bad91e1d26', '5bc85cbce4b033bad91e1d65', '5bc8676ce4b033bad91e1d79', '5bf79a4fe4b03b5eabbc972b', '5bf79a4fe4b03b5eabbc972c', '5c132a28e4b082a790d59fa3', '5c417fcce4b0a753d81a4b3a', '5c419d96e4b0a753d81a4b85', '5c6e82dee4b07af5637e2e58', '5ed8a687602011e8919c525400f93313', 'a55e8b70487211e8919c525400f93313', 'ba62ec03487311e8919c525400f93313','c18e7ae1487411e8919c525400f93313'],
      },
      {
        keyWord: '塑型类',
        describe: '“从此，\n迷恋上肌肉酸痛带来的多巴胺。”',
        tagCount: 0,
        tagCourseList: [],
        list: ['1c749123551311e8919c525400f93313', '5b7fbbdee4b020e794047586', '5bc84188e4b033bad91e1d1c', '5bc85eeee4b033bad91e1d6e', '5c36d8fee4b0cfce49a48d5d', '5c417d17e4b0a753d81a4b28', '5c417dd8e4b0a753d81a4b2e', '5c417e68e4b0a753d81a4b34', '8df7f353476d11e8919c525400f93313', 'aa36b66b483a11e8919c525400f93313', 'f09b527d80c711e893ed525400f93313', 'fe8dc56d483711e8919c525400f93313',],
      },
      {
        keyWord: '拳击类',
        describe: '“从此，\n爱上了用拳头表达情绪。”',
        tagCount: 0,
        tagCourseList: [],
        list: ['5c36eb2ce4b0cfce49a48d80', '5c36eb2ce4b0cfce49a48d80',],
      },
      {
        keyWord: '瑜伽类',
        describe: '“生命是如此柔软，\n而又充满力量。”',
        tagCount: 0,
        tagCourseList: [],
        list: ['5be3ebf6e4b0c1c7cde97b9b', '5be3ebf6e4b0c1c7cde97b9b', '5cbdaaf7e4b029d0e9d9c526', '5cbdaaf7e4b029d0e9d9c526', 'c0e03308551311e8919c525400f93313'],
      },
      {
        keyWord: '拉伸类',
        describe: '“从此，\n爱上身心平衡的快乐。”',
        tagCount: 0,
        tagCourseList: [],
        list: ['36e1be4f4f7711e8919c525400f93313', '36e1be4f4f7711e8919c525400f93313', '5bc85a2ce4b033bad91e1d5c'],
      },
      //...
    ],
    newCourseList: []
  },
  //累计存在值key的tagCount
  getExistenceKey(value) {
    for (let i in this.data.existenceRule) {
      for (let j = 0; j < this.data.existenceRule[i].list.length; j++) {
        if (value.temp_id == this.data.existenceRule[i].list[j]) {
          this.data.existenceRule[i].tagCourseList.push(value)
          this.data.existenceRule[i].tagCount += value.order_count
        }
      }
    }
  },

  //用户下单标签课程总和最多，所对应的标签下该用户所有下单课程的排序
  getLastTagCourseSortList(courseCountData) {
    return new Promise(resolve => {
        for (let j = 0; j < courseCountData.length; j++) {
          this.getExistenceKey(courseCountData[j])
        }
        // console.log(this.data.existenceRule, util.sortList(this.data.existenceRule, 'tagCount'))
        //获取最高次数标签对象
        let heighestTagCourse = util.sortList(this.data.existenceRule, 'tagCount')[0]
        //获取最高标签最高课程
        let firstCourse = util.sortList(heighestTagCourse.tagCourseList, 'count')[0]

        console.log(firstCourse, heighestTagCourse)
        this.setData({ 
          newCourseList: heighestTagCourse,
        })
        this.setPageNumConfig()
        resolve()
    })
  },
  //配置邀请二维码
  getCodeConfig() {
    return new Promise(resolve => {
      let data = {
        scene: store.getItem('userData').id,
        liteType: 'main',
        page: 'pages/report/index'
      }
      console.log(util.formatUrlParams(`${getApp().globalData.API_URI}getLiteQrcode`, data))
      // this.setData({
      //   invitedcodeUrl: util.formatUrlParams(`${getApp().globalData.API_URI}getLiteQrcode`, data)
      // })
      resolve()
    })
  },
  // 生产年度账单
  generateYearReport(){
    api.post('v2/member/generateYearReport2019').then(res => {
      console.log('生成2019账单', res)
      this.setData({ userYearReport: res.msg })
      if (res.msg.id) {
        this.getYearReport(res.msg.id)
      }
    })
  },
  // 获取年度账单
  getYearReport(reportId){
    let data = {
      id: reportId
    }
    api.post('v2/member/getYearReport2019', data).then(res => {
      console.log('获取2019年度账单', res)
      if (res.msg.COURSE_LIST && res.msg.COURSE_LIST.length > 0) {
         this.getLastTagCourseSortList(res.msg.COURSE_LIST).then(() => {
           this.setData({
             isStartState: true
           })
         })
      }
    })
  },
  //配置页码
  setPageNumConfig(){
    let pageNum = 12
    let pageList = [];
    for (let i = 0; i < pageNum; i++) {
      pageList[i] = i
    }
    //序列4
    if (this.data.userYearReport.total_invite < 1) {
      for (let j = 4; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
    //序列5
    if (this.data.userYearReport.total_coupon_count == 0) {
      for (let j = 5; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
    //序列6
    if (!this.data.userYearReport.love_co_member) {
      for (let j = 6; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
    //序列8
    if (!this.data.userYearReport.first_evening_course_name) {
      for (let j = 8; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
    //序列9
    if (!this.data.userYearReport.first_morning_course_name) {
      for (let j = 9; j < pageList.length; j++) {
        pageList[j] -= 1
      }
    }
   
    this.setData({ pageList: pageList})
    console.log('页码数：', pageNum, pageList)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().checkSessionFun().then(() => {
      this.generateYearReport()
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 点击授权
  bindgetuserinfo() {
    getApp().wx_AuthUserLogin().then(() => {
      this.setData({
        jurisdictionSmallState: false,
      })
    })
  },
  // 轮播改变
  bindchange(e) {
    //下滑
    if (this.data.current < e.detail.current) {
      this.setData({ isDownLoad: true })
    } else {
      this.setData({ isDownLoad: false })
    }
    console.log(e,this.data.current, e.detail.current, this.data.isDownLoad)
    this.setData({ 
      current: e.detail.current,
      // index:
    })
  },
  // 查看报告
  startReport(){
    if (this.data.isStartState && getApp().passIsLogin()){
      // this.setData({ isStartState: true})
      this.setData({
        current: this.data.current+1
      })
    } else {
      this.setData({
        jurisdictionSmallState: true
      })
    }
  },
})
