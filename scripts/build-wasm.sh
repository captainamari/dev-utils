#!/bin/bash

# IEEE 754 WebAssembly 编译脚本
# 需要先安装 Emscripten: https://emscripten.org/docs/getting_started/downloads.html

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WASM_SRC="$PROJECT_DIR/wasm"
WASM_OUT="$PROJECT_DIR/public/wasm"

# 创建输出目录
mkdir -p "$WASM_OUT"

echo "Building IEEE 754 WebAssembly module..."

# 检查 emcc 是否可用
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten (emcc) not found!"
    echo "Please install Emscripten: https://emscripten.org/docs/getting_started/downloads.html"
    echo ""
    echo "Quick install:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

# 编译 IEEE 754 模块
emcc "$WASM_SRC/ieee754.cpp" -o "$WASM_OUT/ieee754.js" \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_float_to_bits", "_double_to_bits", "_bits_to_float", "_bits_to_double", "_malloc", "_free"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "getValue", "setValue"]' \
    -s MODULARIZE=1 \
    -s EXPORT_NAME='IEEE754Module' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -O2

echo "Build complete! Output: $WASM_OUT/ieee754.js"
