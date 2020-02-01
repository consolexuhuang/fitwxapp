# fitwxapp

#### 正式环境参数
课程端小程序appid: "wx29946485f206d315",
API接口： 'https://fit.jlife.vip/wx/api/'
拉新小程序appid： wxec1fe04fad9d4e02
薇姿vichyappid：wx7527dd9e3bee0ecd

#### 开发环境参数
课程端小程序appid: "wx6b00bfc932f22210",
API接口： 'https://dev.jlife.vip/wx/api/'
拉新小程序appid： wx322a8a72b755aa57

#### 上线需要修改如下文件
1.master分支
2.project.config.json文件里"appid": "wx29946485f206d315"；
3.api.js里 API_URI = 'https://fit.jlife.vip/wx/api/'；
4.app.json里"navigateToMiniProgramAppIdList": [ "wxec1fe04fad9d4e02","wx7527dd9e3bee0ecd","wx63b823471458aa0a",
    "wxc4f812079fc9ff0d", "wx60d176f873ca2d67" ]；
5.app.js 里 JumpAppId: {          
      appid: 'wxec1fe04fad9d4e02',
      envVersion: 'release' //正式版
    }

#### 测试需要修改如下文件
1.project.config.json文件里"appid": "wx6b00bfc932f22210"；
2.api.js里 API_URI = 'https://dev.jlife.vip/wx/api/'；
3.app.json里"navigateToMiniProgramAppIdList": [ "wx322a8a72b755aa57","wx847c448281a94341","wx63b823471458aa0a" ]；
4.app.js 里 JumpAppId: {          
      appid: 'wx322a8a72b755aa57',
      envVersion: 'trial' //develop:开发版   trial：体验版  release：正式版
    }

##第三方APPID
1. 悦木之源圣诞新月球    AppID:wx63b823471458aa0a
2. 薇姿vichy            AppID:wx847c448281a94341
3. 一直播               AppID:wxc4f812079fc9ff0d
4. 腾讯直播             AppID:wx60d176f873ca2d67

##使用第三方组件
1、sliderBar : https://github.com/ZhngCai/double-sided-slider

##接口使用说明
1、生成二维码和扫描二维码参数识别：
现在支持小程序二维码通用的生成机制，通过提供page路径（不能带参数）、scene（传递特定参数，例如会员主键、课程主键等，格式自定义，少于32位的参数扫描小程序二维码会自动得到，大于32位长度，扫描得到的是转化码，通过调用getSeneBycode接口来得到实际的参数数据）、liteType（小程序类型：main、share、gift、coach



