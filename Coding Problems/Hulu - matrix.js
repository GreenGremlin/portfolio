/*
You are tasked with defining and implementing a function (in your language of choice). As input, you are given an N x M matrix of integers, along with an integer X. X may appear any number of times in the matrix. Your function should modify the matrix, such that any row and column where X originally appears, are completely overwritten with X.

For example, consider the following matrix (dashes are shown in place of integers, to clearly show occurrences of integer X):

- - - - -
- - - - -
X - - - -
- - - X -
- - - - -

Your function should produce the following result:

X - - X -
X - - X -
X X X X X
X X X X X
X - - X -

*/

function processMatrix(matrix, check) {

  // generate a list of rows and a list of columns containing the check character
  const found = matrix.reduce(
    (aggregate, values, row) => values.reduce(
      ({ rows, cols }, value, col) =>
        (value === check ?
          {
            rows: Object.assign({}, rows, { [`${row}`]: check }),
            cols: Object.assign({}, cols, { [`${col}`]: check })
          }
        :
          { rows, cols }
        ),
      aggregate),
    { rows: {}, cols: {} });

  return matrix.map(
    (values, row) => values.map(
      (value, col) => found.rows[row] || found.cols[col] || value
    )
  );
}


const data1 = [
  ['-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-'],
  ['X', '-', '-', '-', '-'],
  ['-', '-', '-', 'X', '-'],
  ['-', '-', '-', '-', '-']
];

const expectedResult1 = [
  ['X', '-', '-', 'X', '-'],
  ['X', '-', '-', 'X', '-'],
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X'],
  ['X', '-', '-', 'X', '-']
];

const data2 = [
  [1, 4, 2, 9, 5],
  [8, 2, 5, 3, 0],
  [1, 2, 7, 4, 8],
  [7, 4, 2, 6, 0],
  [1, 8, 3, 9, 5]
];

const expectedResult2 = [
  [7, 4, 7, 9, 5],
  [7, 2, 7, 3, 0],
  [7, 7, 7, 7, 7],
  [7, 7, 7, 7, 7],
  [7, 8, 7, 9, 5]
];

function compareMatrices(matrix1, matrix2) {
  return matrix1.filter(
    (values, row) => values.filter(
      (value, col) => value === matrix2[row][col]
    ).length === values.length
  ).length === matrix1.length;
}

function printMatrix(matrix) {
  return `[\n  [${matrix.map(
    (values) => values.join(", ")
  ).join("],\n  [")}]\n]`;
}

function processAndPrint(matrix, value, expectedResult) {
  console.info('Converting matrix:');
  console.info(printMatrix(matrix));

  const result = processMatrix(matrix, value);

  if (compareMatrices(result, expectedResult)) {
    console.info('Result:');
    console.info(printMatrix(result));
    console.info('SUCCESS!!\n\n');
  }
  else {
    console.error('FAILED!');
    console.info('Expected:');
    console.info(printMatrix(expectedResult));
    console.info('but got:');
    console.info(printMatrix(result));
  }
}

processAndPrint(data1, 'X', expectedResult1);
processAndPrint(data2, 7, expectedResult2);
