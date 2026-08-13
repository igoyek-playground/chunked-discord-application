import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import type { Command } from "./structures/command.structure.js";
import { loadCommands } from "./handlers/command-handler.js";
import { loadEvents } from "./handlers/event-handler.js";
import { connectDatabase } from "./database/prisma.js";

export class Bot extends Client {
    public commands: Collection<string, Command> = new Collection();

    public constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.MessageContent,
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.GuildMember
            ],
        });
    }

    public async start(token: string): Promise<void> {
        await connectDatabase();

        await loadEvents(this);
        await loadCommands(this);
        
        await this.login(token);
    }
}
