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
      case 'submit':
        return await submitRecord(openid, event)
      case 'getList':
        return await getRecordList(openid, event)
      case 'getDetail':
        return await getRecordDetail(openid, event)
      case 'delete':
        return await deleteRecord(openid, event)
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

async function submitRecord(openid, event) {
  const { testId, answers, timeSpent, score, dimensions } = event
  
  try {
    const testRes = await db.collection('tests').doc(testId).get()
    const test = testRes.data
    
    let resultData = {
      openid: openid,
      testId: testId,
      testTitle: test.title,
      answers: answers,
      timeSpent: timeSpent,
      completedAt: db.serverDate()
    }
    
    if (score !== undefined) {
      resultData.score = score
    }
    
    if (dimensions !== undefined) {
      resultData.dimensions = dimensions
    }
    
    const recordRes = await db.collection('records').add({
      data: resultData
    })
    
    await db.collection('tests').doc(testId).update({
      data: {
        testCount: _.inc(1)
      }
    })
    
    await db.collection('users').where({
      openid: openid
    }).update({
      data: {
        testCount: _.inc(1),
        points: _.inc(10),
        completedTests: _.push({
          testId: testId,
          completedAt: new Date()
        })
      }
    })
    
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()
    const user = userRes.data[0]
    const newPoints = (user.points || 0) + 10
    let newLevel = user.level || 1
    if (newPoints >= newLevel * 100) {
      newLevel += 1
      await db.collection('users').where({
        openid: openid
      }).update({
        data: {
          level: newLevel
        }
      })
    }
    
    return {
      success: true,
      data: {
        recordId: recordRes._id,
        newPoints: newPoints,
        levelUp: newPoints >= newLevel * 100
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function getRecordList(openid, event) {
  const { page = 1, pageSize = 10 } = event
  const skip = (page - 1) * pageSize
  
  try {
    const totalRes = await db.collection('records').where({
      openid: openid
    }).count()
    
    const listRes = await db.collection('records').where({
      openid: openid
    }).orderBy('completedAt', 'desc')
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

async function getRecordDetail(openid, event) {
  const { recordId } = event
  
  try {
    const recordRes = await db.collection('records').doc(recordId).get()
    
    if (recordRes.data.openid !== openid) {
      return {
        success: false,
        message: '无权查看此记录'
      }
    }
    
    return {
      success: true,
      data: recordRes.data
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function deleteRecord(openid, event) {
  const { recordId } = event
  
  try {
    const recordRes = await db.collection('records').doc(recordId).get()
    
    if (recordRes.data.openid !== openid) {
      return {
        success: false,
        message: '无权删除此记录'
      }
    }
    
    await db.collection('records').doc(recordId).remove()
    
    return {
      success: true,
      message: '删除成功'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
