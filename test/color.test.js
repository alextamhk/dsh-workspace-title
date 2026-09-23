/**
 * Colour-helper tests for the browser half.
 *
 * These cover the conversion layer behind the native <input type="color">: the
 * control only accepts #rrggbb, while a stored preference may be a theme token
 * such as var(--dsw-alias-label-tertiary), an rgb() string, or a transparent
 * value it cannot represent at all.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '..', 'lib', 'client.js'), 'utf8')

let definition
new Function('window', source)({ __ModuleLoader__: { load: (value) => { definition = value } } })

const reactStub = { createElement: () => null, useCallback: (fn) => fn, useEffect: () => {}, useRef: () => ({}), useState: (v) => [v, () => {}], useSyncExternalStore: () => undefined }
const bundle = definition.factory((id) => {
  if (id === 'react') return reactStub
  throw new Error('unexpected require: ' + id)
})
const { normalizeHexColor, parseCssColor, pickerHexOf, computedCssColor, PICKER_FALLBACK_HEX } = bundle.__internals

test('normalizeHexColor expands short hex and drops alpha', () => {
  assert.equal(normalizeHexColor('#abc'), '#aabbcc')
  assert.equal(normalizeHexColor('#ABC'), '#aabbcc')
  assert.equal(normalizeHexColor('#aabbcc'), '#aabbcc')
  assert.equal(normalizeHexColor('#AABBCCDD'), '#aabbcc')
  assert.equal(normalizeHexColor('#abcd'), '#aabbcc')
  assert.equal(normalizeHexColor('  #aabbcc  '), '#aabbcc')
  assert.equal(normalizeHexColor('aabbcc'), undefined, 'a bare hex is not a CSS colour')
  assert.equal(normalizeHexColor('#ab'), undefined)
  assert.equal(normalizeHexColor(''), undefined)
  assert.equal(normalizeHexColor(undefined), undefined)
})

test('parseCssColor reads the rgb()/rgba() forms a computed style returns', () => {
  assert.equal(parseCssColor('rgb(240, 240, 240)'), '#f0f0f0')
  assert.equal(parseCssColor('rgb(240 240 240)'), '#f0f0f0')
  assert.equal(parseCssColor('rgba(240, 240, 240, 0.5)'), '#f0f0f0')
  assert.equal(parseCssColor('rgb(100%, 0%, 0%)'), '#ff0000')
  assert.equal(parseCssColor('rgb(300, -20, 0)'), '#ff0000', 'channels clamp')
  assert.equal(parseCssColor('rgba(0, 0, 0, 0)'), undefined, 'fully transparent has no picker value')
  assert.equal(parseCssColor('transparent'), undefined)
  assert.equal(parseCssColor('var(--dsw-alias-label-tertiary)'), undefined, 'a token needs the document')
  assert.equal(parseCssColor(''), undefined)
  assert.equal(parseCssColor(undefined), undefined)
})

test('pickerHexOf prefers a directly readable colour', () => {
  assert.equal(pickerHexOf('#7cc4ff', '#000000'), '#7cc4ff')
  assert.equal(pickerHexOf('rgb(124, 196, 255)', '#000000'), '#7cc4ff')
})

test('pickerHexOf falls back when the value cannot be resolved', () => {
  // No document in this process: a theme token has nothing to resolve against.
  assert.equal(pickerHexOf('var(--dsw-alias-label-tertiary)', PICKER_FALLBACK_HEX), PICKER_FALLBACK_HEX)
  assert.equal(pickerHexOf('transparent', '#123456'), '#123456')
  assert.equal(pickerHexOf(undefined, '#123456'), '#123456')
})

test('pickerHexOf resolves a theme token through the document', () => {
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
    body: { append() {} },
  }
  globalThis.getComputedStyle = () => ({ color: 'rgb(240, 240, 240)' })
  try {
    assert.equal(pickerHexOf('var(--dsw-alias-label-tertiary)', PICKER_FALLBACK_HEX), '#f0f0f0')
  } finally {
    delete globalThis.document
    delete globalThis.getComputedStyle
  }
})

test('computedCssColor reports failure instead of throwing', () => {
  assert.equal(computedCssColor('var(--x)'), undefined, 'no document')
  globalThis.document = {
    createElement: () => ({ style: {}, remove() {} }),
    body: { append() {} },
  }
  globalThis.getComputedStyle = () => { throw new Error('boom') }
  try {
    assert.equal(computedCssColor('var(--x)'), undefined, 'a throwing engine is caught')
  } finally {
    delete globalThis.document
    delete globalThis.getComputedStyle
  }
})
