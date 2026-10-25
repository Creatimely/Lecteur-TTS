import test from 'node:test';
import assert from 'node:assert/strict';
import { split, wordAt } from '../src/chunker.js';

test('découpe par phrases en gardant les positions', () => {
  const r = split('Bonjour. Ça va ? Oui !');
  assert.equal(r.length, 3);
  assert.equal(r[1].start, 9);
});

test('coupe les phrases trop longues sur un espace', () => {
  const r = split('mot '.repeat(100), 50);
  assert.ok(r.every((c) => c.text.length <= 50));
});

test('ignore le texte vide', () => assert.deepEqual(split('  '), []));

test('wordAt renvoie les bornes du mot', () => assert.deepEqual(wordAt('un deux trois', 3), [3, 7]));
