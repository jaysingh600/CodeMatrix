const { runCode } = require('../services/judge0Service');

const executeCode = async (req, res) => {
  const { language, sourceCode, stdin } = req.body;

  if (!language || !sourceCode) {
    return res.status(400).json({ message: 'Language and source code are required' });
  }

  try {
    const result = await runCode(language, sourceCode, stdin);
    
    // Format the response
    const formattedResult = {
      status: result.status.description,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      executionTime: result.time ? `${result.time}s` : null,
      memory: result.memory ? `${(result.memory / 1024).toFixed(2)}MB` : null
    };

    res.json(formattedResult);
  } catch (error) {
    console.error(error);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Code evaluation engine (Judge0) is currently offline.' });
    }
    res.status(500).json({ message: error.message || 'Error executing code' });
  }
};

module.exports = {
  executeCode
};
