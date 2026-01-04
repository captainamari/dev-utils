from http.server import BaseHTTPRequestHandler
import json
import re

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
            pattern = data.get('pattern', '')
            text = data.get('text', '')
            flags_str = data.get('flags', '')
            
            # 解析 flags
            flags = 0
            if 'i' in flags_str:
                flags |= re.IGNORECASE
            if 'm' in flags_str:
                flags |= re.MULTILINE
            if 's' in flags_str:
                flags |= re.DOTALL
            if 'x' in flags_str:
                flags |= re.VERBOSE
            
            # 编译正则表达式
            try:
                regex = re.compile(pattern, flags)
            except re.error as e:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': f'正则表达式错误: {str(e)}',
                    'valid': False
                }, ensure_ascii=False).encode('utf-8'))
                return
            
            # 执行匹配
            matches = []
            for match in regex.finditer(text):
                match_info = {
                    'index': match.start(),
                    'end': match.end(),
                    'match': match.group(),
                    'groups': list(match.groups()),
                    'groupdict': match.groupdict() if match.groupdict() else None
                }
                matches.append(match_info)
            
            # 生成 Python 代码片段
            escaped_pattern = pattern.replace('\\', '\\\\').replace("'", "\\'")
            escaped_text = text.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')
            
            flags_code = []
            if 'i' in flags_str:
                flags_code.append('re.IGNORECASE')
            if 'm' in flags_str:
                flags_code.append('re.MULTILINE')
            if 's' in flags_str:
                flags_code.append('re.DOTALL')
            if 'x' in flags_str:
                flags_code.append('re.VERBOSE')
            
            flags_param = ' | '.join(flags_code) if flags_code else '0'
            
            python_code = f'''import re

pattern = r'{escaped_pattern}'
text = '{escaped_text}'

# 编译正则表达式
regex = re.compile(pattern, {flags_param})

# 测试是否匹配
is_match = bool(regex.search(text))
print(f"匹配结果: {{is_match}}")

# 获取所有匹配
matches = regex.findall(text)
print(f"所有匹配: {{matches}}")

# 使用 finditer 获取详细信息
for i, match in enumerate(regex.finditer(text)):
    print(f"匹配 {{i+1}}:")
    print(f"  位置: {{match.start()}}-{{match.end()}}")
    print(f"  内容: {{match.group()}}")
    if match.groups():
        print(f"  捕获组: {{match.groups()}}")
'''

            pytest_code = f'''import re
import pytest

class TestRegex:
    """正则表达式测试用例"""
    
    @pytest.fixture
    def pattern(self):
        return r'{escaped_pattern}'
    
    @pytest.fixture
    def regex(self, pattern):
        return re.compile(pattern, {flags_param})
    
    def test_pattern_matches(self, regex):
        """测试正则是否匹配目标文本"""
        text = '{escaped_text}'
        assert regex.search(text) is not None
    
    def test_match_count(self, regex):
        """测试匹配数量"""
        text = '{escaped_text}'
        matches = regex.findall(text)
        assert len(matches) == {len(matches)}
    
    def test_first_match(self, regex):
        """测试第一个匹配"""
        text = '{escaped_text}'
        match = regex.search(text)
        assert match is not None
        {f"assert match.group() == '{matches[0]['match']}'" if matches else "# 无匹配"}
'''
            
            response = {
                'success': True,
                'valid': True,
                'matches': matches,
                'match_count': len(matches),
                'python_code': python_code,
                'pytest_code': pytest_code
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e)
            }).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
