/**
 * Low-level JSON file helpers built on fs/promises.
 *
 * Safety guarantees
 * -----------------
 * 1. Atomic writes: data is written to a unique temp file in the same
 *    directory, flushed to disk (fsync), then renamed over the target.
 *    A rename is atomic, so readers see either the old file or the new one,
 *    never a half-written file, even if the process crashes mid-write.
 * 2. Serialised mutations: `withWriteLock` queues read-modify-write sequences
 *    so two concurrent requests cannot both read the same state and overwrite
 *    each other's changes (lost updates), or both pass a duplicate check.
 * 3. Corruption is never silently "fixed": invalid JSON raises a StorageError
 *    and the file is left untouched for inspection.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const AppError = require('../utils/AppError');

class StorageError extends AppError {
  constructor(message, cause) {
    super(500, 'STORAGE_ERROR', message);
    this.name = 'StorageError';
    this.cause = cause;
  }
}

const RETRYABLE_RENAME_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * On Windows, rename can fail transiently with EPERM/EBUSY when another process
 * (antivirus, indexer, editor) briefly holds the target open. Retry a few times.
 */
async function renameWithRetry(from, to, attempts = 6) {
  for (let i = 1; ; i += 1) {
    try {
      await fs.rename(from, to);
      return;
    } catch (err) {
      if (!RETRYABLE_RENAME_CODES.has(err.code) || i >= attempts) throw err;
      await wait(15 * i);
    }
  }
}

async function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  const tmpPath = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`,
  );
  const json = `${JSON.stringify(data, null, 2)}\n`;

  try {
    await fs.mkdir(dir, { recursive: true });
    const handle = await fs.open(tmpPath, 'w');
    try {
      await handle.writeFile(json, 'utf8');
      await handle.sync(); // make sure bytes hit the disk before the rename
    } finally {
      await handle.close();
    }
    await renameWithRetry(tmpPath, filePath);
  } catch (err) {
    await fs.rm(tmpPath, { force: true }).catch(() => {});
    throw new StorageError(`Could not save ${path.basename(filePath)}.`, err);
  }
}

/**
 * Reads and parses a JSON file.
 * If the file is missing and `fallback` is provided, the fallback is written
 * to disk and returned (used for swipes.json / matches.json on first run).
 */
async function readJson(filePath, { fallback } = {}) {
  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT' && fallback !== undefined) {
      await writeJsonAtomic(filePath, fallback);
      return structuredClone(fallback);
    }
    if (err.code === 'ENOENT') {
      throw new StorageError(`Required data file ${path.basename(filePath)} is missing.`, err);
    }
    throw new StorageError(`Could not read ${path.basename(filePath)}.`, err);
  }

  try {
    // Tolerate a UTF-8 BOM (some Windows editors add one).
    return JSON.parse(raw.replace(/^﻿/, ''));
  } catch (err) {
    throw new StorageError(`${path.basename(filePath)} contains invalid JSON.`, err);
  }
}

// Single-process mutex: each mutation runs after the previous one settles.
let queueTail = Promise.resolve();

function withWriteLock(task) {
  const run = queueTail.then(task, task);
  queueTail = run.catch(() => {}); // keep the queue alive after a failure
  return run;
}

module.exports = { readJson, writeJsonAtomic, withWriteLock, StorageError };
