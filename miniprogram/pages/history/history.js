Page({
  data: {
    records: [],
    currentTab: 'all',
    colors: {}
  },

  onLoad: function() {
    this.initTheme()
  },

  onShow: function() {
    this.initTheme()
    this.loadRecords()
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

  loadRecords: function() {
    wx.showLoading({ title: '加载中...' })
    const openid = wx.getStorageSync('openid')
    
    if (!openid) {
      this.setData({ records: [] })
      wx.hideLoading()
      return
    }
    
    wx.cloud.callFunction({
      name: 'submitRecord',
      data: {
        action: 'getList',
        openid: openid,
        page: 1,
        pageSize: 50
      },
      success: (res) => {
        if (res.result.success) {
          const records = res.result.data.list.map(item => ({
            ...item,
            completedAt: this.formatDate(item.completedAt),
            scoreColor: this.getScoreColor(item.score)
          }))
          this.setData({ records: records })
        }
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  formatDate: function(date) {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    
    return `${d.getMonth() + 1}月${d.getDate()}日`
  },

  getScoreColor: function(score) {
    if (score >= 80) return '#07C160'
    if (score >= 60) return '#ff976a'
    return '#ee0a24'
  },

  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    
    if (tab === 'recent') {
      const recentRecords = this.data.records.filter(item => {
        const d = new Date(item.completedAtRaw || Date.now())
        const now = new Date()
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
        return diffDays <= 7
      })
      this.setData({ displayRecords: recentRecords })
    } else {
      this.setData({ displayRecords: this.data.records })
    }
  },

  goToResult: function(e) {
    const recordId = e.currentTarget.dataset.id
    const testId = e.currentTarget.dataset.testid
    wx.navigateTo({
      url: `/pages/result/result?testId=${testId}&recordId=${recordId}`
    })
  },

  goToDiscover: function() {
    wx.switchTab({
      url: '/pages/discover/discover'
    })
  },

  onThemeChange: function(theme) {
    this.initTheme()
  }
})
