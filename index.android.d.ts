export interface Beacon {
    uuid: string;
    major: string;
    minor: string;
    proximity: Proximity;
    description: string;
}
export declare enum Proximity {
    UNKNOWN = 0,
    IMMEDIATE = 1,
    NEAR = 2,
    FAR = 3,
}
export declare class BeaconDiscover {
    private proximityManager;
    private callback;
    constructor(apiKey: string);
    startListening(val: string): void;
    fetchBeacons(callback: (beacons: Beacon[]) => void): void;
    pullBeacons(beacons: Beacon[]): void;
    stopFetching(): void;
    private connect();
    private stopMonitoring();
}
