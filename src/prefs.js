/*

    Redshift extension for gnome-shell
    Copyright (C) 2014  Thomas Liebetraut

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const RedshiftUtil = Me.imports.util;


const RedshiftPrefsWidget = new Lang.Class({
    Name: 'RedshiftPrefsWidget',
    Extends: Gtk.Box,

    _init: function() {
        this.parent();

        this._settings = RedshiftUtil.getSettings();
        this._inhibitUpdate = true;
        this._settings.connect("changed", Lang.bind(this, this._refresh));

        this.builder = new Gtk.Builder();
        this.builder.add_from_file(Me.dir.get_path() + "/redshift-prefs.ui");
        this.mainWidget = this.builder.get_object("mainWidget");
        this.add(this.mainWidget);

        this.builder.get_object("cbLocationProvider").connect("changed", Lang.bind(this, this._saveComboBox, RedshiftUtil.REDSHIFT_LOCATION_PROVIDER_KEY));
        this.builder.get_object("adjLatitude").connect("value-changed", Lang.bind(this, this._saveAdjustmentDouble, RedshiftUtil.REDSHIFT_LOCATION_LATITUDE_KEY));
        this.builder.get_object("adjLongitude").connect("value-changed", Lang.bind(this, this._saveAdjustmentDouble, RedshiftUtil.REDSHIFT_LOCATION_LONGITUDE_KEY));
        this.builder.get_object("adjTempDay").connect("value-changed", Lang.bind(this, this._saveAdjustmentInt, RedshiftUtil.REDSHIFT_TEMPERATURE_DAYTIME_KEY));
        this.builder.get_object("adjTempNight").connect("value-changed", Lang.bind(this, this._saveAdjustmentInt, RedshiftUtil.REDSHIFT_TEMPERATURE_NIGHTTIME_KEY));

        this._inhibitUpdate = false;
        this._refresh();

        this.show_all();
    },
    _saveComboBox: function(widget, key) {
        if (this._inhibitUpdate)
            return;
        this._inhibitUpdate = true;
        this._settings.set_string(key, widget.get_active_text());
        this._activateLocationWidgets();
        this._inhibitUpdate = false;
    },
    _saveAdjustmentDouble: function(adjustment, key) {
        if (this._inhibitUpdate)
            return;
        this._inhibitUpdate = true;
        this._settings.set_double(key, adjustment.get_value());
        this._inhibitUpdate = false;
    },
    _saveAdjustmentInt: function(adjustment, key) {
        if (this._inhibitUpdate)
            return;
        this._inhibitUpdate = true;
        this._settings.set_int(key, adjustment.get_value());
        this._inhibitUpdate = false;
    },
    _activateLocationWidgets: function() {
        this.builder.get_object("grid2").set_sensitive("manual" == this._settings.get_string(RedshiftUtil.REDSHIFT_LOCATION_PROVIDER_KEY));
    },
    _refresh: function() {
        if (this._inhibitUpdate)
            return;

        this._inhibitUpdate = true;
        let cbLocation = this.builder.get_object("cbLocationProvider");
        // Options have to be in the same order as in the glade file for
        // this to work properly
        let idx = Array("geoclue2", "geoclue", "gnome-clock", "manual").indexOf(this._settings.get_string(RedshiftUtil.REDSHIFT_LOCATION_PROVIDER_KEY));
        cbLocation.set_active(idx);
        this._activateLocationWidgets();

        this.builder.get_object("adjLatitude").set_value(this._settings.get_double(RedshiftUtil.REDSHIFT_LOCATION_LATITUDE_KEY));
        this.builder.get_object("adjLongitude").set_value(this._settings.get_double(RedshiftUtil.REDSHIFT_LOCATION_LONGITUDE_KEY));

        this.builder.get_object("adjTempDay").set_value(this._settings.get_int(RedshiftUtil.REDSHIFT_TEMPERATURE_DAYTIME_KEY));
        this.builder.get_object("adjTempNight").set_value(this._settings.get_int(RedshiftUtil.REDSHIFT_TEMPERATURE_NIGHTTIME_KEY));
        this._inhibitUpdate = false;
    }
})



function init() {
}

function buildPrefsWidget() {
    let widget = new RedshiftPrefsWidget();

    widget.show_all();
    return widget;
}

