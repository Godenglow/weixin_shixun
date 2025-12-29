Page({
  data: {
    testId: '',
    test: {},
    colors: {}
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ testId: options.id })
      this.loadTestDetail()
    }
    this.initTheme()
  },

  onShow: function() {
    this.initTheme()
  },

  initTheme: function() {
    const app = getApp()
    this.setData({
      colors: app.globalData.theme === 'dark' ? {
        bgColor: '#121212',
        cardBg: '#1e1e1e',
        textMain: '#ffffff',
        textSec: '#888888',
        border: '#2a2a2a'
      } : {
        bgColor: '#F6F6F6',
        cardBg: '#ffffff',
        textMain: '#333333',
        textSec: '#999999',
        border: '#eeeeee'
      }
    })
  },

  loadTestDetail: function() {
    wx.showLoading({ title: '加载中...' })
    wx.cloud.callFunction({
      name: 'tests',
      data: {
        action: 'getDetail',
        testId: this.data.testId
      },
      success: (res) => {
        if (res.result.success) {
          this.setData({ test: res.result.data })
          wx.setNavigationBarTitle({
            title: res.result.data.title
          })
        }
      },
      fail: (err) => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  startTest: function() {
    wx.navigateTo({
      url: `/pages/test/test?id=${this.data.testId}`
    })
  },

  onThemeChange: function(theme) {
    this.initTheme()
  }
})
