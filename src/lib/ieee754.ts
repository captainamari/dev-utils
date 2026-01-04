/**
 * IEEE 754 浮点数工具库
 * 提供浮点数与二进制表示之间的转换
 */

export interface Float32Parts {
  sign: number;        // 符号位 (1 bit)
  exponent: number;    // 指数位 (8 bits)
  mantissa: number;    // 尾数位 (23 bits)
  binary: string;      // 完整二进制字符串
  hex: string;         // 十六进制表示
  value: number;       // 原始值
  special: string | null; // 特殊值类型 (NaN, Infinity, -Infinity, Zero, Denormalized)
}

export interface Float64Parts {
  sign: number;        // 符号位 (1 bit)
  exponent: number;    // 指数位 (11 bits)
  mantissa: bigint;    // 尾数位 (52 bits)
  binary: string;      // 完整二进制字符串
  hex: string;         // 十六进制表示
  value: number;       // 原始值
  special: string | null;
}

// 32位浮点数转换
export function float32ToParts(value: number): Float32Parts {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value, false); // big-endian
  const bits = view.getUint32(0, false);

  const sign = (bits >>> 31) & 0x1;
  const exponent = (bits >>> 23) & 0xFF;
  const mantissa = bits & 0x7FFFFF;

  const binary = bits.toString(2).padStart(32, '0');
  const hex = '0x' + bits.toString(16).toUpperCase().padStart(8, '0');

  // 检测特殊值
  let special: string | null = null;
  if (exponent === 0xFF) {
    if (mantissa === 0) {
      special = sign ? '-Infinity' : '+Infinity';
    } else {
      special = 'NaN';
    }
  } else if (exponent === 0) {
    if (mantissa === 0) {
      special = sign ? '-0' : '+0';
    } else {
      special = 'Denormalized';
    }
  }

  return { sign, exponent, mantissa, binary, hex, value, special };
}

// 64位浮点数转换
export function float64ToParts(value: number): Float64Parts {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value, false); // big-endian
  
  const high = view.getUint32(0, false);
  const low = view.getUint32(4, false);
  const bits = (BigInt(high) << 32n) | BigInt(low);

  const sign = Number((bits >> 63n) & 1n);
  const exponent = Number((bits >> 52n) & 0x7FFn);
  const mantissa = bits & 0xFFFFFFFFFFFFFn;

  const binary = bits.toString(2).padStart(64, '0');
  const hex = '0x' + bits.toString(16).toUpperCase().padStart(16, '0');

  // 检测特殊值
  let special: string | null = null;
  if (exponent === 0x7FF) {
    if (mantissa === 0n) {
      special = sign ? '-Infinity' : '+Infinity';
    } else {
      special = 'NaN';
    }
  } else if (exponent === 0) {
    if (mantissa === 0n) {
      special = sign ? '-0' : '+0';
    } else {
      special = 'Denormalized';
    }
  }

  return { sign, exponent, mantissa, binary, hex, value, special };
}

// 从二进制字符串解析为32位浮点数
export function binaryToFloat32(binary: string): number {
  const cleanBinary = binary.replace(/\s/g, '');
  if (cleanBinary.length !== 32 || !/^[01]+$/.test(cleanBinary)) {
    throw new Error('Invalid binary string: must be exactly 32 bits of 0s and 1s');
  }
  
  const bits = parseInt(cleanBinary, 2);
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, bits, false);
  return view.getFloat32(0, false);
}

// 从二进制字符串解析为64位浮点数
export function binaryToFloat64(binary: string): number {
  const cleanBinary = binary.replace(/\s/g, '');
  if (cleanBinary.length !== 64 || !/^[01]+$/.test(cleanBinary)) {
    throw new Error('Invalid binary string: must be exactly 64 bits of 0s and 1s');
  }
  
  const high = parseInt(cleanBinary.slice(0, 32), 2);
  const low = parseInt(cleanBinary.slice(32), 2);
  
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  return view.getFloat64(0, false);
}

// 从十六进制解析为32位浮点数
export function hexToFloat32(hex: string): number {
  const cleanHex = hex.replace(/^0x/i, '').replace(/\s/g, '');
  if (cleanHex.length !== 8 || !/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error('Invalid hex string: must be exactly 8 hex digits');
  }
  
  const bits = parseInt(cleanHex, 16);
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, bits, false);
  return view.getFloat32(0, false);
}

// 从十六进制解析为64位浮点数
export function hexToFloat64(hex: string): number {
  const cleanHex = hex.replace(/^0x/i, '').replace(/\s/g, '');
  if (cleanHex.length !== 16 || !/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error('Invalid hex string: must be exactly 16 hex digits');
  }
  
  const high = parseInt(cleanHex.slice(0, 8), 16);
  const low = parseInt(cleanHex.slice(8), 16);
  
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  return view.getFloat64(0, false);
}

// 计算实际指数值
export function getActualExponent(biasedExponent: number, precision: 32 | 64): number {
  const bias = precision === 32 ? 127 : 1023;
  return biasedExponent - bias;
}

// 格式化二进制字符串，添加分隔
export function formatBinary(binary: string, precision: 32 | 64): string {
  if (precision === 32) {
    // 1 + 8 + 23
    return `${binary[0]} ${binary.slice(1, 9)} ${binary.slice(9)}`;
  } else {
    // 1 + 11 + 52
    return `${binary[0]} ${binary.slice(1, 12)} ${binary.slice(12)}`;
  }
}
