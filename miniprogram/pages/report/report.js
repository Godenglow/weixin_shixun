Page({
  data: {
    reportId: '',
    report: {},
    dimensionList: [],
    colors: {}
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ reportId: options.id })
      this.loadReport()
    }
    this.initTheme()
  },

  onShow: function() {
    this.initTheme()
  },

  onShareAppMessage: function() {
    if (this.data.report.testTitle) {
      return {
        title: `我的${this.data.report.testTitle}分析报告`,
        path: `/pages/report/report?id=${this.data.reportId}`
      }
    }
    return {
      title: '心理测试报告',
      path: `/pages/report/report?id=${this.data.reportId}`
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

  loadReport: function() {
    wx.showLoading({ title: '加载中...' })
    wx.cloud.callFunction({
      name: 'report',
      data: {
        action: 'getDetail',
        reportId: this.data.reportId
      },
      success: (res) => {
        if (res.result.success) {
          const report = res.result.data
          const dimensions = report.dimensions || {}
          const dimensionList = Object.entries(dimensions).map(([name, score]) => {
            const config = this.getDimensionConfig(name)
            const maxScore = 25
            const percent = Math.min((score / maxScore) * 100, 100)
            return {
              name: config.name,
              score: score,
              percent: percent,
              color: config.colors[Math.floor(percent / 50)] || config.colors[0]
            }
          })
          
          this.setData({
            report: {
              ...report,
              createdAt: this.formatDate(report.createdAt)
            },
            dimensionList: dimensionList
          })
          
          if (report.testTitle) {
            wx.setNavigationBarTitle({
              title: report.testTitle
            })
          }
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

  getDimensionConfig: function(name) {
    const configs = {
      '情绪稳定性': { name: '情绪稳定性', colors: ['#ee0a24', '#ff976a', '#07C160'] },
      '外向性': { name: '外向性', colors: ['#1989fa', '#ff976a', '#ee0a24'] },
      '开放性': { name: '开放性', colors: ['#7232dd', '#f56c6c', '#07C160'] },
      '宜人性': { name: '宜人性', colors: ['#1989fa', '#07C160', '#576b95'] },
      '尽责性': { name: '尽责性', colors: ['#576b95', '#1989fa', '#07C160'] }
    }
    return configs[name] || { name: name, colors: ['#999999', '#666666', '#333333'] }
  },

  formatDate: function(date) {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  },

  shareReport: function() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  saveToAlbum: function() {
    const ctx = wx.createCanvasContext('reportCanvas', this)
    const dpr = wx.getSystemInfoSync().pixelRatio
    
    ctx.setFillStyle(this.data.colors.bgColor === '#121212' ? '#1e1e1e' : '#ffffff')
    ctx.fillRect(0, 0, 375, 600)
    
    ctx.setFillStyle(this.data.colors.textMain === '#ffffff' ? '#ffffff' : '#333333')
    ctx.setFontSize(18)
    ctx.fillText(this.data.report.testTitle || '心理测试报告', 20, 40)
    
    ctx.setFillStyle(this.data.colors.textSec === '#888888' ? '#888888' : '#999999')
    ctx.setFontSize(12)
    ctx.fillText(this.data.report.createdAt || '', 20, 65)
    
    ctx.setFillStyle(this.data.colors.textMain === '#ffffff' ? '#ffffff' : '#333333')
    ctx.setFontSize(16)
    ctx.fillText('综合评分', 20, 110)
    
    const scoreColor = this.data.report.interpretation?.color || '#07C160'
    ctx.setFillStyle(scoreColor)
    ctx.setFontSize(48)
    ctx.fillText(String(this.data.report.score || 0), 20, 170)
    
    ctx.setFontSize(14)
    ctx.fillText('分', 80, 170)
    
    ctx.setFillStyle(this.data.colors.textSec === '#888888' ? '#888888' : '#999999')
    ctx.setFontSize(14)
    ctx.fillText(this.data.report.interpretation?.level || '', 120, 170)
    
    ctx.setFillStyle(this.data.colors.textMain === '#ffffff' ? '#ffffff' : '#333333')
    ctx.setFontSize(14)
    ctx.fillText('结果解读', 20, 230)
    
    ctx.setFillStyle(this.data.colors.textSec === '#888888' ? '#888888' : '#999999')
    ctx.setFontSize(12)
    const desc = this.data.report.interpretation?.desc || ''
    ctx.fillText(desc.substring(0, 40), 20, 260)
    if (desc.length > 40) {
      ctx.fillText(desc.substring(40, 80), 20, 280)
    }
    
    ctx.setFillStyle(this.data.colors.textMain === '#ffffff' ? '#ffffff' : '#333333')
    ctx.setFontSize(14)
    ctx.fillText('深度分析', 20, 330)
    
    ctx.setFillStyle(this.data.colors.textSec === '#888888' ? '#888888' : '#999999')
    ctx.setFontSize(12)
    const analysis = this.data.report.analysis || ''
    ctx.fillText(analysis.substring(0, 35), 20, 360)
    if (analysis.length > 35) {
      ctx.fillText(analysis.substring(35, 70), 20, 380)
    }
    
    ctx.setFillStyle(this.data.colors.textMain === '#ffffff' ? '#ffffff' : '#333333')
    ctx.setFontSize(14)
    ctx.fillText('改善建议', 20, 430)
    
    ctx.setFillStyle(this.data.colors.textSec === '#888888' ? '#888888' : '#999999')
    ctx.setFontSize(12)
    const suggestions = this.data.report.suggestions || []
    suggestions.forEach((item, index) => {
      if (index < 3) {
        ctx.fillText(`${index + 1}. ${item.substring(0, 30)}`, 20, 460 + index * 25)
      }
    })
    
    ctx.setFillStyle('#07C160')
    ctx.setFontSize(10)
    ctx.fillText('来自心理测试小程序', 20, 580)
    
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'reportCanvas',
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '保存成功', icon: 'success' })
            },
            fail: (err) => {
              if (err.errMsg.includes('auth deny')) {
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存到相册',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting()
                    }
                  }
                })
              } else {
                wx.showToast({ title: '保存失败', icon: 'none' })
              }
            }
          })
        },
        fail: () => {
          wx.showToast({ title: '生成图片失败', icon: 'none' })
        }
      }, this)
    })
  },

  onThemeChange: function(theme) {
    this.initTheme()
  }
})
