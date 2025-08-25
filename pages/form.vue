<template>
  <main class="items-center mt-20 z-10 h-full w-full flex flex-col justify-center">
    <div class="border-gray-900 border-2 rounded-2xl flex flex-col justify-center items-center px-6 py-8 w-full max-w-lg mx-auto">
      <p class="text-2xl font-bold text-gray-900 mb-6">Заявка</p>
      <form class="w-full space-y-5" @submit.prevent="postData">
        
        <div>
          <label for="surname" class="block text-sm font-medium text-gray-900 mb-2">Введите вашу фамилию</label>
          <input type="text" id="surname" placeholder="Иванов" class="input_request w-full" v-model="postsurname" />
          <label for="name" class="block text-sm font-medium text-gray-900 mb-2 mt-2">Введите ваше имя</label>
          <input type="text" id="name" placeholder="Иван" class="input_request w-full" v-model="postname" />
          <label for="patro" class="block text-sm font-medium text-gray-900 mb-2 mt-2">Введите ваше отчество</label>
          <input type="text" id="patro" placeholder="Иванович" class="input_request w-full" v-model="postpatronymic" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">Выберите вашу роль</label>
          <div class="flex gap-2">
            <button type="button" class="flex-1 border border-gray-800 text-gray-900 text-sm rounded-lg py-2" :class="role === 'school' && 'bg-gray-800 text-white'" @click="setRole('school')">Школьник</button>
            <button type="button" class="flex-1 border border-gray-800 text-gray-900 text-sm rounded-lg py-2" :class="role === 'student' && 'bg-gray-800 text-white'" @click="setRole('student')">Студент</button>
            <button type="button" class="flex-1 border border-gray-800 text-gray-900 text-sm rounded-lg py-2" :class="role === 'staff' && 'bg-gray-800 text-white'" @click="setRole('staff')">Сотрудник</button>
          </div>
        </div>

        <div>
          <label for="school" class="block text-sm font-medium text-gray-900 mb-2">Выберите учебное заведение</label>

          <div v-if="postschool">
            <div class="flex items-center justify-between border px-3 py-2 rounded bg-gray-100">
              <span>{{ postschool }}</span>
              <button type="button" @click="cancelSchool" class="text-sm text-gray-900 hover:underline">Отменить</button>
            </div>
          </div>

          <div v-else>
            <input
              type="text"
              id="school"
              class="input_request w-full"
              placeholder="Поиск учебных заведений"
              v-model="schoolSearch"
            />
            <div class="max-h-40 overflow-y-auto border rounded mt-2">
              <button
                v-for="school in searchedSchools"
                :key="school.id"
                class="block w-full text-left px-3 py-2 hover:bg-gray-100"
                @click.prevent="selectSchool(school.name)"
              >
                {{ school.name }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="role === 'school'">
          <label class="block text-sm font-medium text-gray-900 mb-2">Выберите класс</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <button type="button" class="rounded-xl border px-3 py-1 text-sm" :class="grade === num.toString() ? 'bg-gray-800 text-white' : ''" v-for="num in 12" :key="num" @click="grade = num.toString()">
              {{ num }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="rounded-xl border px-3 py-1 text-sm" :class="letter === l && 'bg-gray-800 text-white'" v-for="l in letters" :key="l" @click="letter = l">
              {{ l }}
            </button>
          </div>
        </div>

        <div v-else-if="role === 'student'">
          <label for="group" class="block text-sm font-medium text-gray-900 mb-2">Введите группу</label>
          <input type="text" id="group" class="input_request w-full" placeholder="П-22" v-model="group" />
        </div>

    <div>
      <label for="products" class="block text-sm font-medium text-gray-900 mb-2">Выберите продукт</label>
      <select id="products" class="select_request w-full" v-model="productType">
        <option value="Карта">Карта (900 тенге)</option>
        <option value="Браслет">Браслет (1300 тенге)</option>
        <option value="Брелок">Брелок (1700 тенге)</option>
      </select>

      <div v-if="productType === 'Браслет'" class="mt-2">
        <label for="braceletColor" class="block text-sm font-medium text-gray-900 mb-2">Выберите цвет браслета</label>
        <select id="braceletColor" class="select_request w-full" v-model="braceletColor">
          <option value="Бирюзовый">Бирюзовый</option>
          <option value="Красный">Красный</option>
          <option value="Черный">Черный</option>
          <option value="Желтый">Желтый</option>
          <option value="Синий">Синий</option>
          <option value="Зеленый">Зеленый</option>
        </select>
      </div>
    </div>
          <button type="button" @click="showModalProductsFunction" class="text-sm underline hover:text-gray-700">
              Посмотреть продукты
          </button>

        <button class="button_admin w-full bg-gray-800 hover:bg-gray-700" type="submit">Оставить заявку</button>
      </form>
    </div>
    <!-- Модальное окно загрузки -->
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white p-6 rounded-lg shadow-xl text-center animate-pulse">
        <p class="text-lg font-semibold text-gray-800">Загрузка…</p>
      </div>
    </div>

    <!-- Модальное окно после заявки -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white hover:scale-105 ease transition-transform p-6 rounded-lg shadow-xl max-w-sm text-center">
        <h2 class="text-lg font-bold mb-4">Заявка отправлена!</h2>
        <p class="text-blue-600 font-mono text-xl mb-2">Трек-номер: {{ track_id }}</p>
        <p class="text-blue-600 font-mono text-xl mb-2">Пароль: {{ password }}</p>
        <button @click="copyTrackAndPassword" class="button_admin bg-gray-800 hover:bg-gray-700 mb-2">Скопировать трек и пароль</button>
        <button @click="showModal = false" class="bg-gray-800 hover:bg-gray-700 button_admin">Закрыть</button>
      </div>
    </div>

    <!-- Модальное окно посмотреть товары -->
    <div v-if="showModalProducts" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white hover:scale-105 ease transition-transform p-0 rounded-lg shadow-xl max-w-sm text-center">
        <h2 class="text-lg font-bold mb-4 pt-3">Доступные продукты</h2>
        <img src="public\img\products.png" class="pr-5 pl-5"></img>
        <button @click="showModalProducts = false" class="bg-gray-800 hover:bg-gray-700 button_admin">Закрыть</button>
      </div>
    </div>
  </main>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'

// Переменные для работы капчи
const recaptchaToken = ref<string>('')
const recaptchaLoaded = ref(false)

const { $recaptcha } = useNuxtApp()
const siteKey = useRuntimeConfig().public.recaptchaSiteKey

// Запуск капчи
const executeRecaptcha = async (action: string) => {
  try {
    if (!recaptchaLoaded.value) {
      await loadRecaptcha()
    }

    return await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(siteKey, { action })
          .then(resolve)
          .catch(reject)
      })
    })
  } catch (error) {
    console.error('reCAPTCHA execution error:', error)
    throw error
  }
}


