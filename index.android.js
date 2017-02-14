"use strict";
var application = require("application");
var permissions_1 = require("./permissions");
var Proximity;
(function (Proximity) {
    Proximity[Proximity["UNKNOWN"] = 0] = "UNKNOWN";
    Proximity[Proximity["IMMEDIATE"] = 1] = "IMMEDIATE";
    Proximity[Proximity["NEAR"] = 2] = "NEAR";
    Proximity[Proximity["FAR"] = 3] = "FAR";
})(Proximity = exports.Proximity || (exports.Proximity = {}));
var KontaktSDK = com.kontakt.sdk.android.common.KontaktSDK;
var ProximityManager = com.kontakt.sdk.android.ble.manager.ProximityManager;
var ProximityManagerContract = com.kontakt.sdk.android.ble.manager.ProximityManagerContract;
var ScanPeriod = com.kontakt.sdk.android.ble.configuration.ScanPeriod;
var ScanMode = com.kontakt.sdk.android.ble.configuration.scan.ScanMode;
var IBeaconListener = com.kontakt.sdk.android.ble.manager.listeners.IBeaconListener;
var OnServiceReadyListener = com.kontakt.sdk.android.ble.connection.OnServiceReadyListener;
var ProximitySDK = com.kontakt.sdk.android.common.Proximity;
var BeaconDiscover = (function () {
    function BeaconDiscover(apiKey) {
        KontaktSDK.initialize(apiKey);
        this.proximityManager = new ProximityManager(application.android.foregroundActivity);
        this.proximityManager.configuration()
            .scanPeriod(ScanPeriod.RANGING)
            .scanMode(ScanMode.BALANCED);
    }
    BeaconDiscover.prototype.startListening = function (val) {
        var self = this;
        this.proximityManager.setIBeaconListener(new IBeaconListener({
            onIBeaconsUpdated: function (beacons, region) {
                console.log('onIBeaconsUpdated', beacons.size());
                var _b = [];
                for (var i = 0; i < beacons.size(); i++) {
                    _b.push(new BeaconWrapper(beacons.get(i)));
                }
                self.pullBeacons(_b);
            },
            onIBeaconDiscovered: function () {
                console.log('onIBeaconDiscovered');
            },
            onIBeaconLost: function () {
                console.log('onIBeaconLost');
            }
        }));
    };
    BeaconDiscover.prototype.fetchBeacons = function (callback) {
        var _this = this;
        this.callback = callback;
        if (this.proximityManager.isConnected()) {
            this.proximityManager.startScanning();
        }
        else {
            permissions_1.requestPermission(android.Manifest.permission.ACCESS_FINE_LOCATION, 'Needed to detect rooms')
                .then(function () { return _this.connect(); });
        }
    };
    BeaconDiscover.prototype.pullBeacons = function (beacons) {
        if (this.callback) {
            this.callback(beacons);
        }
    };
    BeaconDiscover.prototype.stopFetching = function () {
        this.stopMonitoring();
    };
    BeaconDiscover.prototype.connect = function () {
        var self = this;
        this.proximityManager.connect(new OnServiceReadyListener({
            onServiceReady: function () {
                console.log('onServiceReady - startScanning');
                self.proximityManager.startScanning();
            }
        }));
    };
    BeaconDiscover.prototype.stopMonitoring = function () {
        if (this.proximityManager && this.proximityManager.isConnected()) {
            //this.proximityManager.stopMonitoring();
            this.proximityManager.disconnect();
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
            return this.raw.getProximityUUID().toString().toLowerCase();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BeaconWrapper.prototype, "major", {
        get: function () {
            return this.raw.getMajor();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BeaconWrapper.prototype, "minor", {
        get: function () {
            return this.raw.getMinor();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BeaconWrapper.prototype, "description", {
        get: function () {
            return this.raw.getName();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BeaconWrapper.prototype, "proximity", {
        get: function () {
            var prox = this.raw.getProximity();
            if (prox === ProximitySDK.IMMEDIATE) {
                return Proximity.IMMEDIATE;
            }
            else if (prox === ProximitySDK.NEAR) {
                return Proximity.NEAR;
            }
            else if (prox === ProximitySDK.FAR) {
                return Proximity.FAR;
            }
            else {
                return Proximity.UNKNOWN;
            }
        },
        enumerable: true,
        configurable: true
    });
    return BeaconWrapper;
}());
