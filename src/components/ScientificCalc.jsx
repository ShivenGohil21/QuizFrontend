// ScientificCalculator.jsx
import React, { useState } from 'react';
import './ScientificCalculator.css';

const ScientificCalculator = () => {
  const [expression, setExpression] = useState('');

  const append = (val) => setExpression((prev) => prev + val);
  const clear = () => setExpression('');
  const evaluate = () => {
    try {
      // Unsafe eval used for simplicity - replace with math.js for production
      setExpression(eval(expression).toString());
    } catch {
      setExpression('Error');
    }
  };

  return (
    <div className="scientific-calculator resize-box">
      <input className="display" value={expression} readOnly />
      <div className="calc-grid">
        {[
          ['sin(', 'cos(', 'tan(', '(', ')', 'Back'],
          ['π', 'e', 'ln(', 'log(', '√(', 'x^2'],
          ['7', '8', '9', '/', '%', '1/x'],
          ['4', '5', '6', '*', 'EXP', 'Ans'],
          ['1', '2', '3', '-', '±', 'AC'],
          ['0', '.', '=', '+', 'RND', 'x!']
        ].map((row, i) => (
          <div className="calc-row" key={i}>
            {row.map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === '=') evaluate();
                  else if (btn === 'AC') clear();
                  else if (btn === 'Back') setExpression(expression.slice(0, -1));
                  else if (btn === 'π') append(Math.PI.toString());
                  else if (btn === 'e') append(Math.E.toString());
                  else if (btn === '±') setExpression((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
                  else append(btn);
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScientificCalculator;
