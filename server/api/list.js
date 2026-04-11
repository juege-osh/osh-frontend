export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. 存数据库（状态默认：pending 待审核）
  // 你自己替换成数据库操作
  const data = {
    name: body.name,
    url: body.url,
    remark: body.remark,
    status: 'pending', // 待审核
    createTime: new Date()
  }

  // 2. 发邮件给管理员（Nuxt3 自带邮件或用 nodemailer）
  await sendMail({
    to: 'admin@xxx.com',
    subject: '【新申请】有新的工具待审核',
    html: `
      申请人提交了工具：<br>
      名称：${body.name}<br>
      链接：${body.url}<br>
      请管理员审核
    `
  })

  return {
    code: 0,
    msg: '提交成功'
  }
})