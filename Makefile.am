additional_files = 


uuid = @PACKAGE_NAME@

# blatantly stolen from http://blog.jgc.org/2011/07/gnu-make-recursive-wildcard-function.html
rwildcard=$(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))

extension_files_pattern := *.js *.css *.png *.svg *.jpg *.wav *.mp3
extension_files = $(foreach ext,$(extension_files_pattern),$(call rwildcard,src/,$(ext)))

opt_files_pattern := README.rst README.md README COPYING AUTHORS LICENSE ChangeLog
opt_files = $(foreach file,$(opt_files_pattern),$(wildcard $(file)))

extensionbase = $(datadir)/gnome-shell/extensions
extensiondir = $(extensionbase)/$(uuid)


nobase_dist_extension_DATA = src/metadata.json $(extension_files) $(additional_files) $(opt_files)

.PHONY: zip local-install local-helper
    
zip:
	$(MAKE) local-helper DESTDIR=$(abs_builddir)/_build
	(cd $(abs_builddir)/_build/$(uuid)/ && \
	 zip -qr $(abs_builddir)/$(uuid).zip . \
	)
	-rm -rf $(abs_builddir)/_build

CLEANFILES = $(abs_builddir)/$(uuid).zip
DISTCLEANFILES = $(uuid).zip

local-install:
	$(MAKE) local-helper DESTDIR=$(HOME)/.local/share/gnome-shell/extensions

local-helper: all
	$(MAKE) install prefix='' DATADIRNAME='$(uuid)' extensionbase=''

install-data-hook:
	-mv $(DESTDIR)$(extensiondir)/src/* $(DESTDIR)$(extensiondir)
	-rmdir $(DESTDIR)$(extensiondir)/src

if HAVE_GSETTINGS
schemasdir = $(extensiondir)/schemas
schemas_DATA = src/schemas/gschemas.compiled

CLEANFILES += $(schemas_DATA)
DISTCLEANFILES += $(sort $(GSETTINGS_SCHEMAS_CONFIGURE))

.SECONDARY: $(GSETTINGS_SCHEMAS)
CLEANFILES += $(GSETTINGS_SCHEMAS)

%gschemas.compiled: $(sort $(GSETTINGS_SCHEMAS))
	$(GLIB_COMPILE_SCHEMAS) $(dir $@)
endif


if HAVE_I18N
# until intltool plays nicely with non-recursive make
SUBDIRS = @CONFIGURE_SUBDIRS@

@INTLTOOL_XML_NOMERGE_RULE@
endif

