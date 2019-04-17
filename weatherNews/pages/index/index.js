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

Page({
  // data种申明变量
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground:'',
    forcast:[1,2,3,4,5,6,7,8,9]
  },
  onPullDownRefresh() {
    console.log("刷新")
    this.getNow(()=>{
      wx.stopPullDownRefresh();
    });
  },
  onLoad() {
    this.getNow()
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
          frontColor: '#ffffff',
          backgroundColor: weatherColorMap[weather],
        })
      },
      complete:()=>{
        // console.log('停止刷新')
        // wx.stopPullDownRefresh();
        callback && callback();
      }
    })
  } 
})