const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const axios = require('axios');
const aldertos_config = require('../aldertos_config');

module.exports = {
    name: 'sorgu',
    description: 'Kullanıcı bilgilerini gösterir',
    async execute(message, args, client) {
        const userId = args[0];
        if (!userId) return message.reply('Lütfen bir kullanıcı ID girin.');

        try {
            const response = await axios.get(`https://discord.com/api/v9/users/${userId}/profile`, {
                headers: { Authorization: aldertos_config.userGetToken }
            });

            const user = response.data.user;
            const profile = response.data.user_profile;
            const mutuals = response.data.mutual_guilds || [];

            const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=2048`;
            const bannerURL = user.banner 
                ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=2048`
                : 'https://cdn.discordapp.com/attachments/1359679228165095626/1361725896893010073/g1l5f9k.png?ex=67ffcd91&is=67fe7c11&hm=71df298af93197ff07dab3bd234b0d6fba315a45c05a2e5ed2f5a02602ad24c2&';

            const profileEmbed = new EmbedBuilder()
                .setTitle("📌 Kullanıcı Bilgileri")
                .setDescription(
                    `🏷️ **Adı:** ${user.username}\n` +
                    `🌍 **Görünen Adı:** ${user.global_name || 'Yok'}\n` +
                    `🆔 **Kullanıcı ID:** ${user.id}\n` +
                    `📝 **Hakkında:** ${user.bio || 'Belirtilmemiş'}\n` +
                    `🏳️ **Hitapları:** ${profile.pronouns || 'Belirtilmemiş'}`
                )
                .setImage(bannerURL)
                .setThumbnail(avatarURL)
                .setFooter({ text: "created by aldertos" });

            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu')
                    .setPlaceholder('Bilgi türü seçin...')
                    .addOptions([
                        { label: '👤 Kullanıcı Bilgileri', value: 'user_info' },
                        { label: '🌍 Sunucu Bilgileri', value: 'server_info' }
                    ])
            );

            const replyMessage = await message.channel.send({
                embeds: [profileEmbed],
                components: [selectMenu]
            });

            const collector = replyMessage.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async (interaction) => {
                if (!interaction.isStringSelectMenu()) return;

                if (interaction.values[0] === 'server_info') {
                    let description = '';

                    for (const guild of mutuals) {
                        try {
                            const guildRes = await axios.get(`https://discord.com/api/v9/guilds/${guild.id}`, {
                                headers: { Authorization: aldertos_config.userGetToken }
                            });

                            description += `**🌍 Sunucu Adı:** ${guildRes.data.name}\n`;
                            description += `**🏷️ Adı:** ${guild.nick || 'Yok'}\n\n`;
                        } catch {
                            description += `**🌍 Sunucu ID:** ${guild.id}\n**❌ Bilgi alınamadı.**\n\n`;
                        }
                    }

                    const serverEmbed = new EmbedBuilder()
                        .setTitle("🌍 Sunucu Bilgileri")
                        .setDescription(description || "Kullanıcının ortak sunucusu yok.")
                        .setThumbnail(avatarURL)
                        .setFooter({ text: "created by aldertos" });

                    await interaction.update({ embeds: [serverEmbed], components: [selectMenu] });
                } else {
                    await interaction.update({ embeds: [profileEmbed], components: [selectMenu] });
                }
            });

        } catch (error) {
            message.reply("Kullanıcı bilgileri alınamadı veya ID geçersiz.");
        }
    }
};
