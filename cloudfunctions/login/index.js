// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const action = event.action
  
  try {
    switch (action) {
      case 'login':
        return await handleLogin(wxContext, event)
      case 'getUserInfo':
        return await getUserInfo(wxContext, event)
      case 'updateUserInfo':
        return await updateUserInfo(wxContext, event)
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

async function handleLogin(wxContext, event) {
  const openid = wxContext.OPENID
  const unionid = wxContext.UNIONID
  
  try {
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()
    
    let userData = {
      openid: openid,
      unionid: unionid || '',
      createdAt: db.serverDate(),
      lastLoginAt: db.serverDate()
    }
    
    if (userRes.data.length === 0) {
      await db.collection('users').add({
        data: {
          ...userData,
          points: 100,
          level: 1,
          testCount: 0,
          completedTests: []
        }
      })
      userData._id = '新用户'
    } else {
      await db.collection('users').doc(userRes.data[0]._id).update({
        data: {
          lastLoginAt: db.serverDate()
        }
      })
      userData._id = userRes.data[0]._id
    }
    
    return {
      success: true,
      data: {
        openid: openid,
        isNewUser: userRes.data.length === 0,
        userId: userData._id
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function getUserInfo(wxContext, event) {
  const openid = wxContext.OPENID
  
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
    
    return {
      success: true,
      data: userRes.data[0]
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function updateUserInfo(wxContext, event) {
  const openid = wxContext.OPENID
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
