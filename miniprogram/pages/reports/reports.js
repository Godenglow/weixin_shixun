Page({
  data: {
    reports: [],
    colors: {}
  },

  onLoad: function() {
    this.initTheme()
  },

  onShow: function() {
    this.initTheme()
    this.loadReports()
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

  loadReports: function() {
    wx.showLoading({ title: '加载中...' })
    const openid = wx.getStorageSync('openid')
    
    if (!openid) {
      this.setData({ reports: [] })
      wx.hideLoading()
      return
    }
    
    wx.cloud.callFunction({
      name: 'report',
      data: {
        action: 'getList',
        openid: openid,
        page: 1,
        pageSize: 50
      },
      success: (res) => {
        if (res.result.success) {
          const reports = res.result.data.list.map(item => ({
            ...item,
            createdAt: this.formatDate(item.createdAt),
            preview: (item.report?.analysis || '').substring(0, 60) + '...',
            color: this.getColorByType(item.type),
            type: this.getTypeName(item.type)
          }))
          this.setData({ reports: reports })
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
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  getColorByType: function(type) {
    const colors = {
      'comprehensive': '#07C160',
      'dimension': '#1989fa',
      'suggestion': '#ff976a',
      'trend': '#7232dd'
    }
    return colors[type] || '#999999'
  },

  getTypeName: function(type) {
    const names = {
      'comprehensive': '综合报告',
      'dimension': '维度分析',
      'suggestion': '建议报告',
      'trend': '趋势报告'
    }
    return names[type] || '报告'
  },

  goToReport: function(e) {
    const reportId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/report/report?id=${reportId}`
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
