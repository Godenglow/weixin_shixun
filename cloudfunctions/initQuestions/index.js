const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const testId = '4289fa8169521e8409c3e96d110107ac'
  
  const questions = [
    {
      testId: testId,
      index: 0,
      question: '当遇到让我生气的事情时，我通常需要很长时间才能冷静下来',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 1,
      question: '我能够敏锐地察觉到自己的情绪变化',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 2,
      question: '当压力大的时候，我会通过运动或其他方式释放压力',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 3,
      question: '我能够理解他人的情绪和感受',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 4,
      question: '当情绪低落时，我知道如何让自己开心起来',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 5,
      question: '我能够在情绪激动时保持理性思考',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 6,
      question: '我会主动寻找方法来改善自己的情绪状态',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 7,
      question: '我能够接受负面情绪的存在，而不是抗拒它',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 8,
      question: '当我情绪不好时，不会影响我的工作和学习效率',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    },
    {
      testId: testId,
      index: 9,
      question: '我能够与他人分享自己的情绪感受',
      options: [
        { text: '完全不符合', score: 1 },
        { text: '不太符合', score: 2 },
        { text: '一般', score: 3 },
        { text: '比较符合', score: 4 },
        { text: '完全符合', score: 5 }
      ]
    }
  ]
  
  try {
    const addedQuestions = []
    for (const q of questions) {
      const res = await db.collection('questions').add({
        data: q
      })
      addedQuestions.push(res._id)
    }
    
    return {
      success: true,
      message: `成功添加 ${addedQuestions.length} 道题目`,
      ids: addedQuestions
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
