function getStartSequence(chars) {
    var result = '';
    for (var i = 0; i < chars.length && chars[i] === chars[0]; i++) {
        result += chars[i];
    }
    return result;
}

function getEndSequence(chars) {
    var result = '';
    var lastIndex = chars.length - 1;
    for (var i = lastIndex; i >= 0 && chars[i] === chars[lastIndex]; i--) {
        result += chars[i];
    }
    // if the string is all one character, only count it for start
    if (result.length === chars.length) {
        return '';
    }
    return result;
}

function getMidSequence(chars, start, end) {
    var current = '';
    var result = '';
    for (var i = start; i < end; i++) {
        if (current.length && chars[i] === current[current.length - 1]) {
            current += chars[i];
            if (current.length > result.length) {
                result = current;
            }
        }
        else {
            current = chars[i];
        }
    }
    // if the string is all one character, only count it for start
    if (result.length === chars.length) {
        return '';
    }
    return result;
}

function processData(input) {
    var charMap = {};
    var addValueToCharMap = function (key, value) {
        if (!charMap[value[0]]) {
            charMap[value[0]] = { start: 0, end: 0, full: 0, mid: 0 };
        }
        if (key === 'full') {
            charMap[value[0]].full += value.length;
        }
        if (value.length > charMap[value[0]][key]) {
            charMap[value[0]][key] = value.length;
        }
    };
    var values = input.split(',');
    values.forEach(function eachValue(value) {
        var start = getStartSequence(value);
        var end = getEndSequence(value);
        var mid;
        if (start === value) {
            addValueToCharMap('full', start);
        }
        else {
            if (start.length + end.length < value.length) {
                mid = getMidSequence(value, start.length, value.length - end.length);
                addValueToCharMap('mid', mid);
            }
            addValueToCharMap('start', start);
            addValueToCharMap('end', end);
        }
    });
    console.log(JSON.stringify(charMap, null, 2));
    console.log(Object.keys(charMap).reduce(function eachChar(prev, key) {
        var cur = charMap[key];
        return Math.max(cur.start + cur.end + cur.full, cur.mid, prev);
    }, 0));
}

process.stdin.resume();
process.stdin.setEncoding("ascii");
_input = "";
process.stdin.on("data", function (input) {
    //Standard input
    _input += input;
});

process.stdin.on("end", function () {
   processData(_input);
});
