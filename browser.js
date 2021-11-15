// 'use strict';

const Model = require('./lib/grouped.js'),
    log = require('./lib/log');

/**
 * This is effectively a 'page' module.
 * Let's use many small abstractions.
**/
window.MyPage = function() {
    this.getMainDiv = () => document.getElementById('1');
    this.onDocumentLoad = () => {
        const mainDiv = this.getMainDiv();
        const inputElement = mainDiv.querySelector('[name="input"]');
        const outputElement = mainDiv.querySelector('[name="output"]');
        outputElement.innerText = 'hello';
        inputElement.addEventListener('input', () => this.parseInput());
    };
    this.parseInput = () => {
        console.log('parseInput...');
        const mainDiv = this.getMainDiv();
        const inputElement = mainDiv.querySelector('[name="input"]');
        const outputElement = mainDiv.querySelector('[name="output"]');
        const errorElement = mainDiv.querySelector('[name="output"] ~ .errorMessage');

        const model = new Model();
        const input = inputElement.value;
        log('input: ' + input);
        try {
            const result = model.parse(input);
            outputElement.value = JSON.stringify(result.toJSON(), null, 2);
            outputElement.style.borderColor = 'black';
            errorElement.innerHTML = '';
            errorElement.style.visibility = 'hidden';
        } catch (error) {
            outputElement.style.borderColor = 'red';
            errorElement.innerHTML = `${error.toString()}`;
            errorElement.style.visibility = 'visible';
            throw error;
        }


    };
    return this;
};