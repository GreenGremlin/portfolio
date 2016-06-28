---
title: Sequence Partitioned Gallery Layout
date: 2016-06-28
layout: Post
---
[JSPerf](http://jsperf.com/balanced-list-partitioner)

### Breakpoint partitioning v1

```
function BreakpointPartition(imageRatioSequence, expectedRowCount) {
    if (imageRatioSequence.length <= 1)
        return [imageRatioSequence];
    if (expectedRowCount >= imageRatioSequence.length)
        return imageRatioSequence.map(function (item) {
            return [item];
        });
    var layoutWidth = findLayoutWidth(imageRatioSequence, expectedRowCount);
    var currentRow = 0;
    return imageRatioSequence.reduce(function (rows, imageRatio) {
        if (sum(rows[currentRow]) + imageRatio > layoutWidth)
            currentRow++;
        rows[currentRow].push(imageRatio);
        return rows;
    }, new Array(expectedRowCount).join().split(',').map(function () {
        return [];
    }));
}
function findLayoutWidth(imageRatioSequence, expectedRowCount) {
    var idealWidth = sum(imageRatioSequence) / expectedRowCount;
    var widestItem = Math.max.apply(null, imageRatioSequence);
    var galleryWidth = Math.max(idealWidth, widestItem);
    var layout = getLayoutDetails(imageRatioSequence, galleryWidth);
    while (layout.rowCount > expectedRowCount) {
        galleryWidth += layout.nextBreakpoint;
        layout = getLayoutDetails(imageRatioSequence, galleryWidth);
    }
    return galleryWidth;
}
function getLayoutDetails(imageRatioSequence, expectedWidth) {
    var startingLayout = {
        currentRowWidth: 0,
        rowCount: 1,
        nextBreakpoint: Math.min.apply(null, imageRatioSequence)
    };
    var finalLayout = imageRatioSequence.reduce(function (layout, itemWidth) {
        var rowWidth = layout.currentRowWidth + itemWidth;
        var currentRowsNextBreakpoint = undefined;
        if (rowWidth > expectedWidth) {
            currentRowsNextBreakpoint = rowWidth - expectedWidth;
            if (currentRowsNextBreakpoint < layout.nextBreakpoint) {
                layout.nextBreakpoint = currentRowsNextBreakpoint;
            }
            layout.rowCount += 1;
            layout.currentRowWidth = itemWidth;
        } else {
            layout.currentRowWidth = rowWidth;
        }
        return layout;
    }, startingLayout);
    return {
        rowCount: finalLayout.rowCount,
        nextBreakpoint: finalLayout.nextBreakpoint
    };
}
function sum(arr) {
    return arr.reduce(function (sum, el) {
        return sum + el;
    }, 0);
}

BreakpointPartition(values, 4);
```



### Partitions Generator

``` javascript
function partitionsGenerator(sequence, targetPartitionCount, valueFn = i => i) {
  // valueMax, valueMin, and valueSum utilizing the given valueFn
  const valueMax = (values) => Math.max.apply(null, values.map(item => valueFn(item)));
  const valueMin = (values) => Math.min.apply(null, values.map(item => valueFn(item)));
  const valueSum = (values) => values.reduce((total, item) => total + valueFn(item), 0);

  const sequenceMin = valueMin(sequence);
  const sequenceAvg = valueSum(sequence) / targetPartitionCount;
  const sequenceStartingMax = Math.max(sequenceAvg, valueMax(sequence));
  let nextMax;

  function generateNextPartitions() {
    const value = {
      partitions: [],
      max: nextMax || sequenceStartingMax,
      min: nextMax || sequenceStartingMax
    };
    let partition = [];
    let size = 0;

    if (nextMax) {
      value.max = nextMax;
    }
    nextMax = value.max + sequenceMin;

    sequence.forEach((item) => {
      if (size + item > value.max) {
        value.partitions.push(partition);
        value.min = Math.min(size, value.min);
        nextMax = Math.min(size + item, nextMax);
        partition = [];
        size = 0;
      }
      partition.push(item);
      size += item;
    });
    value.partitions.push(partition);

    return { value, done: value.partitions.length <= 1 };
  }

  return { next: generateNextPartitions };
}

function getGeneratorListPartitions(items, partitionCount, valueFn) {
  const genPartitions = partitionsGenerator(items, partitionCount, valueFn);
  let partitions;

  do {
    partitions = genPartitions.next();
    if (partitions.value.partitions.length <= partitionCount) {
      return partitions.value;
    }
  }
  while (!partitions.done);

  return partitions.value;
}

function generatorPartitionList(items, partitionCount, valueFn) {
  return getGeneratorListPartitions(items, partitionCount, valueFn).partitions;
}

function getListPartitionBuckets(sequence, targetPartitionCount, valueFn = i => i) {
  // valueMax, valueMin, and valueSum utilizing the given valueFn
  const valueMax = (values) => Math.max.apply(null, values.map(item => valueFn(item)));
  const valueSum = (values) => values.reduce((total, item) => total + valueFn(item), 0);
  const minIndex = (values) =>
    values.reduce(([index, min], val, i) => val < min ? [i, val] : [index, min], values[0]);

  const sequenceAvg = valueSum(sequence) / targetPartitionCount;
  const sequenceStartingMax = Math.max(sequenceAvg, valueMax(sequence));

  const partitions = [];
  const partitionSizes = [];
  const nextSizes = [];
  let partition = [];
  let size = 0;
  let sizeLimit = sequenceStartingMax;

  function shiftItemUp(fromIndex, toIndex) {
    // remove the first item from the next row
    const transient = partitions[fromIndex].shift();
    partitionSizes[fromIndex] -= transient;
    nextSizes[fromIndex] -= transient;
    // add the transient item to the current row
    partitions[toIndex].push(transient);
    partitionSizes[toIndex] += transient;
  }

  sequence.forEach((item) => {
    if (size + item > sizeLimit) {
      partitions.push(partition);
      partitionSizes.push(size);
      nextSizes.push(size + item);
      partition = [];
      size = 0;
    }
    size += item;
    partition.push(item);
  });

  // make room for the overflow
  const overflowSize = valueSum(partition);
  const last = partitions.length - 1;
  let index;

  while (sizeLimit < partitions[last] + overflowSize) {
    // find the partition that is nearest to accepting it's next item
    [index, sizeLimit] = minIndex(nextSizes);
    // from that partion to the second to last, shift items up that fit
    for (; index < last; index++) {
      while (nextSizes[index] <= sizeLimit) {
        shiftItemUp(index + 1, index);
      }
    }
  }
  partitions[last].concat(partition);

  return { partitions, width: sizeLimit };
}

function partitionListBuckets(items, partitionCount, valueFn) {
  return getListPartitionBuckets(items, partitionCount, valueFn).partitions;
}



const shiftPartitionItem = ({ start, end, size, nextSize }, items) =>
  ({ start: start + 1, end, size: size - items[start], nextSize: nextSize - items[start] });

const pushPartitionItem = ({ start, end, size, nextSize }, items) =>
  ({ start, end: end + 1, size: size + items[end + 1], nextSize: items.length > end + 2 && nextSize + items[end + 2] });

// returns the minimum nextSize index and value for a list of partitions
function findNextSizeLimitAndIndex(partitions) {
  return partitions.reduce(
    ([index, min], item, i) => item.nextSize < min ? [i, item.nextSize] : [index, min],
    [0, partitions[0].nextSize]
  );
}

function getListPartitions(sequence, targetPartitionCount, valueFn = i => i) {
  // valueMax, valueMin, and valueSum utilizing the given valueFn
  const valueMax = (values) => Math.max.apply(null, values.map(item => valueFn(item)));
  const valueSum = (values) => values.reduce((total, item) => total + valueFn(item), 0);

  // starting size limit is the larger of the average partition size or largest item in the sequence
  let sizeLimit = Math.max(valueSum(sequence) / targetPartitionCount, valueMax(sequence));

  const partitions = [];
  let size = 0;
  let end = 0;
  let start = 0;

  sequence.forEach((item, i) => {
    if (size + item > sizeLimit) {
      partitions.push({ start, end, size, nextSize: size + item });
      size = 0;
      start = i;
    }
    size += item;
    end = i;
  });

  // make room for the overflow
  const iLast = partitions.length - 1;
  let index;

  partitions[iLast].nextSize += size;

  while (sizeLimit < partitions[iLast].size + size) {
    // find the partition with the lowest nextSize
    [index, sizeLimit] = findNextSizeLimitAndIndex(partitions);
    // from that partion to the second to last, shift items up that fit

    for (; index < iLast; index++) {
      while (partitions[index].nextSize <= sizeLimit) {
        partitions[index + 1] = shiftPartitionItem(partitions[index + 1], sequence);
        partitions[index] = pushPartitionItem(partitions[index], sequence);
      }
    }
  }
  partitions[iLast] = { size: partitions[iLast].size + size, end, start: partitions[iLast].start, nextSize: null };

  return { partitions, width: sizeLimit };
}

function partitionList(items, partitionCount, valueFn) {
  const partitions = getListPartitions(items, partitionCount, valueFn).partitions;
  return partitions.map(p => items.slice(p.start, p.end));
}

const values = [234, 97, 184, 287, 283, 204, 38, 135, 300, 136, 263, 200, 278, 42, 138, 190, 145, 73, 60, 241, 237, 42, 202, 224, 60, 221, 108, 235, 206, 245, 77, 25, 31, 186, 164, 85, 65, 216, 179, 94, 33, 227, 113, 271, 77, 219, 92, 164, 136, 58, 137, 91, 183, 167, 166, 104, 70, 158, 211, 47, 290, 88, 192, 245, 256, 137, 252, 231, 239, 293, 228, 208, 165, 292, 254, 197, 152, 252, 41, 122, 106, 56, 127, 207, 230, 104, 114, 222, 294, 271, 45, 52, 244, 61, 74, 74, 272, 163, 161, 89];

generatorPartitionList(values, 4);

partitionListBuckets(values, 4);

partitionList(values, 4);

console.log(JSON.stringify(partitionList(values, 4), null, 2));
```



### Partition Buckets

``` javascript
/**
 * Finds the optimal layout for a given sequence.
 *
 * Generates layouts incrementally starting from the smallest possible width
 * and incrementally expands to the next wider breakpoint and returns the first
 * layout that contains the desired number of partitions.
 *
 * @param  {Number[]|Object[]} sequence items to group into partitions, list items must
 *                                      be a number or have a value property
 * @param  {Number}            size     number of partitions
 * @param  {Function}          valueFn  function to retrieve the value of an item
 *                                      default: i => i
 * @return {Object}                     multi-dimensional array
 *         @property {Number[][]|Object[][]} partitions  items grouped into partitions
 *         @property {Number} width                width of the widest partition
 */


function getListPartitionBuckets(sequence, targetPartitionCount, valueFn = i => i) {
  // valueMax, valueMin, and valueSum utilizing the given valueFn
  const valueMax = (values) => Math.max.apply(null, values.map(item => valueFn(item)));
  const valueSum = (values) => values.reduce((total, item) => total + valueFn(item), 0);
  const minIndex = (values) =>
    values.reduce(([index, min], val, i) => val < min ? [i, val] : [index, min], values[0]);

  const sequenceAvg = valueSum(sequence) / targetPartitionCount;
  const sequenceStartingMax = Math.max(sequenceAvg, valueMax(sequence));

  const partitions = [];
  const partitionSizes = [];
  const nextSizes = [];
  let partition = [];
  let size = 0;
  let sizeLimit = sequenceStartingMax;

  function shiftItemUp(fromIndex, toIndex) {
    // remove the first item from the next row
    const transient = partitions[fromIndex].shift();
    partitionSizes[fromIndex] -= transient;
    nextSizes[fromIndex] -= transient;
    // add the transient item to the current row
    partitions[toIndex].push(transient);
    partitionSizes[toIndex] += transient;
  }

  sequence.forEach((item) => {
    if (size + item > sizeLimit) {
      partitions.push(partition);
      partitionSizes.push(size);
      nextSizes.push(size + item);
      partition = [];
      size = 0;
    }
    size += item;
    partition.push(item);
  });

  // make room for the overflow
  const overflowSize = valueSum(partition);
  const last = partitions.length - 1;
  let index;

  while (sizeLimit < partitions[last] + overflowSize) {
    // find the partition that is nearest to accepting it's next item
    [index, sizeLimit] = minIndex(nextSizes);
    // from that partion to the second to last, shift items up that fit
    for (; index < last; index++) {
      while (nextSizes[index] <= sizeLimit) {
        shiftItemUp(index + 1, index);
      }
    }
  }
  partitions[last].concat(partition);

  return { partitions, width: sizeLimit };
}

function partitionListBuckets(items, partitionCount, valueFn) {
  return getListPartitionBuckets(items, partitionCount, valueFn).partitions;
}
```



### Meta-buckets

``` javascript
/**
 * List partition
 *
 * Breaks an ordered list into a given number of partitions, as evenly as possible.
 *
 * Initially we fill the partitions with a limit of the average partition size.
 * Unless the partitions fill perfectly, there are some overflow values that do not
 * fit in the last partition. As we fill the partitions, we track the size at which
 * each partition would be able to accept another item.
 *
 * Finally we shift items up the partition chain by expanding the size limit of the
 * partition with the lowest next size value.
 *
 *
 * Example:
 *   Take sequence [3 4 2 6 2 3 2 5 2 5 1 2]
 *     [_][__][][____][][_][][___][][___]_[]
 *
 *   Partitioned into 3 partitions (sum: 36 avg: 12)
 *
 *   We start with a partition limit of 12 increasing as follows:
 *    |     12     |       |      13     |       |      15       |
 *     [_][__][]            [_][__][]             [_][__][][____]< shift
 *     [____][][_] < shift  [____][][_][]         [][_][][___][] < shift
 *     [][___][]   < shift  [___][][___]_< shift  [___]_[]
 *     [___]_[]             []
 *
 *
 *
 * @param  {Number[]|Object[]} sequence items to group into partitions, list items must
 *                                      be a number or have a value property
 * @param  {Number}            size     number of partitions
 * @param  {Function}          valueFn  function to retrieve the value of an item
 *                                      default: i => i
 * @return {Object}                     multi-dimensional array
 *         @property {Number[][]|Object[][]} partitions  items grouped into partitions
 *         @property {Number} width                width of the widest partition
 */

const shiftPartitionItem = ({ start, end, size, nextSize }, items) =>
  ({ start: start + 1, end, size: size - items[start], nextSize: nextSize - items[start] });

const pushPartitionItem = ({ start, end, size, nextSize }, items) =>
  ({ start, end: end + 1, size: size + items[end + 1], nextSize: items.length > end + 2 && nextSize + items[end + 2] });

/**
 * Searches a list of partitions to find the partition with the lowest next size value.
 *
 * @param  {Object[]} partitions list to search
 * @return {Number, Number}      index, nextSize - lowest nextSize value and it's index
 */
function findNextSizeLimitAndIndex(partitions) {
  return partitions.reduce(
    // reduction to find the partition with the lowest nextSize value
    ([index, minNextSize], p, i) => p.nextSize < minNextSize ? [i, p.nextSize] : [index, minNextSize],
    // initial values
    [0, partitions[0].nextSize]
  );
}

export function getListPartitions(sequence, targetPartitionCount, valueFn = i => i) {
  // valueMax, valueMin, and valueSum utilizing the given valueFn
  const valueMax = (values) => Math.max.apply(null, values.map(item => valueFn(item)));
  const valueSum = (values) => values.reduce((total, item) => total + valueFn(item), 0);

  // starting size limit is the larger of the average partition size or largest item in the sequence
  let sizeLimit = Math.max(valueSum(sequence) / targetPartitionCount, valueMax(sequence));

  const partitions = [];
  let size = 0;
  let start = 0;

  sequence.forEach((item, i) => {
    if (size + item > sizeLimit) {
      partitions.push({ start, end: i - 1, size, nextSize: size + item });
      size = 0;
      start = i;
    }
    size += item;
  });

  // make room for the overflow
  const iLast = partitions.length - 1;
  let index;

  // no need to move the overflow in one at a time (when we get there)
  partitions[iLast].nextSize += size;

  while (sizeLimit < partitions[iLast].size + size) {
    // find the lowest nextSize value and it's index in the partitions list
    [index, sizeLimit] = findNextSizeLimitAndIndex(partitions);
    // from that partion to the second to last, shift items up that fit
    for (; index < iLast; index++) {
      while (partitions[index].nextSize <= sizeLimit) {
        partitions[index + 1] = shiftPartitionItem(partitions[index + 1], sequence);
        partitions[index] = pushPartitionItem(partitions[index], sequence);
      }
    }
  }
  partitions[iLast] = {
    size: partitions[iLast].size + size,
    end: iLast - 1,
    start: partitions[iLast].start,
    nextSize: null
  };

  return { partitions, width: sizeLimit };
}

export default function listPartition(items, partitionCount, valueFn) {
  const partitions = getListPartitions(items, partitionCount, valueFn).partitions;
  return partitions.map(p => items.slice(p.start, p.end));
}
```
