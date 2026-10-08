const mongoose = require('mongoose');
const Problem = require('./models/Problem');
const TestCase = require('./models/TestCase');
require('dotenv').config();

const problemsData = [
  {
    title: "Palindrome Number",
    slug: "palindrome-number",
    difficulty: "Easy",
    topic: ["Math"],
    acceptanceRate: "55.0%",
    description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\n**Follow up:** Could you solve it without converting the integer to a string?",
    examples: [
      { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
      { input: "x = -121", output: "false", explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome." },
      { input: "x = 10", output: "false", explanation: "Reads 01 from right to left. Therefore it is not a palindrome." }
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    inputFormat: "A single integer x.",
    outputFormat: "true if x is palindrome, else false.",
    starterCodeJava: "class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};",
    starterCodeJavaScript: "var isPalindrome = function(x) {\n    \n};",
    testCases: [
      { input: "121", expectedOutput: "true", isHidden: false },
      { input: "-121", expectedOutput: "false", isHidden: false },
      { input: "10", expectedOutput: "false", isHidden: true },
      { input: "0", expectedOutput: "true", isHidden: true },
      { input: "12321", expectedOutput: "true", isHidden: true }
    ]
  },
  {
    title: "Single Number",
    slug: "single-number",
    difficulty: "Easy",
    topic: ["Array", "Bit Manipulation"],
    acceptanceRate: "70.0%",
    description: "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.",
    inputFormat: "An array of integers nums.",
    outputFormat: "The single integer.",
    starterCodeJava: "class Solution {\n    public int singleNumber(int[] nums) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        \n    }\n};",
    starterCodeJavaScript: "var singleNumber = function(nums) {\n    \n};",
    testCases: [
      { input: "[2,2,1]", expectedOutput: "1", isHidden: false },
      { input: "[4,1,2,1,2]", expectedOutput: "4", isHidden: false },
      { input: "[1]", expectedOutput: "1", isHidden: true },
      { input: "[17,12,5,-6,12,4,17,-5,2,-3,2,4,5,16,-3,-4,15,15,-4,-5,-6]", expectedOutput: "16", isHidden: true }
    ]
  },
  {
    title: "Move Zeroes",
    slug: "move-zeroes",
    difficulty: "Easy",
    topic: ["Array", "Two Pointers"],
    acceptanceRate: "61.4%",
    description: "Given an integer array `nums`, move all 0's to the end of it while maintaining the relative order of the non-zero elements. Note that you must do this in-place without making a copy of the array.",
    inputFormat: "An array of integers nums.",
    outputFormat: "The array with zeroes moved to the end.",
    starterCodeJava: "class Solution {\n    public int[] moveZeroes(int[] nums) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def moveZeroes(self, nums: List[int]) -> List[int]:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {\n        \n    }\n};",
    starterCodeJavaScript: "var moveZeroes = function(nums) {\n    \n};",
    testCases: [
      { input: "[0,1,0,3,12]", expectedOutput: "[1,3,12,0,0]", isHidden: false },
      { input: "[0]", expectedOutput: "[0]", isHidden: false },
      { input: "[2,1]", expectedOutput: "[2,1]", isHidden: true },
      { input: "[0,0,1]", expectedOutput: "[1,0,0]", isHidden: true }
    ]
  },
  {
    title: "Majority Element",
    slug: "majority-element",
    difficulty: "Easy",
    topic: ["Array", "Hash Table", "Divide and Conquer", "Sorting"],
    acceptanceRate: "63.9%",
    description: "Given an array `nums` of size `n`, return the majority element. The majority element is the element that appears more than ⌊n / 2⌋ times.",
    inputFormat: "An array of integers nums.",
    outputFormat: "The majority element.",
    starterCodeJava: "class Solution {\n    public int majorityElement(int[] nums) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int majorityElement(vector<int>& nums) {\n        \n    }\n};",
    starterCodeJavaScript: "var majorityElement = function(nums) {\n    \n};",
    testCases: [
      { input: "[3,2,3]", expectedOutput: "3", isHidden: false },
      { input: "[2,2,1,1,1,2,2]", expectedOutput: "2", isHidden: false },
      { input: "[6,5,5]", expectedOutput: "5", isHidden: true },
      { input: "[1]", expectedOutput: "1", isHidden: true }
    ]
  },
  {
    title: "Contains Duplicate",
    slug: "contains-duplicate",
    difficulty: "Easy",
    topic: ["Array", "Hash Table", "Sorting"],
    acceptanceRate: "61.2%",
    description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    inputFormat: "An array of integers nums.",
    outputFormat: "true if contains duplicate, else false.",
    starterCodeJava: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};",
    starterCodeJavaScript: "var containsDuplicate = function(nums) {\n    \n};",
    testCases: [
      { input: "[1,2,3,1]", expectedOutput: "true", isHidden: false },
      { input: "[1,2,3,4]", expectedOutput: "false", isHidden: false },
      { input: "[1,1,1,3,3,4,3,2,4,2]", expectedOutput: "true", isHidden: true },
      { input: "[-1,-1]", expectedOutput: "true", isHidden: true }
    ]
  },
  {
    title: "Power of Two",
    slug: "power-of-two",
    difficulty: "Easy",
    topic: ["Math", "Bit Manipulation", "Recursion"],
    acceptanceRate: "46.1%",
    description: "Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`.",
    inputFormat: "An integer n.",
    outputFormat: "true if n is a power of two, else false.",
    starterCodeJava: "class Solution {\n    public boolean isPowerOfTwo(int n) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def isPowerOfTwo(self, n: int) -> bool:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    bool isPowerOfTwo(int n) {\n        \n    }\n};",
    starterCodeJavaScript: "var isPowerOfTwo = function(n) {\n    \n};",
    testCases: [
      { input: "1", expectedOutput: "true", isHidden: false },
      { input: "16", expectedOutput: "true", isHidden: false },
      { input: "3", expectedOutput: "false", isHidden: false },
      { input: "0", expectedOutput: "false", isHidden: true },
      { input: "-16", expectedOutput: "false", isHidden: true },
      { input: "1073741824", expectedOutput: "true", isHidden: true }
    ]
  },
  {
    title: "Missing Number",
    slug: "missing-number",
    difficulty: "Easy",
    topic: ["Array", "Hash Table", "Math", "Binary Search", "Bit Manipulation"],
    acceptanceRate: "63.2%",
    description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
    inputFormat: "An array of integers nums.",
    outputFormat: "The missing integer.",
    starterCodeJava: "class Solution {\n    public int missingNumber(int[] nums) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def missingNumber(self, nums: List[int]) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        \n    }\n};",
    starterCodeJavaScript: "var missingNumber = function(nums) {\n    \n};",
    testCases: [
      { input: "[3,0,1]", expectedOutput: "2", isHidden: false },
      { input: "[0,1]", expectedOutput: "2", isHidden: false },
      { input: "[9,6,4,2,3,5,7,0,1]", expectedOutput: "8", isHidden: true },
      { input: "[0]", expectedOutput: "1", isHidden: true }
    ]
  },
  {
    title: "Maximum Product Subarray",
    slug: "maximum-product-subarray",
    difficulty: "Medium",
    topic: ["Array", "Dynamic Programming"],
    acceptanceRate: "34.3%",
    description: "Given an integer array `nums`, find a subarray that has the largest product, and return the product.",
    inputFormat: "An array of integers nums.",
    outputFormat: "The maximum product.",
    starterCodeJava: "class Solution {\n    public int maxProduct(int[] nums) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n        \n    }\n};",
    starterCodeJavaScript: "var maxProduct = function(nums) {\n    \n};",
    testCases: [
      { input: "[2,3,-2,4]", expectedOutput: "6", isHidden: false },
      { input: "[-2,0,-1]", expectedOutput: "0", isHidden: false },
      { input: "[-2]", expectedOutput: "-2", isHidden: true },
      { input: "[-2,3,-4]", expectedOutput: "24", isHidden: true },
      { input: "[0,2]", expectedOutput: "2", isHidden: true }
    ]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    difficulty: "Easy",
    topic: ["Array", "Dynamic Programming"],
    acceptanceRate: "54.4%",
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction.",
    inputFormat: "An array of integers prices.",
    outputFormat: "The maximum profit.",
    starterCodeJava: "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};",
    starterCodeJavaScript: "var maxProfit = function(prices) {\n    \n};",
    testCases: [
      { input: "[7,1,5,3,6,4]", expectedOutput: "5", isHidden: false },
      { input: "[7,6,4,3,1]", expectedOutput: "0", isHidden: false },
      { input: "[2,4,1]", expectedOutput: "2", isHidden: true },
      { input: "[3,2,6,5,0,3]", expectedOutput: "4", isHidden: true }
    ]
  },
  {
    title: "Fibonacci Number",
    slug: "fibonacci-number",
    difficulty: "Easy",
    topic: ["Math", "Dynamic Programming", "Recursion", "Memoization"],
    acceptanceRate: "70.3%",
    description: "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. Given `n`, calculate `F(n)`.",
    inputFormat: "An integer n.",
    outputFormat: "The nth Fibonacci number.",
    starterCodeJava: "class Solution {\n    public int fib(int n) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def fib(self, n: int) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int fib(int n) {\n        \n    }\n};",
    starterCodeJavaScript: "var fib = function(n) {\n    \n};",
    testCases: [
      { input: "2", expectedOutput: "1", isHidden: false },
      { input: "3", expectedOutput: "2", isHidden: false },
      { input: "4", expectedOutput: "3", isHidden: false },
      { input: "0", expectedOutput: "0", isHidden: true },
      { input: "30", expectedOutput: "832040", isHidden: true }
    ]
  }
];

const insertProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codematrix');
    console.log('MongoDB Connected.');

    for (let probData of problemsData) {
      const { testCases, ...problemFields } = probData;
      
      const existing = await Problem.findOne({ slug: problemFields.slug });
      let problemId;
      
      if (!existing) {
        const newProb = await Problem.create(problemFields);
        problemId = newProb._id;
        console.log(`Created problem: ${newProb.title}`);
      } else {
        problemId = existing._id;
        await Problem.findByIdAndUpdate(problemId, problemFields);
        console.log(`Updated problem: ${existing.title}`);
        await TestCase.deleteMany({ problemId: problemId });
      }

      const tcs = testCases.map((tc, idx) => ({
        problemId: problemId,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
        order: idx + 1
      }));

      await TestCase.insertMany(tcs);
      console.log(`Inserted ${tcs.length} testcases for ${problemFields.title}`);
    }

    console.log('Successfully inserted all problems and test cases.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

insertProblems();
