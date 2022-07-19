let handler  = async (m, { conn, text }) => {
  let chats = Object.keys(await conn.chats)
  conn.reply(m.chat, `_Mengirim pesan broadcast ke ${chats.length} chat_`, m)
  for (let id of chats) {
       let bcbg = `${pickRandom(['https://telegra.ph/file/87ed5db99d405cb200742.jpg', 'https://telegra.ph/file/aa1957dc1715f002b85e3.jpg', 'https://telegra.ph/file/57e26fd236cab75d09dbe.jpg'])}` 
       await conn.delay(1500)
       await conn.send2ButtonLoc(id, bcbg,'*——————「 Broadcast 」——————*\n' + text.trim(), wm, 'Menu', '.menu', 'Owner', '.owner', m)
     }
  m.reply('*Broadcast selesai*')
}
handler.help = ['broadcastloc','bcloc'].map(v => v + ' <teks>')
handler.tags = ['owner']
handler.command = /^(broadcastloc|bcloc)$/i
handler.owner = true
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler
