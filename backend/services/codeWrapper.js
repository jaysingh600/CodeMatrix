const wrapJava = (sourceCode) => {
  const match = sourceCode.match(/public\s+(?:static\s+)?([a-zA-Z0-9_<>[\]]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
  if (!match) return sourceCode;

  const [_, returnType, methodName, argsStr] = match;
  
  const args = argsStr.split(',').map(arg => {
    const parts = arg.trim().split(/\s+/);
    return { type: parts[0], name: parts[1] };
  }).filter(a => a.name); // handle empty args

  let parseLogic = '';
  let callArgs = [];
  args.forEach((arg, i) => {
    callArgs.push(`arg${i}`);
    if (arg.type === 'int') {
      parseLogic += `int arg${i} = Integer.parseInt(scanner.nextLine().trim());\n`;
    } else if (arg.type === 'int[]') {
      parseLogic += `
        String line${i} = scanner.nextLine().trim();
        if (line${i}.startsWith("[")) line${i} = line${i}.substring(1, line${i}.length() - 1);
        String[] parts${i} = line${i}.isEmpty() ? new String[0] : line${i}.split("[,\\\\s]+");
        int[] arg${i} = new int[parts${i}.length];
        for(int j=0; j<parts${i}.length; j++) arg${i}[j] = Integer.parseInt(parts${i}[j].trim());
      `;
    } else if (arg.type === 'String') {
      parseLogic += `String arg${i} = scanner.nextLine();\n`;
    } else if (arg.type === 'String[]') {
       parseLogic += `
        String line${i} = scanner.nextLine().trim();
        if (line${i}.startsWith("[")) line${i} = line${i}.substring(1, line${i}.length() - 1);
        String[] arg${i} = line${i}.isEmpty() ? new String[0] : line${i}.split("[,\\\\s]+");
      `;
    } else {
      // Fallback for unsupported types, just read as string
       parseLogic += `String arg${i} = scanner.nextLine();\n`;
    }
  });

  let returnLogic = '';
  if (returnType === 'int[]' || returnType === 'String[]') {
    returnLogic = `System.out.println(java.util.Arrays.toString(res).replaceAll(" ", ""));`;
  } else if (returnType !== 'void') {
    returnLogic = `System.out.println(res);`;
  }

  return `
import java.util.*;

${sourceCode}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        try {
            ${parseLogic}
            Solution sol = new Solution();
            ${returnType !== 'void' ? `${returnType} res = ` : ''}sol.${methodName}(${callArgs.join(', ')});
            ${returnLogic}
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
`;
};

const wrapPython = (sourceCode) => {
  const match = sourceCode.match(/def\s+([a-zA-Z0-9_]+)\s*\([^)]*\):/);
  if (!match) return sourceCode;

  const methodName = match[1];

  return `
import sys
import json

${sourceCode}

if __name__ == '__main__':
    lines = sys.stdin.read().strip().split('\\n')
    if not lines or lines[0] == '':
        sys.exit(0)
    
    args = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            # Try to parse as JSON (handles arrays and numbers)
            args.append(json.loads(line))
        except:
            # Fallback to string or space-separated lists if needed
            if ' ' in line and not line.startswith('['):
                 args.append([int(x) if x.lstrip('-').isdigit() else x for x in line.split()])
            else:
                 args.append(line)
            
    sol = Solution()
    res = sol.${methodName}(*args)
    if isinstance(res, list):
        print(json.dumps(res).replace(" ", ""))
    elif res is not None:
        print(res)
`;
};

const wrapJavaScript = (sourceCode) => {
  const match = sourceCode.match(/var\s+([a-zA-Z0-9_]+)\s*=\s*function/);
  const methodName = match ? match[1] : 'twoSum'; // Defaulting for simple JS

  return `
const fs = require('fs');
${sourceCode}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0] !== '') {
    const args = lines.filter(l => l.trim() !== '').map(line => {
        line = line.trim();
        try {
            return JSON.parse(line);
        } catch(e) {
            if (line.includes(' ') && !line.startsWith('[')) {
                return line.split(' ').map(x => isNaN(x) ? x : Number(x));
            }
            return line;
        }
    });

    const res = ${methodName}(...args);
    if (Array.isArray(res)) {
        console.log(JSON.stringify(res).replace(/\\s/g, ''));
    } else if (res !== undefined) {
        console.log(res);
    }
}
`;
};

const wrapCpp = (sourceCode) => {
  return sourceCode;
};

const generateWrapper = (language, sourceCode) => {
  const lang = language.toLowerCase();
  
  // If user already wrote a Main class or main method, do not wrap!
  if (sourceCode.includes('public static void main') || 
      sourceCode.includes('if __name__ == ') || 
      sourceCode.includes('int main()')) {
    return sourceCode;
  }
  
  try {
    if (lang === 'java') return wrapJava(sourceCode);
    if (lang === 'python') return wrapPython(sourceCode);
    if (lang === 'javascript') return wrapJavaScript(sourceCode);
    if (lang === 'c++' || lang === 'cpp') return wrapCpp(sourceCode);
  } catch(e) {
    console.error("Wrapper generation failed:", e);
  }
  return sourceCode;
};

module.exports = {
  generateWrapper
};
