export const TICKET_CUSTOM_IDS = {
    categorySelect: "tickets:category_select",

    modalPrefix: "tickets:modal:",

    close: "tickets:close",
    closeConfirm: "tickets:close_confirm",
    closeCancel: "tickets:close_cancel",

    claim: "tickets:claim",

    settings: "tickets:settings",
    settingsAddUser: "tickets:settings_add_user",
    settingsAddUserSelect: "tickets:settings_add_user_select",
    settingsNotifyOwner: "tickets:settings_notify_owner",
    settingsSendDm: "tickets:settings_send_dm",
    settingsSendDmModal: "tickets:settings_send_dm_modal",
    settingsSendDmInput: "tickets:settings_send_dm_input",
} as const;

export function buildModalCustomId(categoryKey: string): string {
    return `${TICKET_CUSTOM_IDS.modalPrefix}${categoryKey}`;
}

export function parseModalCustomId(customId: string): string | null {
    if (!customId.startsWith(TICKET_CUSTOM_IDS.modalPrefix)) {
        return null;
    }

    return customId.slice(TICKET_CUSTOM_IDS.modalPrefix.length);
}
