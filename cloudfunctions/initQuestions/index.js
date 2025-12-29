const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 1. 添加分类
    const categories = [
      { name: '情绪', index: 0, description: '情绪管理与调节测试', icon: 'emotion' },
      { name: '性格', index: 1, description: '性格特质分析测试', icon: 'user' },
      { name: '压力', index: 2, description: '压力水平与应对测试', icon: 'alert' },
      { name: '人际关系', index: 3, description: '人际关系能力测试', icon: 'group' },
      { name: '心理健康', index: 4, description: '心理健康综合评估', icon: 'heart' }
    ]

    const addedCategories = []
    for (const c of categories) {
      const res = await db.collection('categories').add({ data: c })
      addedCategories.push(res._id)
    }

    // 2. 添加测试
    const tests = [
      {
        title: '情绪管理测试',
        description: '通过一系列问题评估您的情绪管理能力',
        category: '情绪',
        difficulty: '中等',
        estimatedTime: 5,
        questionsCount: 10,
        isPublished: true,
        isActive: true,
        author: '心理专家团队'
      },
      {
        title: '性格类型测试',
        description: '探索您的性格特质和行为模式',
        category: '性格',
        difficulty: '简单',
        estimatedTime: 8,
        questionsCount: 15,
        isPublished: true,
        isActive: true,
        author: '心理专家团队'
      },
      {
        title: '压力水平测试',
        description: '评估您当前的压力水平',
        category: '压力',
        difficulty: '中等',
        estimatedTime: 6,
        questionsCount: 12,
        isPublished: true,
        isActive: true,
        author: '心理专家团队'
      }
    ]

    const addedTests = []
    for (const t of tests) {
      const res = await db.collection('tests').add({ data: t })
      addedTests.push({ _id: res._id, ...t })
    }

    // 3. 添加情绪管理测试的题目
    const emotionTestId = addedTests.find(t => t.category === '情绪')?._id
    if (emotionTestId) {
      const emotionQuestions = [
        {
          testId: emotionTestId,
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
          testId: emotionTestId,
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
          testId: emotionTestId,
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
          testId: emotionTestId,
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
          testId: emotionTestId,
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
          testId: emotionTestId,
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
          testId: emotionTestId,
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
          testId: emotionTestId,
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
          testId: emotionTestId,
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
          testId: emotionTestId,
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

      for (const q of emotionQuestions) {
        await db.collection('questions').add({ data: q })
      }
    }

    // 4. 添加性格测试的题目
    const personalityTestId = addedTests.find(t => t.category === '性格')?._id
    if (personalityTestId) {
      const personalityQuestions = [
        {
          testId: personalityTestId,
          index: 0,
          question: '我更喜欢独处而不是参加社交活动',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        },
        {
          testId: personalityTestId,
          index: 1,
          question: '我喜欢尝试新事物和接受挑战',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        },
        {
          testId: personalityTestId,
          index: 2,
          question: '我通常能够冷静地处理困难情况',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        },
        {
          testId: personalityTestId,
          index: 3,
          question: '我很容易信任他人',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        },
        {
          testId: personalityTestId,
          index: 4,
          question: '我是一个有条理的人',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        }
      ]

      for (const q of personalityQuestions) {
        await db.collection('questions').add({ data: q })
      }
    }

    // 5. 添加压力测试的题目
    const stressTestId = addedTests.find(t => t.category === '压力')?._id
    if (stressTestId) {
      const stressQuestions = [
        {
          testId: stressTestId,
          index: 0,
          question: '我经常感到时间不够用',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        },
        {
          testId: stressTestId,
          index: 1,
          question: '我经常担心工作或学习上的事情',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        },
        {
          testId: stressTestId,
          index: 2,
          question: '我感到很难放松下来',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        },
        {
          testId: stressTestId,
          index: 3,
          question: '我经常感到疲惫不堪',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        },
        {
          testId: stressTestId,
          index: 4,
          question: '我能够有效地应对生活中的压力',
          options: [
            { text: '完全不符合', score: 1 },
            { text: '不太符合', score: 2 },
            { text: '一般', score: 3 },
            { text: '比较符合', score: 4 },
            { text: '完全符合', score: 5 }
          ]
        }
      ]

      for (const q of stressQuestions) {
        await db.collection('questions').add({ data: q })
      }
    }

    return {
      success: true,
      message: `数据库初始化成功！添加分类 ${addedCategories.length} 个，测试 ${addedTests.length} 个，题目若干`,
      categoriesCount: addedCategories.length,
      testsCount: addedTests.length
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
