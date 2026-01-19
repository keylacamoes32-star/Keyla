const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const menu = require('./menu');
const responses = require('./responses');
const settings = require('../config/settings.json');

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state });

  const db = new sqlite3.Database('./database/clients.db');
  db.run('CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY, name TEXT, number TEXT, history TEXT)');

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (!text) return;

    console.log(`Mensagem recebida de ${from}: ${text}`);

    if (text === '1') await sock.sendMessage(from, { text: responses.produtos() });
    else if (text === '2') await sock.sendMessage(from, { text: responses.servicos() });
    else if (text === '3') await sock.sendMessage(from, { text: responses.pagamentos() });
    else if (text === '4') await sock.sendMessage(from, { text: '👩🏽‍💼 Um atendente humano irá responder em breve.' });
    else await sock.sendMessage(from, { text: menu.inicial() });
  });

  sock.ev.on('creds.update', saveCreds);

  console.log(`🤖 ${settings.botName} está online e pronto para atender!`);
})();