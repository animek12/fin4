let handler = async (m, { conn }) => {
let totalfeatures = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
conn.sendButtonLoc(m.chat, 'https://telegra.ph/file/c4a4bea15c41d62072b60.jpg', `*Total Fitur:* ${totalfeatures}`, wm2, 'Info', '.info', m) 
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']
module.exports = handler
