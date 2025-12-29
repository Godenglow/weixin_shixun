Page({
  data: {
    testId: '',
    recordId: '',
    test: {},
    report: {},
    score: 0,
    dimensions: [],
    historyList: [],
    colors: {}
  },

  onLoad: function(options) {
    if (options.testId && options.recordId) {
      this.setData({
        testId: options.testId,
        recordId: options.recordId
      })
      this.loadData()
    }
    this.initTheme()
  },

  onShow: function() {
    this.initTheme()
  },

  onShareAppMessage: function() {
    return {
      title: `我在${this.data.test.title}中获得了${this.data.report.interpretation.level}！`,
      path: `/pages/test-detail/test-detail?id=${this.data.testId}`
    }
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

  loadData: function() {
    wx.showLoading({ title: '加载中...' })
    
    Promise.all([
      this.loadTest(),
      this.loadReport(),
      this.loadHistory()
    ]).then(() => {
      this.drawScoreRing()
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
    })
  },

  loadTest: function() {
    return wx.cloud.callFunction({
      name: 'tests',
      data: {
        action: 'getDetail',
        testId: this.data.testId
      }
    }).then(res => {
      if (res.result.success) {
        this.setData({ test: res.result.data })
      }
    })
  },

  loadReport: function() {
    return wx.cloud.callFunction({
      name: 'report',
      data: {
        action: 'generate',
        recordId: this.data.recordId,
        testId: this.data.testId
      }
    }).then(res => {
      if (res.result.success) {
        const report = res.result.data.report
        const score = report.score || 0
        const dimensions = this.formatDimensions(report.dimensions)
        
        this.setData({
          report: report,
          score: score,
          dimensions: dimensions
        })
      }
    })
  },

  loadHistory: function() {
    const openid = wx.getStorageSync('openid')
    wx.cloud.callFunction({
      name: 'submitRecord',
      data: {
        action: 'getList',
        openid: openid,
        page: 1,
        pageSize: 5
      }
    }).then(res => {
      if (res.result.success) {
        const list = res.result.data.list.filter(item => item._id !== this.data.recordId).slice(0, 3)
        this.setData({
          historyList: list.map(item => ({
            ...item,
            completedAt: this.formatDate(item.completedAt)
          }))
        })
      }
    })
  },

  formatDimensions: function(dims) {
    if (!dims) return []
    
    const dimConfig = {
      '情绪稳定性': { name: '情绪稳定性', colors: ['#07C160', '#1989fa'] },
      '外向性': { name: '外向性', colors: ['#ff976a', '#ee0a24'] },
      '开放性': { name: '开放性', colors: ['#7232dd', '#f56c6c'] },
      '宜人性': { name: '宜人性', colors: ['#09bb07', '#1989fa'] },
      '尽责性': { name: '尽责性', colors: ['#576b95', '#07C160'] }
    }
    
    return Object.entries(dims).map(([name, score]) => {
      const config = dimConfig[name] || { name: name, colors: ['#999999', '#666666'] }
      const maxScore = 25
      const percent = Math.min((score / maxScore) * 100, 100)
      let color = config.colors[0]
      if (percent < 40) color = config.colors[1] || '#ee0a24'
      else if (percent < 60) color = config.colors[0] || '#ff976a'
      
      return {
        name: config.name,
        score: score,
        percent: percent,
        color: color
      }
    })
  },

  formatDate: function(date) {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  },

  drawScoreRing: function() {
    const ctx = wx.createCanvasContext('scoreCanvas', this)
    const centerX = 100
    const centerY = 100
    const radius = 80
    
    ctx.setLineWidth(12)
    ctx.setStrokeStyle('#e0e0e0')
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()
    
    const percent = this.data.score / 100
    const endAngle = 2 * Math.PI * percent - Math.PI / 2
    
    ctx.setLineWidth(12)
    ctx.setStrokeStyle('#07C160')
    ctx.setLineCap('round')
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle)
    ctx.stroke()
    
    ctx.draw(false)
  },

  shareReport: function() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  goHome: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  goToReport: function(e) {
    const reportId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/report/report?id=${reportId}`
    })
  },

  onThemeChange: function(theme) {
    this.initTheme()
  }
})
