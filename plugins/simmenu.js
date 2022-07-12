const { default: makeWASocket, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, downloadContentFromMessage, downloadHistory, proto, getMessage, generateWAMessageContent, prepareWAMessageMedia } = require('@adiwajshing/baileys-md')
let levelling = require('../lib/levelling')
let fs = require('fs')
let path = require('path')
let fetch = require('node-fetch')
let moment = require('moment-timezone')
let jimp = require('jimp')
let PhoneNumber = require('awesome-phonenumber')
const defaultMenu = {
   before: ` 
─────────•〔 ll нασяι-вσт ཻུ⸙͎ 〕•─────────

🎐  *Name:* %name
🎐  *Tersisa:* %limit Limit
🎐  *Role:* %role
🎐  *Level:* %level [ %xp4levelup ]
🎐  *XP:* %exp / %maxexp
🎐  %totalexp XP secara Total 
 
                  *〔 llı TODAY llı 〕*
                 
🎐  *Tanggal:* %week %weton, %date
🎐  *Tanggal Islam:* %dateIslamic
🎐  *Waktu*:  %time
 
                    *〔 llı INFO ıll 〕*      

🎐   *Uptime:* %uptime (%muptime)
🎐   *Database:* %rtotalreg dari %totalreg 
 
              *〔 llı INFO COMMAND ıll 〕*     

*Ⓟ* = Premium
*Ⓛ* = Limit

 %readmore`.trimStart(),
  header: `
⁙╭━━•›ꪶ ཻུ۪۪ꦽꦼ̷⸙ ━ ━ ━  ━ ━ ꪶ ཻུ۪۪ꦽꦼ̷⸙‹•━━╮
⁙┃╭┈─────────────⩵꙰ཱི࿐
⁙┃╰───━⃝┅ *%category* ┅⃝━───ꕥ ↶↷*
⁙├☆─〔 HAORI CHAN 〕──┈➤`,
  body: `⁙├〲 %cmd %islimit %isPremium`,
  footer: `⁙╰•──────━⃝┅⃝━─────┈ ⳹`,
  after: `
⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❙❘❙❙❘❙❘❙❚❙❘❙❙❙❘❙❘❙❚❙❘❙❚❙❘❙❙❘❙❚❙❘ ⌕.
`,
}
 let handler = async (m, { conn, usedPrefix: _p, args, command }) => { 
  let bzz = './haori.mp3'
  let tag = `@${m.sender.split('@')[0]}`
 m, { contextInfo: { mentionedJid: conn.parseMention(tag) }}
 let waofc = `@${'0'.split('@')[0]}`
 m, { contextInfo: { mentionedJid: conn.parseMention(tag) }}
 let ow = `@${'6281379927605'.split('@')[0]}`
  let tags
  let teks = `${args[0]}`.toLowerCase()
  let arrayMenu = ['all', 'game', 'rpg', 'xp', 'stiker', 'kerangajaib', 'quotes', 'admin', 'grup', 'premium', 'internet', 'anonymous', 'nulis', 'downloader', 'tools', 'fun', 'database', 'quran', 'audio', 'jadibot', 'info', 'tanpakategori', 'owner']
  if (!arrayMenu.includes(teks)) teks = '404'
  if (teks == 'all') tags = {
    'main': 'UTAMA',
    'game': 'Game',
    'rpg': 'RPG',
    'xp': 'Exp & Limit',
    'sticker': 'Stiker',
    'kerang': 'Kerang Ajaib',
    'quotes': 'Quotes',
    'group': 'Grup',
    'premium': 'Premium',
    'internet': 'Internet',
    'anonymous': 'Anonymous Chat',
    'nulis': 'MagerNulis & Logo',
    'downloader': 'Downloader',
    'tools': 'Tools',
    'fun': 'Fun',
    'database': 'Database',
    'vote': 'Voting',
    'absen': 'Absen',
    'quran': 'Al Qur\'an',
    'audio': 'Pengubah Suara',
    'jadibot': 'Jadi Bot',
    'info': 'Info',
    '': 'Tanpa Kategori',
  }
  if (teks == 'game') tags = {
    'game': 'Game'
  }
  if (teks == 'xp') tags = {
    'xp': 'Exp & Limit'
  }
  if (teks == 'rpg') tags = {
    'rpg': 'RPG'
  }
  if (teks == 'stiker') tags = {
    'sticker': 'Stiker'
  }
  if (teks == 'kerangajaib') tags = {
    'kerang': 'Kerang Ajaib'
  }
  if (teks == 'quotes') tags = {
    'quotes': 'Quotes'
  }
  if (teks == 'grup') tags = {
    'group': 'Grup'
  }
  if (teks == 'premium') tags = {
    'premium': 'Premium'
  }
  if (teks == 'internet') tags = {
    'internet': 'Internet'
  }
  if (teks == 'anonymous') tags = {
    'anonymous': 'Anonymous Chat'
  }
  if (teks == 'nulis') tags = {
    'nulis': 'MagerNulis & Logo'
  }
  if (teks == 'downloader') tags = {
    'downloader': 'Downloader'
  }
  if (teks == 'tools') tags = {
    'tools': 'Tools'
  }
  if (teks == 'fun') tags = {
    'fun': 'Fun'
  }
  if (teks == 'database') tags = {
    'database': 'Database'
  }
  if (teks == 'vote') tags = {
    'vote': 'Voting',
    'absen': 'Absen'
  }
  if (teks == 'quran') tags = {
    'quran': 'Al Qur\'an'
  }
  if (teks == 'audio') tags = {
    'audio': 'Pengubah Suara'
  }
  if (teks == 'jadibot') tags = {
    'jadibot': 'Jadi Bot'
  }
  if (teks == 'info') tags = {
    'info': 'Info'
  }
  if (teks == 'tanpakategori') tags = {
    '': 'Tanpa Kategori'
  }
  if (teks == 'owner') tags = {
    'owner': 'Owner',
    'host': 'Host',
    'advanced': 'Advanced'
  }



  try {
    let package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
    let { exp, limit, age, money, level, role, registered } = global.db.data.users[m.sender]
    let { min, xp, max } = levelling.xpRange(level, global.multiplier)
    let umur = `*${age == '-1' ? 'Belum Daftar*' : age + '* Thn'}`
    let name = registered ? global.db.data.users[m.sender].name : conn.getName(m.sender)
    let d = new Date(new Date + 3600000)
    let locale = 'id'
    // d.getTimeZoneOffset()
    // Offset -420 is 18.00
    // Offset    0 is  0.00
    // Offset  420 is  7.00
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    const wita = moment.tz('Asia/Makassar').format("HH:mm:ss")
    const wit = moment.tz('Asia/Jayapura').format("HH:mm:ss")
    const hariRaya = new Date('January 1, 2023 23:59:59')
    const sekarang = new Date().getTime()
    const Selisih = hariRaya - sekarang
    const jhari = Math.floor( Selisih / (1000 * 60 * 60 * 24));
    const jjam = Math.floor( Selisih % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    const mmmenit = Math.floor( Selisih % (1000 * 60 * 60) / (1000 * 60))
    const ddetik = Math.floor( Selisih % (1000 * 60) / 1000)
    const hariRayaramadan = new Date('April 21, 2023 23:59:59')
    const sekarangg = new Date().getTime()
    const lebih = hariRayaramadan - sekarangg
    const harii = Math.floor( lebih / (1000 * 60 * 60 * 24));
    const jamm = Math.floor( lebih % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    const menitt = Math.floor( lebih % (1000 * 60 * 60) / (1000 * 60))
    const detikk = Math.floor( lebih % (1000 * 60) / 1000)
    const ultah = new Date('August 18, 2022 23:59:59')
    const sekarat = new Date().getTime() 
    const Kurang = ultah - sekarat
    const ohari = Math.floor( Kurang / (1000 * 60 * 60 * 24));
    const ojam = Math.floor( Kurang % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    const onet = Math.floor( Kurang % (1000 * 60 * 60) / (1000 * 60))
    const detek = Math.floor( Kurang % (1000 * 60) / 1000)
    let pe = '```'
    let { premium, premiumTime } = global.db.data.users[m.sender]
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let mode = global.opts['self'] ? 'Private' : 'Public'
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    global.jam = time
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })
        const ftrol = {
    key : {
    remoteJid: 'status@broadcast',
    participant : '0@s.whatsapp.net'
    },
    message: {
    orderMessage: {
    itemCount : 999,
    status: 1,
    surface : 1,
    message: `廾ΛӨЯI IQ MD 🌱 ┊ 𝗥𝗣𝗚 Whatsapp ʙᴏᴛ`, 
    orderTitle: `▮Menu ▸`,
    thumbnail: await (await fetch('https://telegra.ph/file/8450b71563bdbfb85b98d.jpg')).buffer(), //Gambarnye
    sellerJid: '0@s.whatsapp.net' 
    }
    }
    }
    
    if (teks == '404') {
    	let tksk = `${ucapan()}, ${name} ${pickRandom(['😅', '🥰', '😜'])}

_${pickRandom(global.motivasi)}_
    
╭──── 「 *BOT INFO* 」 ────┈ ⳹
│ 
│❒͡ *Bot Name: HAORI IQ MD*
│❒͡ *Creator: Stah Ziv San*
│❒͡ *Contact Owner Bot*
│ *https://wa.me/*
│❒͡ *Tanggal: 9 Juli 2022*  
│❒͡ *Jam: ${time} WIB*
│❒͡ *Status: 「 ${mode} 」*
│❒͡ *Prefix: 「 MULTI PREFIX 」*
│❒͡  𝙏𝘼𝙃𝙐𝙉 𝘽𝘼𝙍𝙐
│❒͡ _*${jhari} Hari ${jjam} Jam ${mmmenit} Menit ${ddetik} Detik*_
│❒͡  𝙍𝘼𝙈𝘼𝘿𝘼𝙉
│❒͡ _*${harii} Hari ${jamm} Jam ${menitt} Menit ${detikk} Detik*_ 
│❒͡  𝙐𝙇𝘼𝙉𝙂 𝙏𝘼𝙃𝙐𝙉 𝙊𝙒𝙉𝙀𝙍 
│❒͡ _*${ohari} Hari ${ojam} Jam ${onet} Menit ${detek} Detik*_
│ 
╰──── 「 *HAORI BOT* 」 ────┈ ⳹

❉─────────────────────❉  
◦ *Nama: ${name}*
◦ *Status :* ${premium ? 'Premium' : 'Free'} User
◦ *Limit: ${limit}*
◦ *Your Api:* wa.me/${m.sender.split('@')[0]}
❉────────────────────❉  
*Your Progress*:
◦ *Level: ${level}*
◦ *XP: ${exp}*
◦ *Rank: ${role}*
❉────────────────────❉  

*⟣┈────「 BOT STATUS 」 ────┈⟢*
❏ *Runtime ${uptime}*
𒍮 *User Register: ${totalreg}*
*⟣┈───「 HAORI BOT 」 ──────┈⟢*`

let ftt = `*Note:* Jika menemukan bug, error atau kesulitan dalam penggunaan silahkan laporkan/tanyakan kepada Owner`
             let judul = `${ucapan()}`.trim() 
       const sections = [ 
       { 
         title: 'List Menu Haoribotz ', 
         rows: [ 
           { title: '💬 ꒱「  ❖ Semua Perintah ⤸ 」',  description: 'Menampilkan semua fitur dari bot', rowId: '.? all' }, 
           { title: '🎮 ꒱「  ❖ Game ⤸ 」', description: 'Menampilkan fitur dari game', rowId: '.? game' }, 
           { title: '🌱 ꒱「  ❖ RPG ⤸ 」', description: 'Menampilkan fitur dari rpg', rowId: '.? stiker' }, 
           { title: '📈 ꒱「  ❖ Exp & Limit ⤸ 」', description: 'Menampilkan fitur dari xp', 'rowId': '.? xp' }, 
           { title: '🎫 ꒱「  ❖ Stiker ⤸ 」', description: 'Menampilkan fitur dari sticker', rowId: '.? stiker' }, 
           { title: '🐚 ꒱「  ❖ Kerang Ajaib ⤸ 」', description: 'Menampilkan fitur dari kerang ajaib', rowId: '.? kerangajaib' }, 
           { title: '📑 ꒱「  ❖ Quotes ⤸ 」', description: 'Menampilkan fitur dari quotes', rowId: '.? quotes' }, 
           { title: '🏦 ꒱「  ❖ Group Settings  ⤸ 」', description: 'Menampilkan fitur dari grup', rowId: '.? grup' }, 
           { title: '🌟 ꒱「  ❖ Premium ⤸ 」', description: 'Menampilkan fitur dari premium', rowId: '.? premium' }, 
           { title: '💻 ꒱「  ❖ Internet ⤸ 」', description: 'Menampilkan fitur dari internet', rowId: '.? internet' }, 
           { title: '🎭 ꒱「  ❖ Anonymous Chat ⤸ 」', description: 'Menampilkan fitur dari anonymous', rowId: '.? anonymous' }, 
           { title: '✍️ ꒱「  ❖ Editz Menu ⤸ 」', description: 'Menampilkan fitur dari nulis', rowId: '.? nulis' }, 
           { title: '📩 ꒱「  ❖ Downloader ⤸ 」', description: 'Menampilkan fitur dari downloader', rowId: '.? downloader' }, 
           { title: '🧰 ꒱「  ❖ Tools ⤸ 」', description: 'Menampilkan fitur dari tools', rowId: '.? tools' }, 
           { title: '🧩 ꒱「  ❖ Fun ⤸ 」', description: 'Menampilkan fitur dari fun', rowId: '.? fun' }, 
           { title: '📂 ꒱「  ❖ Data Base ⤸ 」', description: 'Menampilkan fitur dari database', rowId: '.? database' }, 
           { title: '🗳️ ꒱「  ❖ Vote & Absen ⤸ 」', description: 'Menampilkan fitur dari vote', rowId: '.? vote'  }, 
           { title: '☪️ ꒱「  ❖ Islamic ⤸ 」', description: 'Menampilkan fitur dari quran', rowId: '.? quran' }, 
           { title: '🎙️ ꒱「  ❖ Voice Changer ⤸ 」', description: 'Menampilkan fitur dari pengubah suara', rowId: '.? audio' }, 
           { title: '🎧 ꒱「  ❖ Vn Imuet ⤸ 」', description: 'Menampilkan fitur dari vn',  rowId: '.? vn' }, 
           { title: '🎵 ꒱「  ❖ Sound Music ⤸ 」', description: 'Menampilkan fitur dari sound',  rowId: '.? sound' }, 
           { title: '🤖 ꒱「  ❖ Jadibot ⤸ 」', description: 'Menampilkan fitur dari jadibot',  rowId: '.? jadibot' }, 
           { title: 'ℹ️ ꒱「  ❖ Info ⤸ 」', description: 'Menampilkan fitur dari info', rowId: '.? info'}, 
           { title: '❓ ꒱「  ❖ No Category ⤸ 」', description: 'Menampilkan fitur dari tanpakategori', rowId: '.? tanpakategori' }, 
           { title: '👩🏻‍💻 ꒱「  ❖ Owner ⤸ 」', description: 'Menampilkan fitur dari owner', rowId: '.? owner' }, 
         ] 
       } 
     ] 
     const listMessage = { 
       text: `Hai Kak ${name}, Pilih Menu Disini Kak`, 
       footer: 'Jangan Lupa Donasi Ya Kak',
       title: judul, 
       buttonText: "Klik Disini", 
       sections 
     } 
 conn.send2ButtonLoc(m.chat, await (await fetch('https://telegra.ph/file/334d224de652b009d82e8.jpg')).buffer(), tksk, ftt, 'OWNER', '.owner', 'DONASI', '.donasi', m, { contextInfo: { mentionedJid: conn.parseMention(tksk)}})
     return conn.sendMessage(m.chat, listMessage, { quoted: m, mentions: await conn.parseMention(judul), contextInfo: { forwardingScore: 99999, isForwarded: true }}) 
      
     } 
     let groups = {} 
     for (let tag in tags) { 
       groups[tag] = [] 
       for (let plugin of help) 
         if (plugin.tags && plugin.tags.includes(tag)) 
           if (plugin.help) groups[tag].push(plugin) 
     } 
     conn.menu = conn.menu ? conn.menu : {} 
     let before = conn.menu.before || defaultMenu.before 
     let header = conn.menu.header || defaultMenu.header 
     let body = conn.menu.body || defaultMenu.body 
     let footer = conn.menu.footer || defaultMenu.footer 
     let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : `Dipersembahkan oleh https://wa.me/${global.conn.user.jid.split`@`[0]}`) + defaultMenu.after 
     let _text = [ 
       before, 
       ...Object.keys(tags).map(tag => { 
         return header.replace(/%category/g, tags[tag]) + '\n' + [ 
           ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => { 
             return menu.help.map(help => { 
               return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help) 
                 .replace(/%islimit/g, menu.limit ? ' *Ⓛ* ' : '') 
                 .replace(/%isPremium/g, menu.premium ? ' *Ⓟ* ' : '') 
                 .trim() 
             }).join('\n') 
           }), 
           footer 
         ].join('\n') 
       }), 
       after 
     ].join('\n') 
     text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : '' 
     let replace = { 
       '%': '%', 
       p: _p, uptime, muptime, 
       me: conn.user.name, 
       npmname: package.name, 
       npmdesc: package.description, 
       version: package.version, 
       exp: exp - min, 
       maxexp: xp, 
       totalexp: exp, 
       xp4levelup: max - exp <= 0 ? `Siap untuk *${_p}levelup*` : `${max - exp} XP lagi untuk levelup`, 
       github: package.homepage ? package.homepage.url || package.homepage : '[unknown github url]', 
       level, limit, name, umur, money, age, weton, week, date, dateIslamic, time, totalreg, rtotalreg, role, 
       readmore: readMore 
     } 
     text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name]) 
     await conn.sendButtonDoc(m.chat, text.trim(),  '                          「 *カ HAORI BOT IQ MD あ⁩* 」', 'OWNER', '.owner', m, { quoted: m, contextInfo: { 
         externalAdReply: { 
             title: 'Haori Suka Furry UωU',
             body: `${pickRandom(['Furry Indonesia :3', 'Suka Pokemon Nggak Kak :3', 'Kangen Haori Nggak?', 'Udah makan belum kak?', 'Udah Makan Belum?', 'Semangat ya kak!', 'Jangan begadang mulu ya!', 'Jangan spam ya kak!', 'Jangan lupa donasi yak kak! QωQ', 'Jaga kesehatan yaw kak!', 'Jangan lupa makan!', 'Jangan lupa istirahat yak! UωU', 'Haori Sayang Kamu :3', 'Pr nya udh belum kak?', 'Jangan kebanyakan main hp yk! nanti sakit :‹'])}`,
             description: 'Now Playing...', 
             mediaType: 2, 
           thumbnail: await (await fetch('https://telegra.ph/file/1f8e012df6e4aca2fbd11.jpg')).buffer(), 
          mediaUrl: `${pickRandom([`https://youtu.be/35w7z9QFLwY`, `https://www.instagram.com/the.sad.boy01`])}`,
         } 
      } 
   })
   conn.sendFile(m.chat, bzz, 'haori.mp3', null, m, true, {
type: 'audioMessage', // paksa tanpa convert di ffmpeg
ptt: true, contextInfo:{externalAdReply: {title: '𝙷𝙰𝙾𝚁𝙸𝙱𝙾𝚃𝚉 𝚂𝙴𝙽𝙶𝙾𝙻 𝙳𝙾𝙽𝙶 :v', body: `${pickRandom(['Simple Bot WhatsApp', 'Create By Zivfurr', 'Furry Botz By Zivfurr'])}`, sourceUrl: 'https://bit.ly/3N024o9', thumbnail: await (await fetch('https://telegra.ph/file/8501db84d6e15b55c6273.jpg')).buffer(),}} 
     }) 
   } catch (e) { 
     conn.reply(m.chat, 'Maaf, menu sedang error', m) 
     throw e 
   } 
 } 
 handler.help = ['simplemenu']
