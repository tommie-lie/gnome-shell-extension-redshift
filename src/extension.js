
const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;


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
        userMenu.menu.addMenuItem(this.menuItem, index + 1);
    },
    disable: function() {
        this.menuItem.destroy();
    }
});


function init() {
    return new RedshiftToggle();
}

