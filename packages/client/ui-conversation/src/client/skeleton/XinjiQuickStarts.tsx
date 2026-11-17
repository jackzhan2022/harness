import type { ConversationContentProps } from '../contract/slots.ts'
import css from './XinjiQuickStarts.module.css'

const TASKS = ['proposal', 'development', 'analysis'] as const

/**
 * Offer editable task starters without submitting a prompt or replacing existing work.
 * @param props - Localized copy, draft-safe disabled state, and explicit selection callback.
 * @returns Task starter buttons for business, engineering, and analysis.
 */
export function XinjiQuickStarts({ t, disabled, onSelect }: {
  t: ConversationContentProps['t']
  disabled: boolean
  onSelect: (prompt: string) => void
}) {
  return <section className={css.root} aria-label={t('hero.internal.starters')}>
    <div className={css.cards}>
      {TASKS.map(task => <button className={css.card} key={task} type="button" disabled={disabled}
        onClick={() => { onSelect(t(`hero.internal.${task}.prompt`)) }}>
        <span className={css.title}>{t(`hero.internal.${task}.title`)}</span>
        <span className={css.description}>{t(`hero.internal.${task}.description`)}</span>
        <span className={css.action}>{t('hero.internal.choose')}</span>
      </button>)}
    </div>
    <p className={css.note}>{t('hero.internal.hint')}</p>
  </section>
}
