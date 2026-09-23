/**
 * Pure-helper tests for the browser half.
 *
 * lib/client.js is a browser bundle (it hands itself to
 * window.__ModuleLoader__), so the test loads it the way the module loader
 * does and pulls the exported test seams out of the resulting exports. Only
 * react is required, and only as a stub: every helper exercised here is pure.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '..', 'lib', 'client.js'), 'utf8')

/** The definition the bundle hands the module loader. */
let definition
new Function('window', source)({
  __ModuleLoader__: {
    load(value) {
      definition = value
    },
  },
})

assert.ok(definition !== undefined, 'the bundle must call window.__ModuleLoader__.load')

/** Minimal react face: the helpers under test never call into it. */
const reactStub = {
  createElement: () => null,
  useCallback: (fn) => fn,
  useEffect: () => {},
  useState: (initial) => [initial, () => {}],
  useSyncExternalStore: () => undefined,
}

const bundle = definition.factory((id) => {
  if (id === 'react') return reactStub
  throw new Error('unexpected require: ' + id)
})
const { resolveWorkspaceName, workspaceLabel, workspaceTitleOf, readSettings, DEFAULT_COLOR } = bundle.__internals

test('the bundle registers under the package id', () => {
  assert.equal(definition.id, 'harness-workspace-title')
  assert.equal(typeof bundle.apply, 'function')
  assert.deepEqual(bundle.inject, ['slots', 'locale', 'remote', 'configForms'])
})

test('workspaceTitleOf reads the last path segment on either separator', () => {
  assert.equal(workspaceTitleOf('D:\\Projects\\plugins\\harness-workspace-title'), 'harness-workspace-title')
  assert.equal(workspaceTitleOf('/home/alex/projects/harness'), 'harness')
  assert.equal(workspaceTitleOf('D:\\Projects\\plugins\\harness-workspace-title\\'), 'harness-workspace-title')
  assert.equal(workspaceTitleOf('harness'), 'harness')
  assert.equal(workspaceTitleOf(''), '')
  assert.equal(workspaceTitleOf(undefined), '')
})

test('workspaceLabel falls back to the whole path when it has no basename', () => {
  assert.equal(workspaceLabel('D:\\Projects\\demo'), 'demo')
  assert.equal(workspaceLabel('D:'), 'D:')
  assert.equal(workspaceLabel(undefined), '')
})

test('resolveWorkspaceName prefers the owning Workspace title', () => {
  const workspaces = { items: [{ workspaceId: 'w1', title: '我的專案', sessionIds: ['s1'] }] }
  const sessions = { byId: { s1: { cwd: 'D:\\other\\folder' } } }
  assert.equal(resolveWorkspaceName('s1', sessions, workspaces), '我的專案')
})

test('resolveWorkspaceName falls back to the cwd basename for an ungrouped Session', () => {
  const workspaces = { items: [{ workspaceId: 'w1', title: '其他專案', sessionIds: ['s2'] }] }
  const sessions = { byId: { s1: { cwd: 'D:\\Projects\\plugins\\harness-workspace-title' } } }
  assert.equal(resolveWorkspaceName('s1', sessions, workspaces), 'harness-workspace-title')
})

test('resolveWorkspaceName never guesses a Workspace the Session is not in', () => {
  const workspaces = { items: [{ workspaceId: 'w1', title: '其他專案', sessionIds: ['s2'] }] }
  const sessions = { byId: { s1: {} } }
  assert.equal(resolveWorkspaceName('s1', sessions, workspaces), '')
})

test('resolveWorkspaceName survives absent snapshots', () => {
  assert.equal(resolveWorkspaceName('s1', undefined, undefined), '')
  assert.equal(resolveWorkspaceName('s1', {}, {}), '')
  assert.equal(resolveWorkspaceName('', { byId: {} }, { items: [] }), '')
  assert.equal(resolveWorkspaceName(undefined, undefined, undefined), '')
})

test('readSettings applies the documented defaults', () => {
  assert.deepEqual(readSettings(undefined), { enabled: true, color: DEFAULT_COLOR })
  assert.deepEqual(readSettings(null), { enabled: true, color: DEFAULT_COLOR })
  assert.deepEqual(readSettings({}), { enabled: true, color: DEFAULT_COLOR })
  assert.deepEqual(readSettings({ color: '   ' }), { enabled: true, color: DEFAULT_COLOR })
})

test('readSettings honours stored values', () => {
  assert.deepEqual(readSettings({ enabled: false, color: '#7cc4ff' }), { enabled: false, color: '#7cc4ff' })
  assert.deepEqual(readSettings({ enabled: false }), { enabled: false, color: DEFAULT_COLOR })
})
