from http.server import BaseHTTPRequestHandler
import json
from faker import Faker

# 支持中文和英文
fake_zh = Faker('zh_CN')
fake_en = Faker('en_US')

def generate_data(field: str, locale: str = 'zh_CN') -> str:
    """根据字段类型生成假数据"""
    fake = fake_zh if locale == 'zh_CN' else fake_en
    
    generators = {
        'name': fake.name,
        'phone': fake.phone_number,
        'email': fake.email,
        'address': fake.address,
        'company': fake.company,
        'job': fake.job,
        'text': lambda: fake.text(max_nb_chars=100),
        'date': lambda: fake.date(),
        'datetime': lambda: fake.date_time().isoformat(),
        'uuid': fake.uuid4,
        'url': fake.url,
        'ipv4': fake.ipv4,
        'ipv6': fake.ipv6,
        'mac_address': fake.mac_address,
        'user_agent': fake.user_agent,
        'credit_card': fake.credit_card_number,
        'ssn': fake.ssn,
        'color': fake.color_name,
        'hex_color': fake.hex_color,
        'password': lambda: fake.password(length=12),
        'username': fake.user_name,
        'sentence': fake.sentence,
        'paragraph': fake.paragraph,
        'word': fake.word,
        'country': fake.country,
        'city': fake.city,
        'postcode': fake.postcode,
        'latitude': lambda: str(fake.latitude()),
        'longitude': lambda: str(fake.longitude()),
    }
    
    generator = generators.get(field)
    if generator:
        return generator()
    return f"Unknown field: {field}"


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
            fields = data.get('fields', ['name'])
            count = min(data.get('count', 10), 100)  # 最多100条
            locale = data.get('locale', 'zh_CN')
            
            results = []
            for _ in range(count):
                item = {}
                for field in fields:
                    item[field] = generate_data(field, locale)
                results.append(item)
            
            response = {
                'success': True,
                'data': results,
                'count': len(results)
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
    
    def do_GET(self):
        # 返回支持的字段列表
        fields_info = {
            'success': True,
            'available_fields': [
                {'id': 'name', 'label': '姓名', 'category': '个人信息'},
                {'id': 'phone', 'label': '电话', 'category': '个人信息'},
                {'id': 'email', 'label': '邮箱', 'category': '个人信息'},
                {'id': 'address', 'label': '地址', 'category': '个人信息'},
                {'id': 'company', 'label': '公司', 'category': '工作'},
                {'id': 'job', 'label': '职位', 'category': '工作'},
                {'id': 'username', 'label': '用户名', 'category': '账户'},
                {'id': 'password', 'label': '密码', 'category': '账户'},
                {'id': 'uuid', 'label': 'UUID', 'category': '标识'},
                {'id': 'url', 'label': 'URL', 'category': '网络'},
                {'id': 'ipv4', 'label': 'IPv4', 'category': '网络'},
                {'id': 'ipv6', 'label': 'IPv6', 'category': '网络'},
                {'id': 'mac_address', 'label': 'MAC 地址', 'category': '网络'},
                {'id': 'user_agent', 'label': 'User Agent', 'category': '网络'},
                {'id': 'date', 'label': '日期', 'category': '时间'},
                {'id': 'datetime', 'label': '日期时间', 'category': '时间'},
                {'id': 'text', 'label': '文本', 'category': '文本'},
                {'id': 'sentence', 'label': '句子', 'category': '文本'},
                {'id': 'paragraph', 'label': '段落', 'category': '文本'},
                {'id': 'word', 'label': '单词', 'category': '文本'},
                {'id': 'country', 'label': '国家', 'category': '地理'},
                {'id': 'city', 'label': '城市', 'category': '地理'},
                {'id': 'postcode', 'label': '邮编', 'category': '地理'},
                {'id': 'latitude', 'label': '纬度', 'category': '地理'},
                {'id': 'longitude', 'label': '经度', 'category': '地理'},
                {'id': 'credit_card', 'label': '信用卡号', 'category': '金融'},
                {'id': 'color', 'label': '颜色名', 'category': '其他'},
                {'id': 'hex_color', 'label': '颜色值', 'category': '其他'},
            ],
            'available_locales': [
                {'id': 'zh_CN', 'label': '中文'},
                {'id': 'en_US', 'label': '英文'},
            ]
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(fields_info, ensure_ascii=False).encode('utf-8'))
