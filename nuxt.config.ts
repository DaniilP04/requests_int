// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@prisma/nuxt'],
  css: ['@/assets/css/main.css'],
  runtimeConfig: {
    BOT_TOKEN: process.env.BOT_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET,
    public: {
    recaptchaSiteKey: '6LcBW1srAAAAACEP75YxJW8VuggszGbFJxfvyl8w'}, 
    recaptchaSecretKey: '6LcBW1srAAAAAAZmfT3GwTU-qrOxZ1Suc0YqRBG1' 
  },
  app: {
    head: {
      script: [
        {
          src: `https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`,
          async: true,
          defer: true
        }
      ]
    }
  },
  plugins: ['~/plugins/recaptcha.client.ts'],
  nitro: {
    headers: {
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none'"
    }
  }
})