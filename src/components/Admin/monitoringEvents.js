// Lightweight cross-component signal: the Transaction Monitoring page and the
// header's alert bell are independent components with no shared state/store,
// but the bell should refresh immediately when an alert is acted on here
// (acknowledge/resolve/false-positive) rather than waiting for its own
// polling interval to catch up. A DOM CustomEvent is the simplest way to
// bridge that without introducing a context provider or a state library.
export const ALERTS_CHANGED_EVENT = 'transaction-monitoring:alerts-changed';

export const notifyAlertsChanged = () => {
    window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT));
};
