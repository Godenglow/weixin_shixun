Page({
  data: {
    userInfo: null,
    userProfile: {},
    isDarkMode: false,
    colors: {}
  },

  onLoad: function() {
    this.initTheme()
    this.checkLogin()
  },

  onShow: function() {
    this.initTheme()
    this.checkLogin()
  },

  onPullDownRefresh: function() {
    this.loadUserProfile()
  },

  initTheme: function() {
    const app = getApp()
    const isDark = app.globalData.theme === 'dark'
    this.setData({
      isDarkMode: isDark,
      colors: isDark ? {
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
      this.loadUserProfile()
    }
  },

  loadUserProfile: function() {
    wx.cloud.callFunction({
      name: 'profile',
      data: { action: 'getProfile' },
      success: (res) => {
        console.log('loadUserProfile response:', res)
        if (res.result && res.result.success) {
          const profile = res.result.data
          console.log('profile data:', profile)
          this.setData({
            userProfile: profile,
            userInfo: profile.userInfo || null
          })
          console.log('userInfo:', this.data.userInfo)
        } else {
          console.error('loadUserProfile failed:', res.result)
        }
        wx.stopPullDownRefresh()
      },
      fail: (err) => {
        console.error('loadUserProfile fail:', err)
        wx.stopPullDownRefresh()
      }
    })
  },

  login: function() {
    console.log('login function called')
    wx.showLoading({ title: '登录中...' })
    wx.cloud.callFunction({
      name: 'login',
      data: { action: 'login' },
      success: (res) => {
        console.log('login success:', res)
        if (res.result.success) {
          wx.setStorageSync('openid', res.result.data.openid)
          this.setData({ openid: res.result.data.openid })
          this.loadUserProfile()
          
          wx.showToast({ title: '登录成功', icon: 'success' })
          
          setTimeout(() => {
            this.showAuthDialog()
          }, 1500)
        }
      },
      fail: (err) => {
        console.error('login fail:', err)
        wx.showToast({ title: '登录失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  showAuthDialog: function() {
    if (!this.data.userInfo || !this.data.userInfo.nickName) {
      wx.showModal({
        title: '授权提示',
        content: '请先授权获取您的微信头像和昵称，以完善个人资料',
        confirmText: '去授权',
        cancelText: '暂不',
        success: (res) => {
          if (res.confirm) {
            this.getUserProfile()
          }
        }
      })
    }
  },
  
  getUserProfile: function() {
    wx.showLoading({ title: '获取中...' })
    wx.getUserProfile({
      desc: '用于完善个人资料',
      success: (res) => {
        console.log('getUserProfile success:', res)
        const userInfo = res.userInfo
        wx.cloud.callFunction({
          name: 'login',
          data: {
            action: 'updateUserInfo',
            userInfo: userInfo
          },
          success: (updateRes) => {
            if (updateRes.result.success) {
              this.setData({
                userInfo: userInfo
              })
              this.loadUserProfile()
              wx.showToast({ title: '授权成功', icon: 'success' })
            }
          },
          fail: (err) => {
            console.error('updateUserInfo fail:', err)
            wx.showToast({ title: '授权失败', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        console.error('getUserProfile fail:', err)
        wx.showToast({ title: '授权失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  chooseAvatar: function() {
    if (!this.data.userInfo?.nickName) {
      this.login()
      return
    }
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.uploadAvatar(tempFilePath)
      }
    })
  },

  uploadAvatar: function(filePath) {
    wx.showLoading({ title: '上传中...' })
    const cloudPath = `avatars/${this.data.openid}/${Date.now()}.png`
    
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: (res) => {
        wx.cloud.callFunction({
          name: 'profile',
          data: {
            action: 'uploadAvatar',
            fileID: res.fileID
          },
          success: () => {
            this.setData({
              'userInfo.avatarUrl': res.fileID
            })
            wx.showToast({ title: '头像更新成功', icon: 'success' })
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  toggleTheme: function() {
    const isDark = !this.data.isDarkMode
    this.setData({ isDarkMode: isDark })
    
    wx.setStorageSync('theme', isDark ? 'dark' : 'light')
    
    if (wx.setStorageSync('theme') === 'dark') {
      wx.setStorageSync('theme', 'light')
    } else {
      wx.setStorageSync('theme', 'dark')
    }
    
    wx.reLaunch({
      url: '/pages/profile/profile'
    })
  },

  goToHistory: function() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  goToReports: function() {
    wx.navigateTo({
      url: '/pages/reports/reports'
    })
  },

  goToFavorites: function() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  goToAbout: function() {
    wx.showModal({
      title: '关于心理测试',
      content: '心理测试小程序是一款专业的心理健康评估工具。\n\n版本：1.0.0\n\n本小程序仅供娱乐参考，不能替代专业心理诊断。',
      showCancel: false
    })
  },

  goToFeedback: function() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  onThemeChange: function(theme) {
    this.initTheme()
  }
})
