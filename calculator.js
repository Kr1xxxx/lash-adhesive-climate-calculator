(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ComelyClimate = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var LIMITS = {
    control: { temperatureMin: 10, temperatureMax: 35, humidityMin: 10, humidityMax: 90 },
    allClimate: { temperatureMin: 18, temperatureMax: 28, humidityMin: 25, humidityMax: 75 },
    standard: { temperatureMin: 23, temperatureMax: 27, humidityMin: 45, humidityMax: 55 }
  };

  var TEMPERATURE_SCALES = {
    C: { min: 10, max: 35, step: 1, suffix: '°C' },
    F: { min: 50, max: 95, step: 1, suffix: '°F' }
  };

  function round(value, precision) {
    var factor = Math.pow(10, precision || 0);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toFahrenheit(celsius) {
    return round((Number(celsius) * 9) / 5 + 32, 1);
  }

  function toCelsius(fahrenheit) {
    return round(((Number(fahrenheit) - 32) * 5) / 9, 1);
  }

  function getTemperatureScale(unit) {
    var scale = TEMPERATURE_SCALES[unit];
    if (!scale) throw new RangeError('Temperature unit must be C or F.');
    return { min: scale.min, max: scale.max, step: scale.step, suffix: scale.suffix };
  }

  function temperatureToCelsius(value, unit) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) throw new RangeError('Temperature must be a number.');
    if (unit === 'C') return numeric;
    if (unit === 'F') return ((numeric - 32) * 5) / 9;
    throw new RangeError('Temperature unit must be C or F.');
  }

  function temperatureFromCelsius(value, unit) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) throw new RangeError('Temperature must be a number.');
    if (unit === 'C') return Math.round(numeric);
    if (unit === 'F') return Math.round((numeric * 9) / 5 + 32);
    throw new RangeError('Temperature unit must be C or F.');
  }

  function assertReading(value, min, max, name) {
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new RangeError(name + ' must be between ' + min + ' and ' + max + '.');
    }
  }

  function temperatureBand(value) {
    if (value < LIMITS.standard.temperatureMin) return 'cooler';
    if (value > LIMITS.standard.temperatureMax) return 'warmer';
    return 'balanced';
  }

  function humidityBand(value) {
    if (value < LIMITS.standard.humidityMin) return 'drier';
    if (value > LIMITS.standard.humidityMax) return 'more humid';
    return 'balanced';
  }

  function conditionLabel(tempBand, humidBand) {
    if (tempBand === 'balanced' && humidBand === 'balanced') return 'Temperature and humidity are both in the standard reference range.';
    if (tempBand === 'balanced') return 'Temperature is balanced, while the room is ' + humidBand + '.';
    if (humidBand === 'balanced') return 'Humidity is balanced, while the room is ' + tempBand + '.';
    return 'The room is ' + tempBand + ' and ' + humidBand + '.';
  }

  function behaviorCopy(tempBand, humidBand) {
    var faster = tempBand === 'warmer' || humidBand === 'more humid';
    var slower = tempBand === 'cooler' || humidBand === 'drier';

    if (faster && slower) {
      return 'Temperature and humidity may pull curing behavior in different directions, so the adhesive can feel less predictable. Watch attachment response instead of relying on one reading alone.';
    }
    if (faster) {
      return 'The adhesive may cure faster than it does in balanced room conditions, leaving less time for placement and attachment.';
    }
    if (slower) {
      return 'The adhesive may cure more slowly than it does in balanced room conditions, so attachment can require more controlled placement and isolation.';
    }
    return 'The room is in the standard reference range, where curing behavior should feel the most familiar and easier to monitor.';
  }

  function roomAction(tempBand, humidBand, outside) {
    var actions = [];
    if (tempBand === 'cooler') actions.push('raise the room temperature gradually');
    if (tempBand === 'warmer') actions.push('cool the room before application');
    if (humidBand === 'drier') actions.push('use a controlled humidifier if needed');
    if (humidBand === 'more humid') actions.push('use air conditioning or a dehumidifier');

    if (!actions.length) return 'Keep the room stable and recheck the hygrometer during the appointment.';
    var lead = outside ? 'Bring conditions back into the product range: ' : 'For more familiar behavior, ';
    return lead + actions.join(' and ') + '. Recheck before continuing.';
  }

  function evaluate(input) {
    input = input || {};
    var temperatureC = Number(input.temperatureC);
    var humidity = Number(input.humidity);
    var speed = String(input.speed);

    assertReading(temperatureC, LIMITS.control.temperatureMin, LIMITS.control.temperatureMax, 'Temperature');
    assertReading(humidity, LIMITS.control.humidityMin, LIMITS.control.humidityMax, 'Humidity');
    if (speed !== '0.3' && speed !== '0.5' && speed !== '1') throw new RangeError('Speed must be 0.3, 0.5, or 1.');

    var tempBand = temperatureBand(temperatureC);
    var humidBand = humidityBand(humidity);
    var outside = temperatureC < LIMITS.allClimate.temperatureMin ||
      temperatureC > LIMITS.allClimate.temperatureMax ||
      humidity < LIMITS.allClimate.humidityMin ||
      humidity > LIMITS.allClimate.humidityMax;
    var balanced = temperatureC >= LIMITS.standard.temperatureMin &&
      temperatureC <= LIMITS.standard.temperatureMax &&
      humidity >= LIMITS.standard.humidityMin &&
      humidity <= LIMITS.standard.humidityMax;
    var level = outside ? 'outside' : (balanced ? 'balanced' : 'wide');
    var title = outside ? 'Outside the recommended range' : (balanced ? 'Balanced conditions' : 'Within the all-climate range');
    var summary = outside
      ? 'At least one reading is outside the verified 18–28°C and 25%–75% RH working range.'
      : (balanced
        ? 'Both readings sit inside the standard 23–27°C and 45%–55% RH reference range.'
        : 'These readings are inside the verified all-climate range but outside the standard reference zone.');

    var pace = speed === '0.3'
      ? 'The 0.3s option leaves less placement time. Work only at a pace that lets the extension meet the natural lash before the adhesive begins to set.'
      : (speed === '0.5'
        ? 'The 0.5s option offers slightly more placement time. Keep movements deliberate and check that attachment happens before the drop becomes stringy.'
        : 'The 1s option offers the most placement time of these three choices. Keep the extension steady and confirm placement before releasing.');

    return {
      level: level,
      title: title,
      summary: summary,
      condition: round(temperatureC, 1) + '°C / ' + round(humidity, 0) + '% RH. ' + conditionLabel(tempBand, humidBand),
      likelyBehavior: behaviorCopy(tempBand, humidBand),
      actions: {
        pace: pace,
        room: roomAction(tempBand, humidBand, outside),
        handling: 'Use a fresh adhesive drop, keep the nozzle clean, and watch the drop for changes in texture during the service.'
      },
      reading: {
        temperatureC: round(temperatureC, 1),
        temperatureF: toFahrenheit(temperatureC),
        humidity: round(humidity, 0),
        speed: speed
      }
    };
  }

  function mount(rootElement) {
    if (!rootElement || rootElement.dataset.climateMounted === 'true') return;
    rootElement.dataset.climateMounted = 'true';

    var temperature = rootElement.querySelector('[data-climate-temperature]');
    var temperatureNumber = rootElement.querySelector('[data-temperature-number]');
    var temperatureSuffix = rootElement.querySelector('[data-temperature-suffix]');
    var temperatureScaleMin = rootElement.querySelector('[data-temperature-scale-min]');
    var temperatureScaleMax = rootElement.querySelector('[data-temperature-scale-max]');
    var humidity = rootElement.querySelector('[data-climate-humidity]');
    var humidityOutput = rootElement.querySelector('[data-humidity-output]');
    var speedInputs = rootElement.querySelectorAll('[name="climate-speed"]');
    var unitButtons = rootElement.querySelectorAll('[data-temperature-unit]');
    var unit = 'C';
    var displayedTemperature = Number(temperature.value);
    var temperatureC = temperatureToCelsius(displayedTemperature, unit);

    function selectedSpeed() {
      var selected = rootElement.querySelector('[name="climate-speed"]:checked');
      return selected ? selected.value : '0.5';
    }

    function write(selector, value) {
      var element = rootElement.querySelector(selector);
      if (element) element.textContent = value;
    }

    function render() {
      var result = evaluate({ temperatureC: temperatureC, humidity: Number(humidity.value), speed: selectedSpeed() });
      humidityOutput.textContent = result.reading.humidity + '% RH';
      rootElement.dataset.resultLevel = result.level;
      write('[data-result-title]', result.title);
      write('[data-result-summary]', result.summary);
      write('[data-result-condition]', result.condition.replace(/^-?\d+(?:\.\d+)?°C/, displayedTemperature + '°' + unit));
      write('[data-result-behavior]', result.likelyBehavior);
      write('[data-result-pace]', result.actions.pace);
      write('[data-result-room]', result.actions.room);
      write('[data-result-handling]', result.actions.handling);
    }

    function syncTemperatureControls(value) {
      displayedTemperature = value;
      temperature.value = String(value);
      temperatureNumber.value = String(value);
      temperatureC = temperatureToCelsius(value, unit);
    }

    function commitTemperature(value, clampToScale) {
      var scale = getTemperatureScale(unit);
      var numeric = Number(value);
      if (!Number.isFinite(numeric)) return false;
      numeric = Math.round(numeric);
      if (clampToScale) numeric = Math.min(scale.max, Math.max(scale.min, numeric));
      if (numeric < scale.min || numeric > scale.max) return false;
      syncTemperatureControls(numeric);
      render();
      return true;
    }

    function applyTemperatureScale() {
      var scale = getTemperatureScale(unit);
      var nextValue = Math.min(scale.max, Math.max(scale.min, temperatureFromCelsius(temperatureC, unit)));
      temperature.min = String(scale.min);
      temperature.max = String(scale.max);
      temperature.step = String(scale.step);
      temperatureNumber.min = String(scale.min);
      temperatureNumber.max = String(scale.max);
      temperatureNumber.step = String(scale.step);
      temperatureNumber.setAttribute('aria-label', 'Room temperature in degrees ' + (unit === 'C' ? 'Celsius' : 'Fahrenheit'));
      temperature.setAttribute('aria-label', 'Room temperature slider in degrees ' + (unit === 'C' ? 'Celsius' : 'Fahrenheit'));
      temperatureSuffix.textContent = scale.suffix;
      temperatureScaleMin.textContent = scale.min + scale.suffix;
      temperatureScaleMax.textContent = scale.max + scale.suffix;
      syncTemperatureControls(nextValue);
    }

    temperature.addEventListener('input', function () {
      commitTemperature(temperature.value, false);
    });
    temperatureNumber.addEventListener('input', function () {
      if (temperatureNumber.value.trim() === '') return;
      var numeric = Number(temperatureNumber.value);
      if (Number.isInteger(numeric)) commitTemperature(numeric, false);
    });
    temperatureNumber.addEventListener('change', function () {
      if (!commitTemperature(temperatureNumber.value, true)) temperatureNumber.value = String(displayedTemperature);
    });
    humidity.addEventListener('input', render);
    Array.prototype.forEach.call(speedInputs, function (input) { input.addEventListener('change', render); });
    Array.prototype.forEach.call(unitButtons, function (button) {
      button.addEventListener('click', function () {
        unit = button.dataset.temperatureUnit;
        Array.prototype.forEach.call(unitButtons, function (item) {
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        applyTemperatureScale();
        render();
      });
    });

    applyTemperatureScale();
    render();
  }

  function mountAll() {
    if (typeof document === 'undefined') return;
    var roots = document.querySelectorAll('[data-comely-climate-calculator]');
    Array.prototype.forEach.call(roots, mount);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
    else mountAll();
  }

  return {
    limits: LIMITS,
    toFahrenheit: toFahrenheit,
    toCelsius: toCelsius,
    getTemperatureScale: getTemperatureScale,
    temperatureToCelsius: temperatureToCelsius,
    temperatureFromCelsius: temperatureFromCelsius,
    evaluate: evaluate,
    mount: mount
  };
});
