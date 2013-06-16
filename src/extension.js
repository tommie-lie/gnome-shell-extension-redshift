
const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const RedshiftUtil = Me.imports.util;


const RedshiftToggle = new Lang.Class({
    Name: "redshift",

    _init: function() {
        this.parent();
        this._settings = RedshiftUtil.getSettings();
    },
    destroy: function() {
        this._settings.destroy();
        this._menuItem.destroy();
    },
    enable: function() {
        let userMenu = Main.panel.statusArea.userMenu;
        // try to find the correct position:
        // after notifications switch
        let index = userMenu.menu._getMenuItems().indexOf(userMenu._notificationsSwitch);
        
        this.menuItem = new PopupMenu.PopupSwitchMenuItem("Redshift", false);
        this.menuItem.connect("toggled", Lang.bind(this, this._toggle));
        userMenu.menu.addMenuItem(this.menuItem, index + 1);
        
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
                command.push("-l " + provider);
            }
            let tempDay = this._settings.get_int(RedshiftUtil.REDSHIFT_TEMPERATURE_DAYTIME_KEY);
            let tempNight = this._settings.get_int(RedshiftUtil.REDSHIFT_TEMPERATURE_NIGHTTIME_KEY);
            command.push("-t " + tempDay + ":" + tempNight);
            command.push("-r");
            
            let [success, pid] = GLib.spawn_async(null, command, null,
                             GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                             null, null);
            GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid,
                                 Lang.bind(this, this._redshiftTerminated), null);
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
    _redshiftTerminated: function(pid, status, user_data) {
        GLib.spawn_close_pid(pid);
        this.pid = null;
        // reenable the switch again
        this.menuItem.setSensitive(true);
        this.menuItem.setToggleState(false);
    }
});


function init() {
    return new RedshiftToggle();
}

