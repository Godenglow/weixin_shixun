Page({
  data: {
    userInfo: null,
    userProfile: {},
    recommendList: [],
    hotList: [],
    colors: {}
  },

  onLoad: function() {
    this.initTheme()
  },

  onShow: function() {
    this.checkLogin()
  },

  onPullDownRefresh: function() {
    this.loadData()
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

  checkLogin: function() {
    const openid = wx.getStorageSync('openid')
    if (openid) {
      this.setData({ openid: openid })
      this.getUserProfile()
      this.loadData()
    } else {
      this.doLogin()
    }
  },

  doLogin: function() {
    wx.cloud.callFunction({
      name: 'login',
      data: { action: 'login' },
      success: (res) => {
        if (res.result.success) {
          wx.setStorageSync('openid', res.result.data.openid)
          this.setData({ openid: res.result.data.openid })
          this.getUserProfile()
          this.loadData()
        }
      },
      fail: (err) => {
        console.error('登录失败', err)
      }
    })
  },

  getUserProfile: function() {
    wx.cloud.callFunction({
      name: 'profile',
      data: { action: 'getProfile' },
      success: (res) => {
        if (res.result.success) {
          this.setData({ userProfile: res.result.data })
          if (res.result.data.userInfo) {
            this.setData({ userInfo: res.result.data.userInfo })
          }
        }
      }
    })
  },

  loadData: function() {
    wx.cloud.callFunction({
      name: 'tests',
      data: {
        action: 'getRecommend',
        openid: this.data.openid
      },
      success: (res) => {
        if (res.result.success) {
          this.setData({
            recommendList: res.result.data.recommend || [],
            hotList: res.result.data.hot || []
          })
        }
        wx.stopPullDownRefresh()
      },
      fail: () => {
        wx.stopPullDownRefresh()
      }
    })
  },

  goToTest: function(e) {
    const testId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/test-detail/test-detail?id=${testId}`
    })
  },

  goToDiscover: function() {
    wx.switchTab({
      url: '/pages/discover/discover'
    })
  },

  goToCategory: function(e) {
    console.log('goToCategory called:', e.currentTarget.dataset)
    const category = e.currentTarget.dataset.category
    console.log('Navigating to category:', category)
    wx.setStorageSync('selectedCategory', category)
    wx.switchTab({
      url: '/pages/discover/discover',
      success: () => {
        console.log('switchTab success')
      },
      fail: (err) => {
        console.error('switchTab fail:', err)
      }
    })
  },

  onThemeChange: function(theme) {
    this.setData({
      colors: theme === 'dark' ? {
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
  }
})
