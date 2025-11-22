<template>
  <main class="bg_custom min-h-screen flex flex-col">
    <section
      class="w-full 
             bg-gradient-to-r from-[#1d64d6] via-[#237fe5] to-[#2a92f1] 
             text-white"
    >
      <div
        class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-x-8 px-10 py-12"
      >
        <div class="w-full md:w-1/2 flex items-center justify-center mb-8 md:mb-0">
          <img
            src="/img/home.png"
            alt="Школа"
            class="max-w-full h-auto object-contain drop-shadow-lg"
          />
        </div>
        <div class="w-full md:w-1/2 flex items-center justify-center">
          <div class="max-w-md w-full flex flex-col items-center justify-center text-center">
            <h1
              class="mb-6 font-bold uppercase
                    text-3xl sm:text-2xl md:text-3xl lg:text-4xl"
            >
              Заказ продуктов
            </h1>
            <p class="pb-6">
              Здесь вы можете заказать продукты нашей компании, такие как карты, браслеты, брелки и т.д.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <NuxtLink
                to="form"
                class="px-5 py-3 rounded hover:bg-[#cc5d44] text-white bg-[#F26C4F] transition-transform active:scale-95"
              >
                Оставить заявку
              </NuxtLink>

              <NuxtLink
                to="check"
                class="px-5 py-3 rounded hover:bg-[#cc5d44] text-white bg-[#F26C4F] transition-transform active:scale-95"
              >
                Проверить заявку
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="w-full 
             bg-gradient-to-r"
    >
      <div
        class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-x-8 px-10 py-12"
      >
        <div class="w-full md:w-1/2 flex items-center justify-center">
          <div class="max-w-md w-full flex flex-col items-center justify-center text-center">
            <h1
              class="mb-6 font-bold uppercase
                    text-3xl sm:text-2xl md:text-3xl lg:text-4xl"
            >
              Остались вопросы?
            </h1>
            <p class="pb-6">
              В случае утери, временной блокировки, восстановления или необходимости заказа нового устройства доступа (карта, браслет, брелок) в школу — свяжитесь со службой поддержки компании Интегро удобным для вас способом.
            </p>
            <div class="flex flex-row gap-3 text-slate-500">
              <p class="pb-6">
                По адресу: К.Сутюшева 53
              </p>
              <p class="pb-6">
                Телефон: +7 7152 50 09 19 
              </p>
            </div>
          </div>
        </div>
        <div class="w-full md:w-1/2 flex items-center justify-center mb-8 md:mb-0">
          <div class="flex justify-center items-center py-10">
            <div
              class="w-72 aspect-square bg-white rounded-3xl
                    shadow-[0_12px_35px_rgba(15,23,42,0.15)]
                    flex flex-col items-center text-center px-6 pt-6 pb-8"
            >
              <h2 class="text-lg font-semibold text-slate-900">
                Компания Интегро
              </h2>
              <p class="text-sm text-slate-500 mb-5">
                Бизнес-аккаунт WhatsApp
              </p>
              <img
                src="/img/qr.png"
                alt="QR CODE"
                class="w-36 h-36 object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
