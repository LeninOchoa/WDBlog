export default function(context) {
  console.log('[Middleware] Just Auth')
  if (!context.store.getters.isAutheticated) {
    context.redirect('/admin/auth')
  }
}
