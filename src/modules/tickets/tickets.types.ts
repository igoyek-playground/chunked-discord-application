import type { ButtonStyle, HexColorString, TextInputStyle } from "discord.js";

/**
 * Sposób zakładania ticketa dla danej kategorii.
 *
 * "channel" - tworzony jest nowy kanał tekstowy w podanej kategorii Discorda.
 * "thread"  - tworzony jest prywatny wątek pod podanym kanałem.
 */
export type TicketLocationType = "channel" | "thread";

export interface TicketLocationConfig {
    type: TicketLocationType;

    /**
     * ID kategorii (channel category), w której mają być tworzone kanały.
     *
     * Wymagane, gdy `type` to "channel".
     */
    parentCategoryId?: string;

    /**
     * ID kanału, pod którym mają być tworzone wątki ticketów.
     *
     * Wymagane, gdy `type` to "thread".
     */
    parentChannelId?: string;
}

/**
 * Pojedyncze pytanie w modalu otwieranym po wybraniu kategorii.
 *
 * Uwaga: Discord pozwala na maksymalnie 5 pól tekstowych w jednym modalu.
 */
export interface TicketQuestionConfig {
    /**
     * Unikalny identyfikator pytania w obrębie kategorii - używany
     * jako customId pola tekstowego modala.
     */
    id: string;

    label: string;
    style: TextInputStyle;
    placeholder?: string;
    required: boolean;
    minLength?: number;
    maxLength?: number;
}

/**
 * Rola administracyjna z dostępem do ticketów danej kategorii.
 */
export interface TicketStaffRoleConfig {
    roleId: string;
}

export interface TicketCategoryConfig {
    /**
     * Unikalny klucz kategorii - używany wewnętrznie (baza danych,
     * customId select menu). Nie zmieniaj go po tym, jak kategoria
     * zacznie być używana - zerwie to powiązanie z otwartymi ticketami.
     */
    key: string;

    /**
     * Wygląd opcji tej kategorii w select menu panelu ticketów.
     */
    select: {
        label: string;
        description?: string;
        emoji?: string;
    };

    /**
     * Prefiks nazwy kanału/wątku PRZED przejęciem ticketa - pełna nazwa
     * to `{channelPrefix}-{nick_twórcy_ticketa}`.
     */
    channelPrefix: string;

    location: TicketLocationConfig;

    /**
     * Role administracyjne, które mają dostęp do ticketów tej kategorii.
     *
     * - dla kanałów: otrzymują nadpisanie uprawnień (widok + pisanie),
     * - dla wątków: wszyscy aktualni posiadacze tych ról są dodawani
     *   jako członkowie wątku w momencie jego utworzenia.
     */
    staffRoles: TicketStaffRoleConfig[];

    /**
     * Role oznaczane (ping) w wiadomości otwierającej ticket.
     *
     * Może, ale nie musi pokrywać się z `staffRoles`.
     */
    pingRoleIds: string[];

    /**
     * Pytania w modalu otwieranym po wybraniu tej kategorii.
     *
     * Maksymalnie 5 pozycji (limit Discorda).
     */
    questions: TicketQuestionConfig[];
}

export interface TicketButtonConfig {
    label: string;
    style: ButtonStyle;
    emoji?: string;
}

/**
 * Zachowanie przycisku "Przejmij" po kliknięciu.
 *
 * "isolateOthers"  - pozostałe osoby (poza zainteresowanym i osobą
 *                     przejmującą) tracą widoczność ticketa.
 * "readOnlyOthers" - pozostałe osoby zachowują widoczność, ale tracą
 *                     możliwość pisania. UWAGA: Discord nie pozwala na
 *                     nadpisywanie uprawnień pojedynczych osób w wątkach,
 *                     więc w wątkach ten tryb działa tak samo jak
 *                     "isolateOthers".
 * "silent"         - nic się nie zmienia poza wysłaniem informacji
 *                     o przejęciu ticketa.
 */
export type TicketClaimMode = "isolateOthers" | "readOnlyOthers" | "silent";

export interface TicketsConfig {
    /**
     * Włącza lub wyłącza cały moduł ticketów.
     */
    enabled: boolean;

    limits: {
        /**
         * Maksymalna liczba jednocześnie otwartych ticketów na użytkownika.
         *
         * 0 = brak limitu.
         */
        maxOpenTicketsPerUser: number;

        /**
         * true  - limit dotyczy sumy WSZYSTKICH otwartych ticketów
         *          użytkownika, niezależnie od kategorii.
         * false - limit liczony jest OSOBNO dla każdej kategorii.
         */
        limitAppliesAcrossAllCategories: boolean;
    };

    claim: {
        mode: TicketClaimMode;
    };

    logs: {
        /**
         * ID kanału, na który trafiają transkrypcje zamkniętych ticketów.
         */
        transcriptChannelId: string;
    };

    panel: {
        accentColor: HexColorString;
        title: string;
        description: string;
        footer?: string;

        /**
         * Placeholder wyświetlany w select menu przed wyborem kategorii.
         */
        placeholder: string;
    };

    ticketMessage: {
        embedColor: HexColorString;

        /**
         * Po ilu sekundach usuwana jest wiadomość z pingami (rola(e) +
         * osoba zakładająca ticket) wysyłana zaraz po utworzeniu kanału.
         */
        pingMessageDeleteAfterSeconds: number;
    };

    buttons: {
        close: TicketButtonConfig;
        claim: TicketButtonConfig;
        settings: TicketButtonConfig;

        closeConfirm: TicketButtonConfig;
        closeCancel: TicketButtonConfig;

        settingsAddUser: TicketButtonConfig;
        settingsNotifyOwner: TicketButtonConfig;
        settingsSendDm: TicketButtonConfig;
    };

    messages: {
        disabled: string;

        /**
         * {LIMIT} zostanie zastąpione skonfigurowanym limitem.
         */
        limitReached: string;

        invalidCategory: string;
        missingPermissions: string;

        /**
         * Wyświetlane, gdy kategoria ma niepoprawnie skonfigurowane
         * miejsce docelowe (brak ID kategorii/kanału albo kanał nie istnieje).
         */
        categoryMisconfigured: string;

        internalError: string;

        closeConfirmPrompt: string;
        closeCancelled: string;

        /**
         * Wiadomość wysyłana na kanale logów razem z transkrypcją.
         *
         * Dostępne placeholdery: {CHANNEL}, {OWNER}, {CATEGORY}, {CLAIMED_BY}.
         */
        transcriptLogTitle: string;

        /**
         * {USER} zostanie zastąpione wzmianką osoby przejmującej ticket.
         */
        claimedAnnouncement: string;

        claimReadOnlyThreadFallbackNotice: string;

        settingsAddUserPrompt: string;

        /**
         * {USER} zostanie zastąpione wzmianką dodanego użytkownika.
         */
        settingsUserAdded: string;

        settingsNotifySent: string;
        settingsNotifyDmFailed: string;

        settingsDmModalTitle: string;
        settingsDmInputLabel: string;
        settingsDmInputPlaceholder: string;
        settingsDmSent: string;
        settingsDmFailed: string;

        /**
         * DM wysyłane do zainteresowanego po kliknięciu "Powiadom na PV".
         *
         * {CHANNEL} zostanie zastąpione nazwą ticketa.
         */
        ownerNotifyDmContent: string;
    };

    categories: TicketCategoryConfig[];
}

/**
 * Status ticketa przechowywany w bazie danych.
 */
export type TicketStatus = "open" | "closed";

export interface TicketAnswer {
    questionId: string;
    label: string;
    value: string;
}
