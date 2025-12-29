const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const action = event.action
  
  try {
    switch (action) {
      case 'generate':
        return await generateReport(openid, event)
      case 'getList':
        return await getReportList(openid, event)
      case 'getDetail':
        return await getReportDetail(openid, event)
      case 'saveImage':
        return await saveReportImage(openid, event)
      default:
        return {
          success: false,
          message: '未知的操作类型'
        }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function generateReport(openid, event) {
  const { recordId, testId } = event
  
  try {
    const recordRes = await db.collection('records').doc(recordId).get()
    const record = recordRes.data
    const testRes = await db.collection('tests').doc(testId).get()
    const test = testRes.data
    
    let reportData = {
      openid: openid,
      recordId: recordId,
      testId: testId,
      testTitle: test.title,
      score: record.score || 0,
      dimensions: record.dimensions || {},
      generatedAt: db.serverDate()
    }
    
    if (test.reportConfig) {
      const analysis = analyzeResults(record.answers, test)
      reportData.analysis = analysis.analysis
      reportData.suggestions = analysis.suggestions
      reportData.interpretation = analysis.interpretation
    } else {
      const defaultAnalysis = getDefaultAnalysis(record.score || 0)
      reportData.analysis = defaultAnalysis.analysis
      reportData.suggestions = defaultAnalysis.suggestions
      reportData.interpretation = defaultAnalysis.interpretation
    }
    
    const reportRes = await db.collection('reports').add({
      data: reportData
    })
    
    await db.collection('records').doc(recordId).update({
      data: {
        reportId: reportRes._id
      }
    })
    
    return {
      success: true,
      data: {
        reportId: reportRes._id,
        report: reportData
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

function analyzeResults(answers, test) {
  let analysis = ''
  let suggestions = []
  let interpretation = {}
  
  const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0)
  const maxScore = answers.length * 5
  const percentage = Math.round((totalScore / maxScore) * 100)
  
  if (percentage >= 80) {
    analysis = '你在这一心理维度上表现出色，展现了良好的心理素质。'
    suggestions = [
      '继续保持良好的心理状态',
      '可以尝试帮助身边有需要的人',
      '定期进行心理自检，保持觉察'
    ]
    interpretation = {
      level: '优秀',
      color: '#07C160',
      desc: '你的心理状态非常健康，继续保持！'
    }
  } else if (percentage >= 60) {
    analysis = '你的心理状态良好，仍有提升空间。'
    suggestions = [
      '建议多关注自己的情绪变化',
      '可以尝试冥想或深呼吸放松',
      '保持规律的作息和运动习惯'
    ]
    interpretation = {
      level: '良好',
      color: '#1989fa',
      desc: '你的心理状态不错，继续保持良好习惯！'
    }
  } else if (percentage >= 40) {
    analysis = '你的心理状态一般，可能需要注意调节。'
    suggestions = [
      '建议多与朋友交流，倾诉心声',
      '可以尝试进行心理咨询',
      '适当放松，减少压力'
    ]
    interpretation = {
      level: '一般',
      color: '#ff976a',
      desc: '建议关注心理健康，适当调节生活方式。'
    }
  } else {
    analysis = '你的心理状态需要引起重视，建议寻求专业帮助。'
    suggestions = [
      '建议咨询专业心理咨询师',
      '不要独自承担，寻求家人朋友支持',
      '必要时可联系心理援助热线'
    ]
    interpretation = {
      level: '需关注',
      color: '#ee0a24',
      desc: '建议重视心理健康，及时寻求专业帮助。'
    }
  }
  
  return {
    analysis,
    suggestions,
    interpretation
  }
}

function getDefaultAnalysis(score) {
  if (score >= 80) {
    return {
      analysis: '你的心理测试结果显示状态良好。',
      suggestions: ['继续保持', '定期自检', '健康生活'],
      interpretation: {
        level: '良好',
        color: '#07C160',
        desc: '保持良好的心理状态'
      }
    }
  } else if (score >= 60) {
    return {
      analysis: '你的心理状态整体稳定。',
      suggestions: ['注意休息', '适当运动', '保持乐观'],
      interpretation: {
        level: '正常',
        color: '#1989fa',
        desc: '心理状态正常，继续保持'
      }
    }
  } else {
    return {
      analysis: '你的心理状态可能需要关注。',
      suggestions: ['建议咨询专业人士', '多与他人交流', '关注自身感受'],
      interpretation: {
        level: '建议关注',
        color: '#ff976a',
        desc: '建议进一步关注心理健康'
      }
    }
  }
}

async function getReportList(openid, event) {
  const { page = 1, pageSize = 10 } = event
  const skip = (page - 1) * pageSize
  
  try {
    const totalRes = await db.collection('reports').where({
      openid: openid
    }).count()
    
    const listRes = await db.collection('reports').where({
      openid: openid
    }).orderBy('generatedAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()
    
    return {
      success: true,
      data: {
        list: listRes.data,
        total: totalRes.total
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function getReportDetail(openid, event) {
  const { reportId } = event
  
  try {
    const reportRes = await db.collection('reports').doc(reportId).get()
    
    if (reportRes.data.openid !== openid) {
      return {
        success: false,
        message: '无权查看此报告'
      }
    }
    
    return {
      success: true,
      data: reportRes.data
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function saveReportImage(openid, event) {
  const { reportId, fileID } = event
  
  try {
    await db.collection('reports').doc(reportId).update({
      data: {
        imageFileID: fileID,
        imageSavedAt: db.serverDate()
      }
    })
    
    return {
      success: true,
      message: '图片保存成功'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
