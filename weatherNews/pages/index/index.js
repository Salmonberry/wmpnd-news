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

const QQMapWX=require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;

Page({
  // data 申明变量
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground:'',
    hourlyWeather:[],
    todayTemp:"",
    todayDate:""
  },
  onPullDownRefresh() {
    console.log("刷新")
    this.getNow(()=>{
      wx.stopPullDownRefresh();
    });
  },
  onLoad() {
    // 实例化API核心类
    this.qqmapsdk = new QQMapWX({
      key: 'MCJBZ-BFTRW-SZXRX-RZMR7-ZKPM3-4LBGZ'
    });
    this.getNow();
  },
  getNow(callback){
    // 从API处数据获取
    wx.request({
      //获取的地址
      url: 'https://test-miniprogram.com/api/weather/now',
      //参数
      data: {
        city: '广州市'
      },
      //获取成功，返回数据
      success: res => {
        console.log(res)

        let result = res.data.result
        this.setNow(result);//设置当前的天气
        this.setHourlyWeather(result);//设置未来几个小时的天气
        this.setToday(result);
      },
      complete:()=>{
        // console.log('停止刷新')
        // wx.stopPullDownRefresh();
        callback && callback();
      }
    })
  } ,

  //设置当前的天气
  setNow(result){
    let temp = result.now.temp;
    let weather = result.now.weather
    console.log(temp, weather)

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
  setHourlyWeather(result){
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
 setToday(result){
   let date=new Date()
   this.setData({
     todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}`,
     todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
   })
 },
 onTapDayWeather(){
  //  wx.showToast()//弹出窗口
  wx.navigateTo({
    url: '/pages/list/list',
  })
 },
  onTapLocation() {
    wx.getLocation({
      success: res => {
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            console.log(city)
          }
        })
      },
    })
  }
})