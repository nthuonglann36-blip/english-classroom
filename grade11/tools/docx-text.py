#!/usr/bin/env python3
"""docx-text.py — rút chữ thuần từ .docx (giáo án) để đọc / grep.

    python3 tools/docx-text.py "LỚP 11/4. Giáo án minh họa (Theo CV 5512)/Unit 4.docx" > <scratchpad>/ga/Unit_4.txt

Mỗi đoạn (w:p) một dòng; ô bảng cũng thành đoạn. Không cần thư viện ngoài.
Chỉ dùng lúc dựng bài.
"""
import re, sys, zipfile, html
x = zipfile.ZipFile(sys.argv[1]).read('word/document.xml').decode('utf8', 'ignore')
x = re.sub(r'<w:tab/>', '\t', x)
x = re.sub(r'</w:p>', '\n', x)
t = html.unescape(re.sub(r'<[^>]+>', '', x))
sys.stdout.write(t)
