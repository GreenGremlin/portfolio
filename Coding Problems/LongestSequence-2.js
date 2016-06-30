
function withBehavior (target, behavior) {
    return function () {
        var instance = target.apply(this, arguments);
        behavior.apply(instance, arguments);
    }
    return behavior.call(target);
}
function valueReducer(prev, value, values) {
    var lastSeq = prev.length && prev[prev.length - 1] || '';
    var sliceEnd = lastSeq
    if (!prev.length || lastSeq[0] !== value) {
        return prev.slice().push(value)
    }
    return prev.slice(0, prev.length - 1).push(lastSeq + value);
}
function sequenceBehavior (value) {
    var sequence = {
        value: value.reduce(,
        left: [],
        right: []
    };
    return Object.assign(this, {
        first: function first () {
            return sequence.value[0];
        },
        last: function last () {
            return sequence.value[sequence.value.length - 1];
        },
        matchCharRight: function matchCharRight (char, source) {
            if (source === this) return '';
            var result = '';

            for (var i = 0; i < sequence.value.length && sequence.value[i] === char; i++) {
                result += chars[i];
            }
            if (result.length === sequence.value.length) {
                result += sequence.right.reduce(function getLargestRight(prev, sibling) {
                    var value = sibling.matchCharRight(char, source);
                    return value.length > prev.length ? value : prev;
                },'');
            }
            return result;
        },
        matchCharLeft: function matchCharLeft (char, source) {
            if (source === this) return '';
            var result = '';

            for (var i = 0; i < sequence.value.length && sequence.value[i] === char; i++) {
                result += chars[i];
            }
            if (result.length === sequence.value.length) {
                result += sequence.right.reduce(function getLargestRight(prev, sibling) {
                    var value = sibling.matchCharRight(char, source);
                    return value.length > prev.length ? value : prev;
                },'');
            }
            return result;
        },
        addSibling: function addSibling (sibling) {
            if (sibling === this) return;
            if (sibling.forEach && typeof sibling !== 'string') {
                sibling.forEach(this.addSibling, this);
            }
            if (sibling.first() === this.last()) {
                sequence.right.push(sibling);
            }
            if (sibling.last() === this.first()) {
                sequence.left.push(sibling);
            }
        }
    });
}

var CharSequence = withBehavior(function CharSequence() {
    return {};
}, sequenceBehavior);
