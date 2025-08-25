export default defineEventHandler((event) => {
  deleteCookie(event, 'auth') 
  return { message: 'Logged out' }
})
