/**
 * Functional tests for the browser half: run the bundle's apply() against a
 * recording cordis context, then render both components with a minimal React
 * stand-in. This catches registration mistakes (slot name, id, order, inject
 * face) and the badge's show/hide and colour decisions without a browser.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '..', 'lib', 'client.js'), 'utf8')

/** Element tree node produced by the React stand-in. */
function element(type, props, rest) {
  const children = rest.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false)
  return { type, props: props ?? {}, children }
}

/** React stand-in: elements plus the hooks these components actually call. */
const reactStub = {
  createElement: (type, props, ...children) => element(type, props, children),
  useCallback: (fn) => fn,
  useEffect: () => {},
  useState: (initial) => [initial, () => {}],
  useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
}

/** Load the bundle the way the browser module table does. */
let definition
new Function('window', source)({ __ModuleLoader__: { load: (value) => { definition = value } } })
const bundle = definition.factory((id) => {
  if (id === 'react') return reactStub
  throw new Error('unexpected require: ' + id)
})

/** A ConfigForm stand-in over one fixed section. */
function fakeForm(value, overrides = {}) {
  const snapshot = { status: 'ready', value, base: undefined, user: undefined, revision: 1, writable: true, mode: 'host' }
  return Object.assign({
    getSnapshot: () => snapshot,
    subscribe: () => () => {},
    set: async () => true,
    unset: async () => true,
    mutate: async () => true,
  }, overrides)
}

/** A recording client context covering exactly the services apply() touches. */
function recordingContext(form) {
  const registrations = []
  const styles = []
  globalThis.document = {
    createElement: () => ({ dataset: {}, textContent: '', remove() {} }),
    head: { append: (node) => styles.push(node) },
  }
  const ctx = {
    effect: (fn) => {
      const disposer = fn()
      return typeof disposer === 'function' ? disposer : () => {}
    },
    locale: { register: () => () => {} },
    configForms: { get: (ns) => { ctx.seenNamespace = ns; return form } },
    slots: {
      inject: (name, callback) => callback(),
      register: (options, component) => {
        registrations.push({ options, component })
        return () => {}
      },
    },
  }
  return { ctx, registrations, styles }
}

/** Props a session-scoped slot entry receives, over one fixed world. */
function badgeProps(form, world) {
  return {
    form,
    sessionId: world.sessionId,
    useSessions: (selector) => selector(world.sessions),
    useWorkspaces: (selector) => selector(world.workspaces),
  }
}

test('apply registers the badge and the settings row into the right seats', () => {
  const form = fakeForm({ enabled: true, color: '#7cc4ff' })
  const { ctx, registrations, styles } = recordingContext(form)
  bundle.apply(ctx)

  assert.equal(registrations.length, 2, 'exactly two slot registrations')
  const bySlot = Object.fromEntries(registrations.map((row) => [row.options.name, row]))

  const badge = bySlot['conversation.input.overlay']
  assert.ok(badge, 'the badge registers into the composer overlay seat')
  assert.equal(badge.options.id, 'harness-workspace-title')
  assert.equal(badge.options.order, 0)
  assert.equal(typeof badge.component, 'function')

  const row = bySlot['settings.general.item']
  assert.ok(row, 'the row registers into the General section')
  assert.equal(row.options.id, 'harness-workspace-title')
  assert.equal(row.options.order, 50)
  assert.equal(row.options.locale, 'harness-workspace-title')

  assert.equal(ctx.seenNamespace, 'harness-workspace-title', 'reads its own settings namespace')
  assert.equal(styles.length, 1, 'installs one stylesheet')
  assert.match(styles[0].textContent, /\.hwt-host\{/)
  assert.equal(styles[0].dataset.plugin, 'harness-workspace-title')
})

test('the badge shows the Workspace name with the configured colour', () => {
  const form = fakeForm({ enabled: true, color: '#7cc4ff' })
  const { registrations, ctx } = recordingContext(form)
  bundle.apply(ctx)
  const badge = registrations.find((row) => row.options.name === 'conversation.input.overlay').component

  const rendered = badge(badgeProps(form, {
    sessionId: 's1',
    sessions: { byId: { s1: { cwd: 'D:\\Projects\\demo' } } },
    workspaces: { items: [{ workspaceId: 'w1', title: '我的專案', sessionIds: ['s1'] }] },
  }))

  assert.equal(rendered.type, 'div')
  assert.equal(rendered.props.className, 'hwt-host')
  const span = rendered.children[0]
  assert.equal(span.type, 'span')
  assert.equal(span.props.style.color, '#7cc4ff')
  assert.equal(span.props.title, '我的專案')
  assert.deepEqual(span.children, ['我的專案'])
})

test('the badge falls back to the cwd basename and hides when nothing resolves', () => {
  const form = fakeForm({ enabled: true, color: '#7cc4ff' })
  const { registrations, ctx } = recordingContext(form)
  bundle.apply(ctx)
  const badge = registrations.find((row) => row.options.name === 'conversation.input.overlay').component

  const ungrouped = badge(badgeProps(form, {
    sessionId: 's1',
    sessions: { byId: { s1: { cwd: 'D:\\Projects\\demo' } } },
    workspaces: { items: [] },
  }))
  assert.deepEqual(ungrouped.children[0].children, ['demo'])

  const nothing = badge(badgeProps(form, { sessionId: 's1', sessions: { byId: { s1: {} } }, workspaces: { items: [] } }))
  assert.equal(nothing, null, 'no name, no plate')
})

test('the badge hides while the master switch is off', () => {
  const form = fakeForm({ enabled: false, color: '#7cc4ff' })
  const { registrations, ctx } = recordingContext(form)
  bundle.apply(ctx)
  const badge = registrations.find((row) => row.options.name === 'conversation.input.overlay').component

  const rendered = badge(badgeProps(form, {
    sessionId: 's1',
    sessions: { byId: { s1: { cwd: 'D:\\Projects\\demo' } } },
    workspaces: { items: [] },
  }))
  assert.equal(rendered, null)
})

test('the badge still renders with the default colour while settings are unavailable', () => {
  const form = fakeForm(undefined)
  const { registrations, ctx } = recordingContext(form)
  bundle.apply(ctx)
  const badge = registrations.find((row) => row.options.name === 'conversation.input.overlay').component

  const rendered = badge(badgeProps(form, {
    sessionId: 's1',
    sessions: { byId: { s1: { cwd: 'D:\\Projects\\demo' } } },
    workspaces: { items: [] },
  }))
  assert.equal(rendered.children[0].props.style.color, bundle.__internals.DEFAULT_COLOR)
})

test('the settings row renders a row with the switch reflecting the stored value', () => {
  const form = fakeForm({ enabled: false, color: '#7cc4ff' })
  const { registrations, ctx } = recordingContext(form)
  bundle.apply(ctx)
  const row = registrations.find((record) => record.options.name === 'settings.general.item').component

  const rendered = row({ t: (key) => key, form })
  assert.equal(rendered.props.className, 'hwt-row')

  const [text, control] = rendered.children
  assert.equal(text.props.className, 'hwt-rowText')
  assert.equal(text.children[0].children[0], 'settings.title')

  const toggle = control.children.find((child) => child.type === 'label')
  assert.equal(toggle.children[0].props.type, 'checkbox')
  assert.equal(toggle.children[0].props.checked, false)

  const input = control.children.find((child) => child.type === 'input')
  assert.equal(input.props.value, '#7cc4ff')

  const swatches = control.children.find((child) => child.props.className === 'hwt-swatches')
  assert.equal(swatches.children.length, bundle.__internals.COLOR_PRESETS.length)
})
