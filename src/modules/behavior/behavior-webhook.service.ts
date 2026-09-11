import type {
    NewsChannel,
    TextChannel,
    User,
    Webhook,
    WebhookType,
} from "discord.js";

const WEBHOOK_NAME = "chunked.pl — Behavior";

export class BehaviorWebhookService {
    public static async getOrCreate(
        channel: TextChannel | NewsChannel,
        botUser: User,
    ): Promise<Webhook<WebhookType.Incoming>> {
        const webhooks = await channel.fetchWebhooks();

        const existing = webhooks.find(
            (webhook) =>
                webhook.owner?.id === botUser.id &&
                webhook.name === WEBHOOK_NAME,
        );

        if (existing?.isIncoming()) {
            return existing;
        }

        return channel.createWebhook({
            name: WEBHOOK_NAME,
            avatar: botUser.displayAvatarURL(),
            reason:
                "Automatycznie utworzony webhook dla /behavior webhook-say",
        });
    }
}