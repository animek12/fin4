let levelling = require('../lib/levelling') 
 let fs = require('fs') 
 let path = require('path') 
 let fetch = require('node-fetch') 
 let moment = require('moment-timezone') 
 let jimp = require('jimp') 
 let PhoneNumber = require('awesome-phonenumber') 
 const defaultMenu = { 
   before: ` 
꒦꒷꒷꒦꒷꒦꒦꒦꒷•〔 ll нασяι-вσт ཻུ⸙͎ 〕•꒦꒷꒷꒦꒷꒷꒦꒦꒷

 ✘⃟🎋   *Name:* %name
 ✘⃟🎋   *Tersisa:* %limit Limit
 ✘⃟🎋   *Role:* %role
 ✘⃟🎋   *Level:* %level [ %xp4levelup ]
 ✘⃟🎋   *XP:* %exp / %maxexp
 ✘⃟🎋   %totalexp XP secara Total 
 
                  *〔 llı TODAY llı 〕*
                 
 ✘⃟🎋   *Tanggal:* %week %weton, %date
 ✘⃟🎋   *Tanggal Islam:* %dateIslamic
 ✘⃟🎋   *Waktu*:  %time
 
                    *〔 llı INFO ıll 〕*      

 ✘⃟🎋    *Uptime:* %uptime (%muptime)
 ✘⃟🎋    *Database:* %rtotalreg dari %totalreg 
 
              *〔 llı INFO COMMAND ıll 〕*     
                
*Ⓟ* = Premium
*Ⓛ* = Limit

 %readmore`.trimStart(),
  header: `
⁙╭⃝━━•›ꪶ ཻུ۪۪ꦽꦼ̷⸙ ━ ━ ▣ ━ ━ ꪶ ཻུ۪۪ꦽꦼ̷⸙‹•━━─▣
⁙┃╭┈─────────────⩵꙰ཱི࿐
⁙┃╰───━⃝┅❲ *%category* ❳┅⃝━───ꕥ ↶↷
⁙├☆─〔 HAORI CHAN 〕──┈➤`,
  body: `⁙├〲 %cmd %islimit %isPremium`,
  footer: `⁙╰•──────━⃝┅⃝━─═┅═━–┈ ⳹`,
  after: `
⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❙❘❙❙❘❙❘❙❚❙❘❙❙❙❘❙❘❙❚❙❘❙❚❙❘❙❙❘❙❚❙❘ ⌕.
`,
}
 let handler = async (m, { conn, usedPrefix: _p, args, command }) => { 
  let bzz = './haori.mp3'
   let tags 
   let teks = `${args[0]}`.toLowerCase() 
   let arrayMenu = ['all', 'game', 'rpg', 'xp', 'stiker', 'kerangajaib', 'quotes', 'admin', 'grup', 'premium', 'internet', 'anonymous', 'nulis', 'downloader', 'tools', 'fun', 'database', 'quran', 'audio', 'sound', 'vn', 'jadibot', 'info', 'tanpakategori', 'owner']
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
     'sound': 'Sound Music',
    'vn': 'Vn Imuet',
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
  if (teks == 'sound') tags = {
    'sound': 'Sound Music'
  }
if (teks == 'vn') tags = {
    'vn': 'Vn Imuet'
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
  
  
  
   try { 
     let package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}')) 
     let { exp, limit, age, money, level, role, registered } = global.db.data.users[m.sender] 
     let { min, xp, max } = levelling.xpRange(level, global.multiplier) 
     let umur = `*${age == '-1' ? 'Belum Daftar*' : age + '* Thn'}` 
     let name = registered ? global.db.data.users[m.sender].name : conn.getName(m.sender) 
     let d = new Date(new Date + 3600000) 
     let locale = 'id' 
     // d.getTimeZoneOffset() 
     // Offset -420 is 18.00 
     // Offset    0 is  0.00 
     // Offset  420 is  7.00 
     let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5] 
     let week = d.toLocaleDateString(locale, { weekday: 'long' }) 
     let date = d.toLocaleDateString(locale, { 
       day: 'numeric', 
       month: 'long', 
       year: 'numeric' 
     }) 
     let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', { 
       day: 'numeric', 
       month: 'long', 
       year: 'numeric' 
     }).format(d) 
     let time = d.toLocaleTimeString(locale, { 
       hour: 'numeric', 
       minute: 'numeric', 
       second: 'numeric' 
     }) 
