/**
 * IEEE 754 浮点数位可视化工具
 * 用于将浮点数转换为二进制表示，展示符号位、指数位、尾数位
 * 
 * 编译命令 (需要 Emscripten):
 * emcc ieee754.cpp -o ../public/wasm/ieee754.js \
 *   -s WASM=1 \
 *   -s EXPORTED_FUNCTIONS='["_float_to_bits", "_double_to_bits", "_bits_to_float", "_bits_to_double", "_malloc", "_free"]' \
 *   -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "getValue", "setValue"]' \
 *   -s MODULARIZE=1 \
 *   -s EXPORT_NAME='IEEE754Module' \
 *   -O2
 */

#include <cstdint>
#include <cstring>

extern "C" {

// 32位浮点数转换为位表示
uint32_t float_to_bits(float value) {
    uint32_t bits;
    std::memcpy(&bits, &value, sizeof(float));
    return bits;
}

// 64位双精度浮点数转换为位表示（返回高32位和低32位）
void double_to_bits(double value, uint32_t* high, uint32_t* low) {
    uint64_t bits;
    std::memcpy(&bits, &value, sizeof(double));
    *high = static_cast<uint32_t>(bits >> 32);
    *low = static_cast<uint32_t>(bits & 0xFFFFFFFF);
}

// 位表示转换为32位浮点数
float bits_to_float(uint32_t bits) {
    float value;
    std::memcpy(&value, &bits, sizeof(float));
    return value;
}

// 位表示转换为64位双精度浮点数
double bits_to_double(uint32_t high, uint32_t low) {
    uint64_t bits = (static_cast<uint64_t>(high) << 32) | low;
    double value;
    std::memcpy(&value, &bits, sizeof(double));
    return value;
}

} // extern "C"
