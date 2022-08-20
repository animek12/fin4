const { 
     default: makeWASocket, 
     makeWALegacySocket, 
     extractMessageContent, 
     makeInMemoryStore, 
     proto, 
     prepareWAMessageMedia, 
     downloadContentFromMessage, 
     getBinaryNodeChild, 
     jidDecode, 
     areJidsSameUser, 
     generateForwardMessageContent, 
     generateWAMessageFromContent, 
     WAMessageStubType, 
     WA_DEFAULT_EPHEMERAL, 
 } = require('@adiwajshing/baileys') 
 const { toAudio, toPTT, toVideo } = require('./converter') 
 const chalk = require('chalk') 
 const fetch = require('node-fetch') 
 const FileType = require('file-type') 
 const PhoneNumber = require('awesome-phonenumber') 
 const fs = require('fs') 
 const path = require('path') 
 const pino = require('pino') 
 const Jimp = require('jimp') 
 const util = require('util') 
 const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./exif') 
 const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) }) 
  
 exports.makeWASocket = (connectionOptions, options = {}) => { 
     let conn = (global.opts['legacy'] ? makeWALegacySocket : makeWASocket)(connectionOptions) 
  
     conn.loadMessage = (messageID) => { 
       return Object.entries(conn.chats) 
       .filter(([_, { messages }]) => typeof messages === 'object') 
       .find(([_, { messages }]) => Object.entries(messages) 
       .find(([k, v]) => (k === messageID || v.key?.id === messageID))) 
       ?.[1].messages?.[messageID] 
     } 
  
     conn.decodeJid = (jid) => { 
         if (!jid) return jid 
         if (/:\d+@/gi.test(jid)) { 
             let decode = jidDecode(jid) || {} 
             return decode.user && decode.server && decode.user + '@' + decode.server || jid 
         } else return jid 
     } 
     if (conn.user && conn.user.id) conn.user.jid = conn.decodeJid(conn.user.id) 
     conn.chats = {} 
     conn.contacts = {} 
  
     function updateNameToDb(contacts) { 
         if (!contacts) return 
         for (let contact of contacts) { 
             let id = conn.decodeJid(contact.id) 
             if (!id) continue 
             let chats = conn.contacts[id] 
             if (!chats) chats = { id } 
             let chat = { 
                 ...chats, 
                 ...({ 
                     ...contact, id, ...(id.endsWith('@g.us') ? 
                         { subject: contact.subject || chats.subject || '' } : 
                         { name: contact.notify || chats.name || chats.notify || '' }) 
                 } || {}) 
             } 
             conn.contacts[id] = chat 
         } 
     } 
     conn.ev.on('contacts.upsert', updateNameToDb) 
     conn.ev.on('groups.update', updateNameToDb) 
     conn.ev.on('group-participants.update', async function updateParticipantsToDb({ id, participants, action }) { 
         id = conn.decodeJid(id) 
         if (!(id in conn.contacts)) conn.contacts[id] = { id } 
         let groupMetadata = Object.assign((conn.contacts[id].metadata || {}), await conn.groupMetadata(id)) 
         for (let participant of participants) { 
             participant = conn.decodeJid(participant) 
             switch (action) { 
                 case 'add': { 
                     if (participant == conn.user.jid) groupMetadata.readOnly = false 
                     let same = (groupMetadata.participants || []).find(user => user && user.id == participant) 
                     if (!same) groupMetadata.participants.push({ id, admin: null }) 
                 } 
                     break 
                 case 'remove': { 
                     if (participant == conn.user.jid) groupMetadata.readOnly = true 
                     let same = (groupMetadata.participants || []).find(user => user && user.id == participant) 
                     if (same) { 
                         let index = groupMetadata.participants.indexOf(same) 
                         if (index !== -1) groupMetadata.participants.splice(index, 1) 
                     } 
                 } 
                     break 
             } 
         } 
         conn.contacts[id] = { 
             ...conn.contacts[id], 
             subject: groupMetadata.subject, 
             desc: groupMetadata.desc.toString(), 
             metadata: groupMetadata 
         } 
     }) 
  
     conn.ev.on('groups.update', function groupUpdatePushToDb(groupsUpdates) { 
         for (let update of groupsUpdates) { 
             let id = conn.decodeJid(update.id) 
             if (!id) continue 
             if (!(id in conn.contacts)) conn.contacts[id] = { id } 
             if (!conn.contacts[id].metadata) conn.contacts[id].metadata = {} 
             let subject = update.subject 
             if (subject) conn.contacts[id].subject = subject 
             let announce = update.announce 
             if (announce) conn.contacts[id].metadata.announce = announce 
         } 
     }) 
     conn.ev.on('chats.upsert', function chatsUpsertPushToDb(chats_upsert) { 
         console.log({ chats_upsert }) 
     }) 
     conn.ev.on('presence.update', function presenceUpdatePushToDb({ id, presences }) { 
         let sender = Object.keys(presences)[0] || id 
         let _sender = conn.decodeJid(sender) 
         let presence = presences[sender]['lastKnownPresence'] || 'composing' 
         if (!(_sender in conn.contacts)) conn.contacts[_sender] = {} 
         conn.contacts[_sender].presences = presence 
     }) 
     conn.ev.on('CB:call', function onCallUpdatePushToDb(json) { 
         let call = json.tag 
         let callerId = json.attrs.from 
         console.log({ call, callerId }) 
     }) 
  
     conn.logger = { 
         ...conn.logger, 
         info(...args) { console.log(chalk.bold.rgb(57, 183, 16)(`INFO [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.cyan(...args)) }, 
         error(...args) { console.log(chalk.bold.rgb(247, 38, 33)(`ERROR [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.rgb(255, 38, 0)(...args)) }, 
         warn(...args) { console.log(chalk.bold.rgb(239, 225, 3)(`WARNING [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.keyword('orange')(...args)) } 
     } 
  
     /** 
      * getBuffer hehe 
      * @param {String|Buffer} path 
      * @param {Boolean} returnFilename 
      */ 
     conn.getFile = async (PATH, returnAsFilename) => { 
         let res, filename 
         let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0) 
         if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer') 
         let type = await FileType.fromBuffer(data) || { 
             mime: 'application/octet-stream', 
             ext: '.bin' 
         } 
         if (data && returnAsFilename && !filename) (filename = path.join(__dirname, '../tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data)) 
         return { 
             res, 
             filename, 
             ...type, 
             data 
         } 
     } 
      
     conn.resize = async(buffer, ukur1, ukur2) => { 
     return new Promise(async(resolve, reject) => { 
         var baper = await Jimp.read(buffer); 
         var ab = await baper.resize(ukur1, ukur2).getBufferAsync(Jimp.MIME_JPEG) 
         resolve(ab) 
     }) 
 } 
      
      conn.generateProfilePicture = async (buffer) => { 
         const jimp_1 = await Jimp.read(buffer); 
         const resz = jimp_1.getWidth() > jimp_1.getHeight() ? jimp_1.resize(550, Jimp.AUTO) : jimp_1.resize(Jimp.AUTO, 650) 
         const jimp_2 = await Jimp.read(await resz.getBufferAsync(Jimp.MIME_JPEG)); 
         return { 
           img: await resz.getBufferAsync(Jimp.MIME_JPEG) 
         } 
 } 
  
      
     /** 
      * waitEvent 
      * @param {*} eventName  
      * @param {Boolean} is  
      * @param {Number} maxTries  
      * @returns  
      */ 
     conn.waitEvent = (eventName, is = () => true, maxTries = 25) => { 
         return new Promise((resolve, reject) => { 
             let tries = 0 
             let on = (...args) => { 
                 if (++tries > maxTries) reject('Max tries reached') 
                 else if (is()) { 
                     conn.ev.off(eventName, on) 
                     resolve(...args) 
                 } 
             } 
             conn.ev.on(eventName, on) 
         }) 
     } 
  
     /** 
     * Send Media All Type  
     * @param {String} jid 
     * @param {String|Buffer} path 
     * @param {Object} quoted 
     * @param {Object} options  
     */ 
     conn.sendMedia = async (jid, path, quoted, options = {}) => { 
         let { ext, mime, data } = await conn.getFile(path) 
         messageType = mime.split("/")[0] 
         pase = messageType.replace('application', 'document') || messageType 
         return await conn.sendMessage(jid, { [`${pase}`]: data, mimetype: mime, ...options }, { quoted, ephemeralExpiration: 86400 }) 
     } 
  
     /** 
     * Translate Text  
     * @param {String} code 
     * @param {String|Buffer} text 
     */ 
     conn.translate = async (code, text) => { 
       let tr = require('translate-google-api') 
       return tr(text, { from: 'id', to: code }) 
     } 
  
     /** 
     * Send Media/File with Automatic Type Specifier 
     * @param {String} jid 
     * @param {String|Buffer} path 
     * @param {String} filename 
     * @param {String} caption 
     * @param {Object} quoted 
     * @param {Boolean} ptt 
     * @param {Object} options 
     */ 
     conn.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => { 
         let type = await conn.getFile(path, true) 
         let { res, data: file, filename: pathFile } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
             try { throw { json: JSON.parse(file.toString()) } } 
             catch (e) { if (e.json) throw e.json } 
         } 
         let opt = { filename } 
         if (quoted) opt.quoted = quoted 
         if (!type) if (options.asDocument) options.asDocument = true 
         let mtype = '', mimetype = type.mime 
         if (/webp/.test(type.mime)) mtype = 'sticker' 
         else if (/image/.test(type.mime)) mtype = 'image' 
         else if (/video/.test(type.mime)) mtype = 'video' 
         else if (/audio/.test(type.mime)) ( 
             convert = await (ptt ? toPTT : toAudio)(file, type.ext), 
             file = convert.data, 
             pathFile = convert.filename, 
             mtype = 'audio', 
             mimetype = 'audio/ogg; codecs=opus' 
         ) 
         else mtype = 'document' 
         return await conn.sendMessage(jid, { 
             ...options, 
             caption, 
             ptt, 
             [mtype]: { url: pathFile }, 
             mimetype 
         }, { 
             ephemeralExpiration: 86400, 
             ...opt, 
             ...options 
         }) 
     } 
  
     /** 
    * Send Contact 
    * @param {String} jid  
    * @param {String} number  
    * @param {String} name  
    * @param {Object} quoted  
    * @param {Object} options  
    */ 
     conn.sendContact = async (jid, number, name, quoted, options) => { 
         number = number.replace(/[^0-9]/g, '') 
         let njid = number + '@s.whatsapp.net' 
         let biz = await conn.getBusinessProfile(njid) || {} 
         let { exists } = await conn.onWhatsApp(njid) || { exists: false} 
         let vcard = ` 
 BEGIN:VCARD 
 VERSION:3.0 
 FN:${name.replace(/\n/g, '\\n')} 
 ORG: 
 item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')} 
 item1.X-ABLabel:Ponsel${biz.description ? ` 
 item2.EMAIL;type=INTERNET:${(biz.email || '').replace(/\n/g, '\\n')} 
 item2.X-ABLabel:Email 
 PHOTO;BASE64:${(await conn.getFile(await conn.profilePictureUrl(njid)).catch(_ => ({})) || {}).number?.toString('base64')} 
 X-WA-BIZ-DESCRIPTION:${(biz.description || '').replace(/\n/g, '\\n')} 
 X-WA-BIZ-NAME:${name.replace(/\n/g, '\\n')} 
 ` : ''} 
 END:VCARD 
 `.trim() 
         return await conn.sendMessage(jid, { 
             contacts: { 
                 displayName: name, 
                 contacts: [{ vcard }] 
             } 
         }, { quoted, ...options, ephemeralExpiration: 86400 }) 
     } 
  
     conn.sendKontak = async (jid, data, quoted, options) => { 
         let contacts = [] 
         for (let [number, nama, ponsel, email] of data) { 
             number = number.replace(/[^0-9]/g, '') 
             let njid = number + '@s.whatsapp.net' 
             let name = db.data.users[njid] ? db.data.users[njid].name : conn.getName(njid) 
             let biz = await conn.getBusinessProfile(njid) || {} 
             // N:;${name.replace(/\n/g, '\\n').split(' ').reverse().join(';')};;; 
             let vcard = ` 
 BEGIN:VCARD 
 VERSION:3.0 
 FN:${name.replace(/\n/g, '\\n')} 
 ORG: 
 item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')} 
 item1.X-ABLabel:📌 ${ponsel} 
 item2.EMAIL;type=INTERNET:${email} 
 item2.X-ABLabel:✉️ Email 
 X-WA-BIZ-DESCRIPTION:${(biz.description || '').replace(/\n/g, '\\n')} 
 X-WA-BIZ-NAME:${name.replace(/\n/g, '\\n')} 
 END:VCARD 
 `.trim() 
             contacts.push({ vcard, displayName: name }) 
  
         } 
         return await conn.sendMessage(jid, { 
             contacts: { 
                  ...options, 
                 displayName: (contacts.length > 1 ? `${contacts.length} kontak` : contacts[0].displayName) || null, 
                 contacts, 
             }, 
         }, { quoted, ...options, ephemeralExpiration: 86400 }) 
     } 
      
     /** 
      * Send Contact Array 
      * @param {String} jid  
      * @param {String} number  
      * @param {String} name  
      * @param {Object} quoted  
      * @param {Object} options  
      */ 
     conn.sendContactArrayS = async (jid, data, quoted, options) => { 
         let contacts = [] 
         for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5] of data) { 
             number = number.replace(/[^0-9]/g, '') 
             let njid = number + '@s.whatsapp.net' 
             let biz = await conn.getBusinessProfile(njid) || {} 
             // N:;${name.replace(/\n/g, '\\n').split(' ').reverse().join(';')};;; 
             let vcard = ` 
 BEGIN:VCARD 
 VERSION:3.0 
 N:Sy;Bot;;; 
 FN:${name.replace(/\n/g, '\\n')} 
 item.ORG:${isi} 
 item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')} 
 item1.X-ABLabel:${isi1} 
 item2.EMAIL;type=INTERNET:${isi2} 
 item2.X-ABLabel:📧 Email 
 item3.ADR:;;${isi3};;;; 
 item3.X-ABADR:ac 
 item3.X-ABLabel:📍 Region 
 item4.URL:${isi4} 
 item4.X-ABLabel:Website 
 item5.X-ABLabel:${isi5} 
 END:VCARD`.trim() 
             contacts.push({ vcard, displayName: name }) 
  
         } 
         return await conn.sendMessage(jid, { 
             contacts: { 
                 displayName: (contacts.length > 1 ? `2013 kontak` : contacts[0].displayName) || null, 
                 contacts, 
             } 
         }, 
             { 
                 quoted, 
                 ...options 
             }) 
     } 
  
     /** 
     *status  
     */ 
     conn.setBio = async (status) => { 
         return await conn.query({ 
             tag: 'iq', 
             attrs: { 
                 to: 's.whatsapp.net', 
                 type: 'set', 
                 xmlns: 'status', 
             }, 
             content: [ 
                 { 
                     tag: 'status', 
                     attrs: {}, 
                     content: Buffer.from(status, 'utf-8') 
                 } 
             ] 
         }) 
         // <iq to="s.whatsapp.net" type="set" xmlns="status" id="21168.6213-69"><status>"Hai, saya menggunakan WhatsApp"</status></iq> 
     } 
  
     /** 
      * Reply to a message 
      * @param {String} jid 
      * @param {String|Object} text 
      * @param {Object} quoted 
      * @param {Object} mentions [m.sender] 
      */ 
     conn.reply = (jid, text = '', quoted, options) => { 
         let pp = conn.profilePictureUrl(conn.user.jid, 'image') 
         const _uptime = process.uptime() * 1000 
         const u = conn.clockString(_uptime) 
         return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMessage(jid, { ...options, 
         text, 
         mentions: conn.parseMention(text), 
         contextInfo:  
         { mentions: conn.parseMention(text), 
         externalAdReply :{ 
         showAdAttribution: true, 
         sourceUrl: 'https://youtu.be/-tKVN2mAKRI', 
         title: 'Cute Bot By Ziv San', 
         body: wm, 
         thumbnail: fs.readFileSync('./thumbnail.jpg'), 
         }}, 
         mentions: conn.parseMention(text), 
         ...options }, { 
             quoted, 
             ephemeralExpiration: 86400, 
             ...options 
         }) 
     } 
     conn.fakeReply = (jid, text = '', fakeJid = conn.user.jid, fakeText = '', fakeGroupJid, options) => { 
         return conn.sendMessage(jid, { text: text }, { ephemeralExpiration: 86400, quoted: { key: { fromMe: fakeJid == conn.user.jid, participant: fakeJid, ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}) }, message: { conversation: fakeText }, ...options } }) 
     } 
     conn.reply1 = async (jid, text, quoted, men) => { 
         return conn.sendMessage(jid, { 
             text: text, jpegThumbnail: await (await fetch(thumbr1)).buffer(), mentions: men 
         }, { quoted: quoted, ephemeralExpiration: 86400 }) 
     } 
     conn.reply2 = async (jid, text, media, quoted, men) => { 
         return conn.sendMessage(jid, { 
             text: text, jpegThumbnail: await (await fetch(media)).buffer(), mentions: men 
         }, { quoted: quoted, ephemeralExpiration: 8600 }) 
     } 
  
     /** 
     * Send a list message 
     * @param jid the id to send to 
     * @param button the optional button text, title and description button 
     * @param rows the rows of sections list message 
     */ 
     conn.sendListM = async (jid, button, rows, quoted, options = {}) => { 
         const sections = [ 
             { 
                 title: button.title, 
                 rows: [...rows] 
             } 
         ] 
         const listMessage = { 
             text: button.description, 
             footer: button.footerText, 
             mentions: await conn.parseMention(button.description), 
             ephemeralExpiration: 86400, 
             title: '', 
             buttonText:button.buttonText, 
             sections 
         } 
         conn.sendMessage(jid, listMessage, { 
             quoted, 
             ephemeralExpiration: 86400, 
             contextInfo: { 
                 forwardingScore: 999999, 
                 isForwarded: true, 
                 mentions: await conn.parseMention(button.description + button.footerText), 
                 ...options 
             } 
         }) 
     } 
     
     /** 
      * send Button Document 
      * @param {String} jid  
      * @param {String} contentText  
      * @param {String} footer 
      * @param {Buffer|String} buffer  
      * @param {String[]} buttons  
      * @param {Object} quoted  
      * @param {Object} options  
      */ 
     conn.sendButtonDoc = async (jid, content, footerText, button1, id1, quoted, options) => { 
       const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 } 
       ] 
       const buttonMessage = { 
         document: bg, 
         mimetype: doc, 
         fileName: ucapan, 
         fileLength: 887890909999999, 
         pageCount: 1234567890123456789012345, 
         caption: content, 
         footer: footerText, 
         mentions: await conn.parseMention(content + footerText), 
         ...options, 
         buttons: buttons, 
         headerType: 1 
       } 
       conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, forwardingScore: 99999, isForwarded: true, ...options }) 
     } 
     conn.send2ButtonDoc = async (jid, content, footerText, button1, id1, button2, id2, quoted, options) => { 
         const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: id2, buttonText: { displayText: button2 }, type: 1 } 
         ] 
         const buttonMessage = { 
             document: bg, 
             mimetype: doc, 
             fileName: ucapan, 
             fileLength: 887890909999999, 
             pageCount: 1234567890123456789012345, 
             caption: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ...options, 
             buttons: buttons, 
             headerType: 1 
         } 
         conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: conn.parseMention(content + footerText), forwardingScore: 99999, isForwarded: true }, ...options, ephemeralExpiration: 86400 } ) 
     } 
     conn.send2ButtonImgDoc = async (jid, buffer, contentText, footerText, button1, id1, button2, id2, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: id2, buttonText: { displayText: button2 }, type: 1 } 
         ] 
  
         const buttonMessage = { 
             image: file, 
             document: bg, 
             mimetype: doc, 
             fileName: ucapan, 
             fileLength: 887890909999999, 
             pageCount: 1234567890123456789012345, 
             fileLength: 887890909999999, 
             caption: contentText, 
             footer: footerText, 
             mentions: await conn.parseMention(contentText + footerText), 
             ...options, 
             buttons: buttons, 
             headerType: 4 
         } 
  
         return await conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: conn.parseMention(contentText + footerText) }, ...options }) 
     } 
  
     conn.sendButton = async (jid, content, footerText, button1, id1, quoted, options) => { 
         const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         ] 
         const buttonMessage = { 
             text: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ephemeralExpiration: 86400, 
             ...options, 
             buttons: buttons, 
             headerType: 1 
         } 
         conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: conn.parseMention(content + footerText), forwardingScore: 999999, isForwarded: true }, ...options }) 
     } 
     conn.send2Button = async (jid, content, footerText, button1, id1, button2, id2, quoted, options) => { 
         const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: id2, buttonText: { displayText: button2 }, type: 1 } 
         ] 
         const buttonMessage = { 
             text: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ephemeralExpiration: 86400, 
             ...options, 
             buttons: buttons, 
             headerType: 1 
         } 
         conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: conn.parseMention(content + footerText), forwardingScore: 999999, isForwarded: true }, ...options }) 
     } 
     conn.send3Button = async (jid, content, footerText, button1, id1, button2, id2, button3, id3, quoted, options) => { 
         const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }, 
         { buttonId: id3, buttonText: { displayText: button3 }, type: 1 } 
         ] 
         const buttonMessage = { 
             text: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ephemeralExpiration: 86400, 
             ...options, 
             buttons: buttons, 
             headerType: 1 
         } 
         conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentions: conn.parseMention(content + footerText), forwardingScore: 99999, isForwarded: true }, ...options }) 
     } 
  
     /** 
      * send Button Loc 
      * @param {String} jid  
      * @param {String} contentText 
      * @param {String} footer 
      * @param {Buffer|String} buffer 
      * @param {String[]} buttons  
      * @param {Object} quoted  
      * @param {Object} options  
      */ 
     conn.sendButtonLoc = async (jid, buffer, content, footer, button1, row1, quoted, options = {}) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 100 || file.length <= 100) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         let buttons = [ 
         { buttonId: row1, buttonText: { displayText: button1 }, type: 1 } 
         ] 
      
         let buttonMessage = { 
             location: { jpegThumbnail: file }, 
             caption: content, 
             footer: footer, 
             mentions: await conn.parseMention(content + footer), 
             ...options, 
             buttons: buttons, 
             headerType: 6 
         } 
         return await  conn.sendMessage(jid, buttonMessage, { 
             quoted, 
             upload: conn.waUploadToServer, 
             ephemeralExpiration: 86400, 
             mentions: await conn.parseMention(content + footer), 
             ...options 
         }) 
     } 
     conn.send2ButtonLoc = async (jid, buffer, content, footer, button1, row1, button2, row2, quoted, options = {}) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 50 || file.length <= 50) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         let buttons = [ 
         { buttonId: row1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: row2, buttonText: { displayText: button2 }, type: 1 } 
         ] 
          
         let buttonMessage = { 
             location: { jpegThumbnail: file }, 
             caption: content, 
             footer: footer, 
             mentions: await conn.parseMention(content + footer), 
             ...options, 
             buttons: buttons, 
             headerType: 6 
         } 
         return await  conn.sendMessage(jid, buttonMessage, { 
             quoted, 
             upload: conn.waUploadToServer, 
             ephemeralExpiration: 86400, 
             mentions: await conn.parseMention(content + footer), 
             ...options 
         }) 
     } 
     conn.send3ButtonLoc = async (jid, buffer, content, footer, button1, row1, button2, row2, button3, row3, quoted, options = {}) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 100 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         let buttons = [ 
         { buttonId: row1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: row2, buttonText: { displayText: button2 }, type: 1 }, 
         { buttonId: row3, buttonText: { displayText: button3 }, type: 1 } 
         ] 
          
         let buttonMessage = { 
             location: { jpegThumbnail: file }, 
             caption: content, 
             footer: footer, 
             mentions: await conn.parseMention(content + footer), 
             ...options, 
             buttons: buttons, 
             headerType: 6 
         } 
         return await  conn.sendMessage(jid, buttonMessage, { 
             quoted, 
             upload: conn.waUploadToServer, 
             ephemeralExpiration: 86400, 
             mentions: await conn.parseMention(content + footer), 
             ...options 
         }) 
     } 
  
     /** 
      * send Button Img 
      * @param {String} jid  
      * @param {String} contentText  
      * @param {String} footer 
      * @param {Buffer|String} buffer  
      * @param {String[]} buttons 
      * @param {Object} quoted  
      * @param {Object} options  
      */ 
     conn.sendButtonImg = async (jid, buffer, contentText, footerText, button1, id1, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 } 
         ] 
  
         const buttonMessage = { 
             image: file, 
             fileLength: 887890909999999, 
             caption: contentText, 
             footer: footerText, 
             mentions: await conn.parseMention(contentText + footerText), 
             ...options, 
             buttons: buttons, 
             headerType: 4 
         } 
  
         return await conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: conn.parseMention(contentText + footerText) }, ...options }) 
     } 
     conn.send2ButtonImg = async (jid, buffer, contentText, footerText, button1, id1, button2, id2, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: id2, buttonText: { displayText: button2 }, type: 1 } 
         ] 
  
         const buttonMessage = { 
             image: file, 
             fileLength: 887890909999999, 
             caption: contentText, 
             footer: footerText, 
             mentions: await conn.parseMention(contentText + footerText), 
             ...options, 
             buttons: buttons, 
             headerType: 4 
         } 
  
         return await conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400,contextInfo: { externalAdReply :{ 
         showAdAttribution: true, 
         mediaUrl: data.sc, 
         mediaType: 2, 
         description: data.deslink,  
         title: run, 
         body: wm, 
         thumbnail: bg, 
         sourceUrl: data.sc 
         }}, ...options }) 
     } 
     conn.send3ButtonImg = async (jid, buffer, contentText, footerText, button1, id1, button2, id2, button3, id3, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         const buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }, 
         { buttonId: id3, buttonText: { displayText: button3 }, type: 1 } 
         ] 
  
         const buttonMessage = { 
             image: file, 
             fileLength: 887890909999999, 
             caption: contentText, 
             footer: footerText, 
             mentions: await conn.parseMention(contentText + footerText), 
             ...options, 
             buttons: buttons, 
             headerType: 4 
         } 
  
         return await conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: conn.parseMention(contentText + footerText) }, ...options }) 
     } 
  
     /** 
      * send Button Vid 
      * @param {String} jid  
      * @param {String} contentText  
      * @param {String} footer 
      * @param {Buffer|String} buffer 
      * @param {String} buttons1 
      * @param {String} row1 
      * @param {Object} quoted  
      * @param {Object} options  
      */ 
     conn.sendButtonVid = async (jid, buffer, contentText, footerText, button1, id1, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         let buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 } 
         ] 
         const buttonMessage = { 
             video: file, 
             fileLength: 887890909999999, 
             caption: contentText, 
             footer: footerText, 
             mentions: await conn.parseMention(contentText), 
             ...options, 
             buttons: buttons, 
             headerType: 4 
         } 
         return await conn.sendMessage(jid, buttonMessage, { 
             quoted, 
             ephemeralExpiration: 86400, 
             ...options 
         }) 
     } 
     conn.send2ButtonVid = async (jid, buffer, contentText, footerText, button1, id1, button2, id2, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         let buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: id2, buttonText: { displayText: button2 }, type: 1 } 
         ] 
         const buttonMessage = { 
             video: file, 
             fileLength: 887890909999999, 
             caption: contentText, 
             footer: footerText, 
             mentions: await conn.parseMention(contentText + footerText), 
             ...options, 
             buttons: buttons, 
             headerType: 4 
         } 
         return await conn.sendMessage(jid, buttonMessage, { 
             quoted, 
             ephemeralExpiration: 86400, 
             ...options 
         }) 
     } 
     conn.send3ButtonVid = async (jid, buffer, contentText, footerText, button1, id1, button2, id2, button3, id3, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         let buttons = [ 
         { buttonId: id1, buttonText: { displayText: button1 }, type: 1 }, 
         { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }, 
         { buttonId: id3, buttonText: { displayText: button3 }, type: 1 }, 
         ] 
         const buttonMessage = { 
             video: file, 
             //fileLength: 887890909999999, 
             caption: contentText, 
             footer: footerText, 
             mentions: await conn.parseMention(contentText + footerText), 
             ...options, 
             buttons: buttons, 
             headerType: 4 
         } 
         return await conn.sendMessage(jid, buttonMessage, { 
             quoted, 
             ephemeralExpiration: 86400, 
             ...options 
         }) 
     } 
  
     //========== Template Here ==========//  
  
     /** 
      *  
      * @param {String} jid  
      * @param {String} text  
      * @param {String} footer  
      * @param {fs.PathLike} buffer  
      * @param {String} url  
      * @param {String} urlText 
      * @param {String} call  
      * @param {String} callText 
      * @param {String} buttons  
      * @param {proto.WebMessageInfo} quoted  
      * @param {Object} options  
      */ 
     conn.sendHydrated = async (jid, text = '', footer = '', buffer, url, urlText, call, callText, buttons, quoted, options = {}) => { 
         let type 
         if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = null } 
         let templateButtons = [] 
         if (url || urlText) templateButtons.push({ 
             index: 1, 
             urlButton: { 
                 displayText: urlText || url || '', 
                 url: url || urlText || '' 
             } 
         }) 
         if (call || callText) templateButtons.push({ 
             index: templateButtons.length + 1, 
             callButton: { 
                 displayText: callText || call || '', 
                 phoneNumber: call || callText || '' 
             } 
         }) 
         templateButtons.push(...(buttons.map(([text, id], index) => ({ 
             index: templateButtons.length + index + 1, 
             quickReplyButton: { 
                 displayText: text || id || '', 
                 id: id || text || '' 
             } 
         })) || [])) 
         let message = { 
             ...options, 
             [buffer ? 'caption' : 'text']: text || '', 
             footer, 
             templateButtons, 
             ...(buffer ? 
                 options.asLocation && /image/.test(type.mime) ? { 
                     location: { 
                         ...options, 
                         jpegThumbnail: buffer 
                     } 
                 } : { 
                     [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer 
                 } : {}) 
         } 
  
         delete options.asLocation 
         delete options.asVideo 
         delete options.asDocument 
         delete options.asImage 
         return await conn.sendMessage(jid, message, { 
             quoted, 
             upload: conn.waUploadToServer, 
             ...options 
         }) 
     } 
      
     /** 
     * send Template Button 
     * @param {String} jid  
     * @param {String} contentText  
     * @param {String} footer 
     * @param {String} buttons 
     * @param {String} row 
     * @param {Object} quoted  
     */ 
     conn.send3TemplateButtonImg = async (jid, buffer, content, footerText, button1, id1, button2, id2, button3, id3, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         const buttons = [ 
             { index: 1, urlButton: { displayText: data.dtu, url: data.urlnya } }, 
             { index: 2, quickReplyButton: { displayText: button1, id: id1 } }, 
             { index: 3, quickReplyButton: { displayText: button2, id: id2 } }, 
             { index: 4, quickReplyButton: { displayText: button3, id: id3 } } 
         ] 
         const buttonMessage = { 
             image: file, 
             caption: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ephemeralExpiration: 86400, 
             ...options, 
             templateButtons: buttons, 
             headerType: 1 
         } 
         conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: conn.parseMention(content + footerText), forwardingScore: 99999, isForwarded: true }, ...options, ephemeralExpiration: 86400 } ) 
     } 
     conn.sendTemplateButtonDoc = async (jid, buffer, content, footerText, button1, id1, quoted, options) => { 
         const buttons = [ 
             { index: 1, urlButton: { displayText: data.dtu, url: data.urlnya } }, 
             { index: 2, callButton: { displayText: data.dtc,  phoneNumber: data.phn } }, 
             { index: 3, quickReplyButton: { displayText: button1, id: id1 } }, 
         ] 
         const buttonMessage = { 
             document: bg, 
             mimetype: doc, 
             fileName: ucapan, 
             fileLength: 887890909999999, 
             pageCount: 1234567890123456789012345, 
             caption: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ...options, 
             templateButtons: buttons, 
             headerType: 1 
         } 
         conn.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: conn.parseMention(content + footerText), forwardingScore: 99999, isForwarded: true }, ...options, ephemeralExpiration: 86400 } ) 
     } 
     conn.sendTemplateButtonLoc = async (jid, buffer, contentText, footer, buttons1, row1, quoted, options) => { 
     const type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 100 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
     const template = generateWAMessageFromContent(jid, proto.Message.fromObject({ 
       templateMessage: { 
         hydratedTemplate: { 
           locationMessage: { jpegThumbnail: file }, 
           hydratedContentText: contentText, 
           hydratedFooterText: footer, 
           ...options, 
           hydratedButtons: [{ 
             urlButton: { 
               displayText: data.dtu, 
               url: data.urlnya 
             } 
           }, 
           { 
             quickReplyButton: { 
               displayText: buttons1, 
               id: row1 
             } 
           }] 
         } 
       } 
     }), { userJid: conn.user.jid, quoted: quoted, contextInfo: { mentionedJid: conn.parseMention(contentText + footer) }, ephemeralExpiration: 86400, ...options }); 
     return await conn.relayMessage( 
       jid, 
       template.message, 
       { messageId: template.key.id } 
     ) 
   } 
     conn.send3TemplateButtonLoc = async (jid, buffer, contentText, footer, buttons1, row1, buttons2, row2, buttons3, row3, quoted, options) => { 
     const type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
     const template = generateWAMessageFromContent(jid, proto.Message.fromObject({ 
       templateMessage: { 
         hydratedTemplate: { 
           locationMessage: { jpegThumbnail: file }, 
           hydratedContentText: contentText, 
           hydratedFooterText: footer, 
           ...options, 
           hydratedButtons: [{ 
             urlButton: { 
               displayText: data.dtu, 
               url: data.urlnya 
             } 
           }, 
           { 
             quickReplyButton: { 
               displayText: buttons1, 
               id: row1, 
               displayText: buttons2, 
               id: row2, 
               displayText: buttons3, 
               id: row3 
             } 
           }] 
         } 
       } 
     }), { userJid: conn.user.jid, quoted: quoted, contextInfo: { mentionedJid: conn.parseMention(contentText + footer) }, ephemeralExpiration: 86400, ...options }); 
     return await conn.relayMessage( 
       jid, 
       template.message, 
       { messageId: template.key.id } 
     ) 
   } 
     conn.sendTemplateButtonFakeImg = async (jid, buffer, content, footerText, btn1, id1, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         const key = { 
             video: file, 
             jpegThumbnail: file, 
             fileLength: 887890909999999, 
             caption: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ...options, 
             templateButtons: [ 
             { index: 1, urlButton: { displayText: data.dtu, url: data.urlnya } }, 
             { index: 2, callButton: { displayText: data.dtc,  phoneNumber: data.phn } }, 
             { index: 3, quickReplyButton: { displayText: btn1, id: id1 } }, 
             ], 
             ...options 
         } 
         conn.sendMessage(jid, key, { ephemeralExpiration: 86400, mentions: conn.parseMention(content + footerText), contextInfo: { forwardingScore: 99999, isForwarded: true }, ...options }) 
     } 
     conn.send2TemplateButtonFakeImg = async (jid, buffer, content, footerText, btn1, id1, btn2, id2, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         const key = { 
             video: file, 
             jpegThumbnail: file, 
             fileLength: 887890909999999, 
             caption: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ...options, 
             templateButtons: [ 
             { index: 1, urlButton: { displayText: data.dtu, url: data.urlnya } }, 
             { index: 2, callButton: { displayText: data.dtc,  phoneNumber: data.phn } }, 
             { index: 3, quickReplyButton: { displayText: btn1, id: id1 } }, 
             { index: 4, quickReplyButton: { displayText: btn2, id: id2 } }, 
             ] 
         } 
         conn.sendMessage(jid, key, { quoted, ephemeralExpiration: 86400, contextInfo: { mentions: conn.parseMention(content + footerText), forwardingScore: 9999, isForwarded: true } }) 
     } 
     conn.send3TemplateButtonFakeImg = async (jid, buffer, content, footerText, btn1, id1, btn2, id2, btn3, id3, quoted, options) => { 
         let type = await conn.getFile(buffer) 
         let { res, data: file } = type 
         if (res && res.status !== 200 || file.length <= 65536) { 
         try { throw { json: JSON.parse(file.toString()) } } 
         catch (e) { if (e.json) throw e.json } 
         } 
         const key = { 
             video: file, 
             jpegThumbnail: file, 
             fileLength: 887890909999999, 
             caption: content, 
             footer: footerText, 
             mentions: await conn.parseMention(content + footerText), 
             ...options, 
             templateButtons: [ 
             { index: 1, urlButton: { displayText: data.dtu, url: data.urlnya } }, 
             { index: 2, callButton: { displayText: data.dtc,  phoneNumber: data.phn } }, 
             { index: 3, quickReplyButton: { displayText: btn1, id: id1 } }, 
             { index: 4, quickReplyButton: { displayText: btn2, id: id2 } }, 
             { index: 5, quickReplyButton: { displayText: btn3, id: id3 } } 
             ] 
         } 
         conn.sendMessage(jid, key, { quoted, ephemeralExpiration: 86400, contextInfo: { forwardingScore: 9999, isForwarded: true, mentions: conn.parseMention(content) } }) 
     } 
  
     /** 
        * send Button Video Gif 
        * @param {String} jid  
        * @param {String} contentText  
        * @param {String} footer 
        * @param {Buffer|String} buffer  
        * @param {String} buttons1 
        * @param {String} row1 
        * @param {Object} quoted  
        * @param {Object} options  
        */ 
  
  
     conn.sendTBVG = async (jid, contentText, footer, video, dtux, urlx, dtcx, nmbrx, buttons1, row1, buttons2, row2, buttons3, row3, quoted, options) => { 
         const message = { 
             video: { url: video }, ...options, 
             gifPlayback: true, jpegThumbnail: await (await fetch(img)).buffer(), fileLength: 999999999999, 
             caption: contentText, 
             footer: footer, 
             templateButtons: [ 
                 { 
                     urlButton: { 
                         displayText: data.dtu, 
                         url: data.urlnya 
                     } 
                 }, 
                 { 
                     callButton: { 
                         displayText: data.dtc, 
                         phoneNumber: data.phn 
                     } 
                 }, 
                 { 
                     quickReplyButton: { 
                         displayText: buttons1, 
                         id: row1 
                     } 
                 }, 
                 { 
                     quickReplyButton: { 
                         displayText: buttons2, 
                         id: row2 
                     } 
                 }, 
                 { 
                     quickReplyButton: { 
                         displayText: buttons3, 
                         id: row3 
                     } 
                 }, 
             ] 
         } 
         return await conn.sendMessage(jid, message, { quoted: quoted }) 
     } 
     /** 
     * sendGroupV4Invite 
     * @param {String} jid  
     * @param {*} participant  
     * @param {String} inviteCode  
     * @param {Number} inviteExpiration  
     * @param {String} groupName  
     * @param {String} caption  
     * @param {*} options  
     * @returns  
     */ 
     conn.sendGroupV4Invite = async (jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', options = {}) => { 
         let msg = proto.Message.fromObject({ 
             groupInviteMessage: proto.GroupInviteMessage.fromObject({ 
                 inviteCode, 
                 inviteExpiration: parseInt(inviteExpiration) || + new Date(new Date + (3 * 86400000)), 
                 groupJid: jid, 
                 groupName: groupName ? groupName : this.getName(jid), 
                 caption 
             }) 
         }) 
         let message = await this.prepareMessageFromContent(participant, msg, options) 
         await this.relayWAMessage(message) 
         return message 
     } 
  
     /** 
      * nemu 
      * Message 
      */ 
     conn.relayWAMessage = async (pesanfull) => { 
         if (pesanfull.message.audioMessage) { 
             await conn.sendPresenceUpdate('recording', pesanfull.key.remoteJid) 
         } else { 
             await conn.sendPresenceUpdate('composing', pesanfull.key.remoteJid) 
         } 
         var mekirim = await conn.relayMessage(pesanfull.key.remoteJid, pesanfull.message, { messageId: pesanfull.key.id }) 
         conn.ev.emit('messages.upsert', { messages: [pesanfull], type: 'append' }); 
         return mekirim 
     } 
  
     /** 
     * cMod 
     * @param {String} jid  
     * @param {*} message  
     * @param {String} text  
     * @param {String} sender  
     * @param {*} options  
     * @returns  
     */ 
  
     conn.cMod = async (jid, message, text = '', sender = conn.user.jid, options = {}) => { 
         if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions] 
         let copy = message.toJSON() 
         delete copy.message.messageContextInfo 
         delete copy.message.senderKeyDistributionMessage 
         let mtype = Object.keys(copy.message)[0] 
         let msg = copy.message 
         let content = msg[mtype] 
         if (typeof content === 'string') msg[mtype] = text || content 
         else if (content.caption) content.caption = text || content.caption 
         else if (content.text) content.text = text || content.text 
         if (typeof content !== 'string') { 
             msg[mtype] = { ...content, ...options } 
             msg[mtype].contextInfo = { 
                 ...(content.contextInfo || {}), 
                 mentionedJid: options.mentions || content.contextInfo?.mentionedJid || [] 
             } 
         } 
         if (copy.participant) sender = copy.participant = sender || copy.participant 
         else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant 
         if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid 
         else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid 
         copy.key.remoteJid = jid 
         copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false 
         return proto.WebMessageInfo.fromObject(copy) 
     } 
     /** 
      * Exact Copy Forward 
      * @param {String} jid 
      * @param {Object} message 
      * @param {Boolean|Number} forwardingScore 
      * @param {Object} options 
      */ 
     conn.copyNForward = async (jid, message, forwardingScore = true, options = {}) => { 
         let m = generateForwardMessageContent(message, !!forwardingScore) 
         let mtype = Object.keys(m)[0] 
         if (forwardingScore && typeof forwardingScore == 'number' && forwardingScore > 1) m[mtype].contextInfo.forwardingScore += forwardingScore 
         m = generateWAMessageFromContent(jid, m, { ...options, userJid: conn.user.id }) 
         await conn.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } }) 
         return m 
     } 
     /** 
      * Download media message 
      * @param {Object} m 
      * @param {String} type  
      * @param {fs.PathLike|fs.promises.FileHandle} filename 
      * @returns {Promise<fs.PathLike|fs.promises.FileHandle|Buffer>} 
      */ 
     conn.downloadM = async (m, type, filename = '') => { 
         if (!m || !(m.url || m.directPath)) return Buffer.alloc(0) 
         const stream = await downloadContentFromMessage(m, type) 
         let buffer = Buffer.from([]) 
         for await (const chunk of stream) { 
             buffer = Buffer.concat([buffer, chunk]) 
         } 
         if (filename) await fs.promises.writeFile(filename, buffer) 
         return filename && fs.existsSync(filename) ? filename : buffer 
     } 
     /** 
      * By Fokus ID 
      * @param {*} message  
      * @param {*} filename  
      * @param {*} attachExtension  
      * @returns  
      */ 
     conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => { 
         let quoted = message.msg ? message.msg : message 
         let mime = (message.msg || message).mimetype || '' 
         let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0] 
         const stream = await downloadContentFromMessage(quoted, messageType) 
         let buffer = Buffer.from([]) 
         for await(const chunk of stream) { 
             buffer = Buffer.concat([buffer, chunk]) 
         } 
     let type = await FileType.fromBuffer(buffer) 
         trueFileName = attachExtension ? (filename + '.' + type.ext) : filename 
         // save to file 
         await fs.writeFileSync(trueFileName, buffer) 
         return trueFileName 
     } 
  
     /** 
      * Read message 
      * @param {String} jid  
      * @param {String|undefined|null} participant  
      * @param {String} messageID  
      */ 
     conn.chatRead = async (jid, participant, messageID) => { 
         return await conn.sendReadReceipt(jid, participant, [messageID]) 
     } 
  
     /** 
      * Parses string into mentionedJid(s) 
      * @param {String} text 
      */ 
     conn.parseMention = async (text = '') => { 
         return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net') 
     } 
  
     conn.sendStimg = async (jid, path, quoted, options = {}) => { 
         let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0) 
         let buffer 
         if (options && (options.packname || options.author)) { 
             buffer = await writeExifImg(buff, options) 
         } else { 
             buffer = await imageToWebp(buff) 
         } 
         await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted }) 
         return buffer 
     } 
  
     conn.sendStvid = async (jid, path, quoted, options = {}) => { 
         let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0) 
         let buffer 
         if (options && (options.packname || options.author)) { 
             buffer = await writeExifVid(buff, options) 
         } else { 
             buffer = await videoToWebp(buff) 
         } 
         await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted }) 
         return buffer 
     } 
  
     conn.saveName = async (id, name = '') => { 
         if (!id) return 
         id = conn.decodeJid(id) 
         let isGroup = id.endsWith('@g.us') 
         if (id in conn.contacts && conn.contacts[id][isGroup ? 'subject' : 'name'] && id in conn.chats) return 
         let metadata = {} 
         if (isGroup) metadata = await conn.groupMetadata(id) 
         let chat = { ...(conn.contacts[id] || {}), id, ...(isGroup ? { subject: metadata.subject, desc: metadata.desc } : { name }) } 
         conn.contacts[id] = chat 
         conn.chats[id] = chat 
     } 
  
     /** 
      * Get name from jid 
      * @param {String} jid 
      * @param {Boolean} withoutContact 
      */ 
     conn.getName = (jid = '', withoutContact = false) => { 
         jid = conn.decodeJid(jid) 
         withoutContact = conn.withoutContact || withoutContact 
         let v 
         if (jid.endsWith('@g.us')) return new Promise(async (resolve) => { 
             v = conn.chats[jid] || {} 
             if (!(v.name || v.subject)) v = await conn.groupMetadata(jid) || {} 
             resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')) 
         }) 
         else v = jid === '0@s.whatsapp.net' ? { 
             jid, 
             vname: 'WhatsApp' 
         } : areJidsSameUser(jid, conn.user.id) ? 
             conn.user : 
             (conn.chats[jid] || {}) 
         return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') 
     } 
      
     conn.processMessageStubType = async(m) => { 
     /** 
      * to process MessageStubType 
      * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m  
      */ 
     if (!m.messageStubType) return 
         const chat = conn.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '') 
     if (!chat || chat === 'status@broadcast') return 
         const emitGroupUpdate = (update) => { 
             conn.ev.emit('groups.update', [{ id: chat, ...update }]) 
         } 
         switch (m.messageStubType) { 
             case WAMessageStubType.REVOKE: 
             case WAMessageStubType.GROUP_CHANGE_INVITE_LINK: 
             emitGroupUpdate({ revoke: m.messageStubParameters[0] }) 
             break 
             case WAMessageStubType.GROUP_CHANGE_ICON: 
             emitGroupUpdate({ icon: m.messageStubParameters[0] }) 
             break 
             default: { 
                 console.log({ 
                     messageStubType: m.messageStubType, 
                     messageStubParameters: m.messageStubParameters, 
                     type: WAMessageStubType[m.messageStubType] 
                 }) 
                 break 
             } 
         } 
         const isGroup = chat.endsWith('@g.us') 
         if (!isGroup) return 
         let chats = conn.chats[chat] 
         if (!chats) chats = conn.chats[chat] = { id: chat } 
         chats.isChats = true 
         const metadata = await conn.groupMetadata(chat).catch(_ => null) 
         if (!metadata) return 
         chats.subject = metadata.subject 
         chats.metadata = metadata 
     } 
     conn.insertAllGroup = async() => { 
         const groups = await conn.groupFetchAllParticipating().catch(_ => null) || {} 
         for (const group in groups) conn.chats[group] = { ...(conn.chats[group] || {}), id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] } 
             return conn.chats 
     } 
     conn.pushMessage = async(m) => { 
     /** 
      * pushMessage 
      * @param {import('@adiwajshing/baileys').proto.WebMessageInfo[]} m  
      */ 
     if (!m) return 
         if (!Array.isArray(m)) m = [m] 
             for (const message of m) { 
                 try { 
                 // if (!(message instanceof proto.WebMessageInfo)) continue // https://github.com/adiwajshing/Baileys/pull/696/commits/6a2cb5a4139d8eb0a75c4c4ea7ed52adc0aec20f 
                 if (!message) continue 
                     if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) conn.processMessageStubType(message).catch(console.error) 
                         const _mtype = Object.keys(message.message || {}) 
                     const mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) || 
                     (_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) || 
                     _mtype[_mtype.length - 1] 
                     const chat = conn.decodeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '') 
                     if (message.message?.[mtype]?.contextInfo?.quotedMessage) { 
                     /** 
                      * @type {import('@adiwajshing/baileys').proto.IContextInfo} 
                      */ 
                     let context = message.message[mtype].contextInfo 
                     let participant = conn.decodeJid(context.participant) 
                     const remoteJid = conn.decodeJid(context.remoteJid || participant) 
                     /** 
                      * @type {import('@adiwajshing/baileys').proto.IMessage} 
                      *  
                      */ 
                     let quoted = message.message[mtype].contextInfo.quotedMessage 
                     if ((remoteJid && remoteJid !== 'status@broadcast') && quoted) { 
                         let qMtype = Object.keys(quoted)[0] 
                         if (qMtype == 'conversation') { 
                             quoted.extendedTextMessage = { text: quoted[qMtype] } 
                             delete quoted.conversation 
                             qMtype = 'extendedTextMessage' 
                         } 
  
                         if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {} 
                         quoted[qMtype].contextInfo.mentionedJid = context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || [] 
                         const isGroup = remoteJid.endsWith('g.us') 
                         if (isGroup && !participant) participant = remoteJid 
                             const qM = { 
                                 key: { 
                                     remoteJid, 
                                     fromMe: areJidsSameUser(conn.user.jid, remoteJid), 
                                     id: context.stanzaId, 
                                     participant, 
                                 }, 
                                 message: JSON.parse(JSON.stringify(quoted)), 
                                 ...(isGroup ? { participant } : {}) 
                             } 
                             let qChats = conn.chats[participant] 
                             if (!qChats) qChats = conn.chats[participant] = { id: participant, isChats: !isGroup } 
                                 if (!qChats.messages) qChats.messages = {} 
                                     if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM 
                                         let qChatsMessages 
                                         if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length)) // maybe avoid memory leak 
                                     } 
                             } 
                             if (!chat || chat === 'status@broadcast') continue 
        
