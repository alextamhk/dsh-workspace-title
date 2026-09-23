/**
 * harness-workspace-title — Host half.
 *
 * The plugin renders entirely in the browser. This half exists for two
 * reasons:
 *
 *  1. The profile needs a Loader row before the client module system will
 *     serve a browser bundle for this package; cordis.patch.yml inserts it.
 *  2. Its Config schema is what puts the `harness-workspace-title` settings
 *     namespace on the wire. The settings describe mirror reads every Loader
 *     entry's schema, so declaring Config here is what lets the browser half
 *     read the preference through ctx.configForms and write it from the
 *     Settings > General row.
 *
 * Note on dependency resolution: a plugin installed with `link:` is resolved
 * by Node at its REAL path, not through the profile's node_modules symlink, so
 * a linked plugin cannot import the profile's own packages. @deepseek-ai/
 * schemastery is therefore a real dependency of this package (matching the
 * profile's own 3.18.4), and nothing else is imported.
 * @module harness-workspace-title
 */
import z from '@deepseek-ai/schemastery'

/** Stable cordis plugin name (matches the cordis.patch.yml insert id). */
export const name = 'harness-workspace-title'

/** Settings namespace, which is also this plugin's Loader entry id. */
export const SETTINGS_NS = 'harness-workspace-title'

/** Field carrying the badge's master switch. */
export const ENABLED_FIELD = 'enabled'

/** Field carrying the badge's text colour (any CSS colour, including a var()). */
export const COLOR_FIELD = 'color'

/**
 * Default colour: the theme's muted label token, so an out-of-box badge reads
 * as quiet chrome and follows light/dark themes without a per-theme setting.
 */
export const DEFAULT_COLOR = 'var(--dsw-alias-label-tertiary)'

/**
 * Live preferences. Both fields are `.volatile()` so saving in Settings does
 * not restart the entry: the settings mirror pushes the new value to the
 * browser half, which re-renders in place.
 */
export const Config = z.object({
  [ENABLED_FIELD]: z.boolean().default(true).volatile(),
  [COLOR_FIELD]: z.string().default(DEFAULT_COLOR).volatile(),
})

/**
 * No Host-side behaviour: the badge and its settings row are both browser
 * halves, and the Config schema above is read by the frame, not by this body.
 */
export function apply() {}
