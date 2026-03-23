import re
import sys

def check_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will strip out strings and comments to avoid counting them
    # But since it's just a quick check, let's just use a simple stack
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char in '{[(':
                stack.append((char, i+1))
            elif char in '}])':
                if not stack:
                    print(f"Excess closing bracket {char} at line {i+1}")
                    return
                top, top_line = stack.pop()
                if (top == '{' and char != '}') or \
                   (top == '[' and char != ']') or \
                   (top == '(' and char != ')'):
                    print(f"Mismatched bracket at line {i+1}: expected match for {top} from line {top_line}, found {char}")
                    return

    if stack:
        for char, line in stack:
            print(f"Unclosed {char} starting at line {line}")
    else:
        print("All brackets match!")

check_file('app/admin/page.tsx')
