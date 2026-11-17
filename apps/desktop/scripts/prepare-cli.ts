/** Package terminal launch scripts that reuse the installed Electron runtime. */

import { chmodSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Copy the platform launcher into the application's public command directory.
 * @param destination - Physical runtime/cli directory prepared for the application.
 * @param platform - Target Desktop operating system.
 */
export function prepareDesktopCli(destination: string, platform: 'darwin' | 'win32'): void {
  const name = platform === 'win32' ? 'dsh.cmd' : 'dsh'
  const command = join(destination, 'bin', name)
  mkdirSync(join(destination, 'bin'), { recursive: true })
  copyFileSync(join(import.meta.dirname, '..', 'cli', name), command)
  if (process.env.DSH_CLIENT_BRAND === 'xinji') {
    const original = platform === 'win32' ? 'DeepSeek Harness.exe' : 'DeepSeek Harness'
    const branded = platform === 'win32' ? 'xinji-agent.exe' : '信计 Agent 工作平台'
    writeFileSync(command, readFileSync(command, 'utf8').replace(original, branded))
  }
  if (platform === 'darwin') chmodSync(command, 0o755)
}
