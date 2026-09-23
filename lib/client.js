window.__ModuleLoader__.load({
	id: 'harness-workspace-title',
	factory: (require) => {
		var module = { exports: {} }
		var exports = module.exports
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

		const React = require('react')

		/** Package id: module-table key, style-owner tag, and this plugin's slot ids. */
		const PACKAGE_ID = 'harness-workspace-title'
		/** Locale namespace owned by this package. */
		const LOCALE_NS = 'harness-workspace-title'
		/** Settings namespace = this plugin's Loader entry id (see the Host half). */
		const SETTINGS_NS = 'harness-workspace-title'
		/** Field carrying the master switch. */
		const ENABLED_FIELD = 'enabled'
		/** Field carrying the text colour. */
		const COLOR_FIELD = 'color'
		/** Colour used until the namespace is ready, or while the field is empty. */
		const DEFAULT_COLOR = 'var(--dsw-alias-label-tertiary)'
		/**
		 * Seat the name badge is registered into: a list-kind, SESSION-scoped
		 * floating layer inside the resident composer card, declared by
		 * ui-conversation's composer-bar entry. Its anchor is a zero-height,
		 * absolutely positioned box at the card's top edge — which is what makes
		 * a right-aligned line above the input box possible without disturbing
		 * the composer's own layout.
		 */
		const BADGE_SLOT = 'conversation.input.overlay'
		/**
		 * Seat the preference row is registered into: the additive row list of
		 * Settings > General, declared by ui-settings-general's General entry.
		 * The owner passes no props; a row owns its own copy and write path.
		 */
		const SETTINGS_SLOT = 'settings.general.item'
		/**
		 * Row order inside the General section. The shipped rows sit at 10
		 * (Appearance) and 11 (Font size); "Current version" sits at 100.
		 */
		const SETTINGS_ROW_ORDER = 50

		/** Feature copy for both shipped locales. zh carries Traditional Chinese. */
		const zh = {
			'settings.title': 'Workspace 名稱',
			'settings.description': '在輸入欄右上方顯示目前 Workspace 的名稱。顏色可自訂；字體沿用預設大小，不需設定。',
			'settings.toggle': '顯示',
			'settings.color': '文字顏色',
			'settings.custom': '自訂顏色',
			'settings.customPlaceholder': '#7cc4ff 或 var(--dsw-alias-label-secondary)',
			'settings.saveFailed': '無法儲存設定，請再試一次。',
			'color.preset.tertiary': '主題淡色',
			'color.preset.secondary': '主題次要',
			'color.preset.primary': '主題主要',
			'color.preset.business': '藍',
			'color.preset.success': '綠',
			'color.preset.warn': '黃',
			'color.preset.error': '紅',
		}
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			'settings.title': 'Workspace name',
			'settings.description': 'Shows the current Workspace name above the right-hand side of the input box. The colour is configurable; the font keeps the default size.',
			'settings.toggle': 'Show',
			'settings.color': 'Text colour',
			'settings.custom': 'Custom colour',
			'settings.customPlaceholder': '#7cc4ff or var(--dsw-alias-label-secondary)',
			'settings.saveFailed': 'The deployment did not accept the value; please try again.',
			'color.preset.tertiary': 'Theme muted',
			'color.preset.secondary': 'Theme secondary',
			'color.preset.primary': 'Theme primary',
			'color.preset.business': 'Blue',
			'color.preset.success': 'Green',
			'color.preset.warn': 'Amber',
			'color.preset.error': 'Red',
		}

		/**
		 * Preset colours offered by the settings row, in display order. Every
		 * value is a theme token, so both the swatches and the stored setting
		 * follow the light/dark theme; anything else goes through the text field.
		 */
		const COLOR_PRESETS = [
			{ value: 'var(--dsw-alias-label-tertiary)', labelKey: 'color.preset.tertiary' },
			{ value: 'var(--dsw-alias-label-secondary)', labelKey: 'color.preset.secondary' },
			{ value: 'var(--dsw-alias-label-primary)', labelKey: 'color.preset.primary' },
			{ value: 'var(--dsw-alias-state-business-primary)', labelKey: 'color.preset.business' },
			{ value: 'var(--dsw-alias-state-success-primary)', labelKey: 'color.preset.success' },
			{ value: 'var(--dsw-alias-state-warn-primary)', labelKey: 'color.preset.warn' },
			{ value: 'var(--dsw-alias-state-error-primary)', labelKey: 'color.preset.error' },
		]

		/** Stylesheet installed while the plugin is mounted. */
		const STYLE_TEXT = [
			/* The badge: one right-aligned line floating just above the composer
			   card. conversation.input.overlay renders into a zero-height, absolutely
			   positioned anchor at the card's top edge, so this line is laid out in
			   flow from that edge and then translated up by its own height. Pointer
			   events are off so the composer stays fully clickable underneath. */
			'.hwt-host{box-sizing:border-box;display:flex;justify-content:flex-end;padding:0 18px 6px;transform:translateY(-100%);pointer-events:none;user-select:none}',
			/* The name itself: it inherits the composer card's own text size, so no
			   font-size setting is needed and the theme content font size is
			   followed. A long name ellipsises instead of spilling over the
			   composer controls. */
			'.hwt-name{min-width:0;max-width:min(60vw,460px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:inherit;font-weight:400;line-height:18px;letter-spacing:.01em}',
			/* Settings > General row, matching the shipped row metrics. */
			'.hwt-row{border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:24px;padding:16px 0;display:flex}',
			'.hwt-rowText{min-width:0}',
			'.hwt-rowTitle{font-size:14px;line-height:20px}',
			'.hwt-rowDescription{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}',
			'.hwt-rowControl{align-items:center;gap:12px;flex:none;display:flex}',
			'.hwt-swatches{align-items:center;gap:6px;display:flex}',
			/* A swatch paints itself with currentColor while its inline style sets
			   color to the preset, so a var() preset shows its resolved colour
			   rather than the literal token text. */
			'.hwt-swatch{box-sizing:border-box;width:18px;height:18px;padding:0;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;background:currentColor;cursor:pointer}',
			'.hwt-swatch:disabled{cursor:default;opacity:.5}',
			'.hwt-swatch[data-selected=true]{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}',
			'.hwt-input{box-sizing:border-box;width:190px;height:28px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px;line-height:18px}',
			'.hwt-input:focus-visible{outline:none;border-color:var(--dsw-alias-state-business-primary)}',
			'.hwt-input:disabled{opacity:.5}',
			'.hwt-toggleLabel{align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap;cursor:pointer;display:flex}',
			'.hwt-toggle{flex:none;width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-state-business-primary);cursor:pointer}',
			'.hwt-error{color:var(--dsw-alias-state-error-primary);margin-top:4px;font-size:12px;line-height:18px}',
		].join('')

/* ------------------------------------------------------------------ *
		 * Pure helpers (exported below as test seams).
		 * ------------------------------------------------------------------ */

		/**
		 * Derive a display name from a working-directory path: its last segment.
		 * @param cwd - host directory path (either separator).
		 * @returns the basename, or '' when the path has nothing to show.
		 */
		function workspaceTitleOf(cwd) {
			if (typeof cwd !== 'string' || cwd === '') return ''
			const normalized = cwd.replace(/[\\/]+$/u, '')
			const cut = Math.max(normalized.lastIndexOf('/'), normalized.lastIndexOf('\\'))
			return cut === -1 ? normalized : normalized.slice(cut + 1)
		}

		/**
		 * The label DSH's own composer chip uses for an ungrouped Session: the
		 * directory basename, falling back to the whole path when a path ends in
		 * a separator and has no basename.
		 * @param cwd - host directory path.
		 * @returns the display label, or '' when there is none.
		 */
		function workspaceLabel(cwd) {
			const base = workspaceTitleOf(cwd)
			return base !== '' ? base : typeof cwd === 'string' ? cwd : ''
		}

		/**
		 * Resolve the display name of the Workspace that owns one Session.
		 *
		 * Mirrors the resolution the shipped composer chip performs, so the badge
		 * and the chip never disagree: the Session's owning Workspace title first,
		 * then the Session's cwd basename (an ungrouped Session), then nothing.
		 * No "most recently used Workspace" fallback is applied on purpose — for a
		 * Session that belongs to no Workspace, that guess would name a Workspace
		 * the Session is not in.
		 *
		 * @param sessionId - the Session whose Workspace to name.
		 * @param sessions - Session list snapshot (read for byId[id].cwd).
		 * @param workspaces - Workspace list snapshot (read for items).
		 * @returns the Workspace name, or '' when nothing resolves.
		 */
		function resolveWorkspaceName(sessionId, sessions, workspaces) {
			if (typeof sessionId !== 'string' || sessionId === '') return ''
			const items = workspaces !== undefined && workspaces !== null && Array.isArray(workspaces.items) ? workspaces.items : []
			const owner = items.find((workspace) => (
				workspace !== null
				&& typeof workspace === 'object'
				&& Array.isArray(workspace.sessionIds)
				&& workspace.sessionIds.indexOf(sessionId) !== -1
			))
			if (owner !== undefined && typeof owner.title === 'string' && owner.title !== '') return owner.title
			const byId = sessions !== undefined && sessions !== null ? sessions.byId : undefined
			const row = byId !== undefined && byId !== null ? byId[sessionId] : undefined
			return workspaceLabel(row !== undefined && row !== null ? row.cwd : undefined)
		}

		/**
		 * Effective display settings for one namespace snapshot value.
		 * @param value - the resolved settings section, when one has arrived.
		 * @returns the master switch and the colour to paint with.
		 */
		function readSettings(value) {
			const section = value !== null && typeof value === 'object' ? value : {}
			const enabled = typeof section.enabled === 'boolean' ? section.enabled : true
			const color = typeof section.color === 'string' ? section.color.trim() : ''
			return { enabled, color: color === '' ? DEFAULT_COLOR : color }
		}

		/* ------------------------------------------------------------------ *
		 * Components.
		 * ------------------------------------------------------------------ */

		/**
		 * Subscribe to a settings form. The form hands out a stable snapshot
		 * reference until the value actually changes, which is what
		 * useSyncExternalStore requires.
		 * @param form - this plugin's ConfigForm controller.
		 * @returns the current form snapshot.
		 */
		function useFormSnapshot(form) {
			const subscribe = React.useCallback((listener) => form.subscribe(listener), [form])
			const getSnapshot = React.useCallback(() => form.getSnapshot(), [form])
			return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
		}

		/**
		 * The Workspace name badge. Renders nothing while the master switch is
		 * off or while no name resolves, so an ungrouped Session that has not
		 * reported its cwd yet shows no empty plate.
		 */
		function WorkspaceNameBadge(props) {
			const snapshot = useFormSnapshot(props.form)
			const sessions = props.useSessions((state) => state)
			const workspaces = props.useWorkspaces((state) => state)
			const settings = readSettings(snapshot.value)
			if (!settings.enabled) return null
			const name = resolveWorkspaceName(props.sessionId, sessions, workspaces)
			if (name === '') return null
			return React.createElement(
				'div',
				{ className: 'hwt-host', 'data-workspace-name': '' },
				React.createElement('span', { className: 'hwt-name', style: { color: settings.color }, title: name }, name),
			)
		}

		/**
		 * The Settings > General preference row: master switch, colour presets,
		 * and a free-text colour field. Writes go straight to the namespace (no
		 * staged Save), each one fenced by the revision the form last read.
		 */
		function WorkspaceNameRow(props) {
			const t = props.t
			const form = props.form
			const snapshot = useFormSnapshot(form)
			const settings = readSettings(snapshot.value)
			const [draft, setDraft] = React.useState(settings.color)
			const [busy, setBusy] = React.useState(false)
			const [failed, setFailed] = React.useState(false)
			const writable = snapshot.status === 'ready' && snapshot.writable === true

			/** Follow the stored colour, including after a preset or a reset. */
			React.useEffect(() => {
				setDraft(settings.color)
			}, [settings.color])

			/**
			 * Queue one write. Passing undefined clears the field instead, so it
			 * re-inherits the schema default rather than pinning a copy of it.
			 */
			const write = (field, value) => {
				setFailed(false)
				setBusy(true)
				const pending = value === undefined ? form.unset(field) : form.set(field, value)
				return Promise.resolve(pending).then(
					(accepted) => {
						if (accepted === false) setFailed(true)
					},
					() => {
						setFailed(true)
					},
				).finally(() => {
					setBusy(false)
				})
			}

			/** Commit the free-text field (on blur or Enter), not every keystroke. */
			const commitColor = () => {
				const next = draft.trim()
				if (next === settings.color) return
				write(COLOR_FIELD, next === '' || next === DEFAULT_COLOR ? undefined : next)
			}

			const controls = [
				React.createElement(
					'div',
					{ key: 'swatches', className: 'hwt-swatches', role: 'group', 'aria-label': t('settings.color') },
					COLOR_PRESETS.map((preset) => React.createElement('button', {
						key: preset.value,
						type: 'button',
						className: 'hwt-swatch',
						'data-selected': settings.color === preset.value ? 'true' : 'false',
						style: { color: preset.value },
						title: t(preset.labelKey),
						'aria-label': t(preset.labelKey),
						disabled: !writable || busy,
						onClick: () => {
							write(COLOR_FIELD, preset.value)
						},
					})),
				),
				React.createElement('input', {
					key: 'custom',
					className: 'hwt-input',
					type: 'text',
					value: draft,
					placeholder: t('settings.customPlaceholder'),
					'aria-label': t('settings.custom'),
					spellCheck: false,
					disabled: !writable || busy,
					onChange: (event) => {
						setDraft(event.target.value)
					},
					onBlur: commitColor,
					onKeyDown: (event) => {
						if (event.key === 'Enter') {
							event.preventDefault()
							commitColor()
						}
					},
				}),
				React.createElement(
					'label',
					{ key: 'toggle', className: 'hwt-toggleLabel' },
					React.createElement('input', {
						className: 'hwt-toggle',
						type: 'checkbox',
						checked: settings.enabled,
						disabled: !writable || busy,
						onChange: (event) => {
							write(ENABLED_FIELD, event.target.checked)
						},
					}),
					t('settings.toggle'),
				),
			]

			return React.createElement(
				'div',
				{ className: 'hwt-row' },
				React.createElement(
					'div',
					{ className: 'hwt-rowText' },
					React.createElement('div', { className: 'hwt-rowTitle' }, t('settings.title')),
					React.createElement('div', { className: 'hwt-rowDescription' }, t('settings.description')),
					failed
						? React.createElement('div', { className: 'hwt-error', role: 'alert' }, t('settings.saveFailed'))
						: null,
				),
				React.createElement('div', { className: 'hwt-rowControl' }, controls),
			)
		}

		/* ------------------------------------------------------------------ *
		 * Plugin body.
		 * ------------------------------------------------------------------ */

		/**
		 * Required client services: the slot registry, the locale registry, the
		 * forwarded settings invalidation the form subscribes through, and the
		 * shared configuration forms this plugin's namespace is read and written
		 * through.
		 */
		const inject = ['slots', 'locale', 'remote', 'configForms']

		/**
		 * Register the dictionaries, the stylesheet, the name badge, and the
		 * Settings > General preference row.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), 'harness-workspace-title: dictionaries')
			ctx.effect(() => {
				const style = document.createElement('style')
				style.dataset.plugin = PACKAGE_ID
				style.dataset.pluginCss = PACKAGE_ID + '/styles'
				style.textContent = STYLE_TEXT
				document.head.append(style)
				return () => {
					style.remove()
				}
			}, 'harness-workspace-title: styles')

			const form = ctx.configForms.get(SETTINGS_NS)

			// The badge: additive entry in the Session-scoped composer overlay.
			ctx.slots.inject(BADGE_SLOT, () => ctx.slots.register({
				name: BADGE_SLOT,
				id: PACKAGE_ID,
				order: 0,
				inject: () => ({ form }),
			}, WorkspaceNameBadge))

			// The preference row: additive entry in Settings > General.
			ctx.slots.inject(SETTINGS_SLOT, () => ctx.slots.register({
				name: SETTINGS_SLOT,
				id: PACKAGE_ID,
				order: SETTINGS_ROW_ORDER,
				locale: LOCALE_NS,
				inject: () => ({ form }),
			}, WorkspaceNameRow))
		}

		exports.apply = apply
		exports.inject = inject
		/* Test seams: the pure helpers the badge and the row are built on. */
		exports.__internals = {
			BADGE_SLOT,
			COLOR_FIELD,
			COLOR_PRESETS,
			DEFAULT_COLOR,
			ENABLED_FIELD,
			SETTINGS_NS,
			SETTINGS_SLOT,
			readSettings,
			resolveWorkspaceName,
			workspaceLabel,
			workspaceTitleOf,
		}
		return module.exports
	},
})
