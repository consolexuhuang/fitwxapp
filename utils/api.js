 const API_URI = 'https://fit.jlife.vip/wx/api/'
//const API_URI = 'https://dev.jlife.vip/wx/api/'

import Store from './store.js'
function request(path, data, method) {
  //获取存储报错数据
  let noFind = wx.getStorageSync('noFind');

  return new Promise(function(resolve, reject) {
    wx.request({
      //项目的真正接口，通过字符串拼接方式实现   02076356e4034f1b98c65c7ef0d88443 Store.getItem('userData').token
      url: API_URI + path, 
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        '_token': Store.getItem('userData').token,
        'formId': Store.getItem('formId') ? Store.getItem('formId').join(',') : ''
        // 'content-type': 'application/json',
      },
      data: data,
      method: method,
      success: function(res) {
        
        //没报错
        if (!noFind){
          if (res.data.code !== -1 && res.data.code !== 401) {
            resolve(res.data)
          }
          else if (res.data.code === -1) {
            wx.redirectTo({ url: `/pages/noFind/noFind?type=1` })
            reject(res.data)
          }
          //‘无效的用户信息’
          else if (res.data.code === 401) {
              resolve(res.data)
              wx.clearStorageSync();
              //重启            
              wx.navigateTo({
                url: '/pages/index/index',
              });
          }
        }
      },
      fail: function(res) {
        //没报错
        if (!noFind) {
          wx.redirectTo({ url: `/pages/noFind/noFind?type=4`})//无网络
          reject(res.data)
        }
      },
      complete: function(){
        // console.log('缓存formId-----', Store.getItem('formId') ? Store.getItem('formId').join(',') : '')
        Store.clear('formId')
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
  API_URI,
  get,
  post
}