import { execSync } from 'child_process'

export async function setup() {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
}
