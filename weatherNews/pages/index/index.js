const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}
//引入SDK核心类
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  // data 申明变量
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayTemp: "",
    todayDate: "",
    city: '广州',
    locationAuthType: UNPROMPTED
  },
  onLoad() {
    // 实例化API核心类
    this.qqmapsdk = new QQMapWX({
      key: 'MCJBZ-BFTRW-SZXRX-RZMR7-ZKPM3-4LBGZ'
    });

    wx.getSetting({ //获取用户设置信息
      success: res => {
        let auth = res.authSetting['scope.userLocation'] //返回当前用户是否启用地理位置信息
        this.setData({
          locationAuthType: auth ? AUTHORIZED :
            (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })

        if (auth)
          this.getCityAndWeather()
        else
          this.getNow() //使用默认城市广州
      },
      fail: () => {
        this.getNow(); //使用默认城市广州
      }
    })
  },
  onPullDownRefresh() {
    console.log("刷新")
    this.getNow(() => {
      wx.stopPullDownRefresh();
    });
  },
  //获取当地的天气信息
  getNow(callback) {
    // 从API处数据获取
    wx.request({
      //获取的地址
      url: 'https://test-miniprogram.com/api/weather/now',
      //参数
      data: {
        city: this.data.city
      },
      //获取成功，返回数据
      success: res => {
        let result = res.data.result
        this.setNow(result); //设置当前的天气
        this.setHourlyWeather(result); //设置未来几个小时的天气
        this.setToday(result);
      },
      complete: () => {
        // console.log('停止刷新')
        // wx.stopPullDownRefresh();
        callback && callback();
      }
    })
  },

  //设置当前的天气
  setNow(result) {
    let temp = result.now.temp;
    let weather = result.now.weather

    //异步方法，将获取的数据由逻辑层发送到视图层
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

  //设置未来几个小时的天气
  setHourlyWeather(result) {
    let forecast = result.forecast;
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png/',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result) {
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    //  wx.showToast()//弹出窗口
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city, //跳转到list页面 
      //参数与路径之间使用 ? 分隔，
      //参数键与参数值用 = 相连，
      //不同参数用 & 分隔；
      //如 'path?key=value&key2=value2'
    })
  },
  onTapLocation() {
    this.getCityAndWeather()
  },
  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city,
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  }
})