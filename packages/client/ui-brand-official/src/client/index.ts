/** Official DeepSeek Harness occupants: the profile-gated sidebar brand slots and the home whale frame layer. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { PixelWhale } from './home-whale/PixelWhale.tsx'
import { OfficialBrandMark, OfficialBrandName } from './Brand.tsx'
import { XINJI_NS, XinjiBrandMark, XinjiBrandName, xinjiZh, xinjiEn } from './XinjiBrand.tsx'

/** Required service: the UI slot registry. */
export const inject = ['slots']

/**
 * Fill official sidebar artwork and frame the blank home with the whale decoration.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  if (process.env.DSH_CLIENT_BRAND === 'xinji') {
    ctx.effect(() => {
      const previous = document.body.getAttribute('data-xinji-brand')
      document.body.setAttribute('data-xinji-brand', '')
      return () => {
        if (previous === null) document.body.removeAttribute('data-xinji-brand')
        else document.body.setAttribute('data-xinji-brand', previous)
      }
    }, 'xinji: theme identity')
    ctx.inject(['locale'], (scope) => {
      scope.effect(() => scope.locale.register(XINJI_NS, {
        zh: xinjiZh, en: xinjiEn, ja: xinjiEn, es: xinjiEn, fr: xinjiEn, de: xinjiEn, ru: xinjiEn, pt: xinjiEn,
      }), 'xinji: corporate identity dictionaries')
      scope.slots.inject('sidebar.brand.mark', () =>
        scope.slots.inject('sidebar.brand.name', function* () {
          yield scope.slots.register({ name: 'sidebar.brand.mark' }, XinjiBrandMark)
          yield scope.slots.register({ name: 'sidebar.brand.name', locale: XINJI_NS }, XinjiBrandName)
        }))
      scope.slots.inject('conversation.hero.brand.mark', () =>
        scope.slots.register({ name: 'conversation.hero.brand.mark' }, XinjiBrandMark))
    })
    return
  }
  ctx.slots.inject('conversation.hero.frame', () => ctx.slots.register({
    name: 'conversation.hero.frame',
    id: 'pixel-whale',
  }, PixelWhale))
  if (process.env.DSH_CLIENT_BUILD_PROFILE !== 'official') return
  ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.inject('sidebar.brand.name', function* () {
      yield ctx.slots.register({ name: 'sidebar.brand.mark' }, OfficialBrandMark)
      yield ctx.slots.register({ name: 'sidebar.brand.name' }, OfficialBrandName)
    }))
}
