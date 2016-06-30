/*

Given a list of words, print out the words that are anagrams of each other

input: [
    army,
    melon
    mary,
    lemon,
    friend,
    finder
    ....
]

print

anagrams: army, mary
anagrams: lemon, melon
anagrams: friend, finder

*/

function mapLetters(word) {
    const letters = {};
    for(let i = 0; i < word.length; i++) {
        letters[word[i]] = letters[word[i]] ? letters[word[i]] + 1 : 1;
    }
}

function compareMaps(map1, map2) {
    const map1Keys = Object.keys(map1);
    const map2Keys = Object.keys(map2);
    return map1Keys.length === map2Keys.length && map1Keys.filter(
        (key) => map1[key] === map2[key]
    ).length === map1Keys.length;
}

function findAnagrams(words) {
    let letterMaps = words.map(mapLetters);
    const anagrams = [];

    for (let i = 0; i < letterMaps.length; i++) {
        let matches = [];

        if (letterMaps[i]) {
            for (let j = i + 1; j < letterMaps.length; j++) {

                if (letterMaps[i] && compareMaps(letterMaps[i], letterMaps[j])) {
                    matches.push(words[j]);
                    letterMaps[j] = null;
                }
            }
            if (matches.length) {
                anagrams.push([words[i], ...matches]);
            }
        }
    }
}
