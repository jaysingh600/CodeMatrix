export function generateBubbleSortStates(initialArray) {
  const states = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  // Initial state
  states.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    currentLine: 1,
    explanation: "Starting Bubble Sort.",
    comparisons,
    swaps
  });

  for (let i = 0; i < n - 1; i++) {
    states.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
      currentLine: 1,
      explanation: `Pass ${i + 1} begins. Elements from index ${n - i} to the end are already sorted.`,
      comparisons,
      swaps
    });

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      states.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        currentLine: 3,
        explanation: `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
        comparisons,
        swaps
      });

      if (arr[j] > arr[j + 1]) {
        swaps++;
        
        states.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          currentLine: 4,
          explanation: `${arr[j]} > ${arr[j + 1]}, so we swap them.`,
          comparisons,
          swaps
        });

        // Swap
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        states.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1], // keep highlighted briefly
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          currentLine: 4,
          explanation: `Swapped. Array is now [${arr.join(', ')}]`,
          comparisons,
          swaps
        });
      }
    }
  }

  // Final sorted state
  states.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, k) => k),
    currentLine: 0,
    explanation: "Array is fully sorted!",
    comparisons,
    swaps
  });

  return states;
}

export const bubbleSortMetadata = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'Sorting',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)'
  },
  spaceComplexity: 'O(1)',
  stable: 'Yes',
  pseudocode: `for i = 0 to n-1
  for j = 0 to n-i-2
    if arr[j] > arr[j+1]
      swap(arr[j], arr[j+1])`
};
