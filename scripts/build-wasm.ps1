# IEEE 754 WebAssembly 编译脚本 (Windows PowerShell)
# 需要先安装 Emscripten: https://emscripten.org/docs/getting_started/downloads.html

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$WasmSrc = Join-Path $ProjectDir "wasm"
$WasmOut = Join-Path $ProjectDir "public\wasm"

# 创建输出目录
if (-not (Test-Path $WasmOut)) {
    New-Item -ItemType Directory -Path $WasmOut -Force | Out-Null
}

Write-Host "Building IEEE 754 WebAssembly module..."

# 检查 emcc 是否可用
$emcc = Get-Command emcc -ErrorAction SilentlyContinue
if (-not $emcc) {
    Write-Host "Error: Emscripten (emcc) not found!" -ForegroundColor Red
    Write-Host "Please install Emscripten: https://emscripten.org/docs/getting_started/downloads.html"
    Write-Host ""
    Write-Host "Quick install:"
    Write-Host "  git clone https://github.com/emscripten-core/emsdk.git"
    Write-Host "  cd emsdk"
    Write-Host "  .\emsdk install latest"
    Write-Host "  .\emsdk activate latest"
    Write-Host "  .\emsdk_env.bat"
    exit 1
}

# 编译 IEEE 754 模块
$srcFile = Join-Path $WasmSrc "ieee754.cpp"
$outFile = Join-Path $WasmOut "ieee754.js"

emcc $srcFile -o $outFile `
    -s WASM=1 `
    -s "EXPORTED_FUNCTIONS=['_float_to_bits', '_double_to_bits', '_bits_to_float', '_bits_to_double', '_malloc', '_free']" `
    -s "EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap', 'getValue', 'setValue']" `
    -s MODULARIZE=1 `
    -s EXPORT_NAME='IEEE754Module' `
    -s ALLOW_MEMORY_GROWTH=1 `
    -O2

Write-Host "Build complete! Output: $outFile" -ForegroundColor Green