// Создание полного имени из полей 
function getFullName(surname: string, name: string, patronymic: string): string {
  return [surname, name, patronymic].filter(Boolean).join(' ')
}

// Переменные для взаимодействия с базой
const postsurname = ref('')
const postname = ref('')
const postpatronymic = ref('')
const postschool = ref('')
const postclass = ref('')
const role = ref<'school' | 'student' | 'staff' | null>(null)
const grade = ref('')
const letter = ref('')
const group = ref('')
const password = ref('')
const track_id = ref<string | null>(null)
const schools = ref<{ id: number, name: string, type: string }[]>([])
const letters = ['А', 'Ә', 'Б', 'В', 'Г', 'Ғ', 'Д', 'Е', 'Ë', 'Ж', 'З', 'Ы']
const productType = ref('')
const braceletColor = ref('')


// Переменные для модалок
const showModal = ref(false)
const isLoading = ref(false)
const showModalProducts = ref(false)
const showModalProductsFunction = () => {
  showModalProducts.value = true;
}

// Совмещение браслета и его цвета
const postdevice_type = computed(() => {
  if (productType.value === 'Браслет' && braceletColor.value) {
    return `Браслет (${braceletColor.value})`
  }
  return productType.value
})

// Функция перезагрузки формы
const resetForm = () => {
  postsurname.value = ''
  postname.value = ''
  postpatronymic.value = ''
  postschool.value = ''
  schoolSearch.value = ''
  postclass.value = ''
  postdevice_type.value = 'Карта'
  grade.value = ''
  letter.value = ''
  group.value = ''
  role.value = null
}

// Выбор роли при подаче заявки
const setRole = (value: typeof role.value) => {
  role.value = value
  grade.value = ''
  letter.value = ''
  group.value = ''
  postschool.value = ''
  postclass.value = value === 'staff' ? 'Сотрудник' : ''
}

// Выставление учебного заведения в зависимости от роли
const filteredSchools = computed(() => {
  if (role.value === 'school') {
    return schools.value.filter(s => s.type !== 'колледж')
  } else if (role.value === 'student') {
    return schools.value.filter(s => s.type === 'колледж')
  }
  return schools.value
})

// Получение школ из базы
onMounted(async () => {
  const res = await $fetch('/api/all-schools')
  schools.value = res.schools
})