handler.tags = ['main']
handler.command = /^(simplemenu)$/i
 handler.owner = false 
 handler.mods = false 
 handler.premium = false 
 handler.group = false 
 handler.private = false 
  
 handler.admin = false 
 handler.botAdmin = false 
  
 handler.fail = null 
 handler.exp = 3 
  
 module.exports = handler 
  
 const more = String.fromCharCode(8206) 
 const readMore = more.repeat(4001) 
  
 function clockString(ms) { 
   let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) 
   let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60 
   let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60 
   return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':') 
 } 
 function ucapan() {
  const time = moment.tz('Asia/Jakarta').format('HH')
  res = "Good Morning 🌆"
  if (time >= 4) {
    res = "Good Morning 🌄"
  }
  if (time > 10) {
    res = "Good Afternoon ☀️"
  }
  if (time >= 15) {
    res = "Good Evening 🌇"
  }
  if (time >= 18) {
    res = "Good Night 🌃"
  }
  return res
    }
 function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}
  
  async function genProfile(conn, m) { 
   let font = await jimp.loadFont('./name.fnt'), 
     mask = await jimp.read('https://i.imgur.com/552kzaW.png'), 
     welcome = await jimp.read(thumbnailUrl.getRandom()), 
     avatar = await jimp.read(await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')), 
     status = (await conn.fetchStatus(m.sender).catch(console.log) || {}).status?.slice(0, 30) || 'Not Detected' 
  
     await avatar.resize(460, 460) 
     await mask.resize(460, 460) 
     await avatar.mask(mask) 
     await welcome.resize(welcome.getWidth(), welcome.getHeight()) 
  
     await welcome.print(font, 550, 180, 'Name:') 
     await welcome.print(font, 650, 255, m.pushName.slice(0, 25)) 
     await welcome.print(font, 550, 340, 'About:') 
     await welcome.print(font, 650, 415, status) 
     await welcome.print(font, 550, 500, 'Number:') 
     await welcome.print(font, 650, 575, PhoneNumber('+' + m.sender.split('@')[0]).getNumber('international')) 
     return await welcome.composite(avatar, 50, 170).getBufferAsync('image/png') 
 }
