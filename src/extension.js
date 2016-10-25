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
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const St = imports.gi.St;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const RedshiftUtil = Me.imports.util;
const NeutralTemp = "6500K";

const RedshiftToggle = new Lang.Class({
    Name: "redshift",

    _init: function(statusMenu) {
        this.parent();
        this._settings = RedshiftUtil.getSettings();
        this._statusMenu = statusMenu;
    },
    destroy: function() {
        this._settings.destroy();
        this._menuItem.destroy();
    },
    enable: function() {
        // try to find the correct position:
        let index = 0;
        if (this._statusMenu._notificationsSwitch) {
            index = this._statusMenu.menu._getMenuItems().indexOf(this._statusMenu._notificationsSwitch);
            this.menuItem = new PopupMenu.PopupSwitchMenuItem(NeutralTemp, false);
        } else {
            let umenu = (this._statusMenu._brightness) ? this._statusMenu._brightness.menu
                : this._statusMenu._volume.menu;
            index = this._statusMenu.menu._getMenuItems().indexOf(umenu) + 1;

            let fileIcon = new Gio.FileIcon({
                file: Gio.File.new_for_path(Me.path + "/lightbulb.svg")
            });
            let icon = new St.Icon({ style_class: 'popup-menu-icon' });
            icon.set_gicon(fileIcon);

            this.menuItem = new PopupMenu.PopupSwitchMenuItem(NeutralTemp, false);
            this.menuItem.actor.insert_child_at_index(icon, 1);
        }

        this.menuItem.connect("toggled", Lang.bind(this, this._toggle));
        this._statusMenu.menu.addMenuItem(this.menuItem, index);

        this._activeChangedID = this._settings.connect("changed::active",
                                        Lang.bind(this, this._enabledChanged));
        // use stored value to initialize the extension
        this._enabledChanged(this._settings, "active");
    },
    disable: function() {
        this.menuItem.destroy();
        this._settings.disconnect(this._activeChangedID);
        if (this.pid) {
            Util.spawnCommandLine("kill -TERM " + this.pid);
        }
    },

    _toggle: function(item, state) {
        this._settings.set_boolean("active", state);
    },
    _enabledChanged: function (settings, key) {
        let state = this._settings.get_boolean(key);
        if (state) {
            let command = ["redshift"];
            let provider = this._settings.get_string(RedshiftUtil.REDSHIFT_LOCATION_PROVIDER_KEY);
            if (provider == "manual") {
                let lat = this._settings.get_double(RedshiftUtil.REDSHIFT_LOCATION_LATITUDE_KEY);
                let lon = this._settings.get_double(RedshiftUtil.REDSHIFT_LOCATION_LONGITUDE_KEY);
                command.push("-l " + lat + ":" + lon);
            } else {
                command.push("-l" + provider);
            }
            let tempDay = this._settings.get_int(RedshiftUtil.REDSHIFT_TEMPERATURE_DAYTIME_KEY);
            let tempNight = this._settings.get_int(RedshiftUtil.REDSHIFT_TEMPERATURE_NIGHTTIME_KEY);
            command.push("-t " + tempDay + ":" + tempNight);
            command.push("-v");

            let [success, pid, pin, pout, perr] = GLib.spawn_async_with_pipes(null, command, null,
                                                                              GLib.SpawnFlags.SEARCH_PATH, null);
            let channel = GLib.IOChannel.unix_new(pout);
            GLib.io_add_watch(channel, GLib.PRIORITY_DEFAULT, GLib.IOCondition.IN | GLib.IOCondition.HUP,
                              Lang.bind(this, this._redshiftWatch), null);
            this.pid = pid;
            this.menuItem.setToggleState(true);
        } else {
            if (this.pid) {
                Util.spawnCommandLine("kill -TERM " + this.pid);
                // killing takes a few seconds due to the soft transition,
                // we don't want to spawn in this time again, so disable
                // the switch
                this.menuItem.setSensitive(false);
            } else {
                this.menuItem.setToggleState(false);
            }
        }
    },
    _redshiftWatch: function(source, condition, user_data) {
        if (condition == GLib.IOCondition.IN) {
            let [status, str_raw, length, term_pos] = source.read_line();
            // Extract the color temperature from redshift stdout
            // (this is possible because we passed the -v option),
            // this is ugly, but there is no other way to get this information.
            // Note that the text before the colon depends on the locale.
            let str = str_raw.trim();
            let re = /^.+: [0-9]+K$/;
            if (re.test(str)) {
                let text = str.split(":")[1].trim();
                this.menuItem.label.text = text;
            }
            return true;
        } else {
            this.pid = null;
            // reenable the switch again
            this.menuItem.setSensitive(true);
            this.menuItem.setToggleState(false);
            this.menuItem.label.text = NeutralTemp;
            return false;
        }
    }
});


function init() {
    // check existence of aggregateMenu (gnome-shell 3.12)
    if (Main.panel.statusArea.aggregateMenu) {
        return new RedshiftToggle(Main.panel.statusArea.aggregateMenu);
    // check existence of userMenu (gnome-shell 3.6 & 3.8)
    } else if (Main.panel.statusArea.userMenu) {
        return new RedshiftToggle(Main.panel.statusArea.userMenu);
    } else {
        global.log("redshift: unable to obtain aggregateMenu or userMenu");
        return undefined;
    }
}
