# fitwxapp

#### 正式环境参数
课程端小程序appid: "wx29946485f206d315",
API接口： 'https://fit.jlife.vip/wx/api/'
拉新小程序appid： wxec1fe04fad9d4e02

#### 开发环境参数
课程端小程序appid: "wx6b00bfc932f22210",
API接口： 'https://dev.jlife.vip/wx/api/'
拉新小程序appid： wx322a8a72b755aa57

#### 上线需要修改如下文件
1.project.config.json文件里"appid": "wx29946485f206d315"；
2.api.js里 API_URI = 'https://fit.jlife.vip/wx/api/'；
3.app.json里"navigateToMiniProgramAppIdList": [ "wxec1fe04fad9d4e02" ]；
4.app.js 里 JumpAppId: {          
      appid: 'wxec1fe04fad9d4e02',
      envVersion: 'release' //正式版
    }

#### 测试需要修改如下文件
1.project.config.json文件里"appid": "wx6b00bfc932f22210"；
2.api.js里 API_URI = 'https://dev.jlife.vip/wx/api/'；
3.app.json里"navigateToMiniProgramAppIdList": [ "wx322a8a72b755aa57" ]；
4.app.js 里 JumpAppId: {          
      appid: 'wx322a8a72b755aa57',
      envVersion: 'trial' //develop:开发版   trial：体验版  release：正式版
    }

##使用第三方组件
1、sliderBar : https://github.com/ZhngCai/double-sided-slider

##接口使用说明
1、生成二维码和扫描二维码参数识别：
现在支持小程序二维码通用的生成机制，通过提供page路径（不能带参数）、scene（传递特定参数，例如会员主键、课程主键等，格式自定义，少于32位的参数扫描小程序二维码会自动得到，大于32位长度，扫描得到的是转化码，通过调用getSeneBycode接口来得到实际的参数数据）、liteType（小程序类型：main、share、gift、coach



