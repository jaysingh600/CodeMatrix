const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem');
const TestCase = require('./models/TestCase');

dotenv.config();

const questions = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topic: ['Array', 'Hash Table'],
    tags: ['Interview', 'Fundamentals'],
    acceptanceRate: '51.2%',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    inputFormat: `The first line contains the array \`nums\`.
The second line contains the integer \`target\`.`,
    outputFormat: `Return an array of two integers representing the indices.`,
    constraints: [
      `2 <= nums.length <= 10^4`,
      `-10^9 <= nums[i] <= 10^9`,
      `-10^9 <= target <= 10^9`,
      `Only one valid answer exists.`
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: ''
      }
    ],
    starterCodeJavaScript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
};`,
    starterCodePython: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        pass`,
    starterCodeJava: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
    starterCodeCpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
    status: 'Published',
    isPublished: true,
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true },
      { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', isHidden: true },
      { input: '[0,4,3,0]\n0', expectedOutput: '[0,3]', isHidden: true }, // Edge case: zeros
    ]
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    topic: ['String', 'Stack'],
    tags: ['Interview', 'Data Structures'],
    acceptanceRate: '40.2%',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputFormat: `A single string \`s\`.`,
    outputFormat: `Return \`true\` if the string is valid, otherwise return \`false\`.`,
    constraints: [
      `1 <= s.length <= 10^4`,
      `s consists of parentheses only '()[]{}'`
    ],
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'The brackets are correctly matched.'
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All brackets are correctly matched in sequence.'
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Mismatched bracket types.'
      }
    ],
    starterCodeJavaScript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    
};`,
    starterCodePython: `class Solution:
    def isValid(self, s: str) -> bool:
        pass`,
    starterCodeJava: `class Solution {
    public boolean isValid(String s) {
        
    }
}`,
    starterCodeCpp: `class Solution {
public:
    bool isValid(string s) {
        
    }
};`,
    status: 'Published',
    isPublished: true,
    testCases: [
      { input: '()', expectedOutput: 'true', isHidden: false },
      { input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { input: '(]', expectedOutput: 'false', isHidden: false },
      { input: '([)]', expectedOutput: 'false', isHidden: true },
      { input: '{[]}', expectedOutput: 'true', isHidden: true },
      { input: '(((((((((())))))))))', expectedOutput: 'true', isHidden: true }, // Deeply nested
      { input: ']', expectedOutput: 'false', isHidden: true }, // Edge case: starts with closing
      { input: '[', expectedOutput: 'false', isHidden: true }, // Edge case: only opening
    ]
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    topic: ['Hash Table', 'String', 'Sliding Window'],
    tags: ['Interview', 'Algorithms'],
    acceptanceRate: '33.8%',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    inputFormat: `A single string \`s\`.`,
    outputFormat: `Return an integer representing the maximum length.`,
    constraints: [
      `0 <= s.length <= 5 * 10^4`,
      `s consists of English letters, digits, symbols and spaces.`
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    starterCodeJavaScript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    
};`,
    starterCodePython: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pass`,
    starterCodeJava: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        
    }
}`,
    starterCodeCpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        
    }
};`,
    status: 'Published',
    isPublished: true,
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
      { input: 'bbbbb', expectedOutput: '1', isHidden: false },
      { input: 'pwwkew', expectedOutput: '3', isHidden: false },
      { input: ' ', expectedOutput: '1', isHidden: true }, // Edge case: single space
      { input: 'au', expectedOutput: '2', isHidden: true },
      { input: 'dvdf', expectedOutput: '3', isHidden: true },
      { input: 'tmmzuxt', expectedOutput: '5', isHidden: true }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codematrix');
    console.log('Connected to MongoDB');

    // Clear existing problems and testcases
    await Problem.deleteMany({});
    await TestCase.deleteMany({});
    console.log('Cleared existing problems and test cases');

    for (let q of questions) {
      const { testCases, ...problemData } = q;
      
      const newProblem = await Problem.create(problemData);
      console.log(`Created problem: ${newProblem.title}`);

      let order = 1;
      for (let tc of testCases) {
        await TestCase.create({
          problemId: newProblem._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          order: order++
        });
      }
      console.log(`  - Added ${testCases.length} test cases`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
