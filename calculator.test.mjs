import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const calculatorPath = './calculator.js';
const climate = require(calculatorPath);

test('converts Celsius and Fahrenheit without changing the source scale', () => {
  assert.equal(climate.toFahrenheit(25), 77);
  assert.equal(climate.toCelsius(77), 25);
  assert.equal(climate.toCelsius(climate.toFahrenheit(18)), 18);
});

test('uses separate one-degree Celsius and Fahrenheit control scales', () => {
  assert.deepEqual(climate.getTemperatureScale('C'), { min: 10, max: 35, step: 1, suffix: '°C' });
  assert.deepEqual(climate.getTemperatureScale('F'), { min: 50, max: 95, step: 1, suffix: '°F' });
  assert.equal(climate.temperatureFromCelsius(25, 'F'), 77);
  assert.equal(climate.temperatureToCelsius(69, 'F'), (69 - 32) * 5 / 9);
});

test('identifies the default readings as balanced conditions', () => {
  const result = climate.evaluate({ temperatureC: 25, humidity: 50, speed: '0.5' });
  assert.equal(result.level, 'balanced');
  assert.equal(result.title, 'Balanced conditions');
  assert.match(result.condition, /25°C/);
  assert.match(result.condition, /50% RH/);
  assert.match(result.actions.pace, /0.5s/);
});

test('keeps every verified broad-range boundary inside the range', () => {
  const cases = [
    { temperatureC: 18, humidity: 25 },
    { temperatureC: 18, humidity: 75 },
    { temperatureC: 28, humidity: 25 },
    { temperatureC: 28, humidity: 75 },
  ];

  for (const readings of cases) {
    const result = climate.evaluate({ ...readings, speed: '0.5' });
    assert.notEqual(result.level, 'outside');
  }
});

test('describes cool and dry conditions without promising an exact cure time', () => {
  const result = climate.evaluate({ temperatureC: 20, humidity: 30, speed: '0.5' });
  assert.equal(result.level, 'wide');
  assert.match(result.title, /Within the all-climate range/);
  assert.match(result.likelyBehavior, /more slowly/i);
  assert.doesNotMatch(result.likelyBehavior, /will cure in|seconds? faster|seconds? slower/i);
});

test('describes warm and humid conditions as a faster tendency', () => {
  const result = climate.evaluate({ temperatureC: 28, humidity: 70, speed: '0.3' });
  assert.equal(result.level, 'wide');
  assert.match(result.likelyBehavior, /faster/i);
  assert.match(result.actions.pace, /0.3s/);
  assert.match(result.actions.pace, /less placement time/i);
});

test('supports the 1s option with its own placement guidance', () => {
  const result = climate.evaluate({ temperatureC: 25, humidity: 50, speed: '1' });
  assert.equal(result.reading.speed, '1');
  assert.match(result.actions.pace, /1s/);
  assert.match(result.actions.pace, /most placement time/i);
});

test('describes mixed warm and dry readings without contradictory certainty', () => {
  const result = climate.evaluate({ temperatureC: 28, humidity: 30, speed: '0.5' });
  assert.equal(result.level, 'wide');
  assert.match(result.likelyBehavior, /pull .* in different directions/i);
});

test('flags readings outside the verified product range', () => {
  assert.equal(climate.evaluate({ temperatureC: 17, humidity: 50, speed: '0.5' }).level, 'outside');
  assert.equal(climate.evaluate({ temperatureC: 29, humidity: 50, speed: '0.5' }).level, 'outside');
  assert.equal(climate.evaluate({ temperatureC: 25, humidity: 24, speed: '0.5' }).level, 'outside');
  assert.equal(climate.evaluate({ temperatureC: 25, humidity: 76, speed: '0.5' }).level, 'outside');
});

test('rejects values outside the control limits and unsupported speeds', () => {
  assert.throws(() => climate.evaluate({ temperatureC: 9, humidity: 50, speed: '0.5' }), /temperature/i);
  assert.throws(() => climate.evaluate({ temperatureC: 25, humidity: 91, speed: '0.5' }), /humidity/i);
  assert.throws(() => climate.evaluate({ temperatureC: 25, humidity: 50, speed: '0.8' }), /speed/i);
});
