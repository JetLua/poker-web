import {spawn} from 'node:child_process'

const sizes = [58, 72, 76, 80, 87, 114, 120, 144, 150, 152, 167, 180, 192, 512]
const prefix = 'apple-touch-icon-'
const raw = 'apple-touch-icon.png'

for (const s of sizes) {
  await new Promise(resolve => {
    const cmd = spawn('convert', [raw, '-resize', `${s}x${s}`, `${prefix}${s}.png`])
    cmd.on('close', resolve)
  })
}