// Установка класса в зависимости от роли
watch([role, grade, letter, group], () => {
  if (role.value === 'school') {
    postclass.value = grade.value && letter.value ? `${grade.value}${letter.value}` : ''
  } else if (role.value === 'student') {
    postclass.value = group.value
  } else if (role.value === 'staff') {
    postclass.value = 'Сотрудник'
  }
})

// Прогрузка капчи
const loadRecaptcha = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.grecaptcha) {
      recaptchaLoaded.value = true
      return resolve()
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true
    script.onload = () => {
      recaptchaLoaded.value = true
      resolve()
    }
    script.onerror = (err) => {
      console.error('reCAPTCHA script failed to load', err)
      reject(new Error('Failed to load reCAPTCHA'))
    }
    document.head.appendChild(script)
  })
}


// Показ значка капчи
const showRecaptchaBadge = () => {
  const badge = document.querySelector('.grecaptcha-badge')
  if (badge) {
    const style = badge.style
    style.setProperty('visibility', 'visible', 'important')
    style.setProperty('opacity', '1', 'important')
    style.setProperty('transition', 'none', 'important')
  }
}

onMounted(async () => {
  if (process.client) {
    await loadRecaptcha()
    console.log('reCAPTCHA successfully loaded')
    grecaptcha.ready(() => {
      grecaptcha.execute(useRuntimeConfig().public.recaptchaSiteKey, {
        action: 'homepage'
      }).then(() => {
        showRecaptchaBadge()
        // Повторная проверка каждые 2 секунды (на случай динамического скрытия)
        setInterval(showRecaptchaBadge, 2000)
      })
    })
  }
})

// Отправка данных в базу
const postData = async () => {
  try {
    // Получение полного имени
    const postfull_name = computed(() => getFullName(postsurname.value, postname.value, postpatronymic.value))
    // Проверка на заполнение всех полей
    if (!postfull_name.value || !postschool.value || !postclass.value || !postdevice_type.value) {
      alert('Пожалуйста, заполните все поля заявки')
      return
    }
    isLoading.value = true

    // Получение токена капчи
    const token = await executeRecaptcha('submit_form')
    console.log('reCAPTCHA token received:', token)

    if (!token) {
      throw new Error('Не удалось получить токен reCAPTCHA')
    }

    // Получение данных
    const response = await $fetch("/api/requests", {
      method: "POST",
      body: {
        full_name: postfull_name.value,
        school: postschool.value,
        class: postclass.value,
        device_type: postdevice_type.value,
        token: token,
        source: 'Сайт'
      }
    })

    // После подачи
    track_id.value = response.user.track_id
    isLoading.value = false
    showModal.value = true
    password.value = response.user.password
    
    // Перезагрузка формы
    resetForm()

  } 
  
  // Обработка возможных ошибок
  catch (error: any) {
  console.error('Ошибка при отправке формы:', error)

  if (error.statusCode === 403) {
    alert('Ошибка проверки reCAPTCHA. Пожалуйста, попробуйте еще раз.')
  } else if (error.statusCode === 409) {
    alert('Ваша заявка уже подана и находится в обработке.')
  } else {
    alert('Произошла ошибка при отправке формы: ' + error.message)
  }
  }
  }

// Копирование трек номера и пароля
const copyTrackAndPassword = () => {
  if (track_id.value && password.value) {
    const textToCopy = `Трек: ${track_id.value}, Пароль: ${password.value}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Трек и пароль скопированы в буфер обмена')
    }).catch(() => {
      alert('Ошибка при копировании')
    })
  }
}

// Фильтрация для пикера 
const schoolSearch = ref('')

const searchedSchools = computed(() => {
  const query = schoolSearch.value.trim().toLowerCase()
  if (!query) return filteredSchools.value 
  return filteredSchools.value.filter(s =>
    s.name.toLowerCase().includes(query)
  )
})

const selectSchool = (name: string) => {
  postschool.value = name
  schoolSearch.value = name 
}

const cancelSchool = () => {
  postschool.value = ''
  schoolSearch.value = ''
}
</script>

<style>
/* Защита от clickjacking */
body {
  display: block !important;
  position: relative !important;
}

[style*="opacity:0"], [style*="opacity: 0"], 
[style*="visibility:hidden"], [style*="visibility: hidden"] {
  pointer-events: none !important;
}

/* Показ значка капчи */
.grecaptcha-badge {
  visibility: visible !important;
  opacity: 1 !important;
  transition: none !important;
  z-index: 9999 !important;
  pointer-events: all !important;
}
</style>