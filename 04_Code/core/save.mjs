import { validateState } from './engine.mjs';

/** UTF-8 limit applies to both browser imports and exports (2 MiB). */
export const MAX_SAVE_BYTES = 2 * 1024 * 1024;
const FORMAT = 'jiaohun-save';
const SAVE_VERSION = 1;
const MAX_DEPTH = 30;
const MAX_NODES = 40000;
const MAX_STRING_LENGTH = 32768;
const ENVELOPE_KEYS = ['format', 'version', 'contentId', 'contentVersion', 'savedAt', 'state'];

export class SaveError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'SaveError';
    this.code = code;
  }
}

function fail(message, code) {
  throw new SaveError(message, code);
}

function checkSize(text) {
  if (text.length > MAX_SAVE_BYTES || new TextEncoder().encode(text).byteLength > MAX_SAVE_BYTES) {
    fail('存档文件过大，请选择不超过 2 MiB 的游戏存档。', 'TOO_LARGE');
  }
}

function checkContent(content) {
  if (!content || typeof content.id !== 'string' || !Number.isInteger(content.version)) {
    fail('游戏内容版本无效，暂时无法处理存档。', 'INVALID_CONTENT');
  }
}

/** Reject non-JSON values before encode, and cap complexity before game validation. */
function checkTree(value) {
  const seen = new Set();
  let nodes = 0;
  const visit = (item, depth) => {
    if (++nodes > MAX_NODES || depth > MAX_DEPTH) {
      fail('存档结构过于复杂，无法读取。', 'INVALID_STRUCTURE');
    }
    if (item === null || typeof item === 'boolean') return;
    if (typeof item === 'string') {
      if (item.length > MAX_STRING_LENGTH) fail('存档包含异常长度的文字。', 'INVALID_STRUCTURE');
      return;
    }
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) fail('存档包含无效数值。', 'INVALID_STRUCTURE');
      return;
    }
    if (typeof item !== 'object') fail('存档包含不支持的数据类型。', 'INVALID_STRUCTURE');
    if (seen.has(item)) fail('存档包含循环引用。', 'INVALID_STRUCTURE');
    seen.add(item);
    const proto = Object.getPrototypeOf(item);
    if (!Array.isArray(item) && proto !== Object.prototype && proto !== null) {
      fail('存档包含不支持的对象。', 'INVALID_STRUCTURE');
    }
    if (Array.isArray(item)) {
      if (item.length > MAX_NODES) fail('存档列表过长。', 'INVALID_STRUCTURE');
      for (let index = 0; index < item.length; index += 1) {
        if (!Object.hasOwn(item, index)) fail('存档列表存在缺失数据。', 'INVALID_STRUCTURE');
        visit(item[index], depth + 1);
      }
    } else {
      for (const key of Object.keys(item)) {
        if (['__proto__', 'prototype', 'constructor'].includes(key)) {
          fail('存档包含异常字段。', 'INVALID_STRUCTURE');
        }
        const descriptor = Object.getOwnPropertyDescriptor(item, key);
        if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
          fail('存档包含不支持的属性。', 'INVALID_STRUCTURE');
        }
        visit(descriptor.value, depth + 1);
      }
    }
    seen.delete(item);
  };
  visit(value, 0);
}

function checkState(content, state) {
  let errors;
  try {
    errors = validateState(content, state);
  } catch {
    fail('存档中的游戏状态结构无效，无法恢复。', 'INVALID_STATE');
  }
  if (!Array.isArray(errors) || errors.length > 0) {
    const detail = Array.isArray(errors) ? errors.slice(0, 3).join('；') : '';
    fail(`存档中的游戏状态无效${detail ? `：${detail}` : '。'}`, 'INVALID_STATE');
  }
}

/** Return an independent JSON envelope; no caller state or checkpoint is changed. */
export function encodeSave(content, state) {
  checkContent(content);
  checkTree(state);
  checkState(content, state);
  let text;
  try {
    text = JSON.stringify({
      format: FORMAT,
      version: SAVE_VERSION,
      contentId: content.id,
      contentVersion: content.version,
      savedAt: new Date().toISOString(),
      state,
    });
  } catch {
    fail('游戏进度无法转换为存档，请重试。', 'ENCODE_FAILED');
  }
  checkSize(text);
  return text;
}

/** Read data only: never executes code or mutates the active game on failure. */
export function decodeSave(content, text) {
  checkContent(content);
  if (typeof text !== 'string') fail('请选择文本格式的 JSON 游戏存档。', 'INVALID_INPUT');
  checkSize(text);
  let envelope;
  try {
    envelope = JSON.parse(text);
  } catch {
    fail('存档不是有效的 JSON 文件，文件可能已损坏。', 'INVALID_JSON');
  }
  checkTree(envelope);
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)
      || ENVELOPE_KEYS.some(key => !Object.hasOwn(envelope, key))
      || Object.keys(envelope).some(key => !ENVELOPE_KEYS.includes(key))) {
    fail('存档文件结构不完整或包含异常字段。', 'INVALID_ENVELOPE');
  }
  if (envelope.format !== FORMAT) fail('该文件不是《萧山剪辫案》的游戏存档。', 'WRONG_FORMAT');
  if (envelope.version !== SAVE_VERSION) fail('存档格式版本不兼容，请使用对应版本的 Demo。', 'SAVE_VERSION');
  if (envelope.contentId !== content.id) fail('存档属于其他案件，无法在当前 Demo 中恢复。', 'CONTENT_ID');
  if (envelope.contentVersion !== content.version) {
    fail('存档的剧情版本与当前 Demo 不一致，请使用对应版本。', 'CONTENT_VERSION');
  }
  if (typeof envelope.savedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(envelope.savedAt)
      || Number.isNaN(Date.parse(envelope.savedAt)) || new Date(envelope.savedAt).toISOString() !== envelope.savedAt) {
    fail('存档的保存时间无效，文件可能已损坏。', 'INVALID_TIMESTAMP');
  }
  checkState(content, envelope.state);
  return envelope.state;
}
