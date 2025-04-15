const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'vanity',
  description: 'Bir vanity URL hakkında bilgi çeker',
  async execute(message, args, client) {
    const vanity = args[0];
    if (!vanity) return message.reply('Lütfen bir vanity URL gir');

    try {
      const res = await axios.get(`https://discord.com/api/v9/invites/${vanity}?with_counts=true`);
      const data = res.data;
      const { guild, channel, profile } = data;

      const embed = new EmbedBuilder()
        .setTitle(`📌 ${guild.name} Bilgileri`)
        .setDescription(
          `🆔 **ID:** ${guild.id}\n` +
          `📝 **Hakkında:** ${guild.description || 'Yok'}\n` +
          `🔑 **Doğrulama Seviyesi:** ${guild.verification_level}\n` +
          `💎 **Takviye Sayısı:** ${guild.premium_subscription_count || 0}\n` +
          `🌐 **Vanity:** https://discord.gg/${guild.vanity_url_code || vanity}\n` +
          `📍 **Davet Kanalı:** ${channel.name}\n` +
          `👤 **Kullanıcı Sayısı:** ${profile.member_count}\n` +
          `🟢 **Aktif Kullanıcı Sayısı:** ${profile.online_count}`
        )
        .setThumbnail(`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`)
        .setImage(guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=1024` : null)
        .setColor('Random');

      const splashButton = new ButtonBuilder()
        .setCustomId('show_splash')
        .setLabel('Davet Bannerını Göster')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(splashButton);

      const msg = await message.channel.send({ embeds: [embed], components: [row] });

      const collector = msg.createMessageComponentCollector({
        filter: i => i.customId === 'show_splash' && i.user.id === message.author.id,
        time: 60000,
      });

      collector.on('collect', async (interaction) => {
        if (!guild.splash) {
          return interaction.reply({ content: 'Bu sunucunun bir davet bannerı yok.', ephemeral: true });
        }

        return interaction.reply({
          content: `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png?size=1024`,
          ephemeral: true,
        });
      });

    } catch (err) {
      return message.reply('Geçerli bir vanity URL girilmedi veya istek başarısız oldu.');
    }
  }
};
