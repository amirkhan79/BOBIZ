const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
module.exports = async (client, m) => {
   try {
      require('./system/database')(m)
      const isOwner = [client.user.id.split`:` [0], global.owner, ...global.db.setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      const participants = m.isGroup ? groupMetadata.participants : [] || []
      const adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      const isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net') : false
      const blockList = typeof await (await client.fetchBlocklist()) != 'undefined' ? await (await client.fetchBlocklist()) : []
      const groupSet = global.db.groups[m.chat],
         chats = global.db.chats[m.chat],
         users = global.db.users[m.sender],
         setting = global.db.setting
      const body = typeof m.text == 'string' ? m.text : false
      if (!setting.online) await client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) await client.sendPresenceUpdate('available', m.chat)
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Func.jsonFormat(m), m)
      if (m.isGroup && isBotAdmin) groupSet.localonly = false
      if (m.isGroup && groupSet.autoread) await client.readMessages([m.key])
      if (!m.isGroup) await client.readMessages([m.key])
      if (m.chat.endsWith('broadcast')) client.copyNForward(global.forwards, m)
      if (users) users.lastseen = new Date() * 1
      if (chats) {
         chats.lastseen = new Date() * 1
         chats.chat += 1
      } 
      if (m.isGroup && !m.fromMe) {
         let now = new Date() * 1
         if (!groupSet.member[m.sender]) {
            groupSet.member[m.sender] = {
               lastseen: now,
               warning: 0
            }
         } else {
            groupSet.member[m.sender].lastseen = now
         }
      }
      let getPrefix = body ? body.charAt(0) : ''
      let myPrefix = (setting.multiprefix ? setting.prefix.includes(getPrefix) : setting.onlyprefix == getPrefix) ? getPrefix : undefined
      require('./system/logs')(client, m, myPrefix)
      if (m.isBot || m.chat.endsWith('broadcast')) return
      if (((m.isGroup && !groupSet.mute) || !m.isGroup) && !users.banned) {
         if (body && body == myPrefix) {
            if (m.isGroup && groupSet.mute || !isOwner) return
            let old = new Date()
            let banchat = setting.self ? true : false
            if (!banchat) {
               await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
               return client.reply(m.chat, Func.texted('bold', `Response Speed: ${((new Date - old) * 1)}ms`), m)
            } else {
               await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
               return client.reply(m.chat, Func.texted('bold', `Response Speed: ${((new Date - old) * 1)}ms (nonaktif)`), m)
            }
         }
      }
      if (setting.self)
         if (!m.fromMe && !isOwner) return
      let isPrefix
      if (body && body.length != 1 && (isPrefix = (myPrefix || '')[0])) {
         let args = body.replace(isPrefix, '').split` `.filter(v => v)
         let command = args.shift().toLowerCase()
         let start = body.replace(isPrefix, '')
         let clean = start.trim().split` `.slice(1)
         let text = clean.join` `
         const is_commands = Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => prop.run.usage))
         let commands = Func.arrayJoin(Object.values(is_commands).map(v => v.run.usage))
         let matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
         try {
            if (new Date() * 1 - chats.command > (global.cooldown * 1000)) {
               chats.command = new Date() * 1
            } else {
               if (!m.fromMe) return
            }
         } catch (e) {
            global.db.chats[m.chat] = {}
            global.db.chats[m.chat].command = new Date() * 1
            global.db.chats[m.chat].chat = 1
            global.db.chats[m.chat].lastseen = new Date() * 1
         }
         if (!commands.includes(command) && matcher.length > 0) {
            if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `🚩 Perintah / Command yang kamu gunakan salah, silahkan coba rekomendasi berikut :\n\n${matcher.map(v => '➠ *' + isPrefix + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
         }
         if (setting.error.includes(command)) return client.reply(m.chat, Func.texted('bold', `🚩 Perintah / Command _${isPrefix + command}_ di nonaktifkan sementara oleh Owner.`), m)
         if (commands.includes(command)) {
            if (!global.db.statistic[command]) {
               global.db.statistic[command] = {
                  hitstat: 1,
                  lasthit: new Date * 1,
                  sender: m.sender.split`@` [0]
               }
            } else {
               if (!/bot|help|menu|stat|gc/.test(command)) {
                  global.db.statistic[command].hitstat += 1
                  global.db.statistic[command].lasthit = new Date * 1
                  global.db.statistic[command].sender = m.sender.split`@` [0]
               }
            }
         }
         for (let name in is_commands) {
            let cmd = is_commands[name].run
            let turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            if (body && global.evaluate_chars.some(v => body.startsWith(v)) && !body.startsWith(myPrefix)) return
            if (!turn) continue
            if (!m.isGroup && global.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.pluginDisable.includes(name)) return client.reply(m.chat, Func.texted('bold', `🚩 Plugin disabled by Owner.`), m)
            if (!['owner', 'information'].includes(name) && setting.groupmode) return client.reply(m.chat, Func.texted('bold', `🚩 Bot system is in "group only" mode and can only be used in groups.`), m)
            if (!['me', 'owner'].includes(name) && users && users.banned) return
            if (cmd.cache && cmd.location) {
               let file = require.resolve(cmd.location)
               Func.reload(file)
            }
            if (cmd.error) {
               client.reply(m.chat, global.status.errorF, m)
               continue
            }
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (cmd.private && m.isGroup) {
               continue
            }
            cmd.async(m, {
               client,
               args,
               text,
               isPrefix,
               command,
               participants,
               blockList,
               isOwner,
               isAdmin,
               isBotAdmin
            })
            break
         }
      } else {
         let prefixes = setting.multiprefix ? setting.prefix : [setting.onlyprefix]
         const is_events = Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => !prop.run.usage))
         for (let name in is_events) {
            let event = is_events[name].run
            if (event.cache && event.location) {
               let file = require.resolve(event.location)
               Func.reload(file)
            }
            // if (!m.isGroup && ['91', '92', '212'].some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            // if (m.isGroup && !['exec'].includes(name) && groupSet.mute) continue
            if (setting.pluginDisable.includes(name)) continue
            if (!m.isGroup && ['chatAI'].includes(name) && body && Func.socmed(body)) continue
            if (!m.isGroup && ['chatAI'].includes(name) && chats && new Date() * 1 - chats.lastchat < global.timer) continue
            if (!['exec', 'restrict'].includes(name) && users && users.banned) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter', 'exec'].includes(name) && users && (users.banned || new Date - users.banTemp < global.timer)) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter', 'exec'].includes(name) && groupSet && groupSet.mute) continue 
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.moderator && !isMod) continue
            if (event.group && !m.isGroup) continue
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            // if (event.register && !users.register && event.regex && body && body.match(event.regex) && m.sender.startsWith('62')) {
               // return client.reply(m.chat, Func.texted('bold', `🚩 Nomor kamu belum ter-verifikasi silahkan kirim ${prefixes[0]}tnc untuk melakukan verifikasi.`), m)
               // continue
            // }
            if (event.download && (!setting.autodownload || (body && global.evaluate_chars.some(v => body.startsWith(v))))) continue
            event.async(m, {
               client,
               body,
               participants,
               prefixes,
               isOwner,
               isAdmin,
               isBotAdmin,
               users,
               chats,
               groupSet,
               groupMetadata,
               setting
            })
         }
      }
   } catch (e) {
      console.log(e)
   }
}

Func.reload(require.resolve(__filename))