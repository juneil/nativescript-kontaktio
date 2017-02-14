"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Proximity;
(function (Proximity) {
    Proximity[Proximity["UNKNOWN"] = 0] = "UNKNOWN";
    Proximity[Proximity["IMMEDIATE"] = 1] = "IMMEDIATE";
    Proximity[Proximity["NEAR"] = 2] = "NEAR";
    Proximity[Proximity["FAR"] = 3] = "FAR";
})(Proximity = exports.Proximity || (exports.Proximity = {}));
var BeaconDiscover = (function () {
    function BeaconDiscover(apiKey) {
        Kontakt.setAPIKey(apiKey);
        this.delegate = KTKBeaconManagerDelegateImpl.new().initWithDiscover(this);
        this.beaconManager = KTKBeaconManager.alloc().initWithDelegate(this.delegate);
        this.beaconManager.delegate = this.delegate;
        this.beaconManager.requestLocationAlwaysAuthorization();
    }
    BeaconDiscover.prototype.startListening = function (uuid) {
        if (KTKBeaconManager.isMonitoringAvailable() && !this.region) {
            var proximityUUID = NSUUID.alloc().initWithUUIDString(uuid);
            this.region = KTKBeaconRegion.alloc().initWithProximityUUIDIdentifier(proximityUUID, 'ktk_identifier');
            this.beaconManager.startMonitoringForRegion(this.region);
        }
    };
    BeaconDiscover.prototype.fetchBeacons = function (callback) {
        this.callback = callback;
        if (this.region) {
            this.beaconManager.startRangingBeaconsInRegion(this.region);
        }
    };
    BeaconDiscover.prototype.stopFetching = function () {
        if (this.region) {
            this.beaconManager.stopRangingBeaconsInRegion(this.region);
        }
    };
    BeaconDiscover.prototype.pullBeacons = function (beacons) {
        if (this.callback) {
            this.callback(beacons);
        }
    };
    return BeaconDiscover;
}());
exports.BeaconDiscover = BeaconDiscover;
var BeaconWrapper = (function () {
    function BeaconWrapper(raw) {
        this.raw = raw;
    }
    Object.defineProperty(BeaconWrapper.prototype, "uuid", {
        get: function () {
            return this.raw.proximityUUID.UUIDString.toLowerCase();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BeaconWrapper.prototype, "major", {
        get: function () {
            return this.raw.major;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BeaconWrapper.prototype, "minor", {
        get: function () {
            return this.raw.minor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BeaconWrapper.prototype, "proximity", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BeaconWrapper.prototype, "description", {
        get: function () {
            return this.raw.description;
        },
        enumerable: true,
        configurable: true
    });
    BeaconWrapper.prototype.toString = function () {
        return this.uuid + " - " + this.major + " - " + this.minor + " - " + this.proximity;
    };
    return BeaconWrapper;
}());
var KTKBeaconManagerDelegateImpl = (function (_super) {
    __extends(KTKBeaconManagerDelegateImpl, _super);
    function KTKBeaconManagerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    KTKBeaconManagerDelegateImpl.new = function () {
        return _super.new.call(this);
    };
    KTKBeaconManagerDelegateImpl.prototype.initWithDiscover = function (discover) {
        this.discover = discover;
        return this;
    };
    KTKBeaconManagerDelegateImpl.prototype.beaconManagerDidStartMonitoringForRegion = function (manager, region) {
        console.log('KTK', 'didStartMonitoringForRegion');
    };
    KTKBeaconManagerDelegateImpl.prototype.beaconManagerDidEnterRegion = function (manager, region) {
        console.log('KTK', 'didEnterRegion');
    };
    KTKBeaconManagerDelegateImpl.prototype.beaconManagerDidExitRegion = function (manager, region) {
        console.log('KTK', 'didExitRegion');
    };
    KTKBeaconManagerDelegateImpl.prototype.beaconManagerDidRangeBeaconsInRegion = function (manager, beacons, region) {
        var beaconsArray = new Array();
        for (var i = 0; i < beacons.count; i++) {
            var _b = new BeaconWrapper(beacons[i]);
            beaconsArray.push(_b);
        }
        this.discover.pullBeacons(beaconsArray);
    };
    return KTKBeaconManagerDelegateImpl;
}(NSObject));
KTKBeaconManagerDelegateImpl.ObjCProtocols = [KTKBeaconManagerDelegate];
