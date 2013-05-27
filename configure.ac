
AC_PREREQ([2.69])
AC_INIT(m4_esyscmd_s([(grep -o -E '"uuid"[[:space:]]*:[[:space:]]*"[^"]*"' | sed  's/.*"\([^"]*\)"$/\1/') < src/metadata.json]), [0])

AM_INIT_AUTOMAKE([1.10 foreign dist-xz tar-ustar subdir-objects])

# every extension has this file
AC_CONFIG_SRCDIR([src/metadata.json])

# read some of the config stuff from metadata.json
# uuid, gsettings, gettext
PACKAGE_GETTEXT_DOMAIN=[$((grep -o -E '"gettext-domain"[[:space:]]*:[[:space:]]*"[^"]*"' | sed  's/.*"\([^"]*\)"$/\1/') < src/metadata.json)]
PACKAGE_GSETTINGS_SCHEMA=[$((grep -o -E '"settings-schema"[[:space:]]*:[[:space:]]*"[^"]*"' | sed  's/.*"\([^"]*\)"$/\1/') < src/metadata.json)]

AC_SUBST([UUID], [$PACKAGE_NAME])
AC_SUBST([GETTEXT_DOMAIN], [$PACKAGE_GETTEXT_DOMAIN])
AC_SUBST([GSETTINGS_SCHEMA], [$PACKAGE_GSETTINGS_SCHEMA])


AC_MSG_NOTICE([checking if we want internationalization (i18n) support])
AC_CHECK_FILES([./po/Makefile.in.in], [HAVE_I18N=yes], [HAVE_I18N=no])
AM_CONDITIONAL([HAVE_I18N], [test "$HAVE_I18N" = "yes"])
AC_MSG_WARN([$HAVE_I18N])
AM_COND_IF([HAVE_I18N], [
    AC_CONFIG_FILES([po/Makefile.in])
    GETTEXT_PACKAGE=$PACKAGE_GETTEXT_DOMAIN
    AC_SUBST([GETTEXT_PACKAGE])
    AC_SUBST([CONFIGURE_SUBDIRS], [po ])
])


# this is a bad bad bad workaround that should be removed as soon
# as IT_PROG_INTLTOOL behaves and does not fail while checking
# or until I can replace it by a better macro that also has fewer dependencies
AC_CONFIG_COMMANDS_PRE(
    [AC_CONFIG_COMMANDS([po/fake-it],
                    [AS_IF([test "$MY_HAVE_I18N" = "no"],
                        [mkdir -p po
                         AC_MSG_NOTICE([tricking intltool into working])
                         touch po/POTFILES.in
                         echo '# INTLTOOL_MAKEFILE' > po/Makefile.in])],
                    [MY_HAVE_I18N=$HAVE_I18N])])
# space at the beginning to hide it from gnome-autogen.sh
 IT_PROG_INTLTOOL([0.26])

AC_CONFIG_COMMANDS_PRE(
    [AC_CONFIG_COMMANDS([po/clean-it],
                    [AS_IF([test "$MY_HAVE_I18N" = "no"],
                        [rm -rf po])],
                    [MY_HAVE_I18N=$HAVE_I18N])])
    


# when i18n is enabled, intltool looks for xml.in files, so the configuration
# input should be xml.in.in
# see if we have gsettings schemas to configure and compile
AM_COND_IF([HAVE_I18N], [
    # when i18n support is enabled, intltool will process xml.in files,
    # so configured files should be .in.in
    GSETTINGS_SCHEMAS_SUFFIX=".gschema.xml.in"
], [
    # i18n support disabled, so look for .in files only
    GSETTINGS_SCHEMAS_SUFFIX=".gschema.xml"
])

HAVE_SCHEMAS=no
AC_MSG_NOTICE([checking what to do with schemas])
GSETTINGS_SCHEMAS_CONFIGURE=$(find src/schemas/ -name "*${GSETTINGS_SCHEMAS_SUFFIX}.in" 2>/dev/null | tr '\n' ' ')
GSETTINGS_SCHEMAS_CONFIGURE=${GSETTINGS_SCHEMAS_CONFIGURE//${GSETTINGS_SCHEMAS_SUFFIX}.in/${GSETTINGS_SCHEMAS_SUFFIX}}

# let's see if we found any in the previous step
AS_IF([test -n "$GSETTINGS_SCHEMAS_CONFIGURE"], [
    # add processed schemas
    HAVE_SCHEMAS=yes
    # in either case (i18n or not) we have to strip one
    # level of .in on each file
    AC_CONFIG_FILES([$GSETTINGS_SCHEMAS_CONFIGURE])
    AC_SUBST([GSETTINGS_SCHEMAS_CONFIGURE])
    AC_MSG_NOTICE([will configure schemas])
])

# finally, we can have schema files that shall neither be translated,
# nor configured
GSETTINGS_SCHEMAS=$(find src/schemas/ -name '*.gschema.xml' 2>/dev/null | tr '\n' ' ')
AS_IF([test -n "${GSETTINGS_SCHEMAS}"], [
    HAVE_SCHEMAS=yes
])

AM_CONDITIONAL([HAVE_GSETTINGS], [test "$HAVE_SCHEMAS" = "yes"])
AM_COND_IF([HAVE_GSETTINGS], [
    AC_MSG_NOTICE([will compile schemas])
    GSETTINGS_SCHEMAS="$GSETTINGS_SCHEMAS ${GSETTINGS_SCHEMAS_CONFIGURE//$GSETTINGS_SCHEMAS_SUFFIX/.gschema.xml}"
    AC_SUBST([GSETTINGS_SCHEMAS])
    GLIB_GSETTINGS
])


AC_CONFIG_FILES([
    Makefile
])

AC_OUTPUT
