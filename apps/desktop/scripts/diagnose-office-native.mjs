/** Measure the pinned native Office engine independently of Desktop assembly. */
import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const executeFile = promisify(execFile)

async function sampleSlowOperation(directory, operation) {
  const { stdout } = await executeFile('/bin/ps', ['-axo', 'pid,ppid,stat,etime,comm'])
  await writeFile(join(directory, `${operation}-processes.txt`), stdout)
  const processes = stdout.trim().split('\n').slice(1).map(line => line.trim().split(/\s+/, 5))
  const descendants = new Set([process.pid])
  for (let size = 0; size !== descendants.size;) {
    size = descendants.size
    for (const [pid, parent] of processes) if (descendants.has(Number(parent))) descendants.add(Number(pid))
  }
  for (const pid of descendants) {
    try {
      await executeFile('/usr/bin/sample', [String(pid), '2', '-file', join(directory, `${operation}-${pid}-sample.txt`)], { timeout: 10_000 })
    } catch (error) {
      console.log(JSON.stringify({ samplePid: pid, error: String(error) }))
    }
  }
}

const [installation, input, destination] = process.argv.slice(2)
if (!installation || !input || !destination) throw new Error('Office installation, workbook and output directory are required')
const require = createRequire(join(resolve(installation), 'package.json'))
const { createConverter, discoverRuntime } = await import(pathToFileURL(require.resolve('@deepseek-ai/libreoffice-kit')).href)
const root = resolve(destination)
await mkdir(root, { recursive: true })
const results = []
console.log(JSON.stringify({ platform: process.platform, arch: process.arch, runtime: await discoverRuntime() }))
for (const [round, timeoutMs] of [180_000, 180_000, 180_000].entries()) {
  const directory = join(root, String(round))
  await mkdir(directory, { recursive: true })
  const converter = await createConverter({ timeoutMs, fontMetadataCacheDirectory: join(directory, 'fonts') })
  try {
    const inputPath = resolve(input)
    const operations = [
      ['pdf', () => converter.render({ inputPath, outputPath: join(directory, 'converted.pdf') })],
      ['images', () => converter.renderImages({ inputPath, outputDir: join(directory, 'images'), maxPages: 4, maxPixels: 16777216, maxDimension: 8192 })],
      ['ods', () => converter.convert({ inputPath, outputPath: join(directory, 'converted.ods') })],
      ['recalculate', () => converter.recalculate({ inputPath, outputPath: join(directory, 'recalculated.xlsx') })],
    ]
    for (const [operation, execute] of operations) {
      const started = performance.now()
      console.log(JSON.stringify({ operation, timeoutMs, state: 'starting' }))
      let record
      let sampling
      const sampleTimer = setTimeout(() => { sampling = sampleSlowOperation(directory, operation) }, 20_000)
      try {
        const result = await execute()
        if (operation === 'images') {
          if (!result.images.length) throw new Error('No spreadsheet images returned')
          for (const image of result.images) {
            if ((await readFile(image.path)).subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Invalid PNG output')
          }
        } else {
          const path = join(directory, operation === 'pdf' ? 'converted.pdf' : operation === 'ods' ? 'converted.ods' : 'recalculated.xlsx')
          const bytes = await readFile(path)
          if (operation === 'pdf' ? bytes.subarray(0, 5).toString() !== '%PDF-' : bytes.subarray(0, 4).toString('hex') !== '504b0304') throw new Error('Invalid Office output')
        }
        record = { timeoutMs, operation, passed: true, elapsedMs: Math.round(performance.now() - started) }
      } catch (error) {
        record = { timeoutMs, operation, passed: false, elapsedMs: Math.round(performance.now() - started), error: String(error), code: error.code }
      } finally {
        clearTimeout(sampleTimer)
        await sampling
      }
      results.push(record)
      console.log(JSON.stringify(record))
      await writeFile(join(root, 'results.json'), JSON.stringify(results, null, 2) + '\n')
    }
  } finally { await converter.dispose() }
}
if (results.some(result => !result.passed)) process.exitCode = 1
