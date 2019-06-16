//  const API_URI = 'https://fit.jlife.vip/wx/api/'
const API_URI = 'https://dev.jlife.vip/wx/api/'
import Store from './store.js'
function request(path, data, method) {
  return new Promise(function(resolve, reject) {
    wx.request({
      //项目的真正接口，通过字符串拼接方式实现   02076356e4034f1b98c65c7ef0d88443 Store.getItem('userData').token
      url: API_URI + path, 
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        '_token': Store.getItem('userData').token,
        // 'content-type': 'application/json',
      },
      data: data,
      method: method,
      success: function(res) {
        // console.log('noFind',res)
        if (getApp().globalData.redirectToState){
          if (res.code === -1) {
            wx.navigateTo({ url: `/pages/noFind/noFind?type=1` })
            getApp().globalData.redirectToState = false
          }
          else {
            resolve(res.data)
            getApp().globalData.redirectToState = true
          }
        }

      },
      fail: function(res) {
        if (getApp().globalData.redirectToState) {
          wx.navigateTo({ url: `/pages/noFind/noFind?type=4`})//无网络
          reject(res.data)
          getApp().globalData.redirectToState = false
        }
      }
    })
  })
}

function get(path, data) {
  return request(path, data, 'GET')
}

function post(path, data) {
  return request(path, data, 'POST')
}
module.exports = {
  get,
  post
}