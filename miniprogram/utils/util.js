const app = getApp()

const formatTime = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + 
    [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

const showLoading = (title = '加载中') => {
  wx.showLoading({
    title: title,
    mask: true
  })
}

const hideLoading = () => {
  wx.hideLoading()
}

const showToast = (title, icon = 'none') => {
  wx.showToast({
    title: title,
    icon: icon
  })
}

const showModal = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

const callCloudFunction = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: name,
      data: data,
      success: (res) => {
        if (res.result && res.result.success) {
          resolve(res.result)
        } else {
          showToast(res.result?.message || '操作失败')
          reject(res.result)
        }
      },
      fail: (err) => {
        showToast('网络错误，请重试')
        reject(err)
      }
    })
  })
}

const getThemeColors = () => {
  const theme = app.globalData.theme
  const colors = theme === 'dark' ? {
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
  return colors
}

module.exports = {
  formatTime,
  formatNumber,
  formatDuration,
  showLoading,
  hideLoading,
  showToast,
  showModal,
  callCloudFunction,
  getThemeColors
}
