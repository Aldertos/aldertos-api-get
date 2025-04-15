const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const aldertos_config = require('../aldertos_config');

module.exports = {
    name: 'bilgi',
    description: 'Selfin kaç tane sunucuda olduğunu ve o sunucularda kaç tane user olduğunu gösterir',
    async execute(message, args, client) {
        try {
            const guildsResponse = await axios.get("https://discord.com/api/v9/users/@me/guilds", {
                headers: { Authorization: aldertos_config.userGetToken }
            });

            const guilds = guildsResponse.data;
            const totalGuilds = guilds.length;
            let totalMembers = 0;

            for (const guild of guilds) {
                try {
                    const guildDetail = await axios.get(`https://discord.com/api/v9/guilds/${guild.id}?with_counts=true`, {
                        headers: { Authorization: aldertos_config.userGetToken }
                    });
                    totalMembers += guildDetail.data.approximate_member_count || 0;
                } catch {}
            }

            const bilgiEmbed = new EmbedBuilder()
                .setTitle("📊 API Kullanım İstatistikleri")
                .setDescription(`**⚙️ Toplam Sunucu:** ${totalGuilds}\n**👤 Toplam Kullanıcı:** ${totalMembers}`)
                .setFooter({
                    text: "Created by Aldertos",
                    iconURL: client.user.displayAvatarURL({ size: 128 })
                });

            message.channel.send({ embeds: [bilgiEmbed] });

        } catch (err) {
            console.error(err);
            message.reply("Bilgiler alınırken bir hata oluştu.");
        }
    }
};
