export function generateMergeSortStates(initialArray) {
  const states = [];
  let arr = [...initialArray];
  let comparisons = 0;
  let swaps = 0;

  function mergeSort(start, end) {
    if (start >= end) return;
    
    const mid = Math.floor((start + end) / 2);
    
    states.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
      currentLine: 1,
      explanation: `Splitting array from index ${start} to ${end} at mid ${mid}.`,
      comparisons,
      swaps,
      highlightRange: [start, end]
    });

    mergeSort(start, mid);
    mergeSort(mid + 1, end);
    merge(start, mid, end);
  }

  function merge(start, mid, end) {
    let left = arr.slice(start, mid + 1);
    let right = arr.slice(mid + 1, end + 1);
    
    states.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
      currentLine: 5,
      explanation: `Merging subarrays [${left.join(', ')}] and [${right.join(', ')}]`,
      comparisons,
      swaps,
      highlightRange: [start, end]
    });

    let i = 0, j = 0, k = start;
    
    while (i < left.length && j < right.length) {
      comparisons++;
      states.push({
        array: [...arr],
        comparing: [start + i, mid + 1 + j],
        swapping: [],
        sorted: [],
        currentLine: 6,
        explanation: `Comparing ${left[i]} and ${right[j]}`,
        comparisons,
        swaps,
        highlightRange: [start, end]
      });

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
        swaps++;
      }
      
      states.push({
        array: [...arr],
        comparing: [],
        swapping: [k],
        sorted: [],
        currentLine: 7,
        explanation: `Placed ${arr[k]} at index ${k}`,
        comparisons,
        swaps,
        highlightRange: [start, end]
      });
      
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      states.push({
        array: [...arr],
        comparing: [],
        swapping: [k],
        sorted: [],
        currentLine: 10,
        explanation: `Copying remaining left element ${left[i]} to index ${k}`,
        comparisons,
        swaps,
        highlightRange: [start, end]
      });
      i++;
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      states.push({
        array: [...arr],
        comparing: [],
        swapping: [k],
        sorted: [],
        currentLine: 12,
        explanation: `Copying remaining right element ${right[j]} to index ${k}`,
        comparisons,
        swaps,
        highlightRange: [start, end]
      });
      j++;
      k++;
    }
    
    states.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({length: end - start + 1}, (_, idx) => start + idx),
      currentLine: 14,
      explanation: `Merge complete for range ${start} to ${end}`,
      comparisons,
      swaps,
      highlightRange: null
    });
  }

  // Initial state
  states.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    currentLine: 0,
    explanation: "Starting Merge Sort.",
    comparisons,
    swaps,
    highlightRange: null
  });

  mergeSort(0, arr.length - 1);

  // Final sorted state
  states.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: arr.length }, (_, k) => k),
    currentLine: 0,
    explanation: "Array is fully sorted!",
    comparisons,
    swaps,
    highlightRange: null
  });

  return states;
}

export const mergeSortMetadata = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'Sorting',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)'
  },
  spaceComplexity: 'O(n)',
  stable: 'Yes',
  pseudocode: `mergeSort(arr, left, right)
  if left >= right return
  mid = (left + right) / 2
  mergeSort(arr, left, mid)
  mergeSort(arr, mid + 1, right)
  merge(arr, left, mid, right)
  
merge(arr, left, mid, right)
  compare elements from left and right halves
  copy smaller element to temp array
  copy remaining elements
  copy temp array back to arr`
};
