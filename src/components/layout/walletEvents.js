// Lightweight cross-component signal: the header's wallet balance and pages
// that move money (e.g. Credit/Debit Wallet) are independent components with
// no shared state/store, but the header should refresh immediately when a
// transfer completes here rather than waiting for a full page reload. A DOM
// CustomEvent is the simplest way to bridge that — same pattern already used
// for the Transaction Monitoring alert bell (see Admin/monitoringEvents.js).
export const WALLET_BALANCE_CHANGED_EVENT = 'wallet:balance-changed';

export const notifyWalletBalanceChanged = () => {
    window.dispatchEvent(new Event(WALLET_BALANCE_CHANGED_EVENT));
};
