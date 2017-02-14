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
    private beaconManager;
    private region;
    private delegate;
    private callback;
    constructor(apiKey: string);
    startListening(uuid: string): void;
    fetchBeacons(callback: (beacons: Beacon[]) => void): void;
    stopFetching(): void;
    pullBeacons(beacons: Beacon[]): void;
}
