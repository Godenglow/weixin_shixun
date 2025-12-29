const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const action = event.action
  const data = event.data || {}
  
  try {
    switch (action) {
      case 'getList':
        return await getTestList(data)
      case 'getDetail':
        return await getTestDetail(event)
      case 'getByCategory':
        return await getTestsByCategory(data)
      case 'search':
        return await searchTests(data)
      case 'getRecommend':
        return await getRecommendTests(data)
      case 'getCategories':
        return await getCategories()
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

async function getTestList(data) {
  const { page = 1, pageSize = 10, category = '' } = data
  const skip = (page - 1) * pageSize
  
  console.log('=== getTestList ===')
  console.log('category:', category)
  console.log('page:', page)
  console.log('pageSize:', pageSize)
  
  try {
    let query = db.collection('tests').where({
      isPublished: true
    })
    
    if (category) {
      console.log('Filtering by category:', category)
      query = query.where({
        category: category
      })
    }
    
    const totalRes = await query.count()
    console.log('Total matching tests:', totalRes.total)
    
    const listRes = await query
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
    
    console.log('Retrieved tests count:', listRes.data.length)
    console.log('Tests data:', JSON.stringify(listRes.data, null, 2))
    
    return {
      success: true,
      data: {
        list: listRes.data,
        total: totalRes.total,
        page: page,
        pageSize: pageSize
      }
    }
  } catch (error) {
    console.error('getTestList error:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

async function getTestDetail(event) {
  const testId = event.testId
  
  console.log('=== getTestDetail ===')
  console.log('testId:', testId)
  
  try {
    console.log('Fetching test from tests collection...')
    const testRes = await db.collection('tests').doc(testId).get()
    console.log('Test data:', JSON.stringify(testRes.data))
    
    console.log('Fetching questions from questions collection...')
    const questionsRes = await db.collection('questions').where({
      testId: testId
    }).orderBy('index', 'asc').get()
    console.log('Questions count:', questionsRes.data.length)
    
    return {
      success: true,
      data: {
        ...testRes.data,
        questions: questionsRes.data
      }
    }
  } catch (error) {
    console.error('getTestDetail error:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

async function getTestsByCategory(data) {
  const { category, page = 1, pageSize = 20 } = data
  const skip = (page - 1) * pageSize
  
  try {
    let query = db.collection('tests').where({
      isPublished: true,
      category: category
    })
    
    const totalRes = await query.count()
    const listRes = await query
      .orderBy('createdAt', 'desc')
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

async function searchTests(data) {
  const { keyword, page = 1, pageSize = 20 } = data
  const skip = (page - 1) * pageSize
  
  try {
    const listRes = await db.collection('tests').where({
      isPublished: true,
      title: db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()
    
    return {
      success: true,
      data: {
        list: listRes.data,
        keyword: keyword
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function getRecommendTests(data) {
  const { openid, page = 1, pageSize = 6 } = data
  
  try {
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()
    
    let recommendTests = []
    const completedTests = userRes.data[0]?.completedTests || []
    
    if (completedTests.length > 0) {
      const sameCategoryTests = await db.collection('tests').where({
        isPublished: true,
        category: db.RegExp({
          regexp: completedTests[0]?.category || '',
          options: 'i'
        })
      }).limit(pageSize).get()
      recommendTests = sameCategoryTests.data
    }
    
    if (recommendTests.length < pageSize) {
      const popularTests = await db.collection('tests').where({
        isPublished: true,
        _id: db.nin(recommendTests.map(t => t._id))
      }).orderBy('testCount', 'desc').limit(pageSize - recommendTests.length).get()
      recommendTests = [...recommendTests, ...popularTests.data]
    }
    
    const hotTests = await db.collection('tests').where({
      isPublished: true,
      _id: db.nin(recommendTests.map(t => t._id))
    }).orderBy('createdAt', 'desc').limit(4).get()
    
    return {
      success: true,
      data: {
        recommend: recommendTests,
        hot: hotTests.data
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function getCategories() {
  try {
    const res = await db.collection('categories').orderBy('index', 'asc').get()
    
    return {
      success: true,
      data: res.data
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
