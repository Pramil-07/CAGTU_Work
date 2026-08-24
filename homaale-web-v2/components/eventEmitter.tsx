
type Listener = () => void;

const eventEmitter = {
    events: {} as Record<string, Listener[]>,
    on(event: string, listener: Listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    },
    emit(event: string) {
        const listeners = this.events[event] || [];
        listeners.forEach((listener) => listener());
    },
    off(event: string, listener: Listener) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter((l) => l !== listener);
        }
    },
};

export default eventEmitter;
