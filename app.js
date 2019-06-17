//app.js
const api = require('./utils/api.js');
import Store from './utils/store.js';

//创建worker
const worker = wx.createWorker('workers/scrollWorker.js');

App({

  onLaunch: function (options) {
    console.log('onLaunch', options.scene)
    this.api = api
    this.store = Store;
    this.worker = worker;
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log(res.hasUpdate, wx.canIUse('getUpdateManager'))
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          console.log(res.hasUpdate)
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    // 校验场景值
    if (options.scene == 1007 || options.scene == 1008 || options.scene == 1035 || options.scene == 1043) {
      this.globalData.share = true
    } else {
      this.globalData.share = false
    }
    //获取不同设备高度
    wx.getSystemInfo({
      success: res => {
        console.log('设备', res)
        this.globalData.tab_height = res.statusBarHeight
        this.globalData.systemInfo = res
        if (res.model.indexOf('iPhone X') > -1) {
          this.globalData.isIpX = true
        }
      },
    })
    this.getLocation()
  },
  onShow() {
    //后台切到前台刷新
    let interval=2*60*1000;//间隔设为2分钟
    let showMilliseconds = new Date().getTime();
    let hideMilliseconds = wx.getStorageSync('hideTime');
    if (hideMilliseconds && (showMilliseconds - hideMilliseconds >= interval)){
      wx.startPullDownRefresh({})
    }
    Store.getItem('userData') ? console.log('无需重新登陆') : this.wx_loginIn()
  },
  onHide(){
    let hideMilliseconds = new Date().getTime();
    wx.setStorageSync('hideTime', hideMilliseconds)
  },
  globalData: {
    imgUrl: '/images/',
    systemInfo: '',
    share: false,
    tab_height: 0,
    code: '',
    // openid:'',
    location: '',
    isIpX: false, //是否是ipHonex
    redirectToState: true,
  },

  /**
   * 设置监听器
   */
  setWatcher: function (page) {
    let data = page.data
    let watch = page.watch
    Object.keys(watch).forEach(v => {
      let key = v.split('.') // 将watch中的属性以'.'切分成数组
      let nowData = data // 将data赋值给nowData
      for (let i = 0; i < key.length - 1; i++) { // 遍历key数组的元素，除了最后一个！
        nowData = nowData[key[i]] // 将nowData指向它的key属性对象
      }
      let lastKey = key[key.length - 1]
      // 假设key==='my.name',此时nowData===data['my']===data.my,lastKey==='name'
      let watchFun = watch[v].handler || watch[v] // 兼容带handler和不带handler的两种写法
      let deep = watch[v].deep // 若未设置deep,则为undefine
      this.observe(nowData, lastKey, watchFun, deep, page) // 监听nowData对象的lastKey
    })
  },
  /**
   * 监听属性 并执行监听函数
   */
  observe: function (obj, key, watchFun, deep, page) {
    let val = obj[key]
    // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
    if (deep && val != null && typeof val === 'object') {
      Object.keys(val).forEach(childKey => { // 遍历val对象下的每一个key
        this.observe(val, childKey, watchFun, deep, page) // 递归调用监听函数
      })
    }
    const _this = this
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        // 用page对象调用,改变函数内this指向,以便this.data访问data内的属性值
        watchFun.call(page, value, val) // value是新值，val是旧值
        val = value
        if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
          _this.observe(obj, key, watchFun, deep, page)
        }
      },
      get: function () {
        return val
      }
    })
  },
  wx_loginIn: function () {
    let _this = this
    return new Promise((resolve, reject) => {
      wx.login({
        success: res_code => {
          console.log(res_code, res_code.code)
          _this.globalData.code = res_code.code
          Store.setItem('code', res_code.code)
          let data = {
            code: res_code.code
          }
          console.log('userData', Store.getItem('userData'))
          api.get('authorizationLite', data).then(res => {
            // wx.hideLoading()
            console.log('openid', res)
            if (res.msg) {
              // 已关联公众号
              Store.setItem('userData', res.msg)
            } else {
              // 未关联
              console.log('未关联')
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/invite/inviteShare',
                })
              }, 0)
            }
            resolve()
          })
        }
      })
    })
  },
  watchLocation: function (callback) {
    const object = this.globalData
    let newValue = ''
    Object.defineProperty(object, 'location', {
      enumerable: true,
      configurable: true,
      get: function () {
        return newValue
      },
      set: function (value) {
        // console.log(value) 
        newValue = value
        callback(value)
      }
    })
  },
  getLocation: function () {
    return new Promise((resolve, reject) => {
      const location = this.globalData.location;
      if (!location) {
        const _this = this
        wx.getLocation({
          type: 'wgs84',
          success(res) {
            _this.globalData.location = res;
            console.log('location')
            console.log(res)
            resolve(res)
          }
        })
      } else {
        reject();
      }
    })

  }
})