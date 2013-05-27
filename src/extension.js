
const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;


const RedshiftToggle = new Lang.Class({
    Name: "redshift",

    _init: function() {
    },
    enable: function() {
        let userMenu = Main.panel.statusArea.userMenu;
        // try to find the correct position:
        // after notifications switch
        let index = userMenu.menu._getMenuItems().indexOf(userMenu._notificationsSwitch);
        
        this.menuItem = new PopupMenu.PopupSwitchMenuItem("Redshift", false);
        this.menuItem.connect("toggled", Lang.bind(this, this._toggle));
        userMenu.menu.addMenuItem(this.menuItem, index + 1);
    },
    disable: function() {
        this.menuItem.destroy();
    },
    
    _toggle: function(item, state) {
        if (state) {
            let [success, pid] = GLib.spawn_async(null, ["redshift"], null,
                             GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                             null, null);
            GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, Lang.bind(this, this._redshift_terminated), null);
            this.pid = pid;
        } else {
            if (this.pid) {
                Util.spawnCommandLine("kill -TERM " + this.pid);
                // killing takes a few seconds due to the soft transition,
                // we don't want to spawn in this time again, so disable
                // the switch
                this.menuItem.setSensitive(false);
            }
        }
    },
    _redshift_terminated: function(pid, status, user_data) {
        GLib.spawn_close_pid(pid);
        this.pid = null;
        // reenable the switch again
        this.menuItem.setSensitive(true);
    }
});


function init() {
    return new RedshiftToggle();
}

