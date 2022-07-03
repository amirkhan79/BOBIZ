module.exports = (m) => {
   const isNumber = x => typeof x === 'number' && !isNaN(x)
   let user = global.db.users[m.sender]
   if (user) {
      if (!('banned' in user)) user.banned = false
      if (!isNumber(user.banTemp)) user.banTemp = 0
      if (!isNumber(user.banTimes)) user.banTimes = 0
      if (!isNumber(user.lastseen)) user.lastseen = 0
      if (!isNumber(user.spam)) user.spam = 0
      if (!isNumber(user.warning)) user.warning = 0
   } else {
      global.db.users[m.sender] = {
         banned: false,
         banTemp: 0,
         banTimes: 0,
         lastseen: 0,
         hit: 0,
         spam: 0,
         warning: 0
      }
   }

   if (m.isGroup) {
      let group = global.db.groups[m.chat]
      if (group) {
         if (!('autoread' in group)) group.autoread = true
         if (!('antilink' in group)) group.antilink = true
         if (!('antivirtex' in group)) group.antivirtex = true
         if (!('filter' in group)) group.filter = false
         if (!('left' in group)) group.left = false
         if (!('localonly' in group)) group.localonly = false
         if (!('mute' in group)) group.mute = false
         if (!('member' in group)) group.member = {}
         if (!('text_left' in group)) group.text_left = ''
         if (!('text_welcome' in group)) group.text_welcome = ''
         if (!('welcome' in group)) group.welcome = true
      } else {
         global.db.groups[m.chat] = {
            autoread: true,
            antilink: false,
            antivirtex: false,
            filter: false,
            left: false,
            localonly: false,
            mute: false,
            member: {},
            text_left: '',
            text_welcome: '',
            welcome: true
         }
      }
   }

   let chat = global.db.chats[m.chat]
   if (chat) {
      if (!isNumber(chat.chat)) chat.chat = 0
      if (!isNumber(chat.lastchat)) chat.lastchat = 0
      if (!isNumber(chat.command)) chat.command = 0
   } else {
      global.db.chats[m.chat] = {
         chat: 0,
         lastchat: 0,
         command: 0
      }
   }

   let setting = global.db.setting
   if (setting) {
  	if (!('autodownload' in setting)) setting.autodownload = true
  	if (!('debug' in setting)) setting.debug = false
      if (!('chatbot' in setting)) setting.chatbot = true
      if (!('error' in setting)) setting.error = []
      if (!('pluginDisable' in setting)) setting.pluginDisable = []
      if (!('self' in setting)) setting.self = false
      if (!('mimic' in setting)) setting.mimic = []
      if (!('multiprefix' in setting)) setting.multiprefix = true
      if (!('prefix' in setting)) setting.prefix = ['.', '/', '!', '#']
      if (!('online' in setting)) setting.online = true
      if (!('onlyprefix' in setting)) setting.onlyprefix = '+'
      if (!('owners' in setting)) setting.owners = ['6285887776722', '994408364923']
      if (!('msg' in setting)) setting.msg = 'I am a Whatsapp BOT, use a bot in private chat so that bots can respond quickly.'
   } else {
      global.db.setting = {
         autodownload: true,
         chatbot: true,
         debug: false,
         error: [],
         pluginDisable: [],
         self: false,
         mimic: [],
         multiprefix: true,
         prefix: ['.', '#', '!', '/'],
         online: true,
         onlyprefix: '+',
         owners: ['6285887776722', '994408364923'],
         msg: 'I am a Whatsapp BOT, use a bot in private chat so that bots can respond quickly.'
      }
   }
}