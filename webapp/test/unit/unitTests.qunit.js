/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"syncdcmm/project22/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
