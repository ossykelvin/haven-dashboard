import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveUploadPath, uploadRoot } from '../src/lib/server/uploads'

const original = process.env.UPLOAD_DIR

afterEach(() => {
  if (original === undefined) delete process.env.UPLOAD_DIR
  else process.env.UPLOAD_DIR = original
})

describe('upload root', () => {
  it('falls back to a directory under the working directory', () => {
    delete process.env.UPLOAD_DIR
    expect(uploadRoot()).toBe(path.join(process.cwd(), 'uploads'))
  })

  it('honours an absolute UPLOAD_DIR so cPanel releases do not replace stored files', () => {
    process.env.UPLOAD_DIR = path.resolve('/home/koptryzt/haven-uploads')
    expect(uploadRoot()).toBe(path.resolve('/home/koptryzt/haven-uploads'))
  })

  it('resolves a relative UPLOAD_DIR against the working directory', () => {
    process.env.UPLOAD_DIR = './var/uploads'
    expect(uploadRoot()).toBe(path.resolve(process.cwd(), 'var/uploads'))
  })

  it('ignores a blank UPLOAD_DIR', () => {
    process.env.UPLOAD_DIR = '   '
    expect(uploadRoot()).toBe(path.join(process.cwd(), 'uploads'))
  })
})

describe('resolveUploadPath', () => {
  it('resolves a stored campus-scoped path inside the root', () => {
    delete process.env.UPLOAD_DIR
    const resolved = resolveUploadPath('campus-1/file.pdf')
    expect(resolved).toBe(path.join(process.cwd(), 'uploads', 'campus-1', 'file.pdf'))
  })

  it('refuses a stored path that climbs out of the upload root', () => {
    delete process.env.UPLOAD_DIR
    expect(() => resolveUploadPath('../../etc/passwd')).toThrow(/escapes/)
  })

  it('refuses an absolute stored path', () => {
    process.env.UPLOAD_DIR = path.resolve('/srv/haven-uploads')
    expect(() => resolveUploadPath(path.resolve('/etc/passwd'))).toThrow(/escapes/)
  })
})
