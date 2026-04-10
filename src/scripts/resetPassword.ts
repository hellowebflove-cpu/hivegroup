import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function resetPw() {
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'users',
    id: 1,
    data: { password: 'admin123' },
  })
  console.log('Password reset to admin123')
  process.exit(0)
}
resetPw()
