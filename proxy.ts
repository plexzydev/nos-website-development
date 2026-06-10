import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnPanel = req.nextUrl.pathname.startsWith('/panel')
  
  if (isOnPanel && !isLoggedIn) {
    return Response.redirect(new URL('/', req.nextUrl))
  }

  // Si trata de acceder a rutas de administrador
  const isOnAdmin = req.nextUrl.pathname.startsWith('/panel/admin')
  
  if (isOnAdmin && !isLoggedIn) {
    return Response.redirect(new URL('/', req.nextUrl))
  }
})

// Especificar en qué rutas se ejecutará el middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
