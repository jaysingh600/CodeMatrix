require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Problem = require('./models/Problem');
const TestCase = require('./models/TestCase');
const User = require('./models/User');

const problems = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    topic: ["Array", "Hash Table"],
    acceptanceRate: "52.3%",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    starterCodeJava: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
    starterCodeJavaScript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};"
  },
  {
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    difficulty: "Easy",
    topic: ["Linked List", "Recursion"],
    acceptanceRate: "76.4%",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    starterCodeJava: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        \n    }\n};",
    starterCodeJavaScript: "var reverseList = function(head) {\n    \n};"
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    topic: ["String", "Stack"],
    acceptanceRate: "40.2%",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    starterCodeJava: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def isValid(self, s: str) -> bool:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};",
    starterCodeJavaScript: "var isValid = function(s) {\n    \n};"
  },
  {
    title: "Merge Sorted Arrays",
    slug: "merge-sorted-arrays",
    difficulty: "Easy",
    topic: ["Array", "Two Pointers", "Sorting"],
    acceptanceRate: "49.1%",
    description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.",
    starterCodeJava: "class Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n        \n    }\n};",
    starterCodeJavaScript: "var merge = function(nums1, m, nums2, n) {\n    \n};"
  },
  {
    title: "Binary Search",
    slug: "binary-search",
    difficulty: "Easy",
    topic: ["Array", "Binary Search"],
    acceptanceRate: "56.7%",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
    starterCodeJava: "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};",
    starterCodeJavaScript: "var search = function(nums, target) {\n    \n};"
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "Medium",
    topic: ["Array", "Dynamic Programming"],
    acceptanceRate: "50.4%",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    starterCodeJava: "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};",
    starterCodeJavaScript: "var maxSubArray = function(nums) {\n    \n};"
  },
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "Easy",
    topic: ["Math", "Dynamic Programming", "Memoization"],
    acceptanceRate: "52.7%",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    starterCodeJava: "class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def climbStairs(self, n: int) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};",
    starterCodeJavaScript: "var climbStairs = function(n) {\n    \n};"
  },
  {
    title: "Number of Islands",
    slug: "number-of-islands",
    difficulty: "Medium",
    topic: ["Array", "Depth-First Search", "Breadth-First Search"],
    acceptanceRate: "59.2%",
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    starterCodeJava: "class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        \n    }\n};",
    starterCodeJavaScript: "var numIslands = function(grid) {\n    \n};"
  },
  {
    title: "LRU Cache",
    slug: "lru-cache",
    difficulty: "Medium",
    topic: ["Hash Table", "Linked List", "Design"],
    acceptanceRate: "42.1%",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    starterCodeJava: "class LRUCache {\n    public LRUCache(int capacity) {\n        \n    }\n    \n    public int get(int key) {\n        \n    }\n    \n    public void put(int key, int value) {\n        \n    }\n}",
    starterCodePython: "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        pass\n    def put(self, key: int, value: int) -> None:\n        pass",
    starterCodeCpp: "class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        \n    }\n    \n    int get(int key) {\n        \n    }\n    \n    void put(int key, int value) {\n        \n    }\n};",
    starterCodeJavaScript: "var LRUCache = function(capacity) {\n    \n};\nLRUCache.prototype.get = function(key) {\n    \n};\nLRUCache.prototype.put = function(key, value) {\n    \n};"
  },
  {
    title: "Word Break",
    slug: "word-break",
    difficulty: "Medium",
    topic: ["Array", "Hash Table", "String", "Dynamic Programming"],
    acceptanceRate: "46.7%",
    description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    starterCodeJava: "class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        \n    }\n}",
    starterCodePython: "class Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        ",
    starterCodeCpp: "class Solution {\npublic:\n    bool wordBreak(string s, vector<string>& wordDict) {\n        \n    }\n};",
    starterCodeJavaScript: "var wordBreak = function(s, wordDict) {\n    \n};"
  }
];

const importData = async () => {
  try {
    await connectDB();
    await Problem.deleteMany();
    await TestCase.deleteMany();
    
    await User.deleteMany();
    
    console.log('Seeding Problems...');
    const insertedProblems = await Problem.insertMany(problems);

    console.log('Seeding TestCases...');
    const twoSumProblem = insertedProblems.find(p => p.slug === 'two-sum');
    if (twoSumProblem) {
      await TestCase.insertMany([
        { problemId: twoSumProblem._id, input: '2 7 11 15\n9\n', expectedOutput: '0 1', isHidden: false },
        { problemId: twoSumProblem._id, input: '3 2 4\n6\n', expectedOutput: '1 2', isHidden: true }
      ]);
    }

    console.log('Seeding Admin User...');
    await User.create({
      fullName: 'Admin User',
      username: 'admin',
      email: 'admin@codematrix.com',
      password: 'Admin@123',
      role: 'ADMIN',
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
