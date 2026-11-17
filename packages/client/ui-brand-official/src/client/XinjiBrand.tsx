import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import markUrl from './assets/xinji-mark.png'
import css from './XinjiBrand.module.css'

/** Dictionary namespace for the internal corporate identity. */
export const XINJI_NS = 'brand.xinji'

/** Chinese corporate identity. */
export const xinjiZh = { name: '信计科技', workspace: '内部 Agent 工作平台' }

/** English corporate identity. */
export const xinjiEn = { name: 'Xinji Technology', workspace: 'Agent workspace' } satisfies Record<keyof typeof xinjiZh, string>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Internal corporate name and workspace descriptor. */
    'brand.xinji': keyof typeof xinjiZh
  }
}

/**
 * Render the supplied corporate artwork at the size requested by the host slot.
 * @param props - Mark dimensions and optional host class.
 * @returns Decorative corporate artwork.
 */
export function XinjiBrandMark({ size, className }: HeroBrandMarkOwnerProps) {
  return <img className={className} src={markUrl} width={size} height={size} alt="" aria-hidden="true" />
}

/**
 * Render the corporate identity using the slot's locale seat.
 * @param props - Locale-bound translation function.
 * @returns Corporate name and workspace descriptor.
 */
export function XinjiBrandName({ t }: PropsLocale<typeof XINJI_NS>) {
  return <span className={css.identity} title={t('workspace')}><span className={css.name}>{t('name')}</span></span>
}
