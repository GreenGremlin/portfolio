const parenPairs = {
  '(': ')',
  ')': '('
};

function matchParens(sourceCode, caretPosition) {
  let left;
  let parenCount = 0;
  let right;

  const parenMatch = (paren, position, _parenCount) => {
    let newParenCount = _parenCount;
    if (sourceCode[position] === parenPairs[paren]) {
      newParenCount += 1;
    }
    if (sourceCode[position] === paren) {
      if (newParenCount === 0) {
        return true;
      }
      else {
        return newParenCount - 1;
      }
    }
    return newParenCount
  };

  for (let i = caretPosition; i >= 0 && !left; i--) {
    parenCount = parenMatch('(', i, parenCount);

    if (parenCount === true) {
      left = i;
    }
  }

  parenCount = 0;
  for (let j = caretPosition; j < sourceCode.length && !right; j++) {
    parenCount = parenMatch(')', j, parenCount);

    if (parenCount === true) {
      right = j;
    }
  }
  return typeof left !== 'undefined' && typeof right !== 'undefined' ? [left, right] : [void(0), void(0)];
}

var x = matchParens("he(llo", 3);

console.log(x);
if(x[0] === 3 && x[1] === 9) {
  console.log('Hooray!');
} else {
  console.log('Nope.');
}

