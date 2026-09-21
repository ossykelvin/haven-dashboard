import path from 'node:path'

/**
 * Root directory for uploaded document files.
 *
 * `UPLOAD_DIR` must point outside the deployed application root. cPanel replaces the
 * application root on every deployment (see `.cpanel.yml`), so uploads written beneath
 * `process.cwd()` would not survive a release. The default keeps local development working.
 */
export function uploadRoot() {
  const configured = process.env.UPLOAD_DIR?.trim()
  if (!configured) return path.join(process.cwd(), 'uploads')
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured)
}

/**
 * Resolve a stored relative path against the upload root, refusing anything that escapes it.
 *
 * `filePath` comes from the database rather than the request, but a traversal sequence stored by
 * an earlier bug must not become an arbitrary file read.
 */
export function resolveUploadPath(relativePath: string) {
  const root = uploadRoot()
  const resolved = path.resolve(root, relativePath)
  const bounded = resolved === root || resolved.startsWith(root + path.sep)
  if (!bounded) throw new Error('Resolved upload path escapes the upload directory')
  return resolved
}
