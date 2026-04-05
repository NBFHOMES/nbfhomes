import os
import sys

def check_brackets(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    brackets = {'(': ')', '{': '}', '[': ']'}
    for i, char in enumerate(content):
        if char in brackets.keys():
            stack.append((char, i))
        elif char in brackets.values():
            if not stack:
                return False, f"Unmatched closing bracket '{char}' at index {i}"
            top, pos = stack.pop()
            if brackets[top] != char:
                return False, f"Mismatched brackets '{top}' and '{char}' at indices {pos} and {i}"
    
    if stack:
        char, pos = stack[0]
        return False, f"Unmatched opening bracket '{char}' at index {pos}"
    
    return True, "All brackets matched"

def main(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                # print(f"Checking {path}...")
                success, msg = check_brackets(path)
                if not success:
                    print(f"ERROR in {path}: {msg}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        main('app')
        main('components')
