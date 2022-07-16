let fetch = require('node-fetch')
let handler = async (m, { conn, usedPrefix, text, command, args }) => {
	let ftroli = {
    key : {
    remoteJid: 'status@broadcast',
    participant : '0@s.whatsapp.net'
    },
    message: {
    orderMessage: {
    itemCount : 2022,
    status: 1,
    surface : 1,
    message: `❏ TIKTOK DOWNLOADER`, 
    orderTitle: `▮Menu ▸`,
    thumbnail: await (await fetch('https://telegra.ph/file/bfa27d97e1b28dd45990e.jpg')).buffer(), //Gambarnye
    sellerJid: '0@s.whatsapp.net' 
    }
    }
    }
    let tag = `@${m.sender.split('@')[0]}`
  if (!args[0]) throw `Harap masukkan URL sebagai parameter.\n\nContoh: ${usedPrefix + command} https://vt.tiktok.com/ZSdpHWxxG/?k=1` 
 // let url = `https://api.lolhuman.xyz/api/tiktokwm?apikey=9b817532fadff8fc7cb86862&url=${args[0]}`
    conn.reply(m.chat, '*WAIT! | Mohon Tunggu Sebentar...*', m, {quoted: m, thumbnail: await (await fetch('https://telegra.ph/file/b9a32ee41970d7a71b476.jpg')).buffer(), contextInfo: { externalAdReply: {title: 'Lagi Memuat Data', sourceUrl: 'https://vt.tiktok.com/ZSdnasM19/', body: '© 𝙷𝚊𝚘𝚛𝚒𝚋𝚘𝚝𝚣 𝙱𝚢 𝚉𝚒𝚟𝚏𝚞𝚛𝚛', thumbnail: await (await fetch('https://telegra.ph/file/7d3c2136bec2eaec00f2e.jpg')).buffer(),}}})
let txt = `Hai Kak ${tag}, Videonya Udah Jadi Nih, Kalau Mau Versi Ekstensi Lain, Pilih Dibawah Ya` 
    await conn.send2ButtonVid(m.chat, `https://api.lolhuman.xyz/api/tiktokwm?apikey=9b817532fadff8fc7cb86862&url=${args[0]}` , txt, 'Mau Ganti Ke Versi Music Atau Nowm? Pilih Dibawah', `No Wm`, `.tiktoknowm ${args[0]}`, `Audio`, `.tiktokaudio ${args[0]}`, 0, { quoted: ftroli, contextInfo: { forwardingScore: 99999, isForwarded: true,
         externalAdReply: {
            title: global.wm,
            body: 'Nih Kak Video Tiktok Nya, Silakan Pilih Di Bawah Yaw Kak',
            description: '',
            mediaType: 2,
          thumbnail: await (await fetch('https://telegra.ph/file/1a2a677eb13b184746e1b.jpg')).buffer(),
         mediaUrl: `https://www.facebook.com/Inunime-107082474576049/`
        }
     }
    })
 } 
handler.help = ['tiktok'].map(v => v + ' <url>')
handler.tags = ['downloader']

handler.command = /^((tt|tiktok)?(dl)?)$/i

module.exports = handler
