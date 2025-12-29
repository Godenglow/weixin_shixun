Page({
  data: {
    testId: '',
    test: {},
    questions: [],
    currentIndex: 0,
    selectedIndex: -1,
    selectedIndices: [],
    answers: [],
    startTime: null,
    isLast: false,
    canSubmit: false,
    colors: {}
  },

  computed: {
    progress() {
      return ((this.data.currentIndex + 1) / this.data.questions.length) * 100
    },
    currentQuestion() {
      return this.data.questions[this.data.currentIndex] || {}
    },
    isMultiple() {
      return this.data.currentQuestion.type === 'multiple'
    }
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ testId: options.id })
      this.loadTest()
    }
    this.initTheme()
    this.setData({ startTime: Date.now() })
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

  loadTest: function() {
    wx.showLoading({ title: '加载中...' })
    wx.cloud.callFunction({
      name: 'tests',
      data: {
        action: 'getDetail',
        testId: this.data.testId
      },
      success: (res) => {
        if (res.result.success) {
          const test = res.result.data
          this.setData({
            test: test,
            questions: test.questions || []
          })
          wx.setNavigationBarTitle({
            title: test.title
          })
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

  selectOption: function(e) {
    const index = e.currentTarget.dataset.index
    const { isMultiple, currentQuestion, answers, currentIndex } = this.data
    
    if (isMultiple) {
      let { selectedIndices } = this.data
      const pos = selectedIndices.indexOf(index)
      if (pos > -1) {
        selectedIndices.splice(pos, 1)
      } else {
        selectedIndices.push(index)
      }
      this.setData({ selectedIndices: selectedIndices })
    } else {
      this.setData({ selectedIndex: index })
    }
    
    this.checkCanSubmit()
  },

  checkCanSubmit: function() {
    const { isMultiple, selectedIndex, selectedIndices } = this.data
    let canSubmit = false
    
    if (isMultiple) {
      canSubmit = selectedIndices.length > 0
    } else {
      canSubmit = selectedIndex >= 0
    }
    
    this.setData({ canSubmit: canSubmit })
  },

  nextQuestion: function() {
    if (!this.data.canSubmit) return
    
    const { currentIndex, questions, selectedIndex, selectedIndices, answers } = this.data
    const currentQuestion = questions[currentIndex]
    
    let answer = {}
    if (currentQuestion.type === 'multiple') {
      answer = {
        questionId: currentQuestion._id,
        type: 'multiple',
        indices: selectedIndices,
        options: selectedIndices.map(i => currentQuestion.options[i]),
        score: selectedIndices.reduce((sum, i) => sum + (currentQuestion.options[i].score || 0), 0)
      }
    } else {
      answer = {
        questionId: currentQuestion._id,
        type: currentQuestion.type || 'single',
        index: selectedIndex,
        option: currentQuestion.options[selectedIndex],
        score: currentQuestion.options[selectedIndex]?.score || 0
      }
    }
    
    answers[currentIndex] = answer
    
    if (currentIndex >= questions.length - 1) {
      this.submitTest(answers)
      return
    }
    
    this.setData({
      answers: answers,
      currentIndex: currentIndex + 1,
      selectedIndex: -1,
      selectedIndices: [],
      canSubmit: false,
      isLast: currentIndex >= questions.length - 2
    })
  },

  prevQuestion: function() {
    const { currentIndex, answers, questions } = this.data
    if (currentIndex <= 0) return
    
    const prevIndex = currentIndex - 1
    const prevAnswer = answers[prevIndex]
    
    if (prevAnswer) {
      if (prevAnswer.type === 'multiple') {
        this.setData({ selectedIndices: prevAnswer.indices })
      } else {
        this.setData({ selectedIndex: prevAnswer.index })
      }
    } else {
      this.setData({ selectedIndex: -1, selectedIndices: [] })
    }
    
    this.setData({
      currentIndex: prevIndex,
      canSubmit: true,
      isLast: prevIndex >= questions.length - 1
    })
  },

  submitTest: function(answers) {
    wx.showLoading({ title: '提交中...' })
    
    const timeSpent = Math.floor((Date.now() - this.data.startTime) / 1000)
    
    const score = answers.reduce((sum, ans) => sum + (ans.score || 0), 0)
    const dimensions = {}
    
    answers.forEach(ans => {
      if (ans.questionId && ans.score !== undefined) {
        const dim = this.data.questions.find(q => q._id === ans.questionId)?.dimension
        if (dim) {
          dimensions[dim] = (dimensions[dim] || 0) + ans.score
        }
      }
    })
    
    wx.cloud.callFunction({
      name: 'submitRecord',
      data: {
        action: 'submit',
        testId: this.data.testId,
        answers: answers,
        timeSpent: timeSpent,
        score: score,
        dimensions: dimensions
      },
      success: (res) => {
        if (res.result.success) {
          const recordId = res.result.data.recordId
          wx.navigateTo({
            url: `/pages/result/result?testId=${this.data.testId}&recordId=${recordId}`
          })
        } else {
          wx.showToast({ title: res.result.message || '提交失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  onThemeChange: function(theme) {
    this.initTheme()
  }
})
