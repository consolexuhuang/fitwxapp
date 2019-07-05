//app.js
const api = require('./utils/api.js');
import Store from './utils/store.js';

//创建worker
const worker = wx.createWorker('workers/scrollWorker.js');

App({
  onLaunch: function (options) {
    this.api = api
    this.store = Store;
    this.worker = worker;
    this.globalData.scene = options.scene;
    //版本更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
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
    //获取不同设备高度
    wx.getSystemInfo({
      success: res => {
        this.globalData.tab_height = res.statusBarHeight
        this.globalData.systemInfo = res
        if (res.model.indexOf('iPhone X') > -1) {
          this.globalData.isIpX = true
        }
      },
    })
    this.getLocation();
  },
  onShow(options) {
    let _this = this
    // 获取加密群信息
    // if (options.scene == 1044) {
    //   console.log('options.shareTicket', options.shareTicket)
    //   wx.getShareInfo({
    //     shareTicket: options.shareTicket,
    //     success(shareTicket_res){
    //       _this.globalData.shareTicket_res = shareTicket_res
    //       console.log('shareTicket_res', shareTicket_res)
    //     }
    //   })
    // }
    console.log('scene', options.scene)
    this.globalData.scene = options.scene
    // 校验场景值
    if (options.scene == 1007 || options.scene == 1008 || options.scene == 1035 || options.scene == 1043) {
      console.log(options.path)
      if (options.path.indexOf('index') != -1 ||
        options.path === 'pages/store/store' ||
        options.path === 'pages/card/card' ||
        options.path === 'pages/member/member') {
        this.globalData.share = false
      } else {
        this.globalData.share = true
      }
    } else {
      this.globalData.share = false
    }
    //后台切到前台刷新
    let interval=2*60*1000;//间隔设为2分钟
    let showMilliseconds = new Date().getTime();
    let hideMilliseconds = wx.getStorageSync('hideTime');
    if (hideMilliseconds && (showMilliseconds - hideMilliseconds >= interval)){
      wx.startPullDownRefresh({})
    }
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
    scene:'',    
   /*  JumpAppId: {                    //测试
      appid: 'wx322a8a72b755aa57',
      //envVersion: 'trial' //体验版
       envVersion: 'release' //正式版
    }, */
    JumpAppId: {                   //正式
      appid: 'wxec1fe04fad9d4e02',
      //envVersion: 'trial' //体验版
      envVersion: 'release' //正式版
    }, 
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
  //检查登录态是否过期
  checkSessionFun() {
    return new Promise((resolve,reject)=>{
      wx.checkSession({
        success: () => {
          //session_key 未过期，并且在本生命周期一直有效
          if (Store.getItem('userData')){
            resolve();
          }else{
            this.wx_loginIn().then(() => {
              resolve();
            }, () => {
              reject()
            })
          }
        },
        fail: () => {
          // session_key 已经失效，需要重新执行登录流程
          this.wx_loginIn().then(()=>{
            resolve();
          },()=>{
            reject()
          })
        }
      })
    })
    
  },
  wx_loginIn: function () {
    let _this = this
    return new Promise((resolve, reject) => {
      wx.login({
        success: res_code => {
          _this.globalData.code = res_code.code
          Store.setItem('code', res_code.code)
          let shareMemberId = wx.getStorageSync('shareMemberId') ? wx.getStorageSync('shareMemberId') : '';
          if (this.globalData.scene == 1043 || this.globalData.scene == 1035){
            let data = {
              code: res_code.code,
              sourceData: _this.globalData.scene,
            }
            api.get('authorizationLite', data).then(res => {
              wx.hideLoading()
              if (res.msg) {
                if (res.code === -1) { //如果出现登录未知错误
                  setTimeout(() => {
                    wx.navigateTo({ url: `/pages/noFind/noFind?type=1` })
                  }, 0)
                } else {
                  // 已关联公众号
                  wx.setStorageSync('shareMemberId', res.msg.id)
                  wx.setStorageSync('userData', res.msg)
                  //Store.setItem('userData', res.msg)
                  resolve()
                }
              } else {
                setTimeout(() => {
                  wx.navigateTo({ url: `/pages/noFind/noFind?type=1` })
                }, 0)
              }
            })
          } else {
            wx.getUserInfo({
              lang: 'zh_CN',
              success(res_userInfo){
                console.log('用户信息', res_userInfo)
                let data = {
                  code: res_code.code,
                  sourceData: _this.globalData.scene,
                  shareChannel: shareMemberId,
                  nickName: res_userInfo.userInfo.nickName || '',
                  headImg: res_userInfo.userInfo.avatarUrl || '',
                  city: res_userInfo.userInfo.city || '',
                  gender: res_userInfo.userInfo.gender || '',
                  encryptedData: res_userInfo.encryptedData || '',
                  iv: res_userInfo.iv || '',
                  rawData: res_userInfo.rawData || '',
                  signature: res_userInfo.signature || ''
                }
                wx.showLoading({ title: '登录中...',})
                api.get('authorizationLite', data).then(res => {
                  wx.hideLoading()
                  if (res.msg) {
                    if (res.code === -1) { //如果出现登录未知错误
                      setTimeout(() => {
                        wx.navigateTo({ url: `/pages/noFind/noFind?type=1` })
                      }, 0)
                    } else {
                      // 已关联公众号
                      wx.setStorageSync('shareMemberId', res.msg.id)
                      wx.setStorageSync('userData', res.msg)
                      //Store.setItem('userData', res.msg)
                      resolve()
                    }
                  } else {
                    setTimeout(() => {
                      wx.navigateTo({ url: `/pages/noFind/noFind?type=1` })
                    }, 0)
                  }
                })
              },
              fail(){
                reject('拒绝授权')
              }
            })
          }
        },
        fail:()=>{
          console.error('登录失败！')
        }
      })
    })
  },
  //修改用户信息接口
  wx_modifyUserInfo(){
    return new Promise(resolve => {
      let data = {
        nickName: Store.getItem('wx_userInfo').nickName || '',
        headImg: Store.getItem('wx_userInfo').avatarUrl || '',
        city: Store.getItem('wx_userInfo').city || '',
        gender: Store.getItem('wx_userInfo').gender || ''
      }
      wx.showLoading({ title: '加载中...',})
      api.post('modifyUserInfo', data).then(res => {
        wx.hideLoading()
        if(res.msg) {
          Store.setItem('userData', res.msg)
          resolve()
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
        newValue = value
        callback(value)
      }
    })
  },

  compareVersion: function (v2) {//v2:需要的微信版本
    let v1 = wx.getSystemInfoSync().SDKVersion;
    console.log('wx.getSystemInfoSync().SDKVersion')
    console.log(wx.getSystemInfoSync())
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i])
      const num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }
    return 0;
  },
  compareVersionPromise: function (v) {//v:需要的微信版本
  return new Promise((resolve,reject)=>{
    if (this.compareVersion(v) < 0) {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showToast({
        title: '当前微信版本过低',
        icon: 'none'
      });
      resolve(-1);//现在的版本比需要的版本小
    } else {
      resolve(0);//现在的版本比需要的版本大或者相等
    };
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
            resolve();
          },
          fail(err){
            //默认值
            let location = {
              latitude : '31.24916171',
              longitude : '121.487899486'
            }
            _this.globalData.location = location;
            resolve();
          }
        })
      } else {
        reject();
      }
    });
  },
})