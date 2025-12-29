Page({
  data: {
    keyword: '',
    currentCategory: '',
    categories: [],
    testList: [],
    loading: false,
    hasSearched: false,
    page: 1,
    hasMore: true,
    colors: {}
  },

  onLoad: function(options) {
    this.initTheme()
    if (options.category) {
      const category = decodeURIComponent(options.category)
      console.log('onLoad category:', category)
      this.setData({ currentCategory: category })
      this.loadTests()
    } else {
      this.loadCategories()
      this.loadTests()
    }
  },

  onShow: function() {
    this.initTheme()
    const category = wx.getStorageSync('selectedCategory')
    if (category) {
      console.log('onShow category from storage:', category)
      this.setData({ currentCategory: category })
      this.loadTests()
      wx.removeStorageSync('selectedCategory')
    } else if (this.data.currentCategory && this.data.testList.length === 0) {
      this.loadTests()
    }
  },

  onPullDownRefresh: function() {
    this.refreshTests()
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreTests()
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

  loadCategories: function() {
    wx.cloud.callFunction({
      name: 'tests',
      data: { action: 'getCategories' },
      success: (res) => {
        if (res.result.success) {
          this.setData({ categories: res.result.data })
        }
      }
    })
  },

  loadTests: function() {
    console.log('loadTests called, category:', this.data.currentCategory)
    this.setData({ loading: true, page: 1 })
    wx.cloud.callFunction({
      name: 'tests',
      data: {
        action: this.data.keyword ? 'search' : 'getList',
        keyword: this.data.keyword,
        category: this.data.currentCategory,
        page: 1,
        pageSize: 10
      },
      success: (res) => {
        console.log('loadTests response:', res)
        if (res.result.success) {
          console.log('test list:', res.result.data.list)
          this.setData({
            testList: res.result.data.list,
            hasMore: res.result.data.list.length >= 10,
            hasSearched: true
          })
        } else {
          console.error('loadTests failed:', res.result.message)
        }
        wx.stopPullDownRefresh()
      },
      fail: (err) => {
        console.error('loadTests fail:', err)
        wx.stopPullDownRefresh()
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  refreshTests: function() {
    this.setData({ page: 1, hasMore: true })
    this.loadTests()
  },

  loadMoreTests: function() {
    if (!this.data.hasMore || this.data.loading) return
    
    const nextPage = this.data.page + 1
    this.setData({ loading: true })
    
    wx.cloud.callFunction({
      name: 'tests',
      data: {
        action: this.data.keyword ? 'search' : 'getList',
        keyword: this.data.keyword,
        category: this.data.currentCategory,
        page: nextPage,
        pageSize: 10
      },
      success: (res) => {
        if (res.result.success) {
          const newList = res.result.data.list
          this.setData({
            testList: [...this.data.testList, ...newList],
            page: nextPage,
            hasMore: newList.length >= 10
          })
        }
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  onSearchInput: function(e) {
    this.setData({ keyword: e.detail.value })
  },

  doSearch: function() {
    this.refreshTests()
  },

  selectCategory: function(e) {
    const category = e.currentTarget.dataset.category
    if (this.data.currentCategory === category) return
    
    this.setData({ currentCategory: category })
    this.refreshTests()
  },

  goToTest: function(e) {
    const testId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/test-detail/test-detail?id=${testId}`
    })
  },

  onThemeChange: function(theme) {
    this.initTheme()
  }
})
