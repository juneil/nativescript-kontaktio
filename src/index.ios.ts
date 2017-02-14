declare var KTKBeaconManager, 
			KTKBeaconRegion, 
			KTKBeaconManagerDelegate,
			CLProximity,
			Kontakt, 
			NSUUID;

export interface Beacon {
	uuid: string;
	major: string;
	minor: string;
	proximity: Proximity;
	description: string;
}

export enum Proximity {
	UNKNOWN 	= 0,
	IMMEDIATE	= 1,
	NEAR		= 2,
	FAR			= 3
}

export class BeaconDiscover {
	private beaconManager;
	private region;
	private delegate;
	private callback: (beacons: Beacon[]) => void;

	constructor(apiKey: string) {
		Kontakt.setAPIKey(apiKey);
		this.delegate = KTKBeaconManagerDelegateImpl.new().initWithDiscover(this);
		this.beaconManager = KTKBeaconManager.alloc().initWithDelegate(this.delegate);
		this.beaconManager.delegate = this.delegate
		this.beaconManager.requestLocationAlwaysAuthorization();
	}

	public startListening(uuid: string) {
		if (KTKBeaconManager.isMonitoringAvailable() && !this.region) {
			let proximityUUID = NSUUID.alloc().initWithUUIDString(uuid);
			this.region = KTKBeaconRegion.alloc().initWithProximityUUIDIdentifier(proximityUUID, 'ktk_identifier');
			this.beaconManager.startMonitoringForRegion(this.region);
		}
	}

	public fetchBeacons(callback: (beacons:Beacon[]) => void) {
		this.callback = callback;
		if (this.region) {
			this.beaconManager.startRangingBeaconsInRegion(this.region);
		}
	}

	public stopFetching() {
		if (this.region) {
			this.beaconManager.stopRangingBeaconsInRegion(this.region);
		}
	}

	public pullBeacons(beacons: Beacon[]) {
		if (this.callback) {
			this.callback(beacons);
		}
	}
}

class BeaconWrapper implements Beacon {
	private raw: any;

	constructor(raw) {
		this.raw = raw;
	}

	get uuid() {
		return this.raw.proximityUUID.UUIDString.toLowerCase();
	}

	get major(): string {
		return this.raw.major;
	}

	get minor(): string {
		return this.raw.minor;
	}

	get proximity(): Proximity {
		switch (this.raw.proximity) {
			case CLProximity.CLProximityImmediate:
				return Proximity.IMMEDIATE;
			case CLProximity.CLProximityNear:
				return Proximity.NEAR;
			case CLProximity.CLProximityFar:
				return Proximity.FAR;
			case CLProximity.CLProximityUnknown:
			default:
				return Proximity.UNKNOWN;
		}
	}

	get description() {
		return this.raw.description;
	}

	public toString(): string {
		return `${this.uuid} - ${this.major} - ${this.minor} - ${this.proximity}`;
	}
}

interface KTKBeaconManagerDelegate {
	beaconManagerDidStartMonitoringForRegion(manager, region);
	beaconManagerDidEnterRegion(manager, region);
	beaconManagerDidExitRegion(manager, region);
	beaconManagerDidRangeBeaconsInRegion(manager, beacons, region);
}

class KTKBeaconManagerDelegateImpl extends NSObject implements KTKBeaconManagerDelegate {
	public static ObjCProtocols = [KTKBeaconManagerDelegate];
	private discover: BeaconDiscover;

	static new(): KTKBeaconManagerDelegateImpl {
		return <KTKBeaconManagerDelegateImpl>super.new();
    }

	public initWithDiscover(discover: BeaconDiscover): KTKBeaconManagerDelegate {
        this.discover = discover;
        return this;
    }

	beaconManagerDidStartMonitoringForRegion(manager, region) {
		console.log('KTK', 'didStartMonitoringForRegion');
	}
	beaconManagerDidEnterRegion(manager, region) {
		console.log('KTK', 'didEnterRegion');
	}
	beaconManagerDidExitRegion(manager, region) {
		console.log('KTK', 'didExitRegion');
	}
	beaconManagerDidRangeBeaconsInRegion(manager, beacons, region) {
		const beaconsArray = new Array<BeaconWrapper>();
		for (let i = 0; i < beacons.count; i++) {
			const _b = new BeaconWrapper(beacons[i]);
			beaconsArray.push(_b);
		}
		this.discover.pullBeacons(beaconsArray);
	}
}