const hariRaya = new Date('January 1, 2023 23:59:59')
    const sekarang = new Date().getTime()
    const Selisih = hariRaya - sekarang
    const jhari = Math.floor( Selisih / (1000 * 60 * 60 * 24));
    const jjam = Math.floor( Selisih % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    const mmmenit = Math.floor( Selisih % (1000 * 60 * 60) / (1000 * 60))
    const ddetik = Math.floor( Selisih % (1000 * 60) / 1000)
    const hariRayaramadan = new Date('April 2, 2022 23:59:59')
    const sekarangg = new Date().getTime()
    const lebih = hariRayaramadan - sekarangg
    const harii = Math.floor( lebih / (1000 * 60 * 60 * 24));
    const jamm = Math.floor( lebih % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    const menitt = Math.floor( lebih % (1000 * 60 * 60) / (1000 * 60))
    const detikk = Math.floor( lebih % (1000 * 60) / 1000)
    const ultah = new Date('October 4, 2022 23:59:59')
    const sekarat = new Date().getTime() 
    const Kurang = ultah - sekarat
    const ohari = Math.floor( Kurang / (1000 * 60 * 60 * 24));
    const ojam = Math.floor( Kurang % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    const onet = Math.floor( Kurang % (1000 * 60 * 60) / (1000 * 60))
    const detek = Math.floor( Kurang % (1000 * 60) / 1000)
    let wib = moment.tz('Asia/Jakarta').format('HH:mm:ss')
    let wibh = moment.tz('Asia/Jakarta').format('HH')
    let wibm = moment.tz('Asia/Jakarta').format('mm')
    let wibs = moment.tz('Asia/Jakarta').format('ss')
    let wit = moment.tz('Asia/Jayapura').format('HH:mm:ss')
    let wita = moment.tz('Asia/Makassar').format('HH:mm:ss')
    let wktuwib = `${wibh} H ${wibm} M ${wibs} S`
     let pe = '```' 
     let { premium, premiumTime } = global.db.data.users[m.sender] 
     let _uptime = process.uptime() * 1000 
     let _muptime 
     if (process.send) { 
       process.send('uptime') 
       _muptime = await new Promise(resolve => { 
         process.once('message', resolve) 
         setTimeout(resolve, 1000) 
       }) * 1000 
     } 
 let tag = `@${m.sender.split('@')[0]}`
 m, { contextInfo: { mentionedJid: conn.parseMention(tag) }}
 let waofc = `@${'0'.split('@')[0]}`
 m, { contextInfo: { mentionedJid: conn.parseMention(tag) }}
 let ow = `@${'6282179137771'.split('@')[0]}`
 m, { contextInfo: { mentionedJid: conn.parseMention(tag) }}
let mode = global.opts['self'] ? 'Private' : 'Public'
let fkon = { key:
	 { fromMe: false,
	 participant: `0@s.whatsapp.net`, ...(m.chat ? 
	 { remoteJid: "60149431385-1618206438@g.us" } : {}) },
	 message: { contactMessage: { displayName: `${pickRandom(['HAORI IQ-MD', 'Create By Ziv San', 'Simple Bot Whatsapp'])}`, vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:Zivfurr\nitem1.TEL;waid=6285158866902:6285158866902\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': fs.readFileSync('./thumbnail.jpg')}}
	}
 const haori = {
    key : {
    remoteJid: 'status@broadcast',
    participant : '0@s.whatsapp.net'
    },
    message: {
    orderMessage: {
    itemCount : 999999999999,
    status: 404,
    surface : 404,
    message: `© HAORI IQ-MD\nSimple WhatsApp Bot`, 
    orderTitle: `▮Menu ▸`,
    thumbnail: await (await fetch('https://telegra.ph/file/2b669452f7517d2b5097a.jpg')).buffer(),
    }
    }
    }
    const fload = {
    key : {
    remoteJid: 'status@broadcast',
    participant : '0@s.whatsapp.net'
    },
    message: {
    orderMessage: {
    itemCount : 2022,
    status: 1,
    surface : 1,
    message: '[❗] Memuat Menu ' + teks + '...\n Semangat Yah Kak ^ω^',
    orderTitle: `▮Menu ▸`,
    thumbnail: await (await fetch(fla + teks)).buffer(), //Gambarnye
    sellerJid: '0@s.whatsapp.net' 
    }
    }
    }
     let muptime = clockString(_muptime) 
     let uptime = clockString(_uptime) 
     global.jam = time 
     let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
     let totalreg = Object.keys(global.db.data.users).length 
     let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length 
     let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => { 
       return { 
         help: Array.isArray(plugin.help) ? plugin.help : [plugin.help], 
         tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags], 
         prefix: 'customPrefix' in plugin, 
         limit: plugin.limit, 
         premium: plugin.premium, 
         enabled: !plugin.disabled, 
       } 
     }) 
      let tksk = `⃝▣━–━–━–━–━–⊙–━–━–━–━┈▧
│            *〔 ıll ɪɴғᴏ llı 〕* 
└┬──────────────────┈ ⳹
┌┤◦〉 *Nama :* *${name}*
││◦〉 *Exp :* *${exp}*
││◦〉 *Status :* ${premium ? 'Premium' : 'Free'} User
││◦〉 *Limit :* *${limit}*
││◦〉 *Level :* *${level}*
││◦〉 *Rank :* *${role}*
││◦〉 *Tag :* ${tag}
└┬──────────────────┈ ⳹
┌┤       *〔 ıll  ᴛɪᴍᴇ ɪɴғᴏ llı 〕*
│└──────────────────┈ ⳹
│◦〉 Hari : *${week}*
│◦〉 Weton : *${weton}*
│◦〉 Tanggal : *${date}*
│◦〉 Waktu : *${time}* 
│◦〉 Islam : *${dateIslamic}*
│◦〉 Uptime : *${uptime}*
└┬──────────────────┈ ⳹
┌┤       *〔 ıll  ʙᴏᴛ ɪɴғᴏ llı 〕* 
│└──────────────────┈ ⳹
│◦〉 Baterai : ${conn.battery != undefined ? `${conn.battery.value}% ${conn.battery.live ? '🔌 Pengisian' : ''}` : '❓ Tidak Diketahui'}
│◦〉 Prefix : [ Multi Prefix ]
│◦〉 Owner : ${ow}
│◦〉 Mode : ${mode}
│◦〉 Runtime: ${uptime}
│◦〉 Bot Name : ${conn.user.name}
│◦〉 Name Owner: Zivfurr & Haori
│◦〉 Register : ${totalreg}
│◦〉 Database : Lowdb
╰━–━–━–━–━–⊙–━–━–━–━┈▧`

let ftt = `📮 Catatan: Perlakukan Bot Secara Baik, Dev Akan Bertindak Tegas Apabila Pengguna Melanggar Rules. 
                 
                       「 *廾ΛӨЯI IQ MD ᯤ* 」`
     if (teks == '404') { 
      return await conn.send2ButtonImg(m.chat, await (await fetch('https://telegra.ph/file/ed6e4421aff4471b172f0.jpg')).buffer(), tksk, ftt, 'COMMAND', '.simplemenu', 'DONASI', '.donasi', haori, { contextInfo: { mentionedJid: conn.parseMention(tksk), externalAdReply :{ 
     mediaUrl: `${pickRandom([`https://www.facebook.com/Inunime-107082474576049/`,`https://youtu.be/JWHV8lPTzPs`])}`, 
     mediaType: 2, 
     description:  '',  
     title: `${ucapan()} Kak ${name} UωU`,
     body: `${pickRandom(['udah makan belum kak?', 'udh mandi belum kak?', 'Semangat ya kak!', 'Jangan begadang mulu ya!', 'jangan spam ya kak!', 'Jangan lupa donasi yak kak! >.<', 'Jaga kesehatan yaw kak!', 'Jangan lupa makan!', 'Jangan lupa istirahat yak! >.<', 'I Love you kak >.< 💗✨', 'Pr nya udh belum kak?', 'Jangan kebanyakan main hp yk! nanti sakit :‹'])}`,
     thumbnail: await (await fetch('https://telegra.ph/file/f64d6f546f3a28186a9ab.jpg')).buffer(),
     sourceUrl: 'https://vt.tiktok.com/ZSdwokqe4/'}}})
  
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
                 .replace(/%islimit/g, menu.limit ? 'Ⓛ' : '') 
                 .replace(/%isPremium/g, menu.premium ? 'Ⓟ ' : '') 
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
 await conn.reply(m.chat, '*L o a d i n g . . .*', fload) 
              await conn.send2ButtonVid(m.chat, 'https://telegra.ph/file/58f858fc9872fe5443df4.mp4', text.trim(),  '                   「 *カ HAORI BOT IQ MD あ⁩* 」', 'OWNER', '.owner', 'Ping', '.ping', m, { quoted: haori, contextInfo: { forwardingScore: 99999, isForwarded: true,
     externalAdReply :{ 
     mediaUrl: `${pickRandom([`https://www.facebook.com/Inunime-107082474576049/`,`https://youtu.be/JWHV8lPTzPs`])}`, 
     mediaType: 2, 
     description:  '',  
     title: `${ucapan()}`,
     body: `Time ${wktuwib}`,
     thumbnail: await (await fetch('https://telegra.ph/file/ed6e4421aff4471b172f0.jpg')).buffer(),
     sourceUrl: 'https://vt.tiktok.com/ZSdwokqe4/'
       } 
      } 
   })
 /*let url = `https://telegra.ph/file/2ebe351a63861053f58df.jpg`.trim()
    let res = await fetch(url)
    let buffer = await res.buffer()
    let message = await prepareWAMessageMedia({ image: buffer }, { upload: conn.waUploadToServer })
                const template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                    templateMessage: {
                        hydratedTemplate: {
                            locationMessage: {
                            jpegThumbnail: fs.readFileSync('./src/miko.jpg') },
                            hydratedContentText: text.trim(),
                            hydratedFooterText:'Ⓟ = for premium users.\nⓁ = fitur berlimit.',
                            hydratedButtons: [{
                                quickReplyButton: {
                                    displayText: 'Donasi🧾',
                                    id: '/donasi'
                                }
                            }, {
                                quickReplyButton: {
                                    displayText: 'Sewa Bot',
                                    id: '/sewa'
                                }  
                            }]
                        }
                    }
                }), { userJid: m.chat, quoted: m })
                conn.relayMessage(m.chat, template.message, { messageId: template.key.id })*/
   conn.sendFile(m.chat, bzz, 'haori.mp3', null, fkon, true, {
type: 'audioMessage', 
ptt: true, contextInfo:{ externalAdReply: {title: 'Stay Grateful With Your Life', body: `${pickRandom(['Simple Bot WhatsApp', 'Create By Zivfurr'])}`, sourceUrl: 'https://bit.ly/3N024o9', thumbnail: await (await fetch('https://telegra.ph/file/63c668962b7abcc95b394.jpg')).buffer(),}} 
     }) 
   } catch (e) { 
     conn.reply(m.chat, 'Maaf, Terjadi Kesalahan Program Coding', m) 
     throw e 
   } 
 } 
 handler.help = ['menu', 'help', '?'] 
 handler.tags = ['main'] 
 handler.command = /^(m(enu)?|help|\?)$/i 
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
  function ingat() {
  const lgs = moment.tz('Asia/Jakarta').format('HH')
  res = "Selamat dinihari"
  if (lgs >= 4) {
    imp = 'Jangan Lupa Sholat Subuh Yah Kak 🌠'
  }
  if (lgs > 7) {
    imp = 'Jangan Lupa Sholat Dhuha Kak 😙'
  }
  if (lgs > 7) {
    imp = 'Jangan Lupa Istirahat Yah Kak 💭'
  }
  if (lgs >= 15) {
    imp = 'Sudah ashar Jangan lupa loh 💕'
  }
  if (lgs >= 18) {
    imp = 'Sudah Magrib Saatnya Sholat Magrib Yah Kak 🕌'
  }
  if (lgs >= 19) {
    imp = 'Jangan Sering Bergadang Yah Kak 🌆'
  }
  if (lgs >= 21) {
    imp = 'Sudah malam sebenernya bot ngantuk mau turu 💤'
  }
  return imp
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
