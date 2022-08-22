/*const { createHash } = require('crypto')
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix, command }) {
let _uptime = process.uptime() * 1000
let uptime = clockString(_uptime)
let sn = createHash('md5').update(m.sender).digest('hex')
let fk = {
    key : {
    remoteJid: 'status@broadcast',
    participant : '0@s.whatsapp.net'
    },
    message: {
    orderMessage: {
    itemCount : 999999999828182719999,
    status: 4827204,
    surface : 4072824,
    message: '▸ Terimakasih Telah Mendaftar 🏷️', 
    orderTitle: wm,
    thumbnail: await (await fetch('https://telegra.ph/file/7c4947f3bba11243da4cb.jpg')).buffer(), //Gambarnye
    sellerJid: '0@s.whatsapp.net' 
    }
    }
    }
let fz = {
	key: { 
          fromMe: false,
	      participant: `0@s.whatsapp.net`, ...(m.chat ? 
	 { remoteJid: "120363039290101063@g.us" } : {}) 
                },
	 message: { 
                 "videoMessage": { 
                 "title": wm,
                 "h": `Hmm`,
                 'seconds': '999999999', 
                 'gifPlayback': 'true', 
                 'caption': `「 RUNTIME BOT 」
⏲️ Waktu: ${time} WIB
💌 Aktif Selama : ${uptime}`, 'jpegThumbnail': await (await fetch('https://telegra.ph/file/7cac84df0437232734f8a.jpg')).buffer()
                          }
                        }
                      }
 let user = global.db.data.home[m.sender]
  if (user.registered === true) return conn.sendButtonDoc(m.chat, `@${m.sender.split`@`[0]} Kamu sudah terdaftar! mau daftar ulang?`, wm, 'Iya', '.unreg ' + sn, m, {
    quoted: fz,
    contextInfo: { forwardingScore: 99999, isForwarded: true,
        externalAdReply: {
        	sourceUrl: 'https://vt.tiktok.com/ZSRRmS8vh/',
            title: wm + ' 🍃',
            body: `💌 Aktif Selama : ${uptime}`,
          thumbnail: await (await fetch('https://telegra.ph/file/66091207727c1a856997c.jpg')).buffer()
        }
     }
    })
  if (!Reg.test(text)) return conn.sendButtonDoc(m.chat, `contoh:\n*${usedPrefix + command} Zivfurr.16*`, wm, 'Menu', '.menu', m, {
    quoted: fz,
    contextInfo: { forwardingScore: 99999, isForwarded: true,
        externalAdReply: {
        	sourceUrl: 'https://vt.tiktok.com/ZSRRmS8vh/',
            title: wm + ' 🍃',
            body: `💌 Aktif Selama : ${uptime}`,
          thumbnail: await (await fetch('https://telegra.ph/file/66091207727c1a856997c.jpg')).buffer()
        }
     }
    })
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw 'Nama tidak boleh kosong (Alphanumeric)'
  if (!age) throw 'Umur tidak boleh kosong (Angka)'
  age = parseInt(age)
  if (age > 50) throw 'Umur terlalu tua'
  if (age < 5) throw 'Bayi bisa ngetik sesuai format bjir ._., tapi gatau juga bocil skrg epic² pasti anak ngen ngep:v'
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date
  user.registered = true
  let prefix = usedPrefix
let hao = `

*Registered In Database*
*Supported By @${global.owner[1].split('@')[0]}*` 
  let emot = conn.pickRandom(["☑️"])
  let totalreg = Object.keys(global.db.data.home).length
  conn.sendMessage(m.chat, {
    	react: {
    		text: emot,
    		key: m.key
    	}
    })	
conn.sendButtonDoc(m.chat, `
◪ *「 DAFTAR BERHASIL 」*
╰───────────────────╮
╭───────────────────╯
├❏ Tag : @${m.sender.split`@`[0]}
├❏ Nama : ${name}
├❏ Umur : ${age} tahun
├❒ Total User : ${totalreg} nomor
╰───────────────────

*SN* (Serial Number) di kirim di chat pribadi dan digunakan untuk daftar ulang, jika lupa *SN* silahkan ketik *${usedPrefix}sn* untuk mengecek *SN* kamu! 
`.trim(), wm, `Profile`,`${prefix}pp`, m, {
    quoted: fk,
    contextInfo: { forwardingScore: 99999, isForwarded: true,
        externalAdReply: {
        	sourceUrl: 'https://vt.tiktok.com/ZSRRmS8vh/',
            title: 'Terimakasih Telah Daftar 🍃',
            body: 'Follow Me On Tiktok',
          thumbnail: await (await fetch(fla + 'Registered')).buffer()
        }
     }
    })*/
    async function handler(m, { conn,text }) { 
   conn.verify = conn.verify ? conn.verify : {} 
    user = DATABASE.data.home 
    kode = Math.floor(Math.random() * 9999) 
 let ziv = '```'
 let hao = `Reply Pesan Ini Atau Dan Balas Pesan Ini Untuk Verifikasi! Kode Di Pesan Di Bawah Ini
Seluruh informasi kamu (no. handphone, alamat email, dan password) adalah rahasia. Jangan pernah berikan informasi tersebut kepada siapa pun. Cute Bot tidak pernah meminta informasi rahasia dari kamu.

Your true data registered powered
*Supported By @${global.owner[0].split('@')[0]}*` 
    if (user[m.sender].registered) return m.reply('_*Kamu Sudah Terverifikasi!*_') 
    aww = await conn.sendButtonLoc(m.sender, 'https://telegra.ph/file/51fa80b60e45651dee465.jpg', `Welcome to Cute Bot ! Please confirm your account using the following code:

${ziv}${kode}${ziv}
`, hao, 'Owner', `.owner`, m) 
      conn.verify[m.sender] = { code: kode, key: aww.key.id } 
 } 
  
 handler.all = async m => { 
      if (!conn.verify) return 
      if (!m.quoted) return 
     if ((m.sender in conn.verify) == false) return 
     if (m.text == conn.verify[m.sender].code && m.quoted.id == conn.verify[m.sender].key) { 
     conn.sendButton(m.chat, '```Register Success```', '', 'Menu', '#menu', m ) 
     DATABASE.data.home[m.sender].registered = true 
     delete conn.verify[m.sender] 
    } 
 } 





handler.help = ['daftar', 'register'].map(v => v + ' <name>.<age>')
handler.tags = ['xp']

handler.command = /^(daftar|reg(is(ter))?)$/i

module.exports = handler

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
