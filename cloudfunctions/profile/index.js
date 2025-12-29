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
      case 'getProfile':
        return await getUserProfile(openid)
      case 'getRecords':
        return await getUserRecords(openid, event)
      case 'getReports':
        return await getUserReports(openid, event)
      case 'updateProfile':
        return await updateUserProfile(openid, event)
      case 'uploadAvatar':
        return await uploadAvatar(openid, event)
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

async function getUserProfile(openid) {
  try {
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const user = userRes.data[0]
    const nextLevelPoints = user.level * 100
    const currentLevelPoints = (user.level - 1) * 100
    const progress = Math.round(((user.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100)
    
    return {
      success: true,
      data: {
        ...user,
        nextLevelPoints,
        progress
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function getUserRecords(openid, event) {
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

async function getUserReports(openid, event) {
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

async function updateUserProfile(openid, event) {
  const { userInfo } = event
  
  try {
    await db.collection('users').where({
      openid: openid
    }).update({
      data: {
        userInfo: userInfo,
        updatedAt: db.serverDate()
      }
    })
    
    return {
      success: true,
      message: '更新成功'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function uploadAvatar(openid, event) {
  const { fileID } = event
  
  try {
    await db.collection('users').where({
      openid: openid
    }).update({
      data: {
        avatarUrl: fileID,
        updatedAt: db.serverDate()
      }
    })
    
    return {
      success: true,
      message: '头像更新成功'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
