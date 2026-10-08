const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');
const { generateWrapper } = require('./codeWrapper');

const execAsync = promisify(exec);

// Create a temp directory for execution
const TEMP_DIR = path.join(__dirname, '../temp_execution');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const runLocalCommand = async (command, stdinStr) => {
  return new Promise((resolve) => {
    const child = exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      let status = { id: 3, description: 'Accepted' };
      if (error) {
        if (error.killed) {
          status = { id: 5, description: 'Time Limit Exceeded' };
        } else {
          status = { id: 11, description: 'Runtime Error' };
        }
      }
      resolve({
        status,
        stdout: stdout || '',
        stderr: stderr || '',
        error: error
      });
    });

    if (stdinStr) {
      child.stdin.write(stdinStr);
      child.stdin.end();
    }
  });
};

const runCode = async (language, sourceCode, stdin, timeLimit, memoryLimit) => {
  const lang = language.toLowerCase();
  const wrappedCode = generateWrapper(lang, sourceCode);
  const jobId = crypto.randomUUID();
  const jobDir = path.join(TEMP_DIR, jobId);
  
  fs.mkdirSync(jobDir, { recursive: true });
  
  let result = null;

  try {
    if (lang === 'javascript') {
      const filePath = path.join(jobDir, 'main.js');
      fs.writeFileSync(filePath, wrappedCode);
      const res = await runLocalCommand(`node ${filePath}`, stdin);
      result = {
        status: res.status,
        stdout: res.stdout,
        stderr: res.stderr,
        compile_output: null,
        time: 0, memory: 0
      };
    } else if (lang === 'python') {
      const filePath = path.join(jobDir, 'main.py');
      fs.writeFileSync(filePath, wrappedCode);
      const res = await runLocalCommand(`python ${filePath}`, stdin);
      result = {
        status: res.status,
        stdout: res.stdout,
        stderr: res.stderr,
        compile_output: null,
        time: 0, memory: 0
      };
    } else if (lang === 'java') {
      const filePath = path.join(jobDir, 'Main.java');
      fs.writeFileSync(filePath, wrappedCode);
      // Compile
      try {
        await execAsync(`javac Main.java`, { cwd: jobDir });
        // Run
        const res = await runLocalCommand(`java -cp ${jobDir} Main`, stdin);
        result = {
          status: res.status,
          stdout: res.stdout,
          stderr: res.stderr,
          compile_output: null,
          time: 0, memory: 0
        };
      } catch (compileError) {
        result = {
          status: { id: 6, description: 'Compilation Error' },
          stdout: '',
          stderr: compileError.stderr || compileError.message,
          compile_output: compileError.stderr || compileError.message,
          time: 0, memory: 0
        };
      }
    } else if (lang === 'c++' || lang === 'cpp') {
      const filePath = path.join(jobDir, 'main.cpp');
      fs.writeFileSync(filePath, wrappedCode);
      const exePath = path.join(jobDir, 'main.exe');
      // Compile
      try {
        await execAsync(`g++ main.cpp -o main.exe`, { cwd: jobDir });
        // Run
        const res = await runLocalCommand(`"${exePath}"`, stdin);
        result = {
          status: res.status,
          stdout: res.stdout,
          stderr: res.stderr,
          compile_output: null,
          time: 0, memory: 0
        };
      } catch (compileError) {
        result = {
          status: { id: 6, description: 'Compilation Error' },
          stdout: '',
          stderr: compileError.stderr || compileError.message,
          compile_output: compileError.stderr || compileError.message,
          time: 0, memory: 0
        };
      }
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }
  } finally {
    // Cleanup
    try {
      fs.rmSync(jobDir, { recursive: true, force: true });
    } catch(e) {}
  }

  return result;
};

const normalizeOutput = (output) => {
  if (!output) return '';
  return output.toString()
    .replace(/\\r\\n/g, '\\n')
    .split('\\n')
    .map(line => line.trimEnd())
    .join('\\n')
    .trim();
};

const executeSubmission = async (language, sourceCode, testCases, timeLimit, memoryLimit) => {
  let overallStatus = 'Accepted';
  let maxTime = 0;
  let maxMemory = 0;
  let finalOutput = '';
  let finalError = '';
  let passedCount = 0;
  let failedTestCase = null;

  for (const testCase of testCases) {
    const result = await runCode(language, sourceCode, testCase.input, timeLimit, memoryLimit);
    
    if (result.status.id !== 3) {
      overallStatus = result.status.description;
      finalError = result.stderr || result.compile_output;
      failedTestCase = testCase._id;
      break;
    }

    const actual = normalizeOutput(result.stdout);
    const expected = normalizeOutput(testCase.expectedOutput);
    
    if (actual !== expected) {
      overallStatus = 'Wrong Answer';
      finalOutput = `Expected:\n${expected}\nActual:\n${actual}`;
      failedTestCase = testCase._id;
      break;
    }

    passedCount++;
  }

  return {
    status: overallStatus,
    executionTime: `${maxTime.toFixed(3)}s`,
    memory: `${(maxMemory / 1024).toFixed(2)}MB`,
    output: finalOutput,
    error: finalError,
    passedCount,
    failedTestCase
  };
};

module.exports = {
  runCode,
  getLanguageId: (l) => l, // Keep for backward compatibility
  executeSubmission,
  normalizeOutput
};
