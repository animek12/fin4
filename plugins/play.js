process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { servers, yta, ytv } = require('../lib/y2mate')
let yts = require('yt-search')
let fetch = require('node-fetch')
let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw `uhm.. cari apa?\n\ncontoh:\n${usedPrefix + command} california`
  let chat = global.db.data.chats[m.chat]
  conn.reply(m.chat, '*WAIT! | Mohon Tunggu Sebentar...*', m, {quoted: m, thumbnail: await (await fetch('https://telegra.ph/file/b9a32ee41970d7a71b476.jpg')).buffer(), contextInfo: { externalAdReply: {title: 'Lagi Memuat Data', sourceUrl: 'https://vt.tiktok.com/ZSdnasM19/', body: '© 𝙷𝚊𝚘𝚛𝚒𝚋𝚘𝚝𝚣 𝙱𝚢 𝚉𝚒𝚟𝚏𝚞𝚛𝚛', thumbnail: await (await fetch('https://telegra.ph/file/7d3c2136bec2eaec00f2e.jpg')).buffer(),}}})
  let results = await yts(text)
  let vid = results.all.find(video => video.seconds < 3600)
  if (!vid) throw 'Konten Tidak ditemukan'
  let isVideo = /2$/.test(command)
  let yt = false
  let yt2 = false
  let usedServer = servers[0]
  for (let i in servers) {
    let server = servers[i]
    try {
      yt = await yta(vid.url, server)
      yt2 = await ytv(vid.url, server)
      usedServer = server
      break
    } catch (e) {
      m.reply(`Server ${server} error!${servers.length >= i + 1 ? '' : '\nmencoba server lain...'}`)
    }
  }

  if (yt === false) throw 'semua server gagal'
  if (yt2 === false) throw 'semua server gagal'
  let { dl_link, thumb, title, filesize, filesizeF } = yt
    const ftrol = {
    key : {
    remoteJid: 'status@broadcast',
    participant : '0@s.whatsapp.net'
    },
    message: {
    orderMessage: {
    itemCount : 2022,
    status: 1,
    surface : 1,
    message: `❏ PLAY YOUTUBE`, 
    orderTitle: `▮Menu ▸`,
    thumbnail: await (await fetch('https://telegra.ph/file/c105f6b9ca8b32685f02e.jpg')).buffer(), //Gambarnye
    sellerJid: '0@s.whatsapp.net' 
    }
    }
    }
  await conn.send3ButtonImg(m.chat, await (await fetch(thumb)).buffer(), `
┏┉⌣ ┈̥-̶̯͡..̷̴✽̶┄┈┈┈┈┈┈┈┈┈┈┉┓
┆ *PLAY YOUTUBE*
└┈┈┈┈┈┈┈┈┈┈┈⌣ ┈̥-̶̯͡..̷̴✽̶⌣ ✽̶

*💌 Judul:* ${title}
*🎶 Audio:* ${filesizeF}
*🎥 Video:* ${yt2.filesizeF}
*💻 Server y2mate:* ${usedServer}
`.trim(), wm2, `🎙️ Audio`, `.yta ${vid.url}`, `🎥 Video`, `.yt ${vid.url}`, '🔎 YouTube Search', `.yts ${title}`, ftrol, {
    contextInfo: { forwardingScore: 99999, isForwarded: true,
        externalAdReply: {
            title: ' ꕥ─────•「 Cute ▶︎ Botz 」•─────ꕥ', 
            body: 'Apa benar ini yang anda cari?',
            description: 'Apa benar ini yang anda cari?',
            mediaType: 2,
          thumbnail: await (await fetch('https://telegra.ph/file/9f8c29c09f70ae430c1f4.jpg')).buffer(),
         mediaUrl: `https://youtube.com/watch?v=uIedYGN3NQQ`
        }
     }
    })
}
handler.help = ['play'].map(v => v + ' <pencarian>')
handler.tags = ['downloader']
handler.command = /^(p|play)$/i

handler.exp = 0

module.exports = handler

let wm = global.botwm
