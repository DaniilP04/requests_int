import bcrypt from 'bcrypt'
const password = 'Sasha'
const hash = await bcrypt.hash(password, 10)
console.log(hash)