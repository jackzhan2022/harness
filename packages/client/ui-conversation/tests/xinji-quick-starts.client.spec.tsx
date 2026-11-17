// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { zh } from '../src/client/locales.ts'
import { XinjiQuickStarts } from '../src/client/skeleton/XinjiQuickStarts.tsx'

afterEach(cleanup)

it('offers a reviewable prompt for each business, engineering and data task', () => {
  const onSelect = vi.fn()
  const view = render(<XinjiQuickStarts t={makeTranslate(zh, commonZh)} disabled={false} onSelect={onSelect} />)
  for (const label of ['业务方案', '研发协作', '数据分析']) fireEvent.click(view.getByRole('button', { name: new RegExp(label) }))
  expect(onSelect.mock.calls.map(([prompt]) => prompt)).toEqual([
    zh['hero.internal.proposal.prompt'], zh['hero.internal.development.prompt'], zh['hero.internal.analysis.prompt'],
  ])
})

it('cannot replace a protected draft when the owner disables the starters', () => {
  const onSelect = vi.fn()
  const view = render(<XinjiQuickStarts t={makeTranslate(zh, commonZh)} disabled onSelect={onSelect} />)
  for (const button of view.getAllByRole('button')) fireEvent.click(button)
  expect(onSelect).not.toHaveBeenCalled()
})
