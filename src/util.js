
const ExtensionUtils = imports.misc.extensionUtils;

const Gio = imports.gi.Gio;

const REDSHIFT_LOCATION_PROVIDER_KEY = "location-provider";
const REDSHIFT_LOCATION_LATITUDE_KEY = "location-latitude";
const REDSHIFT_LOCATION_LONGITUDE_KEY = "location-longitude";
const REDSHIFT_TEMPERATURE_DAYTIME_KEY = "temperature-daytime";
const REDSHIFT_TEMPERATURE_NIGHTTIME_KEY = "temperature-nighttime";

function getSettings(schema) {
    let extension = ExtensionUtils.getCurrentExtension();

    schema = schema || extension.metadata['settings-schema'];

    const GioSSS = Gio.SettingsSchemaSource;

    // check if we have schemas available locally in the extension dir
    let schemaDir = extension.dir.get_child('schemas');
    let schemaSource;
    if (schemaDir.query_exists(null))
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
                                                 GioSSS.get_default(),
                                                 false);
    else
        schemaSource = GioSSS.get_default();

    let schemaObj = schemaSource.lookup(schema, true);
    if (!schemaObj)
        throw new Error('Schema ' + schema + ' could not be found for extension '
                        + extension.metadata.uuid + '. Please check your installation.');

    return new Gio.Settings({ settings_schema: schemaObj });
}

