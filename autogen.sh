#!/bin/sh
srcdir=`dirname $0`
[ -z "$srcdir" ] && srcdir=.

PKG_NAME=mypackage

if [ ! -f "$srcdir/configure.ac" ]; then
    echo "$srcdir doesn't look like source directory for $PKG_NAME" >&2
    exit 1
fi

which gnome-autogen.sh || {
    echo "You need to install gnome-common from GNOME Git (or from"
    echo "your OS vendor's package manager)."
    exit 1
}

NOCONFIGURE=true
. gnome-autogen.sh

